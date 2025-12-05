import { NutritionClient } from "./NutritionClient"
import { getDailyMealPlan, getNutritionTargets, getRecommendedSupplements } from "@/lib/actions/nutrition"

export default async function NutritionPage() {
  const [dailyPlan, targets, supplements] = await Promise.all([
    getDailyMealPlan(),
    getNutritionTargets(),
    getRecommendedSupplements(),
  ])

  return (
    <NutritionClient
      meals={dailyPlan.meals}
      totals={dailyPlan.totals}
      macros={targets.macros}
      supplements={supplements}
      tomorrowMeals={dailyPlan.tomorrowMeals}
    />
  )
}

