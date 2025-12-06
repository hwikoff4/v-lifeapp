import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "jsr:@supabase/supabase-js@2"

const ALLOWED_ORIGIN = Deno.env.get("APP_ORIGIN") || Deno.env.get("NEXT_PUBLIC_APP_URL") || "*"
const corsHeaders = () => ({
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  Vary: "Origin",
})

interface VitalFlowHabitSuggestion {
  title: string
  reason: string
  category: 'movement' | 'nutrition' | 'sleep' | 'mindset' | 'recovery' | 'hydration'
  energy_delta_kcal: number
  time_minutes: number
  tags: string[]
  rank: number
  knowledge_id?: string
}

// Estimate tokens (rough: 1 token ≈ 4 chars for English)
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}

// Generate embedding using OpenAI
async function generateEmbedding(text: string, apiKey: string): Promise<number[]> {
  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "text-embedding-3-small",
      input: text.slice(0, 8000),
    }),
  })
  
  if (!response.ok) {
    console.error("Embedding API error:", await response.text())
    throw new Error("Failed to generate embedding")
  }
  
  const data = await response.json()
  return data.data[0].embedding
}

// Retrieve relevant habit knowledge using RAG
async function retrieveRelevantHabitKnowledge(
  supabase: any,
  queryEmbedding: number[],
  userGoals: string[],
  limit: number = 10
): Promise<any[]> {
  try {
    console.log("[VitalFlow] RAG: Searching for relevant habit knowledge...")
    
    const embeddingString = `[${queryEmbedding.join(',')}]`
    
    const { data, error } = await supabase.rpc('match_vitalflow_habits_knowledge', {
      query_embedding: embeddingString,
      match_threshold: 0.3,
      match_count: limit,
      filter_goal_segments: userGoals.length > 0 ? userGoals : null,
    })
    
    if (error) {
      console.error("[VitalFlow] RAG error:", JSON.stringify(error))
      return []
    }
    
    console.log("[VitalFlow] RAG: Found", data?.length || 0, "relevant habits")
    return data || []
  } catch (err) {
    console.error("[VitalFlow] RAG exception:", err)
    return []
  }
}

// Get user's recent habit adherence data
async function getUserAdherenceData(supabase: any, userId: string): Promise<any> {
  try {
    const { data, error } = await supabase.rpc('get_user_habit_adherence_summary', {
      p_user_id: userId,
      p_days: 30,
    })
    
    if (error) {
      console.error("[VitalFlow] Adherence data error:", error)
      return null
    }
    
    return data?.[0] || null
  } catch (err) {
    console.error("[VitalFlow] Adherence exception:", err)
    return null
  }
}

// Get user's recent data (workouts, meals, sleep, etc.)
async function getUserRecentData(supabase: any, userId: string) {
  const [
    profileResult,
    workoutsResult,
    habitsResult,
    weightResult,
    streaksResult,
    reflectionsResult,
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).single(),
    supabase
      .from("workouts")
      .select("*, workout_exercises(*, exercises(*))")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(7),
    supabase
      .from("habits")
      .select("*, habit_logs(*)")
      .eq("user_id", userId)
      .limit(10),
    supabase
      .from("weight_entries")
      .select("*")
      .eq("user_id", userId)
      .order("logged_at", { ascending: false })
      .limit(5),
    supabase.from("streaks").select("*").eq("user_id", userId),
    supabase
      .from("weekly_reflections")
      .select("*")
      .eq("user_id", userId)
      .order("week_start_date", { ascending: false })
      .limit(4),
  ])

  return {
    profile: profileResult.data,
    workouts: workoutsResult.data || [],
    habits: habitsResult.data || [],
    weightEntries: weightResult.data || [],
    streaks: streaksResult.data || [],
    reflections: reflectionsResult.data || [],
  }
}

