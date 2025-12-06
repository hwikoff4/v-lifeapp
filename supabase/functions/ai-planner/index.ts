import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "jsr:@supabase/supabase-js@2"

const ALLOWED_ORIGIN = Deno.env.get("APP_ORIGIN") || Deno.env.get("NEXT_PUBLIC_APP_URL") || "*"
const corsHeaders = () => ({
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  Vary: "Origin",
})

// ============================================================================
// Types
// ============================================================================

interface MealPlanRequest {
  type: "meal-plan"
  profile: {
    weight: number
    height: number
    age: number
    gender: string
    activityLevel: string
    fitnessGoal: string
    dietaryPreferences?: string[]
    restrictions?: string[]
  }
  mealTypes: string[] // e.g., ["Breakfast", "Lunch", "Dinner", "Snack"]
  date: string // ISO date string
}

interface WorkoutPlanRequest {
  type: "workout-plan"
  profile: {
    weight: number
    height: number
    age: number
    gender: string
    activityLevel: string
    fitnessGoal: string
    experienceLevel?: string
    equipment?: string[]
  }
  targetMuscleGroups?: string[]
  duration?: number // minutes
  date: string
}

interface GroceryListRequest {
  type: "grocery-list"
  profile: {
    weight: number
    height: number
    age: number
    gender: string
    activityLevel: string
    fitnessGoal: string
    dietaryPreferences?: string[]
    restrictions?: string[]
  }
  currentMeals: Array<{
    name: string
    ingredients: string[]
    date: string
  }>
  daysToForecast: number // typically 7
}

interface GroceryItem {
  name: string
  quantity: string
  category: string
  forMeals: string[] // which meals this ingredient is for
}

type PlanRequest = MealPlanRequest | WorkoutPlanRequest | GroceryListRequest

interface GeneratedMeal {
  type: string
  name: string
  description: string
  calories: number
  protein: number
  carbs: number
  fat: number
  ingredients?: string[]
  instructions?: string[]
}

interface GeneratedExercise {
  name: string
  sets: number
  reps: string
  restSeconds: number
  muscleGroup: string
  description?: string
}

interface GeneratedWorkout {
  name: string
  description: string
  durationMinutes: number
  exercises: GeneratedExercise[]
  warmup?: string
  cooldown?: string
}

// ============================================================================
// Utility Functions
// ============================================================================

function extractJsonFromResponse(text: string): any {
  // Try to find JSON array or object in the response
  const jsonArrayMatch = text.match(/\[[\s\S]*\]/)
  const jsonObjectMatch = text.match(/\{[\s\S]*\}/)
  
  const jsonStr = jsonArrayMatch?.[0] || jsonObjectMatch?.[0]
  if (!jsonStr) {
    console.error("[AI-Planner] No JSON found in response:", text.slice(0, 500))
    throw new Error("No valid JSON found in AI response")
  }
  
  return JSON.parse(jsonStr)
}

function buildMacroTargets(profile: MealPlanRequest["profile"]): { calories: number; protein: number; carbs: number; fat: number } {
  const { weight, height, age, gender, activityLevel, fitnessGoal } = profile
  
  // BMR calculation (Mifflin-St Jeor)
  let bmr: number
  if (gender?.toLowerCase() === "female") {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5
  }
  
  // Activity multiplier
  const activityMultipliers: Record<string, number> = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
    extra_active: 1.9,
  }
  const multiplier = activityMultipliers[activityLevel] || 1.55
  let tdee = bmr * multiplier
  
  // Goal adjustment
  if (fitnessGoal === "lose_weight") {
    tdee *= 0.8
  } else if (fitnessGoal === "build_muscle") {
    tdee *= 1.1
  }
  
  const calories = Math.round(tdee)
  const protein = Math.round(weight * 2) // 2g per kg
  const fat = Math.round((calories * 0.25) / 9)
  const carbs = Math.round((calories - protein * 4 - fat * 9) / 4)
  
  return { calories, protein, carbs, fat }
}

// ============================================================================
// AI Generation Functions
// ============================================================================

