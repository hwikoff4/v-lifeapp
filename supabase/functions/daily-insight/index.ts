import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "jsr:@supabase/supabase-js@2"

const ALLOWED_ORIGIN = Deno.env.get("APP_ORIGIN") || Deno.env.get("NEXT_PUBLIC_APP_URL") || "*"
const corsHeaders = () => ({
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  Vary: "Origin",
})

interface UserDashboardSnapshot {
  userId: string
  userName: string | null
  progress: number
  habits: Array<{
    id: string
    name: string
    category: string
    frequency: string
    currentStreak: number
    bestStreak: number
    completed: boolean
  }>
  totalHabits: number
  completedToday: number
  avgWeeklyProgress: number
  primaryGoal: string | null
  activityLevel: string | null
}

interface DailyInsightRequest {
  localDate: string
  timezone: string
}

// Generate the local date string in YYYY-MM-DD format
function getTodayInTimezone(timezone: string): string {
  const now = new Date()
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })

  const parts = formatter.formatToParts(now)
  const year = parts.find((p) => p.type === "year")?.value
  const month = parts.find((p) => p.type === "month")?.value
  const day = parts.find((p) => p.type === "day")?.value

  return `${year}-${month}-${day}`
}

// Build user snapshot from database
async function buildUserSnapshot(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  localDate: string
): Promise<UserDashboardSnapshot> {
  // Fetch profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("name, primary_goal, activity_level")
    .eq("id", userId)
    .single()

  // Fetch habits
  const { data: habits } = await supabase
    .from("habits")
    .select("id, name, category, frequency, current_streak, best_streak")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })

  // Fetch today's habit logs
  const { data: logs } = await supabase
    .from("habit_logs")
    .select("habit_id, completed")
    .eq("user_id", userId)
    .eq("logged_at", localDate)

  // Calculate weekly progress
  const sevenDaysAgo = new Date(localDate)
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const startDate = sevenDaysAgo.toISOString().split("T")[0]

  const { data: weeklyLogs } = await supabase
    .from("habit_logs")
    .select("completed")
    .eq("user_id", userId)
    .gte("logged_at", startDate)
    .lte("logged_at", localDate)

  const totalPossible = (habits?.length || 0) * 7
  const completedCount = weeklyLogs?.filter((log) => log.completed).length || 0
  const progress = totalPossible > 0 ? Math.round((completedCount / totalPossible) * 100) : 0

  // Merge habits with completion status
  const habitsWithStatus = (habits || []).map((habit) => {
    const log = logs?.find((l) => l.habit_id === habit.id)
    return {
      id: habit.id,
      name: habit.name,
      category: habit.category,
      frequency: habit.frequency,
      currentStreak: habit.current_streak || 0,
      bestStreak: habit.best_streak || 0,
      completed: log?.completed || false,
    }
  })

  const completedToday = habitsWithStatus.filter((h) => h.completed).length

  return {
    userId,
    userName: profile?.name || null,
    progress,
    habits: habitsWithStatus,
    totalHabits: habitsWithStatus.length,
    completedToday,
    avgWeeklyProgress: progress,
    primaryGoal: profile?.primary_goal || null,
    activityLevel: profile?.activity_level?.toString() || null,
  }
}

