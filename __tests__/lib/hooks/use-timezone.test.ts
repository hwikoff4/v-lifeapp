import { describe, it, expect } from "@jest/globals"
import { getBrowserTimezone, getLocalDate } from "@/lib/hooks/use-timezone"

describe("useTimezone Hook Utilities", () => {
  describe("getBrowserTimezone", () => {
    it("should return a valid timezone string", () => {
      const tz = getBrowserTimezone()
      expect(tz).toBeTruthy()
      expect(typeof tz).toBe("string")
      // Should contain a slash for IANA timezone format
      expect(tz).toMatch(/\//)
    })

    it("should return a fallback timezone on error", () => {
      // Mock Intl to throw error
      const originalIntl = global.Intl
      // @ts-expect-error - intentionally breaking Intl for testing
      global.Intl = undefined
      
      const tz = getBrowserTimezone()
      expect(tz).toBe("America/New_York")
      
      // Restore Intl
      global.Intl = originalIntl
    })
  })

  describe("getLocalDate", () => {
    it("should return date in YYYY-MM-DD format", () => {
      const result = getLocalDate("America/New_York")
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })

    it("should use browser timezone when no timezone provided", () => {
      const result = getLocalDate()
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })

    it("should handle different timezones", () => {
      const ny = getLocalDate("America/New_York")
      const utc = getLocalDate("UTC")
      const tokyo = getLocalDate("Asia/Tokyo")
      
      expect(ny).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(utc).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(tokyo).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })
  })
})

