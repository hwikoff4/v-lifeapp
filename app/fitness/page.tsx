import { getActiveWorkout, getWorkoutOverview } from "@/lib/actions/workouts"
import { getTodaysProgrammingContext } from "@/lib/workout-programming"
import { FitnessClient } from "./FitnessClient"

/**
 * Fitness page - fetches only page-specific workout data
 * 
 * User profile data is now read from the global AppDataProvider cache,
 * eliminating redundant profile queries on every navigation.
 */
export default async function FitnessPage() {
  // Only fetch page-specific workout data
  const [workout, overview] = await Promise.all([getActiveWorkout(), getWorkoutOverview()])
  const programmingContext = getTodaysProgrammingContext()

  return (
    <FitnessClient
      activeWorkout={workout}
      overview={overview}
      programmingContext={programmingContext}
    />
  )
}

