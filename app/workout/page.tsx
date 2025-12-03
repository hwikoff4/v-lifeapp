"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Pause,
  Play,
  SkipForward,
  CheckCircle,
  ArrowLeft,
  Repeat,
  ListOrdered,
  RefreshCw,
  Clock,
  Edit2,
  Dumbbell,
} from "lucide-react"
import { ButtonGlow } from "@/components/ui/button-glow"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface SetLog {
  setNumber: number
  weight: number
  reps: number
  unit: "lbs" | "kg"
  completed: boolean
}

interface Exercise {
  id: number
  name: string
  sets: number
  reps: string
  rest: string
  completed: boolean
  completedSets: number
  setLogs: SetLog[]
}

type WorkoutMode = "sets" | "rounds"

const exerciseAlternatives: Record<string, Array<{ name: string; reason: string }>> = {
  "Bench Press": [
    { name: "Dumbbell Bench Press", reason: "Equipment alternative" },
    { name: "Push-Ups", reason: "Bodyweight alternative" },
    { name: "Incline Bench Press", reason: "Upper chest focus" },
    { name: "Floor Press", reason: "Shoulder-friendly" },
  ],
  "Pull-Ups": [
    { name: "Lat Pulldown", reason: "Equipment alternative" },
    { name: "Assisted Pull-Ups", reason: "Easier variation" },
    { name: "Inverted Rows", reason: "Bodyweight alternative" },
    { name: "Band-Assisted Pull-Ups", reason: "Progressive option" },
  ],
  "Shoulder Press": [
    { name: "Dumbbell Shoulder Press", reason: "Equipment alternative" },
    { name: "Arnold Press", reason: "Rotation variation" },
    { name: "Pike Push-Ups", reason: "Bodyweight alternative" },
    { name: "Landmine Press", reason: "Shoulder-friendly" },
  ],
  "Bicep Curls": [
    { name: "Hammer Curls", reason: "Forearm emphasis" },
    { name: "Cable Curls", reason: "Constant tension" },
    { name: "Concentration Curls", reason: "Isolation focus" },
    { name: "Resistance Band Curls", reason: "Equipment alternative" },
  ],
  "Tricep Extensions": [
    { name: "Overhead Tricep Extension", reason: "Long head focus" },
    { name: "Close-Grip Push-Ups", reason: "Bodyweight alternative" },
    { name: "Tricep Dips", reason: "Compound movement" },
    { name: "Cable Pushdowns", reason: "Equipment alternative" },
  ],
}

