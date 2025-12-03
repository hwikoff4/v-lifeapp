"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import {
  Play,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Trophy,
  Settings,
  Bot,
  Dumbbell,
  Heart,
  TrendingUp,
  Calendar,
  Flame,
  Target,
} from "lucide-react"
import { ButtonGlow } from "@/components/ui/button-glow"
import { Card, CardContent } from "@/components/ui/card"
import { BottomNav } from "@/components/bottom-nav"
import { Progress } from "@/components/ui/progress"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Bar, BarChart } from "recharts"
import { getExerciseImage } from "@/lib/exercise-images"

interface Exercise {
  id: number
  name: string
  sets: number
  reps: string
  rest: string
  completed: boolean
}

interface CardioExercise {
  id: number
  name: string
  duration: string
  distance?: string
  pace?: string
  calories?: string
  completed: boolean
}

type WorkoutType = "strength" | "cardio" | "progress"

const weeklyWorkoutData = [
  { week: "Week 1", workouts: 3, volume: 12500, cardioMinutes: 90 },
  { week: "Week 2", workouts: 4, volume: 14200, cardioMinutes: 120 },
  { week: "Week 3", workouts: 3, volume: 13800, cardioMinutes: 105 },
  { week: "Week 4", workouts: 5, volume: 16500, cardioMinutes: 150 },
  { week: "Week 5", workouts: 4, volume: 15800, cardioMinutes: 135 },
  { week: "This Week", workouts: 3, volume: 14100, cardioMinutes: 90 },
]

const exerciseCompletionData = [
  { day: "Mon", completed: 5, total: 5 },
  { day: "Tue", completed: 0, total: 5 },
  { day: "Wed", completed: 4, total: 5 },
  { day: "Thu", completed: 0, total: 5 },
  { day: "Fri", completed: 5, total: 5 },
  { day: "Sat", completed: 3, total: 5 },
  { day: "Today", completed: 2, total: 5 },
]

