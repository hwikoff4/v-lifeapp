"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import type { OnboardingData } from "@/lib/types"

interface OnboardingContextType {
  data: OnboardingData
  updateData: (updates: Partial<OnboardingData>) => void
  clearData: () => void
}

const defaultData: OnboardingData = {
  // Profile data
  name: "",
  age: "",
  gender: "",
  heightFeet: "",
  heightInches: "",
  weight: "",
  goalWeight: "",
  gymAccess: "",
  selectedGym: "",
  customEquipment: "",
  activityLevel: 3,

  // Goals data
  primaryGoal: "",
  progressPhotoUrl: null,
  transformationPreset: null,
  transformedPhotoUrl: null,

  // Preferences data
  allergies: [],
  customRestrictions: [],
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined)

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<OnboardingData>(defaultData)

  const updateData = (updates: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...updates }))
  }

  const clearData = () => {
    setData(defaultData)
  }

  return (
    <OnboardingContext.Provider value={{ data, updateData, clearData }}>
      {children}
    </OnboardingContext.Provider>
  )
}

export function useOnboarding() {
  const context = useContext(OnboardingContext)
  if (context === undefined) {
    throw new Error("useOnboarding must be used within an OnboardingProvider")
  }
  return context
}
