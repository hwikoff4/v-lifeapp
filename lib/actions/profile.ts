"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { retryWithBackoff, isNetworkError } from "@/lib/utils/retry"
import type { Profile, ProfileResult } from "@/lib/types"

export async function getProfile(): Promise<ProfileResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { profile: null, error: "Not authenticated" }
  }

  try {
    const result = await retryWithBackoff(
      async () => {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle()

        if (error) throw error
        return profile as Profile | null
      },
      { maxAttempts: 3, initialDelay: 1000 }
    )

    return { profile: result || null }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to load profile"
    
    if (isNetworkError(error)) {
      return { profile: null, error: "Network error. Please check your connection and try again." }
    }

    return { profile: null, error: errorMessage }
  }
}

export async function updateProfile(profileData: {
  name?: string
  age?: string
  gender?: string
  heightFeet?: string
  heightInches?: string
  weight?: string
  goalWeight?: string
  primaryGoal?: string
  activityLevel?: number | string
  gymAccess?: string
  selectedGym?: string
  customEquipment?: string
  allergies?: string[]
  customRestrictions?: string[]
  timezone?: string
}): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  // Validation
  const validationErrors: string[] = []

  if (profileData.gender && !["male", "female", "other", "prefer_not_to_say"].includes(profileData.gender)) {
    validationErrors.push("Invalid gender value")
  }

  if (profileData.gymAccess && !["yes", "no", "sometimes", "home", "hotel", "commercial", "gym", "custom", "none"].includes(profileData.gymAccess)) {
    validationErrors.push("Invalid gym access value")
  }

  if (profileData.primaryGoal && !["lose_weight", "build_muscle", "maintain", "improve_health"].includes(profileData.primaryGoal)) {
    validationErrors.push("Invalid primary goal value")
  }

  if (validationErrors.length > 0) {
    return { error: `Validation failed: ${validationErrors.join(", ")}` }
  }

  try {
    await retryWithBackoff(
      async () => {
        const { error } = await supabase.from("profiles").upsert(
          {
            id: user.id,
            name: profileData.name,
            age: profileData.age ? Number.parseInt(profileData.age) : null,
            gender: profileData.gender,
            height_feet: profileData.heightFeet ? Number.parseInt(profileData.heightFeet) : null,
            height_inches: profileData.heightInches ? Number.parseInt(profileData.heightInches) : null,
            weight: profileData.weight ? Number.parseFloat(profileData.weight) : null,
            goal_weight: profileData.goalWeight ? Number.parseFloat(profileData.goalWeight) : null,
            primary_goal: profileData.primaryGoal,
            activity_level: profileData.activityLevel,
            gym_access: profileData.gymAccess,
            selected_gym: profileData.selectedGym,
            custom_equipment: profileData.customEquipment,
            allergies: profileData.allergies,
            custom_restrictions: profileData.customRestrictions,
            timezone: profileData.timezone,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" }
        )

        if (error) throw error
      },
      { maxAttempts: 3 }
    )

    revalidatePath("/settings")
    revalidatePath("/dashboard")

    return { success: true }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to update profile"

    if (errorMessage.includes("check constraint")) {
      return { error: "Some profile data doesn't meet requirements. Please check all fields and try again." }
    }

    if (isNetworkError(error)) {
      return { error: "Network error. Please check your connection and try again." }
    }

    return { error: errorMessage }
  }
}

export async function checkOnboardingStatus(): Promise<{ onboardingCompleted?: boolean; error?: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  try {
    const result = await retryWithBackoff(
      async () => {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("onboarding_completed")
          .eq("id", user.id)
          .maybeSingle()

        if (error) throw error
        return profile
      },
      { maxAttempts: 2 }
    )

    return { onboardingCompleted: result?.onboarding_completed || false }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to check onboarding status"
    return { error: errorMessage }
  }
}

export async function createProfile(userId: string): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createClient()

  // Generate unique referral code
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let referralCode = ""
  for (let i = 0; i < 8; i++) {
    referralCode += chars.charAt(Math.floor(Math.random() * chars.length))
  }

  try {
    await retryWithBackoff(
      async () => {
        const { error } = await supabase.from("profiles").insert({
          id: userId,
          name: "User",
          referral_code: referralCode,
          credits: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

        if (error) throw error
      },
      { maxAttempts: 3 }
    )

    return { success: true }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to create profile"

    if (isNetworkError(error)) {
      return { error: "Network error. Please check your connection and try again." }
    }

    return { error: errorMessage }
  }
}
