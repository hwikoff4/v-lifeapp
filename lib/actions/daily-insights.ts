"use server"

import { createClient, getAuthUser } from "@/lib/supabase/server"
import { getUserTimezone } from "@/lib/utils/user-helpers"
import { getTodayInTimezone } from "@/lib/utils/timezone"
import type { DailyInsightResult } from "@/lib/types"

/**
 * Get or create the daily insight for the current user.
 * This calls the Supabase Edge Function which handles:
 * - Checking for existing insight (cached)
 * - Building user snapshot from DB
 * - Generating new insight via OpenAI if needed
 * - Storing in database with idempotency
 */
export async function getDailyInsight(): Promise<DailyInsightResult> {
  const { user, error: authError } = await getAuthUser()

  if (authError || !user) {
    return {
      insight: null,
      error: "Not authenticated",
    }
  }

  try {
    const supabase = await createClient()
    
    // Get user's timezone and calculate local date
    const timezone = await getUserTimezone()
    const localDate = getTodayInTimezone(timezone)

    // Get auth session for edge function call
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return {
        insight: null,
        error: "No active session",
      }
    }

    // Call the Supabase Edge Function
    const { data, error } = await supabase.functions.invoke("daily-insight", {
      body: {
        localDate,
        timezone,
      },
    })

    if (error) {
      console.error("[getDailyInsight] Edge function error:", error)
      
      // Return a fallback message on error
      return {
        insight: "Keep pushing forward! Every small step counts toward your goals.",
        error: null, // Don't expose error to user, just use fallback
      }
    }

    if (!data?.insight) {
      return {
        insight: "Stay focused on your journey. You've got this!",
        error: null,
      }
    }

    return {
      insight: data.insight,
      error: null,
    }
  } catch (error) {
    console.error("[getDailyInsight] Unexpected error:", error)
    
    // Fallback message
    return {
      insight: "Start small and build momentum. Complete one habit today!",
      error: null,
    }
  }
}

/**
 * Force regenerate today's insight (for testing or manual refresh)
 */
export async function regenerateDailyInsight(): Promise<DailyInsightResult> {
  const { user, error: authError } = await getAuthUser()

  if (authError || !user) {
    return {
      insight: null,
      error: "Not authenticated",
    }
  }

  try {
    const supabase = await createClient()
    const timezone = await getUserTimezone()
    const localDate = getTodayInTimezone(timezone)

    // Delete existing insight for today
    await supabase
      .from("daily_insights")
      .delete()
      .eq("user_id", user.id)
      .eq("local_date", localDate)

    // Get new insight
    return await getDailyInsight()
  } catch (error) {
    console.error("[regenerateDailyInsight] Error:", error)
    return {
      insight: null,
      error: error instanceof Error ? error.message : "Failed to regenerate insight",
    }
  }
}

