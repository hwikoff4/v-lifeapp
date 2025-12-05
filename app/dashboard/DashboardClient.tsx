"use client"

import { useRouter } from "next/navigation"
import { ArrowRight, Zap, CheckCircle, RefreshCw, User, Loader2, Settings, Edit2, Sparkles, Target } from "lucide-react"
import { ButtonGlow } from "@/components/ui/button-glow"
import { Card, CardContent } from "@/components/ui/card"
import { BottomNav } from "@/components/bottom-nav"
import { CircularProgress } from "@/components/ui/circular-progress"
import { AmbientBackground } from "@/components/ambient-background"
import { useState, useCallback, lazy, Suspense } from "react"
import { motion } from "framer-motion"
import { toggleHabitCompletion, getWeeklyProgress, getUserHabits } from "@/lib/actions/habits"
import { useToast } from "@/hooks/use-toast"
import type { HabitWithStatus, ProfileFormData } from "@/lib/types"

// Lazy load modals - they're only needed when opened
const UpdateProfileModal = lazy(() => import("@/app/update-profile-modal").then(m => ({ default: m.UpdateProfileModal })))
const RefreshPlanModal = lazy(() => import("@/app/refresh-plan-modal").then(m => ({ default: m.RefreshPlanModal })))
const ManageHabitsModal = lazy(() => import("@/app/manage-habits-modal").then(m => ({ default: m.ManageHabitsModal })))

// Animation variants for staggered children
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
}

interface DashboardClientProps {
  initialUserName: string
  initialProgress: number
  initialHabits: HabitWithStatus[]
  initialProfileData: ProfileFormData
}

