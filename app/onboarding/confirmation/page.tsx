"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { CheckCircle, Loader2 } from "lucide-react"
import { ButtonGlow } from "@/components/ui/button-glow"
import { useOnboarding } from "@/lib/contexts/onboarding-context"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { retryWithBackoff, isNetworkError } from "@/lib/utils/retry"

export default function Confirmation() {
  const router = useRouter()
  const { data, clearData } = useOnboarding()
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const [retryAttempt, setRetryAttempt] = useState(0)

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession()

      console.log("[v0] Auth check:", {
        hasSession: !!session,
        userId: session?.user?.id,
        error: error?.message,
      })

      setIsAuthenticated(!!session)
      setIsChecking(false)

      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please log in to continue.",
          variant: "destructive",
        })
        router.push("/auth/login")
      }
    }

    checkAuth()
  }, [router, toast])

  const saveProfile = async () => {
    setIsSaving(true)
    setRetryAttempt(0)
    const supabase = createClient()

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      console.log("[v0] Saving profile - Session check:", {
        hasSession: !!session,
        userId: session?.user?.id,
        userEmail: session?.user?.email,
        error: sessionError?.message,
      })

      if (sessionError || !session?.user) {
        throw new Error("User not authenticated")
      }

      if (!data.name || data.name.trim() === "") {
        throw new Error("Name is required")
      }

      const profileData: any = {
        id: session.user.id,
        name: data.name.trim(),
        updated_at: new Date().toISOString(),
      }

      // Add optional fields only if they have valid values
      if (data.age && Number.parseInt(data.age) > 0) {
        profileData.age = Number.parseInt(data.age)
      }

      if (data.gender && ["male", "female", "other"].includes(data.gender)) {
        profileData.gender = data.gender
      }

      if (data.heightFeet && Number.parseInt(data.heightFeet) > 0) {
        profileData.height_feet = Number.parseInt(data.heightFeet)
      }

      if (data.heightInches && Number.parseInt(data.heightInches) >= 0) {
        profileData.height_inches = Number.parseInt(data.heightInches)
      }

      if (data.weight && Number.parseFloat(data.weight) > 0) {
        profileData.weight = Number.parseFloat(data.weight)
      }

      if (data.gymAccess && ["home", "hotel", "commercial", "none", "gym", "custom"].includes(data.gymAccess)) {
        profileData.gym_access = data.gymAccess
      }

      if (data.selectedGym) {
        profileData.selected_gym = data.selectedGym
      }

      if (data.customEquipment) {
        profileData.custom_equipment = data.customEquipment
      }

      if (data.activityLevel && data.activityLevel >= 1 && data.activityLevel <= 5) {
        profileData.activity_level = data.activityLevel
      }

      if (data.primaryGoal && ["lose-weight", "tone-up", "build-muscle", "lifestyle"].includes(data.primaryGoal)) {
        profileData.primary_goal = data.primaryGoal
      }

      if (data.allergies && Array.isArray(data.allergies)) {
        profileData.allergies = data.allergies
      }

      if (data.customRestrictions && Array.isArray(data.customRestrictions)) {
        profileData.custom_restrictions = data.customRestrictions
      }

      profileData.onboarding_completed = true

      console.log("[v0] Profile data to save:", profileData)

      await retryWithBackoff(
        async () => {
          const { error: profileError } = await supabase.from("profiles").upsert(profileData, {
            onConflict: "id",
          })

          if (profileError) {
            console.error("[v0] Profile upsert error:", profileError)
            throw profileError
          }
        },
        {
          maxAttempts: 3,
          initialDelay: 1000,
          onRetry: (attempt) => {
            setRetryAttempt(attempt)
            console.log(`[v0] Retry attempt ${attempt} for profile save`)
          },
        },
      )

      console.log("[v0] Profile saved successfully, redirecting to dashboard")

      toast({
        title: "Profile saved!",
        description: "Your personalized plan is ready.",
      })

      clearData()
      await new Promise((resolve) => setTimeout(resolve, 500))
      router.push("/dashboard")
    } catch (error: any) {
      console.error("[v0] Error saving profile:", error)

      let errorMessage = "Please try again or contact support."

      if (isNetworkError(error)) {
        errorMessage = "Network connection issue. Please check your internet and try again."
      } else if (error.message?.includes("check constraint")) {
        errorMessage = "Some profile information is invalid. Please review your inputs."
      } else if (error.message) {
        errorMessage = error.message
      }

      toast({
        title: "Error saving profile",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
      setRetryAttempt(0)
    }
  }

  if (isChecking) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-black to-charcoal p-4">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
        <p className="mt-4 text-white/70">Verifying authentication...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-black to-charcoal p-4">
      <motion.div
        className="mx-auto w-full max-w-md text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: 0.2,
          }}
          className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-black/50"
        >
          <CheckCircle className="h-16 w-16 text-accent animate-glow" />
        </motion.div>

        <motion.h1
          className="mb-3 text-3xl font-bold text-white"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          Profile Complete!
        </motion.h1>

        <motion.p
          className="mb-8 text-white/70"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          We're generating your personalized fitness and nutrition plan.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <ButtonGlow
            variant="accent-glow"
            size="lg"
            onClick={saveProfile}
            disabled={isSaving}
            className="text-base font-semibold"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {retryAttempt > 0 ? `Retrying (${retryAttempt}/3)...` : "Saving Profile..."}
              </>
            ) : (
              "Generate My Plan"
            )}
          </ButtonGlow>
        </motion.div>
      </motion.div>
    </div>
  )
}
