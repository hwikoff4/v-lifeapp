"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import type { ActiveWorkoutPayload, WorkoutOverview } from "@/lib/actions/workouts"
import { getTodaysProgrammingContext } from "@/lib/workout-programming"

interface ProgrammingContext {
  dayName: string
  emphasis: string
  weekPhase: string
  isSunday: boolean
}

interface FitnessData {
  activeWorkout: ActiveWorkoutPayload | null
  overview: WorkoutOverview
  programmingContext: ProgrammingContext
}

interface UseFitnessDataReturn {
  data: FitnessData | null
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
}

const DEFAULT_OVERVIEW: WorkoutOverview = {
  weeklyWorkoutData: [],
  exerciseCompletionData: [],
  totalWorkoutsThisMonth: 0,
  avgWorkoutsPerWeek: 0,
  workoutChange: 0,
  volumeChange: 0,
  cardioChange: 0,
}

// Simple in-memory cache
let cachedData: FitnessData | null = null
let cacheTimestamp = 0
const CACHE_TTL = 30000 // 30 seconds

export function useFitnessData(): UseFitnessDataReturn {
  const [data, setData] = useState<FitnessData | null>(cachedData)
  const [isLoading, setIsLoading] = useState(!cachedData)
  const [error, setError] = useState<string | null>(null)
  const fetchInProgress = useRef(false)

  const fetchData = useCallback(async (force = false) => {
    // Check cache
    const now = Date.now()
    if (!force && cachedData && now - cacheTimestamp < CACHE_TTL) {
      setData(cachedData)
      setIsLoading(false)
      return
    }

    // Prevent concurrent fetches
    if (fetchInProgress.current) return
    fetchInProgress.current = true

    if (!cachedData) {
      setIsLoading(true)
    }

    try {
      // Fetch workout data from server actions (dynamically imported)
      const { getActiveWorkout, getWorkoutOverview } = await import("@/lib/actions/workouts")
      
      const [workout, overview] = await Promise.all([
        getActiveWorkout(),
        getWorkoutOverview(),
      ])

      // Get programming context (pure function, runs client-side)
      const programmingContext = getTodaysProgrammingContext()

      const newData: FitnessData = {
        activeWorkout: workout,
        overview: overview || DEFAULT_OVERVIEW,
        programmingContext,
      }

      // Update cache
      cachedData = newData
      cacheTimestamp = Date.now()

      setData(newData)
      setError(null)
    } catch (err) {
      console.error("[useFitnessData] Error:", err)
      setError(err instanceof Error ? err.message : "Failed to load fitness data")
      
      // Still provide programming context even on error
      if (!data) {
        setData({
          activeWorkout: null,
          overview: DEFAULT_OVERVIEW,
          programmingContext: getTodaysProgrammingContext(),
        })
      }
    } finally {
      setIsLoading(false)
      fetchInProgress.current = false
    }
  }, [data])

  // Initial fetch
  useEffect(() => {
    fetchData()
  }, [fetchData])

  const refresh = useCallback(async () => {
    await fetchData(true)
  }, [fetchData])

  return { data, isLoading, error, refresh }
}

// Export function to invalidate cache (call after workout completion, etc.)
export function invalidateFitnessCache() {
  cachedData = null
  cacheTimestamp = 0
}
