/**
 * Web Audio API based audio recorder that generates proper WAV files
 * Solves MediaRecorder WebM corruption issues
 */

class AudioRecorder {
  constructor() {
    this.audioContext = null
    this.mediaStream = null
    this.processor = null
    this.isRecording = false
    this.audioChunks = []
    this.sampleRate = 16000 // Whisper-friendly sample rate
    this.onDataAvailable = null
  }

  /**
   * Initialize audio recording
   */
  async initialize() {
    try {
      // Get microphone access (let browser choose sample rate)
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        }
      })

      // Create audio context with default sample rate (let browser decide)
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
      
      // Update our target sample rate to match the context
      this.sampleRate = this.audioContext.sampleRate
      console.log(`🎵 AudioContext created with sample rate: ${this.sampleRate}Hz`)

      console.log('🎤 Audio recorder initialized successfully')
      return true
    } catch (error) {
      console.error('❌ Failed to initialize audio recorder:', error)
      throw error
    }
  }

  /**
   * Start recording audio
   */
  async startRecording(onDataCallback, chunkDurationMs = 5000) {
    if (!this.audioContext || !this.mediaStream) {
      throw new Error('Audio recorder not initialized')
    }

    this.onDataAvailable = onDataCallback
    this.isRecording = true
    this.audioChunks = []

    // Create audio source from microphone
    const source = this.audioContext.createMediaStreamSource(this.mediaStream)
    
    // Create script processor for audio data
    const bufferSize = 4096
    this.processor = this.audioContext.createScriptProcessor(bufferSize, 1, 1)
    
    let audioBuffer = []
    let lastChunkTime = Date.now()

    this.processor.onaudioprocess = (event) => {
      if (!this.isRecording) return

      const inputBuffer = event.inputBuffer
      const inputData = inputBuffer.getChannelData(0)
      
      // Convert Float32Array to Int16Array for WAV
      const int16Data = new Int16Array(inputData.length)
      for (let i = 0; i < inputData.length; i++) {
        // Convert from [-1, 1] to [-32768, 32767]
        int16Data[i] = Math.max(-32768, Math.min(32767, inputData[i] * 32767))
      }
      
      audioBuffer.push(int16Data)

      // Check if it's time to send a chunk
      const now = Date.now()
      if (now - lastChunkTime >= chunkDurationMs) {
        this.sendAudioChunk(audioBuffer)
        audioBuffer = []
        lastChunkTime = now
      }
    }

    // Connect audio nodes
    source.connect(this.processor)
    this.processor.connect(this.audioContext.destination)

    console.log('🎵 Recording started with Web Audio API')
  }

  /**
   * Stop recording
   */
  stopRecording() {
    this.isRecording = false
    
    if (this.processor) {
      this.processor.disconnect()
      this.processor = null
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop())
    }

    if (this.audioContext) {
      this.audioContext.close()
      this.audioContext = null
    }

    console.log('🛑 Recording stopped')
  }

  /**
   * Convert audio buffer to WAV and send
   */
  sendAudioChunk(audioBuffer) {
    if (audioBuffer.length === 0) return

    // Calculate total samples
    const totalSamples = audioBuffer.reduce((sum, chunk) => sum + chunk.length, 0)
    
    if (totalSamples === 0) return

    // Combine all chunks into one buffer
    const combinedBuffer = new Int16Array(totalSamples)
    let offset = 0
    for (const chunk of audioBuffer) {
      combinedBuffer.set(chunk, offset)
      offset += chunk.length
    }

    // Resample to 16kHz for Whisper if needed
    const targetSampleRate = 16000
    let finalBuffer = combinedBuffer
    let finalSampleRate = this.sampleRate

    if (this.sampleRate !== targetSampleRate) {
      finalBuffer = this.resampleAudio(combinedBuffer, this.sampleRate, targetSampleRate)
      finalSampleRate = targetSampleRate
      console.log(`🔄 Resampled from ${this.sampleRate}Hz to ${targetSampleRate}Hz`)
    }

    // Generate WAV file
    const wavBlob = this.createWAVBlob(finalBuffer, finalSampleRate)
    
    console.log(`🎵 Generated WAV chunk: ${wavBlob.size} bytes (${finalSampleRate}Hz)`)
    
    if (this.onDataAvailable) {
      this.onDataAvailable(wavBlob)
    }
  }

  /**
   * Simple linear interpolation resampling
   */
  resampleAudio(inputBuffer, inputSampleRate, outputSampleRate) {
    if (inputSampleRate === outputSampleRate) {
      return inputBuffer
    }

    const ratio = inputSampleRate / outputSampleRate
    const outputLength = Math.round(inputBuffer.length / ratio)
    const outputBuffer = new Int16Array(outputLength)

    for (let i = 0; i < outputLength; i++) {
      const inputIndex = i * ratio
      const inputIndexFloor = Math.floor(inputIndex)
      const inputIndexCeil = Math.min(inputIndexFloor + 1, inputBuffer.length - 1)
      
      // Linear interpolation
      const fraction = inputIndex - inputIndexFloor
      const sample1 = inputBuffer[inputIndexFloor] || 0
      const sample2 = inputBuffer[inputIndexCeil] || 0
      
      outputBuffer[i] = Math.round(sample1 + (sample2 - sample1) * fraction)
    }

    return outputBuffer
  }

  /**
   * Create proper WAV file from audio data
   */
  createWAVBlob(audioData, sampleRate) {
    const length = audioData.length
    const buffer = new ArrayBuffer(44 + length * 2)
    const view = new DataView(buffer)
    
    // WAV header
    const writeString = (offset, string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i))
      }
    }

    // RIFF chunk descriptor
    writeString(0, 'RIFF')
    view.setUint32(4, 36 + length * 2, true) // File size - 8
    writeString(8, 'WAVE')
    
    // fmt sub-chunk
    writeString(12, 'fmt ')
    view.setUint32(16, 16, true) // Subchunk1Size (16 for PCM)
    view.setUint16(20, 1, true) // AudioFormat (1 for PCM)
    view.setUint16(22, 1, true) // NumChannels (1 for mono)
    view.setUint32(24, sampleRate, true) // SampleRate
    view.setUint32(28, sampleRate * 2, true) // ByteRate
    view.setUint16(32, 2, true) // BlockAlign
    view.setUint16(34, 16, true) // BitsPerSample
    
    // data sub-chunk
    writeString(36, 'data')
    view.setUint32(40, length * 2, true) // Subchunk2Size
    
    // Write audio data
    let offset = 44
    for (let i = 0; i < length; i++) {
      view.setInt16(offset, audioData[i], true)
      offset += 2
    }
    
    return new Blob([buffer], { type: 'audio/wav' })
  }

  /**
   * Check if Web Audio API is supported
   */
  static isSupported() {
    return !!(window.AudioContext || window.webkitAudioContext)
  }
}

export default AudioRecorder