// Generate AI insight using OpenAI
async function generateInsight(
  snapshot: UserDashboardSnapshot,
  apiKey: string
): Promise<string> {
  // Short-circuit if no habits
  if (snapshot.totalHabits === 0) {
    return "Start building healthy habits today! Add your first habit to begin your journey."
  }

  // Build context for OpenAI
  const habitsList = snapshot.habits
    .map((h) => `- ${h.name} (${h.category}, streak: ${h.currentStreak})`)
    .join("\n")

  const systemPrompt = `You are a motivational fitness and wellness coach for V-Life, a holistic health app.
Generate a short, personalized daily insight (1-2 sentences max) for the user based on their data.

Guidelines:
- Be motivational, encouraging, and action-oriented
- Reference specific habits or streaks when relevant
- Keep it concise (under 160 characters if possible)
- Don't give medical advice
- Use a friendly, supportive tone
- Vary your message style (motivational, congratulatory, challenging, reflective)

User Data:
- Name: ${snapshot.userName || "there"}
- Progress: ${snapshot.progress}% weekly completion
- Habits completed today: ${snapshot.completedToday}/${snapshot.totalHabits}
- Primary goal: ${snapshot.primaryGoal || "general wellness"}
- Habits:
${habitsList}

Generate ONE short motivational insight for today:`

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: "Generate today's insight:",
        },
      ],
      temperature: 0.8,
      max_tokens: 100,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error("OpenAI API error:", errorText)
    throw new Error("Failed to generate insight")
  }

  const data = await response.json()
  const insight = data.choices?.[0]?.message?.content?.trim()

  if (!insight) {
    throw new Error("No insight generated")
  }

  return insight
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders() })
  }

  try {
    const openaiKey = Deno.env.get("OPENAI_API_KEY")
    if (!openaiKey) {
      throw new Error("OPENAI_API_KEY not configured")
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!

    // Get auth token from request
    const authHeader = req.headers.get("Authorization")
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders(), "Content-Type": "application/json" } }
      )
    }

    // Create Supabase client using anon key and user JWT so RLS stays enforced
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    })

    // Verify user authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders(), "Content-Type": "application/json" } }
      )
    }

    // Parse request body
    const { localDate, timezone } = (await req.json()) as DailyInsightRequest

    // Use provided localDate or calculate from timezone
    const effectiveLocalDate = localDate || getTodayInTimezone(timezone)
    const effectiveTimezone = timezone || "America/New_York"

    // Check if insight already exists for this user and date
    const { data: existingInsight, error: fetchError } = await supabase
      .from("daily_insights")
      .select("insight")
      .eq("user_id", user.id)
      .eq("local_date", effectiveLocalDate)
      .maybeSingle()

    if (fetchError) {
      console.error("Error fetching existing insight:", fetchError)
      throw new Error("Database error")
    }

    // Return existing insight if found
    if (existingInsight) {
      return new Response(
        JSON.stringify({ insight: existingInsight.insight, cached: true }),
        { status: 200, headers: { ...corsHeaders(), "Content-Type": "application/json" } }
      )
    }

    // Build user snapshot
    const snapshot = await buildUserSnapshot(supabase, user.id, effectiveLocalDate)

    // Generate new insight
    const insight = await generateInsight(snapshot, openaiKey)

    // Store insight in database
    const { error: insertError } = await supabase.from("daily_insights").insert({
      user_id: user.id,
      local_date: effectiveLocalDate,
      timezone: effectiveTimezone,
      insight,
      meta: {
        progress: snapshot.progress,
        completedToday: snapshot.completedToday,
        totalHabits: snapshot.totalHabits,
      },
    })

    if (insertError) {
      // Check if it's a unique constraint violation (race condition)
      if (insertError.code === "23505") {
        // Another request already created the insight - fetch it
        const { data: raceInsight } = await supabase
          .from("daily_insights")
          .select("insight")
          .eq("user_id", user.id)
          .eq("local_date", effectiveLocalDate)
          .single()

        if (raceInsight) {
          return new Response(
            JSON.stringify({ insight: raceInsight.insight, cached: true }),
            { status: 200, headers: { ...corsHeaders(), "Content-Type": "application/json" } }
          )
        }
      }

      console.error("Error inserting insight:", insertError)
      throw new Error("Failed to save insight")
    }

    return new Response(
      JSON.stringify({ insight, cached: false }),
      { status: 200, headers: { ...corsHeaders(), "Content-Type": "application/json" } }
    )
  } catch (error) {
    console.error("Error in daily-insight function:", error)

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal server error",
      }),
      { status: 500, headers: { ...corsHeaders(), "Content-Type": "application/json" } }
    )
  }
})

