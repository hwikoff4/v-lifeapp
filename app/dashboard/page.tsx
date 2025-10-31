"use client"

import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowRight, Zap, CheckCircle, RefreshCw, User, Loader2, Settings } from "lucide-react"
import { ButtonGlow } from "@/components/ui/button-glow"
import { Card, CardContent } from "@/components/ui/card"
import { BottomNav } from "@/components/bottom-nav"
import { Progress } from "@/components/ui/progress"
import { VBotChat } from "@/components/v-bot-chat"
import { useState } from "react"
import { UpdateProfileModal } from "@/app/update-profile-modal"
import { RefreshPlanModal } from "@/app/refresh-plan-modal"

export default function Dashboard() {
  const router = useRouter()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [refreshMessage, setRefreshMessage] = useState("")
  const [showRefreshModal, setShowRefreshModal] = useState(false)

  // Mock data
  const userName = "Alex"
  const [progress, setProgress] = useState(68)
  const habits = [
    { id: 1, name: "Morning Workout", completed: true },
    { id: 2, name: "Protein Intake", completed: true },
    { id: 3, name: "8 Glasses of Water", completed: false },
    { id: 4, name: "Evening Stretch", completed: false },
  ]

  const [updateProfileModalOpen, setUpdateProfileModalOpen] = useState(false)
  const [profileData, setProfileData] = useState({
    name: "Alex",
    age: "28",
    gender: "male",
    heightFeet: "5",
    heightInches: "10",
    weight: "74",
    goalWeight: "70",
    primaryGoal: "lose-weight",
    activityLevel: 3,
    gymAccess: "commercial",
    selectedGym: "LA Fitness",
    customEquipment: "",
    allergies: ["Dairy", "Gluten"],
    customRestrictions: [],
  })

  const handleProfileUpdate = (newProfile: any) => {
    setProfileData(newProfile)
    console.log("Profile updated:", newProfile)
    // In a real app, you would save this to your backend/database
  }

  const handleRefreshPlanClick = () => {
    setShowRefreshModal(true)
  }

  const handleRefreshPlanConfirm = async () => {
    setIsRefreshing(true)
    setRefreshMessage("")

    try {
      // Simulate AI plan generation process
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

      // Simulate some progress improvement after refresh
      const newProgress = Math.min(100, progress + Math.floor(Math.random() * 10) + 5)
      setProgress(newProgress)

      setRefreshMessage("✨ Your plan has been refreshed with new AI insights!")

      // Clear success message after 3 seconds
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
                Hi, <span className="text-accent">{userName}</span> 👋
              </h1>
              <p className="text-white/70">Let's crush your goals today</p>
            </div>
            <ButtonGlow variant="outline-glow" size="icon" onClick={() => router.push("/settings")} className="h-8 w-8">
              <Settings className="h-4 w-4" />
            </ButtonGlow>
          </div>
        </motion.div>

        {/* Refresh Status Message */}
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
                  onClick={() => setUpdateProfileModalOpen(true)}
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
          <h2 className="mb-3 text-lg font-bold text-white">Today's Habits</h2>
          <div className="space-y-2">
            {habits.map((habit) => (
              <Card
                key={habit.id}
                className={`border-white/10 ${habit.completed ? "bg-accent/10" : "bg-black/50"} backdrop-blur-sm`}
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
                    : "Try incorporating 10-minute micro-workouts throughout your day for increased energy and focus."}
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
            Start Today's Workout <ArrowRight className="ml-2 h-4 w-4" />
          </ButtonGlow>
        </motion.div>
      </div>

      <BottomNav />
      <UpdateProfileModal
        isOpen={updateProfileModalOpen}
        onClose={() => setUpdateProfileModalOpen(false)}
        currentProfile={profileData}
        onUpdate={handleProfileUpdate}
      />
      <RefreshPlanModal
        isOpen={showRefreshModal}
        onClose={() => setShowRefreshModal(false)}
        onConfirm={handleRefreshPlanConfirm}
        userName={userName}
      />
      <VBotChat />
    </div>
  )
}
