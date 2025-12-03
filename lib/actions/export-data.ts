"use server"

import { createClient } from "@/lib/supabase/server"

export async function exportUserData() {
  const supabase = await createClient()

  // Get authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: "Not authenticated" }
  }

  try {
    // Fetch all user data from various tables
    const [
      profileResult,
      habitsResult,
      habitLogsResult,
      workoutsResult,
      workoutExercisesResult,
      exerciseLogsResult,
      mealsResult,
      mealLogsResult,
      weightEntriesResult,
      progressPhotosResult,
      supplementLogsResult,
      groceryListsResult,
      postsResult,
      commentsResult,
      followsResult,
      postReactionsResult,
      referralsResult,
      creditTransactionsResult,
      streaksResult,
      challengeParticipantsResult,
      notificationLogsResult,
    ] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase.from("habits").select("*").eq("user_id", user.id),
      supabase.from("habit_logs").select("*").eq("user_id", user.id),
      supabase.from("workouts").select("*").eq("user_id", user.id),
      supabase.from("workout_exercises").select("*, workouts!inner(user_id)").eq("workouts.user_id", user.id),
      supabase.from("exercise_logs").select("*").eq("user_id", user.id),
      supabase.from("meals").select("*").eq("user_id", user.id),
      supabase.from("meal_logs").select("*").eq("user_id", user.id),
      supabase.from("weight_entries").select("*").eq("user_id", user.id),
      supabase.from("progress_photos").select("*").eq("user_id", user.id),
      supabase.from("supplement_logs").select("*").eq("user_id", user.id),
      supabase.from("grocery_lists").select("*").eq("user_id", user.id),
      supabase.from("posts").select("*").eq("user_id", user.id),
      supabase.from("comments").select("*").eq("user_id", user.id),
      supabase.from("follows").select("*").or(`follower_id.eq.${user.id},following_id.eq.${user.id}`),
      supabase.from("post_reactions").select("*").eq("user_id", user.id),
      supabase.from("referrals").select("*").eq("referrer_id", user.id),
      supabase.from("credit_transactions").select("*").eq("user_id", user.id),
      supabase.from("streaks").select("*").eq("user_id", user.id),
      supabase.from("challenge_participants").select("*").eq("user_id", user.id),
      supabase.from("notification_logs").select("*").eq("user_id", user.id),
    ])

    // Compile all data into a comprehensive export object
    const exportData = {
      exportDate: new Date().toISOString(),
      userId: user.id,
      userEmail: user.email,
      profile: profileResult.data || null,
      fitness: {
        habits: habitsResult.data || [],
        habitLogs: habitLogsResult.data || [],
        workouts: workoutsResult.data || [],
        workoutExercises: workoutExercisesResult.data || [],
        exerciseLogs: exerciseLogsResult.data || [],
        streaks: streaksResult.data || [],
        challengeParticipants: challengeParticipantsResult.data || [],
      },
      nutrition: {
        meals: mealsResult.data || [],
        mealLogs: mealLogsResult.data || [],
        supplementLogs: supplementLogsResult.data || [],
        groceryLists: groceryListsResult.data || [],
      },
      progress: {
        weightEntries: weightEntriesResult.data || [],
        progressPhotos: progressPhotosResult.data || [],
      },
      community: {
        posts: postsResult.data || [],
        comments: commentsResult.data || [],
        follows: followsResult.data || [],
        postReactions: postReactionsResult.data || [],
      },
      rewards: {
        referrals: referralsResult.data || [],
        creditTransactions: creditTransactionsResult.data || [],
      },
      notifications: {
        notificationLogs: notificationLogsResult.data || [],
      },
    }

    return { data: exportData }
  } catch (error) {
    console.error("[v0] Error exporting user data:", error)
    return { error: "Failed to export data" }
  }
}
