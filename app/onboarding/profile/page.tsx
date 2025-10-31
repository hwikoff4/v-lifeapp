"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowRight, Dumbbell, Home, Hotel, Building, Settings } from "lucide-react"
import { ButtonGlow } from "@/components/ui/button-glow"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase"

function ProfileSetupContent() {
  const router = useRouter()
  const { user } = useAuth()
  const [name, setName] = useState("")
  const [age, setAge] = useState("")
  const [gender, setGender] = useState("")
  const [heightFeet, setHeightFeet] = useState("")
  const [heightInches, setHeightInches] = useState("")
  const [weight, setWeight] = useState("")
  const [gymAccess, setGymAccess] = useState<string | null>(null)
  const [activityLevel, setActivityLevel] = useState(3)
  const [showActivityDefinitions, setShowActivityDefinitions] = useState(false)
  const [customEquipment, setCustomEquipment] = useState("")
  const [showCustomEquipment, setShowCustomEquipment] = useState(false)
  const [selectedGym, setSelectedGym] = useState<string | null>(null)
  const [showGymRequest, setShowGymRequest] = useState(false)
  const [requestedGym, setRequestedGym] = useState("")
  const [saving, setSaving] = useState(false)

  const popularGyms = [
    "Planet Fitness",
    "LA Fitness",
    "24 Hour Fitness",
    "Gold's Gym",
    "Anytime Fitness",
    "Crunch Fitness",
    "Equinox",
    "Life Time Fitness",
  ]

  const handleContinue = async () => {
    if (!user) return

    setSaving(true)

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          name,
          age: age ? parseInt(age) : null,
          gender,
          height_feet: heightFeet ? parseInt(heightFeet) : null,
          height_inches: heightInches ? parseInt(heightInches) : null,
          weight: weight ? parseFloat(weight) : null,
          gym_access: gymAccess,
          selected_gym: selectedGym,
          custom_equipment: customEquipment,
          activity_level: activityLevel,
        })

      if (error) {
        console.error('Error saving profile:', error)
      } else {
        router.push("/onboarding/goals")
      }
    } catch (err) {
      console.error('Unexpected error:', err)
    } finally {
      setSaving(false)
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
          <h1 className="text-3xl font-bold text-white">Profile Setup</h1>
          <p className="mt-2 text-white/70">Tell us about yourself</p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input id="age" type="number" placeholder="Age" value={age} onChange={(e) => setAge(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <select
                id="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Height</Label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input id="feet" type="number" placeholder="Feet" min="1" max="8" value={heightFeet} onChange={(e) => setHeightFeet(e.target.value)} />
                </div>
                <div className="flex-1">
                  <Input id="inches" type="number" placeholder="Inches" min="0" max="11" value={heightInches} onChange={(e) => setHeightInches(e.target.value)} />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (lbs)</Label>
              <Input id="weight" type="number" placeholder="Weight in lbs" value={weight} onChange={(e) => setWeight(e.target.value)} />
            </div>
          </div>

          <div className="space-y-3">
            <Label>Gym Access</Label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Home, label: "Home", value: "home" },
                { icon: Hotel, label: "Hotel", value: "hotel" },
                { icon: Building, label: "Commercial", value: "commercial" },
                { icon: Dumbbell, label: "None", value: "none" },
              ].map((item) => (
                <Card
                  key={item.value}
                  className={`flex cursor-pointer flex-col items-center justify-center p-4 transition-all hover:border-accent ${gymAccess === item.value ? "border-accent border-glow" : "border-border"}`}
                  onClick={() => {
                    setGymAccess(item.value)
                    setShowCustomEquipment(false)
                    setSelectedGym(null)
                  }}
                >
                  <item.icon className={`mb-2 h-6 w-6 ${gymAccess === item.value ? "text-accent" : "text-white/70"}`} />
                  <span className={gymAccess === item.value ? "text-accent" : "text-white/70"}>{item.label}</span>
                </Card>
              ))}
              <Card
                className={`flex cursor-pointer flex-col items-center justify-center p-4 transition-all hover:border-accent ${gymAccess === "gym" ? "border-accent border-glow" : "border-border"}`}
                onClick={() => {
                  setGymAccess("gym")
                  setShowCustomEquipment(false)
                }}
              >
                <Building className={`mb-2 h-6 w-6 ${gymAccess === "gym" ? "text-accent" : "text-white/70"}`} />
                <span className={gymAccess === "gym" ? "text-accent" : "text-white/70"}>Specific Gym</span>
              </Card>
              <Card
                className={`flex cursor-pointer flex-col items-center justify-center p-4 transition-all hover:border-accent ${gymAccess === "custom" ? "border-accent border-glow" : "border-border"}`}
                onClick={() => {
                  setGymAccess("custom")
                  setShowCustomEquipment(true)
                  setSelectedGym(null)
                }}
              >
                <Settings className={`mb-2 h-6 w-6 ${gymAccess === "custom" ? "text-accent" : "text-white/70"}`} />
                <span className={gymAccess === "custom" ? "text-accent" : "text-white/70"}>Custom</span>
              </Card>
            </div>

            {gymAccess === "gym" && (
              <div className="mt-3 space-y-3">
                <Label htmlFor="gym-select">Select Your Gym</Label>
                <select
                  id="gym-select"
                  value={selectedGym || ""}
                  onChange={(e) => {
                    setSelectedGym(e.target.value)
                    if (e.target.value === "request") {
                      setShowGymRequest(true)
                    } else {
                      setShowGymRequest(false)
                    }
                  }}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Choose your gym...</option>
                  {popularGyms.map((gym) => (
                    <option key={gym} value={gym}>
                      {gym}
                    </option>
                  ))}
                  <option value="request">My gym is not listed - Request to add</option>
                </select>

                {selectedGym && selectedGym !== "request" && (
                  <div className="rounded-lg border border-accent/30 bg-black/30 p-3">
                    <p className="text-sm text-accent font-medium">Great choice!</p>
                    <p className="text-xs text-white/80 mt-1">
                      We'll create your workout plan using the exact equipment available at {selectedGym}.
                    </p>
                  </div>
                )}

                {showGymRequest && (
                  <div className="space-y-3 rounded-lg border border-accent/30 bg-black/30 p-3">
                    <Label htmlFor="requested-gym">Gym Name</Label>
                    <Input
                      id="requested-gym"
                      value={requestedGym}
                      onChange={(e) => setRequestedGym(e.target.value)}
                      placeholder="Enter your gym's name and location"
                    />
                    <p className="text-xs text-white/60">
                      We'll review your request and add your gym's equipment profile to help create more accurate
                      workout plans.
                    </p>
                    <ButtonGlow variant="outline-glow" size="sm" className="w-full">
                      Submit Gym Request
                    </ButtonGlow>
                  </div>
                )}
              </div>
            )}

            {showCustomEquipment && gymAccess === "custom" && (
              <div className="mt-3 space-y-2">
                <Label htmlFor="equipment">Available Equipment</Label>
                <Input
                  id="equipment"
                  value={customEquipment}
                  onChange={(e) => setCustomEquipment(e.target.value)}
                  placeholder="e.g., Dumbbells, Resistance bands, Pull-up bar..."
                  className="w-full"
                />
                <p className="text-xs text-white/60">List the equipment you have access to</p>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <Label>Activity Level</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-white/70">{activityLevel}/5</span>
                <button
                  type="button"
                  onClick={() => setShowActivityDefinitions(!showActivityDefinitions)}
                  className="text-xs text-accent hover:text-accent/80 underline"
                >
                  {showActivityDefinitions ? "Hide" : "View"} definitions
                </button>
              </div>
            </div>

            {showActivityDefinitions && (
              <div className="rounded-lg border border-accent/30 bg-black/30 p-3 text-xs text-white/80">
                <div className="space-y-2">
                  <div>
                    <span className="font-medium text-accent">1 - Sedentary:</span> Little to no exercise, desk job
                  </div>
                  <div>
                    <span className="font-medium text-accent">2 - Lightly Active:</span> Light exercise 1-3 days/week
                  </div>
                  <div>
                    <span className="font-medium text-accent">3 - Moderately Active:</span> Moderate exercise 3-5
                    days/week
                  </div>
                  <div>
                    <span className="font-medium text-accent">4 - Very Active:</span> Hard exercise 6-7 days/week
                  </div>
                  <div>
                    <span className="font-medium text-accent">5 - Extremely Active:</span> Very hard exercise, physical
                    job
                  </div>
                </div>
              </div>
            )}

            <Slider
              defaultValue={[3]}
              max={5}
              min={1}
              step={1}
              onValueChange={(value) => setActivityLevel(value[0])}
              className="py-4"
            />
            <div className="flex justify-between text-xs text-white/50">
              <span>Sedentary</span>
              <span>Very Active</span>
            </div>
          </div>

          <ButtonGlow variant="accent-glow" className="w-full" onClick={handleContinue} disabled={saving}>
            {saving ? "Saving..." : "Continue"} <ArrowRight className="ml-2 h-4 w-4" />
          </ButtonGlow>
        </div>
      </motion.div>
    </div>
  )
}

export default function ProfileSetup() {
  return (
    <ProtectedRoute>
      <ProfileSetupContent />
    </ProtectedRoute>
  )
}
