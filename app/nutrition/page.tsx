"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { RefreshCw, ShoppingCart, ChevronRight, RotateCcw, Settings } from "lucide-react"
import { ButtonGlow } from "@/components/ui/button-glow"
import { Card, CardContent } from "@/components/ui/card"
import { BottomNav } from "@/components/bottom-nav"
import { Progress } from "@/components/ui/progress"
import { MealSwapModal } from "@/app/meal-swap-modal"
import { getMealImage } from "@/lib/meal-images"

export default function Nutrition() {
  const router = useRouter()

  const [meals, setMeals] = useState([
    {
      id: 1,
      type: "Breakfast",
      name: "Protein Oatmeal Bowl",
      calories: 420,
      image: getMealImage("Protein Oatmeal Bowl"),
    },
    {
      id: 2,
      type: "Lunch",
      name: "Grilled Chicken Salad",
      calories: 550,
      image: getMealImage("Grilled Chicken Salad"),
    },
    {
      id: 3,
      type: "Dinner",
      name: "Salmon with Vegetables",
      calories: 620,
      image: getMealImage("Salmon with Vegetables"),
    },
    {
      id: 4,
      type: "Snack",
      name: "Greek Yogurt with Berries",
      calories: 180,
      image: getMealImage("Greek Yogurt with Berries"),
    },
  ])

  const [swapModalOpen, setSwapModalOpen] = useState(false)
  const [selectedMealForSwap, setSelectedMealForSwap] = useState<any>(null)

  const macros: Record<string, { current: number; target: number; unit?: string }> = {
    calories: { current: 1770, target: 2200 },
    protein: { current: 140, target: 160, unit: "g" },
    carbs: { current: 180, target: 220, unit: "g" },
    fat: { current: 55, target: 70, unit: "g" },
  }

  const recommendedSupplements = [
    {
      name: "Vital Flow",
      reason: "Optimize testosterone for muscle growth",
      icon: "⚡",
    },
    {
      name: "Protein Powder",
      reason: "Meet your daily protein target",
      icon: "💪",
    },
    {
      name: "Creatine",
      reason: "Enhance strength and performance",
      icon: "🔥",
    },
  ]

  const openGroceryList = () => {
    router.push("/grocery-list")
  }

  const openSwapModal = (meal: any) => {
    setSelectedMealForSwap(meal)
    setSwapModalOpen(true)
  }

  const handleMealSwap = (newMeal: { name: string; calories: number }) => {
    if (selectedMealForSwap) {
      setMeals((prevMeals) =>
        prevMeals.map((meal) =>
          meal.id === selectedMealForSwap.id
            ? {
                ...meal,
                name: newMeal.name,
                calories: newMeal.calories,
                image: getMealImage(newMeal.name),
              }
            : meal,
        ),
      )
    }
  }

  const getMealAlternatives = (mealType: string) => {
    const alternatives = {
      Breakfast: [
        { name: "Scrambled Eggs with Spinach", calories: 380, description: "High protein, iron-rich" },
        { name: "Greek Yogurt Parfait", calories: 350, description: "Probiotics and antioxidants" },
        { name: "Protein Smoothie Bowl", calories: 410, description: "Quick and customizable" },
        { name: "Avocado Toast with Eggs", calories: 450, description: "Healthy fats and protein" },
        { name: "Chia Pudding with Berries", calories: 320, description: "Omega-3 rich" },
      ],
      Lunch: [
        { name: "Turkey and Quinoa Bowl", calories: 520, description: "Complete protein source" },
        { name: "Tuna Salad Wrap", calories: 480, description: "Omega-3 and portable" },
        { name: "Chicken Buddha Bowl", calories: 580, description: "Balanced macros" },
        { name: "Lentil Power Salad", calories: 510, description: "Plant-based protein" },
        { name: "Shrimp and Veggie Stir-fry", calories: 490, description: "Low-carb option" },
      ],
      Dinner: [
        { name: "Grilled Chicken with Sweet Potato", calories: 590, description: "Classic muscle-building meal" },
        { name: "Turkey Meatballs with Zucchini", calories: 560, description: "Low-carb, high protein" },
        { name: "Baked Cod with Asparagus", calories: 580, description: "Lean fish, high in vitamins" },
        { name: "Lean Beef Stir-fry", calories: 640, description: "Iron and B-vitamins" },
        { name: "Tofu and Vegetable Curry", calories: 520, description: "Plant-based option" },
      ],
      Snack: [
        { name: "Apple with Almond Butter", calories: 200, description: "Natural sugars and healthy fats" },
        { name: "Protein Shake", calories: 160, description: "Quick post-workout fuel" },
        { name: "Mixed Nuts and Berries", calories: 220, description: "Antioxidants and healthy fats" },
        { name: "Cottage Cheese with Fruit", calories: 190, description: "Casein protein for recovery" },
        { name: "Hard-boiled Eggs", calories: 140, description: "Portable protein source" },
      ],
    }

    return alternatives[mealType as keyof typeof alternatives] || []
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
              <h1 className="text-2xl font-bold text-white">Nutrition Plan</h1>
              <p className="text-white/70">Today's meal plan</p>
            </div>
            <ButtonGlow variant="outline-glow" size="icon" onClick={() => router.push("/tools")} className="h-8 w-8">
              <Settings className="h-4 w-4" />
            </ButtonGlow>
          </div>
        </motion.div>

        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="border-white/10 bg-black/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <h2 className="mb-3 text-lg font-bold text-white">Macros Summary</h2>

              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/70">Calories</span>
                    <span className="text-white">
                      {macros.calories.current} / {macros.calories.target} kcal
                    </span>
                  </div>
                  <Progress
                    value={(macros.calories.current / macros.calories.target) * 100}
                    className="h-2 bg-white/10"
                    indicatorClassName="bg-accent"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {["protein", "carbs", "fat"].map((macro) => (
                    <div key={macro} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="capitalize text-white/70">{macro}</span>
                        <span className="text-white">
                          {macros[macro].current}
                          {macros[macro].unit || ""}
                        </span>
                      </div>
                      <Progress
                        value={
                          (macros[macro].current / macros[macro].target) *
                          100
                        }
                        className="h-1.5 bg-white/10"
                        indicatorClassName={`${macro === "protein" ? "bg-accent" : macro === "carbs" ? "bg-blue-500" : "bg-green-500"}`}
                      />
                    </div>
                  ))}
                </div>
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
          <h2 className="mb-3 text-lg font-bold text-white">Today's Meals</h2>

          <div className="space-y-3">
            {meals.map((meal) => (
              <Card key={meal.id} className="overflow-hidden border-white/10 bg-black/50 backdrop-blur-sm">
                <CardContent className="p-0">
                  <div className="flex">
                    <div className="h-24 w-24 flex-shrink-0 overflow-hidden bg-white/5">
                      <img
                        src={meal.image || "/placeholder.svg"}
                        alt={meal.name}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          console.log("[v0] Failed to load meal image:", meal.image)
                          e.currentTarget.src = `/placeholder.svg?height=100&width=150&query=${encodeURIComponent(meal.name)}`
                        }}
                        loading="eager"
                        crossOrigin="anonymous"
                      />
                    </div>
                    <div className="flex flex-1 flex-col justify-between p-3">
                      <div>
                        <span className="text-xs font-medium text-accent">{meal.type}</span>
                        <h3 className="font-medium text-white">{meal.name}</h3>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-white/70">{meal.calories} kcal</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openSwapModal(meal)}
                            className="flex items-center justify-center w-8 h-8 rounded-full bg-accent/20 hover:bg-accent/30 transition-all group"
                            title="Swap this meal"
                          >
                            <RotateCcw className="h-4 w-4 text-accent group-hover:rotate-180 transition-transform duration-300" />
                          </button>
                          <ChevronRight className="h-4 w-4 text-white/40" />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="flex gap-3 mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <ButtonGlow variant="outline-glow" className="flex-1">
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh Plan
          </ButtonGlow>
          <ButtonGlow variant="accent-glow" className="flex-1" onClick={openGroceryList}>
            <ShoppingCart className="mr-2 h-4 w-4" /> Grocery List
          </ButtonGlow>
        </motion.div>

        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Card className="border-accent/30 bg-gradient-to-br from-accent/10 to-transparent backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">Recommended Supplements</h2>
                <span className="text-2xl">💊</span>
              </div>

              <div className="space-y-2">
                {recommendedSupplements.map((supplement, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-lg bg-black/30 p-3 transition-all hover:bg-black/40"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{supplement.icon}</span>
                      <div>
                        <p className="font-medium text-white">{supplement.name}</p>
                        <p className="text-xs text-white/60">{supplement.reason}</p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-accent" />
                  </div>
                ))}
              </div>

              <ButtonGlow variant="accent-glow" className="mt-3 w-full" size="sm" onClick={() => router.push("/tools")}>
                View All Supplements
              </ButtonGlow>
            </CardContent>
          </Card>
        </motion.div>

        <MealSwapModal
          isOpen={swapModalOpen}
          onClose={() => setSwapModalOpen(false)}
          mealType={selectedMealForSwap?.type || ""}
          currentMeal={selectedMealForSwap?.name || ""}
          alternatives={getMealAlternatives(selectedMealForSwap?.type || "")}
          onSwap={handleMealSwap}
        />
      </div>

      <BottomNav />
    </div>
  )
}
