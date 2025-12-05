"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { RefreshCw, ShoppingCart, ChevronRight, RotateCcw, Settings } from "lucide-react"
import { motion } from "framer-motion"
import { ButtonGlow } from "@/components/ui/button-glow"
import { Card, CardContent } from "@/components/ui/card"
import { BottomNav } from "@/components/bottom-nav"
import { Progress } from "@/components/ui/progress"
import { MealSwapModal } from "@/app/meal-swap-modal"
import { useToast } from "@/hooks/use-toast"
import type { Macros, Supplement } from "@/lib/types"
import type { DailyMeal } from "@/lib/actions/nutrition"

interface NutritionClientProps {
  meals: DailyMeal[]
  totals: { calories: number; protein: number; carbs: number; fat: number }
  macros: Macros
  supplements: Supplement[]
}

interface MealAlternative {
  id: string
  name: string
  calories: number
  description?: string | null
}

export function NutritionClient({ meals, totals, macros, supplements }: NutritionClientProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [mealPlan, setMealPlan] = useState(meals)
  const [swapModalOpen, setSwapModalOpen] = useState(false)
  const [selectedMealForSwap, setSelectedMealForSwap] = useState<DailyMeal | null>(null)
  const [alternatives, setAlternatives] = useState<MealAlternative[]>([])
  const [isLoadingAlternatives, setIsLoadingAlternatives] = useState(false)

  const macrosWithCurrent = useMemo(() => {
    return {
      calories: { ...macros.calories, current: totals.calories },
      protein: { ...macros.protein, current: totals.protein },
      carbs: { ...macros.carbs, current: totals.carbs },
      fat: { ...macros.fat, current: totals.fat },
    }
  }, [macros, totals])

  const openSwapModal = async (meal: DailyMeal) => {
    setSelectedMealForSwap(meal)
    setIsLoadingAlternatives(true)
    setSwapModalOpen(true)
    try {
      const { getMealAlternatives } = await import("@/lib/actions/nutrition")
      const options = await getMealAlternatives(meal.type, meal.mealId)
      setAlternatives(options)
    } catch (error) {
      console.error("[Nutrition] Failed to load alternatives:", error)
      toast({
        title: "Unable to load alternatives",
        description: "Please try again.",
        variant: "destructive",
      })
      setSwapModalOpen(false)
    } finally {
      setIsLoadingAlternatives(false)
    }
  }

  const handleMealSwap = async (newMeal: MealAlternative) => {
    if (!selectedMealForSwap) return
    try {
      const { swapMeal } = await import("@/lib/actions/nutrition")
      const result = await swapMeal(selectedMealForSwap.logId, newMeal.id)
      if (!result.success) {
        throw new Error(result.error || "Unable to swap meal")
      }
      toast({
        title: "Meal updated",
        description: `${selectedMealForSwap.type} has been refreshed.`,
      })
      router.refresh()
      setSwapModalOpen(false)
    } catch (error) {
      console.error("[Nutrition] Failed to swap meal:", error)
      toast({
        title: "Unable to swap meal",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-charcoal pb-20">
      <div className="container max-w-md px-4 py-6">
        <motion.div className="mb-6 animate-in fade-in slide-in-from-bottom-2 duration-200">
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

        <motion.div className="mb-6 animate-in fade-in slide-in-from-bottom-2 duration-200 delay-75">
          <Card className="border-white/10 bg-black/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <h2 className="mb-3 text-lg font-bold text-white">Macros Summary</h2>

              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/70">Calories</span>
                    <span className="text-white">
                      {macrosWithCurrent.calories.current} / {macrosWithCurrent.calories.target} kcal
                    </span>
                  </div>
                  <Progress
                    value={
                      (macrosWithCurrent.calories.current / (macrosWithCurrent.calories.target || 1)) *
                      100
                    }
                    className="h-2 bg-white/10"
                    indicatorClassName="bg-accent"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {(["protein", "carbs", "fat"] as const).map((macro) => (
                    <div key={macro} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="capitalize text-white/70">{macro}</span>
                        <span className="text-white">
                          {macrosWithCurrent[macro].current}
                          {macrosWithCurrent[macro].unit || ""}
                        </span>
                      </div>
                      <Progress
                        value={
                          (macrosWithCurrent[macro].current / (macrosWithCurrent[macro].target || 1)) *
                          100
                        }
                        className="h-1.5 bg-white/10"
                        indicatorClassName={
                          macro === "protein" ? "bg-accent" : macro === "carbs" ? "bg-blue-500" : "bg-green-500"
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div className="mb-6 animate-in fade-in slide-in-from-bottom-2 duration-200 delay-100">
          <h2 className="mb-3 text-lg font-bold text-white">Today's Meals</h2>

          <div className="space-y-3">
            {mealPlan.map((meal) => (
              <Card key={meal.logId} className="overflow-hidden border-white/10 bg-black/50 backdrop-blur-sm">
                <CardContent className="p-0">
                  <div className="flex">
                    <div className="h-24 w-24 flex-shrink-0 overflow-hidden bg-white/5">
                      <img
                        src={meal.image || "/placeholder.svg"}
                        alt={meal.name}
                        className="h-full w-full object-cover"
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

        <div className="flex gap-3 mb-6 animate-in fade-in slide-in-from-bottom-2 duration-200 delay-150">
          <ButtonGlow variant="outline-glow" className="flex-1" onClick={() => router.refresh()}>
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh Plan
          </ButtonGlow>
          <ButtonGlow variant="accent-glow" className="flex-1" onClick={() => router.push("/grocery-list")}>
            <ShoppingCart className="mr-2 h-4 w-4" /> Grocery List
          </ButtonGlow>
        </div>

        <motion.div className="mb-6 animate-in fade-in slide-in-from-bottom-2 duration-200 delay-200">
          <Card className="border-accent/30 bg-gradient-to-br from-accent/10 to-transparent backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">Recommended Supplements</h2>
                <span className="text-2xl">💊</span>
              </div>

              <div className="space-y-2">
                {supplements.map((supplement) => (
                  <div
                    key={supplement.id}
                    className="flex items-center justify-between rounded-lg bg-black/30 p-3 transition-all hover:bg-black/40"
                  >
                    <div>
                      <p className="font-medium text-white">{supplement.name}</p>
                      <p className="text-xs text-white/60">{supplement.category}</p>
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
          alternatives={alternatives}
          onSwap={handleMealSwap}
          loadingAlternatives={isLoadingAlternatives}
        />
      </div>

      <BottomNav />
    </div>
  )
}