async function generateMealPlan(
  request: MealPlanRequest,
  openaiApiKey: string
): Promise<GeneratedMeal[]> {
  const { profile, mealTypes, date } = request
  const macros = buildMacroTargets(profile)
  
  const dietInfo = profile.dietaryPreferences?.length 
    ? `Dietary preferences: ${profile.dietaryPreferences.join(", ")}.` 
    : ""
  const restrictionsInfo = profile.restrictions?.length
    ? `Restrictions/allergies: ${profile.restrictions.join(", ")}.`
    : ""
  
  const systemPrompt = `You are a professional nutritionist AI that creates personalized meal plans. 
You MUST respond with ONLY a valid JSON array, no other text.
Each meal should be healthy, practical to prepare, and aligned with the user's goals and preferences.`

  const userPrompt = `Create a meal plan for ${date} with the following meals: ${mealTypes.join(", ")}.

User Profile:
- Weight: ${profile.weight}kg
- Height: ${profile.height}cm  
- Age: ${profile.age}
- Gender: ${profile.gender}
- Activity Level: ${profile.activityLevel}
- Fitness Goal: ${profile.fitnessGoal}
${dietInfo}
${restrictionsInfo}

Daily Macro Targets:
- Calories: ${macros.calories} kcal
- Protein: ${macros.protein}g
- Carbs: ${macros.carbs}g
- Fat: ${macros.fat}g

Respond with ONLY a JSON array where each object has:
{
  "type": "Breakfast" | "Lunch" | "Dinner" | "Snack",
  "name": "Meal name",
  "description": "Brief description",
  "calories": number,
  "protein": number (grams),
  "carbs": number (grams),
  "fat": number (grams),
  "ingredients": ["ingredient 1", "ingredient 2", ...],
  "instructions": ["step 1", "step 2", ...]
}

Important:
- Create exactly one meal for each requested type: ${mealTypes.join(", ")}
- Distribute macros sensibly across meals
- Make meals diverse, interesting, and practical
- Include specific ingredient quantities
- Keep instructions concise but clear`

  console.log("[AI-Planner] Generating meal plan for:", mealTypes)
  
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${openaiApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.8,
      max_tokens: 2000,
    }),
  })
  
  if (!response.ok) {
    const errorText = await response.text()
    console.error("[AI-Planner] OpenAI API error:", errorText)
    throw new Error(`OpenAI API error: ${response.status}`)
  }
  
  const data = await response.json()
  const content = data.choices?.[0]?.message?.content
  
  if (!content) {
    throw new Error("No content in OpenAI response")
  }
  
  console.log("[AI-Planner] Raw AI response:", content.slice(0, 500))
  
  const meals = extractJsonFromResponse(content) as GeneratedMeal[]
  
  // Validate and normalize meal types
  const validatedMeals = meals.map((meal) => ({
    ...meal,
    type: normalizeMealType(meal.type),
    calories: Math.round(meal.calories || 0),
    protein: Math.round(meal.protein || 0),
    carbs: Math.round(meal.carbs || 0),
    fat: Math.round(meal.fat || 0),
  }))
  
  console.log("[AI-Planner] Generated", validatedMeals.length, "meals")
  return validatedMeals
}

