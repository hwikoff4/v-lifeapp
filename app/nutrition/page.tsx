import { NutritionClient } from "./NutritionClient"
import { getDailyMealPlan, getNutritionTargets, getRecommendedSupplements } from "@/lib/actions/nutrition"

export default async function NutritionPage() {
  const [{ meals, totals }, targets, supplements] = await Promise.all([
    getDailyMealPlan(),
    getNutritionTargets(),
    getRecommendedSupplements(),
  ])

  return <NutritionClient meals={meals} totals={totals} macros={targets.macros} supplements={supplements} />
}