export default function Fitness() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [expandedExercise, setExpandedExercise] = useState<number | null>(null)
  const [showCompletionMessage, setShowCompletionMessage] = useState(false)
  const [workoutType, setWorkoutType] = useState<WorkoutType>("strength")

  const [exercises, setExercises] = useState<Exercise[]>([
    { id: 1, name: "Bench Press", sets: 4, reps: "8-10", rest: "90 sec", completed: false },
    { id: 2, name: "Pull-Ups", sets: 3, reps: "8-10", rest: "90 sec", completed: false },
    { id: 3, name: "Shoulder Press", sets: 3, reps: "10-12", rest: "60 sec", completed: false },
    { id: 4, name: "Bicep Curls", sets: 3, reps: "12", rest: "60 sec", completed: false },
    { id: 5, name: "Tricep Extensions", sets: 3, reps: "12", rest: "60 sec", completed: false },
  ])

  const [cardioExercises, setCardioExercises] = useState<CardioExercise[]>([
    {
      id: 1,
      name: "Running",
      duration: "30 min",
      distance: "5 km",
      pace: "6:00/km",
      calories: "300",
      completed: false,
    },
    {
      id: 2,
      name: "Cycling",
      duration: "45 min",
      distance: "15 km",
      pace: "20 km/h",
      calories: "400",
      completed: false,
    },
    {
      id: 3,
      name: "Rowing",
      duration: "20 min",
      distance: "5 km",
      pace: "2:00/500m",
      calories: "250",
      completed: false,
    },
    { id: 4, name: "Jump Rope", duration: "15 min", calories: "200", completed: false },
    {
      id: 5,
      name: "Swimming",
      duration: "30 min",
      distance: "1 km",
      pace: "2:00/100m",
      calories: "350",
      completed: false,
    },
  ])

  const completedCount =
    workoutType === "strength"
      ? exercises.filter((ex) => ex.completed).length
      : cardioExercises.filter((ex) => ex.completed).length

  const totalCount = workoutType === "strength" ? exercises.length : cardioExercises.length
  const workoutProgress = (completedCount / totalCount) * 100

  useEffect(() => {
    if (searchParams.get("completed") === "true") {
      setShowCompletionMessage(true)
      window.history.replaceState({}, "", "/fitness")
      setTimeout(() => setShowCompletionMessage(false), 5000)
    }
  }, [searchParams])

  const completeExercise = (exerciseId: number) => {
    if (workoutType === "strength") {
      const updatedExercises = exercises.map((ex) => (ex.id === exerciseId ? { ...ex, completed: true } : ex))
      setExercises(updatedExercises)

      const currentIndex = exercises.findIndex((ex) => ex.id === exerciseId)
      const nextIncompleteExercise = updatedExercises.slice(currentIndex + 1).find((ex) => !ex.completed)

      if (nextIncompleteExercise) {
        setTimeout(() => {
          setExpandedExercise(nextIncompleteExercise.id)
        }, 300)
      } else {
        setExpandedExercise(null)
        setShowCompletionMessage(true)
        setTimeout(() => setShowCompletionMessage(false), 5000)
      }
    } else {
      const updatedCardioExercises = cardioExercises.map((ex) =>
        ex.id === exerciseId ? { ...ex, completed: true } : ex,
      )
      setCardioExercises(updatedCardioExercises)

      const currentIndex = cardioExercises.findIndex((ex) => ex.id === exerciseId)
      const nextIncompleteExercise = updatedCardioExercises.slice(currentIndex + 1).find((ex) => !ex.completed)

      if (nextIncompleteExercise) {
        setTimeout(() => {
          setExpandedExercise(nextIncompleteExercise.id)
        }, 300)
      } else {
        setExpandedExercise(null)
        setShowCompletionMessage(true)
        setTimeout(() => setShowCompletionMessage(false), 5000)
      }
    }
  }

  const toggleExercise = (id: number) => {
    if (expandedExercise === id) {
      setExpandedExercise(null)
    } else {
      setExpandedExercise(id)
    }
  }

  const startWorkout = () => {
    router.push("/workout")
  }

  const completeWorkout = () => {
    if (workoutType === "strength") {
      const completedExercises = exercises.map((ex) => ({ ...ex, completed: true }))
      setExercises(completedExercises)
    } else {
      const completedCardioExercises = cardioExercises.map((ex) => ({ ...ex, completed: true }))
      setCardioExercises(completedCardioExercises)
    }
    setShowCompletionMessage(true)
    setTimeout(() => setShowCompletionMessage(false), 5000)
  }

  const currentExercises = workoutType === "strength" ? exercises : cardioExercises

  const thisWeekData = weeklyWorkoutData[weeklyWorkoutData.length - 1]
  const lastWeekData = weeklyWorkoutData[weeklyWorkoutData.length - 2]
  const workoutChange = ((thisWeekData.workouts - lastWeekData.workouts) / lastWeekData.workouts) * 100
  const volumeChange = ((thisWeekData.volume - lastWeekData.volume) / lastWeekData.volume) * 100
  const cardioChange = ((thisWeekData.cardioMinutes - lastWeekData.cardioMinutes) / lastWeekData.cardioMinutes) * 100

  const totalWorkoutsThisMonth = weeklyWorkoutData.slice(-4).reduce((sum, week) => sum + week.workouts, 0)
  const avgWorkoutsPerWeek = totalWorkoutsThisMonth / 4

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-charcoal pb-20">
      <div className="container max-w-md px-4 py-6">
        {showCompletionMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="mb-6"
          >
            <Card className="border-accent/30 bg-gradient-to-r from-accent/20 to-accent/10 backdrop-blur-sm">
              <CardContent className="flex items-center p-4">
                <Trophy className="mr-3 h-8 w-8 text-accent" />
                <div>
                  <h3 className="font-bold text-white">Workout Complete! 🎉</h3>
                  <p className="text-sm text-white/80">Great job on finishing your workout!</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
        >
          <ButtonGlow variant="accent-glow" className="w-full" onClick={() => router.push("/ai-coach")}>
            <Bot className="mr-2 h-5 w-5" />
            Access AI Fitness Coach
          </ButtonGlow>
        </motion.div>

        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">
                {workoutType === "strength"
                  ? "Today's Workout"
                  : workoutType === "cardio"
                    ? "Cardio Training"
                    : "Progress & Stats"}
              </h1>
              <div className="flex items-center justify-between">
                <p className="text-white/70">
                  {workoutType === "strength"
                    ? "Upper Body Power"
                    : workoutType === "cardio"
                      ? "Cardio Endurance"
                      : "Weekly Overview"}
                </p>
                {workoutType !== "progress" && (
                  <span className="text-accent">{workoutType === "strength" ? "45 min" : "30 min"}</span>
                )}
              </div>
            </div>
            <ButtonGlow variant="outline-glow" size="icon" onClick={() => router.push("/tools")} className="h-8 w-8">
              <Settings className="h-4 w-4" />
            </ButtonGlow>
          </div>
        </motion.div>

        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="grid grid-cols-3 gap-2 rounded-lg border border-white/10 bg-black/30 p-1">
            <button
              onClick={() => {
                setWorkoutType("strength")
                setExpandedExercise(null)
              }}
              className={`flex items-center justify-center gap-2 rounded-md px-4 py-2 transition-all ${
                workoutType === "strength" ? "bg-accent text-black font-semibold" : "text-white/60 hover:text-white"
              }`}
            >
              <Dumbbell className="h-4 w-4" />
              Strength
            </button>
            <button
              onClick={() => {
                setWorkoutType("cardio")
                setExpandedExercise(null)
              }}
              className={`flex items-center justify-center gap-2 rounded-md px-4 py-2 transition-all ${
                workoutType === "cardio" ? "bg-accent text-black font-semibold" : "text-white/60 hover:text-white"
              }`}
            >
              <Heart className="h-4 w-4" />
              Cardio
            </button>
            <button
              onClick={() => {
                setWorkoutType("progress")
                setExpandedExercise(null)
              }}
              className={`flex items-center justify-center gap-2 rounded-md px-4 py-2 transition-all ${
                workoutType === "progress" ? "bg-accent text-black font-semibold" : "text-white/60 hover:text-white"
              }`}
            >
              <TrendingUp className="h-4 w-4" />
              Progress
            </button>
          </div>
        </motion.div>

        {workoutType === "progress" ? (
          <div className="space-y-6">
            {/* Comparison Stats */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.15 }}
            >
              <Card className="border-white/10 bg-black/50 backdrop-blur-sm">
                <CardContent className="p-4">
                  <h2 className="mb-4 text-lg font-bold text-white">This Week vs Last Week</h2>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-lg bg-black/30 p-3 text-center">
                      <Calendar className="mx-auto mb-2 h-5 w-5 text-accent" />
                      <p className="text-2xl font-bold text-white">{thisWeekData.workouts}</p>
                      <p className="text-xs text-white/60">Workouts</p>
                      <p
                        className={`mt-1 text-xs font-medium ${workoutChange >= 0 ? "text-green-400" : "text-red-400"}`}
                      >
                        {workoutChange >= 0 ? "+" : ""}
                        {workoutChange.toFixed(0)}%
                      </p>
                    </div>
                    <div className="rounded-lg bg-black/30 p-3 text-center">
                      <Dumbbell className="mx-auto mb-2 h-5 w-5 text-accent" />
                      <p className="text-2xl font-bold text-white">{(thisWeekData.volume / 1000).toFixed(1)}k</p>
                      <p className="text-xs text-white/60">Volume</p>
                      <p
                        className={`mt-1 text-xs font-medium ${volumeChange >= 0 ? "text-green-400" : "text-red-400"}`}
                      >
                        {volumeChange >= 0 ? "+" : ""}
                        {volumeChange.toFixed(0)}%
                      </p>
                    </div>
                    <div className="rounded-lg bg-black/30 p-3 text-center">
                      <Heart className="mx-auto mb-2 h-5 w-5 text-accent" />
                      <p className="text-2xl font-bold text-white">{thisWeekData.cardioMinutes}</p>
                      <p className="text-xs text-white/60">Cardio Min</p>
                      <p
                        className={`mt-1 text-xs font-medium ${cardioChange >= 0 ? "text-green-400" : "text-red-400"}`}
                      >
                        {cardioChange >= 0 ? "+" : ""}
                        {cardioChange.toFixed(0)}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Weekly Workouts Chart */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Card className="border-white/10 bg-black/50 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-white">Workouts Per Week</h2>
                    <Target className="h-5 w-5 text-accent" />
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={weeklyWorkoutData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="week" stroke="rgba(255,255,255,0.5)" tick={{ fill: "rgba(255,255,255,0.7)" }} />
                      <YAxis stroke="rgba(255,255,255,0.5)" tick={{ fill: "rgba(255,255,255,0.7)" }} />
                      <Bar dataKey="workouts" fill="#FFD700" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                  <p className="mt-3 text-center text-sm text-white/70">
                    Average: {avgWorkoutsPerWeek.toFixed(1)} workouts/week
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Training Volume Chart */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.25 }}
            >
              <Card className="border-white/10 bg-black/50 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-white">Training Volume Trend</h2>
                    <Flame className="h-5 w-5 text-accent" />
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={weeklyWorkoutData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="week" stroke="rgba(255,255,255,0.5)" tick={{ fill: "rgba(255,255,255,0.7)" }} />
                      <YAxis stroke="rgba(255,255,255,0.5)" tick={{ fill: "rgba(255,255,255,0.7)" }} />
                      <Line
                        type="monotone"
                        dataKey="volume"
                        stroke="#FFD700"
                        strokeWidth={3}
                        dot={{ fill: "#FFD700", r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                  <p className="mt-3 text-center text-sm text-white/70">Total volume: sets × reps × weight (lbs)</p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Daily Exercise Completion */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <Card className="border-white/10 bg-black/50 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-white">Daily Completion Rate</h2>
                    <CheckCircle className="h-5 w-5 text-accent" />
                  </div>
                  <div className="space-y-3">
                    {exerciseCompletionData.map((day) => {
                      const completionRate = (day.completed / day.total) * 100
                      return (
                        <div key={day.day}>
                          <div className="mb-1 flex items-center justify-between text-sm">
                            <span className="text-white/70">{day.day}</span>
                            <span className="text-white">
                              {day.completed}/{day.total} exercises
                            </span>
                          </div>
                          <Progress
                            value={completionRate}
                            className="h-2 bg-white/10"
                            indicatorClassName={completionRate === 100 ? "bg-accent" : "bg-accent/60"}
                          />
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Monthly Summary */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.35 }}
            >
              <Card className="border-accent/30 bg-gradient-to-r from-accent/20 to-accent/10 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-start">
                    <Trophy className="mr-3 h-8 w-8 text-accent" />
                    <div>
                      <h3 className="font-bold text-white">Monthly Achievement</h3>
                      <p className="mt-1 text-sm text-white/80">
                        You completed <span className="font-bold text-accent">{totalWorkoutsThisMonth} workouts</span>{" "}
                        this month! That's{" "}
                        {workoutChange >= 0 ? (
                          <span className="font-bold text-green-400">
                            {workoutChange.toFixed(0)}% more than last week
                          </span>
                        ) : (
                          <span className="font-bold text-red-400">
                            {Math.abs(workoutChange).toFixed(0)}% less than last week
                          </span>
                        )}
                        . Keep up the momentum!
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        ) : (
          <>
            <motion.div
              className="mb-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.15 }}
            >
              <div className="space-y-3">
                {workoutType === "strength"
                  ? exercises.map((exercise, index) => (
                      <Card
                        key={exercise.id}
                        className={`border-white/10 bg-black/50 backdrop-blur-sm ${exercise.completed ? "opacity-60" : ""}`}
                      >
                        <CardContent className="p-0">
                          <div
                            className="flex cursor-pointer items-center justify-between p-4"
                            onClick={() => toggleExercise(exercise.id)}
                          >
                            <div className="flex items-center">
                              <div
                                className={`mr-3 flex h-6 w-6 items-center justify-center rounded-full ${
                                  exercise.completed ? "bg-accent text-black" : "border border-accent/50 text-accent"
                                } text-xs font-medium`}
                              >
                                {exercise.completed ? <CheckCircle className="h-4 w-4" /> : index + 1}
                              </div>
                              <div>
                                <h3
                                  className={`font-medium ${exercise.completed ? "text-white/60 line-through" : "text-white"}`}
                                >
                                  {exercise.name}
                                </h3>
                                <p className="text-sm text-white/60">
                                  {exercise.sets} sets × {exercise.reps} reps
                                </p>
                              </div>
                            </div>
                            {expandedExercise === exercise.id ? (
                              <ChevronUp className="h-5 w-5 text-white/60" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-white/60" />
                            )}
                          </div>

                          {expandedExercise === exercise.id && (
                            <div className="border-t border-white/10 p-4">
                              <div className="mb-4 aspect-video rounded-lg bg-black/70 flex items-center justify-center overflow-hidden">
                                <img
                                  src={getExerciseImage(exercise.name) || "/placeholder.svg"}
                                  alt={`${exercise.name} demonstration`}
                                  className="h-full w-full object-cover"
                                />
                              </div>

                              <div className="grid grid-cols-3 gap-2 text-center text-sm mb-4">
                                <div className="rounded bg-black/30 p-2">
                                  <p className="text-white/60">Sets</p>
                                  <p className="font-medium text-white">{exercise.sets}</p>
                                </div>
                                <div className="rounded bg-black/30 p-2">
                                  <p className="text-white/60">Reps</p>
                                  <p className="font-medium text-white">{exercise.reps}</p>
                                </div>
                                <div className="rounded bg-black/30 p-2">
                                  <p className="text-white/60">Rest</p>
                                  <p className="font-medium text-white">{exercise.rest}</p>
                                </div>
                              </div>

                              {!exercise.completed && (
                                <ButtonGlow
                                  variant="accent-glow"
                                  className="w-full"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    completeExercise(exercise.id)
                                  }}
                                >
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Complete Exercise
                                </ButtonGlow>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  : cardioExercises.map((exercise, index) => (
                      <Card
                        key={exercise.id}
                        className={`border-white/10 bg-black/50 backdrop-blur-sm ${exercise.completed ? "opacity-60" : ""}`}
                      >
                        <CardContent className="p-0">
                          <div
                            className="flex cursor-pointer items-center justify-between p-4"
                            onClick={() => toggleExercise(exercise.id)}
                          >
                            <div className="flex items-center">
                              <div
                                className={`mr-3 flex h-6 w-6 items-center justify-center rounded-full ${
                                  exercise.completed ? "bg-accent text-black" : "border border-accent/50 text-accent"
                                } text-xs font-medium`}
                              >
                                {exercise.completed ? <CheckCircle className="h-4 w-4" /> : index + 1}
                              </div>
                              <div>
                                <h3
                                  className={`font-medium ${exercise.completed ? "text-white/60 line-through" : "text-white"}`}
                                >
                                  {exercise.name}
                                </h3>
                                <p className="text-sm text-white/60">
                                  {exercise.duration} • {exercise.calories} cal
                                </p>
                              </div>
                            </div>
                            {expandedExercise === exercise.id ? (
                              <ChevronUp className="h-5 w-5 text-white/60" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-white/60" />
                            )}
                          </div>

                          {expandedExercise === exercise.id && (
                            <div className="border-t border-white/10 p-4">
                              <div className="mb-4 aspect-video rounded-lg bg-black/70 flex items-center justify-center overflow-hidden">
                                <img
                                  src={getExerciseImage(exercise.name) || "/placeholder.svg"}
                                  alt={`${exercise.name} demonstration`}
                                  className="h-full w-full object-cover"
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-2 text-center text-sm mb-4">
                                <div className="rounded bg-black/30 p-2">
                                  <p className="text-white/60">Duration</p>
                                  <p className="font-medium text-white">{exercise.duration}</p>
                                </div>
                                {exercise.distance && (
                                  <div className="rounded bg-black/30 p-2">
                                    <p className="text-white/60">Distance</p>
                                    <p className="font-medium text-white">{exercise.distance}</p>
                                  </div>
                                )}
                                {exercise.pace && (
                                  <div className="rounded bg-black/30 p-2">
                                    <p className="text-white/60">Pace</p>
                                    <p className="font-medium text-white">{exercise.pace}</p>
                                  </div>
                                )}
                                <div className="rounded bg-black/30 p-2">
                                  <p className="text-white/60">Calories</p>
                                  <p className="font-medium text-white">{exercise.calories}</p>
                                </div>
                              </div>

                              {!exercise.completed && (
                                <ButtonGlow
                                  variant="accent-glow"
                                  className="w-full"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    completeExercise(exercise.id)
                                  }}
                                >
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Complete Exercise
                                </ButtonGlow>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
              </div>
            </motion.div>

            <motion.div
              className="mb-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Card className="border-white/10 bg-black/50 backdrop-blur-sm">
                <CardContent className="p-4">
                  <h2 className="mb-2 text-lg font-bold text-white">Workout Progress</h2>
                  <Progress value={workoutProgress} className="h-2 bg-white/10" indicatorClassName="bg-accent" />
                  <p className="mt-2 text-sm text-white/70">
                    {completedCount} of {totalCount} exercises completed
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              className="flex gap-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <ButtonGlow variant="accent-glow" className="flex-1" onClick={startWorkout}>
                <Play className="mr-2 h-4 w-4" /> Start Workout
              </ButtonGlow>
              <ButtonGlow variant="outline-glow" className="flex-1" onClick={completeWorkout}>
                <CheckCircle className="mr-2 h-4 w-4" /> Complete
              </ButtonGlow>
            </motion.div>
          </>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
