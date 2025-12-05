"use client"

import { useMemo } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Settings, Target, Dumbbell, Calendar, ArrowRight } from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"
import { Card, CardContent } from "@/components/ui/card"
import { ButtonGlow } from "@/components/ui/button-glow"
import type { ActiveWorkoutPayload, WorkoutOverview } from "@/lib/actions/workouts"

interface FitnessClientProps {
  userName: string
  activeWorkout: ActiveWorkoutPayload | null
  overview: WorkoutOverview
}

export function FitnessClient({ userName, activeWorkout, overview }: FitnessClientProps) {
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
            <h2 className="text-lg font-bold text-white">Today's Workout</h2>
            <ButtonGlow variant="outline-glow" size="sm" onClick={() => router.push("/workout")}>
              View Plan
            </ButtonGlow>
          </div>
          {activeWorkout ? (
            <Card className="border-white/10 bg-black/60">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2 text-white/80">
                  <Dumbbell className="h-4 w-4 text-accent" />
                  <span>{activeWorkout.name}</span>
                </div>
                <ul className="space-y-2">
                  {activeWorkout.exercises.slice(0, 4).map((exercise) => (
                    <li key={exercise.workoutExerciseId} className="flex justify-between text-sm text-white/70">
                      <span>{exercise.name}</span>
                      <span>
                        {exercise.sets} x {exercise.reps}
                      </span>
                    </li>
                  ))}
                </ul>
                <ButtonGlow variant="accent-glow" className="w-full" onClick={() => router.push("/workout")}>
                  Start Workout <ArrowRight className="ml-2 h-4 w-4" />
                </ButtonGlow>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-white/10 bg-black/60">
              <CardContent className="p-4 text-sm text-white/60">No workout scheduled today.</CardContent>
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

