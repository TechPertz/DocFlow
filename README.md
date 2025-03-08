# GraphRAG based LLM Document Compliance with Knowledge Graphs and Vector Embeddings

DocFlow addresses the challenge of auditing thousands of pages of regulatory documents. It leverages GraphRAG and OpenAI for hybrid context retrieval using Knowledge Graphs (Neo4J), Vector Embeddings, and SQL databases.

The frontend serves as a SaaS platform for organizations to edit numerous documents and manage multiple levels of approvals within and across cross-functional teams, automated via custom workflows.

GraphRAG-only Kaggle Script: [https://www.kaggle.com/code/techpertz/docflow](https://www.kaggle.com/code/techpertz/docflow)

## Screenshots
- Screenshot 1: Dashboard Overview
![Screenshot 2025-03-08 at 5 19 08 AM](https://github.com/user-attachments/assets/2809487c-d9ae-46c5-9b1d-bf0c17972755)

- Screenshot 2: Compliance Report with Citations
![Screenshot 2025-03-08 at 5 12 21 AM](https://github.com/user-attachments/assets/dfb18673-dd0a-4a5d-bdb3-7db9a86ab8a9)

- Screenshot 3: Knowledge Graph
![Screenshot 2025-03-08 at 5 13 10 AM](https://github.com/user-attachments/assets/ad4bd55b-b883-40b8-b735-ac8d7d2419a1)


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
