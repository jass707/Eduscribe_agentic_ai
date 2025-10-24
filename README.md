# EduScribe - AI-Powered Lecture Note Generation

EduScribe is a comprehensive AI-powered system that transforms live lectures into intelligent, organized study notes by combining real-time transcription with document context analysis.

## 🏗️ **Project Structure (Monorepo)**

```
d:\store\notify\
├── frontend/           # React frontend application
│   ├── src/
│   ├── package.json
│   └── ...
├── backend/            # Python FastAPI backend
│   ├── app/
│   ├── requirements.txt
│   └── ...
├── docs/               # Documentation files
└── README.md          # This file
```

## 🚀 **Quick Start**

### **Frontend (React + Vite)**
```bash
cd frontend
npm install
npm run dev
# Opens at http://localhost:3000
```

### **Backend (Python + FastAPI)**
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
# Opens at http://localhost:8000
```

## 🎯 **Features**

### **Frontend Features:**
- **Subject-based Organization** - Organize lectures by courses/subjects
- **Document Upload Workflow** - Upload lecture materials for AI context
- **Live Recording Interface** - Real-time transcription and note generation
- **Webinar Support** - Join and host webinar sessions
- **Export Functionality** - Download notes as PDF/DOCX
- **Responsive Design** - Works on all devices

### **Backend Features:**
- **Document Processing** - Extract text from PDFs, PPTs, Word docs
- **Vector Search (FAISS)** - Semantic search through uploaded documents
- **Speech-to-Text** - Whisper-based audio transcription
- **Importance Scoring** - Audio analysis for content relevance
- **RAG Note Generation** - Context-aware AI note creation
- **Real-time Processing** - WebSocket-based live updates

## 🔄 **Complete Workflow**

1. **Upload Documents** → Backend extracts text and creates vector embeddings
2. **Start Lecture** → Frontend sends audio chunks to backend
3. **Process Audio** → Backend transcribes, scores importance, queries context
4. **Generate Notes** → AI creates structured notes using document context
5. **Live Updates** → Frontend displays notes in real-time
6. **Export Results** → Download organized study materials

## 🛠️ **Technology Stack**

### **Frontend:**
- React 18 + Vite
- Tailwind CSS
- React Router DOM
- Lucide React Icons
- WebSocket for real-time updates

### **Backend:**
- Python + FastAPI
- Whisper (Speech-to-Text)
- FAISS (Vector Search)
- Sentence Transformers
- Groq/OpenAI (LLM)
- PostgreSQL (Database)

## 📚 **Documentation**

- [Frontend Workflow](./WORKFLOW_OVERVIEW.md)
- [Document Upload Process](./DOCUMENT_WORKFLOW.md)
- [Navigation Updates](./NAVIGATION_UPDATE.md)

## 🚧 **Development Status**

- ✅ **Frontend**: Complete with subject-based workflow
- 🔄 **Backend**: In development - integrating existing Python pipeline
- 📋 **Next**: API integration and real-time features

## 🤝 **Contributing**

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 **License**

MIT License - see LICENSE file for details.
