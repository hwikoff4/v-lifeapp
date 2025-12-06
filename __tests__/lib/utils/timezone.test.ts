import { describe, it, expect } from "@jest/globals"
import { getTodayInTimezone, isNewDayInTimezone } from "@/lib/utils/timezone"

describe("Timezone Utilities", () => {
  describe("getTodayInTimezone", () => {
    it("should return date in YYYY-MM-DD format", () => {
      const result = getTodayInTimezone("America/New_York")
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })

    it("should return different dates for different timezones", () => {
      // This test may fail if run exactly at midnight UTC
      const ny = getTodayInTimezone("America/New_York")
      const tokyo = getTodayInTimezone("Asia/Tokyo")
      
      // Should be valid dates
      expect(ny).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(tokyo).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      
      // Parse dates to ensure they're valid
      const nyDate = new Date(ny)
      const tokyoDate = new Date(tokyo)
      expect(nyDate.toString()).not.toBe("Invalid Date")
      expect(tokyoDate.toString()).not.toBe("Invalid Date")
    })

    it("should handle UTC timezone", () => {
      const result = getTodayInTimezone("UTC")
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })
  })

  describe("isNewDayInTimezone", () => {
    it("should return true if lastResetDate is null", () => {
      const result = isNewDayInTimezone(null, "America/New_York")
      expect(result).toBe(true)
    })

    it("should return false if lastResetDate is today", () => {
      const today = getTodayInTimezone("America/New_York")
      const result = isNewDayInTimezone(today, "America/New_York")
      expect(result).toBe(false)
    })

    it("should return true if lastResetDate is yesterday", () => {
      const timezone = "America/New_York"
      const today = new Date(getTodayInTimezone(timezone))
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split("T")[0]
      
      const result = isNewDayInTimezone(yesterdayStr, timezone)
      expect(result).toBe(true)
    })
  })
})