export default function DashboardClient({
  initialUserName,
  initialProgress,
  initialHabits,
  initialProfileData,
}: DashboardClientProps) {
  const router = useRouter()
  const { toast } = useToast()
  
  // UI states
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [refreshMessage, setRefreshMessage] = useState("")
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [isRefreshModalOpen, setIsRefreshModalOpen] = useState(false)
  const [isManageHabitsModalOpen, setIsManageHabitsModalOpen] = useState(false)
  
  // Data states - initialized from server
  const [userName, setUserName] = useState(initialUserName)
  const [progress, setProgress] = useState(initialProgress)
  const [habits, setHabits] = useState<HabitWithStatus[]>(initialHabits)
  const [profileData, setProfileData] = useState<ProfileFormData>(initialProfileData)

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
    } catch {
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
      setRefreshMessage("Analyzing your current progress...")
      const { refreshTrainingPlan } = await import("@/lib/actions/workouts")
      const refreshResult = await refreshTrainingPlan()
      if (!refreshResult.success) {
        throw new Error(refreshResult.error || "Unable to refresh plan")
      }

      const progressResult = await getWeeklyProgress()
      if (progressResult.progress !== undefined) {
        setProgress(progressResult.progress)
      }

      setRefreshMessage("✨ Your plan has been refreshed with new AI insights!")

      setTimeout(() => {
        setRefreshMessage("")
      }, 3000)
    } catch (error) {
      setRefreshMessage("❌ Failed to refresh plan. Please try again.")
      setTimeout(() => {
        setRefreshMessage("")
      }, 3000)
    } finally {
      setIsRefreshing(false)
    }
  }

  const reloadHabits = useCallback(async () => {
    try {
      // Fetch updated habits from server
      const result = await getUserHabits()
      if (result.habits) {
        setHabits(result.habits)
      } else if (result.error) {
        toast({
          title: "Error",
          description: result.error || "Failed to refresh habits",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[Dashboard] Error reloading habits:", error)
      toast({
        title: "Error",
        description: "Failed to refresh habits",
        variant: "destructive",
      })
    }
  }, [toast])

  return (
    <div className="min-h-screen pb-24 relative">
      <AmbientBackground />
      
      <motion.div 
        className="container max-w-md px-4 py-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div className="mb-8" variants={itemVariants}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground tracking-tight">
                Hi, <span className="gradient-text">{userName || "there"}</span> 👋
              </h1>
              <p className="text-muted-foreground mt-1">Let&apos;s crush your goals today</p>
            </div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <ButtonGlow variant="outline-glow" size="icon" onClick={() => router.push("/settings")} className="h-10 w-10">
                <Settings className="h-5 w-5" />
              </ButtonGlow>
            </motion.div>
          </div>
        </motion.div>

        {/* Refresh Status Toast */}
        {(isRefreshing || refreshMessage) && (
          <motion.div 
            className="mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className={`glass-card ${refreshMessage.includes("✨") ? "glass-card-accent" : refreshMessage.includes("❌") ? "border-destructive/50" : ""}`}>
              <CardContent className="p-4">
                <div className="flex items-center">
                  {isRefreshing && <Loader2 className="mr-3 h-5 w-5 animate-spin text-accent" />}
                  {refreshMessage.includes("✨") && <Sparkles className="mr-3 h-5 w-5 text-accent" />}
                  {refreshMessage.includes("❌") && <div className="mr-3 h-5 w-5 rounded-full bg-destructive" />}
                  <p className={`text-sm font-medium ${refreshMessage.includes("✨") ? "text-accent" : refreshMessage.includes("❌") ? "text-destructive" : "text-foreground"}`}>
                    {refreshMessage || "Generating your personalized plan..."}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Progress Card - Now with Circular Progress */}
        <motion.div className="mb-6" variants={itemVariants}>
          <Card className="glass-card overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center gap-6">
                {/* Circular Progress */}
                <CircularProgress value={progress} size={100} strokeWidth={8} label="weekly" />
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="h-5 w-5 text-accent" />
                    <h2 className="text-lg font-bold text-foreground">Weekly Progress</h2>
                  </div>
                  
                  <div className="flex gap-2">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                      <ButtonGlow
                        variant="outline-glow"
                        size="sm"
                        className="w-full text-xs"
                        onClick={() => setIsProfileModalOpen(true)}
                      >
                        <User className="mr-1 h-3 w-3" /> Profile
                      </ButtonGlow>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                      <ButtonGlow
                        variant="outline-glow"
                        size="sm"
                        className="w-full text-xs"
                        onClick={handleRefreshPlanClick}
                        disabled={isRefreshing}
                      >
                        {isRefreshing ? (
                          <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                        ) : (
                          <RefreshCw className="mr-1 h-3 w-3" />
                        )}
                        Refresh
                      </ButtonGlow>
                    </motion.div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Today's Habits */}
        <motion.div className="mb-6" variants={itemVariants}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
              Today&apos;s Habits
            </h2>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <ButtonGlow variant="outline-glow" size="sm" onClick={() => setIsManageHabitsModalOpen(true)}>
                <Edit2 className="mr-1 h-3 w-3" />
                Manage
              </ButtonGlow>
            </motion.div>
          </div>
          
          {habits.length === 0 ? (
            <Card className="glass-card">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3">
                  <Target className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">No habits yet. Create some to get started!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {habits.map((habit, index) => (
                <motion.div
                  key={habit.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <Card
                    className={`cursor-pointer transition-all duration-300 ${
                      habit.completed 
                        ? "glass-card-accent" 
                        : "glass-card hover:border-accent/30"
                    }`}
                    onClick={() => handleHabitToggle(habit.id, habit.completed)}
                  >
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center">
                        <motion.div
                          className={`mr-3 flex h-7 w-7 items-center justify-center rounded-full transition-all duration-300 ${
                            habit.completed 
                              ? "bg-gradient-to-br from-accent to-accent-warm text-accent-foreground shadow-[0_0_15px_hsl(var(--accent)/0.5)]" 
                              : "border-2 border-muted-foreground/30"
                          }`}
                          animate={habit.completed ? { scale: [1, 1.2, 1] } : {}}
                          transition={{ duration: 0.3 }}
                        >
                          {habit.completed && <CheckCircle className="h-4 w-4" />}
                        </motion.div>
                        <span className={`font-medium transition-colors ${habit.completed ? "text-accent" : "text-foreground/80"}`}>
                          {habit.name}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* AI Tip of the Day */}
        <motion.div className="mb-6" variants={itemVariants}>
          <Card className="glass-card overflow-hidden relative">
            {/* Decorative gradient accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-accent/20 to-transparent rounded-bl-full" />
            
            <CardContent className="p-5 relative">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-accent" />
                  AI Insight
                </h2>
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  <Zap className="h-5 w-5 text-accent-warm" />
                </motion.div>
              </div>
              <p className="text-foreground/70 leading-relaxed">
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

        {/* CTA Button */}
        <motion.div variants={itemVariants}>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <ButtonGlow variant="accent-glow" className="w-full h-14 text-base font-semibold" onClick={() => router.push("/fitness")}>
              Start Today&apos;s Workout <ArrowRight className="ml-2 h-5 w-5" />
            </ButtonGlow>
          </motion.div>
        </motion.div>
      </motion.div>

      <BottomNav />
      
      {/* Lazy-loaded modals with Suspense */}
      {isProfileModalOpen && (
        <Suspense fallback={null}>
          <UpdateProfileModal
            isOpen={isProfileModalOpen}
            onClose={() => setIsProfileModalOpen(false)}
            currentProfile={profileData}
            onUpdate={(profile) => handleProfileUpdate(profile)}
          />
        </Suspense>
      )}
      {isRefreshModalOpen && (
        <Suspense fallback={null}>
          <RefreshPlanModal
            isOpen={isRefreshModalOpen}
            onClose={() => setIsRefreshModalOpen(false)}
            onConfirm={handleRefreshPlanConfirm}
            userName={userName}
          />
        </Suspense>
      )}
      {isManageHabitsModalOpen && (
        <Suspense fallback={null}>
          <ManageHabitsModal
            isOpen={isManageHabitsModalOpen}
            onClose={() => setIsManageHabitsModalOpen(false)}
            habits={habits}
            onHabitsChange={reloadHabits}
          />
        </Suspense>
      )}
    </div>
  )
}

