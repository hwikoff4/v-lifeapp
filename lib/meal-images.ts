// Meal name to direct blob URL mapping
const mealImageMapping: Record<string, string> = {
  "Protein Oatmeal Bowl":
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/oatmeal-4hWIkUO0h1hADvHpaMvfzN0k2RCtaa.png",
  "Grilled Chicken Salad":
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/chicken%20salad-lVhbZxZh2e5xxaLMdshXfWQzGxHgCe.png",
  "Salmon with Vegetables":
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/salmon-veggies-dNJIr8aBaG7zXmZM4gMfFk0L3FZgXI.png",
  "Greek Yogurt with Berries":
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/yogurt-berries-RK4KEoA4nLCIRzrNRPEz3WiZb7k9Lz.png",

  // Alternative names
  Oatmeal: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/oatmeal-4hWIkUO0h1hADvHpaMvfzN0k2RCtaa.png",
  "Chicken Salad":
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/chicken%20salad-lVhbZxZh2e5xxaLMdshXfWQzGxHgCe.png",
  Salmon: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/salmon-veggies-dNJIr8aBaG7zXmZM4gMfFk0L3FZgXI.png",
  Yogurt: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/yogurt-berries-RK4KEoA4nLCIRzrNRPEz3WiZb7k9Lz.png",
}

/**
 * Get the image URL for a meal
 * @param mealName - The name of the meal
 * @returns The direct blob URL or a placeholder if not found
 */
export function getMealImage(mealName: string): string {
  console.log("[v0] Getting meal image for:", mealName)

  const imageUrl = mealImageMapping[mealName]

  if (!imageUrl) {
    // Return placeholder with query for unknown meals
    const placeholderUrl = `/placeholder.svg?height=100&width=150&query=${encodeURIComponent(mealName + " healthy meal")}`
    console.log("[v0] No meal image found, using placeholder:", placeholderUrl)
    return placeholderUrl
  }

  console.log("[v0] Loading meal image:", imageUrl)
  return imageUrl
}

/**
 * Check if a meal has a real image available
 * @param mealName - The name of the meal
 * @returns true if the meal has a real image
 */
export function hasMealImage(mealName: string): boolean {
  return mealName in mealImageMapping
}
