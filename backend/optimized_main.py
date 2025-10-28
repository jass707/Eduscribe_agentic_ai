"""
Optimized EduScribe Backend with Agentic Note Synthesis
- 20-second audio chunks for transcription
- 60-second synthesis for structured notes
"""
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import json
import asyncio
import os
import time
import tempfile
from pathlib import Path
from typing import Dict, List
import logging
from collections import defaultdict

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

app = FastAPI(title="EduScribe Backend - Optimized Agentic Processing")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import services
from app.services.transcribe_whisper import transcribe_local
from app.services.document_processor import query_documents
from app.services.agentic_synthesizer import synthesize_structured_notes, detect_topic_shift
from app.services.importance_scorer import score_importance


class OptimizedAudioProcessor:
    """Handles optimized audio processing with agentic synthesis"""
    
    def __init__(self):
        self.temp_dir = Path(tempfile.gettempdir()) / "eduscribe_audio"
        self.temp_dir.mkdir(exist_ok=True)
        
        # Buffers for each lecture
        self.transcription_buffers = defaultdict(list)  # Store transcriptions
        self.last_synthesis_time = defaultdict(float)   # Track synthesis timing
        self.structured_notes_history = defaultdict(list)  # Store generated notes
        
        # Processing queues
        self.audio_queues = defaultdict(asyncio.Queue)
        self.processing_tasks = {}
        
        logger.info("✅ Optimized audio processor initialized")
    
    async def process_audio_chunk(self, lecture_id: str, audio_file: UploadFile, websocket: WebSocket):
        """Process 20-second audio chunk"""
        try:
            # Save audio file
            timestamp = int(time.time() * 1000)
            filename = f"chunk_{lecture_id}_{timestamp}.wav"
            file_path = self.temp_dir / filename
            
            with open(file_path, "wb") as f:
                content = await audio_file.read()
                f.write(content)
            
            file_size = len(content)
            logger.info(f"📥 Received audio chunk for {lecture_id}: {file_size} bytes")
            
            # Add to processing queue
            await self.audio_queues[lecture_id].put({
                "file_path": file_path,
                "timestamp": timestamp,
                "websocket": websocket
            })
            
            queue_size = self.audio_queues[lecture_id].qsize()
            logger.info(f"📊 Queue size for {lecture_id}: {queue_size}")
            
            return {"status": "queued", "size": file_size, "queue_size": queue_size}
            
        except Exception as e:
            logger.error(f"Error receiving audio chunk: {e}")
            return {"error": str(e)}
    
    async def process_lecture_audio(self, lecture_id: str):
        """Background task to process audio for a lecture"""
        logger.info(f"🎵 Started audio processing task for {lecture_id}")
        
        try:
            while True:
                # Get next audio chunk from queue
                logger.info(f"⏳ Waiting for audio chunk in queue for {lecture_id}...")
                chunk_data = await self.audio_queues[lecture_id].get()
                logger.info(f"✅ Got audio chunk from queue for {lecture_id}")
                
                file_path = chunk_data["file_path"]
                websocket = chunk_data["websocket"]
                
                # Step 1: Transcribe audio (20-second chunk)
                logger.info(f"🎤 Transcribing: {file_path.name}")
                
                try:
                    transcription_result = transcribe_local(str(file_path))
                    transcription_text = transcription_result.get("text", "").strip()
                    logger.info(f"✅ Transcription complete: {transcription_text[:50]}...")
                except Exception as trans_error:
                    logger.error(f"❌ Transcription error: {trans_error}", exc_info=True)
                    continue
                
                if not transcription_text:
                    logger.warning("⚠️  No speech detected in chunk")
                    continue
                
                # Store transcription in buffer
                transcription_data = {
                    "text": transcription_text,
                    "timestamp": chunk_data["timestamp"],
                    "language": transcription_result.get("language"),
                    "duration": transcription_result.get("duration")
                }
                
                self.transcription_buffers[lecture_id].append(transcription_data)
                
                # Send transcription to frontend immediately
                await websocket.send_json({
                    "type": "transcription",
                    "content": transcription_text,
                    "timestamp": chunk_data["timestamp"],
                    "chunk_number": len(self.transcription_buffers[lecture_id])
                })
                
                logger.info(f"✅ Transcription {len(self.transcription_buffers[lecture_id])}: {transcription_text[:50]}...")
                
                # Step 2: Check if it's time to synthesize (every 60 seconds = 3 chunks)
                buffer_size = len(self.transcription_buffers[lecture_id])
                current_time = time.time()
                last_synthesis = self.last_synthesis_time[lecture_id]
                
                # Synthesize if: 3+ chunks AND (60s passed OR topic shift detected)
                should_synthesize = False
                
                if buffer_size >= 3:
                    time_since_last = current_time - last_synthesis
                    
                    if time_since_last >= 60 or last_synthesis == 0:
                        should_synthesize = True
                        logger.info(f"⏰ 60 seconds elapsed, triggering synthesis")
                    else:
                        # Check for topic shift
                        recent_transcriptions = [t["text"] for t in self.transcription_buffers[lecture_id][-3:]]
                        topic_shift = await detect_topic_shift(
                            recent_transcriptions[-1],
                            recent_transcriptions[:-1]
                        )
                        
                        if topic_shift:
                            should_synthesize = True
                            logger.info(f"🔄 Topic shift detected, triggering early synthesis")
                
                if should_synthesize:
                    await self.synthesize_notes(lecture_id, websocket)
                
                # Cleanup old audio file
                try:
                    file_path.unlink()
                except:
                    pass
                
        except asyncio.CancelledError:
            logger.info(f"🛑 Task cancelled for {lecture_id}")
            raise
        except Exception as e:
            logger.error(f"❌ Fatal error in processing task: {e}", exc_info=True)
    
    async def synthesize_notes(self, lecture_id: str, websocket: WebSocket):
        """Synthesize structured notes from accumulated transcriptions"""
        try:
            logger.info(f"🤖 Starting agentic synthesis for {lecture_id}")
            
            # Get transcriptions to synthesize (last 3 chunks = 60 seconds)
            transcriptions = self.transcription_buffers[lecture_id][-3:]
            
            if not transcriptions:
                return
            
            # Get RAG context from all transcriptions
            combined_text = " ".join([t["text"] for t in transcriptions])
            rag_context = query_documents(combined_text, lecture_id, top_k=5)
            
            # Get previous structured notes for context
            previous_notes = None
            if self.structured_notes_history[lecture_id]:
                previous_notes = self.structured_notes_history[lecture_id][-1]
            
            # Send "processing" message
            await websocket.send_json({
                "type": "synthesis_started",
                "message": "Generating structured notes..."
            })
            
            # Synthesize structured notes
            synthesis_result = await synthesize_structured_notes(
                transcriptions=transcriptions,
                rag_context=rag_context,
                lecture_id=lecture_id,
                previous_structured_notes=previous_notes
            )
            
            if synthesis_result["success"]:
                structured_notes = synthesis_result["structured_notes"]
                
                # Store in history
                self.structured_notes_history[lecture_id].append(structured_notes)
                
                # Send to frontend
                await websocket.send_json({
                    "type": "structured_notes",
                    "content": structured_notes,
                    "timestamp": int(time.time() * 1000),
                    "transcription_count": len(transcriptions)
                })
                
                logger.info(f"📝 Structured notes generated and sent")
                
                # Update last synthesis time
                self.last_synthesis_time[lecture_id] = time.time()
                
                # Clear processed transcriptions (keep last one for context)
                self.transcription_buffers[lecture_id] = self.transcription_buffers[lecture_id][-1:]
            
        except Exception as e:
            logger.error(f"Error synthesizing notes: {e}", exc_info=True)
            await websocket.send_json({
                "type": "synthesis_error",
                "error": str(e)
            })


