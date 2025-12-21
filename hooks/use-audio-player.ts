"use client"

import { useState, useRef, useCallback, useEffect } from "react"

interface UseAudioPlayerReturn {
  isPlaying: boolean
  isLoading: boolean
  currentTime: number
  duration: number
  error: string | null
  play: (audioSource: string | Blob) => Promise<void>
  pause: () => void
  stop: () => void
  seek: (time: number) => void
  setVolume: (volume: number) => void
}

export function useAudioPlayer(): UseAudioPlayerReturn {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const objectUrlRef = useRef<string | null>(null)

  // Create audio element on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      audioRef.current = new Audio()
      
      const audio = audioRef.current
      
      audio.addEventListener("loadedmetadata", () => {
        setDuration(audio.duration)
        setIsLoading(false)
      })

      audio.addEventListener("timeupdate", () => {
        setCurrentTime(audio.currentTime)
      })

      audio.addEventListener("ended", () => {
        setIsPlaying(false)
        setCurrentTime(0)
      })

      audio.addEventListener("error", () => {
        setError("Failed to load audio")
        setIsPlaying(false)
        setIsLoading(false)
      })

      audio.addEventListener("play", () => {
        setIsPlaying(true)
      })

      audio.addEventListener("pause", () => {
        setIsPlaying(false)
      })
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ""
      }
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current)
      }
    }
  }, [])

  const play = useCallback(async (audioSource: string | Blob) => {
    const audio = audioRef.current
    if (!audio) {
      console.error("[AudioPlayer] No audio element")
      return
    }

    try {
      setError(null)
      setIsLoading(true)

      // Revoke previous object URL if exists
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current)
        objectUrlRef.current = null
      }

      // Set source based on type
      if (audioSource instanceof Blob) {
        console.log("[AudioPlayer] Playing blob, type:", audioSource.type, "size:", audioSource.size)
        objectUrlRef.current = URL.createObjectURL(audioSource)
        audio.src = objectUrlRef.current
      } else {
        console.log("[AudioPlayer] Playing URL:", audioSource.slice(0, 50))
        audio.src = audioSource
      }

      // Load and play
      await audio.load()
      console.log("[AudioPlayer] Audio loaded, playing...")
      await audio.play()
      console.log("[AudioPlayer] Playback started")
    } catch (err) {
      console.error("[AudioPlayer] Play error:", err)
      setError("Failed to play audio")
      setIsPlaying(false)
      setIsLoading(false)
    }
  }, [])

  const pause = useCallback(() => {
    audioRef.current?.pause()
  }, [])

  const stop = useCallback(() => {
    const audio = audioRef.current
    if (audio) {
      audio.pause()
      audio.currentTime = 0
      setCurrentTime(0)
      setIsPlaying(false)
    }
  }, [])

  const seek = useCallback((time: number) => {
    const audio = audioRef.current
    if (audio && !isNaN(time)) {
      audio.currentTime = Math.max(0, Math.min(time, audio.duration || 0))
    }
  }, [])

  const setVolume = useCallback((volume: number) => {
    const audio = audioRef.current
    if (audio) {
      audio.volume = Math.max(0, Math.min(1, volume))
    }
  }, [])

  return {
    isPlaying,
    isLoading,
    currentTime,
    duration,
    error,
    play,
    pause,
    stop,
    seek,
    setVolume,
  }
}
