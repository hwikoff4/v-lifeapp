"use server"

import { createClient } from "@/lib/supabase/server"
import { getTodayInTimezone, isNewDayInTimezone } from "@/lib/utils/timezone"
import { getUserTimezone } from "@/lib/utils/user-helpers"
import type { HabitWithStatus, HabitsResult, ProgressResult } from "@/lib/types"

async function checkAndResetHabitsIfNeeded() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return

  const timezone = await getUserTimezone()
  const today = getTodayInTimezone(timezone)

  try {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("last_habit_reset")
      .eq("id", user.id)
      .single()

    if (error) {
      // Column might not exist yet
      return
    }

    const lastReset = profile?.last_habit_reset

    // Check if it's a new day
    if (isNewDayInTimezone(lastReset, timezone)) {
      // Update last reset date
      await supabase.from("profiles").update({ last_habit_reset: today }).eq("id", user.id)
      // Note: We don't delete old logs, we just create new ones for today
    }
  } catch {
    // Silently handle errors during reset check
    return
  }
}

export async function getUserHabits(): Promise<HabitsResult> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { habits: [], error: "Not authenticated" }
  }

  await checkAndResetHabitsIfNeeded()

  // Get user's habits
  const { data: habits, error: habitsError } = await supabase
    .from("habits")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })

  if (habitsError) {
    console.error("[Habits] Error fetching habits:", habitsError)
    return { habits: [], error: habitsError.message }
  }

  const timezone = await getUserTimezone()
  const today = getTodayInTimezone(timezone)

  const { data: logs, error: logsError } = await supabase
    .from("habit_logs")
    .select("*")
    .eq("user_id", user.id)
    .eq("logged_at", today)

  if (logsError) {
    console.error("[Habits] Error fetching habit logs:", logsError)
  }

  // Merge habits with today's completion status
  const habitsWithStatus: HabitWithStatus[] = (habits || []).map((habit) => {
    const log = logs?.find((l) => l.habit_id === habit.id)
    return {
      ...habit,
      completed: log?.completed || false,
      logId: log?.id || null,
    }
  })

  return { habits: habitsWithStatus, error: null }
}

export async function toggleHabitCompletion(
  habitId: string, 
  currentlyCompleted: boolean
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: "Not authenticated" }
  }

  const timezone = await getUserTimezone()
  const today = getTodayInTimezone(timezone)

  // Check if a log already exists for today
  const { data: existingLog, error: fetchError } = await supabase
    .from("habit_logs")
    .select("*")
    .eq("user_id", user.id)
    .eq("habit_id", habitId)
    .eq("logged_at", today)
    .maybeSingle()

  if (fetchError) {
    console.error("[Habits] Error fetching habit log:", fetchError)
    return { success: false, error: fetchError.message }
  }

  if (existingLog) {
    // Update existing log
    const { error: updateError } = await supabase
      .from("habit_logs")
      .update({ completed: !currentlyCompleted })
      .eq("id", existingLog.id)

    if (updateError) {
      console.error("[Habits] Error updating habit log:", updateError)
      return { success: false, error: updateError.message }
    }
  } else {
    // Create new log
    const { error: insertError } = await supabase.from("habit_logs").insert({
      user_id: user.id,
      habit_id: habitId,
      completed: !currentlyCompleted,
      logged_at: today,
    })

    if (insertError) {
      console.error("[Habits] Error creating habit log:", insertError)
      return { success: false, error: insertError.message }
    }
  }

  // Update streak if completing the habit
  if (!currentlyCompleted) {
    const { data: habit } = await supabase
      .from("habits")
      .select("current_streak, best_streak")
      .eq("id", habitId)
      .single()

    if (habit) {
      const newStreak = (habit.current_streak || 0) + 1
      const newBestStreak = Math.max(newStreak, habit.best_streak || 0)

      await supabase
        .from("habits")
        .update({
          current_streak: newStreak,
          best_streak: newBestStreak,
        })
        .eq("id", habitId)
    }
  } else {
    // Reset streak if uncompleting
    await supabase
      .from("habits")
      .update({
        current_streak: 0,
      })
      .eq("id", habitId)
  }

  return { success: true, error: null }
}

