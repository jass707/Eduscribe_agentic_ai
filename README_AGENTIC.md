# 🤖 EduScribe - Agentic AI Note Generation System

> **Intelligent lecture note-taking with 20-second audio chunks and 60-second agentic synthesis**

[![GitHub](https://img.shields.io/badge/GitHub-Eduscribe__agentic__ai-blue?logo=github)](https://github.com/jass707/Eduscribe_agentic_ai)

---

## 🎯 What's New in This Version

This is the **optimized agentic AI version** of EduScribe with major improvements:

### ✨ Key Features

- **🎤 20-Second Audio Chunks** - Better transcription quality with Whisper
- **🤖 Agentic Note Synthesis** - Intelligent AI combines 60s of content into structured notes
- **📊 Real-Time Feedback** - See transcriptions every 20s, structured notes every 60s
- **💰 83% Cost Reduction** - Fewer API calls, same or better quality
- **🎨 Beautiful UI** - Progressive feedback with blue transcription boxes and gradient note cards
- **📚 RAG Integration** - Upload lecture materials for context-aware notes

---

## 🏗️ Architecture

```
Frontend (React + Vite)
    ↓
20-second audio chunks
    ↓
Backend (FastAPI + WebSocket)
    ↓
Whisper Transcription (every 20s)
    ↓
Buffer accumulates 3 chunks
    ↓
Agentic AI Synthesis (every 60s)
    ↓
Structured Markdown Notes
```

---

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- Node.js 16+
- GROQ API Key ([Get one here](https://console.groq.com))

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
# Create .env file:
echo "GROQ_API_KEY=your_groq_api_key_here" > .env

# Start optimized backend
python optimized_main.py
```

Backend runs on: `http://localhost:8001`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs on: `http://localhost:3000`

---

## 📊 How It Works

### Timeline

```
0s ──────────────────────────────────────────────
    🎤 Start recording
    
20s ─────────────────────────────────────────────
    📤 Audio chunk 1 sent
    🎤 Whisper transcribes
    ✅ Transcription displayed in blue box
    
40s ─────────────────────────────────────────────
    📤 Audio chunk 2 sent
    🎤 Whisper transcribes
    ✅ Transcription displayed
    
60s ─────────────────────────────────────────────
    📤 Audio chunk 3 sent
    🎤 Whisper transcribes
    ✅ Transcription displayed
    
    🤖 AGENTIC SYNTHESIS TRIGGERED
    🧠 AI analyzes all 3 transcriptions
    📚 Queries document knowledge base
    ✍️  Generates structured notes
    
65s ─────────────────────────────────────────────
    📝 STRUCTURED NOTES APPEAR!
    
    ## Neural Networks Overview
    
    ### Core Concepts
    - Neural networks are powerful ML tools
    - Inspired by biological systems
    
    ### Architecture
    - Composed of multiple layers
    - Each layer contains neurons
```

---

## 🎨 UI Features

### Real-Time Transcriptions (Blue Boxes)
- Appear every 20 seconds
- Show chunk number and timestamp
- Indicate processing status
- Display last 3 transcriptions

### Structured Notes (Gradient Cards)
- Appear every 60 seconds
- Beautiful markdown formatting
- Show synthesis metadata
- Proper hierarchy (##, ###, bullets)

---

## 🔧 Configuration

Edit `backend/app/core/config.py`:

```python
# Audio Processing
CHUNK_DURATION: int = 20        # Audio chunk size (seconds)
SYNTHESIS_INTERVAL: int = 60    # When to synthesize (seconds)

# Whisper Settings
WHISPER_MODEL_SIZE: str = "base"  # tiny, base, small, medium, large

# LLM Settings
LLM_MODEL: str = "llama-3.1-8b-instant"
GROQ_API_KEY: str = os.getenv("GROQ_API_KEY")
```

---

## 📁 Project Structure

```
eduscribe/
├── backend/
│   ├── optimized_main.py              # New optimized backend
│   ├── start_optimized.py             # Startup script
│   ├── app/
│   │   ├── services/
│   │   │   ├── agentic_synthesizer.py # Agentic synthesis service
│   │   │   ├── transcribe_whisper.py  # Whisper transcription
│   │   │   ├── document_processor.py  # RAG/FAISS
│   │   │   └── rag_generator.py       # Note generation
│   │   └── core/
│   │       └── config.py              # Configuration
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   └── LiveLecture.jsx        # Main recording page
│   │   └── utils/
│   │       └── audioRecorder.js       # Audio capture (20s chunks)
│   └── package.json
├── OPTIMIZED_SYSTEM.md                # Complete documentation
├── CRITICAL_FIX_APPLIED.md            # Bug fix details
└── README_AGENTIC.md                  # This file
```

---

## 🎯 Usage

### 1. Create a Lecture

1. Navigate to your subject
2. Click "New Lecture"
3. Enter lecture title

### 2. Upload Documents (Optional)

- Upload PDFs, PPTX, DOCX, or TXT files
- System builds FAISS knowledge base
- Documents provide context for notes

### 3. Start Recording

1. Click "Start Recording"
2. Grant microphone permissions
3. Speak naturally

### 4. Watch the Magic

- **Every 20s**: Transcription appears in blue box
- **Every 60s**: Structured notes appear in gradient card
- **Real-time**: Progress indicators and toast notifications

---

## 📊 Performance Metrics

| Metric | Old System (5s) | New System (20s) | Improvement |
|--------|----------------|------------------|-------------|
| **API Calls/min** | 24 | 4 | **83% reduction** |
| **Transcription Quality** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | **Better context** |
| **Note Quality** | ⭐⭐ | ⭐⭐⭐⭐⭐ | **Structured & coherent** |
| **Processing Speed** | Medium | Fast | **3x faster** |
| **Cost** | 💰💰💰 | 💰 | **83% cheaper** |

---

## 🐛 Troubleshooting

### No transcriptions appearing?

**Check:**
- Microphone permissions granted
- WebSocket connection established
- Backend logs show "Got audio chunk from queue"

**Fix:**
```bash
# Check backend is running
curl http://localhost:8001/

# Restart backend
cd backend
python optimized_main.py
```

### "Invalid API Key" error?

**Fix:**
```bash
# Set GROQ_API_KEY in backend/.env
echo "GROQ_API_KEY=your_actual_key_here" > backend/.env

# Restart backend
```

### Synthesis not triggering?

**Check:**
- Wait for 60 seconds (3 chunks)
- Backend logs show "Starting agentic synthesis"
- GROQ_API_KEY is valid

### Queue fills up but nothing processes?

**This was fixed!** The critical bug where tasks received shutdown signals has been resolved. If you still see this:

1. Stop backend (`Ctrl+C`)
2. Delete `backend/__pycache__` folders
3. Restart backend

---

## 🔬 Technical Details

### Agentic Synthesis

The system uses intelligent synthesis with:

1. **Context Awareness** - Combines 60s of speech
2. **Document Integration** - Queries uploaded materials via FAISS
3. **Structure Detection** - Creates proper hierarchy (##, ###)
4. **Redundancy Avoidance** - Doesn't repeat previous notes
5. **Educational Focus** - Optimized for learning

### Synthesis Triggers

- **Time-based**: Every 60 seconds (3 chunks)
- **Topic-shift**: Detects lecture transitions
- **Manual**: On recording stop

### WebSocket Messages

```javascript
// Transcription (every 20s)
{
  type: "transcription",
  content: "Neural networks are...",
  timestamp: 1234567890,
  chunk_number: 1
}

// Synthesis started
{
  type: "synthesis_started",
  message: "Generating structured notes..."
}

// Structured notes (every 60s)
{
  type: "structured_notes",
  content: "## Neural Networks\n\n### Core Concepts\n...",
  timestamp: 1234567890,
  transcription_count: 3
}
```

---

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🙏 Acknowledgments

- **Whisper** - OpenAI's speech recognition
- **GROQ** - Fast LLM inference
- **FAISS** - Efficient similarity search
- **FastAPI** - Modern Python web framework
- **React** - Frontend framework

---

## 📞 Support

- **GitHub Issues**: [Report bugs](https://github.com/jass707/Eduscribe_agentic_ai/issues)
- **Documentation**: See `OPTIMIZED_SYSTEM.md`
- **Bug Fixes**: See `CRITICAL_FIX_APPLIED.md`

---

## 🎉 What's Next?

Future improvements:

- [ ] Multi-language support
- [ ] Custom synthesis prompts
- [ ] Export to PDF/Markdown
- [ ] Lecture search and indexing
- [ ] Mobile app
- [ ] Collaborative note-taking

---

**Built with ❤️ for better learning**

🚀 **Start taking intelligent lecture notes today!**
