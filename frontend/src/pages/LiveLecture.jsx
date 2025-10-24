import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom'
import { 
  Mic, 
  MicOff, 
  Square, 
  Play, 
  Pause, 
  Volume2,
  Settings,
  FileText,
  Clock,
  Activity,
  Save,
  Download,
  ArrowLeft,
  BookOpen,
  CheckCircle,
  Folder
} from 'lucide-react'
import { formatDuration } from '../lib/utils'
import toast from 'react-hot-toast'
import AudioRecorder from '../utils/audioRecorder'

const mockTranscriptionChunks = [
  {
    id: 1,
    timestamp: '00:00:15',
    text: "Welcome to today's lecture on Machine Learning fundamentals. We'll be covering supervised learning algorithms.",
    importance: 0.9,
    processed: true
  },
  {
    id: 2,
    timestamp: '00:01:30',
    text: "Let's start with linear regression, which is one of the most basic yet powerful algorithms in machine learning.",
    importance: 0.8,
    processed: true
  },
  {
    id: 3,
    timestamp: '00:02:45',
    text: "The goal of linear regression is to find the best line that fits through our data points.",
    importance: 0.7,
    processed: true
  }
]

const mockRawNotes = [
  "• Introduction to Machine Learning fundamentals",
  "• Focus on supervised learning algorithms",
  "• Linear regression as foundational algorithm",
  "• Goal: find best-fit line through data points",
  "• Mathematical foundation and practical applications"
]

// Mock subject data
const subjectData = {
  1: { name: 'Machine Learning', code: 'CS-401', color: 'bg-blue-500' },
  2: { name: 'Data Structures', code: 'CS-301', color: 'bg-green-500' },
  3: { name: 'Database Systems', code: 'CS-302', color: 'bg-purple-500' }
}

