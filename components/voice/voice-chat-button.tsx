"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Mic, MicOff, Loader2, X } from "lucide-react"
import { useAudioRecorder } from "@/hooks/use-audio-recorder"
import { cn } from "@/lib/utils"

interface VoiceChatButtonProps {
  onTranscript: (transcript: string) => void
  disabled?: boolean
  className?: string
}

export function VoiceChatButton({ onTranscript, disabled, className }: VoiceChatButtonProps) {
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [showError, setShowError] = useState(false)

  const {
    isRecording,
    recordingTime,
    startRecording,
    stopRecording,
    resetRecording,
    isSupported,
    error: recorderError,
  } = useAudioRecorder()

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleToggleRecording = useCallback(async () => {
    if (isRecording) {
      // Stop recording and transcribe
      const audioBlob = await stopRecording()
      
      if (audioBlob && audioBlob.size > 0) {
        setIsTranscribing(true)
        
        try {
          const formData = new FormData()
          formData.append("audio", audioBlob, "recording.webm")

          const response = await fetch("/api/vbot-stt", {
            method: "POST",
            body: formData,
          })

          if (!response.ok) {
            throw new Error("Transcription failed")
          }

          const { transcript } = await response.json()
          
          if (transcript && transcript.trim()) {
            onTranscript(transcript.trim())
          }
        } catch (err) {
          console.error("[VoiceChat] Transcription error:", err)
          setShowError(true)
          setTimeout(() => setShowError(false), 3000)
        } finally {
          setIsTranscribing(false)
        }
      }
    } else {
      // Start recording
      await startRecording()
    }
  }, [isRecording, stopRecording, startRecording, onTranscript])

  const handleCancel = useCallback(() => {
    resetRecording()
  }, [resetRecording])

  if (!isSupported) {
    return null // Don't show button if not supported
  }

  const error = recorderError || (showError ? "Failed to transcribe. Please try again." : null)

  return (
    <div className={cn("relative", className)}>
      {/* Recording indicator */}
      <AnimatePresence>
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full bg-red-500/90 px-3 py-1.5 text-xs font-medium text-white shadow-lg backdrop-blur-sm"
          >
            <motion.div
              className="h-2 w-2 rounded-full bg-white"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            <span>{formatTime(recordingTime)}</span>
            <button
              onClick={handleCancel}
              className="ml-1 rounded-full p-0.5 hover:bg-white/20"
            >
              <X className="h-3 w-3" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-red-500/90 px-3 py-1.5 text-xs text-white shadow-lg"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main button */}
      <motion.button
        type="button"
        onClick={handleToggleRecording}
        disabled={disabled || isTranscribing}
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-full transition-all",
          isRecording
            ? "bg-red-500 text-white shadow-lg shadow-red-500/30"
            : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white",
          (disabled || isTranscribing) && "opacity-50 cursor-not-allowed"
        )}
        whileTap={{ scale: 0.95 }}
      >
        {isTranscribing ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : isRecording ? (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <MicOff className="h-5 w-5" />
          </motion.div>
        ) : (
          <Mic className="h-5 w-5" />
        )}
      </motion.button>

      {/* Pulsing ring when recording */}
      <AnimatePresence>
        {isRecording && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-red-500"
            initial={{ scale: 1, opacity: 0.8 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
