import { NutritionClient } from "./NutritionClient"

/**
 * Nutrition page - now a lightweight client component
 * 
 * Data is fetched client-side using the useNutritionData hook,
 * eliminating server-side blocking and enabling instant navigation.
 */
export default function NutritionPage() {
  return <NutritionClient />
}
