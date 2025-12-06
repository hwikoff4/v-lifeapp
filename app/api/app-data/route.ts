/**
 * Bootstrap API Endpoint
 * 
 * Fetches all core application data in a single parallel request.
 * This eliminates the need for pages to individually query the database
 * for common data like profile, habits, progress, etc.
 */

import { NextResponse } from "next/server"
import { getAuthUser } from "@/lib/supabase/server"
import { getProfile } from "@/lib/actions/profile"
import { getWeeklyProgress, getUserHabits } from "@/lib/actions/habits"
import { getSubscription } from "@/lib/actions/subscription"
import { getReferralStats } from "@/lib/actions/referrals"
import { getStreakStats, getMilestones } from "@/lib/actions/streaks"
import { getNotificationPreferences } from "@/lib/actions/notifications"
import type { AppData } from "@/lib/types/app-data"

export async function GET() {
  try {
    // Auth check
    const { user, error: authError } = await getAuthUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      )
    }

    // Fetch all bootstrap data in parallel
    const [
      profileResult,
      progressResult,
      habitsResult,
      subscription,
      referralResult,
      streakResult,
      milestonesResult,
      notifResult,
    ] = await Promise.all([
      getProfile(),
      getWeeklyProgress(),
      getUserHabits(),
      getSubscription(),
      getReferralStats(),
      getStreakStats(),
      getMilestones(),
      getNotificationPreferences(),
    ])

    // Build the AppData payload
    const appData: AppData = {
      profile: profileResult.profile || null,
      weeklyProgress: progressResult.progress || 0,
      habits: habitsResult.habits || [],
      subscription: subscription
        ? {
            plan: subscription.plan,
            status: subscription.status,
            billingCycle: subscription.billing_cycle,
            price: subscription.price,
            nextBillingDate: subscription.next_billing_date,
          }
        : null,
      referralStats: referralResult.stats || {
        referralCode: "",
        creditsBalance: 0,
        referralsCount: 0,
        creditsEarned: 0,
      },
      streakStats: streakResult.stats || {
        overallStreak: 0,
        longestStreak: 0,
        totalDaysActive: 0,
        habitStreaks: [],
        weeklyActivity: [],
      },
      milestones: milestonesResult.milestones || [],
      notificationPreferences: notifResult.preferences || {
        notificationsEnabled: true,
        workoutReminders: true,
        workoutReminderTime: "08:00",
        mealReminders: true,
        breakfastReminderTime: "08:00",
        lunchReminderTime: "12:00",
        dinnerReminderTime: "18:00",
        progressUpdates: true,
        streakWarnings: true,
        achievementNotifications: true,
        habitReminders: true,
      },
      fetchedAt: new Date().toISOString(),
    }

    return NextResponse.json(appData)
  } catch (error) {
    console.error("[AppData API] Error fetching bootstrap data:", error)
    return NextResponse.json(
      { error: "Failed to fetch app data" },
      { status: 500 }
    )
  }
}

