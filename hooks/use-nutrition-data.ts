"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import type { Macros, Supplement } from "@/lib/types"
import type { DailyMeal } from "@/lib/actions/nutrition"

interface NutritionData {
  meals: DailyMeal[]
  totals: { calories: number; protein: number; carbs: number; fat: number }
  macros: Macros
  supplements: Supplement[]
  tomorrowMeals: DailyMeal[]
}

interface UseNutritionDataReturn {
  data: NutritionData | null
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
}

const DEFAULT_MACROS: Macros = {
  calories: { current: 0, target: 2200 },
  protein: { current: 0, target: 160, unit: "g" },
  carbs: { current: 0, target: 220, unit: "g" },
  fat: { current: 0, target: 70, unit: "g" },
}

// Simple in-memory cache
let cachedData: NutritionData | null = null
let cacheTimestamp = 0
const CACHE_TTL = 30000 // 30 seconds

export function useNutritionData(): UseNutritionDataReturn {
  const [data, setData] = useState<NutritionData | null>(cachedData)
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
      // Fetch nutrition data from server actions (dynamically imported)
      const { getDailyMealPlan, getNutritionTargets, getRecommendedSupplements } = await import("@/lib/actions/nutrition")
      
      const [dailyPlan, targets, supplements] = await Promise.all([
        getDailyMealPlan(),
        getNutritionTargets(),
        getRecommendedSupplements(3),
      ])

      const newData: NutritionData = {
        meals: dailyPlan.meals,
        totals: dailyPlan.totals,
        macros: targets.macros,
        supplements,
        tomorrowMeals: dailyPlan.tomorrowMeals,
      }

      // Update cache
      cachedData = newData
      cacheTimestamp = Date.now()

      setData(newData)
      setError(null)
    } catch (err) {
      console.error("[useNutritionData] Error:", err)
      setError(err instanceof Error ? err.message : "Failed to load nutrition data")
      
      // Provide default data on error
      if (!data) {
        setData({
          meals: [],
          totals: { calories: 0, protein: 0, carbs: 0, fat: 0 },
          macros: DEFAULT_MACROS,
          supplements: [],
          tomorrowMeals: [],
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

// Export function to invalidate cache (call after meal changes, etc.)
export function invalidateNutritionCache() {
  cachedData = null
  cacheTimestamp = 0
}
