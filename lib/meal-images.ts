// Dynamic meal image generation using Unsplash
// Uses Unsplash Source API for keyword-based image search

// High-quality curated images for specific meals (exact matches)
const curatedMealImages: Record<string, string> = {
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

  // Lunch items
  "Grilled Chicken Salad":
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop&auto=format",
  "Turkey and Quinoa Bowl":
    "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop&auto=format",
  "Tuna Salad Wrap":
    "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&h=300&fit=crop&auto=format",
  "Chicken Buddha Bowl":
    "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=300&fit=crop&auto=format",

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

  // Snack items
  "Greek Yogurt with Berries":
    "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=300&fit=crop&auto=format",
  "Protein Shake":
    "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=400&h=300&fit=crop&auto=format",
  "Mixed Nuts and Berries":
    "https://images.unsplash.com/photo-1478145046317-39f10e56b5e9?w=400&h=300&fit=crop&auto=format",
}

// Food keyword to Unsplash photo ID mapping (curated high-quality photos)
const foodKeywordImages: Record<string, string> = {
  // Proteins
  chicken: "photo-1598515214211-89d3c73ae83b",
  salmon: "photo-1467003909585-2f8a72700288",
  fish: "photo-1519708227418-c8fd9a32b7a2",
  tuna: "photo-1626700051175-6818013e1d4f",
  beef: "photo-1603360946369-dc9bb6258143",
  steak: "photo-1600891964092-4316c288032e",
  turkey: "photo-1574653853027-5382a3d23a15",
  shrimp: "photo-1603133872878-684f208fb84b",
  prawns: "photo-1603133872878-684f208fb84b",
  cod: "photo-1519708227418-c8fd9a32b7a2",
  tilapia: "photo-1519708227418-c8fd9a32b7a2",
  pork: "photo-1432139555190-58524dae6a55",
  lamb: "photo-1514516345957-556ca7d90a29",
  tofu: "photo-1546069901-d5bfd2cbfb1f",
  tempeh: "photo-1546069901-d5bfd2cbfb1f",
  eggs: "photo-1525351484163-7529414344d8",
  egg: "photo-1525351484163-7529414344d8",
  
  // Carbs & Grains
  oatmeal: "photo-1517673400267-0251440c45dc",
  oats: "photo-1517673400267-0251440c45dc",
  quinoa: "photo-1512621776951-a57141f2eefd",
  rice: "photo-1603133872878-684f208fb84b",
  pasta: "photo-1551183053-bf91a1d81141",
  noodles: "photo-1569718212165-3a8278d5f624",
  bread: "photo-1509440159596-0249088772ff",
  toast: "photo-1541519227354-08fa5d50c44d",
  wrap: "photo-1626700051175-6818013e1d4f",
  burrito: "photo-1626700051175-6818013e1d4f",
  pancakes: "photo-1567620905732-2d1ec7ab7445",
  waffles: "photo-1562376552-0d160a2f238d",
  
  // Vegetables
  salad: "photo-1546069901-ba9599a7e63c",
  vegetables: "photo-1512621776951-a57141f2eefd",
  veggies: "photo-1512621776951-a57141f2eefd",
  broccoli: "photo-1459411552884-841db9b3cc2a",
  spinach: "photo-1576045057995-568f588f82fb",
  kale: "photo-1576045057995-568f588f82fb",
  asparagus: "photo-1519708227418-c8fd9a32b7a2",
  zucchini: "photo-1529042410759-befb1204b468",
  avocado: "photo-1541519227354-08fa5d50c44d",
  sweet_potato: "photo-1598515214211-89d3c73ae83b",
  potato: "photo-1518977676601-b53f82ber9a5",
  
  // Fruits
  berries: "photo-1488477181946-6428a0291777",
  berry: "photo-1488477181946-6428a0291777",
  banana: "photo-1481349518771-20055b2a7b24",
  apple: "photo-1568702846914-96b305d2uj1b",
  fruit: "photo-1619566636858-adf3ef46400b",
  mango: "photo-1553279768-865429fa0078",
  
  // Dairy & Proteins
  yogurt: "photo-1488477181946-6428a0291777",
  greek_yogurt: "photo-1488477181946-6428a0291777",
  cheese: "photo-1452195100486-9cc805987862",
  cottage_cheese: "photo-1559181567-c3190ca9959b",
  
  // Bowls & Dishes
  bowl: "photo-1540189549336-e6e99c3679fe",
  buddha_bowl: "photo-1540189549336-e6e99c3679fe",
  smoothie: "photo-1590301157890-4810ed352733",
  parfait: "photo-1488477181946-6428a0291777",
  stir_fry: "photo-1603360946369-dc9bb6258143",
  curry: "photo-1455619452474-d2be8b1e70cd",
  soup: "photo-1547592166-23ac45744acd",
  stew: "photo-1547592166-23ac45744acd",
  
  // Snacks
  nuts: "photo-1478145046317-39f10e56b5e9",
  almonds: "photo-1478145046317-39f10e56b5e9",
  protein_shake: "photo-1622597467836-f3285f2131b8",
  shake: "photo-1622597467836-f3285f2131b8",
  chia: "photo-1546039907-7fa05f864c02",
  pudding: "photo-1546039907-7fa05f864c02",
  granola: "photo-1517673400267-0251440c45dc",
  
  // Meal types
  breakfast: "photo-1533089860892-a7c6f0a88666",
  lunch: "photo-1547592166-23ac45744acd",
  dinner: "photo-1476224203421-9ac39bcb3327",
  snack: "photo-1490474418585-ba9bad8fd0ea",
  
  // Cooking methods (as adjectives in meal names)
  grilled: "photo-1598515214211-89d3c73ae83b",
  baked: "photo-1519708227418-c8fd9a32b7a2",
  roasted: "photo-1598515214211-89d3c73ae83b",
  fried: "photo-1603360946369-dc9bb6258143",
  steamed: "photo-1512621776951-a57141f2eefd",
}

