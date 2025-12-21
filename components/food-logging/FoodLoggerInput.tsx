"use client"

import { useState, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Mic, MicOff, Camera, Send, Loader2, X, Sparkles, ChevronDown } from "lucide-react"
import { useAudioRecorder } from "@/hooks/use-audio-recorder"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import type { ParsedFood, FoodParseResult } from "@/lib/actions/food-logging"

interface FoodLoggerInputProps {
  selectedDate: string // ISO date string
  onParseComplete: (result: FoodParseResult, originalInput: string, inputType: "text" | "voice" | "image") => void
  onParseStart?: () => void
  disabled?: boolean
  className?: string
}

const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snack"] as const
type MealType = typeof MEAL_TYPES[number]

export function FoodLoggerInput({ 
  selectedDate, 
  onParseComplete, 
  onParseStart,
  disabled, 
  className 
}: FoodLoggerInputProps) {
  const [input, setInput] = useState("")
  const [isParsing, setIsParsing] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [mealTypeOverride, setMealTypeOverride] = useState<MealType | null>(null)
  const [showMealTypeDropdown, setShowMealTypeDropdown] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { toast } = useToast()

  const {
    isRecording,
    recordingTime,
    startRecording,
    stopRecording,
    resetRecording,
    isSupported: isVoiceSupported,
    error: recorderError,
  } = useAudioRecorder()

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleSubmit = useCallback(async (
    inputText: string, 
    inputType: "text" | "voice" | "image" = "text",
    imageData?: string
  ) => {
    if (!inputText.trim() && !imageData) return

    setIsParsing(true)
    onParseStart?.()

    try {
      const { parseFood } = await import("@/lib/actions/food-logging")
      const result = await parseFood(
        inputText,
        inputType,
        imageData,
        mealTypeOverride || undefined,
        selectedDate
      )

      if (result.success && result.foods.length > 0) {
        onParseComplete(result, inputText, inputType)
        setInput("")
        setMealTypeOverride(null)
      } else {
        toast({
          title: "Couldn't parse food",
          description: result.error || "Try describing your food differently",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[FoodLogger] Parse error:", error)
      toast({
        title: "Error",
        description: "Failed to analyze food. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsParsing(false)
    }
  }, [mealTypeOverride, selectedDate, onParseComplete, onParseStart, toast])

  const handleTextSubmit = useCallback(() => {
    handleSubmit(input, "text")
  }, [input, handleSubmit])

  const handleVoiceToggle = useCallback(async () => {
    if (isRecording) {
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
            // Parse the transcribed text
            await handleSubmit(transcript.trim(), "voice")
          } else {
            toast({
              title: "No speech detected",
              description: "Please try speaking again",
              variant: "destructive",
            })
          }
        } catch (err) {
          console.error("[FoodLogger] Transcription error:", err)
          toast({
            title: "Transcription failed",
            description: "Please try again or type your food",
            variant: "destructive",
          })
        } finally {
          setIsTranscribing(false)
        }
      }
    } else {
      await startRecording()
    }
  }, [isRecording, stopRecording, startRecording, handleSubmit, toast])

  const handleImageCapture = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      // Convert to base64
      const reader = new FileReader()
      reader.onload = async () => {
        const base64 = (reader.result as string).split(",")[1]
        await handleSubmit("Analyze this food image", "image", base64)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error("[FoodLogger] Image error:", error)
      toast({
        title: "Image error",
        description: "Failed to process image. Please try again.",
        variant: "destructive",
      })
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }, [handleSubmit, toast])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleTextSubmit()
    }
  }, [handleTextSubmit])

  const isProcessing = isParsing || isTranscribing || isRecording

  return (
    <div className={cn("relative", className)}>
      {/* Main input container */}
      <div className="rounded-2xl border border-white/10 bg-black/50 backdrop-blur-sm overflow-hidden">
        {/* Meal type selector */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-accent" />
            <span className="text-xs font-medium text-white/70">AI Food Logger</span>
          </div>
          
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMealTypeDropdown(!showMealTypeDropdown)}
              className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-white/5 hover:bg-white/10 text-white/70 transition-colors"
            >
              {mealTypeOverride || "Auto-detect meal"}
              <ChevronDown className="h-3 w-3" />
            </button>
            
            <AnimatePresence>
              {showMealTypeDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="absolute right-0 top-full mt-1 z-10 rounded-lg border border-white/10 bg-charcoal/95 backdrop-blur-sm shadow-lg overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setMealTypeOverride(null)
                      setShowMealTypeDropdown(false)
                    }}
                    className={cn(
                      "block w-full px-3 py-2 text-left text-xs hover:bg-white/5 transition-colors",
                      !mealTypeOverride ? "text-accent" : "text-white/70"
                    )}
                  >
                    Auto-detect
                  </button>
                  {MEAL_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        setMealTypeOverride(type)
                        setShowMealTypeDropdown(false)
                      }}
                      className={cn(
                        "block w-full px-3 py-2 text-left text-xs hover:bg-white/5 transition-colors",
                        mealTypeOverride === type ? "text-accent" : "text-white/70"
                      )}
                    >
                      {type}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Text input area */}
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="What did you eat? (e.g., '2 eggs with toast and coffee')"
            rows={2}
            disabled={isProcessing || disabled}
            className="w-full resize-none bg-transparent px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none disabled:opacity-50"
          />
          
          {/* Recording indicator overlay */}
          <AnimatePresence>
            {isRecording && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center bg-black/80"
              >
                <div className="flex items-center gap-3">
                  <motion.div
                    className="h-3 w-3 rounded-full bg-red-500"
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                  <span className="text-sm font-medium text-white">{formatTime(recordingTime)}</span>
                  <button
                    type="button"
                    onClick={resetRecording}
                    className="p-1 rounded-full hover:bg-white/10"
                  >
                    <X className="h-4 w-4 text-white/70" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Processing overlay */}
          <AnimatePresence>
            {(isParsing || isTranscribing) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center bg-black/80"
              >
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin text-accent" />
                  <span className="text-sm text-white/70">
                    {isTranscribing ? "Transcribing..." : "Analyzing food..."}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between px-3 py-2 border-t border-white/5">
          <div className="flex items-center gap-2">
            {/* Voice button */}
            {isVoiceSupported && (
              <motion.button
                type="button"
                onClick={handleVoiceToggle}
                disabled={isParsing || isTranscribing || disabled}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full transition-colors",
                  isRecording
                    ? "bg-red-500 text-white"
                    : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                )}
              >
                {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </motion.button>
            )}

            {/* Camera button */}
            <motion.button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing || disabled}
              whileTap={{ scale: 0.95 }}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-colors"
            >
              <Camera className="h-4 w-4" />
            </motion.button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageCapture}
              className="hidden"
            />
          </div>

          {/* Submit button */}
          <motion.button
            type="button"
            onClick={handleTextSubmit}
            disabled={!input.trim() || isProcessing || disabled}
            whileTap={{ scale: 0.95 }}
            className={cn(
              "flex h-9 items-center gap-2 px-4 rounded-full font-medium text-sm transition-colors",
              input.trim() && !isProcessing
                ? "bg-accent text-black hover:bg-accent/90"
                : "bg-white/5 text-white/30 cursor-not-allowed"
            )}
          >
            <Send className="h-4 w-4" />
            Log
          </motion.button>
        </div>
      </div>

      {/* Helper text */}
      <p className="mt-2 text-center text-xs text-white/40">
        Describe food in natural language, use voice, or snap a photo
      </p>
    </div>
  )
}
