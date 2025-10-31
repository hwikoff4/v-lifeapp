"use client"

import type React from "react"

import { motion, AnimatePresence } from "framer-motion"
import { X, Send, Bot, Loader2, AlertCircle } from "lucide-react"
import { ButtonGlow } from "@/components/ui/button-glow"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useChat } from "@ai-sdk/react"

// Replace the getUserData function with this enhanced version that could receive profile data
const getUserData = (profileData?: any) => ({
  profile: {
    name: profileData?.name || "Alex",
    age: profileData?.age || 28,
    currentWeight: profileData?.weight || 74,
    goalWeight: profileData?.goalWeight || 70,
    primaryGoal: profileData?.primaryGoal || "Lose Weight",
    activityLevel: profileData?.activityLevel || 3,
    gymAccess: profileData?.gymAccess || "Commercial Gym",
    allergies: profileData?.allergies || ["Dairy", "Gluten"],
  },
  // ... rest of the data remains the same
  progress: {
    weeklyProgress: 68,
    weightChange: -8,
    workoutStreak: 12,
    totalWorkouts: 45,
  },
  today: {
    habitsCompleted: 2,
    totalHabits: 4,
    caloriesConsumed: 1770,
    targetCalories: 2200,
    proteinIntake: 140,
    targetProtein: 160,
    waterIntake: 6,
    workoutCompleted: true,
  },
  meals: [
    { type: "Breakfast", name: "Protein Oatmeal Bowl", calories: 420 },
    { type: "Lunch", name: "Grilled Chicken Salad", calories: 550 },
    { type: "Dinner", name: "Salmon with Vegetables", calories: 620 },
    { type: "Snack", name: "Greek Yogurt with Berries", calories: 180 },
  ],
  habits: [
    { name: "Morning Workout", streak: 12, frequency: "daily" },
    { name: "Protein Intake", streak: 24, frequency: "daily" },
    { name: "8 Glasses of Water", streak: 8, frequency: "daily" },
    { name: "Evening Stretch", streak: 5, frequency: "daily" },
  ],
  workout: {
    programName: "Upper Body Power",
    todayWorkout: "Upper Body Power - 45 min",
    exercisesCompleted: 5,
    totalExercises: 5,
    lastWorkout: "Upper Body Power (Completed today)",
  },
  supplements: [
    { name: "Protein Powder", dosage: "1 scoop", taken: true },
    { name: "Creatine", dosage: "5g", taken: true },
    { name: "Multivitamin", dosage: "1 tablet", taken: false },
  ],
  achievements: [
    { title: "Workout Streak", description: "12 days in a row!" },
    { title: "Weight Loss", description: "Lost 8 lbs total" },
    { title: "Habit Master", description: "24-day protein streak" },
  ],
})

interface VBotChatProps {
  isOpen?: boolean
  onClose?: () => void
}

export function VBotChat({ isOpen: externalIsOpen, onClose: externalOnClose }: VBotChatProps = {}) {
  // Use external control if provided, otherwise use internal state
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : false
  const setIsOpen = externalOnClose ? (open: boolean) => !open && externalOnClose() : () => {}

  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: "/api/chat",
    body: {
      userData: getUserData(), // Send user data with each request
    },
    initialMessages: [
      {
        id: "welcome",
        role: "assistant",
        content:
          "Hi Alex! 👋 I'm V-Bot, your elite lifestyle AI coach. I can see you're crushing it with your 12-day workout streak and 68% weekly progress! I have access to all your app data - your workouts, nutrition, habits, progress photos, and goals. What would you like to work on today? 💪",
      },
    ],
    onError: (error) => {
      console.error("Chat error:", error)
    },
  })

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (input.trim() && !isLoading) {
      console.log("Submitting message:", input)
      handleSubmit(e)
    }
  }

  return (
    <>
      {/* Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm p-4 pb-24"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              className="w-full max-w-md"
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 500 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="border-accent/30 bg-black/90 backdrop-blur-lg flex flex-col max-h-[75vh]">
                <div className="flex items-center justify-between border-b border-accent/20 p-4 flex-shrink-0">
                  <div className="flex items-center">
                    <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-accent/20">
                      <Bot className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white">V-Bot</h3>
                      <p className="text-xs text-accent">Elite Lifestyle AI Coach</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" title="Connected to your data" />
                    <button onClick={() => setIsOpen(false)} className="rounded-full p-1 hover:bg-white/10">
                      <X className="h-5 w-5 text-white/60" />
                    </button>
                  </div>
                </div>

                <CardContent className="p-0 flex flex-col flex-1 min-h-0">
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-lg p-3 text-sm ${
                            message.role === "user" ? "bg-accent text-black" : "bg-accent/20 text-white"
                          }`}
                        >
                          {message.content}
                        </div>
                      </div>
                    ))}

                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-accent/20 text-white rounded-lg p-3 text-sm flex items-center">
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          V-Bot is analyzing your data...
                        </div>
                      </div>
                    )}

                    {error && (
                      <div className="flex justify-start">
                        <div className="bg-red-500/20 text-red-400 rounded-lg p-3 text-sm flex items-center">
                          <AlertCircle className="h-4 w-4 mr-2" />
                          Sorry, I'm having trouble connecting. Please try again.
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-accent/20 p-4 flex-shrink-0">
                    <form onSubmit={onSubmit} className="flex gap-2">
                      <Input
                        value={input || ""}
                        onChange={handleInputChange}
                        placeholder="Ask about your progress, workouts, nutrition..."
                        className="flex-1"
                        disabled={isLoading}
                      />
                      <ButtonGlow variant="accent-glow" size="icon" type="submit" disabled={!input.trim() || isLoading}>
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      </ButtonGlow>
                    </form>

                    {/* Quick Action Buttons */}
                    <div className="flex gap-2 mt-2 flex-wrap">
                      <button
                        onClick={() => {
                          const syntheticEvent = {
                            target: { value: "How am I doing with my goals?" },
                          } as React.ChangeEvent<HTMLInputElement>
                          handleInputChange(syntheticEvent)
                        }}
                        className="text-xs bg-accent/10 text-accent px-2 py-1 rounded-full hover:bg-accent/20 transition-all"
                        disabled={isLoading}
                      >
                        Progress Check
                      </button>
                      <button
                        onClick={() => {
                          const syntheticEvent = {
                            target: { value: "What should I focus on today?" },
                          } as React.ChangeEvent<HTMLInputElement>
                          handleInputChange(syntheticEvent)
                        }}
                        className="text-xs bg-accent/10 text-accent px-2 py-1 rounded-full hover:bg-accent/20 transition-all"
                        disabled={isLoading}
                      >
                        Today's Focus
                      </button>
                      <button
                        onClick={() => {
                          const syntheticEvent = {
                            target: { value: "Any nutrition tips based on my meals?" },
                          } as React.ChangeEvent<HTMLInputElement>
                          handleInputChange(syntheticEvent)
                        }}
                        className="text-xs bg-accent/10 text-accent px-2 py-1 rounded-full hover:bg-accent/20 transition-all"
                        disabled={isLoading}
                      >
                        Nutrition Tips
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
