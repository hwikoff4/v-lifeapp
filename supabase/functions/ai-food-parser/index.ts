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

interface FoodParseRequest {
  input: string // Natural language input (e.g., "I had 2 eggs and toast for breakfast")
  inputType: "text" | "voice" | "image"
  imageData?: string // Base64 encoded image for image parsing
  mealTypeOverride?: string // User can override the auto-detected meal type
  dateOverride?: string // ISO date for past/future entries
  timeHint?: number // Hour of day (0-23) to help determine meal type
}

interface ParsedFoodItem {
  name: string
  quantity: number
  unit: string
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
  sugar: number
  sodium: number // mg
  confidence: number // 0-1
}

interface FoodParseResponse {
  success: boolean
  foods: ParsedFoodItem[]
  suggestedMealType: string
  totalCalories: number
  totalProtein: number
  totalCarbs: number
  totalFat: number
  rawResponse?: string
}

// ============================================================================
// Meal Type Detection
// ============================================================================

function detectMealTypeFromTime(hour: number): string {
  if (hour >= 5 && hour < 11) return "Breakfast"
  if (hour >= 11 && hour < 15) return "Lunch"
  if (hour >= 15 && hour < 18) return "Snack"
  if (hour >= 18 && hour < 22) return "Dinner"
  return "Snack" // Late night
}

function detectMealTypeFromText(input: string): string | null {
  const lowerInput = input.toLowerCase()
  
  // Check for explicit meal mentions
  if (lowerInput.includes("breakfast") || lowerInput.includes("morning")) return "Breakfast"
  if (lowerInput.includes("lunch") || lowerInput.includes("midday")) return "Lunch"
  if (lowerInput.includes("dinner") || lowerInput.includes("supper") || lowerInput.includes("evening meal")) return "Dinner"
  if (lowerInput.includes("snack") || lowerInput.includes("snacking")) return "Snack"
  
  // Check for time-based hints
  if (lowerInput.includes("for breakfast")) return "Breakfast"
  if (lowerInput.includes("for lunch")) return "Lunch"
  if (lowerInput.includes("for dinner")) return "Dinner"
  
  return null
}

// ============================================================================
// AI Food Parsing
// ============================================================================

