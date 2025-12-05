"use server"

import { createClient, getAuthUser } from "@/lib/supabase/server"

export interface NotificationPreferences {
  notificationsEnabled: boolean
  workoutReminders: boolean
  workoutReminderTime: string
  mealReminders: boolean
  breakfastReminderTime: string
  lunchReminderTime: string
  dinnerReminderTime: string
  progressUpdates: boolean
  streakWarnings: boolean
  achievementNotifications: boolean
  habitReminders: boolean
}

export async function getNotificationPreferences() {
  try {
    const { user, error: authError } = await getAuthUser()

    if (authError || !user) {
      return { error: "Not authenticated", preferences: null }
    }

    const supabase = await createClient()

    const { data: profile, error } = await supabase
      .from("profiles")
      .select(
        "notifications_enabled, workout_reminders, workout_reminder_time, meal_reminders, breakfast_reminder_time, lunch_reminder_time, dinner_reminder_time, progress_updates, streak_warnings, achievement_notifications, habit_reminders",
      )
      .eq("id", user.id)
      .single()

    if (error) {
      console.error("[v0] Error fetching notification preferences:", error)
      return { error: error.message, preferences: null }
    }

    const preferences: NotificationPreferences = {
      notificationsEnabled: profile.notifications_enabled ?? true,
      workoutReminders: profile.workout_reminders ?? true,
      workoutReminderTime: profile.workout_reminder_time || "08:00:00",
      mealReminders: profile.meal_reminders ?? true,
      breakfastReminderTime: profile.breakfast_reminder_time || "08:00:00",
      lunchReminderTime: profile.lunch_reminder_time || "12:00:00",
      dinnerReminderTime: profile.dinner_reminder_time || "18:00:00",
      progressUpdates: profile.progress_updates ?? true,
      streakWarnings: profile.streak_warnings ?? true,
      achievementNotifications: profile.achievement_notifications ?? true,
      habitReminders: profile.habit_reminders ?? true,
    }

    return { error: null, preferences }
  } catch (error) {
    console.error("[v0] Exception in getNotificationPreferences:", error)
    return { error: "Failed to fetch preferences", preferences: null }
  }
}

export async function updateNotificationPreferences(preferences: Partial<NotificationPreferences>) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { error: "Not authenticated" }
    }

    // Convert camelCase to snake_case for database
    const dbPreferences: any = {}
    if (preferences.notificationsEnabled !== undefined)
      dbPreferences.notifications_enabled = preferences.notificationsEnabled
    if (preferences.workoutReminders !== undefined) dbPreferences.workout_reminders = preferences.workoutReminders
    if (preferences.workoutReminderTime !== undefined)
      dbPreferences.workout_reminder_time = preferences.workoutReminderTime
    if (preferences.mealReminders !== undefined) dbPreferences.meal_reminders = preferences.mealReminders
    if (preferences.breakfastReminderTime !== undefined)
      dbPreferences.breakfast_reminder_time = preferences.breakfastReminderTime
    if (preferences.lunchReminderTime !== undefined) dbPreferences.lunch_reminder_time = preferences.lunchReminderTime
    if (preferences.dinnerReminderTime !== undefined)
      dbPreferences.dinner_reminder_time = preferences.dinnerReminderTime
    if (preferences.progressUpdates !== undefined) dbPreferences.progress_updates = preferences.progressUpdates
    if (preferences.streakWarnings !== undefined) dbPreferences.streak_warnings = preferences.streakWarnings
    if (preferences.achievementNotifications !== undefined)
      dbPreferences.achievement_notifications = preferences.achievementNotifications
    if (preferences.habitReminders !== undefined) dbPreferences.habit_reminders = preferences.habitReminders

    const { error } = await supabase.from("profiles").update(dbPreferences).eq("id", user.id)

    if (error) {
      console.error("[v0] Error updating notification preferences:", error)
      return { error: error.message }
    }

    return { error: null }
  } catch (error) {
    console.error("[v0] Exception in updateNotificationPreferences:", error)
    return { error: "Failed to update preferences" }
  }
}

export async function savePushSubscription(subscription: PushSubscription) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { error: "Not authenticated" }
    }

    const { error } = await supabase
      .from("profiles")
      .update({ push_subscription: subscription as any })
      .eq("id", user.id)

    if (error) {
      console.error("[v0] Error saving push subscription:", error)
      return { error: error.message }
    }

    return { error: null }
  } catch (error) {
    console.error("[v0] Exception in savePushSubscription:", error)
    return { error: "Failed to save subscription" }
  }
}

export async function logNotification(type: string, title: string, body: string) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { error: "Not authenticated" }
    }

    const { error } = await supabase.from("notification_logs").insert({
      user_id: user.id,
      notification_type: type,
      title,
      body,
    })

    if (error) {
      console.error("[v0] Error logging notification:", error)
      return { error: error.message }
    }

    return { error: null }
  } catch (error) {
    console.error("[v0] Exception in logNotification:", error)
    return { error: "Failed to log notification" }
  }
}
