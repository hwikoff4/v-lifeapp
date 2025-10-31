import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const { messages, userData } = await req.json()

    console.log("Chat API called with messages:", messages?.length || 0)
    console.log("User data provided:", !!userData)

    if (!process.env.OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY not found")
      return new Response("OpenAI API key not configured", { status: 500 })
    }

    // Build context from user data
    const userContext = userData
      ? `
CURRENT USER DATA CONTEXT:
==========================

PROFILE:
- Name: ${userData.profile?.name || "User"}
- Age: ${userData.profile?.age || "Not specified"}
- Current Weight: ${userData.profile?.currentWeight || "Not specified"} lbs
- Goal Weight: ${userData.profile?.goalWeight || "Not specified"} lbs
- Primary Goal: ${userData.profile?.primaryGoal || "Not specified"}
- Activity Level: ${userData.profile?.activityLevel || "Not specified"}/5
- Gym Access: ${userData.profile?.gymAccess || "Not specified"}

CURRENT PROGRESS:
- Weekly Progress: ${userData.progress?.weeklyProgress || 0}%
- Weight Change: ${userData.progress?.weightChange || "No data"} lbs
- Workout Streak: ${userData.progress?.workoutStreak || 0} days
- Total Workouts Completed: ${userData.progress?.totalWorkouts || 0}

TODAY'S STATUS:
- Habits Completed: ${userData.today?.habitsCompleted || 0}/${userData.today?.totalHabits || 0}
- Calories Consumed: ${userData.today?.caloriesConsumed || 0}/${userData.today?.targetCalories || 0} kcal
- Protein Intake: ${userData.today?.proteinIntake || 0}g/${userData.today?.targetProtein || 0}g
- Water Intake: ${userData.today?.waterIntake || 0}/8 glasses
- Workout Status: ${userData.today?.workoutCompleted ? "Completed" : "Not completed"}

RECENT MEALS:
${
  userData.meals
    ?.map((meal: any, index: number) => `- ${meal.type}: ${meal.name} (${meal.calories} kcal)`)
    .join("\n") || "- No recent meals logged"
}

CURRENT HABITS:
${
  userData.habits?.map((habit: any) => `- ${habit.name}: ${habit.streak} day streak (${habit.frequency})`).join("\n") ||
  "- No habits tracked"
}

WORKOUT PLAN:
- Current Program: ${userData.workout?.programName || "Not specified"}
- Today's Workout: ${userData.workout?.todayWorkout || "Rest day"}
- Exercises Completed Today: ${userData.workout?.exercisesCompleted || 0}/${userData.workout?.totalExercises || 0}
- Last Workout: ${userData.workout?.lastWorkout || "No recent workouts"}

SUPPLEMENTS:
${
  userData.supplements
    ?.map((supp: any) => `- ${supp.name}: ${supp.dosage} (${supp.taken ? "Taken" : "Not taken"} today)`)
    .join("\n") || "- No supplements tracked"
}

RECENT ACHIEVEMENTS:
${
  userData.achievements
    ?.slice(-3)
    .map((achievement: any) => `- ${achievement.title}: ${achievement.description}`)
    .join("\n") || "- No recent achievements"
}

ALLERGIES/RESTRICTIONS:
${userData.profile?.allergies?.join(", ") || "None specified"}

Use this data to provide personalized, specific advice and celebrate the user's progress. Reference their actual data points, goals, and current status in your responses.
`
      : ""

    const result = await streamText({
      model: openai("gpt-4o"),
      system: `You are V-Bot, an elite lifestyle AI coach for the V-Life Fitness app. You are knowledgeable, motivating, and personalized in your approach to helping users achieve their fitness and lifestyle goals.

Your personality:
- Enthusiastic and motivating, but not overly energetic
- Professional yet friendly and approachable
- Knowledgeable about fitness, nutrition, wellness, and lifestyle optimization
- Supportive and encouraging, especially when users face challenges
- Concise but thorough in your responses
- Use emojis sparingly but effectively

Your expertise includes:
- Workout programming and exercise form
- Nutrition planning and meal prep
- Habit formation and behavior change
- Sleep optimization and recovery
- Stress management and mental wellness
- Goal setting and progress tracking
- Supplement guidance
- Lifestyle optimization

Always:
- Provide actionable, specific advice based on their current data
- Reference their actual progress, habits, and goals when relevant
- Ask follow-up questions to better understand user needs
- Celebrate user victories and progress with specific details
- Offer alternatives when users face obstacles
- Keep responses focused and practical
- Remind users to consult healthcare professionals for medical concerns
- Use their actual data to make recommendations more personal

Remember: You're part of the V-Life ecosystem and have access to all their app data. Reference specific metrics, completed workouts, meal choices, habit streaks, and progress when relevant.

${userContext}`,
      messages,
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Chat API error:", error)
    return new Response("Internal server error", { status: 500 })
  }
}
