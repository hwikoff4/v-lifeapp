"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Bot,
  Send,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Zap,
  History,
  Trash2,
  MessageSquare,
  Sparkles,
  Target,
  TrendingUp,
  Heart,
  Dumbbell,
  Apple,
  Brain,
} from "lucide-react"
import { ButtonGlow } from "@/components/ui/button-glow"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { BottomNav } from "@/components/bottom-nav"
import { useChat } from "@ai-sdk/react"

// Same getUserData function from v-bot-chat.tsx
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

interface PastConversation {
  id: string
  title: string
  preview: string
  date: string
  messageCount: number
}

export default function ChatPage() {
  const router = useRouter()
  const [showHistory, setShowHistory] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)
  const [inputValue, setInputValue] = useState("")
  const [pastConversations, setPastConversations] = useState<PastConversation[]>([
    {
      id: "1",
      title: "Workout Plan Review",
      preview: "We discussed optimizing your upper body routine...",
      date: "2 days ago",
      messageCount: 12,
    },
    {
      id: "2",
      title: "Nutrition Goals",
      preview: "Talked about increasing protein intake and meal timing...",
      date: "1 week ago",
      messageCount: 8,
    },
    {
      id: "3",
      title: "Motivation & Habits",
      preview: "Strategies for maintaining your workout streak...",
      date: "2 weeks ago",
      messageCount: 15,
    },
  ])
  const [clickedAction, setClickedAction] = useState<number | null>(null)

  const { messages, append, isLoading, error } = useChat({
    api: "/api/chat",
    body: {
      userData: getUserData(),
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
      setIsInitializing(false)
    },
  })

  // Simulate initialization process
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitializing(false)
    }, 2000) // Show initialization for 2 seconds

    return () => clearTimeout(timer)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (inputValue && inputValue.trim() && !isLoading && !isInitializing) {
      console.log("Submitting message:", inputValue)
      const message = inputValue.trim()
      setInputValue("") // Clear input immediately
      await append({ role: "user", content: message })
    }
  }

  const quickActions = [
    {
      text: "Hey V-Bot! I'd love to get a comprehensive analysis of my current progress. Can you review my 12-day workout streak, my 68% weekly progress, and tell me what areas I should focus on to reach my goals faster? Please be specific about what's working well and what I could improve.",
      label: "Progress Deep Dive",
      icon: TrendingUp,
      color: "from-blue-500/20 to-blue-600/10",
      iconColor: "text-blue-400",
    },
    {
      text: "V-Bot, I want to optimize my daily routine for maximum results. Based on my current habits, workout schedule, and nutrition plan, can you suggest specific changes I should make today to accelerate my fitness journey? Include timing recommendations and priority actions.",
      label: "Daily Optimization",
      icon: Target,
      color: "from-green-500/20 to-green-600/10",
      iconColor: "text-green-400",
    },
    {
      text: "I need some personalized nutrition guidance! Looking at my current meals and macro targets, can you analyze what I'm doing well and suggest specific improvements? Also, are there any meal swaps or timing adjustments that could help me reach my goals faster?",
      label: "Nutrition Mastery",
      icon: Apple,
      color: "from-orange-500/20 to-orange-600/10",
      iconColor: "text-orange-400",
    },
    {
      text: "V-Bot, I'm feeling great about my progress but want to stay motivated for the long term. Can you help me set some exciting new challenges and milestones? Also, share some strategies to maintain this momentum when motivation dips.",
      label: "Motivation Boost",
      icon: Heart,
      color: "from-pink-500/20 to-pink-600/10",
      iconColor: "text-pink-400",
    },
    {
      text: "Let's review my workout plan! I want to make sure I'm maximizing my time in the gym. Can you analyze my current routine, suggest any improvements, and help me plan the next phase of my training to keep progressing?",
      label: "Workout Strategy",
      icon: Dumbbell,
      color: "from-red-500/20 to-red-600/10",
      iconColor: "text-red-400",
    },
    {
      text: "I'm curious about the science behind my progress! Can you explain what's happening in my body with my current routine, why certain strategies work, and share some interesting insights about fitness and nutrition that could help me optimize further?",
      label: "Science & Insights",
      icon: Brain,
      color: "from-purple-500/20 to-purple-600/10",
      iconColor: "text-purple-400",
    },
  ]

  const handleQuickAction = (actionText: string) => {
    if (!isLoading && !isInitializing) {
      console.log("Setting input to:", actionText)
      setInputValue(actionText)
    }
  }

  const deleteConversation = (id: string) => {
    setPastConversations((prev) => prev.filter((conv) => conv.id !== id))
  }

  const loadConversation = (id: string) => {
    // In a real app, this would load the actual conversation
    console.log("Loading conversation:", id)
    setShowHistory(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-charcoal to-black pb-20 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-accent/5 rounded-full blur-xl animate-pulse" />
        <div className="absolute top-40 right-16 w-24 h-24 bg-accent/10 rounded-full blur-lg animate-pulse delay-1000" />
        <div className="absolute bottom-40 left-20 w-40 h-40 bg-accent/3 rounded-full blur-2xl animate-pulse delay-2000" />
      </div>

      <div className="container max-w-md px-4 py-6 relative z-10">
        {/* Enhanced Header */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center">
            <button onClick={() => router.back()} className="mr-4 rounded-full p-2 hover:bg-white/10 transition-all">
              <ArrowLeft className="h-6 w-6 text-white" />
            </button>
            <div className="flex items-center flex-1">
              <motion.div
                className="mr-3 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-accent/30 to-accent/10 relative"
                animate={{
                  boxShadow: [
                    "0 0 20px rgba(255, 215, 0, 0.3)",
                    "0 0 30px rgba(255, 215, 0, 0.5)",
                    "0 0 20px rgba(255, 215, 0, 0.3)",
                  ],
                }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              >
                <Bot className="h-8 w-8 text-accent" />
                <motion.div
                  className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                />
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center">
                  V-Bot
                  <Sparkles className="h-5 w-5 text-accent ml-2 animate-pulse" />
                </h1>
                <div className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse mr-2" />
                  <p className="text-white/70">{isInitializing ? "Connecting..." : "Elite AI Coach • Online"}</p>
                </div>
              </div>
            </div>
            <ButtonGlow
              variant="outline-glow"
              size="icon"
              onClick={() => setShowHistory(!showHistory)}
              className="h-10 w-10"
              disabled={isInitializing}
            >
              <History className="h-5 w-5" />
            </ButtonGlow>
          </div>
        </motion.div>

        {/* Past Conversations Panel */}
        <AnimatePresence>
          {showHistory && !isInitializing && (
            <motion.div
              className="mb-6"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-accent/30 bg-black/90 backdrop-blur-lg overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-4 border-b border-accent/20">
                    <h3 className="font-bold text-white flex items-center">
                      <MessageSquare className="h-5 w-5 text-accent mr-2" />
                      Past Conversations
                    </h3>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {pastConversations.length > 0 ? (
                      pastConversations.map((conversation) => (
                        <motion.div
                          key={conversation.id}
                          className="p-4 border-b border-white/5 hover:bg-accent/5 transition-all cursor-pointer group"
                          whileHover={{ x: 4 }}
                          onClick={() => loadConversation(conversation.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-white group-hover:text-accent transition-colors">
                                {conversation.title}
                              </h4>
                              <p className="text-sm text-white/60 mt-1">{conversation.preview}</p>
                              <div className="flex items-center mt-2 text-xs text-white/40">
                                <span>{conversation.date}</span>
                                <span className="mx-2">•</span>
                                <span>{conversation.messageCount} messages</span>
                              </div>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteConversation(conversation.id)
                              }}
                              className="ml-3 p-2 rounded-full hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="p-8 text-center">
                        <MessageSquare className="h-12 w-12 text-white/20 mx-auto mb-4" />
                        <p className="text-white/60">No past conversations yet</p>
                        <p className="text-white/40 text-sm mt-1">Start chatting to build your history!</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced Chat Container */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="border-accent/30 bg-gradient-to-br from-black/95 to-charcoal/95 backdrop-blur-lg shadow-2xl">
            <CardContent className="p-0">
              {/* Messages Area */}
              <div className="h-[50vh] overflow-y-auto p-4 space-y-4 relative">
                {/* Gradient overlay for better readability */}
                <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-black/50 to-transparent pointer-events-none z-10" />

                {/* Show initialization state */}
                {isInitializing ? (
                  <div className="flex justify-center items-center h-full">
                    <motion.div
                      className="text-center"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                      >
                        <Bot className="h-16 w-16 text-accent/70 mx-auto mb-4" />
                      </motion.div>
                      <motion.p
                        className="text-white/60 text-lg font-medium"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                      >
                        V-Bot is initializing...
                      </motion.p>
                      <p className="text-white/40 text-sm mt-2">Connecting to your fitness data</p>
                      <div className="flex justify-center mt-4 space-x-1">
                        <div className="w-2 h-2 bg-accent rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-accent rounded-full animate-bounce delay-100" />
                        <div className="w-2 h-2 bg-accent rounded-full animate-bounce delay-200" />
                      </div>
                    </motion.div>
                  </div>
                ) : (
                  // Show messages once initialized
                  <>
                    {messages.map((message, index) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl p-4 text-sm relative ${
                            message.role === "user"
                              ? "bg-gradient-to-br from-accent to-accent/80 text-black shadow-lg"
                              : "bg-gradient-to-br from-accent/20 to-accent/10 text-white border border-accent/20 shadow-lg"
                          }`}
                        >
                          {message.role === "assistant" && (
                            <div className="absolute -left-3 top-4 w-6 h-6 bg-accent/20 rounded-full flex items-center justify-center border border-accent/30">
                              <Bot className="h-3 w-3 text-accent" />
                            </div>
                          )}
                          <div className="whitespace-pre-wrap">{message.content}</div>
                        </div>
                      </motion.div>
                    ))}

                    {isLoading && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-start"
                      >
                        <div className="bg-gradient-to-br from-accent/20 to-accent/10 text-white rounded-2xl p-4 text-sm flex items-center border border-accent/20 shadow-lg relative">
                          <div className="absolute -left-3 top-4 w-6 h-6 bg-accent/20 rounded-full flex items-center justify-center border border-accent/30">
                            <Bot className="h-3 w-3 text-accent" />
                          </div>
                          <Loader2 className="h-4 w-4 animate-spin mr-3 text-accent" />
                          <span>V-Bot is analyzing your data...</span>
                          <div className="ml-3 flex space-x-1">
                            <div className="w-1 h-1 bg-accent rounded-full animate-bounce" />
                            <div className="w-1 h-1 bg-accent rounded-full animate-bounce delay-100" />
                            <div className="w-1 h-1 bg-accent rounded-full animate-bounce delay-200" />
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-start"
                      >
                        <div className="bg-red-500/20 text-red-400 rounded-2xl p-4 text-sm flex items-center border border-red-500/30 shadow-lg">
                          <AlertCircle className="h-4 w-4 mr-3" />
                          Sorry, I'm having trouble connecting. Please try again.
                        </div>
                      </motion.div>
                    )}
                  </>
                )}
              </div>

              {/* Enhanced Input Section */}
              <div className="border-t border-accent/20 p-4 bg-gradient-to-r from-black/50 to-charcoal/50">
                <form onSubmit={onSubmit} className="flex gap-3 mb-4">
                  <div className="flex-1 relative">
                    <Input
                      value={inputValue}
                      onChange={handleInputChange}
                      placeholder="Ask me anything about your fitness journey..."
                      className="pr-12 bg-black/50 border-accent/30 focus:border-accent text-white placeholder:text-white/50 rounded-xl"
                      disabled={isLoading || isInitializing}
                    />
                    {inputValue && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        <Sparkles className="h-4 w-4 text-accent animate-pulse" />
                      </motion.div>
                    )}
                  </div>
                  <ButtonGlow
                    variant="accent-glow"
                    size="icon"
                    type="submit"
                    disabled={!inputValue?.trim() || isLoading || isInitializing}
                    className="h-12 w-12 rounded-xl"
                  >
                    {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                  </ButtonGlow>
                </form>

                {/* Enhanced Quick Action Buttons */}
                {!isInitializing && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-white/80 flex items-center">
                        <Zap className="h-4 w-4 text-accent mr-2" />
                        Quick Actions
                      </h4>
                      <div className="text-xs text-white/40">Tap to use prompt</div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {quickActions.map((action, index) => (
                        <motion.button
                          key={index}
                          onClick={() => {
                            handleQuickAction(action.text)
                            setClickedAction(index)
                            setTimeout(() => setClickedAction(null), 200) // Clear after 200ms
                          }}
                          className={`relative p-4 rounded-xl bg-gradient-to-br ${action.color} border border-white/10 hover:border-accent/50 transition-all text-left group overflow-hidden ${
                            clickedAction === index ? "scale-95 border-accent" : ""
                          }`}
                          disabled={isLoading || isInitializing}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          <div className="absolute top-2 right-2">
                            <action.icon
                              className={`h-5 w-5 ${action.iconColor} group-hover:scale-110 transition-transform`}
                            />
                          </div>
                          <div className="pr-8">
                            <h5 className="font-medium text-white text-sm mb-1 group-hover:text-accent transition-colors">
                              {action.label}
                            </h5>
                            <p className="text-xs text-white/60 line-clamp-2">{action.text.substring(0, 60)}...</p>
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Enhanced AI Capabilities Info */}
        {!isInitializing && (
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className="border-accent/30 bg-gradient-to-br from-accent/10 via-accent/5 to-transparent backdrop-blur-sm overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-accent/5 to-transparent opacity-50" />
              <CardContent className="p-4 relative z-10">
                <div className="flex items-center mb-3">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  >
                    <Zap className="h-5 w-5 text-accent mr-2" />
                  </motion.div>
                  <h3 className="font-bold text-white">AI Superpowers</h3>
                  <div className="ml-auto flex items-center text-xs text-accent">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
                    Connected to your data
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  {[
                    { icon: TrendingUp, text: "Progress Analysis", color: "text-blue-400" },
                    { icon: Dumbbell, text: "Workout Guidance", color: "text-red-400" },
                    { icon: Apple, text: "Nutrition Advice", color: "text-green-400" },
                    { icon: Heart, text: "Motivation Support", color: "text-pink-400" },
                    { icon: Target, text: "Goal Setting", color: "text-purple-400" },
                    { icon: Brain, text: "Smart Insights", color: "text-orange-400" },
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      className="flex items-center text-white/80 hover:text-white transition-colors"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <item.icon className={`h-3 w-3 ${item.color} mr-2`} />
                      {item.text}
                    </motion.div>
                  ))}
                </div>
                <motion.p
                  className="text-xs text-accent mt-3 flex items-center"
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  Real-time access to your complete fitness profile!
                </motion.p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
