"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import type { FoodLogEntry, DailyFoodSummary } from "@/lib/actions/food-logging"

interface FoodLogData {
  logs: FoodLogEntry[]
  summary: DailyFoodSummary | null
}

interface UseFoodLogDataReturn {
  data: FoodLogData | null
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
  selectedDate: string
  setSelectedDate: (date: string) => void
}

// Simple in-memory cache by date
const cache = new Map<string, { data: FoodLogData; timestamp: number }>()
const CACHE_TTL = 30000 // 30 seconds

export function useFoodLogData(initialDate?: string): UseFoodLogDataReturn {
  const [selectedDate, setSelectedDate] = useState(
    initialDate || new Date().toISOString().split("T")[0]
  )
  const [data, setData] = useState<FoodLogData | null>(() => {
    const cached = cache.get(selectedDate)
    return cached && Date.now() - cached.timestamp < CACHE_TTL ? cached.data : null
  })
  const [isLoading, setIsLoading] = useState(!data)
  const [error, setError] = useState<string | null>(null)
  const fetchInProgress = useRef(false)

  const fetchData = useCallback(async (force = false) => {
    const now = Date.now()
    const cached = cache.get(selectedDate)
    
    if (!force && cached && now - cached.timestamp < CACHE_TTL) {
      setData(cached.data)
      setIsLoading(false)
      return
    }

    if (fetchInProgress.current) return
    fetchInProgress.current = true

    if (!cached) {
      setIsLoading(true)
    }

    try {
      const { getFoodLogsForDate } = await import("@/lib/actions/food-logging")
      const result = await getFoodLogsForDate(selectedDate)

      const newData: FoodLogData = {
        logs: result.logs,
        summary: result.summary,
      }

      cache.set(selectedDate, { data: newData, timestamp: Date.now() })
      setData(newData)
      setError(null)
    } catch (err) {
      console.error("[useFoodLogData] Error:", err)
      setError(err instanceof Error ? err.message : "Failed to load food logs")
      
      if (!data) {
        setData({ logs: [], summary: null })
      }
    } finally {
      setIsLoading(false)
      fetchInProgress.current = false
    }
  }, [selectedDate, data])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const refresh = useCallback(async () => {
    await fetchData(true)
  }, [fetchData])

  return { data, isLoading, error, refresh, selectedDate, setSelectedDate }
}

// Export function to invalidate cache
export function invalidateFoodLogCache(date?: string) {
  if (date) {
    cache.delete(date)
  } else {
    cache.clear()
  }
}
