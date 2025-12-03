"use client"

import { motion } from "framer-motion"
import { PlusCircle, LineChart, Weight, Camera, Pill } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { BottomNav } from "@/components/bottom-nav"
import { ButtonGlow } from "@/components/ui/button-glow"
import { Line, LineChart as RechartsLineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { AddHabitModal } from "@/app/add-habit-modal"
import { UpdateWeightModal } from "@/app/update-weight-modal"
import { ProgressPhotoModal } from "@/app/progress-photo-modal"
import { useState } from "react"

interface ProgressPhoto {
  id: string
  date: string
  weight?: number
  note?: string
  imageUrl: string
  type: "front" | "side" | "back" | "custom"
}

export default function Tools() {
  const [addHabitModalOpen, setAddHabitModalOpen] = useState(false)
  const [updateWeightModalOpen, setUpdateWeightModalOpen] = useState(false)
  const [progressPhotoModalOpen, setProgressPhotoModalOpen] = useState(false)

  // Mock data with weight tracking
  const [progressData, setProgressData] = useState([
    { date: "Jan", weight: 82 },
    { date: "Feb", weight: 80 },
    { date: "Mar", weight: 78 },
    { date: "Apr", weight: 77 },
    { date: "May", weight: 76 },
    { date: "Jun", weight: 75 },
    { date: "Jul", weight: 74 },
  ])

  const [weightEntries, setWeightEntries] = useState([
    { date: "2024-01-15", weight: 82, change: 0 },
    { date: "2024-01-22", weight: 80, change: -2 },
    { date: "2024-01-29", weight: 78, change: -2 },
    { date: "2024-02-05", weight: 77, change: -1 },
    { date: "2024-02-12", weight: 76, change: -1 },
    { date: "2024-02-19", weight: 75, change: -1 },
    { date: "2024-02-26", weight: 74, change: -1 },
  ])

  const [progressPhotos, setProgressPhotos] = useState<ProgressPhoto[]>([
    {
      id: "1",
      date: "2024-01-15",
      weight: 82,
      imageUrl: "/placeholder.svg?height=400&width=300",
      type: "front",
      note: "Starting my fitness journey!",
    },
    {
      id: "2",
      date: "2024-02-01",
      weight: 79,
      imageUrl: "/placeholder.svg?height=400&width=300",
      type: "side",
      note: "2 weeks in, feeling stronger",
    },
    {
      id: "3",
      date: "2024-02-15",
      weight: 76,
      imageUrl: "/placeholder.svg?height=400&width=300",
      type: "back",
      note: "Back definition starting to show",
    },
  ])

  const [habits, setHabits] = useState([
    { id: 1, name: "Morning Workout", streak: 12, category: "fitness", frequency: "daily" },
    { id: 2, name: "Protein Intake", streak: 24, category: "nutrition", frequency: "daily" },
    { id: 3, name: "8 Glasses of Water", streak: 8, category: "nutrition", frequency: "daily" },
  ])

  const supplements = [
    {
      id: 0,
      name: "Vital Flow",
      dosage: "2 capsules",
      time: "Morning",
      featured: true,
      category: "Testosterone Support",
      benefits: [
        "Naturally boost testosterone levels",
        "Enhance muscle growth and recovery",
        "Improve energy and vitality",
        "Support healthy hormone balance",
      ],
      description:
        "Our premium testosterone booster formulated with natural ingredients to optimize your hormone levels and maximize your fitness results.",
      learnMoreUrl: "#",
    },
    {
      id: 1,
      name: "Protein Powder",
      dosage: "1 scoop",
      time: "Post-workout",
      category: "Muscle Building",
      benefits: ["Supports muscle growth", "Aids recovery", "Convenient protein source"],
      description: "High-quality whey protein to fuel muscle growth and recovery after intense workouts.",
    },
    {
      id: 2,
      name: "Creatine",
      dosage: "5g",
      time: "Morning",
      category: "Performance",
      benefits: ["Increases strength", "Improves performance", "Enhances muscle mass"],
      description: "Proven supplement for increasing strength, power output, and lean muscle mass.",
    },
    {
      id: 3,
      name: "Multivitamin",
      dosage: "1 tablet",
      time: "Morning",
      category: "General Health",
      benefits: ["Fills nutritional gaps", "Supports immune system", "Boosts overall health"],
      description: "Complete daily vitamin and mineral support for optimal health and performance.",
    },
  ]

  const addHabit = (newHabit: { name: string; category: string; frequency: string }) => {
    const habit = {
      id: Date.now(),
      name: newHabit.name,
      streak: 0,
      category: newHabit.category,
      frequency: newHabit.frequency,
    }
    setHabits((prev) => [...prev, habit])
  }

  const updateWeight = (weight: number, note?: string) => {
    const today = new Date().toISOString().split("T")[0]
    const lastWeight = weightEntries[weightEntries.length - 1]?.weight || weight
    const change = weight - lastWeight

    const newEntry = {
      date: today,
      weight,
      change: Math.round(change * 10) / 10, // Round to 1 decimal
      note,
    }

    // Update weight entries
    setWeightEntries((prev) => [...prev, newEntry])

    // Update progress chart data
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const currentMonth = monthNames[new Date().getMonth()]

    setProgressData((prev) => {
      const updated = [...prev]
      const existingIndex = updated.findIndex((item) => item.date === currentMonth)

      if (existingIndex >= 0) {
        updated[existingIndex] = { date: currentMonth, weight }
      } else {
        updated.push({ date: currentMonth, weight })
      }

      return updated
    })
  }

  const addProgressPhoto = (photo: Omit<ProgressPhoto, "id">) => {
    const newPhoto: ProgressPhoto = {
      id: Date.now().toString(),
      ...photo,
    }
    setProgressPhotos((prev) => [...prev, newPhoto])
  }

  const currentWeight = weightEntries[weightEntries.length - 1]?.weight || 74

  const [expandedSupplement, setExpandedSupplement] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-charcoal pb-20">
      <div className="container max-w-md px-4 py-6">
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-2xl font-bold text-white">Tools</h1>
          <p className="text-white/70">Track your progress</p>
        </motion.div>

        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="border-white/10 bg-black/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">Progress Graph</h2>
                <div className="flex items-center text-accent">
                  <LineChart className="h-5 w-5 mr-2" />
                  <span className="text-sm font-medium">{currentWeight} lbs</span>
                </div>
              </div>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart data={progressData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis
                      dataKey="date"
                      stroke="rgba(255,255,255,0.5)"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="rgba(255,255,255,0.5)"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      domain={["dataMin - 2", "dataMax + 2"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="weight"
                      stroke="hsl(var(--accent))"
                      strokeWidth={3}
                      dot={{
                        r: 4,
                        fill: "hsl(var(--accent))",
                        strokeWidth: 2,
                        stroke: "#000",
                      }}
                      activeDot={{
                        r: 6,
                        fill: "hsl(var(--accent))",
                        strokeWidth: 2,
                        stroke: "#000",
                      }}
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
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
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Habit Builder</h2>
            <ButtonGlow variant="outline-glow" size="sm" onClick={() => setAddHabitModalOpen(true)}>
              <PlusCircle className="mr-1 h-4 w-4" /> Add
            </ButtonGlow>
          </div>

          <div className="space-y-3">
            {habits.map((habit) => (
              <Card key={habit.id} className="border-white/10 bg-black/50 backdrop-blur-sm">
                <CardContent className="flex items-center justify-between p-3">
                  <span className="text-white">{habit.name}</span>
                  <div className="rounded bg-accent/20 px-2 py-1 text-xs font-medium text-accent">
                    {habit.streak} day streak
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
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Supplements</h2>
            <Pill className="h-5 w-5 text-accent" />
          </div>

          <Card className="mb-4 overflow-hidden border-accent/50 bg-gradient-to-br from-accent/20 to-accent/5 backdrop-blur-sm">
            <CardContent className="p-0">
              <div className="relative">
                <div className="absolute right-2 top-2 rounded-full bg-accent px-3 py-1 text-xs font-bold text-black">
                  FEATURED
                </div>
                <div className="p-4">
                  <div className="mb-2 flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-white">Vital Flow</h3>
                      <p className="text-sm text-accent">Testosterone Booster</p>
                    </div>
                  </div>

                  <p className="mb-3 text-sm text-white/80">
                    Our premium testosterone booster formulated with natural ingredients to optimize your hormone levels
                    and maximize your fitness results.
                  </p>

                  <div className="mb-3 space-y-1">
                    {supplements[0].benefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-center text-xs text-white/70">
                        <div className="mr-2 h-1 w-1 rounded-full bg-accent" />
                        {benefit}
                      </div>
                    ))}
                  </div>

                  <div className="mb-3 flex items-center justify-between rounded-lg bg-black/30 p-2">
                    <div>
                      <p className="text-xs text-white/60">Recommended Dosage</p>
                      <p className="text-sm font-medium text-white">
                        {supplements[0].dosage} • {supplements[0].time}
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      className="h-5 w-5 rounded border-accent bg-black/50 text-accent focus:ring-accent"
                    />
                  </div>

                  <div className="flex gap-2">
                    <ButtonGlow variant="accent-glow" className="flex-1" size="sm">
                      Get Vital Flow
                    </ButtonGlow>
                    <ButtonGlow
                      variant="outline-glow"
                      size="sm"
                      onClick={() => setExpandedSupplement(expandedSupplement === 0 ? null : 0)}
                    >
                      Learn More
                    </ButtonGlow>
                  </div>

                  {expandedSupplement === 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 space-y-2 border-t border-white/10 pt-3"
                    >
                      <h4 className="font-semibold text-white">Why Vital Flow?</h4>
                      <p className="text-xs text-white/70">
                        Vital Flow combines scientifically-backed ingredients like D-Aspartic Acid, Fenugreek, and
                        Tribulus Terrestris to naturally support your body's testosterone production. Perfect for men
                        looking to optimize their hormone levels, build muscle, and enhance overall vitality.
                      </p>
                      <div className="rounded-lg bg-black/30 p-2">
                        <p className="text-xs font-medium text-accent">Key Ingredients:</p>
                        <p className="text-xs text-white/60">
                          D-Aspartic Acid, Fenugreek Extract, Tribulus Terrestris, Zinc, Vitamin D3, Magnesium
                        </p>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            {supplements.slice(1).map((supplement) => (
              <Card key={supplement.id} className="border-white/10 bg-black/50 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-1 flex items-center justify-between">
                        <h3 className="font-medium text-white">{supplement.name}</h3>
                        <input
                          type="checkbox"
                          className="h-5 w-5 rounded border-accent bg-black/50 text-accent focus:ring-accent"
                        />
                      </div>
                      <p className="mb-2 text-xs text-accent">{supplement.category}</p>
                      <p className="mb-2 text-xs text-white/60">
                        {supplement.dosage} • {supplement.time}
                      </p>

                      {expandedSupplement === supplement.id ? (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="space-y-2"
                        >
                          <p className="text-xs text-white/70">{supplement.description}</p>
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-white">Benefits:</p>
                            {supplement.benefits.map((benefit, idx) => (
                              <div key={idx} className="flex items-center text-xs text-white/60">
                                <div className="mr-2 h-1 w-1 rounded-full bg-accent" />
                                {benefit}
                              </div>
                            ))}
                          </div>
                          <ButtonGlow
                            variant="outline-glow"
                            size="sm"
                            className="w-full"
                            onClick={() => setExpandedSupplement(null)}
                          >
                            Show Less
                          </ButtonGlow>
                        </motion.div>
                      ) : (
                        <ButtonGlow
                          variant="outline-glow"
                          size="sm"
                          className="w-full"
                          onClick={() => setExpandedSupplement(supplement.id)}
                        >
                          Learn More
                        </ButtonGlow>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="flex gap-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <ButtonGlow variant="outline-glow" className="flex-1" onClick={() => setUpdateWeightModalOpen(true)}>
            <Weight className="mr-2 h-4 w-4" /> Update Weight
          </ButtonGlow>
          <ButtonGlow variant="accent-glow" className="flex-1" onClick={() => setProgressPhotoModalOpen(true)}>
            <Camera className="mr-2 h-4 w-4" /> Progress Photo
          </ButtonGlow>
        </motion.div>

        <AddHabitModal isOpen={addHabitModalOpen} onClose={() => setAddHabitModalOpen(false)} onAdd={addHabit} />
        <UpdateWeightModal
          isOpen={updateWeightModalOpen}
          onClose={() => setUpdateWeightModalOpen(false)}
          currentWeight={currentWeight}
          onUpdate={updateWeight}
          recentEntries={weightEntries}
        />
        <ProgressPhotoModal
          isOpen={progressPhotoModalOpen}
          onClose={() => setProgressPhotoModalOpen(false)}
          onAdd={addProgressPhoto}
          recentPhotos={progressPhotos}
          currentWeight={currentWeight}
        />
      </div>

      <BottomNav />
    </div>
  )
}
