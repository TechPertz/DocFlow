import logging
import sqlite3
import spacy
from neo4j import GraphDatabase
from sentence_transformers import SentenceTransformer, util
import itertools
from .config import NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD

logging.basicConfig(level=logging.INFO)

nlp = spacy.load("en_core_web_lg")

sbert_model = SentenceTransformer('all-MiniLM-L6-v2')

CONFIDENCE_THRESHOLD = 0.8

def extract_entities(chunk_text, chunk_id, doc_name):
    """Extract entities using spaCy."""
    doc = nlp(chunk_text)
    return [
        {
            "entity": ent.text.strip().lower(),
            "type": ent.label_,
            "chunk_id": chunk_id,
            "doc_name": doc_name
        } for ent in doc.ents
    ]

def compute_confidence_score(summary1, summary2):
    """Calculate semantic similarity between two summaries using SBERT."""
    embeddings = sbert_model.encode([summary1, summary2], convert_to_tensor=True)
    similarity = util.pytorch_cos_sim(embeddings[0], embeddings[1]).item()
    return similarity

def precompute_similarities(summaries):
    """Precompute pairwise similarities between summaries."""
    similarity_scores = {}
    chunk_ids = list(summaries.keys())
    total_comparisons = len(chunk_ids) * (len(chunk_ids) - 1) // 2
    comparisons_done = 0

    for (id1, id2) in itertools.combinations(chunk_ids, 2):
        score = compute_confidence_score(summaries[id1], summaries[id2])
        similarity_scores[(id1, id2)] = score
        comparisons_done += 1
        
        if comparisons_done % 1000 == 0:
            logging.info(f"Computed {comparisons_done}/{total_comparisons} similarity scores")

    return similarity_scores

def store_in_neo4j(entities, similarity_scores):
    """Store entities and context-based links in Neo4j."""
    driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))

    def add_entity(tx, entity):
        query = """
        MERGE (e:Entity {name: $name, type: $type, doc_name: $doc_name})
        SET e.chunk_ids = coalesce(e.chunk_ids, []) + $chunk_id
        """
        tx.run(query, name=entity["entity"], type=entity["type"],
               doc_name=entity["doc_name"], chunk_id=entity["chunk_id"])

    def add_relation(tx, entity1, entity2, confidence):
        query = """
        MATCH (e1:Entity {name: $entity1, doc_name: $doc_name}),
              (e2:Entity {name: $entity2, doc_name: $doc_name})
        MERGE (e1)-[r:CONTEXT_LINK {confidence: $confidence}]->(e2)
        """
        tx.run(query, entity1=entity1["entity"], entity2=entity2["entity"],
               doc_name=entity1["doc_name"], confidence=confidence)

    with driver.session() as session:
        for i, entity in enumerate(entities):
            session.execute_write(add_entity, entity)
            if (i + 1) % 1000 == 0:
                logging.info(f"Stored {i + 1}/{len(entities)} entities in Neo4j")

        total_links = len(entities) * (len(entities) - 1) // 2
        links_processed = 0

        for i, ent1 in enumerate(entities):
            for j, ent2 in enumerate(entities[i+1:], start=i+1):
                links_processed += 1
                if ent1["doc_name"] == ent2["doc_name"] and ent1["entity"] != ent2["entity"]:
                    chunk_pair = tuple(sorted([ent1["chunk_id"], ent2["chunk_id"]]))
                    if chunk_pair in similarity_scores:
                        confidence = similarity_scores[chunk_pair]
                        if confidence >= CONFIDENCE_THRESHOLD:
                            session.execute_write(add_relation, ent1, ent2, confidence)

                if links_processed % 10000 == 0: 
                    logging.info(f"Processed {links_processed}/{total_links} potential links")

    driver.close()
    logging.info("Completed storing entities and relationships in Neo4j")

def process_entity_relations(db_path):
    """
    Process entity relations from chunks stored in the provided SQLite database.
    Creates a knowledge graph in Neo4j with entities and their relationships.
    Only processes chunks that haven't been processed before.
    
    Args:
        db_path (str): Path to the SQLite database containing chunks
    """
    logging.info("Starting entity relation processing pipeline")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    cursor.execute("""
        SELECT last_processed_chunk_id 
        FROM processing_status 
        WHERE process_name = 'entity_processing'
    """)
    result = cursor.fetchone()
    last_processed_id = result[0] if result else 0
    
    cursor.execute("""
        SELECT chunk_id, text, summary, doc_name 
        FROM chunks 
        WHERE chunk_id > ?
        ORDER BY chunk_id
    """, (last_processed_id,))
    new_chunks = cursor.fetchall()
    
    if not new_chunks:
        logging.info("No new chunks to process")
        conn.close()
        return {
            "total_chunks_processed": 0,
            "total_entities_extracted": 0,
            "total_similarity_pairs": 0,
            "message": "No new chunks to process"
        }
    
    logging.info(f"Fetched {len(new_chunks)} new chunks from the database")

    new_entities = []
    new_summaries = {}
    for chunk_id, text, summary, doc_name in new_chunks:
        chunk_entities = extract_entities(text, chunk_id, doc_name)
        new_entities.extend(chunk_entities)
        new_summaries[chunk_id] = summary
    
    logging.info(f"Extracted {len(new_entities)} entities from new chunks")

    context_limit = 1000
    min_chunk_id = min(new_summaries.keys())
    cursor.execute("""
        SELECT chunk_id, summary 
        FROM chunks 
        WHERE chunk_id <= ? 
        ORDER BY chunk_id DESC 
        LIMIT ?
    """, (min_chunk_id - 1, context_limit))
    context_chunks = cursor.fetchall()
    
    all_summaries = {chunk_id: summary for chunk_id, summary in context_chunks}
    all_summaries.update(new_summaries)
    
    logging.info("Starting similarity score computation")
    similarity_scores = precompute_similarities(all_summaries)
    logging.info("Completed similarity score computation")

    logging.info("Starting Neo4j storage")
    store_in_neo4j(new_entities, similarity_scores)

    max_processed_id = max(new_summaries.keys())
    cursor.execute("""
        UPDATE processing_status 
        SET last_processed_chunk_id = ?,
            last_processed_timestamp = CURRENT_TIMESTAMP
        WHERE process_name = 'entity_processing'
    """, (max_processed_id,))
    
    conn.commit()
    conn.close()
    
    logging.info("Entity relation processing pipeline complete!")
    return {
        "total_chunks_processed": len(new_chunks),
        "total_entities_extracted": len(new_entities),
        "total_similarity_pairs": len(similarity_scores),
        "last_processed_chunk_id": max_processed_id
    }