"use client"

import { motion } from "framer-motion"
import { Mic, Loader2, Volume2, AlertCircle } from "lucide-react"
import type { VoiceState } from "@/hooks/use-voice-conversation"
import { cn } from "@/lib/utils"

interface VoiceOrbProps {
  state: VoiceState
  className?: string
}

export function VoiceOrb({ state, className }: VoiceOrbProps) {
  const getStateConfig = () => {
    switch (state) {
      case 'listening':
        return {
          icon: Mic,
          color: 'from-green-500 to-emerald-600',
          ringColor: 'border-green-400',
          pulseColor: 'rgba(34, 197, 94, 0.3)',
          label: 'Listening...',
        }
      case 'processing':
        return {
          icon: Loader2,
          color: 'from-blue-500 to-blue-600',
          ringColor: 'border-blue-400',
          pulseColor: 'rgba(59, 130, 246, 0.3)',
          label: 'Processing...',
        }
      case 'speaking':
        return {
          icon: Volume2,
          color: 'from-accent to-yellow-600',
          ringColor: 'border-accent',
          pulseColor: 'rgba(234, 179, 8, 0.3)',
          label: 'Speaking...',
        }
      case 'error':
        return {
          icon: AlertCircle,
          color: 'from-red-500 to-red-600',
          ringColor: 'border-red-400',
          pulseColor: 'rgba(239, 68, 68, 0.3)',
          label: 'Error',
        }
      default:
        return {
          icon: Mic,
          color: 'from-white/20 to-white/10',
          ringColor: 'border-white/20',
          pulseColor: 'rgba(255, 255, 255, 0.1)',
          label: 'Tap to speak',
        }
    }
  }

  const config = getStateConfig()
  const Icon = config.icon

  return (
    <div className={cn("relative flex flex-col items-center gap-6", className)}>
      {/* Main Orb Container */}
      <div className="relative flex items-center justify-center">
        {/* Pulsing rings for active states */}
        {(state === 'listening' || state === 'speaking') && (
          <>
            <motion.div
              className={cn("absolute rounded-full border-2", config.ringColor)}
              style={{ width: 200, height: 200 }}
              initial={{ scale: 0.8, opacity: 0.6 }}
              animate={{ scale: 1.4, opacity: 0 }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
            />
            <motion.div
              className={cn("absolute rounded-full border-2", config.ringColor)}
              style={{ width: 200, height: 200 }}
              initial={{ scale: 0.8, opacity: 0.6 }}
              animate={{ scale: 1.4, opacity: 0 }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
            />
          </>
        )}

        {/* Main Orb */}
        <motion.div
          className={cn(
            "relative z-10 flex h-40 w-40 items-center justify-center rounded-full bg-gradient-to-br shadow-2xl",
            config.color
          )}
          animate={{
            scale: state === 'listening' ? [1, 1.05, 1] : 1,
            boxShadow: [
              `0 20px 60px -15px ${config.pulseColor}`,
              `0 20px 80px -10px ${config.pulseColor}`,
              `0 20px 60px -15px ${config.pulseColor}`,
            ],
          }}
          transition={{
            scale: {
              duration: 1.5,
              repeat: state === 'listening' ? Infinity : 0,
              ease: "easeInOut",
            },
            boxShadow: {
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            },
          }}
        >
          {/* Icon */}
          {state === 'processing' ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Icon className="h-16 w-16 text-white drop-shadow-lg" />
            </motion.div>
          ) : (
            <Icon className="h-16 w-16 text-white drop-shadow-lg" />
          )}

          {/* Inner glow for active states */}
          {(state === 'listening' || state === 'speaking') && (
            <motion.div
              className="absolute inset-0 rounded-full bg-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.2, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
        </motion.div>

        {/* Listening: Audio bars visualization */}
        {state === 'listening' && (
          <div className="absolute bottom-0 flex items-end gap-1.5">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="w-1 rounded-full bg-white/60"
                initial={{ height: 8 }}
                animate={{ height: [8, 24, 8] }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.1,
                }}
              />
            ))}
          </div>
        )}

        {/* Speaking: Sound waves */}
        {state === 'speaking' && (
          <div className="absolute flex gap-2">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className={cn("h-1 w-1 rounded-full", "bg-white/80")}
                animate={{
                  scale: [1, 2, 1],
                  opacity: [0.4, 1, 0.4],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.2,
                }}
                style={{
                  marginLeft: i === 0 ? 0 : -4,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* State Label */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        key={state}
      >
        <p className="text-xl font-semibold text-white">{config.label}</p>
      </motion.div>
    </div>
  )
}