export default function LiveLecture() {
  const { subjectId } = useParams()
  const location = useLocation()
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [duration, setDuration] = useState(0)
  const [transcriptionChunks, setTranscriptionChunks] = useState([])
  const [rawNotes, setRawNotes] = useState([])
  const [liveNotes, setLiveNotes] = useState([])
  const [audioLevel, setAudioLevel] = useState(0)
  const [lectureTitle, setLectureTitle] = useState('')
  const [connectionStatus, setConnectionStatus] = useState('disconnected')
  const [audioStream, setAudioStream] = useState(null)
  const intervalRef = useRef(null)
  const transcriptionRef = useRef(null)
  const websocketRef = useRef(null)
  const audioRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  
  const subject = subjectData[subjectId] || { name: 'Unknown Subject', code: 'N/A', color: 'bg-secondary-500' }
  
  // Get lecture setup data from navigation state
  const lectureSetup = location.state || {}
  const { lectureId, lectureTitle: setupTitle, documents: setupDocuments = [], subjectName } = lectureSetup

  // WebSocket connection effect - connect when lecture is available
  useEffect(() => {
    if (lectureId) {
      connectWebSocket()
    }
    
    return () => {
      if (websocketRef.current) {
        websocketRef.current.close()
      }
    }
  }, [lectureId])

  // Send recording commands when recording state changes
  useEffect(() => {
    if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
      if (isRecording) {
        websocketRef.current.send(JSON.stringify({
          type: 'start_recording',
          lecture_id: lectureId
        }))
      } else {
        websocketRef.current.send(JSON.stringify({
          type: 'stop_recording',
          lecture_id: lectureId
        }))
      }
    }
  }, [isRecording, lectureId])

  // Timer effect
  useEffect(() => {
    if (isRecording && !isPaused) {
      intervalRef.current = setInterval(() => {
        setDuration(prev => prev + 1)
        // Simulate audio level
        setAudioLevel(Math.random() * 100)
      }, 1000)
    } else {
      clearInterval(intervalRef.current)
    }

    return () => clearInterval(intervalRef.current)
  }, [isRecording, isPaused])

  const connectWebSocket = () => {
    if (!lectureId) return

    console.log('Connecting to WebSocket for lecture:', lectureId)
    
    // Try multiple connection approaches
    const wsUrl = `ws://localhost:8001/ws/lecture/${lectureId}`
    console.log('WebSocket URL:', wsUrl)
    
    const ws = new WebSocket(wsUrl)
    websocketRef.current = ws

    ws.onopen = () => {
      console.log('WebSocket connected successfully')
      setConnectionStatus('connected')
      
      // Don't send start recording immediately - wait for user to click record
      ws.send(JSON.stringify({
        type: 'connection_established',
        lecture_id: lectureId
      }))
    }

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      console.log('Received WebSocket message:', data)
      
      if (data.type === 'live_update') {
        console.log('Processing live update:', data)
        // Add new live note
        const newNote = {
          id: Date.now(),
          timestamp: data.timestamp,
          transcription: data.transcription,
          notes: data.notes,
          importance_score: data.importance_score,
          created_at: new Date().toISOString()
        }
        
        setLiveNotes(prev => {
          const updated = [...prev, newNote]
          console.log('Updated live notes:', updated)
          return updated
        })
        
        // Add to transcription chunks
        if (data.transcription) {
          setTranscriptionChunks(prev => [...prev, {
            id: Date.now(),
            timestamp: data.timestamp,
            text: data.transcription.text,
            importance: data.importance_score
          }])
        }
      } else if (data.type === 'connection_confirmed') {
        console.log('WebSocket connection confirmed')
      } else if (data.type === 'recording_started') {
        console.log('Recording started confirmation received')
      } else if (data.type === 'recording_stopped') {
        console.log('Recording stopped confirmation received')
      }
    }

    ws.onclose = () => {
      console.log('WebSocket disconnected')
      setConnectionStatus('disconnected')
    }

    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
      setConnectionStatus('error')
    }
  }

  useEffect(() => {
    // Auto-scroll transcription to bottom
    if (transcriptionRef.current) {
      transcriptionRef.current.scrollTop = transcriptionRef.current.scrollHeight
    }
  }, [transcriptionChunks])

  const startRecording = async () => {
    if (!lectureTitle.trim()) {
      toast.error('Please enter a lecture title')
      return
    }
    
    console.log('🚀 USING WEB AUDIO API - RELIABLE WAV GENERATION')

    try {
      // Check Web Audio API support
      if (!AudioRecorder.isSupported()) {
        throw new Error('Web Audio API not supported')
      }

      // Create and initialize audio recorder
      const audioRecorder = new AudioRecorder()
      await audioRecorder.initialize()
      
      audioRecorderRef.current = audioRecorder
      
      // Define audio chunk handler
      const handleAudioChunk = async (wavBlob) => {
        console.log('🎵 WAV chunk generated:', wavBlob.size, 'bytes')
        console.log('🔧 MIME type: audio/wav')
        console.log('📁 File extension: wav')
        
        // Send audio chunk to backend
        const formData = new FormData()
        formData.append('audio_file', wavBlob, 'audio_chunk.wav')
        
        try {
          const response = await fetch(`http://localhost:8001/api/audio/lecture/${lectureId}/chunk`, {
            method: 'POST',
            body: formData
          })
          
          const result = await response.json()
          console.log('✅ Audio processing result:', result)
        } catch (error) {
          console.error('❌ Error sending audio chunk:', error)
        }
      }
      
      // Start recording with 5-second chunks
      await audioRecorder.startRecording(handleAudioChunk, 5000)
      
      setIsRecording(true)
      toast.success('Recording started with Web Audio API - crystal clear WAV!')
      
    } catch (error) {
      console.error('Error starting recording:', error)
      toast.error('Could not access microphone. Please allow microphone access.')
    }
  }

  const stopRecording = () => {
    // Stop Web Audio API recorder
    if (audioRecorderRef.current) {
      audioRecorderRef.current.stopRecording()
      audioRecorderRef.current = null
    }
    
    setIsRecording(false)
    setIsPaused(false)
    clearInterval(intervalRef.current)
    toast.success('Recording stopped')
  }

  const togglePause = () => {
    setIsPaused(!isPaused)
    toast.success(isPaused ? 'Recording resumed' : 'Recording paused')
  }

  const saveLecture = () => {
    if (!isRecording && duration > 0) {
      toast.success('Lecture saved successfully')
    } else {
      toast.error('No recording to save')
    }
  }

  const exportNotes = () => {
    if (rawNotes.length > 0) {
      toast.success('Notes exported successfully')
    } else {
      toast.error('No notes to export')
    }
  }

  const getImportanceColor = (importance) => {
    if (importance >= 0.8) return 'border-l-red-500 bg-red-50'
    if (importance >= 0.6) return 'border-l-yellow-500 bg-yellow-50'
    return 'border-l-green-500 bg-green-50'
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <Link 
            to={subjectId ? `/subjects/${subjectId}` : '/subjects'} 
            className="text-secondary-500 hover:text-secondary-700 transition-colors duration-200"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div className="flex items-center space-x-3">
            <div className={`w-4 h-4 rounded-full ${subject.color}`} />
            <div>
              <h1 className="text-3xl font-bold text-secondary-900">
                {subject.name} - Live Lecture
              </h1>
              <p className="text-secondary-600">{subject.code}</p>
            </div>
          </div>
        </div>
        <p className="text-secondary-600">
          Record lectures and generate intelligent notes in real-time
        </p>
      </div>

      {/* Lecture Setup */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-secondary-900">Lecture Setup</h2>
          <button className="text-secondary-500 hover:text-secondary-700">
            <Settings className="w-5 h-5" />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Lecture Title
            </label>
            <input
              type="text"
              value={lectureTitle || setupTitle || ''}
              onChange={(e) => setLectureTitle(e.target.value)}
              placeholder="Enter lecture title..."
              className="input"
              disabled={isRecording}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Duration
            </label>
            <div className="input bg-secondary-50">
              {formatDuration(duration)}
            </div>
          </div>
        </div>

        {/* Uploaded Documents */}
        {setupDocuments.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Uploaded Documents ({setupDocuments.length})
            </label>
            <div className="bg-secondary-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium text-secondary-900">
                  Documents processed and ready for AI context
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {setupDocuments.map((doc) => (
                  <div key={doc.id} className="flex items-center space-x-2 text-sm text-secondary-700">
                    <FileText className="w-4 h-4 text-secondary-500" />
                    <span className="truncate">{doc.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recording Controls */}
      <div className="card mb-6">
        <div className="flex items-center justify-between">
          <div>
            {!isRecording ? (
              <button
                onClick={startRecording}
                className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
              >
                <Mic className="w-5 h-5" />
                <span>Start Recording</span>
              </button>
            ) : (
              <div className="flex items-center space-x-3">
                <button
                  onClick={togglePause}
                  className="flex items-center space-x-2 bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                  <span>{isPaused ? 'Resume' : 'Pause'}</span>
                </button>
                
                <button
                  onClick={stopRecording}
                  className="flex items-center space-x-2 bg-secondary-600 hover:bg-secondary-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  <Square className="w-5 h-5" />
                  <span>Stop</span>
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-6">
            {/* Audio Level Indicator */}
            {isRecording && (
              <div className="flex items-center space-x-2">
                <Volume2 className="w-5 h-5 text-secondary-600" />
                <div className="w-24 h-2 bg-secondary-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 transition-all duration-100"
                    style={{ width: `${audioLevel}%` }}
                  />
                </div>
              </div>
            )}

            {/* Duration */}
            <div className="flex items-center space-x-2 text-secondary-600">
              <Clock className="w-5 h-5" />
              <span className="font-mono text-lg">{formatDuration(duration)}</span>
            </div>

            {/* Recording Status */}
            {isRecording && (
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isPaused ? 'bg-yellow-500' : 'bg-red-500 recording-pulse'}`} />
                <span className="text-sm font-medium text-secondary-700">
                  {isPaused ? 'Paused' : 'Recording'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Transcription */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-secondary-900">Live Transcription</h2>
            <Activity className="w-5 h-5 text-primary-600" />
          </div>
          
          <div 
            ref={transcriptionRef}
            className="h-96 overflow-y-auto space-y-3 p-4 bg-secondary-50 rounded-lg"
          >
            {transcriptionChunks.length === 0 ? (
              <div className="flex items-center justify-center h-full text-secondary-500">
                <div className="text-center">
                  <Mic className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Start recording to see live transcription</p>
                </div>
              </div>
            ) : (
              transcriptionChunks.map((chunk) => (
                <div 
                  key={chunk.id} 
                  className={`p-3 rounded-lg border-l-4 ${getImportanceColor(chunk.importance)}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-secondary-600">
                      {chunk.timestamp}
                    </span>
                    <span className="text-xs px-2 py-1 bg-white rounded-full">
                      {Math.round(chunk.importance * 100)}% important
                    </span>
                  </div>
                  <p className="text-secondary-800">{chunk.text}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Live AI Notes */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-secondary-900">Live AI Notes</h2>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500' : connectionStatus === 'error' ? 'bg-red-500' : 'bg-gray-400'}`} />
              <span className="text-sm text-secondary-600 capitalize">{connectionStatus}</span>
              <button
                onClick={exportNotes}
                className="text-secondary-500 hover:text-primary-600 transition-colors duration-200"
                title="Export Notes"
              >
                <Download className="w-5 h-5" />
              </button>
              <FileText className="w-5 h-5 text-primary-600" />
            </div>
          </div>
          
          <div className="h-96 overflow-y-auto p-4 bg-secondary-50 rounded-lg">
            {liveNotes.length === 0 ? (
              <div className="flex items-center justify-center h-full text-secondary-500">
                <div className="text-center">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>AI-generated notes will appear here during recording</p>
                  {connectionStatus === 'connected' && isRecording && (
                    <div className="mt-4">
                      <div className="animate-pulse flex items-center justify-center space-x-2">
                        <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}} />
                        <div className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}} />
                      </div>
                      <p className="text-sm mt-2">Generating notes...</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {liveNotes.map((note) => (
                  <div key={note.id} className="bg-white p-4 rounded-lg border border-secondary-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-secondary-500 font-mono">{note.timestamp}</span>
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${note.importance_score > 0.7 ? 'bg-red-500' : note.importance_score > 0.4 ? 'bg-yellow-500' : 'bg-green-500'}`} />
                        <span className="text-xs text-secondary-500">
                          {Math.round(note.importance_score * 100)}% importance
                        </span>
                      </div>
                    </div>
                    <div className="text-secondary-800 whitespace-pre-line">{note.notes}</div>
                    {note.transcription && (
                      <div className="mt-2 pt-2 border-t border-secondary-100">
                        <p className="text-xs text-secondary-500 italic">
                          "{note.transcription.text}"
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {(duration > 0 || isRecording) && (
        <div className="flex justify-center space-x-4 mt-6">
          <button
            onClick={saveLecture}
            disabled={isRecording}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Lecture</span>
          </button>
          
          <button
            onClick={exportNotes}
            disabled={rawNotes.length === 0}
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export Notes</span>
          </button>
        </div>
      )}
    </div>
  )
}
