import faiss
import numpy as np
from sentence_transformers import SentenceTransformer
from neo4j import GraphDatabase
import sqlite3
import spacy
import os
import logging
from .config import NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
nlp = spacy.load("en_core_web_lg")

def get_relevant_context(query: str, faiss_path: str, db_path: str, top_k: int = 5) -> dict:
    """
    Retrieve relevant context for a query using hybrid retrieval (vector + graph based).
    
    Args:
        query (str): The search query
        faiss_path (str): Path to the FAISS index file
        db_path (str): Path to the SQLite database
        top_k (int): Number of top results to return from vector search
    
    Returns:
        dict: Dictionary containing query and results with metadata
        
    Raises:
        FileNotFoundError: If FAISS index or database file not found
        Exception: For other errors during retrieval
    """
    try:
        if not os.path.exists(faiss_path):
            raise FileNotFoundError(f"FAISS index not found at: {faiss_path}")
        if not os.path.exists(db_path):
            raise FileNotFoundError(f"SQLite database not found at: {db_path}")
            
        faiss_index = faiss.read_index(faiss_path)
        
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT chunk_id, text, doc_name, page_range FROM chunks")
        chunk_metadata = {
            row[0]: {
                "text": row[1],
                "doc_name": row[2],
                "page_range": row[3]
            } for row in cursor.fetchall()
        }
        conn.close()
        
        query_emb = embedding_model.encode([query], convert_to_numpy=True)
        distances, indices = faiss_index.search(query_emb, top_k)
        vector_results = []
        for idx in indices[0]:
            if idx in chunk_metadata:
                vector_results.append({
                    "text": chunk_metadata[idx]["text"],
                    "doc_name": chunk_metadata[idx]["doc_name"],
                    "page_range": chunk_metadata[idx]["page_range"],
                    "score": float(distances[0][list(indices[0]).index(idx)])
                })
        
        doc = nlp(query)
        entities = [ent.text.lower() for ent in doc.ents]
        graph_results = []
        seen_chunk_ids = set()
        
        if entities:
            neo4j_driver = GraphDatabase.driver(
                NEO4J_URI, 
                auth=(NEO4J_USER, NEO4J_PASSWORD)
            )
            
            try:
                with neo4j_driver.session() as session:
                    for entity in entities:
                        query = """
                        MATCH (e:Entity)
                        WHERE toLower(e.name) CONTAINS toLower($entity_name)
                        OPTIONAL MATCH (e)-[r:CONTEXT_LINK]-(related:Entity)
                        RETURN e.chunk_ids as source_chunks,
                               related.chunk_ids as related_chunks,
                               r.confidence as confidence,
                               e.name as entity_name
                        ORDER BY r.confidence DESC
                        """
                        results = session.run(query, entity_name=entity)
                        
                        for record in results:
                            source_chunks = record["source_chunks"]
                            if source_chunks:
                                for chunk_id in source_chunks:
                                    if chunk_id in chunk_metadata and chunk_id not in seen_chunk_ids:
                                        seen_chunk_ids.add(chunk_id)
                                        graph_results.append({
                                            "text": chunk_metadata[chunk_id]["text"],
                                            "doc_name": chunk_metadata[chunk_id]["doc_name"],
                                            "page_range": chunk_metadata[chunk_id]["page_range"],
                                            "score": float(record["confidence"]) if record["confidence"] else 0.0,
                                            "matched_entity": entity,
                                            "chunk_id": chunk_id
                                        })
                            
                            related_chunks = record["related_chunks"]
                            if related_chunks:
                                for chunk_id in related_chunks:
                                    if chunk_id in chunk_metadata and chunk_id not in seen_chunk_ids:
                                        seen_chunk_ids.add(chunk_id)
                                        graph_results.append({
                                            "text": chunk_metadata[chunk_id]["text"],
                                            "doc_name": chunk_metadata[chunk_id]["doc_name"],
                                            "page_range": chunk_metadata[chunk_id]["page_range"],
                                            "score": float(record["confidence"]) if record["confidence"] else 0.0,
                                            "matched_entity": entity,
                                            "chunk_id": chunk_id
                                        })
            except Exception as e:
                raise Exception(f"Error in Neo4j processing: {str(e)}")
            finally:
                neo4j_driver.close()
        else:
            with open("debug_graph.txt", "a") as f:
                f.write("No entities found in the query\n")
        
        seen_texts = set()
        combined_results = []
        
        for result in vector_results + graph_results:
            if result["text"] not in seen_texts:
                seen_texts.add(result["text"])
                combined_results.append(result)
        
        combined_results.sort(key=lambda x: x["score"], reverse=True)
        
        return {
            "query": query,
            "results": combined_results[:top_k]
        }
        
    except Exception as e:
        raise Exception(f"Error during retrieval: {str(e)}")

# Example usage:
# try:
#     context = get_relevant_context(
#         query="your question here",
#         faiss_path="path/to/regulatory_index.faiss",
#         db_path="path/to/chunks.db",
#         top_k=5
#     )
#     print(context)  # Or pass to LLM
# except Exception as e:
#     print(f"Error: {e}")
