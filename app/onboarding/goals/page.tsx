"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowRight, Upload } from "lucide-react"
import { ButtonGlow } from "@/components/ui/button-glow"
import { Card } from "@/components/ui/card"

const goals = [
  { id: "lose-weight", title: "Lose Weight", description: "Burn fat and get leaner" },
  { id: "tone-up", title: "Tone Up", description: "Define muscles and improve shape" },
  { id: "build-muscle", title: "Build Muscle", description: "Gain strength and size" },
  { id: "lifestyle", title: "Lifestyle Maintenance", description: "Stay healthy and active" },
]

const transformations = [
  { id: "lose-weight", title: "Lose Weight" },
  { id: "tone", title: "Tone & Define" },
  { id: "build", title: "Build Muscle" },
  { id: "balanced", title: "Balanced Lifestyle" },
]

export default function GoalSelection() {
  const router = useRouter()
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null)
  const [photoUploaded, setPhotoUploaded] = useState(false)
  const [selectedTransformation, setSelectedTransformation] = useState<string | null>(null)
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string | null>(null)

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const photoUrl = URL.createObjectURL(file)
      setUploadedPhotoUrl(photoUrl)
      setPhotoUploaded(true)
    }
  }

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

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3">
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

          <motion.div
            className="mt-8 rounded-lg border border-accent border-glow bg-black/50 p-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="mb-3 text-xl font-bold text-accent">AI Body Visualization</h2>
            <p className="mb-4 text-sm text-white/80">
              Want to see your future self? Upload a photo and let AI show your transformation!
            </p>

            {!photoUploaded ? (
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-accent/50 bg-black/30 p-6 transition-all hover:border-accent">
                <Upload className="mb-2 h-8 w-8 text-accent/70" />
                <p className="text-sm text-white/70">Drag & drop or click to upload</p>
                <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
              </label>
            ) : (
              <div className="space-y-4">
                <div className="relative h-48 rounded-lg bg-black/50 p-2">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <img
                      src={uploadedPhotoUrl || "/placeholder.svg?height=200&width=300"}
                      alt="Before/After Preview"
                      className="h-full w-full rounded object-cover"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-white">Transformation Presets:</p>
                  <div className="flex flex-wrap gap-2">
                    {transformations.map((transform) => (
                      <button
                        key={transform.id}
                        className={`rounded-full px-3 py-1 text-xs transition-all ${
                          selectedTransformation === transform.id
                            ? "bg-accent text-black"
                            : "bg-black/50 text-white/70 border border-accent/30 hover:border-accent/50"
                        }`}
                        onClick={() => setSelectedTransformation(transform.id)}
                      >
                        {transform.title}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <ButtonGlow variant="outline-glow" size="sm" className="flex-1">
                    Save Preview
                  </ButtonGlow>
                </div>
              </div>
            )}
          </motion.div>

          <ButtonGlow variant="accent-glow" className="w-full" onClick={() => router.push("/onboarding/preferences")}>
            Continue <ArrowRight className="ml-2 h-4 w-4" />
          </ButtonGlow>
        </div>
      </motion.div>
    </div>
  )
}