export default function WorkoutSession() {
  const router = useRouter()
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [currentSet, setCurrentSet] = useState(1)
  const [isResting, setIsResting] = useState(false)
  const [restTimer, setRestTimer] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [workoutStarted, setWorkoutStarted] = useState(false)
  const [workoutMode, setWorkoutMode] = useState<WorkoutMode>("sets")
  const [currentRound, setCurrentRound] = useState(1)
  const [isSwapDialogOpen, setIsSwapDialogOpen] = useState(false)
  const [restEnabled, setRestEnabled] = useState(true)
  const [isEditRestDialogOpen, setIsEditRestDialogOpen] = useState(false)
  const [editRestValue, setEditRestValue] = useState("")
  const [currentWeight, setCurrentWeight] = useState("")
  const [currentReps, setCurrentReps] = useState("")
  const [weightUnit, setWeightUnit] = useState<"lbs" | "kg">("lbs")

  const [exercises, setExercises] = useState<Exercise[]>([
    { id: 1, name: "Bench Press", sets: 4, reps: "8-10", rest: "90", completed: false, completedSets: 0, setLogs: [] },
    { id: 2, name: "Pull-Ups", sets: 3, reps: "8-10", rest: "90", completed: false, completedSets: 0, setLogs: [] },
    {
      id: 3,
      name: "Shoulder Press",
      sets: 3,
      reps: "10-12",
      rest: "60",
      completed: false,
      completedSets: 0,
      setLogs: [],
    },
    { id: 4, name: "Bicep Curls", sets: 3, reps: "12", rest: "60", completed: false, completedSets: 0, setLogs: [] },
    {
      id: 5,
      name: "Tricep Extensions",
      sets: 3,
      reps: "12",
      rest: "60",
      completed: false,
      completedSets: 0,
      setLogs: [],
    },
  ])

  const currentExercise = exercises[currentExerciseIndex]
  const completedExercises = exercises.filter((ex) => ex.completed).length
  const workoutProgress = (completedExercises / exercises.length) * 100

  const maxRounds = Math.max(...exercises.map((ex) => ex.sets))

  const swapExercise = (newExerciseName: string) => {
    const updatedExercises = exercises.map((ex) =>
      ex.id === currentExercise.id ? { ...ex, name: newExerciseName } : ex,
    )
    setExercises(updatedExercises)
    setIsSwapDialogOpen(false)
  }

  const currentAlternatives = exerciseAlternatives[currentExercise?.name] || []

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isTimerRunning && restTimer > 0) {
      interval = setInterval(() => {
        setRestTimer((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false)
            setIsResting(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isTimerRunning, restTimer])

  const startWorkout = () => {
    setWorkoutStarted(true)
  }

  const completeSet = () => {
    const weight = Number.parseFloat(currentWeight)
    const reps = Number.parseInt(currentReps)

    if (!currentWeight || !currentReps || isNaN(weight) || isNaN(reps) || weight <= 0 || reps <= 0) {
      alert("Please enter valid weight and reps before completing the set")
      return
    }

    const setLog: SetLog = {
      setNumber: workoutMode === "sets" ? currentSet : currentExercise.completedSets + 1,
      weight,
      reps,
      unit: weightUnit,
      completed: true,
    }

    if (workoutMode === "sets") {
      if (currentSet < currentExercise.sets) {
        const updatedExercises = exercises.map((ex) =>
          ex.id === currentExercise.id ? { ...ex, setLogs: [...ex.setLogs, setLog] } : ex,
        )
        setExercises(updatedExercises)

        if (restEnabled) {
          setIsResting(true)
          setRestTimer(Number.parseInt(currentExercise.rest))
          setIsTimerRunning(true)
        }
        setCurrentSet((prev) => prev + 1)
        setCurrentReps("")
      } else {
        const updatedExercises = exercises.map((ex) =>
          ex.id === currentExercise.id ? { ...ex, completed: true, setLogs: [...ex.setLogs, setLog] } : ex,
        )
        setExercises(updatedExercises)

        if (currentExerciseIndex < exercises.length - 1) {
          setCurrentExerciseIndex((prev) => prev + 1)
          setCurrentSet(1)
          setIsResting(false)
          setRestTimer(0)
          setIsTimerRunning(false)
          setCurrentWeight("")
          setCurrentReps("")
        }
      }
    } else {
      const updatedExercises = exercises.map((ex) =>
        ex.id === currentExercise.id
          ? {
              ...ex,
              completedSets: ex.completedSets + 1,
              completed: ex.completedSets + 1 >= ex.sets,
              setLogs: [...ex.setLogs, setLog],
            }
          : ex,
      )
      setExercises(updatedExercises)

      if (restEnabled) {
        setIsResting(true)
        setRestTimer(Number.parseInt(currentExercise.rest))
        setIsTimerRunning(true)
      }

      if (currentExerciseIndex < exercises.length - 1) {
        setCurrentExerciseIndex((prev) => prev + 1)
      } else {
        setCurrentExerciseIndex(0)
        setCurrentRound((prev) => prev + 1)
      }

      const nextExercise = updatedExercises[currentExerciseIndex < exercises.length - 1 ? currentExerciseIndex + 1 : 0]
      setCurrentSet(nextExercise.completedSets + 1)
      setCurrentWeight("")
      setCurrentReps("")
    }
  }

  const skipRest = () => {
    setIsTimerRunning(false)
    setIsResting(false)
    setRestTimer(0)
  }

  const completeWorkout = () => {
    const completedExercises = exercises.map((ex) => ({ ...ex, completed: true }))
    setExercises(completedExercises)

    router.push("/fitness?completed=true")
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const toggleWorkoutMode = () => {
    if (workoutStarted) return
    setWorkoutMode((prev) => (prev === "sets" ? "rounds" : "sets"))
  }

  const openEditRestDialog = () => {
    setEditRestValue(currentExercise.rest)
    setIsEditRestDialogOpen(true)
  }

  const saveRestTime = () => {
    const newRestTime = Number.parseInt(editRestValue)
    if (newRestTime > 0) {
      const updatedExercises = exercises.map((ex) =>
        ex.id === currentExercise.id ? { ...ex, rest: editRestValue } : ex,
      )
      setExercises(updatedExercises)
    }
    setIsEditRestDialogOpen(false)
  }

  if (!workoutStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-charcoal pb-20">
        <div className="container max-w-md px-4 py-6">
          <div className="mb-6 flex items-center">
            <button onClick={() => router.back()} className="mr-4 rounded-full p-2 hover:bg-white/10">
              <ArrowLeft className="h-6 w-6 text-white" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">Ready to Start?</h1>
              <p className="text-white/70">Upper Body Power - 45 min</p>
            </div>
          </div>

          <Card className="mb-6 border-white/10 bg-black/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <h3 className="mb-3 text-sm font-semibold text-white/70">Workout Mode</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setWorkoutMode("sets")}
                  className={`flex flex-col items-center gap-2 rounded-lg border p-4 transition-all ${
                    workoutMode === "sets"
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-white/10 bg-black/30 text-white/60 hover:border-white/20"
                  }`}
                >
                  <ListOrdered className="h-6 w-6" />
                  <div className="text-center">
                    <div className="font-semibold">Sets Mode</div>
                    <div className="text-xs opacity-80">Finish all sets first</div>
                  </div>
                </button>
                <button
                  onClick={() => setWorkoutMode("rounds")}
                  className={`flex flex-col items-center gap-2 rounded-lg border p-4 transition-all ${
                    workoutMode === "rounds"
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-white/10 bg-black/30 text-white/60 hover:border-white/20"
                  }`}
                >
                  <Repeat className="h-6 w-6" />
                  <div className="text-center">
                    <div className="font-semibold">Rounds Mode</div>
                    <div className="text-xs opacity-80">Circuit training</div>
                  </div>
                </button>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6 border-white/10 bg-black/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-accent" />
                  <div>
                    <Label htmlFor="rest-toggle" className="text-sm font-semibold text-white">
                      Rest Timers
                    </Label>
                    <p className="text-xs text-white/60">
                      {restEnabled ? "Automatic rest between sets" : "No rest periods"}
                    </p>
                  </div>
                </div>
                <Switch id="rest-toggle" checked={restEnabled} onCheckedChange={setRestEnabled} />
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6 border-white/10 bg-black/50 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <h2 className="mb-4 text-xl font-bold text-white">Today's Workout</h2>
              <div className="mb-6 space-y-2">
                {exercises.map((exercise, index) => (
                  <div key={exercise.id} className="flex items-center justify-between text-sm">
                    <span className="text-white/80">{exercise.name}</span>
                    <span className="text-accent">{exercise.sets} sets</span>
                  </div>
                ))}
              </div>
              <ButtonGlow variant="accent-glow" size="lg" onClick={startWorkout} className="w-full">
                <Play className="mr-2 h-5 w-5" /> Start Workout
              </ButtonGlow>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-charcoal pb-20">
      <div className="container max-w-md px-4 py-6">
        <div className="mb-6 flex items-center">
          <button onClick={() => router.back()} className="mr-4 rounded-full p-2 hover:bg-white/10">
            <ArrowLeft className="h-6 w-6 text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white">Workout in Progress</h1>
            <div className="flex items-center justify-between">
              {workoutMode === "sets" ? (
                <p className="text-white/70">
                  Exercise {currentExerciseIndex + 1} of {exercises.length}
                </p>
              ) : (
                <p className="text-white/70">
                  Round {currentRound} • Exercise {currentExerciseIndex + 1}/{exercises.length}
                </p>
              )}
              <span className="text-accent">{Math.round(workoutProgress)}% Complete</span>
            </div>
          </div>
        </div>

        <div className="mb-4 flex items-center justify-center gap-2">
          <div className="flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-sm">
            {workoutMode === "sets" ? (
              <>
                <ListOrdered className="h-4 w-4 text-accent" />
                <span className="text-accent">Sets Mode</span>
              </>
            ) : (
              <>
                <Repeat className="h-4 w-4 text-accent" />
                <span className="text-accent">Rounds Mode</span>
              </>
            )}
          </div>
        </div>

        <Card className="mb-6 border-white/10 bg-black/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <Progress value={workoutProgress} className="mb-2 h-2 bg-white/10" indicatorClassName="bg-accent" />
            <p className="text-center text-sm text-white/70">
              {completedExercises} of {exercises.length} exercises completed
            </p>
          </CardContent>
        </Card>

        {completedExercises === exercises.length ? (
          <Card className="mb-6 border-accent/30 bg-black/50 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <CheckCircle className="mx-auto mb-4 h-16 w-16 text-accent" />
              <h2 className="mb-2 text-2xl font-bold text-white">Workout Complete!</h2>
              <p className="mb-6 text-white/70">Great job! You've completed all exercises.</p>
              <ButtonGlow
                variant="accent-glow"
                onClick={() => router.push("/fitness?completed=true")}
                className="w-full"
              >
                Finish Workout
              </ButtonGlow>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="mb-6 border-white/10 bg-black/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="mb-4 flex items-center justify-center gap-2">
                  <h2 className="text-2xl font-bold text-white">{currentExercise.name}</h2>
                  <button
                    onClick={() => setIsSwapDialogOpen(true)}
                    className="rounded-full p-2 hover:bg-white/10 transition-colors"
                    title="Swap exercise"
                  >
                    <RefreshCw className="h-5 w-5 text-accent" />
                  </button>
                </div>
                <div className="mb-4 text-center">
                  {workoutMode === "sets" ? (
                    <p className="text-accent">
                      Set {currentSet} of {currentExercise.sets}
                    </p>
                  ) : (
                    <p className="text-accent">
                      Set {currentExercise.completedSets + 1} of {currentExercise.sets}
                    </p>
                  )}
                </div>

                <div className="mb-6 aspect-video rounded-lg bg-black/70 flex items-center justify-center">
                  <img
                    src={`/.jpg?key=79srd&height=200&width=300&query=${currentExercise.name} exercise demonstration`}
                    alt={`${currentExercise.name} demonstration`}
                    className="h-full w-full rounded object-cover"
                  />
                </div>

                {currentExercise.setLogs.length > 0 && (
                  <div className="mb-4 rounded-lg border border-white/10 bg-black/30 p-3">
                    <h3 className="mb-2 text-sm font-semibold text-white/70">Previous Sets</h3>
                    <div className="space-y-1">
                      {currentExercise.setLogs.map((log) => (
                        <div key={log.setNumber} className="flex items-center justify-between text-sm">
                          <span className="text-white/60">Set {log.setNumber}</span>
                          <span className="text-accent font-semibold">
                            {log.weight} {log.unit} × {log.reps} reps
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!isResting && (
                  <div className="mb-6 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="weight-input" className="mb-2 flex items-center gap-1 text-sm text-white/80">
                          <Dumbbell className="h-4 w-4" />
                          Weight
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            id="weight-input"
                            type="number"
                            value={currentWeight}
                            onChange={(e) => setCurrentWeight(e.target.value)}
                            className="border-white/10 bg-black/30 text-white"
                            placeholder="135"
                            min="0"
                            step="5"
                          />
                          <select
                            value={weightUnit}
                            onChange={(e) => setWeightUnit(e.target.value as "lbs" | "kg")}
                            className="rounded-md border border-white/10 bg-black/30 px-3 text-white"
                          >
                            <option value="lbs">lbs</option>
                            <option value="kg">kg</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="reps-input" className="mb-2 text-sm text-white/80">
                          Reps
                        </Label>
                        <Input
                          id="reps-input"
                          type="number"
                          value={currentReps}
                          onChange={(e) => setCurrentReps(e.target.value)}
                          className="border-white/10 bg-black/30 text-white"
                          placeholder={currentExercise.reps}
                          min="0"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="mb-6 grid grid-cols-2 gap-4 text-center">
                  <div className="rounded bg-black/30 p-3">
                    <p className="text-white/60">Target Reps</p>
                    <p className="text-xl font-bold text-white">{currentExercise.reps}</p>
                  </div>
                  <div className="rounded bg-black/30 p-3 relative">
                    <div className="flex items-center justify-center gap-1">
                      <p className="text-white/60">Rest Time</p>
                      {restEnabled && (
                        <button
                          onClick={openEditRestDialog}
                          className="rounded p-1 hover:bg-white/10 transition-colors"
                          title="Edit rest time"
                        >
                          <Edit2 className="h-3 w-3 text-accent" />
                        </button>
                      )}
                    </div>
                    <p className="text-xl font-bold text-white">{restEnabled ? `${currentExercise.rest}s` : "Off"}</p>
                  </div>
                </div>

                {isResting ? (
                  <div className="text-center">
                    <h3 className="mb-2 text-lg font-bold text-accent">Rest Time</h3>
                    <div className="mb-4 text-4xl font-bold text-white">{formatTime(restTimer)}</div>
                    <div className="flex gap-3">
                      <ButtonGlow variant="outline-glow" onClick={skipRest} className="flex-1">
                        <SkipForward className="mr-2 h-4 w-4" /> Skip Rest
                      </ButtonGlow>
                      <ButtonGlow
                        variant="accent-glow"
                        onClick={() => setIsTimerRunning(!isTimerRunning)}
                        className="flex-1"
                      >
                        {isTimerRunning ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                        {isTimerRunning ? "Pause" : "Resume"}
                      </ButtonGlow>
                    </div>
                  </div>
                ) : (
                  <ButtonGlow variant="accent-glow" onClick={completeSet} className="w-full">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    {workoutMode === "sets"
                      ? `Complete Set ${currentSet}`
                      : `Complete Set ${currentExercise.completedSets + 1}`}
                  </ButtonGlow>
                )}
              </CardContent>
            </Card>

            <ButtonGlow variant="outline-glow" onClick={completeWorkout} className="w-full">
              End Workout Early
            </ButtonGlow>
          </>
        )}
      </div>
    </div>
  )
}
