"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { useAudioRecorder } from "@/hooks/use-audio-recorder"
import { useAudioPlayer } from "@/hooks/use-audio-player"
import type { GeminiVoiceName } from "@/lib/types"

export type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking' | 'error'

interface Message {
  role: "user" | "assistant"
  content: string
}

interface UseVoiceConversationOptions {
  voice?: GeminiVoiceName
  conversationId?: string | null
  onConversationIdChange?: (id: string) => void
  onMessagesUpdate?: (messages: Message[]) => void
}

interface UseVoiceConversationReturn {
  state: VoiceState
  userTranscript: string
  assistantResponse: string
  error: string | null
  messages: Message[]
  startListening: () => Promise<void>
  stopListening: () => Promise<void>
  cancelConversation: () => void
  isRecording: boolean
  recordingTime: number
}

export function useVoiceConversation({
  voice = "Kore",
  conversationId,
  onConversationIdChange,
  onMessagesUpdate,
}: UseVoiceConversationOptions): UseVoiceConversationReturn {
  const [state, setState] = useState<VoiceState>('idle')
  const [userTranscript, setUserTranscript] = useState("")
  const [assistantResponse, setAssistantResponse] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  
  const abortControllerRef = useRef<AbortController | null>(null)
  const conversationIdRef = useRef<string | null>(conversationId || null)

  const {
    isRecording,
    recordingTime,
    startRecording,
    stopRecording,
    resetRecording,
    isSupported,
    error: recorderError,
  } = useAudioRecorder()

  const { isPlaying, play, stop, error: playerError } = useAudioPlayer()

  // Sync conversation ID
  useEffect(() => {
    conversationIdRef.current = conversationId || null
  }, [conversationId])

  // Handle recorder errors
  useEffect(() => {
    if (recorderError) {
      setState('error')
      setError(recorderError)
    }
  }, [recorderError])

  // Handle player errors
  useEffect(() => {
    if (playerError) {
      setState('error')
      setError(playerError)
    }
  }, [playerError])

  // When playback ends, auto-resume listening
  useEffect(() => {
    if (state === 'speaking' && !isPlaying) {
      // Wait 500ms then auto-resume
      const timer = setTimeout(() => {
        setState('idle')
        setUserTranscript("")
        setAssistantResponse("")
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [state, isPlaying])

  const handleSTT = async (audioBlob: Blob): Promise<string | null> => {
    try {
      console.log(`[VoiceConversation] 🎙️ STT request for ${audioBlob.size} byte audio`)
      
      const formData = new FormData()
      formData.append("audio", audioBlob, "recording.webm")

      const startFetch = Date.now()
      const response = await fetch("/api/vbot-stt", {
        method: "POST",
        body: formData,
      })

      const fetchDuration = Date.now() - startFetch
      console.log(`[VoiceConversation] 🎙️ STT fetch took ${fetchDuration}ms, status: ${response.status}`)

      if (!response.ok) {
        throw new Error("Transcription failed")
      }

      const { transcript } = await response.json()
      return transcript?.trim() || null
    } catch (err) {
      console.error("[VoiceConversation] STT error:", err)
      throw err
    }
  }

  const handleChat = async (userMessage: string): Promise<string> => {
    try {
      console.log(`[VoiceConversation] 💬 Chat request with message: "${userMessage.slice(0, 50)}..."`)
      const startTime = Date.now()
      
      // Get auth token
      const { createClient } = await import("@/lib/supabase/client")
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        throw new Error("Not authenticated")
      }

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const currentConversationId = conversationIdRef.current

      // Build message history
      const messageHistory = [
        ...messages,
        { role: "user" as const, content: userMessage }
      ]

      abortControllerRef.current = new AbortController()

      const fetchStart = Date.now()
      const response = await fetch(
        `${supabaseUrl}/functions/v1/vbot`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            messages: messageHistory,
            conversationId: currentConversationId,
          }),
          signal: abortControllerRef.current.signal,
        }
      )

      const fetchDuration = Date.now() - fetchStart
      console.log(`[VoiceConversation] 💬 Chat fetch took ${fetchDuration}ms, status: ${response.status}`)

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Chat error: ${response.status} - ${errorText}`)
      }

      // Get conversation ID from header
      const newConversationId = response.headers.get("X-Conversation-Id")
      if (newConversationId && newConversationId !== currentConversationId) {
        conversationIdRef.current = newConversationId
        onConversationIdChange?.(newConversationId)
      }

      // Read streaming response
      const reader = response.body?.getReader()
      if (!reader) throw new Error("No response body")

      const decoder = new TextDecoder()
      let fullResponse = ""
      let firstChunkTime = 0
      let chunkCount = 0

      const streamStart = Date.now()
      
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        if (chunkCount === 0) {
          firstChunkTime = Date.now() - streamStart
          console.log(`[VoiceConversation] 💬 First chunk received in ${firstChunkTime}ms`)
        }
        chunkCount++

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split("\n")

        for (const line of lines) {
          if (line.startsWith("0:")) {
            try {
              const text = JSON.parse(line.slice(2))
              fullResponse += text
              setAssistantResponse(fullResponse)
            } catch {
              // Ignore parse errors
            }
          }
        }
      }

      const streamDuration = Date.now() - streamStart
      const totalDuration = Date.now() - startTime
      console.log(`[VoiceConversation] 💬 Streaming complete in ${streamDuration}ms (${chunkCount} chunks, first chunk: ${firstChunkTime}ms)`)
      console.log(`[VoiceConversation] 💬 Total chat time: ${totalDuration}ms, response length: ${fullResponse.length}`)

      return fullResponse
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        throw new Error("Request cancelled")
      }
      console.error("[VoiceConversation] Chat error:", err)
      throw err
    }
  }

  const handleTTS = async (text: string): Promise<Blob> => {
    try {
      console.log(`[VoiceConversation] 🎤 TTS request for ${text.length} characters`)
      const startFetch = Date.now()
      
      const response = await fetch("/api/vbot-tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice }),
      })

      const fetchDuration = Date.now() - startFetch
      console.log(`[VoiceConversation] 🎤 TTS fetch took ${fetchDuration}ms, status: ${response.status}`)

      if (!response.ok) {
        throw new Error(`TTS failed: ${response.status}`)
      }

      const blobStart = Date.now()
      const blob = await response.blob()
      const blobDuration = Date.now() - blobStart
      
      console.log(`[VoiceConversation] 🎤 TTS blob read took ${blobDuration}ms, size: ${blob.size} bytes`)
      
      return blob
    } catch (err) {
      console.error("[VoiceConversation] TTS error:", err)
      throw err
    }
  }

  const startListening = useCallback(async () => {
    if (!isSupported) {
      setError("Microphone not supported")
      setState('error')
      return
    }

    setError(null)
    setUserTranscript("")
    setAssistantResponse("")
    setState('listening')
    await startRecording()
  }, [isSupported, startRecording])

  const stopListening = useCallback(async () => {
    if (state !== 'listening') return

    setState('processing')
    const audioBlob = await stopRecording()

    if (!audioBlob || audioBlob.size === 0) {
      setState('error')
      setError("No audio recorded")
      return
    }

    try {
      const startTime = Date.now()
      
      // Step 1: STT
      console.log("[VoiceConversation] ⏱️ Starting STT...")
      const sttStart = Date.now()
      const transcript = await handleSTT(audioBlob)
      const sttDuration = Date.now() - sttStart
      
      if (!transcript) {
        setState('error')
        setError("Could not transcribe audio")
        return
      }

      console.log(`[VoiceConversation] ✅ STT complete in ${sttDuration}ms`)
      console.log("[VoiceConversation] 📝 Transcript:", transcript)
      setUserTranscript(transcript)

      // Update messages with user input
      const newMessages = [...messages, { role: "user" as const, content: transcript }]
      setMessages(newMessages)
      onMessagesUpdate?.(newMessages)

      // Step 2: Chat
      console.log("[VoiceConversation] ⏱️ Sending to chat...")
      const chatStart = Date.now()
      const response = await handleChat(transcript)
      const chatDuration = Date.now() - chatStart
      
      if (!response) {
        setState('error')
        setError("No response from AI")
        return
      }

      console.log(`[VoiceConversation] ✅ Chat complete in ${chatDuration}ms`)
      console.log("[VoiceConversation] 💬 Response received (length: ${response.length}):", response.slice(0, 100))

      // Update messages with assistant response
      const finalMessages = [...newMessages, { role: "assistant" as const, content: response }]
      setMessages(finalMessages)
      onMessagesUpdate?.(finalMessages)

      // Step 3: TTS
      console.log("[VoiceConversation] ⏱️ Generating audio...")
      setState('speaking')
      const ttsStart = Date.now()
      const audioBlob2 = await handleTTS(response)
      const ttsDuration = Date.now() - ttsStart
      
      console.log(`[VoiceConversation] ✅ TTS complete in ${ttsDuration}ms`)
      
      // Play audio
      console.log("[VoiceConversation] 🔊 Playing audio...")
      const playStart = Date.now()
      await play(audioBlob2)
      const playDuration = Date.now() - playStart
      
      const totalDuration = Date.now() - startTime
      console.log(`[VoiceConversation] ✅ Playback complete in ${playDuration}ms`)
      console.log(`[VoiceConversation] 📊 Total pipeline: ${totalDuration}ms (STT: ${sttDuration}ms, Chat: ${chatDuration}ms, TTS: ${ttsDuration}ms, Play: ${playDuration}ms)`)
      
    } catch (err) {
      console.error("[VoiceConversation] ❌ Pipeline error:", err)
      setState('error')
      setError(err instanceof Error ? err.message : "Something went wrong")
    }
  }, [state, stopRecording, messages, voice, onMessagesUpdate, play])

  const cancelConversation = useCallback(() => {
    // Abort any ongoing requests
    abortControllerRef.current?.abort()
    
    // Stop recording if active
    if (isRecording) {
      resetRecording()
    }
    
    // Stop playback if active
    if (isPlaying) {
      stop()
    }
    
    // Reset state
    setState('idle')
    setUserTranscript("")
    setAssistantResponse("")
    setError(null)
  }, [isRecording, isPlaying, resetRecording, stop])

  return {
    state,
    userTranscript,
    assistantResponse,
    error,
    messages,
    startListening,
    stopListening,
    cancelConversation,
    isRecording,
    recordingTime,
  }
}
