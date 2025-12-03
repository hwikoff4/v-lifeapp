// Utility functions for timezone-aware date handling

export function getTodayInTimezone(timezone: string): string {
  // Get current date in user's timezone
  const now = new Date()
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
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

export function getMidnightInTimezone(timezone: string): Date {
  // Get midnight in user's timezone
  const today = getTodayInTimezone(timezone)
  const [year, month, day] = today.split("-").map(Number)

  // Create date at midnight in user's timezone
  const midnight = new Date()
  midnight.setFullYear(year, month - 1, day)
  midnight.setHours(0, 0, 0, 0)

  return midnight
}

export function isNewDayInTimezone(lastResetDate: string | null, timezone: string): boolean {
  if (!lastResetDate) return true

  const today = getTodayInTimezone(timezone)
  return lastResetDate !== today
}

export function getTimezoneOffset(timezone: string): number {
  const now = new Date()
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "numeric",
    hour12: false,
  })

  const tzTime = new Date(formatter.format(now))
  const localTime = new Date(now.toLocaleString("en-US", { timeZone: "UTC" }))

  return (tzTime.getTime() - localTime.getTime()) / (1000 * 60 * 60)
}

// Common timezones for selection
export const COMMON_TIMEZONES = [
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "America/Anchorage", label: "Alaska Time (AKT)" },
  { value: "Pacific/Honolulu", label: "Hawaii Time (HT)" },
  { value: "Europe/London", label: "London (GMT/BST)" },
  { value: "Europe/Paris", label: "Paris (CET/CEST)" },
  { value: "Europe/Berlin", label: "Berlin (CET/CEST)" },
  { value: "Asia/Dubai", label: "Dubai (GST)" },
  { value: "Asia/Kolkata", label: "India (IST)" },
  { value: "Asia/Singapore", label: "Singapore (SGT)" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)" },
  { value: "Australia/Sydney", label: "Sydney (AEDT/AEST)" },
  { value: "Pacific/Auckland", label: "Auckland (NZDT/NZST)" },
]
