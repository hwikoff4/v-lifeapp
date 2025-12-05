import { getProfile } from "@/lib/actions/profile"
import { getReferralStats } from "@/lib/actions/referrals"
import { getStreakStats, getMilestones } from "@/lib/actions/streaks"
import { getNotificationPreferences } from "@/lib/actions/notifications"
import SettingsClient from "./SettingsClient"
import type { ProfileFormData, ReferralStats, StreakStats, NotificationPreferences } from "@/lib/types"

const defaultStreakStats: StreakStats = {
  overallStreak: 0,
  longestStreak: 0,
  totalDaysActive: 0,
  habitStreaks: [],
  weeklyActivity: [],
}

const defaultReferralStats: ReferralStats = {
  referralCode: "",
  creditsBalance: 0,
  referralsCount: 0,
  creditsEarned: 0,
}

const defaultNotificationPreferences: NotificationPreferences = {
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
}

// This is a Server Component - data is fetched on the server before rendering
export default async function SettingsPage() {
  // Fetch all data in parallel on the server
  const [profileResult, referralResult, streaksResult, milestonesResult, notifResult] = await Promise.all([
    getProfile(),
    getReferralStats(),
    getStreakStats(),
    getMilestones(),
    getNotificationPreferences(),
  ])

  // Handle profile data
  let profileData: ProfileFormData = {
    name: "",
    age: "",
    gender: "",
    heightFeet: "",
    heightInches: "",
    weight: "",
    goalWeight: "",
    primaryGoal: "",
    activityLevel: 3,
    gymAccess: "",
    selectedGym: "",
    customEquipment: "",
    allergies: [],
    customRestrictions: [],
    timezone: "America/New_York",
  }

  if (profileResult.profile) {
    const profile = profileResult.profile
    profileData = {
      name: profile.name || "",
      age: profile.age?.toString() || "",
      gender: profile.gender || "",
      heightFeet: profile.height_feet?.toString() || "",
      heightInches: profile.height_inches?.toString() || "",
      weight: profile.weight?.toString() || "",
      goalWeight: profile.goal_weight?.toString() || "",
      primaryGoal: profile.primary_goal || "",
      activityLevel: profile.activity_level || 3,
      gymAccess: profile.gym_access || "",
      selectedGym: profile.selected_gym || "",
      customEquipment: profile.custom_equipment || "",
      allergies: profile.allergies || [],
      customRestrictions: profile.custom_restrictions || [],
      timezone: profile.timezone || "America/New_York",
    }
  }

  const referralStats = referralResult.stats || defaultReferralStats
  const streakStats = streaksResult.stats || defaultStreakStats
  const milestones = milestonesResult.milestones || []
  const notificationPreferences = notifResult.preferences || defaultNotificationPreferences

  return (
    <SettingsClient
      initialProfileData={profileData}
      initialReferralStats={referralStats}
      initialStreakStats={streakStats}
      initialMilestones={milestones}
      initialNotificationPreferences={notificationPreferences}
    />
  )
}
