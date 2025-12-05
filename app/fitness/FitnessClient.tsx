"use client"

import { useMemo } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Settings, Target, Dumbbell, Calendar, ArrowRight, Sparkles, Zap, Clock } from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"
import { Card, CardContent } from "@/components/ui/card"
import { ButtonGlow } from "@/components/ui/button-glow"
import type { ActiveWorkoutPayload, WorkoutOverview } from "@/lib/actions/workouts"

interface ProgrammingContext {
  dayName: string
  emphasis: string
  weekPhase: string
  isSunday: boolean
}

interface FitnessClientProps {
  userName: string
  activeWorkout: ActiveWorkoutPayload | null
  overview: WorkoutOverview
  programmingContext: ProgrammingContext
}

export function FitnessClient({ userName, activeWorkout, overview, programmingContext }: FitnessClientProps) {
  const router = useRouter()

  const weeklyHighlights = useMemo(() => {
    const latestWeek = overview.weeklyWorkoutData.at(-1)
    return {
      workouts: latestWeek?.workouts || 0,
      volume: latestWeek ? Math.round(latestWeek.volume) : 0,
      cardioMinutes: latestWeek?.cardioMinutes || 0,
    }
  }, [overview.weeklyWorkoutData])

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-charcoal pb-20">
      <div className="container max-w-md px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/60 text-sm">Welcome back</p>
            <h1 className="text-2xl font-bold text-white">Hey {userName || "there"} 👋</h1>
          </div>
          <ButtonGlow variant="outline-glow" size="icon" onClick={() => router.push("/settings")} className="h-9 w-9">
            <Settings className="h-4 w-4" />
          </ButtonGlow>
        </div>

        {/* Today's Programming Context */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-accent/20 bg-gradient-to-br from-accent/10 to-transparent">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-white/60">{programmingContext.dayName}</p>
                    <p className="text-white font-semibold">{programmingContext.emphasis}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-white/40">Week Phase</p>
                  <p className="text-sm text-accent font-medium">{programmingContext.weekPhase}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          className="grid grid-cols-3 gap-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-white/10 bg-black/50 text-center">
            <CardContent className="p-3">
              <p className="text-xs text-white/60">This Week</p>
              <p className="text-xl font-bold text-white">{weeklyHighlights.workouts}</p>
            </CardContent>
          </Card>
          <Card className="border-white/10 bg-black/50 text-center">
            <CardContent className="p-3">
              <p className="text-xs text-white/60">Volume</p>
              <p className="text-xl font-bold text-white">{weeklyHighlights.volume}</p>
            </CardContent>
          </Card>
          <Card className="border-white/10 bg-black/50 text-center">
            <CardContent className="p-3">
              <p className="text-xs text-white/60">Cardio</p>
              <p className="text-xl font-bold text-white">{weeklyHighlights.cardioMinutes}m</p>
            </CardContent>
          </Card>
        </motion.div>

        <Card className="border-white/10 bg-black/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-4 w-4 text-accent" />
              <p className="text-sm text-white/70">Ops this week</p>
            </div>
            <div className="space-y-1 text-sm text-white/80">
              <p>Total workouts this month: {overview.totalWorkoutsThisMonth}</p>
              <p>Avg weekly sessions: {overview.avgWorkoutsPerWeek}</p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Zap className="h-5 w-5 text-accent" />
              Today&apos;s Workout
            </h2>
            <ButtonGlow variant="outline-glow" size="sm" onClick={() => router.push("/workout")}>
              View Plan
            </ButtonGlow>
          </div>
          {programmingContext.isSunday ? (
            <Card className="border-white/10 bg-black/60">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Target className="h-5 w-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-white font-semibold">Rest & Recovery Day</p>
                    <p className="text-sm text-white/60">Take time to recover. Light stretching or a walk is optional.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : activeWorkout ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card className="border-white/10 bg-black/60 overflow-hidden">
                <CardContent className="p-4 space-y-4">
                  {/* Workout Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center">
                        <Dumbbell className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <p className="text-white font-bold">{activeWorkout.name}</p>
                        <p className="text-xs text-white/50 capitalize">{activeWorkout.workoutType || "Strength"}</p>
                      </div>
                    </div>
                    {activeWorkout.durationMinutes && (
                      <div className="flex items-center gap-1 text-white/60 text-sm">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{activeWorkout.durationMinutes}m</span>
                      </div>
                    )}
                  </div>

                  {/* AI Badge */}
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-accent/10 rounded-lg w-fit">
                    <Sparkles className="h-3.5 w-3.5 text-accent" />
                    <span className="text-xs text-accent font-medium">AI-Generated for {programmingContext.dayName}</span>
                  </div>

                  {/* Exercises Preview */}
                  <div className="space-y-2">
                    {activeWorkout.exercises.slice(0, 4).map((exercise, index) => (
                      <motion.div
                        key={exercise.workoutExerciseId}
                        className="flex justify-between items-center py-2 border-b border-white/5 last:border-0"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <span className="text-sm text-white/80">{exercise.name}</span>
                        <span className="text-sm text-white/50 font-mono">
                          {exercise.sets} × {exercise.reps}
                        </span>
                      </motion.div>
                    ))}
                    {activeWorkout.exercises.length > 4 && (
                      <p className="text-xs text-white/40 text-center pt-1">
                        +{activeWorkout.exercises.length - 4} more exercises
                      </p>
                    )}
                  </div>

                  {/* Conditioning Notes */}
                  {activeWorkout.conditioningNotes && (
                    <div className="bg-white/5 rounded-lg p-3">
                      <p className="text-xs text-accent font-semibold mb-1">Conditioning</p>
                      <p className="text-sm text-white/70">{activeWorkout.conditioningNotes}</p>
                    </div>
                  )}

                  <ButtonGlow variant="accent-glow" className="w-full" onClick={() => router.push("/workout")}>
                    Start Workout <ArrowRight className="ml-2 h-4 w-4" />
                  </ButtonGlow>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <Card className="border-white/10 bg-black/60">
              <CardContent className="p-4">
                <p className="text-sm text-white/60">Loading your AI-generated workout...</p>
              </CardContent>
            </Card>
          )}
        </div>

        <Card className="border-white/10 bg-black/50">
          <CardContent className="p-4 space-y-2">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <Target className="h-4 w-4 text-accent" />
              Recent Performance
            </h3>
            <ul className="space-y-1 text-sm text-white/70">
              <li>
                Workout change: {overview.workoutChange >= 0 ? "+" : ""}
                {overview.workoutChange.toFixed(1)}%
              </li>
              <li>
                Volume change: {overview.volumeChange >= 0 ? "+" : ""}
                {overview.volumeChange.toFixed(1)}%
              </li>
              <li>
                Cardio change: {overview.cardioChange >= 0 ? "+" : ""}
                {overview.cardioChange.toFixed(1)}%
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <BottomNav />
    </div>
  )
}