// Build context for the AI prompt
function buildUserContext(userData: any, adherenceData: any): string {
  const { profile, workouts, habits, weightEntries, streaks, reflections } = userData
  
  const completedWorkoutsLast7Days = workouts.filter(
    (w: any) => w.completed && new Date(w.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  ).length
  
  const currentWeight = weightEntries[0]?.weight
  const startWeight = weightEntries[weightEntries.length - 1]?.weight
  const weightChange = currentWeight && startWeight ? currentWeight - startWeight : 0

  // Map primary_goal to goal_segments
  const goalMapping: Record<string, string[]> = {
    'lose_weight': ['fat_loss'],
    'build_muscle': ['muscle_gain', 'strength'],
    'get_stronger': ['strength'],
    'improve_endurance': ['endurance'],
    'general_fitness': ['general_wellness'],
  }
  
  const goalSegments = goalMapping[profile?.primary_goal] || ['general_wellness']

  // Build weekly reflections context
  let reflectionsContext = ""
  if (reflections && reflections.length > 0) {
    const latest = reflections[0]
    reflectionsContext = `
WEEKLY CHECK-IN (Latest):
- Fatigue Level: ${latest.fatigue_level || "N/A"}/10 (1=very low, 10=extremely high)
- Enjoyment Level: ${latest.enjoyment_level || "N/A"}/10 (1=not enjoying, 10=loving it)
- Difficulty Level: ${latest.difficulty_level || "N/A"}/10 (1=too easy, 10=too hard)
${latest.notes ? `- Notes: ${latest.notes}` : ''}

INTERPRETATION GUIDELINES:
- High fatigue (7+): Prioritize recovery habits (sleep, mobility, light activity)
- Low enjoyment (≤5): Suggest variety, shorter duration habits, or mindset practices
- High difficulty (8+): Reduce intensity, focus on easier wins
- Low difficulty (≤3): User may be ready for more challenging habits
`
  }

  return `USER PROFILE:
- Name: ${profile?.name || "User"}
- Age: ${profile?.age || "N/A"}
- Gender: ${profile?.gender || "N/A"}
- Primary Goal: ${profile?.primary_goal || "N/A"}
- Current Weight: ${currentWeight || "N/A"} lbs
- Weight Change: ${weightChange > 0 ? "+" : ""}${weightChange.toFixed(1)} lbs
- Activity Level: ${profile?.activity_level || "N/A"}/5
- Gym Access: ${profile?.gym_access || "N/A"}

RECENT ACTIVITY (Last 7 Days):
- Completed Workouts: ${completedWorkoutsLast7Days}
- Active Habits: ${habits.length}

HABIT ADHERENCE (Last 30 Days):
${adherenceData ? `
- Acceptance Rate: ${((adherenceData.acceptance_rate || 0) * 100).toFixed(0)}%
- Completion Rate: ${((adherenceData.completion_rate || 0) * 100).toFixed(0)}%
- Most Accepted Category: ${adherenceData.most_accepted_category || "N/A"}
- Most Skipped Category: ${adherenceData.most_skipped_category || "N/A"}
` : '- No historical data yet'}
${reflectionsContext}
GOAL SEGMENTS: ${goalSegments.join(', ')}`
}

// Generate AI suggestions using OpenAI
async function generateAISuggestions(
  openaiApiKey: string,
  userContext: string,
  relevantKnowledge: any[],
  todayContext: string
): Promise<VitalFlowHabitSuggestion[]> {
  const knowledgeContext = relevantKnowledge.slice(0, 8).map((k, i) => 
    `${i + 1}. "${k.title}" (${k.category}, ${k.time_minutes} min, ~${k.default_energy_delta_kcal} kcal)
   ${k.body.slice(0, 200)}...
   ID: ${k.id}`
  ).join('\n\n')

  const systemPrompt = `You are VitalFlow AI, an intelligent fitness coaching system that suggests personalized daily habits.

Your job is to analyze the user's profile, recent activity, and today's context to suggest 3-5 high-impact habits for today.

RULES:
1. Return ONLY valid JSON, no markdown, no explanation outside the JSON.
2. Suggest 3-5 habits ranked by priority (rank 1 = highest).
3. Each habit must have: title, reason, category, energy_delta_kcal, time_minutes, tags, rank, knowledge_id (optional).
4. Categories: movement, nutrition, sleep, mindset, recovery, hydration.
5. Keep habits realistic and achievable (5-30 minutes each).
6. Total energy expenditure from all habits should not exceed 200 kcal unless user is very active.
7. Prefer habits from the knowledge base when relevant (include knowledge_id).
8. Adapt to user's adherence patterns (avoid categories they often skip).
9. Consider contraindications (don't suggest hard workouts if user shows signs of overtraining).
10. Provide a clear, motivating "reason" for each suggestion.

AVAILABLE KNOWLEDGE BASE:
${knowledgeContext}

Return JSON in this exact format:
{
  "suggestions": [
    {
      "title": "Morning Hydration Ritual (16 oz)",
      "reason": "Starting your day hydrated boosts metabolism and energy.",
      "category": "hydration",
      "energy_delta_kcal": 0,
      "time_minutes": 2,
      "tags": ["water", "morning"],
      "rank": 1,
      "knowledge_id": "uuid-if-from-knowledge-base"
    }
  ]
}`

  const userPrompt = `${userContext}

TODAY'S CONTEXT:
${todayContext}

Based on this information, suggest 3-5 personalized VitalFlow habits for today. Return only valid JSON.`

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
      max_tokens: 1500,
      response_format: { type: "json_object" },
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error("OpenAI API error:", errorText)
    throw new Error(`OpenAI API error: ${response.status}`)
  }

  const data = await response.json()
  const content = data.choices[0].message.content
  
  try {
    const parsed = JSON.parse(content)
    return parsed.suggestions || []
  } catch (parseError) {
    console.error("Failed to parse AI response:", content)
    throw new Error("Invalid AI response format")
  }
}

