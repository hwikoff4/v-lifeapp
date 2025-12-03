"use server"

import { createClient } from "@/lib/supabase/server"
import { getTodayInTimezone } from "@/lib/utils/timezone"
import { getUserTimezone } from "@/lib/utils/user-helpers"
import type { StreakStats, Milestone, HabitStreakDetail, WeeklyActivityDay } from "@/lib/types"

export async function getStreakStats(): Promise<{ stats: StreakStats | null; error: string | null }> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { stats: null, error: "Not authenticated" }
  }

  const timezone = await getUserTimezone()
  const today = getTodayInTimezone(timezone)

  // Get all user's habits with their streaks
  const { data: habits, error: habitsError } = await supabase
    .from("habits")
    .select("id, name, category, current_streak, best_streak, created_at")
    .eq("user_id", user.id)
    .order("current_streak", { ascending: false })

  if (habitsError) {
    console.error("[Streaks] Error fetching habits:", habitsError)
    return { stats: null, error: habitsError.message }
  }

  if (!habits || habits.length === 0) {
    return {
      stats: {
        overallStreak: 0,
        longestStreak: 0,
        totalDaysActive: 0,
        habitStreaks: [],
        weeklyActivity: [],
      },
      error: null,
    }
  }

  // Calculate overall streak (longest current streak among all habits)
  const overallStreak = Math.max(...habits.map((h) => h.current_streak || 0), 0)

  // Calculate longest streak ever
  const longestStreak = Math.max(...habits.map((h) => h.best_streak || 0), 0)

  // Get habit logs to calculate completion rates and last completed
  const { data: logs } = await supabase
    .from("habit_logs")
    .select("habit_id, logged_at, completed")
    .eq("user_id", user.id)
    .order("logged_at", { ascending: false })

  // Calculate stats for each habit
  const habitStreaks: HabitStreakDetail[] = await Promise.all(
    habits.map(async (habit) => {
      const habitLogs = logs?.filter((log) => log.habit_id === habit.id) || []
      const completedLogs = habitLogs.filter((log) => log.completed)

      // Find last completed date
      const lastCompletedLog = completedLogs[0]
      let lastCompleted = "Never"
      if (lastCompletedLog) {
        const logDate = lastCompletedLog.logged_at
        if (logDate === today) {
          lastCompleted = "Today"
        } else {
          const yesterday = new Date(today)
          yesterday.setDate(yesterday.getDate() - 1)
          const yesterdayStr = yesterday.toISOString().split("T")[0]
          if (logDate === yesterdayStr) {
            lastCompleted = "Yesterday"
          } else {
            const date = new Date(logDate)
            lastCompleted = date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
          }
        }
      }

      // Calculate completion rate (last 30 days)
      const thirtyDaysAgo = new Date(today)
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split("T")[0]

      const recentLogs = habitLogs.filter((log) => log.logged_at >= thirtyDaysAgoStr)
      const completedRecent = recentLogs.filter((log) => log.completed).length
      const completionRate = recentLogs.length > 0 ? Math.round((completedRecent / 30) * 100) : 0

      return {
        id: habit.id,
        name: habit.name,
        currentStreak: habit.current_streak || 0,
        longestStreak: habit.best_streak || 0,
        category: habit.category,
        lastCompleted,
        completionRate,
        totalCompletions: completedLogs.length,
      }
    })
  )

  // Calculate weekly activity (last 7 days)
  const weeklyActivity: WeeklyActivityDay[] = []
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split("T")[0]
    const dayName = daysOfWeek[date.getDay()]

    // Check if any habit was completed on this day
    const dayLogs = logs?.filter((log) => log.logged_at === dateStr && log.completed) || []
    const active = dayLogs.length > 0

    weeklyActivity.push({
      day: dayName,
      active,
      date: dateStr,
    })
  }

  // Calculate total days active (days with at least one completed habit)
  const uniqueDates = new Set(logs?.filter((log) => log.completed).map((log) => log.logged_at))
  const totalDaysActive = uniqueDates.size

  return {
    stats: {
      overallStreak,
      longestStreak,
      totalDaysActive,
      habitStreaks,
      weeklyActivity,
    },
    error: null,
  }
}

export async function getMilestones(): Promise<{ milestones: Milestone[]; error: string | null }> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { milestones: [], error: "Not authenticated" }
  }

  // Get user's habits
  const { data: habits } = await supabase
    .from("habits")
    .select("current_streak, best_streak")
    .eq("user_id", user.id)

  if (!habits || habits.length === 0) {
    return { milestones: [], error: null }
  }

  const maxCurrentStreak = Math.max(...habits.map((h) => h.current_streak || 0), 0)
  const maxBestStreak = Math.max(...habits.map((h) => h.best_streak || 0), 0)

  // Get total habit logs
  const { data: logs } = await supabase
    .from("habit_logs")
    .select("logged_at, completed")
    .eq("user_id", user.id)
    .eq("completed", true)

  const uniqueDates = new Set(logs?.map((log) => log.logged_at))
  const totalDaysActive = uniqueDates.size

  const milestones: Milestone[] = [
    {
      id: 1,
      name: "First Week",
      achieved: maxCurrentStreak >= 7 || maxBestStreak >= 7,
      icon: "Target",
      color: "text-accent",
    },
    {
      id: 2,
      name: "30 Day Warrior",
      achieved: maxCurrentStreak >= 30 || maxBestStreak >= 30,
      icon: "Trophy",
      color: "text-yellow-500",
    },
    {
      id: 3,
      name: "100 Day Legend",
      achieved: maxCurrentStreak >= 100 || maxBestStreak >= 100,
      icon: "Award",
      color: "text-purple-500",
    },
    {
      id: 4,
      name: "Consistency King",
      achieved: totalDaysActive >= 50,
      icon: "Zap",
      color: "text-blue-500",
    },
  ]

  return { milestones, error: null }
}
