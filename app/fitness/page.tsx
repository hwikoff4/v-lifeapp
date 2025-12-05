import { getActiveWorkout, getWorkoutOverview } from "@/lib/actions/workouts"
import { getProfile } from "@/lib/actions/profile"
import { FitnessClient } from "./FitnessClient"

export default async function FitnessPage() {
  const [workout, overview, profile] = await Promise.all([getActiveWorkout(), getWorkoutOverview(), getProfile()])
  const name = profile.profile?.name?.split(" ")[0] || "there"
  return <FitnessClient userName={name} activeWorkout={workout} overview={overview} />
}

