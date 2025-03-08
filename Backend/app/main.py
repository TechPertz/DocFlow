from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import regulation_pdf
from app.routes import audit

app = FastAPI(
    title="GraphRAG API",
    description="API for GraphRAG application",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(audit.router, prefix="/api/audit")
app.include_router(regulation_pdf.router, prefix="/api/regulation-pdf")

@app.get("/")
async def root():
    return {"message": "Welcome to GraphRAG API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
