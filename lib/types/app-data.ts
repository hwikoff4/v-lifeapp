/**
 * AppData TypeScript Model
 * 
 * Defines the core data structure loaded once at app start and cached
 * client-side to eliminate redundant database queries on every navigation.
 */

import type {
  Profile,
  HabitWithStatus,
  ReferralStats,
  StreakStats,
  Milestone,
  NotificationPreferences,
} from "./index"

/**
 * Core application data loaded at bootstrap.
 * This data is:
 * - Fetched once when the user starts using the app
 * - Cached in a global React context
 * - Refreshed in the background (on focus, interval, or manual trigger)
 */
export interface AppData {
  /** User profile data (demographics, goals, preferences, etc.) */
  profile: Profile | null

  /** Weekly habit completion progress percentage (0-100) */
  weeklyProgress: number

  /** User's daily habits with today's completion status */
  habits: HabitWithStatus[]

  /** Subscription plan and billing info */
  subscription: {
    plan: "free" | "pro" | "elite"
    status: "active" | "cancelled" | "past_due"
    billingCycle: "monthly" | "yearly" | null
    price: number
    nextBillingDate: string | null
  } | null

  /** Referral program stats */
  referralStats: ReferralStats

  /** Streak statistics for gamification */
  streakStats: StreakStats

  /** Achievement milestones */
  milestones: Milestone[]

  /** User notification preferences */
  notificationPreferences: NotificationPreferences

  /** Timestamp of when this data was last fetched (ISO string) */
  fetchedAt: string
}

/**
 * Partial update payload for optimistic updates or incremental refreshes.
 */
export type AppDataUpdate = Partial<AppData>

/**
 * Hook return type for useAppData()
 */
export interface UseAppDataReturn {
  /** The cached app data, or null if not yet loaded */
  appData: AppData | null

  /** Whether the initial load is in progress */
  isLoading: boolean

  /** Error from the most recent fetch attempt */
  error: string | null

  /** Manually trigger a background refresh */
  refresh: () => Promise<void>

  /** Whether a background refresh is currently in progress */
  isRefreshing: boolean
}

