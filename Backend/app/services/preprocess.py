import logging
import re
import nltk
import bisect
nltk.download('punkt')
nltk.download('punkt_tab')
from nltk.tokenize import sent_tokenize
from semantic_router.encoders import HuggingFaceEncoder
from semantic_chunkers import StatisticalChunker

REG_MIN_tokens = 200
REG_MAX_tokens = 1000

encoder = HuggingFaceEncoder(name="sentence-transformers/all-MiniLM-L6-v2")

def process_regulatory_text(content):
    """
    Process regulatory text with page delimiters and return the full text with page start indices.
    
    Args:
        content (str): Text content with format "--- Page N ---".
    
    Returns:
        tuple: (full_text, page_starts) where full_text is the concatenated text (without delimiters)
               and page_starts is a list of character indices where each page begins.
    """
    logging.debug("Processing regulatory text content")
    
    page_pattern = r"--- Page (\d+) ---"
    pages = re.split(page_pattern, content)
    
    full_text = ""
    page_starts = [0]
    page_numbers = []
    for i, segment in enumerate(pages):
        if i % 2 == 0:
            full_text += segment.strip()
            if segment.strip():
                page_starts.append(len(full_text))
        else:
            page_numbers.append(int(segment))
    
    if len(page_starts) > len(page_numbers) + 1:
        page_starts.pop()
    
    logging.debug(f"Parsed {len(page_numbers)} pages from content")
    return full_text, page_starts

def get_page_range(start, end, page_starts):
    """
    Determine the page range for a chunk based on its start and end character indices.
    
    Args:
        start (int): Starting character index of the chunk.
        end (int): Ending character index of the chunk.
        page_starts (list): List of character indices where each page begins.
    
    Returns:
        str: Page range (e.g., "1" or "3-5"), or "N/A" if no page info.
    """
    if len(page_starts) <= 2 and page_starts[1] == page_starts[0]:
        return "N/A"
    start_page = bisect.bisect_right(page_starts, start) - 1
    end_page = bisect.bisect_left(page_starts, end) - 1
    if start_page < 0:
        start_page = 0
    if end_page >= len(page_starts) - 1:
        end_page = len(page_starts) - 2
    if start_page == end_page:
        return str(start_page + 1)
    return f"{start_page + 1}-{end_page + 1}"

def statistical_chunking(text, min_tokens, max_tokens, page_starts, doc_name, overlap_sentences=0):
    """
    Split text into chunks using StatisticalChunker with optional sentence-based overlap.
    
    Args:
        text (str): Input text to be chunked.
        min_tokens (int): Minimum number of tokens per chunk (approximate).
        max_tokens (int): Maximum number of tokens per chunk (approximate).
        page_starts (list): List of character indices where each page begins (or dummy for SOP).
        doc_name (str): Name of the document (e.g., file path).
        overlap_sentences (int): Number of sentences to overlap between chunks (default: 0).
    
    Returns:
        list: List of dictionaries, each containing 'text', 'doc_name', and 'page_range'.
    """
    logging.debug("Starting statistical chunking with overlap.")
    
    chunker = StatisticalChunker(
        encoder=encoder,
        min_split_tokens=min_tokens,
        max_split_tokens=max_tokens,
    )
    
    chunks = chunker(docs=[text])
    initial_chunks = [chunk.content for chunk in chunks[0]]
    
    if overlap_sentences == 0:
        chunk_starts = []
        current_pos = 0
        for chunk_text in initial_chunks:
            chunk_starts.append(current_pos)
            current_pos += len(chunk_text) + 1
        
        overlapped_chunks = []
        for i, chunk_text in enumerate(initial_chunks):
            start = chunk_starts[i]
            end = start + len(chunk_text)
            page_range = get_page_range(start, end, page_starts)
            overlapped_chunks.append({
                'text': chunk_text,
                'doc_name': doc_name,
                'page_range': page_range
            })
        logging.debug(f"Generated {len(overlapped_chunks)} chunks without overlap.")
        return overlapped_chunks
    
    sentences = sent_tokenize(text)
    sentence_starts = [0]
    for sent in sentences:
        sentence_starts.append(sentence_starts[-1] + len(sent) + 1)
    
    chunk_starts = []
    chunk_sentence_ranges = []
    current_pos = 0
    for chunk_text in initial_chunks:
        start_pos = text.find(chunk_text, current_pos)
        if start_pos == -1:
            start_pos = current_pos
        end_pos = start_pos + len(chunk_text)
        chunk_starts.append(start_pos)
        
        start_sent_idx = bisect.bisect_right(sentence_starts, start_pos) - 1
        end_sent_idx = bisect.bisect_left(sentence_starts, end_pos) - 1
        chunk_sentence_ranges.append((start_sent_idx, end_sent_idx))
        current_pos = end_pos
    
    overlapped_chunks = []
    for i, (start_idx, end_idx) in enumerate(chunk_sentence_ranges):
        if i == 0:
            overlapped_start_idx = start_idx
        else:
            overlapped_start_idx = max(0, start_idx - overlap_sentences)
        overlapped_end_idx = end_idx
        
        overlapped_sentences = sentences[overlapped_start_idx:overlapped_end_idx + 1]
        overlapped_text = ' '.join(overlapped_sentences)
        
        overlapped_start = sentence_starts[overlapped_start_idx]
        overlapped_end = (sentence_starts[overlapped_end_idx + 1] 
                         if overlapped_end_idx + 1 < len(sentence_starts) 
                         else len(text))
        
        page_range = get_page_range(overlapped_start, overlapped_end, page_starts)
        overlapped_chunks.append({
            'text': overlapped_text,
            'doc_name': doc_name,
            'page_range': page_range
        })
    
    logging.debug(f"Generated {len(overlapped_chunks)} overlapped chunks.")
    return overlapped_chunks

def preprocess_documents(regulatory_text, MIN_tokens, MAX_tokens, reg_overlap_sentences=1):
    """
    Preprocess regulatory text by chunking it with metadata and optional overlap.
    
    Args:
        regulatory_text (str): The regulatory text content with page delimiters.
        reg_overlap_sentences (int): Sentences to overlap for regulatory chunks (default: 1).
    
    Returns:
        list: regulatory_chunks, a list of chunk dictionaries.
    """
    full_text, regulatory_page_starts = process_regulatory_text(regulatory_text)
    
    regulatory_chunks = statistical_chunking(
        full_text, MIN_tokens, MAX_tokens, regulatory_page_starts, 
        doc_name="regulatory_document", overlap_sentences=reg_overlap_sentences
    )
    
    return regulatory_chunks
