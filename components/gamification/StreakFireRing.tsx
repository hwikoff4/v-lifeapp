"use client"

import { motion } from "framer-motion"
import { Flame } from "lucide-react"
import { cn } from "@/lib/utils"

interface StreakFireRingProps {
  streakDays: number
  className?: string
  size?: "sm" | "md" | "lg"
}

// Streak milestones for visual intensity
const getStreakIntensity = (days: number): { 
  flames: number
  glowIntensity: string
  ringColor: string
  message: string
} => {
  if (days >= 30) {
    return {
      flames: 5,
      glowIntensity: "shadow-[0_0_40px_rgba(255,100,0,0.7)]",
      ringColor: "from-orange-500 via-red-500 to-yellow-500",
      message: "Legendary! 🔥"
    }
  }
  if (days >= 14) {
    return {
      flames: 4,
      glowIntensity: "shadow-[0_0_30px_rgba(255,150,0,0.6)]",
      ringColor: "from-orange-400 via-red-400 to-yellow-400",
      message: "On fire!"
    }
  }
  if (days >= 7) {
    return {
      flames: 3,
      glowIntensity: "shadow-[0_0_20px_rgba(255,180,0,0.5)]",
      ringColor: "from-orange-400 via-yellow-400 to-amber-400",
      message: "Keep burning!"
    }
  }
  if (days >= 3) {
    return {
      flames: 2,
      glowIntensity: "shadow-[0_0_15px_rgba(255,200,0,0.4)]",
      ringColor: "from-yellow-400 via-amber-400 to-orange-300",
      message: "Building momentum!"
    }
  }
  return {
    flames: 1,
    glowIntensity: "shadow-[0_0_10px_rgba(255,215,0,0.3)]",
    ringColor: "from-yellow-300 via-amber-300 to-orange-200",
    message: days > 0 ? "Getting started!" : "Start your streak!"
  }
}

const sizeClasses = {
  sm: { ring: "w-20 h-20", text: "text-xl", flame: "w-6 h-6", label: "text-xs" },
  md: { ring: "w-28 h-28", text: "text-3xl", flame: "w-8 h-8", label: "text-sm" },
  lg: { ring: "w-36 h-36", text: "text-4xl", flame: "w-10 h-10", label: "text-base" },
}

export function StreakFireRing({ streakDays, className, size = "md" }: StreakFireRingProps) {
  const intensity = getStreakIntensity(streakDays)
  const sizeClass = sizeClasses[size]

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      {/* Fire Ring Container */}
      <div className="relative">
        {/* Outer glow ring */}
        <motion.div
          className={cn(
            "absolute inset-0 rounded-full",
            intensity.glowIntensity
          )}
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.8, 1, 0.8]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Main ring with gradient */}
        <motion.div
          className={cn(
            sizeClass.ring,
            "rounded-full p-1",
            "bg-gradient-to-br",
            intensity.ringColor
          )}
          animate={{
            rotate: 360
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          {/* Inner circle */}
          <div className={cn(
            "w-full h-full rounded-full",
            "bg-gradient-to-br from-background to-background/90",
            "flex items-center justify-center",
            "border-2 border-background/50"
          )}>
            <div className="text-center">
              <motion.span
                className={cn(sizeClass.text, "font-black text-foreground block")}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              >
                {streakDays}
              </motion.span>
              <span className={cn(sizeClass.label, "text-muted-foreground")}>days</span>
            </div>
          </div>
        </motion.div>

        {/* Floating flame particles */}
        {Array.from({ length: intensity.flames }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              top: "50%",
              left: "50%",
            }}
            initial={{
              x: "-50%",
              y: "-50%",
            }}
            animate={{
              x: ["-50%", `${-50 + Math.cos(i * (Math.PI * 2 / intensity.flames)) * 60}%`],
              y: ["-50%", `${-50 + Math.sin(i * (Math.PI * 2 / intensity.flames)) * 60}%`],
              scale: [0.8, 1.2, 0.8],
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              duration: 2 + i * 0.3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.2,
            }}
          >
            <Flame className={cn(sizeClass.flame, "text-orange-400 drop-shadow-lg")} />
          </motion.div>
        ))}

        {/* Center flame icon for emphasis when streak is high */}
        {streakDays >= 7 && (
          <motion.div
            className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2"
            animate={{
              y: ["-50%", "-70%", "-50%"],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Flame className="w-6 h-6 text-yellow-400 drop-shadow-[0_0_10px_rgba(255,200,0,0.8)]" />
          </motion.div>
        )}
      </div>

      {/* Streak message */}
      <motion.p
        className="text-sm font-medium text-muted-foreground text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        {intensity.message}
      </motion.p>
    </div>
  )
}
