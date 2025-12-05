"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ButtonGlow } from "@/components/ui/button-glow"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import type { ActiveWorkoutPayload } from "@/lib/actions/workouts"
import { ArrowLeft, CheckCircle, ListOrdered, Repeat } from "lucide-react"

interface WorkoutSessionProps {
  initialWorkout: ActiveWorkoutPayload | null
}

export default function WorkoutSession({ initialWorkout }: WorkoutSessionProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [workout] = useState(initialWorkout)
  const [inputs, setInputs] = useState<Record<string, { weight: string; reps: string }>>({})
  const [pendingExercise, setPendingExercise] = useState<string | null>(null)
  const [completingWorkout, setCompletingWorkout] = useState(false)

  if (!workout) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-charcoal pb-20 flex items-center justify-center text-white/70">
        No workout scheduled for today.
      </div>
    )
  }

  const handleInputChange = (exerciseId: string, field: "weight" | "reps", value: string) => {
    setInputs((prev) => ({
      ...prev,
      [exerciseId]: {
        weight: field === "weight" ? value : prev[exerciseId]?.weight || "",
        reps: field === "reps" ? value : prev[exerciseId]?.reps || "",
      },
    }))
  }

  const handleLogSet = async (exerciseId: string, workoutExerciseId: string, totalSets: number, completedSets: number) => {
    const payload = inputs[exerciseId]
    const weightValue = Number.parseFloat(payload?.weight || "0")
    const repsValue = Number.parseInt(payload?.reps || "0", 10)

    if (!weightValue || !repsValue) {
      toast({
        title: "Enter set details",
        description: "Provide weight and reps before completing a set.",
        variant: "destructive",
      })
      return
    }

    setPendingExercise(workoutExerciseId)
    const { logExerciseSet } = await import("@/lib/actions/workouts")
    const result = await logExerciseSet({
      workoutExerciseId,
      workoutId: workout.workoutId,
      exerciseId,
      setNumber: completedSets + 1,
      totalSets,
      weight: weightValue,
      reps: repsValue,
      unit: "lbs",
    })
    setPendingExercise(null)

    if (!result.success) {
      toast({
        title: "Unable to log set",
        description: result.error || "Please try again.",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Set logged",
      description: "Great work!",
    })
    router.refresh()
  }

  const handleCompleteWorkout = async () => {
    setCompletingWorkout(true)
    const { completeWorkout } = await import("@/lib/actions/workouts")
    const result = await completeWorkout(workout.workoutId)
    setCompletingWorkout(false)
    if (!result.success) {
      toast({
        title: "Unable to complete workout",
        description: result.error || "Please try again.",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Workout complete",
      description: "Way to finish strong!",
    })
    router.push("/fitness?completed=true")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-charcoal pb-20">
      <div className="container max-w-md px-4 py-6 space-y-6">
        <div className="flex items-center mb-4">
          <button onClick={() => router.back()} className="mr-4 rounded-full p-2 hover:bg-white/10">
            <ArrowLeft className="h-6 w-6 text-white" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">{workout.name}</h1>
            <p className="text-white/70 capitalize">{workout.workoutType}</p>
          </div>
        </div>

        <Card className="border-white/10 bg-black/50 backdrop-blur-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-white/70">Mode</p>
              <p className="text-white font-semibold flex items-center gap-2">
                {workout.mode === "rounds" ? (
                  <>
                    <Repeat className="h-4 w-4" /> Rounds
                  </>
                ) : (
                  <>
                    <ListOrdered className="h-4 w-4" /> Sets
                  </>
                )}
              </p>
            </div>
            {workout.durationMinutes && (
              <div>
                <p className="text-sm text-white/70">Duration</p>
                <p className="text-white font-semibold">{workout.durationMinutes} min</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          {workout.exercises.map((exercise) => (
            <Card key={exercise.workoutExerciseId} className="border-white/10 bg-black/60 backdrop-blur-sm">
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-accent capitalize">{exercise.category || "Strength"}</p>
                    <h3 className="text-white font-bold">{exercise.name}</h3>
                  </div>
                  <span className="text-sm text-white/70">
                    {exercise.completedSets}/{exercise.sets} sets
                  </span>
                </div>

                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Weight"
                    value={inputs[exercise.exerciseId]?.weight || ""}
                    onChange={(e) => handleInputChange(exercise.exerciseId, "weight", e.target.value)}
                    className="bg-black/40 border-white/10 text-white"
                  />
                  <Input
                    type="number"
                    placeholder="Reps"
                    value={inputs[exercise.exerciseId]?.reps || ""}
                    onChange={(e) => handleInputChange(exercise.exerciseId, "reps", e.target.value)}
                    className="bg-black/40 border-white/10 text-white"
                  />
                </div>

                <ButtonGlow
                  variant="accent-glow"
                  className="w-full"
                  disabled={pendingExercise === exercise.workoutExerciseId || exercise.completed}
                  onClick={() =>
                    handleLogSet(exercise.exerciseId, exercise.workoutExerciseId, exercise.sets, exercise.completedSets)
                  }
                >
                  {exercise.completed
                    ? "Exercise Completed"
                    : pendingExercise === exercise.workoutExerciseId
                      ? "Saving..."
                      : "Log Set"}
                </ButtonGlow>
              </CardContent>
            </Card>
          ))}
        </div>

        <ButtonGlow
          variant="accent-glow"
          className="w-full flex items-center justify-center gap-2"
          onClick={handleCompleteWorkout}
          disabled={completingWorkout}
        >
          <CheckCircle className="h-4 w-4" />
          {completingWorkout ? "Finishing..." : "Finish Workout"}
        </ButtonGlow>
      </div>
    </div>
  )
}

