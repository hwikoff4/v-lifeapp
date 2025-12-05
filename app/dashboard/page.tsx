import { getProfile } from "@/lib/actions/profile"
import { getUserHabits, createDefaultHabits } from "@/lib/actions/habits"
import { getWeeklyProgress } from "@/lib/actions/habits"
import DashboardClient from "./DashboardClient"
import type { ProfileFormData } from "@/lib/types"

// This is a Server Component - data is fetched on the server before rendering
export default async function DashboardPage() {
  // Fetch all data in parallel on the server
  const [profileResult, habitsResult, progressResult] = await Promise.all([
    getProfile(),
    getUserHabits(),
    getWeeklyProgress(),
  ])

  // Handle profile data
  let userName = "there"
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
    const fullName = profile.name || "there"
    userName = fullName.split(" ")[0]

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

  // Handle habits - create defaults if none exist
  let habits = habitsResult.habits || []
  if (habits.length === 0 && !habitsResult.error) {
    await createDefaultHabits()
    const retryResult = await getUserHabits()
    habits = retryResult.habits || []
  }

  // Handle progress
  const progress = progressResult.progress ?? 0

  return (
    <DashboardClient
      initialUserName={userName}
      initialProgress={progress}
      initialHabits={habits}
      initialProfileData={profileData}
    />
  )
}
