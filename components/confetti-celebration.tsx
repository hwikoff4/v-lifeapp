"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface ConfettiPiece {
  id: number
  x: number
  color: string
  delay: number
  duration: number
  rotation: number
  size: number
  shape: "circle" | "square" | "star"
}

const CONFETTI_COLORS = [
  "#FFD700", // Gold (accent)
  "#FFA500", // Orange (accent-warm)
  "#FF6B6B", // Coral
  "#4ECDC4", // Teal
  "#45B7D1", // Sky blue
  "#96CEB4", // Sage
  "#FFEAA7", // Soft yellow
  "#DDA0DD", // Plum
  "#98D8C8", // Mint
  "#F7DC6F", // Sunshine
]

function generateConfetti(count: number): ConfettiPiece[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    delay: Math.random() * 0.5,
    duration: 2 + Math.random() * 2,
    rotation: Math.random() * 720 - 360,
    size: 8 + Math.random() * 8,
    shape: ["circle", "square", "star"][Math.floor(Math.random() * 3)] as "circle" | "square" | "star",
  }))
}

function ConfettiShape({ shape, size, color }: { shape: string; size: number; color: string }) {
  if (shape === "star") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    )
  }

  if (shape === "circle") {
    return (
      <div
        style={{
          width: size,
          height: size,
          backgroundColor: color,
          borderRadius: "50%",
        }}
      />
    )
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        borderRadius: 2,
      }}
    />
  )
}

interface ConfettiCelebrationProps {
  isActive: boolean
  onComplete?: () => void
  duration?: number
}

export function ConfettiCelebration({ isActive, onComplete, duration = 4000 }: ConfettiCelebrationProps) {
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([])
  const [showCelebration, setShowCelebration] = useState(false)

  useEffect(() => {
    if (isActive) {
      setConfetti(generateConfetti(80))
      setShowCelebration(true)

      const timer = setTimeout(() => {
        setShowCelebration(false)
        onComplete?.()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [isActive, duration, onComplete])

  return (
    <AnimatePresence>
      {showCelebration && (
        <motion.div
          className="fixed inset-0 pointer-events-none overflow-hidden z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {confetti.map((piece) => (
            <motion.div
              key={piece.id}
              className="absolute"
              style={{
                left: `${piece.x}%`,
                top: -20,
              }}
              initial={{
                y: -20,
                rotate: 0,
                opacity: 1,
              }}
              animate={{
                y: "100vh",
                rotate: piece.rotation,
                opacity: [1, 1, 0],
              }}
              transition={{
                duration: piece.duration,
                delay: piece.delay,
                ease: [0.23, 0.56, 0.45, 0.96],
              }}
            >
              <ConfettiShape shape={piece.shape} size={piece.size} color={piece.color} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Celebration overlay with message
interface CelebrationModalProps {
  isOpen: boolean
  onClose: () => void
  workoutName?: string
  exerciseCount?: number
}

export function CelebrationModal({ isOpen, onClose, workoutName, exerciseCount }: CelebrationModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Confetti */}
          <ConfettiCelebration isActive={isOpen} />

          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          >
            <motion.div
              className="bg-gradient-to-br from-charcoal to-black border border-accent/30 rounded-2xl p-8 mx-4 max-w-sm w-full text-center relative overflow-hidden"
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-accent/20 via-transparent to-accent-warm/20 rounded-2xl" />

              {/* Content */}
              <div className="relative z-10">
                {/* Trophy emoji with animation */}
                <motion.div
                  className="text-6xl mb-4"
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, -10, 10, 0],
                  }}
                  transition={{
                    duration: 0.6,
                    repeat: 2,
                    repeatDelay: 0.5,
                  }}
                >
                  🏆
                </motion.div>

                <motion.h2
                  className="text-2xl font-bold text-white mb-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Workout Complete!
                </motion.h2>

                <motion.p
                  className="text-accent font-semibold text-lg mb-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {workoutName || "Great job!"}
                </motion.p>

                {exerciseCount && exerciseCount > 0 && (
                  <motion.p
                    className="text-white/70 mb-6"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    You crushed {exerciseCount} exercise{exerciseCount > 1 ? "s" : ""}! 💪
                  </motion.p>
                )}

                <motion.div
                  className="flex flex-col gap-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="flex items-center justify-center gap-2 text-sm text-white/60">
                    <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span>Added to your streak</span>
                  </div>

                  <motion.button
                    className="w-full py-3 px-6 bg-gradient-to-r from-accent to-accent-warm text-black font-semibold rounded-xl shadow-[0_0_20px_hsl(var(--accent)/0.4)]"
                    whileHover={{ scale: 1.02, boxShadow: "0 0 30px hsl(var(--accent)/0.6)" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onClose}
                  >
                    Continue
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}


