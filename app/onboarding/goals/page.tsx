"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { ButtonGlow } from "@/components/ui/button-glow"
import { Card } from "@/components/ui/card"
import { useOnboarding } from "@/lib/contexts/onboarding-context"
import { useToast } from "@/hooks/use-toast"

const goals = [
  { id: "lose-weight", title: "Lose Weight", description: "Burn fat and get leaner" },
  { id: "tone-up", title: "Tone Up", description: "Define muscles and improve shape" },
  { id: "build-muscle", title: "Build Muscle", description: "Gain strength and size" },
  { id: "lifestyle", title: "Lifestyle Maintenance", description: "Stay healthy and active" },
]

export default function GoalSelection() {
  const router = useRouter()
  const { data, updateData } = useOnboarding()
  const { toast } = useToast()

  const [selectedGoal, setSelectedGoal] = useState<string | null>(data.primaryGoal || null)

  const handleContinue = () => {
    if (!selectedGoal) {
      toast({
        title: "Choose a goal",
        description: "Select the primary result you want so we can personalize everything else.",
        variant: "destructive",
      })
      return
    }

    updateData({
      primaryGoal: selectedGoal,
    })
    router.push("/onboarding/preferences")
  }

  const focusAreas = [
    {
      title: "Training Focus",
      description: "We’ll adjust volume, exercise selection, and recovery sessions around this outcome.",
    },
    {
      title: "Nutrition Targets",
      description: "Daily calories, protein, and macro splits are tailored to match your primary goal.",
    },
    {
      title: "Habit Coaching",
      description: "We highlight the habits (sleep, hydration, mindfulness) that most impact your objective.",
    },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-black to-charcoal p-4">
      <motion.div
        className="mx-auto w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white">Select Your Goal</h1>
          <p className="mt-2 text-white/70">What would you like to achieve?</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.26fr,0.74fr]">
          <div className="space-y-6">
            <div className="grid gap-3 sm:grid-cols-2">
              {goals.map((goal) => (
                <Card
                  key={goal.id}
                  className={`flex cursor-pointer flex-col p-4 transition-all hover:border-accent ${selectedGoal === goal.id ? "border-accent border-glow" : "border-border"}`}
                  onClick={() => setSelectedGoal(goal.id)}
                >
                  <h3 className={`font-bold ${selectedGoal === goal.id ? "text-accent" : "text-white"}`}>{goal.title}</h3>
                  <p className="mt-1 text-sm text-white/70">{goal.description}</p>
                </Card>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <motion.div
              className="rounded-lg border border-white/10 bg-black/40 p-4 space-y-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-xl font-bold text-white">What This Choice Unlocks</h2>
              <p className="text-sm text-white/70">
                Your primary goal sets the tone for coaching, nutrition targets, and how V-Life celebrates your wins.
              </p>

              <div className="space-y-3">
                {focusAreas.map((area) => (
                  <div key={area.title} className="rounded-lg border border-white/10 bg-black/30 p-3">
                    <p className="text-sm font-semibold text-accent">{area.title}</p>
                    <p className="text-xs text-white/70 mt-1">{area.description}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <ButtonGlow variant="accent-glow" className="w-full" onClick={handleContinue}>
              Continue <ArrowRight className="ml-2 h-4 w-4" />
            </ButtonGlow>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
