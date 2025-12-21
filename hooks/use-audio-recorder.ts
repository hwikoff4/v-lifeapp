"use client"

import { useState, useRef, useCallback, useEffect } from "react"

interface UseAudioRecorderReturn {
  isRecording: boolean
  isPaused: boolean
  recordingTime: number
  audioBlob: Blob | null
  startRecording: () => Promise<void>
  stopRecording: () => Promise<Blob | null>
  pauseRecording: () => void
  resumeRecording: () => void
  resetRecording: () => void
  isSupported: boolean
  error: string | null
}

export function useAudioRecorder(): UseAudioRecorderReturn {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSupported, setIsSupported] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Check browser support on mount
  useEffect(() => {
    const supported = typeof window !== "undefined" && 
      "mediaDevices" in navigator && 
      "getUserMedia" in navigator.mediaDevices &&
      "MediaRecorder" in window
    setIsSupported(supported)
  }, [])

  const startRecording = useCallback(async () => {
    if (!isSupported) {
      setError("Audio recording is not supported in this browser")
      return
    }

    try {
      setError(null)
      chunksRef.current = []
      setAudioBlob(null)
      setRecordingTime(0)

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      })
      streamRef.current = stream

      // Create MediaRecorder with supported MIME type
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : "audio/mp4"

      const mediaRecorder = new MediaRecorder(stream, { mimeType })
      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onerror = () => {
        setError("Recording error occurred")
        setIsRecording(false)
      }

      mediaRecorder.start(100) // Collect data every 100ms
      setIsRecording(true)
      setIsPaused(false)

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } catch (err) {
      if (err instanceof DOMException) {
        if (err.name === "NotAllowedError") {
          setError("Microphone access denied. Please allow microphone access in your browser settings.")
        } else if (err.name === "NotFoundError") {
          setError("No microphone found. Please connect a microphone and try again.")
        } else {
          setError(`Microphone error: ${err.message}`)
        }
      } else {
        setError("Failed to start recording")
      }
      console.error("[AudioRecorder] Error:", err)
    }
  }, [isSupported])

  const stopRecording = useCallback(async (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const mediaRecorder = mediaRecorderRef.current
      
      if (!mediaRecorder || mediaRecorder.state === "inactive") {
        resolve(null)
        return
      }

      mediaRecorder.onstop = () => {
        // Stop all tracks
        streamRef.current?.getTracks().forEach((track) => track.stop())
        
        // Clear timer
        if (timerRef.current) {
          clearInterval(timerRef.current)
          timerRef.current = null
        }

        // Create blob from chunks
        const blob = new Blob(chunksRef.current, { type: mediaRecorder.mimeType })
        setAudioBlob(blob)
        setIsRecording(false)
        setIsPaused(false)
        resolve(blob)
      }

      mediaRecorder.stop()
    })
  }, [])

  const pauseRecording = useCallback(() => {
    const mediaRecorder = mediaRecorderRef.current
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.pause()
      setIsPaused(true)
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [])

  const resumeRecording = useCallback(() => {
    const mediaRecorder = mediaRecorderRef.current
    if (mediaRecorder && mediaRecorder.state === "paused") {
      mediaRecorder.resume()
      setIsPaused(false)
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    }
  }, [])

  const resetRecording = useCallback(() => {
    // Stop if still recording
    if (mediaRecorderRef.current?.state !== "inactive") {
      mediaRecorderRef.current?.stop()
    }
    
    // Clean up stream
    streamRef.current?.getTracks().forEach((track) => track.stop())
    
    // Clear timer
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    // Reset state
    chunksRef.current = []
    setAudioBlob(null)
    setRecordingTime(0)
    setIsRecording(false)
    setIsPaused(false)
    setError(null)
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop())
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  return {
    isRecording,
    isPaused,
    recordingTime,
    audioBlob,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    resetRecording,
    isSupported,
    error,
  }
}