// Fallback images by meal type
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
 * Extract food keywords from a meal name
 */
function extractFoodKeywords(mealName: string): string[] {
  const normalized = mealName
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
  
  const words = normalized.split(" ")
  const keywords: string[] = []
  
  // Check each word and common compound words
  for (let i = 0; i < words.length; i++) {
    const word = words[i]
    const nextWord = words[i + 1]
    
    // Check compound words first (e.g., "sweet potato", "greek yogurt")
    if (nextWord) {
      const compound = `${word}_${nextWord}`
      if (compound in foodKeywordImages) {
        keywords.push(compound)
        i++ // Skip next word since we used it
        continue
      }
    }
    
    // Check single word
    if (word in foodKeywordImages) {
      keywords.push(word)
    }
  }
  
  return keywords
}

/**
 * Get the image URL for a meal
 * Uses a smart keyword extraction system to find the most relevant image
 * 
 * @param mealName - The name of the meal
 * @param mealType - Optional meal type for better fallback (breakfast, lunch, dinner, snack)
 * @returns The image URL
 */
export function getMealImage(mealName: string, mealType?: string): string {
  // 1. Try exact match from curated list first
  if (mealName in curatedMealImages) {
    return curatedMealImages[mealName]
  }
  
  // 2. Try partial match from curated list
  const curatedMatch = Object.keys(curatedMealImages).find(
    (key) =>
      key.toLowerCase().includes(mealName.toLowerCase()) ||
      mealName.toLowerCase().includes(key.toLowerCase())
  )
  if (curatedMatch) {
    return curatedMealImages[curatedMatch]
  }
  
  // 3. Extract keywords and find best matching image
  const keywords = extractFoodKeywords(mealName)
  
  if (keywords.length > 0) {
    // Prioritize protein keywords, then main ingredients
    const priorityOrder = [
      "chicken", "salmon", "fish", "beef", "steak", "turkey", "shrimp", 
      "pork", "lamb", "tofu", "eggs", "tuna", "cod"
    ]
    
    // Find the highest priority keyword
    for (const priority of priorityOrder) {
      if (keywords.includes(priority)) {
        const photoId = foodKeywordImages[priority]
        return `https://images.unsplash.com/${photoId}?w=400&h=300&fit=crop&auto=format`
      }
    }
    
    // If no priority match, use the first keyword found
    const photoId = foodKeywordImages[keywords[0]]
    return `https://images.unsplash.com/${photoId}?w=400&h=300&fit=crop&auto=format`
  }
  
  // 4. Return meal type fallback or default
  if (mealType) {
    return mealTypeFallbacks[mealType.toLowerCase()] || mealTypeFallbacks.default
  }
  
  return mealTypeFallbacks.default
}

/**
 * Check if a meal has a specific curated image available
 * @param mealName - The name of the meal
 * @returns true if the meal has a curated image
 */
export function hasMealImage(mealName: string): boolean {
  return mealName in curatedMealImages
}

/**
 * Get a list of all supported food keywords for debugging
 */
export function getSupportedFoodKeywords(): string[] {
  return Object.keys(foodKeywordImages)
}
