from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
import os
import shutil
from ..services.parse import extract_pdf_text
from ..services.preprocess import preprocess_documents
from ..services.store import store_chunks_in_vector_db
from ..services.entity_relation import process_entity_relations

router = APIRouter()

UPLOAD_DIR = "uploads"
DB_DIR = "db"

REG_MIN_tokens = 200
REG_MAX_tokens = 1000

for directory in [UPLOAD_DIR, DB_DIR]:
    if not os.path.exists(directory):
        os.makedirs(directory)

FAISS_INDEX_PATH = os.path.join(DB_DIR, "regulatory_index.faiss")
SQLITE_DB_PATH = os.path.join(DB_DIR, "chunks.db")

@router.post("/process-pdf")
async def process_pdf(
    file: UploadFile = File(...),
    zone_threshold: int = 15,
    horizontal_threshold_ratio: float = 0.2,
    reg_overlap_sentences: int = 1,
    process_entities: bool = True
):
    """
    Process uploaded PDF through text extraction, chunking pipeline, store in vector database,
    and optionally process entity relations.
    Returns the processed chunks, storage locations, and entity processing results if requested.
    """
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="File must be a PDF")
    
    try:
        pdf_path = os.path.join(UPLOAD_DIR, file.filename)
        
        with open(pdf_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        extracted_text = extract_pdf_text(pdf_path, zone_threshold=zone_threshold, horizontal_threshold_ratio=horizontal_threshold_ratio)
        
        regulatory_chunks = preprocess_documents(
            regulatory_text=extracted_text,
            reg_overlap_sentences=reg_overlap_sentences,
            MIN_tokens=REG_MIN_tokens,
            MAX_tokens=REG_MAX_tokens
        )
        
        chunks_with_ids = store_chunks_in_vector_db(
            regulatory_chunks=regulatory_chunks,
            faiss_output_path=FAISS_INDEX_PATH,
            db_path=SQLITE_DB_PATH
        )
        
        response_data = {
            "success": True,
            "message": "PDF processed, chunked, and stored successfully",
            "pdf_path": pdf_path,
            "storage_info": {
                "faiss_index_path": FAISS_INDEX_PATH,
                "sqlite_db_path": SQLITE_DB_PATH
            },
            "chunks": {
                "regulatory_chunks": chunks_with_ids,
                "chunk_count": len(chunks_with_ids)
            }
        }
        
        if process_entities:
            entity_results = process_entity_relations(SQLITE_DB_PATH)
            response_data["entity_processing"] = entity_results
            if entity_results.get("message") == "No new chunks to process":
                response_data["message"] = "PDF processed, chunked, and stored successfully. No new chunks needed entity processing."
            else:
                response_data["message"] = "PDF processed, chunked, stored, and entity relations extracted successfully"
        
        return JSONResponse(content=response_data)
        
    except Exception as e:
        if os.path.exists(pdf_path):
            os.remove(pdf_path)
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        file.file.close()
