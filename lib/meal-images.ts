// Meal name to high-quality Unsplash image URLs
// Using optimized Unsplash URLs for performance (w=400 for thumbnails)

const mealImageMapping: Record<string, string> = {
  // Breakfast items
  "Protein Oatmeal Bowl":
    "https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=400&h=300&fit=crop&auto=format",
  "Scrambled Eggs with Spinach":
    "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400&h=300&fit=crop&auto=format",
  "Greek Yogurt Parfait":
    "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=300&fit=crop&auto=format",
  "Protein Smoothie Bowl":
    "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400&h=300&fit=crop&auto=format",
  "Avocado Toast with Eggs":
    "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=400&h=300&fit=crop&auto=format",
  "Chia Pudding with Berries":
    "https://images.unsplash.com/photo-1546039907-7fa05f864c02?w=400&h=300&fit=crop&auto=format",
  Oatmeal:
    "https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=400&h=300&fit=crop&auto=format",

  // Lunch items
  "Grilled Chicken Salad":
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop&auto=format",
  "Turkey and Quinoa Bowl":
    "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop&auto=format",
  "Tuna Salad Wrap":
    "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&h=300&fit=crop&auto=format",
  "Chicken Buddha Bowl":
    "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=300&fit=crop&auto=format",
  "Lentil Power Salad":
    "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=400&h=300&fit=crop&auto=format",
  "Shrimp and Veggie Stir-fry":
    "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop&auto=format",
  "Chicken Salad":
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop&auto=format",

  // Dinner items
  "Salmon with Vegetables":
    "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop&auto=format",
  "Grilled Chicken with Sweet Potato":
    "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=400&h=300&fit=crop&auto=format",
  "Turkey Meatballs with Zucchini":
    "https://images.unsplash.com/photo-1529042410759-befb1204b468?w=400&h=300&fit=crop&auto=format",
  "Baked Cod with Asparagus":
    "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&h=300&fit=crop&auto=format",
  "Lean Beef Stir-fry":
    "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=400&h=300&fit=crop&auto=format",
  "Tofu and Vegetable Curry":
    "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=400&h=300&fit=crop&auto=format",
  Salmon:
    "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop&auto=format",

  // Snack items
  "Greek Yogurt with Berries":
    "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=300&fit=crop&auto=format",
  "Apple with Almond Butter":
    "https://images.unsplash.com/photo-1568702846914-96b305d2uj1b?w=400&h=300&fit=crop&auto=format",
  "Protein Shake":
    "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=400&h=300&fit=crop&auto=format",
  "Mixed Nuts and Berries":
    "https://images.unsplash.com/photo-1478145046317-39f10e56b5e9?w=400&h=300&fit=crop&auto=format",
  "Cottage Cheese with Fruit":
    "https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=400&h=300&fit=crop&auto=format",
  "Hard-boiled Eggs":
    "https://images.unsplash.com/photo-1482049016gy-2d3f66f9ef75?w=400&h=300&fit=crop&auto=format",
  Yogurt:
    "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=300&fit=crop&auto=format",
}

// Fallback images by meal type for unknown meals
const mealTypeFallbacks: Record<string, string> = {
  breakfast:
    "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=400&h=300&fit=crop&auto=format",
  lunch:
    "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop&auto=format",
  dinner:
    "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=400&h=300&fit=crop&auto=format",
  snack:
    "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=400&h=300&fit=crop&auto=format",
  default:
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop&auto=format",
}

/**
 * Get the image URL for a meal
 * @param mealName - The name of the meal
 * @param mealType - Optional meal type for better fallback
 * @returns The image URL
 */
export function getMealImage(mealName: string, mealType?: string): string {
  // Try exact match first
  const imageUrl = mealImageMapping[mealName]
  if (imageUrl) {
    return imageUrl
  }

  // Try partial match
  const partialMatch = Object.keys(mealImageMapping).find(
    (key) =>
      key.toLowerCase().includes(mealName.toLowerCase()) ||
      mealName.toLowerCase().includes(key.toLowerCase())
  )
  if (partialMatch) {
    return mealImageMapping[partialMatch]
  }

  // Return type-based fallback or default
  if (mealType) {
    return mealTypeFallbacks[mealType.toLowerCase()] || mealTypeFallbacks.default
  }

  return mealTypeFallbacks.default
}

/**
 * Check if a meal has a specific image available
 * @param mealName - The name of the meal
 * @returns true if the meal has a specific image
 */
export function hasMealImage(mealName: string): boolean {
  return mealName in mealImageMapping
}
