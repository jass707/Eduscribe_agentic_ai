# EduScribe Backend

FastAPI-based backend for AI-powered lecture note generation with real-time WebSocket updates.

## 🚀 **Quick Start**

### **1. Install Dependencies**
```bash
cd backend
pip install -r requirements.txt
```

### **2. Set Up Environment**
```bash
# Copy environment template
copy .env.example .env

# Edit .env with your API keys
# At minimum, add your GROQ_API_KEY for LLM functionality
```

### **3. Start the Server**
```bash
python start.py
```

The server will start at `http://localhost:8000`

- **API Documentation**: `http://localhost:8000/docs`
- **Health Check**: `http://localhost:8000/health`

## 📋 **Features**

### **Core APIs**
- **Subjects Management** - CRUD operations for subjects/courses
- **Lectures Management** - Create and manage lecture sessions
- **Document Processing** - Upload and process PDFs, PPTs, Word docs
- **Live Recording** - Real-time audio processing with WebSocket updates

### **AI Pipeline**
- **Speech-to-Text** - Whisper-based transcription
- **Document Processing** - Text extraction and FAISS vectorization
- **Importance Scoring** - Audio analysis for content relevance
- **RAG Note Generation** - Context-aware AI note creation
- **Real-time Updates** - WebSocket-based live note streaming

## 🔄 **Complete Workflow**

### **1. Document Upload**
```
POST /api/documents/lecture/{lecture_id}/upload
→ Extract text → Create embeddings → Store in FAISS
```

### **2. Live Recording**
```
WebSocket /api/live/lecture/{lecture_id}
→ Audio chunks → Whisper transcription → Importance scoring → RAG notes → Live updates
```

### **3. Real-time Note Display**
```
Frontend WebSocket connection receives:
{
  "type": "live_update",
  "transcription": {...},
  "notes": "- Key point 1\n- Key point 2",
  "importance_score": 0.8
}
```

## 🛠️ **Architecture**

```
app/
├── api/                    # FastAPI route handlers
│   ├── subjects.py        # Subject CRUD operations
│   ├── lectures.py        # Lecture management
│   ├── documents.py       # Document upload/processing
│   └── live_recording.py  # WebSocket live recording
├── services/              # Business logic services
│   ├── transcribe_whisper.py    # Speech-to-text
│   ├── document_processor.py    # PDF/PPT text extraction
│   ├── importance_scorer.py     # Audio analysis
│   ├── rag_generator.py         # AI note generation
│   └── audio_processor.py       # Audio preprocessing
├── models/                # Database models
│   └── models.py         # SQLAlchemy models
├── core/                  # Core configuration
│   ├── config.py         # Settings and environment
│   └── database.py       # Database connection
└── main.py               # FastAPI application
```

## 🔌 **API Endpoints**

### **Subjects**
- `GET /api/subjects/` - List all subjects
- `POST /api/subjects/` - Create new subject
- `GET /api/subjects/{id}` - Get subject details
- `PUT /api/subjects/{id}` - Update subject
- `DELETE /api/subjects/{id}` - Delete subject

### **Lectures**
- `GET /api/lectures/subject/{subject_id}` - Get lectures for subject
- `POST /api/lectures/` - Create new lecture
- `POST /api/lectures/{id}/start` - Start recording
- `POST /api/lectures/{id}/stop` - Stop recording
- `GET /api/lectures/{id}/notes` - Get lecture notes

### **Documents**
- `POST /api/documents/lecture/{lecture_id}/upload` - Upload documents
- `GET /api/documents/lecture/{lecture_id}` - List lecture documents
- `GET /api/documents/{id}` - Get document details
- `DELETE /api/documents/{id}` - Delete document

### **Live Recording**
- `WebSocket /api/live/lecture/{lecture_id}` - Live recording session
- `POST /api/live/lecture/{lecture_id}/audio-chunk` - Upload audio chunk
- `GET /api/live/lecture/{lecture_id}/notes/live` - Get live notes

## 🧠 **AI Configuration**

### **Required API Keys**
```bash
# For LLM-based note generation (choose one)
GROQ_API_KEY=your_groq_key_here
OPENAI_API_KEY=your_openai_key_here
```

### **Model Settings**
```bash
# Whisper model size (tiny, base, small, medium, large)
WHISPER_MODEL_SIZE=tiny

# Embedding model for document processing
EMBEDDING_MODEL=all-MiniLM-L6-v2

# LLM model for note generation
LLM_MODEL=llama-3.1-8b-instant
```

## 📊 **Database**

Uses SQLite by default for development. Tables:
- `users` - User accounts
- `subjects` - Courses/subjects
- `lectures` - Lecture sessions
- `documents` - Uploaded files
- `transcriptions` - Speech-to-text results
- `notes` - Generated notes (raw and structured)

## 🔧 **Development**

### **Install in Development Mode**
```bash
pip install -e .
```

### **Run with Auto-reload**
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### **Initialize Database**
```bash
python init_db.py
```

## 🚨 **Important Notes**

1. **API Keys**: Add your Groq or OpenAI API key to `.env` for LLM functionality
2. **Storage**: Files are stored in `storage/` directory (ensure write permissions)
3. **WebSocket**: Frontend must connect to WebSocket for live updates
4. **CORS**: Configured for `localhost:3000` (React frontend)

## 🔗 **Frontend Integration**

The backend is designed to work with the React frontend in the `../frontend/` directory. Key integration points:

- **Document Upload**: Frontend sends files to `/api/documents/lecture/{id}/upload`
- **Live Recording**: Frontend connects to WebSocket for real-time updates
- **Note Display**: Frontend receives live notes via WebSocket messages

## 📈 **Performance**

- **Whisper Model**: Use `tiny` for development, `base` or `small` for production
- **FAISS**: CPU-based vector search (can be upgraded to GPU)
- **Async Processing**: All heavy operations run in thread executors
- **WebSocket**: Efficient real-time communication for live updates