export async function createDefaultHabits(): Promise<{ success: boolean; error: string | null; message?: string }> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: "Not authenticated" }
  }

  // Check if user already has habits
  const { data: existingHabits } = await supabase
    .from("habits")
    .select("id")
    .eq("user_id", user.id)
    .limit(1)

  if (existingHabits && existingHabits.length > 0) {
    return { success: true, error: null, message: "Habits already exist" }
  }

  // Create default habits
  const defaultHabits = [
    { name: "Morning Workout", category: "fitness", frequency: "daily" },
    { name: "Protein Intake", category: "nutrition", frequency: "daily" },
    { name: "8 Glasses of Water", category: "nutrition", frequency: "daily" },
    { name: "Evening Stretch", category: "fitness", frequency: "daily" },
  ]

  const { error: insertError } = await supabase.from("habits").insert(
    defaultHabits.map((habit) => ({
      user_id: user.id,
      ...habit,
      current_streak: 0,
      best_streak: 0,
    }))
  )

  if (insertError) {
    console.error("[Habits] Error creating default habits:", insertError)
    return { success: false, error: insertError.message }
  }

  return { success: true, error: null }
}

export async function createHabit(
  name: string, 
  category: string, 
  frequency: string
): Promise<{ success: boolean; habit?: HabitWithStatus; error: string | null }> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: "Not authenticated" }
  }

  const { data, error } = await supabase
    .from("habits")
    .insert({
      user_id: user.id,
      name,
      category,
      frequency,
      current_streak: 0,
      best_streak: 0,
    })
    .select()
    .single()

  if (error) {
    console.error("[Habits] Error creating habit:", error)
    return { success: false, error: error.message }
  }

  return { 
    success: true, 
    habit: { ...data, completed: false, logId: null }, 
    error: null 
  }
}

export async function updateHabit(
  habitId: string, 
  name: string, 
  category: string, 
  frequency: string
): Promise<{ success: boolean; habit?: HabitWithStatus; error: string | null }> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: "Not authenticated" }
  }

  const { data, error } = await supabase
    .from("habits")
    .update({
      name,
      category,
      frequency,
    })
    .eq("id", habitId)
    .eq("user_id", user.id)
    .select()
    .single()

  if (error) {
    console.error("[Habits] Error updating habit:", error)
    return { success: false, error: error.message }
  }

  return { 
    success: true, 
    habit: { ...data, completed: false, logId: null }, 
    error: null 
  }
}

export async function deleteHabit(habitId: string): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: "Not authenticated" }
  }

  // Delete all habit logs first
  await supabase.from("habit_logs").delete().eq("habit_id", habitId).eq("user_id", user.id)

  // Delete the habit
  const { error } = await supabase
    .from("habits")
    .delete()
    .eq("id", habitId)
    .eq("user_id", user.id)

  if (error) {
    console.error("[Habits] Error deleting habit:", error)
    return { success: false, error: error.message }
  }

  return { success: true, error: null }
}

export async function getWeeklyProgress(): Promise<ProgressResult> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { progress: 0, error: "Not authenticated" }
  }

  // Get all user's habits
  const { data: habits, error: habitsError } = await supabase
    .from("habits")
    .select("id")
    .eq("user_id", user.id)

  if (habitsError || !habits || habits.length === 0) {
    return { progress: 0, error: null }
  }

  const timezone = await getUserTimezone()
  const today = getTodayInTimezone(timezone)

  // Get the last 7 days in user's timezone
  const sevenDaysAgo = new Date(today)
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const startDate = sevenDaysAgo.toISOString().split("T")[0]

  const { data: logs, error: logsError } = await supabase
    .from("habit_logs")
    .select("*")
    .eq("user_id", user.id)
    .gte("logged_at", startDate)
    .lte("logged_at", today)

  if (logsError) {
    console.error("[Habits] Error fetching habit logs:", logsError)
    return { progress: 0, error: logsError.message }
  }

  // Calculate progress
  const totalPossible = habits.length * 7
  const completedCount = logs?.filter((log) => log.completed).length || 0
  const progress = totalPossible > 0 ? Math.round((completedCount / totalPossible) * 100) : 0

  return { progress, error: null }
}
