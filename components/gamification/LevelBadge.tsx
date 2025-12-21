"use client"

import { motion } from "framer-motion"
import { Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatXP, type GamificationStats } from "@/lib/gamification"

interface LevelBadgeProps {
  stats: GamificationStats
  className?: string
  showXPProgress?: boolean
  compact?: boolean
}

export function LevelBadge({ stats, className, showXPProgress = true, compact = false }: LevelBadgeProps) {
  const { currentLevel, levelProgress, xpUntilNext, title, tier, todayXP, xpTotal } = stats

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <motion.div 
          className={cn(
            "flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-accent/30 to-accent/10 border border-accent/50",
            tier.color
          )}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="text-sm font-bold text-accent">{currentLevel}</span>
        </motion.div>
        <div className="text-sm">
          <span className={cn("font-semibold", tier.color)}>{title}</span>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Level Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Level Circle */}
          <motion.div 
            className="relative"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
          >
            <div className={cn(
              "flex items-center justify-center w-14 h-14 rounded-full",
              "bg-gradient-to-br from-accent/40 to-accent/10",
              "border-2 border-accent/60 shadow-lg shadow-accent/20"
            )}>
              <span className="text-2xl font-black text-accent">{currentLevel}</span>
            </div>
            {/* Sparkle decoration */}
            <motion.div
              className="absolute -top-1 -right-1"
              animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Sparkles className="w-4 h-4 text-accent" />
            </motion.div>
          </motion.div>

          {/* Title and XP */}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg">{tier.icon}</span>
              <h3 className={cn("text-lg font-bold", tier.color)}>{title}</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              {formatXP(xpTotal)} XP total
              {todayXP > 0 && (
                <span className="text-accent ml-2">+{todayXP} today</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* XP Progress Bar */}
      {showXPProgress && (
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Level {currentLevel}</span>
            <span>{xpUntilNext} XP to Level {currentLevel + 1}</span>
          </div>
          <div className="relative h-3 w-full rounded-full bg-muted/50 overflow-hidden">
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-accent/10 via-accent/5 to-transparent" />
            
            {/* Progress fill */}
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-accent via-accent to-yellow-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${levelProgress}%` }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
            />
            
            {/* Shimmer effect */}
            <motion.div
              className="absolute inset-y-0 w-20 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              initial={{ left: "-20%" }}
              animate={{ left: "120%" }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