// Store suggestions in the database
async function storeSuggestions(
  supabase: any,
  userId: string,
  date: string,
  suggestions: VitalFlowHabitSuggestion[]
): Promise<void> {
  // First, delete any existing suggestions for this user+date
  await supabase
    .from('daily_habit_suggestions')
    .delete()
    .eq('user_id', userId)
    .eq('date', date)

  // Insert new suggestions
  const records = suggestions.map(s => ({
    user_id: userId,
    date,
    knowledge_id: s.knowledge_id || null,
    title: s.title,
    reason: s.reason,
    category: s.category,
    source: 'ai',
    energy_delta_kcal: s.energy_delta_kcal,
    time_minutes: s.time_minutes,
    tags: s.tags,
    rank: s.rank,
    status: 'suggested',
  }))

  const { error } = await supabase
    .from('daily_habit_suggestions')
    .insert(records)

  if (error) {
    console.error("Failed to store suggestions:", error)
    throw new Error("Failed to store suggestions")
  }
}

// Log AI call for auditing
async function logAICall(
  supabase: any,
  userId: string,
  functionName: string,
  inputData: any,
  outputData: any,
  tokensUsed: number,
  durationMs: number,
  error: string | null = null
): Promise<void> {
  try {
    await supabase.from('ai_logs').insert({
      user_id: userId,
      function_name: functionName,
      input_data: inputData,
      output_data: outputData,
      model: 'gpt-4o-mini',
      tokens_used: tokensUsed,
      duration_ms: durationMs,
      error,
    })
  } catch (err) {
    console.error("Failed to log AI call:", err)
  }
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders() })
  }

  const startTime = Date.now()

  try {
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY")
    if (!openaiApiKey) {
      throw new Error("OPENAI_API_KEY is not configured")
    }

    // Get authorization header
    const authHeader = req.headers.get("Authorization")
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders(), "Content-Type": "application/json" } }
      )
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    })

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders(), "Content-Type": "application/json" } }
      )
    }

    // Parse request body (optional params)
    let requestBody: any = {}
    try {
      requestBody = await req.json()
    } catch {
      // No body is fine, use defaults
    }

    const targetDate = requestBody.date || new Date().toISOString().split('T')[0]
    const todayContext = requestBody.context || "It's a regular day."
    const regenerate = requestBody.regenerate === true

    console.log(`[VitalFlow] Generating suggestions for user ${user.id} on ${targetDate}`)

    // Check if suggestions already exist for today
    if (!regenerate) {
      const { data: existing } = await supabase
        .from('daily_habit_suggestions')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', targetDate)
        .order('rank', { ascending: true })

      if (existing && existing.length > 0) {
        console.log("[VitalFlow] Returning existing suggestions")
        return new Response(
          JSON.stringify({ 
            success: true, 
            suggestions: existing,
            cached: true,
          }),
          { headers: { ...corsHeaders(), "Content-Type": "application/json" } }
        )
      }
    }

    // Get user data
    const userData = await getUserRecentData(supabase, user.id)
    const adherenceData = await getUserAdherenceData(supabase, user.id)
    
    // Build user context string
    const userContext = buildUserContext(userData, adherenceData)

    // Map user goal to goal segments for RAG
    const goalMapping: Record<string, string[]> = {
      'lose_weight': ['fat_loss'],
      'build_muscle': ['muscle_gain', 'strength'],
      'get_stronger': ['strength'],
      'improve_endurance': ['endurance'],
      'general_fitness': ['general_wellness'],
    }
    const userGoals = goalMapping[userData.profile?.primary_goal] || ['general_wellness']

    // Generate embedding for query
    const queryText = `${userData.profile?.primary_goal || 'general fitness'} ${todayContext}`
    const queryEmbedding = await generateEmbedding(queryText, openaiApiKey)

    // Retrieve relevant knowledge via RAG
    const relevantKnowledge = await retrieveRelevantHabitKnowledge(
      supabase,
      queryEmbedding,
      userGoals,
      10
    )

    // Generate AI suggestions
    const suggestions = await generateAISuggestions(
      openaiApiKey,
      userContext,
      relevantKnowledge,
      todayContext
    )

    console.log(`[VitalFlow] Generated ${suggestions.length} suggestions`)

    // Store suggestions in database
    await storeSuggestions(supabase, user.id, targetDate, suggestions)

    // Log AI call
    const durationMs = Date.now() - startTime
    await logAICall(
      supabase,
      user.id,
      'vitalflow-daily-habits',
      { date: targetDate, context: todayContext },
      { suggestions },
      estimateTokens(userContext) + 1500, // rough estimate
      durationMs
    )

    return new Response(
      JSON.stringify({ 
        success: true, 
        suggestions,
        cached: false,
      }),
      { headers: { ...corsHeaders(), "Content-Type": "application/json" } }
    )
  } catch (error) {
    console.error("[VitalFlow Edge Function Error]", error)
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Internal server error" 
      }),
      { status: 500, headers: { ...corsHeaders(), "Content-Type": "application/json" } }
    )
  }
})