# Global processor instance
processor = OptimizedAudioProcessor()

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
    
    async def connect(self, lecture_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[lecture_id] = websocket
        logger.info(f"Client connected to lecture {lecture_id}")
    
    def disconnect(self, lecture_id: str):
        if lecture_id in self.active_connections:
            del self.active_connections[lecture_id]
            logger.info(f"Client disconnected from lecture {lecture_id}")
    
    async def send_message(self, lecture_id: str, message: dict):
        if lecture_id in self.active_connections:
            await self.active_connections[lecture_id].send_json(message)

manager = ConnectionManager()


# API Endpoints
@app.get("/")
async def root():
    return {"message": "EduScribe Optimized Backend - Agentic Note Synthesis"}


@app.get("/api/subjects/")
async def get_subjects():
    """Get all subjects"""
    mock_subjects = [
        {"id": "1", "name": "Machine Learning", "code": "CS-401"},
        {"id": "2", "name": "Data Structures", "code": "CS-301"}
    ]
    return mock_subjects


@app.post("/api/lectures/")
async def create_lecture(data: dict):
    """Create a new lecture"""
    lecture_id = f"lecture-{int(time.time())}"
    return {
        "id": lecture_id,
        "title": data.get("title", "New Lecture"),
        "subject_id": data.get("subject_id"),
        "status": "created"
    }


@app.post("/api/documents/lecture/{lecture_id}/upload")
async def upload_documents(lecture_id: str, files: List[UploadFile] = File(...)):
    """Upload documents for a lecture"""
    return {
        "message": "Documents uploaded successfully",
        "lecture_id": lecture_id,
        "files_count": len(files)
    }


@app.post("/api/audio/lecture/{lecture_id}/chunk")
async def receive_audio_chunk(lecture_id: str, audio_file: UploadFile = File(...)):
    """Receive 20-second audio chunk"""
    
    # Get websocket for this lecture
    websocket = manager.active_connections.get(lecture_id)
    
    if not websocket:
        return {"error": "No active WebSocket connection for this lecture"}
    
    result = await processor.process_audio_chunk(lecture_id, audio_file, websocket)
    return result


@app.websocket("/ws/lecture/{lecture_id}")
async def websocket_endpoint(websocket: WebSocket, lecture_id: str):
    """WebSocket endpoint for real-time updates"""
    await manager.connect(lecture_id, websocket)
    
    # Cancel old task if exists (reconnection scenario)
    if lecture_id in processor.processing_tasks:
        logger.info(f"🔄 Cancelling old task for {lecture_id} (reconnection)")
        old_task = processor.processing_tasks[lecture_id]
        old_task.cancel()
        try:
            await old_task
        except asyncio.CancelledError:
            pass
        # Clear the old queue
        processor.audio_queues[lecture_id] = asyncio.Queue()
        logger.info(f"✅ Old task cancelled and queue cleared")
    
    # Start new processing task
    logger.info(f"🚀 Creating background processing task for {lecture_id}")
    task = asyncio.create_task(processor.process_lecture_audio(lecture_id))
    processor.processing_tasks[lecture_id] = task
    logger.info(f"✅ Background task created and started for {lecture_id}")
    
    try:
        # Send connection confirmation
        await websocket.send_json({
            "type": "connection_confirmed",
            "message": "WebSocket connected - Ready for optimized audio processing"
        })
        
        # Keep connection alive and handle messages
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message.get("type") == "start_recording":
                logger.info(f"Starting recording for lecture {lecture_id}")
                await websocket.send_json({
                    "type": "recording_started",
                    "message": "Recording started - Send 20-second audio chunks"
                })
            
            elif message.get("type") == "stop_recording":
                logger.info(f"Stopping recording for lecture {lecture_id}")
                
                # Final synthesis if there are remaining transcriptions
                if len(processor.transcription_buffers[lecture_id]) > 0:
                    await processor.synthesize_notes(lecture_id, websocket)
                
                await websocket.send_json({
                    "type": "recording_stopped",
                    "message": "Recording stopped"
                })
            
    except WebSocketDisconnect:
        manager.disconnect(lecture_id)
        
        # Don't stop task on disconnect - it will be cancelled on reconnect
        # This allows the task to continue processing queued audio
        
        logger.info(f"WebSocket disconnected for lecture {lecture_id}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
