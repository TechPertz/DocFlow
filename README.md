# GraphRAG (Knowledge Graph + Vector Embeddings) based Document Compliance with edit and approval via custom workflows.

DocFlow solves the problem of auditing documents across thousands of pages of Regulatory documents using GraphRAG+OpenAI via Hybrid Context retrieval from Knowledge Graphs (Neo4J) + Vector Embeddings + SQL DB.

The Frontend serves the purpose of a SAAS platform for organization editing numerous documents and undergoing multiple hierarchy of approvals within and across cross-functional teams, which can be automated via workflows.



## 🏗️ Architecture

- **Frontend**: Next.js application with modern UI/UX
- **Backend**: FastAPI service with Python
- **Database**: Neo4j graph database
- **LLM**: OpenAI

## 🚀 Running Instructions

### 1. Start Neo4j (Database)
```bash
# Start Neo4j using docker-compose
docker-compose up neo4j
```
Access Neo4j Browser at http://localhost:7474
- Username: neo4j
- Password: mypassword123

### 2. Setup Backend (FastAPI)
```bash
# Create and activate virtual environment
cd Backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Download spaCy model
python -m spacy download en_core_web_lg

# Setup environment
cp .env.example .env
# Edit .env and add your OpenAI API key

# Start the server
uvicorn app.main:app --reload --port 8000
```
Backend API will be available at http://localhost:8000
Backend API endpoints will be available at http://localhost:8000/docs

### 3. Setup Frontend (Next.js)
```bash
# Install dependencies
cd Frontend
npm install

# Run initial setup (for SQLite database)
npm run setup

# Start development server
npm run dev
```
Frontend will be available at http://localhost:3000

## 📝 Prerequisites

- Python 3.9+
- Node.js 18+
- Docker (for Neo4j)
- OpenAI API key

## 🧪 Testing

### Test Users
For testing purposes, the following user accounts are pre-configured:

Gmail Organization:
- user1@gmail.com
- user2@gmail.com

Yahoo Organization:
- user1@yahoo.com
- user2@yahoo.com

No Password required. 

## 📁 Project Structure

```
.
├── Frontend/          # Next.js application
├── Backend/           # FastAPI application
├── docker-compose.yml # Docker composition (for Neo4j)
└── README.md         # This file
```

## 🔐 Environment Variables

### Backend (.env)
```
OPENAI_API_KEY=your_key_here
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=mypassword123
```

## 🛠️ Development Notes

- Keep each component (Frontend, Backend, Neo4j) running in separate terminal windows
- Backend requires the virtual environment to be activated for each new terminal session
- Neo4j data persists in Docker volumes between restarts

## 📝 License

[MIT License](LICENSE)
