import { getActiveWorkout } from "@/lib/actions/workouts"
import WorkoutSession from "./WorkoutSession"

export default async function WorkoutPage() {
  const workout = await getActiveWorkout()
  return <WorkoutSession initialWorkout={workout} />
}

