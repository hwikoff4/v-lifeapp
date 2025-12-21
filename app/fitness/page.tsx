import { FitnessClient } from "./FitnessClient"

/**
 * Fitness page - now a lightweight client component
 * 
 * Data is fetched client-side using the useFitnessData hook,
 * eliminating server-side blocking and enabling instant navigation.
 */
export default function FitnessPage() {
  return <FitnessClient />
}
