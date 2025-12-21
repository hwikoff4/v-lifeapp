"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { VoiceOrb } from "@/components/voice/voice-orb"
import { useVoiceConversation } from "@/hooks/use-voice-conversation"
import type { GeminiVoiceName } from "@/lib/types"
import { cn } from "@/lib/utils"

interface VoiceConversationModalProps {
  isOpen: boolean
  onClose: () => void
  voice?: GeminiVoiceName
  conversationId?: string | null
  onConversationIdChange?: (id: string) => void
  onMessagesUpdate?: (messages: Array<{ role: "user" | "assistant"; content: string }>) => void
}

export function VoiceConversationModal({
  isOpen,
  onClose,
  voice = "Kore",
  conversationId,
  onConversationIdChange,
  onMessagesUpdate,
}: VoiceConversationModalProps) {
  const {
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
  } = useVoiceConversation({
    voice,
    conversationId,
    onConversationIdChange,
    onMessagesUpdate,
  })

  const handleClose = () => {
    cancelConversation()
    onClose()
  }

  const handleOrbClick = async () => {
    if (state === 'idle') {
      await startListening()
    } else if (state === 'listening') {
      await stopListening()
    }
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Background effects */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -left-[25%] -top-[25%] h-[50%] w-[50%] rounded-full bg-accent/10 blur-[120px]" />
            <div className="absolute -bottom-[25%] -right-[25%] h-[50%] w-[50%] rounded-full bg-green-500/10 blur-[120px]" />
          </div>

          {/* Close button */}
          <motion.button
            className="absolute right-6 top-6 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
            onClick={handleClose}
            whileTap={{ scale: 0.9 }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <X className="h-6 w-6" />
          </motion.button>

          {/* Main content */}
          <div className="relative z-10 flex h-full w-full max-w-md flex-col items-center justify-center px-6 py-12">
            {/* Voice Orb */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="mb-12"
            >
              <button
                onClick={handleOrbClick}
                disabled={state === 'processing' || state === 'speaking'}
                className={cn(
                  "cursor-pointer outline-none transition-opacity",
                  (state === 'processing' || state === 'speaking') && "cursor-not-allowed opacity-50"
                )}
              >
                <VoiceOrb state={state} />
              </button>
            </motion.div>

            {/* Recording timer */}
            {isRecording && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 flex items-center gap-2 rounded-full bg-green-500/20 px-4 py-2 text-sm font-medium text-green-400"
              >
                <motion.div
                  className="h-2 w-2 rounded-full bg-green-400"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                />
                <span>{formatTime(recordingTime)}</span>
              </motion.div>
            )}

            {/* Transcription area */}
            <div className="w-full flex-1 space-y-6 overflow-y-auto">
              {/* User transcript */}
              <AnimatePresence>
                {userTranscript && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="w-full"
                  >
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/40">
                      You said
                    </p>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                      <p className="text-base leading-relaxed text-white">{userTranscript}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Assistant response */}
              <AnimatePresence>
                {assistantResponse && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="w-full"
                  >
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-accent/70">
                      VBot
                    </p>
                    <div className="rounded-2xl border border-accent/20 bg-accent/5 p-4 backdrop-blur-sm">
                      <p className="text-base leading-relaxed text-white">{assistantResponse}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="w-full"
                  >
                    <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 backdrop-blur-sm">
                      <p className="text-sm leading-relaxed text-red-400">{error}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Hint text */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-8 text-center"
            >
              {state === 'idle' && (
                <p className="text-sm text-white/50">Tap the orb to start speaking</p>
              )}
              {state === 'listening' && (
                <p className="text-sm text-white/50">Tap again when you're done</p>
              )}
              {state === 'speaking' && (
                <p className="text-sm text-white/50">I'll be ready to listen again in a moment</p>
              )}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
