"use server"

import { revalidatePath } from "next/cache"
import { createClient, getAuthUser } from "@/lib/supabase/server"
import type { Macros, Meal } from "@/lib/types"
import { getMealImage } from "@/lib/meal-images"

const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snack"] as const

type MealType = (typeof MEAL_TYPES)[number]

interface DailyMeal {
  logId: string
  mealId: string
  type: MealType
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  image: string | null
}

const DEFAULT_MEALS: Array<Omit<Meal, "id" | "user_id" | "created_at">> = [
  {
    meal_type: "Breakfast",
    name: "Protein Oatmeal Bowl",
    description: "Rolled oats, whey protein, blueberries, almond butter",
    calories: 420,
    protein: 32,
    carbs: 48,
    fat: 14,
    image_url: null,
    recipe: null,
  },
  {
    meal_type: "Breakfast",
    name: "Greek Yogurt Parfait",
    description: "Greek yogurt with berries and granola",
    calories: 350,
    protein: 28,
    carbs: 42,
    fat: 9,
    image_url: null,
    recipe: null,
  },
  {
    meal_type: "Lunch",
    name: "Grilled Chicken Salad",
    description: "Mixed greens, grilled chicken, quinoa, avocado",
    calories: 550,
    protein: 45,
    carbs: 38,
    fat: 22,
    image_url: null,
    recipe: null,
  },
  {
    meal_type: "Lunch",
    name: "Turkey Quinoa Bowl",
    description: "Lean turkey, quinoa, roasted veggies, tahini",
    calories: 520,
    protein: 40,
    carbs: 50,
    fat: 18,
    image_url: null,
    recipe: null,
  },
  {
    meal_type: "Dinner",
    name: "Salmon with Vegetables",
    description: "Grilled salmon, asparagus, sweet potato mash",
    calories: 620,
    protein: 46,
    carbs: 45,
    fat: 28,
    image_url: null,
    recipe: null,
  },
  {
    meal_type: "Dinner",
    name: "Lean Beef Stir-Fry",
    description: "Sirloin, bell peppers, broccoli, jasmine rice",
    calories: 600,
    protein: 42,
    carbs: 52,
    fat: 20,
    image_url: null,
    recipe: null,
  },
  {
    meal_type: "Snack",
    name: "Greek Yogurt with Berries",
    description: "Non-fat yogurt, mixed berries, chia seeds",
    calories: 180,
    protein: 18,
    carbs: 22,
    fat: 3,
    image_url: null,
    recipe: null,
  },
  {
    meal_type: "Snack",
    name: "Protein Shake",
    description: "Whey protein, almond milk, banana, peanut butter",
    calories: 250,
    protein: 32,
    carbs: 20,
    fat: 8,
    image_url: null,
    recipe: null,
  },
]

async function ensureMealCatalog(userId: string, supabase: Awaited<ReturnType<typeof createClient>>) {
  const { count } = await supabase
    .from("meals")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)

  if (!count || count === 0) {
    const rows = DEFAULT_MEALS.map((meal) => ({
      ...meal,
      user_id: userId,
      image_url: meal.image_url || getMealImage(meal.name),
    }))
    await supabase.from("meals").insert(rows)
  }
}

async function ensureDailyMealLogs(userId: string, supabase: Awaited<ReturnType<typeof createClient>>, dayStart: Date, dayEnd: Date) {
  const { data: logs } = await supabase
    .from("meal_logs")
    .select("id, meal_type")
    .eq("user_id", userId)
    .gte("consumed_at", dayStart.toISOString())
    .lte("consumed_at", dayEnd.toISOString())

  const existingTypes = new Set((logs || []).map((log) => log.meal_type))

  if (existingTypes.size === MEAL_TYPES.length) {
    return
  }

  for (const type of MEAL_TYPES) {
    if (existingTypes.has(type)) continue
    const { data: meal } = await supabase
      .from("meals")
      .select("id")
      .eq("user_id", userId)
      .eq("meal_type", type)
      .limit(1)
      .maybeSingle()

    if (!meal) continue

    await supabase.from("meal_logs").insert({
      user_id: userId,
      meal_id: meal.id,
      meal_type: type,
      consumed_at: dayStart.toISOString(),
    })
  }
}

