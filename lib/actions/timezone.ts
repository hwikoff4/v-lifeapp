"use server"

import { createClient, getAuthUser } from "@/lib/supabase/server"

/**
 * Update the user's timezone in their profile
 */
export async function updateUserTimezone(timezone: string): Promise<{ success: boolean; error: string | null }> {
  const { user, error: authError } = await getAuthUser()

  if (authError || !user) {
    return { success: false, error: "Not authenticated" }
  }

  // Validate timezone format (basic check)
  if (!timezone || timezone.length < 3 || !timezone.includes("/")) {
    return { success: false, error: "Invalid timezone format" }
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from("profiles")
    .update({ timezone })
    .eq("id", user.id)

  if (error) {
    console.error("[updateUserTimezone] Error:", error)
    return { success: false, error: error.message }
  }

  return { success: true, error: null }
}

