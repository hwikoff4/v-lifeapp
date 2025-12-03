import { createClient } from "@/lib/supabase/server"

const DEFAULT_TIMEZONE = "America/New_York"

/**
 * Gets the user's timezone from their profile.
 * Falls back to America/New_York if not set or on error.
 */
export async function getUserTimezone(): Promise<string> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return DEFAULT_TIMEZONE

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("timezone")
      .eq("id", user.id)
      .single()

    if (error) {
      // Column might not exist yet in some environments
      if (error.code !== "PGRST116") {
        console.error("[getUserTimezone] Error:", error.message)
      }
      return DEFAULT_TIMEZONE
    }

    return profile?.timezone || DEFAULT_TIMEZONE
  } catch (error) {
    console.error("[getUserTimezone] Exception:", error)
    return DEFAULT_TIMEZONE
  }
}

/**
 * Gets the authenticated user or throws if not authenticated.
 * Use this when authentication is required.
 */
export async function requireUser() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    throw new Error("Not authenticated")
  }

  return { user, supabase }
}

/**
 * Gets the authenticated user or returns null.
 * Use this when authentication is optional.
 */
export async function getUser() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return { user, supabase }
}

