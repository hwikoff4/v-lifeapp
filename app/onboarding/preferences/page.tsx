"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useOnboarding } from "@/lib/contexts/onboarding-context"
import { motion } from "framer-motion"
import { ArrowRight, Plus } from "lucide-react"
import { ButtonGlow } from "@/components/ui/button-glow"
import { Input } from "@/components/ui/input"

const allergies = ["Dairy", "Gluten", "Peanuts", "Tree Nuts", "Soy", "Eggs", "Fish", "Shellfish"]

export default function Preferences() {
  const router = useRouter()
  const { data, updateData } = useOnboarding()

  const [selectedAllergies, setSelectedAllergies] = useState<string[]>(data.allergies)
  const [customRestriction, setCustomRestriction] = useState("")
  const [customRestrictions, setCustomRestrictions] = useState<string[]>(data.customRestrictions)

  const toggleAllergy = (allergy: string) => {
    if (selectedAllergies.includes(allergy)) {
      setSelectedAllergies(selectedAllergies.filter((a) => a !== allergy))
    } else {
      setSelectedAllergies([...selectedAllergies, allergy])
    }
  }

  const addCustomRestriction = () => {
    if (customRestriction.trim() && !customRestrictions.includes(customRestriction.trim())) {
      setCustomRestrictions([...customRestrictions, customRestriction.trim()])
      setCustomRestriction("")
    }
  }

  const handleContinue = () => {
    updateData({
      allergies: selectedAllergies,
      customRestrictions,
    })
    router.push("/onboarding/confirmation")
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
          <h1 className="text-3xl font-bold text-white">Allergies & Preferences</h1>
          <p className="mt-2 text-white/70">Help us customize your nutrition plan</p>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <h2 className="text-lg font-medium text-white">Select Allergies</h2>
            <div className="flex flex-wrap gap-2">
              {allergies.map((allergy) => (
                <button
                  key={allergy}
                  className={`rounded-full px-3 py-1 text-sm transition-all ${
                    selectedAllergies.includes(allergy)
                      ? "bg-accent text-black"
                      : "bg-black/50 text-white/70 border border-accent/30 hover:border-accent/50"
                  }`}
                  onClick={() => toggleAllergy(allergy)}
                >
                  {allergy}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-medium text-white">Custom Restrictions</h2>
            <div className="flex gap-2">
              <Input
                value={customRestriction}
                onChange={(e) => setCustomRestriction(e.target.value)}
                placeholder="Add custom restriction"
                className="flex-1"
              />
              <ButtonGlow
                variant="outline-glow"
                size="icon"
                onClick={addCustomRestriction}
                disabled={!customRestriction.trim()}
              >
                <Plus className="h-4 w-4" />
              </ButtonGlow>
            </div>

            {customRestrictions.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {customRestrictions.map((restriction, index) => (
                  <div key={index} className="rounded-full bg-accent/20 px-3 py-1 text-sm text-accent">
                    {restriction}
                  </div>
                ))}
              </div>
            )}
          </div>

          <ButtonGlow variant="accent-glow" className="w-full" onClick={handleContinue}>
            Continue <ArrowRight className="ml-2 h-4 w-4" />
          </ButtonGlow>
        </div>
      </motion.div>
    </div>
  )
}