async function generateWorkoutPlan(
  request: WorkoutPlanRequest,
  openaiApiKey: string
): Promise<GeneratedWorkout> {
  const { profile, targetMuscleGroups, duration, date } = request
  
  const muscleInfo = targetMuscleGroups?.length
    ? `Target muscle groups: ${targetMuscleGroups.join(", ")}.`
    : "Full body workout."
  const durationInfo = duration ? `Target duration: ${duration} minutes.` : "Duration: 45-60 minutes."
  const equipmentInfo = profile.equipment?.length
    ? `Available equipment: ${profile.equipment.join(", ")}.`
    : "Bodyweight exercises only (no equipment)."
  
  const systemPrompt = `You are a professional fitness trainer AI that creates personalized workout plans.
You MUST respond with ONLY a valid JSON object, no other text.
Each workout should be safe, effective, and appropriate for the user's experience level.`

  const userPrompt = `Create a workout plan for ${date}.

User Profile:
- Weight: ${profile.weight}kg
- Height: ${profile.height}cm
- Age: ${profile.age}
- Gender: ${profile.gender}
- Activity Level: ${profile.activityLevel}
- Fitness Goal: ${profile.fitnessGoal}
- Experience Level: ${profile.experienceLevel || "intermediate"}
${muscleInfo}
${durationInfo}
${equipmentInfo}

Respond with ONLY a JSON object:
{
  "name": "Workout name",
  "description": "Brief description of the workout",
  "durationMinutes": number,
  "warmup": "5-minute warmup description",
  "exercises": [
    {
      "name": "Exercise name",
      "sets": number,
      "reps": "8-12" or "30 seconds" for timed exercises,
      "restSeconds": number,
      "muscleGroup": "Primary muscle group",
      "description": "Brief form tip"
    }
  ],
  "cooldown": "5-minute cooldown/stretch description"
}

Important:
- Include 5-8 exercises appropriate for the goal
- Vary the exercises for muscle balance
- Include proper warm-up and cool-down
- Rest periods should match the intensity
- Form tips should prevent common mistakes`

  console.log("[AI-Planner] Generating workout plan for:", targetMuscleGroups || "full body")
  
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${openaiApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.8,
      max_tokens: 2000,
    }),
  })
  
  if (!response.ok) {
    const errorText = await response.text()
    console.error("[AI-Planner] OpenAI API error:", errorText)
    throw new Error(`OpenAI API error: ${response.status}`)
  }
  
  const data = await response.json()
  const content = data.choices?.[0]?.message?.content
  
  if (!content) {
    throw new Error("No content in OpenAI response")
  }
  
  console.log("[AI-Planner] Raw AI response:", content.slice(0, 500))
  
  const workout = extractJsonFromResponse(content) as GeneratedWorkout
  
  console.log("[AI-Planner] Generated workout with", workout.exercises?.length || 0, "exercises")
  return workout
}

function normalizeMealType(type: string): string {
  const normalized = type?.toLowerCase().trim() || ""
  if (normalized.includes("breakfast")) return "Breakfast"
  if (normalized.includes("lunch")) return "Lunch"
  if (normalized.includes("dinner")) return "Dinner"
  if (normalized.includes("snack")) return "Snack"
  return type
}

