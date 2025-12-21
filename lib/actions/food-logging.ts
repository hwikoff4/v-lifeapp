"use server"

import { revalidatePath } from "next/cache"
import { createClient, getAuthUser } from "@/lib/supabase/server"
import { addXP } from "./gamification"

// ============================================================================
// Types
// ============================================================================

export interface FoodLogEntry {
  id: string
  name: string
  description: string | null
  quantity: number
  unit: string
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
  sugar: number
  sodium: number
  mealType: "Breakfast" | "Lunch" | "Dinner" | "Snack"
  loggedDate: string
  loggedAt: string
  originalInput: string | null
  inputType: "text" | "voice" | "image" | "manual"
  imageUrl: string | null
  aiConfidence: number | null
  isEdited: boolean
}

export interface ParsedFood {
  name: string
  quantity: number
  unit: string
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
  sugar: number
  sodium: number
  confidence: number
}

export interface FoodParseResult {
  success: boolean
  foods: ParsedFood[]
  suggestedMealType: string
  totalCalories: number
  totalProtein: number
  totalCarbs: number
  totalFat: number
  error?: string
}

export interface DailyFoodSummary {
  date: string
  totalCalories: number
  totalProtein: number
  totalCarbs: number
  totalFat: number
  entries: FoodLogEntry[]
  mealBreakdown: {
    Breakfast: number
    Lunch: number
    Dinner: number
    Snack: number
  }
}

// ============================================================================
// AI Food Parsing
// ============================================================================

export async function parseFood(
  input: string,
  inputType: "text" | "voice" | "image" = "text",
  imageData?: string,
  mealTypeOverride?: string,
  dateOverride?: string
): Promise<FoodParseResult> {
  console.log("[FoodLogging] parseFood called with input:", input?.substring(0, 50))
  
  const { user, error: authError } = await getAuthUser()
  console.log("[FoodLogging] Auth check:", { hasUser: !!user, authError })
  
  if (authError || !user) {
    console.error("[FoodLogging] Auth failed:", authError)
    return { 
      success: false, 
      foods: [], 
      suggestedMealType: "Snack",
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0,
      error: "Not authenticated" 
    }
  }

  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    console.log("[FoodLogging] Session check:", { hasSession: !!session, hasToken: !!session?.access_token })
    
    if (!session?.access_token) {
      console.error("[FoodLogging] No session token")
      return { 
        success: false, 
        foods: [], 
        suggestedMealType: "Snack",
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
        error: "No auth session" 
      }
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    console.log("[FoodLogging] Supabase URL configured:", !!supabaseUrl)
    
    if (!supabaseUrl) {
      console.error("[FoodLogging] Missing NEXT_PUBLIC_SUPABASE_URL")
      return { 
        success: false, 
        foods: [], 
        suggestedMealType: "Snack",
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
        error: "Supabase URL not configured" 
      }
    }
    
    console.log("[FoodLogging] Making fetch request to:", `${supabaseUrl}/functions/v1/ai-food-parser`)

    const response = await fetch(`${supabaseUrl}/functions/v1/ai-food-parser`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input,
        inputType,
        imageData,
        mealTypeOverride,
        dateOverride,
        timeHint: new Date().getHours(),
      }),
    })

    // Read response body once
    const responseText = await response.text()
    console.log("[FoodLogging] Response status:", response.status, "Raw response:", responseText.substring(0, 500))

    if (!response.ok) {
      console.error("[FoodLogging] Edge function error:", response.status, responseText)
      let errorMessage = "Failed to parse food"
      try {
        const errorData = JSON.parse(responseText)
        errorMessage = errorData.error || errorData.details || errorMessage
      } catch {
        // If we can't parse error, use default message
      }
      return { 
        success: false, 
        foods: [], 
        suggestedMealType: "Snack",
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
        error: errorMessage
      }
    }

    let result: any
    try {
      result = JSON.parse(responseText)
    } catch (parseError) {
      console.error("[FoodLogging] JSON parse error:", parseError, "Response text:", responseText)
      return {
        success: false,
        foods: [],
        suggestedMealType: "Snack",
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
        error: "Invalid response format from server"
      }
    }
    
    console.log("[FoodLogging] Parse result:", JSON.stringify({
      success: result.success,
      foodsCount: result.foods?.length || 0,
      error: result.error,
      hasFoods: !!result.foods,
      resultKeys: Object.keys(result || {})
    }, null, 2))
    
    // Log the full error if present
    if (result.error) {
      console.error("[FoodLogging] ERROR from edge function:", result.error)
    }
    
    // Validate response structure
    if (!result || typeof result !== 'object') {
      console.error("[FoodLogging] Invalid response structure:", result)
      return {
        success: false,
        foods: [],
        suggestedMealType: "Snack",
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
        error: "Invalid response from server"
      }
    }
    
    // Check if response indicates failure even with 200 status
    if (result.success === false || result.error) {
      const errorDetails = result.details || result.error || "Failed to parse food"
      console.error("[FoodLogging] API returned error:", {
        success: result.success,
        error: result.error,
        details: result.details,
        fullResult: result
      })
      return {
        success: false,
        foods: [],
        suggestedMealType: result.suggestedMealType || "Snack",
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
        error: errorDetails
      }
    }
    
    // Ensure foods array exists and is valid
    if (!Array.isArray(result.foods)) {
      console.error("[FoodLogging] Foods is not an array:", result.foods)
      return {
        success: false,
        foods: [],
        suggestedMealType: result.suggestedMealType || "Snack",
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
        error: "Invalid foods data in response"
      }
    }
    
    return result as FoodParseResult

  } catch (error) {
    console.error("[FoodLogging] Parse error:", error)
    return { 
      success: false, 
      foods: [], 
      suggestedMealType: "Snack",
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0,
      error: error instanceof Error ? error.message : "Unknown error" 
    }
  }
}

