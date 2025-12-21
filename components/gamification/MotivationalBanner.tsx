"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import { Sparkles, Flame, Trophy, Target, Zap, Sun, Moon, Coffee } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface MotivationalBannerProps {
  userName?: string
  streakDays: number
  missionsCompleted: number
  totalMissions: number
  currentLevel: number
  todayXP: number
  className?: string
}

interface MotivationalMessage {
  icon: React.ReactNode
  message: string
  subtext?: string
  gradient: string
}

function getTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 17) return 'afternoon'
  if (hour >= 17 && hour < 21) return 'evening'
  return 'night'
}

function getMotivationalMessage(props: MotivationalBannerProps): MotivationalMessage {
  const { userName, streakDays, missionsCompleted, totalMissions, currentLevel, todayXP } = props
  const timeOfDay = getTimeOfDay()
  const name = userName || "Champion"
  const allMissionsComplete = totalMissions > 0 && missionsCompleted === totalMissions
  const noMissionsStarted = missionsCompleted === 0

  // Priority 1: All missions complete celebration
  if (allMissionsComplete) {
    return {
      icon: <Trophy className="h-6 w-6 text-yellow-400" />,
      message: `Perfect day, ${name}! 🏆`,
      subtext: `All ${totalMissions} missions crushed! You're unstoppable.`,
      gradient: "from-yellow-500/20 via-amber-500/10 to-orange-500/20"
    }
  }

  // Priority 2: High streak celebration
  if (streakDays >= 30) {
    return {
      icon: <Flame className="h-6 w-6 text-orange-400" />,
      message: `Legendary ${streakDays}-day streak! 🔥`,
      subtext: `You're in the top 1% of V-Life warriors.`,
      gradient: "from-orange-500/20 via-red-500/10 to-yellow-500/20"
    }
  }

  if (streakDays >= 7) {
    return {
      icon: <Flame className="h-6 w-6 text-orange-400" />,
      message: `${streakDays} days strong, ${name}! 🔥`,
      subtext: "Your consistency is inspiring. Keep that fire burning!",
      gradient: "from-orange-500/20 via-amber-500/10 to-transparent"
    }
  }

  // Priority 3: Level milestone
  if (currentLevel >= 10 && currentLevel % 5 === 0) {
    return {
      icon: <Sparkles className="h-6 w-6 text-purple-400" />,
      message: `Level ${currentLevel} achieved! ⭐`,
      subtext: "Your dedication is paying off. Keep climbing!",
      gradient: "from-purple-500/20 via-pink-500/10 to-transparent"
    }
  }

  // Priority 4: Time-based greetings with context
  if (timeOfDay === 'morning') {
    if (noMissionsStarted) {
      return {
        icon: <Sun className="h-6 w-6 text-yellow-400" />,
        message: `Rise and shine, ${name}! ☀️`,
        subtext: `${totalMissions} missions await. Let's make today count!`,
        gradient: "from-yellow-500/20 via-orange-500/10 to-transparent"
      }
    }
    return {
      icon: <Coffee className="h-6 w-6 text-amber-400" />,
      message: `Great start, ${name}! ☕`,
      subtext: `${missionsCompleted}/${totalMissions} missions done already. Morning momentum!`,
      gradient: "from-amber-500/20 via-yellow-500/10 to-transparent"
    }
  }

  if (timeOfDay === 'afternoon') {
    if (missionsCompleted > 0 && missionsCompleted < totalMissions) {
      const remaining = totalMissions - missionsCompleted
      return {
        icon: <Target className="h-6 w-6 text-blue-400" />,
        message: `Keep pushing, ${name}! 💪`,
        subtext: `${remaining} mission${remaining !== 1 ? 's' : ''} left. You've got this!`,
        gradient: "from-blue-500/20 via-cyan-500/10 to-transparent"
      }
    }
    return {
      icon: <Zap className="h-6 w-6 text-accent" />,
      message: `Afternoon power hour! ⚡`,
      subtext: "Perfect time to knock out some missions.",
      gradient: "from-accent/20 via-yellow-500/10 to-transparent"
    }
  }

  if (timeOfDay === 'evening') {
    const remaining = totalMissions - missionsCompleted
    if (remaining > 0 && remaining <= 2) {
      return {
        icon: <Target className="h-6 w-6 text-purple-400" />,
        message: `Almost there, ${name}! 🌙`,
        subtext: `Just ${remaining} mission${remaining !== 1 ? 's' : ''} from a perfect day!`,
        gradient: "from-purple-500/20 via-indigo-500/10 to-transparent"
      }
    }
    return {
      icon: <Moon className="h-6 w-6 text-indigo-400" />,
      message: `Evening check-in! 🌆`,
      subtext: todayXP > 0 ? `+${todayXP} XP earned today. Nice work!` : "Still time to earn some XP!",
      gradient: "from-indigo-500/20 via-purple-500/10 to-transparent"
    }
  }

  // Night time
  return {
    icon: <Moon className="h-6 w-6 text-indigo-400" />,
    message: `Rest well, ${name}! 🌙`,
    subtext: streakDays > 0 ? `Your ${streakDays}-day streak is safe. See you tomorrow!` : "Get some rest and come back stronger!",
    gradient: "from-indigo-500/20 via-slate-500/10 to-transparent"
  }
}

export function MotivationalBanner(props: MotivationalBannerProps) {
  const { className } = props
  
  const motivationalData = useMemo(() => getMotivationalMessage(props), [
    props.userName,
    props.streakDays,
    props.missionsCompleted,
    props.totalMissions,
    props.currentLevel,
    props.todayXP
  ])

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={className}
    >
      <Card className={cn(
        "glass-card overflow-hidden border-white/10",
        "bg-gradient-to-r",
        motivationalData.gradient
      )}>
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            {/* Animated icon */}
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity,
                repeatDelay: 2
              }}
              className="flex-shrink-0 p-2 rounded-xl bg-background/50"
            >
              {motivationalData.icon}
            </motion.div>

            {/* Message content */}
            <div className="flex-1 min-w-0">
              <motion.h3
                className="text-lg font-bold text-foreground"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                {motivationalData.message}
              </motion.h3>
              {motivationalData.subtext && (
                <motion.p
                  className="text-sm text-muted-foreground mt-0.5"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {motivationalData.subtext}
                </motion.p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