async function generateGroceryList(
  request: GroceryListRequest,
  openaiApiKey: string
): Promise<GroceryItem[]> {
  const { profile, currentMeals, daysToForecast } = request
  
  const dietInfo = profile.dietaryPreferences?.length 
    ? `Dietary preferences: ${profile.dietaryPreferences.join(", ")}.` 
    : ""
  const restrictionsInfo = profile.restrictions?.length
    ? `Restrictions/allergies: ${profile.restrictions.join(", ")}.`
    : ""
  
  // Build list of current meals and their ingredients
  const mealsContext = currentMeals.length > 0
    ? `Current planned meals:\n${currentMeals.map(m => `- ${m.name} (${m.date}): ${m.ingredients.join(", ")}`).join("\n")}`
    : "No meals currently planned."
  
  const systemPrompt = `You are a smart grocery shopping assistant that creates comprehensive, organized shopping lists.
You MUST respond with ONLY a valid JSON array, no other text.
Consider ingredient overlap, typical package sizes, and practical shopping quantities.`

  const userPrompt = `Create a complete grocery shopping list for a ${daysToForecast}-day meal plan.

User Profile:
- Weight: ${profile.weight}kg
- Fitness Goal: ${profile.fitnessGoal}
${dietInfo}
${restrictionsInfo}

${mealsContext}

Based on the current meals and typical healthy eating patterns aligned with the user's fitness goal, generate a complete grocery list that:
1. Includes all ingredients from the planned meals with appropriate quantities
2. Adds staple items and ingredients for ${daysToForecast - currentMeals.length} additional days of similar healthy meals
3. Consolidates duplicate ingredients with combined quantities
4. Uses practical shopping quantities (e.g., "1 lb" not "0.3 lb")

Respond with ONLY a JSON array where each object has:
{
  "name": "Item name",
  "quantity": "Amount to buy (e.g., '2 lbs', '1 dozen', '16 oz')",
  "category": "Proteins" | "Carbohydrates" | "Vegetables" | "Fruits" | "Dairy" | "Healthy Fats" | "Pantry Items" | "Spices & Seasonings",
  "forMeals": ["Meal 1", "Meal 2"] // which meals this is for, or ["Weekly staple"] for general items
}

Important:
- Group similar items (don't list "chicken breast" and "chicken" separately)
- Use realistic grocery store quantities
- Include cooking essentials (oils, seasonings) if not already in pantry
- Prioritize fresh ingredients for the first few days
- Consider shelf life when suggesting quantities`

  console.log("[AI-Planner] Generating grocery list for", daysToForecast, "days")
  
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${openaiApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 3000,
    }),
  })
  
  if (!response.ok) {
    const errorText = await response.text()
    console.error("[AI-Planner] OpenAI API error:", errorText)
    throw new Error(`OpenAI API error: ${response.status}`)
  }
  
  const data = await response.json()
  const content = data.choices?.[0]?.message?.content
  
  if (!content) {
    throw new Error("No content in OpenAI response")
  }
  
  console.log("[AI-Planner] Raw grocery list response:", content.slice(0, 500))
  
  const items = extractJsonFromResponse(content) as GroceryItem[]
  
  // Validate and normalize categories
  const validCategories = ["Proteins", "Carbohydrates", "Vegetables", "Fruits", "Dairy", "Healthy Fats", "Pantry Items", "Spices & Seasonings"]
  const normalizedItems = items.map((item) => ({
    ...item,
    category: validCategories.includes(item.category) ? item.category : "Pantry Items",
    forMeals: Array.isArray(item.forMeals) ? item.forMeals : ["Weekly staple"],
  }))
  
  console.log("[AI-Planner] Generated", normalizedItems.length, "grocery items")
  return normalizedItems
}

// ============================================================================
// Main Handler
// ============================================================================

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders() })
  }
  
  try {
    // Verify authentication
    const authHeader = req.headers.get("Authorization")
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders(), "Content-Type": "application/json" } }
      )
    }
    
    // Initialize Supabase client to verify user
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    })
    
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        { status: 401, headers: { ...corsHeaders(), "Content-Type": "application/json" } }
      )
    }
    
    // Get OpenAI API key from Supabase secrets
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY")
    if (!openaiApiKey) {
      console.error("[AI-Planner] OPENAI_API_KEY not configured in Supabase secrets")
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 503, headers: { ...corsHeaders(), "Content-Type": "application/json" } }
      )
    }
    
    // Parse request
    const request: PlanRequest = await req.json()
    console.log("[AI-Planner] Request type:", request.type)
    
    let result: any
    
    switch (request.type) {
      case "meal-plan":
        result = await generateMealPlan(request as MealPlanRequest, openaiApiKey)
        break
        
      case "workout-plan":
        result = await generateWorkoutPlan(request as WorkoutPlanRequest, openaiApiKey)
        break
        
      case "grocery-list":
        result = await generateGroceryList(request as GroceryListRequest, openaiApiKey)
        break
        
      default:
        return new Response(
          JSON.stringify({ error: "Invalid request type" }),
          { status: 400, headers: { ...corsHeaders(), "Content-Type": "application/json" } }
        )
    }
    
    return new Response(
      JSON.stringify({ success: true, data: result }),
      { status: 200, headers: { ...corsHeaders(), "Content-Type": "application/json" } }
    )
    
  } catch (error) {
    console.error("[AI-Planner] Error:", error)
    return new Response(
      JSON.stringify({ 
        error: "Failed to generate plan", 
        details: error instanceof Error ? error.message : "Unknown error" 
      }),
      { status: 500, headers: { ...corsHeaders(), "Content-Type": "application/json" } }
    )
  }
})