// ============================================================================
// Food Log CRUD Operations
// ============================================================================

export async function logFood(
  foods: ParsedFood[],
  mealType: "Breakfast" | "Lunch" | "Dinner" | "Snack",
  originalInput: string,
  inputType: "text" | "voice" | "image" | "manual" = "text",
  loggedDate?: string,
  imageUrl?: string
): Promise<{ success: boolean; entries?: FoodLogEntry[]; error?: string }> {
  const { user, error: authError } = await getAuthUser()
  if (authError || !user) {
    return { success: false, error: "Not authenticated" }
  }

  try {
    const supabase = await createClient()
    const targetDate = loggedDate || new Date().toISOString().split("T")[0]

    const rows = foods.map((food) => ({
      user_id: user.id,
      name: food.name,
      description: null,
      quantity: food.quantity,
      unit: food.unit,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      fiber: food.fiber,
      sugar: food.sugar,
      sodium: food.sodium,
      meal_type: mealType,
      logged_date: targetDate,
      original_input: originalInput,
      input_type: inputType,
      image_url: imageUrl || null,
      ai_confidence: food.confidence,
      ai_parsed_data: food,
    }))

    const { data, error } = await supabase
      .from("food_logs")
      .insert(rows)
      .select()

    if (error) {
      console.error("[FoodLogging] Insert error:", error)
      return { success: false, error: error.message }
    }

    // Award XP for logging food (using meal_logged event which gives 10 XP)
    const totalCalories = foods.reduce((sum, f) => sum + f.calories, 0)
    // Award XP for each food item logged
    for (const entry of data || []) {
      await addXP("meal_logged", entry.id, "food_log", undefined, {
        calories: entry.calories,
        mealType,
        foodName: entry.name,
      })
    }

    // Check for achievements
    await checkFoodLoggingAchievements(user.id, supabase)

    revalidatePath("/nutrition")
    
    // Transform to FoodLogEntry format
    const entries: FoodLogEntry[] = (data || []).map(transformToFoodLogEntry)
    
    return { success: true, entries }

  } catch (error) {
    console.error("[FoodLogging] Log error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function updateFoodLog(
  logId: string,
  updates: Partial<{
    name: string
    quantity: number
    unit: string
    calories: number
    protein: number
    carbs: number
    fat: number
    fiber: number
    sugar: number
    sodium: number
    mealType: "Breakfast" | "Lunch" | "Dinner" | "Snack"
    loggedDate: string
  }>
): Promise<{ success: boolean; entry?: FoodLogEntry; error?: string }> {
  const { user, error: authError } = await getAuthUser()
  if (authError || !user) {
    return { success: false, error: "Not authenticated" }
  }

  try {
    const supabase = await createClient()

    const dbUpdates: Record<string, unknown> = {
      is_edited: true,
      edited_at: new Date().toISOString(),
    }

    if (updates.name !== undefined) dbUpdates.name = updates.name
    if (updates.quantity !== undefined) dbUpdates.quantity = updates.quantity
    if (updates.unit !== undefined) dbUpdates.unit = updates.unit
    if (updates.calories !== undefined) dbUpdates.calories = updates.calories
    if (updates.protein !== undefined) dbUpdates.protein = updates.protein
    if (updates.carbs !== undefined) dbUpdates.carbs = updates.carbs
    if (updates.fat !== undefined) dbUpdates.fat = updates.fat
    if (updates.fiber !== undefined) dbUpdates.fiber = updates.fiber
    if (updates.sugar !== undefined) dbUpdates.sugar = updates.sugar
    if (updates.sodium !== undefined) dbUpdates.sodium = updates.sodium
    if (updates.mealType !== undefined) dbUpdates.meal_type = updates.mealType
    if (updates.loggedDate !== undefined) dbUpdates.logged_date = updates.loggedDate

    const { data, error } = await supabase
      .from("food_logs")
      .update(dbUpdates)
      .eq("id", logId)
      .eq("user_id", user.id)
      .select()
      .single()

    if (error) {
      console.error("[FoodLogging] Update error:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/nutrition")
    
    return { success: true, entry: transformToFoodLogEntry(data) }

  } catch (error) {
    console.error("[FoodLogging] Update error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function deleteFoodLog(logId: string): Promise<{ success: boolean; error?: string }> {
  const { user, error: authError } = await getAuthUser()
  if (authError || !user) {
    return { success: false, error: "Not authenticated" }
  }

  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from("food_logs")
      .delete()
      .eq("id", logId)
      .eq("user_id", user.id)

    if (error) {
      console.error("[FoodLogging] Delete error:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/nutrition")
    return { success: true }

  } catch (error) {
    console.error("[FoodLogging] Delete error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

// ============================================================================
// Query Functions
// ============================================================================

export async function getFoodLogsForDate(date: string): Promise<{ 
  logs: FoodLogEntry[]; 
  summary: DailyFoodSummary | null; 
  error?: string 
}> {
  const { user, error: authError } = await getAuthUser()
  if (authError || !user) {
    return { logs: [], summary: null, error: "Not authenticated" }
  }

  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("food_logs")
      .select("*")
      .eq("user_id", user.id)
      .eq("logged_date", date)
      .order("logged_at", { ascending: true })

    if (error) {
      console.error("[FoodLogging] Query error:", error)
      return { logs: [], summary: null, error: error.message }
    }

    const logs = (data || []).map(transformToFoodLogEntry)
    const summary = buildDailySummary(date, logs)

    return { logs, summary }

  } catch (error) {
    console.error("[FoodLogging] Query error:", error)
    return { logs: [], summary: null, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function getFoodLogHistory(
  startDate: string,
  endDate: string
): Promise<{ entries: FoodLogEntry[]; summaries: DailyFoodSummary[]; error?: string }> {
  const { user, error: authError } = await getAuthUser()
  if (authError || !user) {
    return { entries: [], summaries: [], error: "Not authenticated" }
  }

  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("food_logs")
      .select("*")
      .eq("user_id", user.id)
      .gte("logged_date", startDate)
      .lte("logged_date", endDate)
      .order("logged_date", { ascending: false })
      .order("logged_at", { ascending: true })

    if (error) {
      console.error("[FoodLogging] History error:", error)
      return { entries: [], summaries: [], error: error.message }
    }

    const entries = (data || []).map(transformToFoodLogEntry)
    
    // Group by date and build summaries
    const dateGroups = new Map<string, FoodLogEntry[]>()
    for (const entry of entries) {
      const existing = dateGroups.get(entry.loggedDate) || []
      existing.push(entry)
      dateGroups.set(entry.loggedDate, existing)
    }

    const summaries = Array.from(dateGroups.entries()).map(([date, logs]) => 
      buildDailySummary(date, logs)
    )

    return { entries, summaries }

  } catch (error) {
    console.error("[FoodLogging] History error:", error)
    return { entries: [], summaries: [], error: error instanceof Error ? error.message : "Unknown error" }
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

function transformToFoodLogEntry(row: Record<string, unknown>): FoodLogEntry {
  return {
    id: row.id as string,
    name: row.name as string,
    description: row.description as string | null,
    quantity: Number(row.quantity) || 1,
    unit: (row.unit as string) || "serving",
    calories: Number(row.calories) || 0,
    protein: Number(row.protein) || 0,
    carbs: Number(row.carbs) || 0,
    fat: Number(row.fat) || 0,
    fiber: Number(row.fiber) || 0,
    sugar: Number(row.sugar) || 0,
    sodium: Number(row.sodium) || 0,
    mealType: row.meal_type as FoodLogEntry["mealType"],
    loggedDate: row.logged_date as string,
    loggedAt: row.logged_at as string,
    originalInput: row.original_input as string | null,
    inputType: (row.input_type as FoodLogEntry["inputType"]) || "text",
    imageUrl: row.image_url as string | null,
    aiConfidence: row.ai_confidence ? Number(row.ai_confidence) : null,
    isEdited: Boolean(row.is_edited),
  }
}

function buildDailySummary(date: string, logs: FoodLogEntry[]): DailyFoodSummary {
  const mealBreakdown = {
    Breakfast: 0,
    Lunch: 0,
    Dinner: 0,
    Snack: 0,
  }

  let totalCalories = 0
  let totalProtein = 0
  let totalCarbs = 0
  let totalFat = 0

  for (const log of logs) {
    totalCalories += log.calories
    totalProtein += log.protein
    totalCarbs += log.carbs
    totalFat += log.fat
    mealBreakdown[log.mealType] += log.calories
  }

  return {
    date,
    totalCalories,
    totalProtein: Math.round(totalProtein * 10) / 10,
    totalCarbs: Math.round(totalCarbs * 10) / 10,
    totalFat: Math.round(totalFat * 10) / 10,
    entries: logs,
    mealBreakdown,
  }
}

async function checkFoodLoggingAchievements(
  userId: string,
  supabase: Awaited<ReturnType<typeof createClient>>
) {
  try {
    // Get total food log count
    const { count: totalLogs } = await supabase
      .from("food_logs")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)

    // Get today's log count
    const today = new Date().toISOString().split("T")[0]
    const { data: todayLogs } = await supabase
      .from("food_logs")
      .select("meal_type")
      .eq("user_id", userId)
      .eq("logged_date", today)

    // Check achievements
    const { unlockAchievement } = await import("./gamification")

    // First food log
    if (totalLogs && totalLogs >= 1) {
      await unlockAchievement("first_food_log")
    }

    // 50 food logs
    if (totalLogs && totalLogs >= 50) {
      await unlockAchievement("food_log_50")
    }

    // Full day tracker (all 4 meals in one day)
    if (todayLogs) {
      const mealTypes = new Set(todayLogs.map(l => l.meal_type))
      if (mealTypes.size >= 4) {
        await unlockAchievement("daily_log_complete")
      }
    }

    // Check streak achievements
    const { data: streakData } = await supabase.rpc("get_food_log_streak", { p_user_id: userId })
    const streak = streakData || 0

    if (streak >= 3) {
      await unlockAchievement("food_log_streak_3")
    }
    if (streak >= 7) {
      await unlockAchievement("food_log_streak_7")
    }

  } catch (error) {
    console.error("[FoodLogging] Achievement check error:", error)
    // Don't fail the main operation for achievement errors
  }
}
