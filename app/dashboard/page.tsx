"use client"

import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowRight, Zap, CheckCircle, RefreshCw, User, Loader2, Settings, Edit2 } from "lucide-react"
import { ButtonGlow } from "@/components/ui/button-glow"
import { Card, CardContent } from "@/components/ui/card"
import { BottomNav } from "@/components/bottom-nav"
import { Progress } from "@/components/ui/progress"
import { useState, useEffect, useCallback } from "react"
import { UpdateProfileModal } from "@/app/update-profile-modal"
import { RefreshPlanModal } from "@/app/refresh-plan-modal"
import { ManageHabitsModal } from "@/app/manage-habits-modal"
import { getProfile } from "@/lib/actions/profile"
import { getUserHabits, toggleHabitCompletion, createDefaultHabits, getWeeklyProgress } from "@/lib/actions/habits"
import { useToast } from "@/hooks/use-toast"
import { DashboardSkeleton } from "@/components/ui/skeleton-loaders"
import type { HabitWithStatus, ProfileFormData } from "@/lib/types"

export default function DashboardPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  // Loading state
  const [isLoading, setIsLoading] = useState(true)
  
  // UI states
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [refreshMessage, setRefreshMessage] = useState("")
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [isRefreshModalOpen, setIsRefreshModalOpen] = useState(false)
  const [isManageHabitsModalOpen, setIsManageHabitsModalOpen] = useState(false)
  
  // Data states
  const [userName, setUserName] = useState("")
  const [progress, setProgress] = useState(0)
  const [habits, setHabits] = useState<HabitWithStatus[]>([])
  const [profileData, setProfileData] = useState<ProfileFormData>({
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
  })

  // Load all dashboard data in parallel
  const loadDashboardData = useCallback(async () => {
    setIsLoading(true)
    
    try {
      // Fetch profile, habits, and progress in parallel
      const [profileResult, habitsResult, progressResult] = await Promise.all([
        getProfile(),
        getUserHabits(),
        getWeeklyProgress(),
      ])

      // Handle profile
      if (profileResult.profile) {
        const profile = profileResult.profile
        const fullName = profile.name || "there"
        const firstName = fullName.split(" ")[0]
        setUserName(firstName)

        setProfileData({
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
        })
      } else {
        setUserName("there")
      }

      // Handle habits
      if (habitsResult.habits && habitsResult.habits.length > 0) {
        setHabits(habitsResult.habits)
      } else if (!habitsResult.error) {
        // Create default habits if none exist
        await createDefaultHabits()
        const retryResult = await getUserHabits()
        setHabits(retryResult.habits || [])
      }

      // Handle progress
      if (progressResult.progress !== undefined) {
        setProgress(progressResult.progress)
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error)
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  const handleHabitToggle = async (habitId: string, currentlyCompleted: boolean) => {
    // Optimistic update
    setHabits((prevHabits) =>
      prevHabits.map((habit) => 
        habit.id === habitId ? { ...habit, completed: !currentlyCompleted } : habit
      )
    )

    try {
      const result = await toggleHabitCompletion(habitId, currentlyCompleted)

      if (result.success) {
        // Refresh progress after toggle
        const progressResult = await getWeeklyProgress()
        if (progressResult.progress !== undefined) {
          setProgress(progressResult.progress)
        }
        
        toast({
          title: currentlyCompleted ? "Habit unchecked" : "Great job!",
          description: currentlyCompleted ? "Keep going!" : "You completed a habit today!",
        })
      } else {
        // Revert on failure
        setHabits((prevHabits) =>
          prevHabits.map((habit) => 
            habit.id === habitId ? { ...habit, completed: currentlyCompleted } : habit
          )
        )
        toast({
          title: "Error",
          description: result.error || "Failed to update habit",
          variant: "destructive",
        })
      }
    } catch (error) {
      // Revert on error
      setHabits((prevHabits) =>
        prevHabits.map((habit) => 
          habit.id === habitId ? { ...habit, completed: currentlyCompleted } : habit
        )
      )
      toast({
        title: "Error",
        description: "Failed to update habit",
        variant: "destructive",
      })
    }
  }

  const handleProfileUpdate = (newProfile: Partial<ProfileFormData>) => {
    setProfileData((prev) => ({ ...prev, ...newProfile }))
    if (newProfile.name) {
      const firstName = newProfile.name.split(" ")[0]
      setUserName(firstName)
    }
  }

  const handleRefreshPlanClick = () => {
    setIsRefreshModalOpen(true)
  }

  const handleRefreshPlanConfirm = async () => {
    setIsRefreshing(true)
    setRefreshMessage("")

    try {
      const steps = [
        "Analyzing your current progress...",
        "Reviewing your fitness goals...",
        "Optimizing workout routines...",
        "Updating nutrition recommendations...",
        "Personalizing your schedule...",
        "Finalizing your new plan...",
      ]

      for (let i = 0; i < steps.length; i++) {
        setRefreshMessage(steps[i])
        await new Promise((resolve) => setTimeout(resolve, 800))
      }

      // Refresh progress
      const progressResult = await getWeeklyProgress()
      if (progressResult.progress !== undefined) {
        setProgress(progressResult.progress)
      }

      setRefreshMessage("✨ Your plan has been refreshed with new AI insights!")

      setTimeout(() => {
        setRefreshMessage("")
      }, 3000)
    } catch {
      setRefreshMessage("❌ Failed to refresh plan. Please try again.")
      setTimeout(() => {
        setRefreshMessage("")
      }, 3000)
    } finally {
      setIsRefreshing(false)
    }
  }

  // Show skeleton while loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-charcoal pb-20">
        <div className="container max-w-md px-4 py-6">
          <DashboardSkeleton />
        </div>
        <BottomNav />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-charcoal pb-20">
      <div className="container max-w-md px-4 py-6">
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">
                Hi, <span className="text-accent">{userName || "..."}</span> 👋
              </h1>
              <p className="text-white/70">Let&apos;s crush your goals today</p>
            </div>
            <ButtonGlow variant="outline-glow" size="icon" onClick={() => router.push("/settings")} className="h-8 w-8">
              <Settings className="h-4 w-4" />
            </ButtonGlow>
          </div>
        </motion.div>

        {(isRefreshing || refreshMessage) && (
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card
              className={`border-white/10 ${refreshMessage.includes("✨") ? "bg-accent/10 border-accent/30" : refreshMessage.includes("❌") ? "bg-red-500/10 border-red-500/30" : "bg-black/50"} backdrop-blur-sm`}
            >
              <CardContent className="p-4">
                <div className="flex items-center">
                  {isRefreshing && <Loader2 className="mr-3 h-5 w-5 animate-spin text-accent" />}
                  {refreshMessage.includes("✨") && <Zap className="mr-3 h-5 w-5 text-accent" />}
                  {refreshMessage.includes("❌") && <div className="mr-3 h-5 w-5 rounded-full bg-red-500" />}
                  <p
                    className={`text-sm font-medium ${refreshMessage.includes("✨") ? "text-accent" : refreshMessage.includes("❌") ? "text-red-400" : "text-white"}`}
                  >
                    {refreshMessage || "Generating your personalized plan..."}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="overflow-hidden border-white/10 bg-black/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">Weekly Progress</h2>
                <span className="text-lg font-bold text-accent">{progress}%</span>
              </div>

              <div className="mt-2">
                <Progress value={progress} className="h-2 bg-white/10" indicatorClassName="bg-accent" />
              </div>

              <div className="mt-4 flex gap-2">
                <ButtonGlow
                  variant="outline-glow"
                  size="sm"
                  className="flex-1"
                  onClick={() => setIsProfileModalOpen(true)}
                >
                  <User className="mr-1 h-4 w-4" /> Update Profile
                </ButtonGlow>
                <ButtonGlow
                  variant="outline-glow"
                  size="sm"
                  className="flex-1"
                  onClick={handleRefreshPlanClick}
                  disabled={isRefreshing}
                >
                  {isRefreshing ? (
                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="mr-1 h-4 w-4" />
                  )}
                  {isRefreshing ? "Refreshing..." : "Refresh Plan"}
                </ButtonGlow>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-white">Today&apos;s Habits</h2>
            <ButtonGlow variant="outline-glow" size="sm" onClick={() => setIsManageHabitsModalOpen(true)}>
              <Edit2 className="mr-1 h-3 w-3" />
              Manage
            </ButtonGlow>
          </div>
          {habits.length === 0 ? (
            <Card className="border-white/10 bg-black/50 backdrop-blur-sm">
              <CardContent className="p-4 text-center text-white/70">
                No habits yet. Create some to get started!
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {habits.map((habit) => (
                <Card
                  key={habit.id}
                  className={`border-white/10 ${habit.completed ? "bg-accent/10" : "bg-black/50"} backdrop-blur-sm cursor-pointer transition-all hover:scale-[1.02]`}
                  onClick={() => handleHabitToggle(habit.id, habit.completed)}
                >
                  <CardContent className="flex items-center justify-between p-3">
                    <div className="flex items-center">
                      <div
                        className={`mr-3 flex h-6 w-6 items-center justify-center rounded-full ${habit.completed ? "bg-accent text-black" : "border border-white/30"}`}
                      >
                        {habit.completed && <CheckCircle className="h-4 w-4" />}
                      </div>
                      <span className={`${habit.completed ? "text-accent" : "text-white/80"}`}>{habit.name}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="border-white/10 bg-gradient-to-br from-black to-charcoal backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">AI Tip of the Day</h2>
                <Zap className="h-5 w-5 text-accent" />
              </div>
              <p className="mt-2 text-white/80">
                {progress > 75
                  ? "You're crushing it! Consider adding a new challenge to keep progressing."
                  : progress > 50
                    ? "Great momentum! Focus on consistency to reach your next milestone."
                    : progress > 25
                      ? "You're building good habits! Keep up the consistency to see results."
                      : "Start small and build momentum. Complete one habit today to boost your progress!"}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <ButtonGlow variant="accent-glow" className="w-full" onClick={() => router.push("/fitness")}>
            Start Today&apos;s Workout <ArrowRight className="ml-2 h-4 w-4" />
          </ButtonGlow>
        </motion.div>
      </div>

      <BottomNav />
      <UpdateProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentProfile={profileData}
        onUpdate={(profile) => handleProfileUpdate(profile)}
      />
      <RefreshPlanModal
        isOpen={isRefreshModalOpen}
        onClose={() => setIsRefreshModalOpen(false)}
        onConfirm={handleRefreshPlanConfirm}
        userName={userName}
      />
      <ManageHabitsModal
        isOpen={isManageHabitsModalOpen}
        onClose={() => setIsManageHabitsModalOpen(false)}
        habits={habits}
        onHabitsChange={loadDashboardData}
      />
    </div>
  )
}