async function parseFood(
  input: string,
  openaiApiKey: string,
  imageData?: string
): Promise<{ foods: ParsedFoodItem[]; rawResponse: string }> {
  const systemPrompt = `You are a nutrition expert AI that analyzes food descriptions and provides accurate nutritional estimates.

You MUST respond with ONLY a valid JSON array of food items, no other text.

For each food item, estimate:
- Reasonable portion sizes based on context
- Accurate calorie counts based on USDA/standard nutrition data
- Macronutrients (protein, carbs, fat) in grams
- Fiber, sugar in grams
- Sodium in milligrams

Be smart about:
- Inferring cooking methods (fried, grilled, baked)
- Standard serving sizes when not specified
- Combined dishes (sandwich includes bread, filling, etc.)
- Restaurant portions vs home-cooked`

  const userPrompt = imageData
    ? `Analyze this food image and identify all food items visible. For each item, estimate nutritional content.

Respond with ONLY a JSON array where each object has:
{
  "name": "Food item name",
  "quantity": number (e.g., 1, 2, 0.5),
  "unit": "serving" | "piece" | "cup" | "oz" | "g" | "slice" | etc.,
  "calories": number,
  "protein": number (grams),
  "carbs": number (grams),
  "fat": number (grams),
  "fiber": number (grams),
  "sugar": number (grams),
  "sodium": number (milligrams),
  "confidence": number (0-1, your confidence in this estimate)
}`
    : `Parse this food description and extract all food items with nutritional estimates:

"${input}"

Respond with ONLY a JSON array where each object has:
{
  "name": "Food item name",
  "quantity": number (e.g., 1, 2, 0.5),
  "unit": "serving" | "piece" | "cup" | "oz" | "g" | "slice" | etc.,
  "calories": number,
  "protein": number (grams),
  "carbs": number (grams),
  "fat": number (grams),
  "fiber": number (grams),
  "sugar": number (grams),
  "sodium": number (milligrams),
  "confidence": number (0-1, your confidence in this estimate)
}

Important:
- Parse ALL food items mentioned
- Use context clues for portion sizes
- If quantity is vague ("some", "a little"), estimate reasonably
- Include cooking method in name if relevant (e.g., "Fried egg" vs "Boiled egg")
- For compound foods, you can either break down OR treat as single item`

  const messages: any[] = [
    { role: "system", content: systemPrompt }
  ]

  if (imageData) {
    messages.push({
      role: "user",
      content: [
        { type: "text", text: userPrompt },
        {
          type: "image_url",
          image_url: {
            url: `data:image/jpeg;base64,${imageData}`,
            detail: "high"
          }
        }
      ]
    })
  } else {
    messages.push({ role: "user", content: userPrompt })
  }

  console.log("[AI-Food-Parser] Parsing input:", input?.slice(0, 100) || "image")

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${openaiApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: imageData ? "gpt-4o" : "gpt-4o-mini",
      messages,
      temperature: 0.3, // Lower temperature for more consistent nutrition data
      max_tokens: 2000,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error("[AI-Food-Parser] OpenAI API error:", errorText)
    throw new Error(`OpenAI API error: ${response.status}`)
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content

  if (!content) {
    throw new Error("No content in OpenAI response")
  }

  console.log("[AI-Food-Parser] Raw AI response:", content.slice(0, 500))

  // Extract JSON from response
  const jsonMatch = content.match(/\[[\s\S]*\]/)
  if (!jsonMatch) {
    console.error("[AI-Food-Parser] No JSON array found in response:", content)
    throw new Error("Invalid AI response format")
  }

  const foods = JSON.parse(jsonMatch[0]) as ParsedFoodItem[]

  // Validate and normalize each food item
  const validatedFoods = foods.map((food) => ({
    name: food.name?.trim() || "Unknown food",
    quantity: Math.max(0.1, Number(food.quantity) || 1),
    unit: food.unit || "serving",
    calories: Math.round(Math.max(0, Number(food.calories) || 0)),
    protein: Math.round(Math.max(0, Number(food.protein) || 0) * 10) / 10,
    carbs: Math.round(Math.max(0, Number(food.carbs) || 0) * 10) / 10,
    fat: Math.round(Math.max(0, Number(food.fat) || 0) * 10) / 10,
    fiber: Math.round(Math.max(0, Number(food.fiber) || 0) * 10) / 10,
    sugar: Math.round(Math.max(0, Number(food.sugar) || 0) * 10) / 10,
    sodium: Math.round(Math.max(0, Number(food.sodium) || 0)),
    confidence: Math.min(1, Math.max(0, Number(food.confidence) || 0.7)),
  }))

  console.log("[AI-Food-Parser] Parsed", validatedFoods.length, "food items")
  return { foods: validatedFoods, rawResponse: content }
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

    // Get OpenAI API key
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY")
    if (!openaiApiKey) {
      console.error("[AI-Food-Parser] OPENAI_API_KEY not configured")
      return new Response(
        JSON.stringify({
          success: false,
          foods: [],
          suggestedMealType: "Snack",
          totalCalories: 0,
          totalProtein: 0,
          totalCarbs: 0,
          totalFat: 0,
          error: "AI service not configured - OPENAI_API_KEY missing in Supabase Edge Function secrets"
        }),
        { status: 200, headers: { ...corsHeaders(), "Content-Type": "application/json" } }
      )
    }

    // Parse request
    const request: FoodParseRequest = await req.json()
    const { input, inputType, imageData, mealTypeOverride, timeHint } = request

    if (!input && !imageData) {
      return new Response(
        JSON.stringify({ error: "Input text or image is required" }),
        { status: 400, headers: { ...corsHeaders(), "Content-Type": "application/json" } }
      )
    }

    // Parse food items with AI
    const { foods, rawResponse } = await parseFood(
      input || "",
      openaiApiKey,
      imageData
    )

    // Calculate totals
    const totalCalories = foods.reduce((sum, f) => sum + f.calories, 0)
    const totalProtein = foods.reduce((sum, f) => sum + f.protein, 0)
    const totalCarbs = foods.reduce((sum, f) => sum + f.carbs, 0)
    const totalFat = foods.reduce((sum, f) => sum + f.fat, 0)

    // Determine meal type
    let suggestedMealType = mealTypeOverride || null

    if (!suggestedMealType && input) {
      suggestedMealType = detectMealTypeFromText(input)
    }

    if (!suggestedMealType) {
      const hour = timeHint ?? new Date().getHours()
      suggestedMealType = detectMealTypeFromTime(hour)
    }

    const response: FoodParseResponse = {
      success: true,
      foods,
      suggestedMealType,
      totalCalories,
      totalProtein: Math.round(totalProtein * 10) / 10,
      totalCarbs: Math.round(totalCarbs * 10) / 10,
      totalFat: Math.round(totalFat * 10) / 10,
    }

    console.log("[AI-Food-Parser] Success:", {
      itemCount: foods.length,
      totalCalories,
      mealType: suggestedMealType,
    })

    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { ...corsHeaders(), "Content-Type": "application/json" } }
    )

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    console.error("[AI-Food-Parser] Error:", errorMessage, error)
    return new Response(
      JSON.stringify({
        success: false,
        foods: [],
        suggestedMealType: "Snack",
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
        error: `Failed to parse food: ${errorMessage}`
      }),
      { status: 200, headers: { ...corsHeaders(), "Content-Type": "application/json" } }
    )
  }
})
