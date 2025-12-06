"use client"

import { useEffect } from "react"
import { updateUserTimezone } from "@/lib/actions/timezone"

/**
 * Hook to detect and sync user's browser timezone with their profile.
 * Runs once on mount and updates the profile if timezone has changed.
 */
export function useTimezoneSync() {
  useEffect(() => {
    async function syncTimezone() {
      try {
        // Detect browser timezone
        const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
        
        if (!detectedTimezone) {
          console.warn("[useTimezoneSync] Could not detect timezone")
          return
        }

        // Get stored timezone from localStorage to avoid unnecessary API calls
        const storedTimezone = localStorage.getItem("user-timezone")
        
        if (storedTimezone !== detectedTimezone) {
          // Timezone has changed or is not set - update profile
          console.log("[useTimezoneSync] Updating timezone:", detectedTimezone)
          
          const result = await updateUserTimezone(detectedTimezone)
          
          if (result.success) {
            localStorage.setItem("user-timezone", detectedTimezone)
          } else {
            console.error("[useTimezoneSync] Failed to update timezone:", result.error)
          }
        }
      } catch (error) {
        console.error("[useTimezoneSync] Error syncing timezone:", error)
      }
    }

    syncTimezone()
  }, [])
}

/**
 * Get the user's current timezone from browser
 */
export function getBrowserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "America/New_York"
  } catch {
    return "America/New_York"
  }
}

/**
 * Get the current local date in YYYY-MM-DD format based on timezone
 */
export function getLocalDate(timezone?: string): string {
  const tz = timezone || getBrowserTimezone()
  
  const now = new Date()
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })

  const parts = formatter.formatToParts(now)
  const year = parts.find((p) => p.type === "year")?.value
  const month = parts.find((p) => p.type === "month")?.value
  const day = parts.find((p) => p.type === "day")?.value

  return `${year}-${month}-${day}`
}

