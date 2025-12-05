"use server"

import { createClient, getAuthUser } from "@/lib/supabase/server"

export async function submitAppRating(rating: number, feedback?: string) {
  if (!rating || rating < 1 || rating > 5) {
    return { success: false, error: "Rating must be between 1 and 5" }
  }

  const { user, error } = await getAuthUser()
  if (error || !user) {
    return { success: false, error: "Not authenticated" }
  }

  const supabase = await createClient()
  const { error: insertError } = await supabase.from("app_ratings").insert({
    user_id: user.id,
    rating,
    feedback: feedback?.trim() || null,
  })

  if (insertError) {
    console.error("[Ratings] Failed to submit rating:", insertError)
    return { success: false, error: "Unable to submit rating right now" }
  }

  return { success: true }
}

