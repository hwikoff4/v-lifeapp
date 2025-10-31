"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, RotateCcw, Check } from "lucide-react"
import { ButtonGlow } from "@/components/ui/button-glow"
import { Card, CardContent } from "@/components/ui/card"

interface MealOption {
  name: string
  calories: number
  description?: string
}

interface MealSwapModalProps {
  isOpen: boolean
  onClose: () => void
  mealType: string
  currentMeal: string
  alternatives: MealOption[]
  onSwap: (newMeal: MealOption) => void
}

export function MealSwapModal({ isOpen, onClose, mealType, currentMeal, alternatives, onSwap }: MealSwapModalProps) {
  const [selectedMeal, setSelectedMeal] = useState<MealOption | null>(null)

  const handleSwap = () => {
    if (selectedMeal) {
      onSwap(selectedMeal)
      onClose()
      setSelectedMeal(null)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm p-4 pb-24"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
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
                <div>
                  <h3 className="font-bold text-white">Swap {mealType}</h3>
                  <p className="text-xs text-accent">Currently: {currentMeal}</p>
                </div>
                <button onClick={onClose} className="rounded-full p-1 hover:bg-white/10">
                  <X className="h-5 w-5 text-white/60" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {alternatives.map((meal, index) => (
                  <Card
                    key={index}
                    className={`cursor-pointer transition-all hover:border-accent/50 ${
                      selectedMeal?.name === meal.name
                        ? "border-accent border-glow bg-accent/10"
                        : "border-white/10 bg-black/30"
                    }`}
                    onClick={() => setSelectedMeal(meal)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4
                            className={`font-medium ${selectedMeal?.name === meal.name ? "text-accent" : "text-white"}`}
                          >
                            {meal.name}
                          </h4>
                          <p className="text-sm text-white/60">{meal.calories} kcal</p>
                          {meal.description && <p className="text-xs text-white/50 mt-1">{meal.description}</p>}
                        </div>
                        {selectedMeal?.name === meal.name && <Check className="h-5 w-5 text-accent ml-2" />}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="border-t border-accent/20 p-4 flex gap-3 flex-shrink-0">
                <ButtonGlow variant="outline-glow" onClick={onClose} className="flex-1">
                  Cancel
                </ButtonGlow>
                <ButtonGlow variant="accent-glow" onClick={handleSwap} disabled={!selectedMeal} className="flex-1">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Swap Meal
                </ButtonGlow>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
