/**
 * Gemini Live API Client
 * Provides real-time bidirectional audio streaming for voice conversations
 */

export interface GeminiLiveConfig {
  apiKey: string
  model?: string
  systemInstruction?: string
  voice?: string
}

export interface GeminiLiveCallbacks {
  onAudioData: (audioData: ArrayBuffer) => void
  onTranscript: (text: string, isFinal: boolean) => void
  onError: (error: Error) => void
  onConnectionChange: (connected: boolean) => void
}

export class GeminiLiveClient {
  private ws: WebSocket | null = null
  private config: GeminiLiveConfig
  private callbacks: GeminiLiveCallbacks
  private isConnected = false
  private audioContext: AudioContext | null = null
  private audioQueue: Float32Array[] = []
  private isPlaying = false

  constructor(config: GeminiLiveConfig, callbacks: GeminiLiveCallbacks) {
    this.config = {
      // Gemini Live API model for bidirectional streaming
      model: "gemini-2.0-flash-live-preview-04-09",
      ...config,
    }
    this.callbacks = callbacks
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const wsUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${this.config.apiKey}`
      
      console.log("[GeminiLive] Connecting to WebSocket...")
      this.ws = new WebSocket(wsUrl)
      
      this.ws.onopen = () => {
        console.log("[GeminiLive] WebSocket connected, sending setup...")
        this.sendSetup()
        this.isConnected = true
        this.callbacks.onConnectionChange(true)
        resolve()
      }

      this.ws.onmessage = (event) => {
        this.handleMessage(event.data)
      }

      this.ws.onerror = (error) => {
        console.error("[GeminiLive] WebSocket error:", error)
        this.callbacks.onError(new Error("WebSocket connection error"))
        reject(error)
      }

      this.ws.onclose = (event) => {
        console.log("[GeminiLive] WebSocket closed:", event.code, event.reason)
        this.isConnected = false
        this.callbacks.onConnectionChange(false)
      }
    })
  }

  private sendSetup(): void {
    if (!this.ws) return

    const setup = {
      setup: {
        model: `models/${this.config.model}`,
        generationConfig: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: this.config.voice || "Kore",
              },
            },
          },
        },
        systemInstruction: {
          parts: [
            {
              text: this.config.systemInstruction || 
                "You are VBot, a helpful AI fitness coach. Keep responses brief and conversational - 1-2 sentences. Be encouraging and supportive."
            }
          ]
        },
        // Enable transcription for both input and output audio
        inputAudioTranscription: {},
        outputAudioTranscription: {},
      },
    }

    console.log("[GeminiLive] Sending setup:", JSON.stringify(setup).slice(0, 200))
    this.ws.send(JSON.stringify(setup))
  }

  private handleMessage(data: string | ArrayBuffer): void {
    try {
      if (typeof data === "string") {
        const message = JSON.parse(data)
        console.log("[GeminiLive] Received message:", Object.keys(message))

        // Handle setup complete
        if (message.setupComplete) {
          console.log("[GeminiLive] Setup complete")
          return
        }

        // Handle server content (audio/text response)
        if (message.serverContent) {
          const content = message.serverContent
          
          // Handle audio parts
          if (content.modelTurn?.parts) {
            for (const part of content.modelTurn.parts) {
              if (part.inlineData?.mimeType?.includes("audio")) {
                // Decode base64 audio and play
                const audioData = this.base64ToArrayBuffer(part.inlineData.data)
                this.callbacks.onAudioData(audioData)
              }
              if (part.text) {
                this.callbacks.onTranscript(part.text, content.turnComplete || false)
              }
            }
          }

          // Handle turn complete
          if (content.turnComplete) {
            console.log("[GeminiLive] Turn complete")
          }
        }

        // Handle tool calls if any
        if (message.toolCall) {
          console.log("[GeminiLive] Tool call received:", message.toolCall)
        }
      }
    } catch (err) {
      console.error("[GeminiLive] Error parsing message:", err)
    }
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }
    return bytes.buffer
  }

  sendAudio(audioData: ArrayBuffer): void {
    if (!this.ws || !this.isConnected) {
      console.warn("[GeminiLive] Cannot send audio - not connected")
      return
    }

    // Convert ArrayBuffer to base64
    const base64 = this.arrayBufferToBase64(audioData)
    
    const message = {
      realtimeInput: {
        mediaChunks: [
          {
            mimeType: "audio/pcm;rate=16000",
            data: base64,
          },
        ],
      },
    }

    this.ws.send(JSON.stringify(message))
  }

  sendText(text: string): void {
    if (!this.ws || !this.isConnected) {
      console.warn("[GeminiLive] Cannot send text - not connected")
      return
    }

    const message = {
      clientContent: {
        turns: [
          {
            role: "user",
            parts: [{ text }],
          },
        ],
        turnComplete: true,
      },
    }

    console.log("[GeminiLive] Sending text:", text)
    this.ws.send(JSON.stringify(message))
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer)
    let binary = ""
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
  }

  disconnect(): void {
    if (this.ws) {
      console.log("[GeminiLive] Disconnecting...")
      this.ws.close()
      this.ws = null
      this.isConnected = false
    }
  }

  get connected(): boolean {
    return this.isConnected
  }
}

/**
 * Audio worklet for processing microphone input
 * Converts audio to 16kHz PCM for Gemini Live API
 */
export function createAudioProcessor(onAudioData: (data: ArrayBuffer) => void): {
  start: () => Promise<void>
  stop: () => void
} {
  let mediaStream: MediaStream | null = null
  let audioContext: AudioContext | null = null
  let processor: ScriptProcessorNode | null = null

  const start = async () => {
    try {
      mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      })

      audioContext = new AudioContext({ sampleRate: 16000 })
      const source = audioContext.createMediaStreamSource(mediaStream)
      
      // Create script processor for audio data
      processor = audioContext.createScriptProcessor(4096, 1, 1)
      
      processor.onaudioprocess = (event) => {
        const inputData = event.inputBuffer.getChannelData(0)
        
        // Convert float32 to int16 PCM
        const pcmData = new Int16Array(inputData.length)
        for (let i = 0; i < inputData.length; i++) {
          const s = Math.max(-1, Math.min(1, inputData[i]))
          pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7fff
        }
        
        onAudioData(pcmData.buffer)
      }

      source.connect(processor)
      processor.connect(audioContext.destination)
      
      console.log("[AudioProcessor] Started")
    } catch (err) {
      console.error("[AudioProcessor] Error starting:", err)
      throw err
    }
  }

  const stop = () => {
    if (processor) {
      processor.disconnect()
      processor = null
    }
    if (audioContext) {
      audioContext.close()
      audioContext = null
    }
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop())
      mediaStream = null
    }
    console.log("[AudioProcessor] Stopped")
  }

  return { start, stop }
}

/**
 * Audio player for streaming PCM audio from Gemini
 */
export class StreamingAudioPlayer {
  private audioContext: AudioContext | null = null
  private nextStartTime = 0
  private isPlaying = false

  async play(pcmData: ArrayBuffer): Promise<void> {
    if (!this.audioContext) {
      this.audioContext = new AudioContext({ sampleRate: 24000 })
    }

    // Resume context if suspended
    if (this.audioContext.state === "suspended") {
      await this.audioContext.resume()
    }

    // Convert PCM int16 to float32
    const int16Data = new Int16Array(pcmData)
    const float32Data = new Float32Array(int16Data.length)
    for (let i = 0; i < int16Data.length; i++) {
      float32Data[i] = int16Data[i] / 32768
    }

    // Create audio buffer
    const audioBuffer = this.audioContext.createBuffer(1, float32Data.length, 24000)
    audioBuffer.getChannelData(0).set(float32Data)

    // Schedule playback
    const source = this.audioContext.createBufferSource()
    source.buffer = audioBuffer

    // Calculate start time for gapless playback
    const now = this.audioContext.currentTime
    if (this.nextStartTime < now) {
      this.nextStartTime = now
    }

    source.connect(this.audioContext.destination)
    source.start(this.nextStartTime)
    
    this.nextStartTime += audioBuffer.duration
    this.isPlaying = true

    source.onended = () => {
      if (this.nextStartTime <= this.audioContext!.currentTime) {
        this.isPlaying = false
      }
    }
  }

  stop(): void {
    if (this.audioContext) {
      this.audioContext.close()
      this.audioContext = null
    }
    this.nextStartTime = 0
    this.isPlaying = false
  }

  get playing(): boolean {
    return this.isPlaying
  }
}
