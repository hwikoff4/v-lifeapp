import { consumeStream, convertToModelMessages, streamText } from "ai"
import { createClient } from "@/lib/supabase/server"
import { vbotRequestSchema, createErrorResponse } from "@/lib/validations/api"

export const maxDuration = 30

export async function POST(req: Request) {
  try {
    // Parse and validate request body
    const body = await req.json()
    const validationResult = vbotRequestSchema.safeParse(body)
    
    if (!validationResult.success) {
      return Response.json(
        { 
          error: "Invalid request", 
          details: validationResult.error.flatten().fieldErrors 
        },
        { status: 400 }
      )
    }
    
    const { messages } = validationResult.data

    // Get authenticated user
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch all user fitness data in parallel
    const [
      profileResult,
      habitsResult,
      workoutsResult,
      mealsResult,
      weightEntriesResult,
      progressPhotosResult,
      streaksResult,
      supplementsResult,
    ] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase.from("habits").select("*, habit_logs(*)").eq("user_id", user.id),
      supabase
        .from("workouts")
        .select("*, workout_exercises(*, exercises(*))")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("meals")
        .select("*, meal_logs(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("weight_entries")
        .select("*")
        .eq("user_id", user.id)
        .order("logged_at", { ascending: false })
        .limit(10),
      supabase
        .from("progress_photos")
        .select("*")
        .eq("user_id", user.id)
        .order("taken_at", { ascending: false })
        .limit(5),
      supabase.from("streaks").select("*").eq("user_id", user.id),
      supabase
        .from("supplement_logs")
        .select("*, supplements(*)")
        .eq("user_id", user.id)
        .order("logged_at", { ascending: false })
        .limit(10),
    ])

    // Build comprehensive user context
    const profile = profileResult.data
    const habits = habitsResult.data || []
    const workouts = workoutsResult.data || []
    const meals = mealsResult.data || []
    const weightEntries = weightEntriesResult.data || []
    const progressPhotos = progressPhotosResult.data || []
    const streaks = streaksResult.data || []
    const supplements = supplementsResult.data || []

    // Calculate habit completion stats
    const completedHabitsToday = habits.filter((h) =>
      h.habit_logs?.some(
        (log: { completed: boolean; logged_at: string }) => 
          log.completed && new Date(log.logged_at).toDateString() === new Date().toDateString()
      )
    ).length

    // Calculate workout stats
    const completedWorkouts = workouts.filter((w) => w.completed).length
    const totalWorkoutMinutes = workouts.reduce((sum: number, w) => sum + (w.duration_minutes || 0), 0)

    // Calculate nutrition stats
    const totalCalories = meals.reduce((sum: number, m) => sum + (m.calories || 0), 0)
    const totalProtein = meals.reduce((sum: number, m) => sum + (m.protein || 0), 0)

    // Weight progress
    const currentWeight = weightEntries[0]?.weight
    const startWeight = weightEntries[weightEntries.length - 1]?.weight
    const weightChange = currentWeight && startWeight ? currentWeight - startWeight : 0

    // Build system context
    const systemContext = `You are VBot, an intelligent AI fitness coach for V-Life. You have complete access to the user's fitness data and can provide personalized advice, motivation, and insights.

USER PROFILE:
- Name: ${profile?.name || "User"}
- Age: ${profile?.age || "N/A"}
- Gender: ${profile?.gender || "N/A"}
- Height: ${profile?.height_feet || 0}'${profile?.height_inches || 0}"
- Current Weight: ${currentWeight || profile?.weight || "N/A"} lbs
- Goal Weight: ${profile?.goal_weight || "N/A"} lbs
- Weight Change: ${weightChange > 0 ? "+" : ""}${weightChange.toFixed(1)} lbs
- Primary Goal: ${profile?.primary_goal || "N/A"}
- Activity Level: ${profile?.activity_level || "N/A"}/5
- Gym Access: ${profile?.gym_access || "N/A"}
- Selected Gym: ${profile?.selected_gym || "N/A"}
- Allergies: ${profile?.allergies?.join(", ") || "None"}
- Dietary Restrictions: ${profile?.custom_restrictions?.join(", ") || "None"}

HABITS (${habits.length} total):
${habits
  .map(
    (h) =>
      `- ${h.name} (${h.category}, ${h.frequency}) - Current Streak: ${h.current_streak} days, Best: ${h.best_streak} days`
  )
  .join("\n")}
- Completed Today: ${completedHabitsToday}/${habits.length}

WORKOUT HISTORY (Last 10):
${workouts
  .map(
    (w) =>
      `- ${w.name} (${w.workout_type || "General"}) - ${w.completed ? "Completed" : "In Progress"} - ${w.duration_minutes || 0} min - ${w.workout_exercises?.length || 0} exercises`
  )
  .join("\n")}
- Total Completed: ${completedWorkouts}
- Total Minutes: ${totalWorkoutMinutes}

NUTRITION (Last 10 meals):
${meals
  .map(
    (m) =>
      `- ${m.name} (${m.meal_type || "Meal"}) - ${m.calories || 0} cal, ${m.protein || 0}g protein, ${m.carbs || 0}g carbs, ${m.fat || 0}g fat`
  )
  .join("\n")}
- Total Calories Tracked: ${totalCalories}
- Total Protein: ${totalProtein}g

WEIGHT TRACKING (Last 10 entries):
${weightEntries
  .map(
    (w) =>
      `- ${new Date(w.logged_at).toLocaleDateString()}: ${w.weight} lbs ${w.change ? `(${w.change > 0 ? "+" : ""}${w.change} lbs)` : ""}`
  )
  .join("\n")}

PROGRESS PHOTOS: ${progressPhotos.length} photos uploaded

STREAKS:
${streaks
  .map((s) => `- ${s.streak_type}: Current ${s.current_streak} days, Best ${s.best_streak} days`)
  .join("\n")}

SUPPLEMENTS (Last 10 logs):
${supplements
  .map(
    (s) =>
      `- ${s.supplements?.name || "Supplement"} - ${s.taken ? "Taken" : "Missed"} on ${new Date(s.logged_at).toLocaleDateString()}`
  )
  .join("\n")}

Your role is to:
1. Provide personalized fitness and nutrition advice based on their data
2. Motivate and encourage them based on their progress
3. Answer questions about their workouts, meals, habits, and progress
4. Suggest improvements or adjustments to their plan
5. Celebrate their achievements and streaks
6. Be supportive, knowledgeable, and conversational

Always reference specific data points when relevant to show you understand their journey. Be encouraging but honest. Keep responses concise and actionable.`

    // Convert messages to the format expected by AI SDK
    const formattedMessages = messages.map((msg, idx) => ({
      id: `msg-${idx}`,
      role: msg.role as 'user' | 'assistant' | 'system',
      parts: [{ type: 'text' as const, text: msg.content }],
    }))

    const prompt = convertToModelMessages([
      {
        id: "system",
        role: "system" as const,
        parts: [{ type: "text" as const, text: systemContext }],
      },
      ...formattedMessages,
    ])

    const result = streamText({
      model: "gpt-4o-mini-2024-07-18",
      prompt,
      abortSignal: req.signal,
      maxOutputTokens: 1000,
      temperature: 0.7,
    })

    return result.toUIMessageStreamResponse({
      consumeSseStream: consumeStream,
    })
  } catch (error) {
    console.error("[VBot API Error]", error)
    return createErrorResponse(error, 500)
  }
}
