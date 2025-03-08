import logging
import os
from sentence_transformers import SentenceTransformer
import faiss
import json
from .preprocess import preprocess_documents
import sqlite3
from transformers import pipeline

embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
summarizer = pipeline("summarization", model="facebook/bart-large-cnn", device=-1)

def summarize_chunk(text):
    """Generate a short summary of the chunk text."""
    if len(text.split()) > 1024:
        text = " ".join(text.split()[:1024])
    try:
        summary = summarizer(text, max_length=30, min_length=10, do_sample=False)[0]['summary_text']
    except Exception as e:
        logging.warning(f"Failed to summarize chunk: {e}. Using truncated text as fallback.")
        summary = text[:100]
    return summary

def create_metadata_db(db_path="chunks.db"):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS chunks (
            chunk_id INTEGER PRIMARY KEY AUTOINCREMENT,
            text TEXT NOT NULL,
            doc_name TEXT NOT NULL,
            page_range TEXT NOT NULL,
            summary TEXT
        )
    """)
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS processing_status (
            process_name TEXT PRIMARY KEY,
            last_processed_chunk_id INTEGER,
            last_processed_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    cursor.execute("""
        INSERT OR IGNORE INTO processing_status (process_name, last_processed_chunk_id)
        VALUES ('entity_processing', 0)
    """)
    
    conn.commit()
    conn.close()

def store_chunks_in_vector_db(regulatory_chunks, faiss_output_path="regulatory_index.faiss", 
                            db_path="chunks.db"):
    if not os.path.exists(db_path):
        create_metadata_db(db_path)
    
    chunk_texts = [chunk["text"] for chunk in regulatory_chunks]
    embeddings = embedding_model.encode(chunk_texts, convert_to_numpy=True)
    
    dimension = embeddings.shape[1]
    faiss_index = faiss.IndexFlatIP(dimension)
    faiss_index.add(embeddings)
    faiss.write_index(faiss_index, faiss_output_path)
    logging.debug(f"Saved FAISS index to {faiss_output_path}")
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    logging.debug("Generating summaries and storing chunks...")
    for i, chunk in enumerate(regulatory_chunks):
        summary = summarize_chunk(chunk["text"])
        cursor.execute("""
            INSERT INTO chunks (text, doc_name, page_range, summary)
            VALUES (?, ?, ?, ?)
        """, (chunk["text"], chunk["doc_name"], chunk["page_range"], summary))
        
        if (i + 1) % 10 == 0:
            logging.debug(f"Processed {i + 1}/{len(regulatory_chunks)} chunks")
    
    conn.commit()
    
    cursor.execute("SELECT chunk_id, text FROM chunks WHERE text IN ({})".format(
        ','.join('?' for _ in chunk_texts)), chunk_texts)
    chunk_id_map = {row[1]: row[0] for row in cursor.fetchall()}
    conn.close()
    
    for chunk in regulatory_chunks:
        chunk["chunk_id"] = chunk_id_map[chunk["text"]]
    
    logging.debug(f"Stored {len(regulatory_chunks)} chunks with summaries in {db_path}")
    return regulatory_chunks