export async function getDailyMealPlan() {
  const { user, error } = await getAuthUser()
  if (error || !user) {
    return { meals: [] as DailyMeal[], totals: { calories: 0, protein: 0, carbs: 0, fat: 0 } }
  }

  const supabase = await createClient()
  await ensureMealCatalog(user.id, supabase)

  const dayStart = new Date()
  dayStart.setHours(0, 0, 0, 0)
  const dayEnd = new Date(dayStart)
  dayEnd.setHours(23, 59, 59, 999)

  await ensureDailyMealLogs(user.id, supabase, dayStart, dayEnd)

  const { data, error: fetchError } = await supabase
    .from("meal_logs")
    .select(
      `
        id,
        meal_type,
        consumed_at,
        meals:meal_id (
          id,
          name,
          meal_type,
          calories,
          protein,
          carbs,
          fat,
          image_url
        )
      `,
    )
    .eq("user_id", user.id)
    .gte("consumed_at", dayStart.toISOString())
    .lte("consumed_at", dayEnd.toISOString())

  if (fetchError || !data) {
    console.error("[Nutrition] Failed to load meal logs:", fetchError)
    return { meals: [] as DailyMeal[], totals: { calories: 0, protein: 0, carbs: 0, fat: 0 } }
  }

  const meals: DailyMeal[] = data
    .map((log) => {
      if (!log.meals) return null
      return {
        logId: log.id,
        mealId: log.meals.id,
        type: (log.meal_type as MealType) || (log.meals.meal_type as MealType),
        name: log.meals.name,
        calories: Number(log.meals.calories || 0),
        protein: Number(log.meals.protein || 0),
        carbs: Number(log.meals.carbs || 0),
        fat: Number(log.meals.fat || 0),
        image: log.meals.image_url || getMealImage(log.meals.name),
      }
    })
    .filter(Boolean) as DailyMeal[]

  const totals = meals.reduce(
    (acc, meal) => {
      acc.calories += meal.calories
      acc.protein += meal.protein
      acc.carbs += meal.carbs
      acc.fat += meal.fat
      return acc
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  )

  return { meals, totals }
}

export async function swapMeal(logId: string, mealId: string) {
  const { user, error } = await getAuthUser()
  if (error || !user) {
    return { success: false, error: "Not authenticated" }
  }

  const supabase = await createClient()
  const { data: meal } = await supabase
    .from("meals")
    .select("meal_type")
    .eq("id", mealId)
    .eq("user_id", user.id)
    .maybeSingle()

  if (!meal) {
    return { success: false, error: "Meal not found" }
  }

  const { error: updateError } = await supabase
    .from("meal_logs")
    .update({ meal_id: mealId, meal_type: meal.meal_type })
    .eq("id", logId)
    .eq("user_id", user.id)

  if (updateError) {
    console.error("[Nutrition] Failed to swap meal:", updateError)
    return { success: false, error: "Unable to swap meal" }
  }

  revalidatePath("/nutrition")
  return { success: true }
}

export async function getMealAlternatives(mealType: MealType, excludeMealId?: string) {
  const { user, error } = await getAuthUser()
  if (error || !user) {
    return []
  }

  const supabase = await createClient()
  const query = supabase
    .from("meals")
    .select("*")
    .eq("user_id", user.id)
    .eq("meal_type", mealType)
    .order("created_at", { ascending: false })

  if (excludeMealId) {
    query.neq("id", excludeMealId)
  }

  const { data } = await query.limit(5)
  if (!data) return []

  return data.map((meal) => ({
    id: meal.id,
    name: meal.name,
    calories: meal.calories || 0,
    description: meal.description,
  }))
}

export async function getNutritionTargets(): Promise<{ macros: Macros }> {
  const { user, error } = await getAuthUser()
  if (error || !user) {
    return {
      macros: {
        calories: { current: 0, target: 2200 },
        protein: { current: 0, target: 160, unit: "g" },
        carbs: { current: 0, target: 220, unit: "g" },
        fat: { current: 0, target: 70, unit: "g" },
      },
    }
  }

  const supabase = await createClient()
  const { data: profile } = await supabase
    .from("profiles")
    .select("weight, goal_weight, primary_goal")
    .eq("id", user.id)
    .maybeSingle()

  const baseWeight = Number(profile?.weight || 170)
  const goalWeight = Number(profile?.goal_weight || baseWeight)
  const calorieTarget = Math.round((profile?.primary_goal === "lose_weight" ? goalWeight * 11 : goalWeight * 13) || 2200)

  const macros: Macros = {
    calories: { current: 0, target: calorieTarget },
    protein: { current: 0, target: Math.round(baseWeight * 0.9), unit: "g" },
    carbs: { current: 0, target: Math.round((calorieTarget * 0.4) / 4), unit: "g" },
    fat: { current: 0, target: Math.round((calorieTarget * 0.25) / 9), unit: "g" },
  }

  return { macros }
}

export async function getRecommendedSupplements(limit = 3) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("supplements")
    .select("*")
    .order("featured", { ascending: false })
    .limit(limit)

  return data || []
}

export type { DailyMeal }

