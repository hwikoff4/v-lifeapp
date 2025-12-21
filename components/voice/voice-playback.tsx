"use client"

import { useState, useCallback, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Volume2, VolumeX, Loader2, RotateCcw } from "lucide-react"
import { useAudioPlayer } from "@/hooks/use-audio-player"
import { cn } from "@/lib/utils"
import type { GeminiVoiceName } from "@/lib/types"

interface VoicePlaybackProps {
  text: string
  voice?: GeminiVoiceName
  autoPlay?: boolean
  onPlayStart?: () => void
  onPlayEnd?: () => void
  className?: string
  size?: "sm" | "md"
}

export function VoicePlayback({
  text,
  voice = "Kore",
  autoPlay = false,
  onPlayStart,
  onPlayEnd,
  className,
  size = "sm",
}: VoicePlaybackProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)

  const { isPlaying, play, stop, error: playerError } = useAudioPlayer()

  // Fetch audio from TTS API
  const fetchAudio = useCallback(async (): Promise<Blob | null> => {
    try {
      setIsLoading(true)
      setHasError(false)
      
      console.log("[VoicePlayback] Fetching TTS for text:", text.slice(0, 50))
      console.log("[VoicePlayback] Starting fetch request...")

      const controller = new AbortController()
      const timeoutId = setTimeout(() => {
        console.log("[VoicePlayback] Request timeout after 30s")
        controller.abort()
      }, 30000)

      const response = await fetch("/api/vbot-tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      console.log("[VoicePlayback] Response received, status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("[VoicePlayback] TTS response error:", response.status, errorText)
        throw new Error(`TTS request failed: ${response.status}`)
      }

      console.log("[VoicePlayback] Reading blob...")
      const blob = await response.blob()
      console.log("[VoicePlayback] TTS audio received, type:", blob.type, "size:", blob.size)
      setAudioBlob(blob)
      return blob
    } catch (err) {
      console.error("[VoicePlayback] TTS error:", err)
      setHasError(true)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [text, voice])

  // Handle play button click
  const handlePlay = useCallback(async () => {
    if (isPlaying) {
      stop()
      onPlayEnd?.()
      return
    }

    onPlayStart?.()

    // Use cached audio if available
    let blob = audioBlob
    if (!blob) {
      blob = await fetchAudio()
    }

    if (blob) {
      await play(blob)
    }
  }, [isPlaying, stop, audioBlob, fetchAudio, play, onPlayStart, onPlayEnd])

  // Handle retry after error
  const handleRetry = useCallback(async () => {
    setAudioBlob(null)
    const blob = await fetchAudio()
    if (blob) {
      await play(blob)
    }
  }, [fetchAudio, play])

  // Auto-play when autoPlay becomes true (e.g., after streaming completes)
  useEffect(() => {
    if (autoPlay && text) {
      console.log("[VoicePlayback] Auto-play triggered, text length:", text.length)
      // Small delay to ensure all state is settled
      const timer = setTimeout(() => {
        handlePlay()
      }, 100)
      return () => clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlay, text])

  // Notify when playback ends
  useEffect(() => {
    if (!isPlaying && audioBlob) {
      onPlayEnd?.()
    }
  }, [isPlaying, audioBlob, onPlayEnd])

  const iconSize = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"
  const buttonSize = size === "sm" ? "h-6 w-6" : "h-8 w-8"

  const showError = hasError || playerError

  return (
    <div className={cn("relative inline-flex", className)}>
      <motion.button
        type="button"
        onClick={showError ? handleRetry : handlePlay}
        disabled={isLoading}
        className={cn(
          "flex items-center justify-center rounded-full transition-all",
          buttonSize,
          isPlaying
            ? "bg-accent/20 text-accent"
            : showError
              ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
              : "bg-white/10 text-white/50 hover:bg-white/20 hover:text-white/70",
          isLoading && "opacity-50 cursor-wait"
        )}
        whileTap={{ scale: 0.9 }}
        title={showError ? "Retry" : isPlaying ? "Stop" : "Play audio"}
      >
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <Loader2 className={cn(iconSize, "animate-spin")} />
            </motion.div>
          ) : showError ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <RotateCcw className={iconSize} />
            </motion.div>
          ) : isPlaying ? (
            <motion.div
              key="playing"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <VolumeX className={iconSize} />
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <Volume2 className={iconSize} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Playing indicator animation */}
      <AnimatePresence>
        {isPlaying && (
          <motion.div
            className="absolute -inset-1 rounded-full border border-accent/30"
            initial={{ scale: 1, opacity: 0.6 }}
            animate={{ scale: 1.3, opacity: 0 }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
