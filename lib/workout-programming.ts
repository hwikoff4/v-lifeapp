/**
 * V-Life Workout Programming System
 * 
 * Follows evidence-based programming principles for a Mon-Sat schedule:
 * - Monday: Lower body strength + short conditioning
 * - Tuesday: Skill work + mid-length conditioning  
 * - Wednesday: Tempo/recovery day
 * - Thursday: Upper body strength + longer metcon
 * - Friday: Full body power + intervals
 * - Saturday: Active recovery / fun workout
 * - Sunday: Rest day
 */

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6 // Sun=0 through Sat=6

export interface WorkoutTemplate {
  name: string
  description: string
  workoutType: "strength" | "cardio" | "mixed"
  durationMinutes: number
  emphasis: string
  warmupNotes: string
  exercises: ExerciseTemplate[]
  conditioningFormat: string
  conditioningNotes: string
  scalingOptions: string
}

export interface ExerciseTemplate {
  name: string
  category: "strength" | "cardio" | "skill" | "accessory"
  muscleGroup?: string
  sets: number
  reps: string
  restSeconds: number
  tempo?: string // e.g., "3-1-1-0" for tempo work
  notes?: string
  alternatives?: string[] // Scaling options
}

// Comprehensive exercise library for variety
export const EXERCISE_LIBRARY = {
  // Lower Body Strength
  lowerStrength: [
    { name: "Back Squat", muscleGroup: "quads", equipment: "barbell" },
    { name: "Front Squat", muscleGroup: "quads", equipment: "barbell" },
    { name: "Goblet Squat", muscleGroup: "quads", equipment: "dumbbell" },
    { name: "Romanian Deadlift", muscleGroup: "hamstrings", equipment: "barbell" },
    { name: "Trap Bar Deadlift", muscleGroup: "hamstrings", equipment: "trap bar" },
    { name: "Bulgarian Split Squat", muscleGroup: "quads", equipment: "dumbbell" },
    { name: "Leg Press", muscleGroup: "quads", equipment: "machine" },
    { name: "Walking Lunges", muscleGroup: "quads", equipment: "dumbbell" },
    { name: "Hip Thrust", muscleGroup: "glutes", equipment: "barbell" },
    { name: "Single-Leg RDL", muscleGroup: "hamstrings", equipment: "dumbbell" },
  ],

  // Upper Body Push
  upperPush: [
    { name: "Bench Press", muscleGroup: "chest", equipment: "barbell" },
    { name: "Incline Dumbbell Press", muscleGroup: "chest", equipment: "dumbbell" },
    { name: "Overhead Press", muscleGroup: "shoulders", equipment: "barbell" },
    { name: "Push Press", muscleGroup: "shoulders", equipment: "barbell" },
    { name: "Dumbbell Shoulder Press", muscleGroup: "shoulders", equipment: "dumbbell" },
    { name: "Push-Ups", muscleGroup: "chest", equipment: "bodyweight" },
    { name: "Dips", muscleGroup: "triceps", equipment: "bodyweight" },
    { name: "Arnold Press", muscleGroup: "shoulders", equipment: "dumbbell" },
  ],

  // Upper Body Pull
  upperPull: [
    { name: "Pull-Ups", muscleGroup: "back", equipment: "bodyweight" },
    { name: "Barbell Row", muscleGroup: "back", equipment: "barbell" },
    { name: "Dumbbell Row", muscleGroup: "back", equipment: "dumbbell" },
    { name: "Lat Pulldown", muscleGroup: "back", equipment: "machine" },
    { name: "Seated Cable Row", muscleGroup: "back", equipment: "cable" },
    { name: "Face Pulls", muscleGroup: "rear delts", equipment: "cable" },
    { name: "Chin-Ups", muscleGroup: "back", equipment: "bodyweight" },
    { name: "Inverted Rows", muscleGroup: "back", equipment: "bodyweight" },
  ],

  // Arms & Accessories
  arms: [
    { name: "Bicep Curls", muscleGroup: "biceps", equipment: "dumbbell" },
    { name: "Hammer Curls", muscleGroup: "biceps", equipment: "dumbbell" },
    { name: "Tricep Extensions", muscleGroup: "triceps", equipment: "cable" },
    { name: "Skull Crushers", muscleGroup: "triceps", equipment: "barbell" },
    { name: "Cable Curls", muscleGroup: "biceps", equipment: "cable" },
    { name: "Tricep Pushdowns", muscleGroup: "triceps", equipment: "cable" },
  ],

  // Core
  core: [
    { name: "Plank", muscleGroup: "core", equipment: "bodyweight" },
    { name: "Dead Bug", muscleGroup: "core", equipment: "bodyweight" },
    { name: "Hanging Leg Raise", muscleGroup: "core", equipment: "bodyweight" },
    { name: "Ab Wheel Rollout", muscleGroup: "core", equipment: "ab wheel" },
    { name: "Russian Twists", muscleGroup: "obliques", equipment: "weight plate" },
    { name: "Pallof Press", muscleGroup: "core", equipment: "cable" },
    { name: "Bird Dogs", muscleGroup: "core", equipment: "bodyweight" },
  ],

  // Conditioning Movements
  conditioning: [
    { name: "Kettlebell Swings", muscleGroup: "posterior chain", equipment: "kettlebell" },
    { name: "Box Jumps", muscleGroup: "legs", equipment: "box" },
    { name: "Box Step-Ups", muscleGroup: "legs", equipment: "box" },
    { name: "Wall Balls", muscleGroup: "full body", equipment: "medicine ball" },
    { name: "Burpees", muscleGroup: "full body", equipment: "bodyweight" },
    { name: "Mountain Climbers", muscleGroup: "core", equipment: "bodyweight" },
    { name: "Jump Rope", muscleGroup: "cardio", equipment: "jump rope" },
    { name: "Battle Ropes", muscleGroup: "upper body", equipment: "battle ropes" },
    { name: "Sled Push", muscleGroup: "legs", equipment: "sled" },
    { name: "Farmers Carry", muscleGroup: "full body", equipment: "kettlebell" },
  ],

  // Cardio
  cardio: [
    { name: "Rowing", muscleGroup: "full body", equipment: "rower" },
    { name: "Assault Bike", muscleGroup: "full body", equipment: "bike" },
    { name: "Running", muscleGroup: "cardio", equipment: "none" },
    { name: "Ski Erg", muscleGroup: "upper body", equipment: "ski erg" },
    { name: "Cycling", muscleGroup: "legs", equipment: "bike" },
  ],

  // Skill Work
  skill: [
    { name: "Handstand Hold", muscleGroup: "shoulders", equipment: "bodyweight" },
    { name: "Handstand Push-Up Practice", muscleGroup: "shoulders", equipment: "bodyweight" },
    { name: "Double Under Practice", muscleGroup: "cardio", equipment: "jump rope" },
    { name: "Muscle-Up Progressions", muscleGroup: "back", equipment: "rings" },
    { name: "Pistol Squat Practice", muscleGroup: "legs", equipment: "bodyweight" },
    { name: "L-Sit Practice", muscleGroup: "core", equipment: "parallettes" },
  ],
}

// Day-specific workout templates following programming principles
export const DAILY_TEMPLATES: Record<number, WorkoutTemplate[]> = {
  // Monday - Lower Body Strength + Short Conditioning
  1: [
    {
      name: "Leg Day Power",
      description: "Lower body strength focus with squat pattern emphasis",
      workoutType: "strength",
      durationMinutes: 50,
      emphasis: "Squat strength & leg power",
      warmupNotes: "5 min bike/row, hip circles, leg swings, goblet squat warmup",
      exercises: [
        { name: "Back Squat", category: "strength", muscleGroup: "quads", sets: 4, reps: "5", restSeconds: 120, notes: "Build to working weight" },
        { name: "Romanian Deadlift", category: "strength", muscleGroup: "hamstrings", sets: 3, reps: "8", restSeconds: 90 },
        { name: "Walking Lunges", category: "strength", muscleGroup: "quads", sets: 3, reps: "12 each leg", restSeconds: 60 },
        { name: "Kettlebell Swings", category: "cardio", muscleGroup: "posterior chain", sets: 4, reps: "15", restSeconds: 45 },
      ],
      conditioningFormat: "12 min AMRAP",
      conditioningNotes: "12 KB swings, 10 goblet squats, 200m row",
      scalingOptions: "Goblet squats instead of back squats, lighter KB, step-ups instead of lunges",
    },
    {
      name: "Squat Builder",
      description: "Volume-focused lower body session",
      workoutType: "strength",
      durationMinutes: 55,
      emphasis: "Squat mechanics & posterior chain",
      warmupNotes: "Row 500m, hip openers, glute activation drills",
      exercises: [
        { name: "Front Squat", category: "strength", muscleGroup: "quads", sets: 4, reps: "6", restSeconds: 120, notes: "Focus on upright torso" },
        { name: "Hip Thrust", category: "strength", muscleGroup: "glutes", sets: 3, reps: "10", restSeconds: 90 },
        { name: "Single-Leg RDL", category: "strength", muscleGroup: "hamstrings", sets: 3, reps: "8 each", restSeconds: 60 },
        { name: "Box Step-Ups", category: "cardio", muscleGroup: "legs", sets: 3, reps: "10 each", restSeconds: 60 },
      ],
      conditioningFormat: "10 min EMOM",
      conditioningNotes: "Min 1: 15 cal row. Min 2: 10 box jumps",
      scalingOptions: "Goblet squat, bodyweight hip thrust, supported step-ups",
    },
  ],

  // Tuesday - Skill + Mid-Length Conditioning
  2: [
    {
      name: "Pull & Condition",
      description: "Upper body pulling skill work with aerobic conditioning",
      workoutType: "mixed",
      durationMinutes: 55,
      emphasis: "Pulling strength & endurance",
      warmupNotes: "5 min cardio, band pull-aparts, scap pulls, light rows",
      exercises: [
        { name: "Pull-Ups", category: "skill", muscleGroup: "back", sets: 5, reps: "3-5", restSeconds: 90, notes: "Focus on quality reps", alternatives: ["Ring Rows", "Lat Pulldown"] },
        { name: "Dumbbell Row", category: "strength", muscleGroup: "back", sets: 3, reps: "10 each", restSeconds: 60 },
        { name: "Face Pulls", category: "accessory", muscleGroup: "rear delts", sets: 3, reps: "15", restSeconds: 45 },
      ],
      conditioningFormat: "16 min AMRAP",
      conditioningNotes: "250m row, 12 box step-ups, 10 push-ups, 8 DB rows",
      scalingOptions: "Ring rows, knee push-ups, lower box height",
    },
    {
      name: "Athletic Tuesday",
      description: "Jump training and conditioning",
      workoutType: "mixed",
      durationMinutes: 50,
      emphasis: "Power development & work capacity",
      warmupNotes: "Light jog, leg swings, arm circles, jumping jacks",
      exercises: [
        { name: "Box Jumps", category: "skill", muscleGroup: "legs", sets: 4, reps: "5", restSeconds: 90, notes: "Step down, reset each rep" },
        { name: "Chin-Ups", category: "strength", muscleGroup: "back", sets: 4, reps: "5-8", restSeconds: 90 },
        { name: "Pallof Press", category: "accessory", muscleGroup: "core", sets: 3, reps: "10 each side", restSeconds: 45 },
      ],
      conditioningFormat: "15 min AMRAP",
      conditioningNotes: "200m run, 15 KB swings, 10 burpees",
      scalingOptions: "Box step-ups, banded pull-ups, no-push-up burpees",
    },
  ],

  // Wednesday - Tempo/Recovery Day
  3: [
    {
      name: "Tempo & Flow",
      description: "Controlled tempo work with aerobic development",
      workoutType: "mixed",
      durationMinutes: 45,
      emphasis: "Movement quality & recovery",
      warmupNotes: "5 min easy bike, thoracic rotations, hip 90/90",
      exercises: [
        { name: "Tempo Deadlift", category: "strength", muscleGroup: "hamstrings", sets: 4, reps: "6", restSeconds: 90, tempo: "3-1-2-0", notes: "3 sec down, 1 sec pause, controlled up" },
        { name: "Single-Leg RDL", category: "strength", muscleGroup: "hamstrings", sets: 3, reps: "8 each", restSeconds: 60, tempo: "2-0-2-0" },
        { name: "Bird Dogs", category: "accessory", muscleGroup: "core", sets: 3, reps: "10 each", restSeconds: 30 },
      ],
      conditioningFormat: "4 x 3 min intervals",
      conditioningNotes: "3 min moderate pace bike/row, 1 min rest. Keep HR steady 65-75%",
      scalingOptions: "Lighter weight, supported single-leg work",
    },
    {
      name: "Active Recovery",
      description: "Low intensity movement and mobility",
      workoutType: "cardio",
      durationMinutes: 40,
      emphasis: "Recovery & movement quality",
      warmupNotes: "Easy 5 min walk or bike",
      exercises: [
        { name: "Goblet Squat", category: "strength", muscleGroup: "quads", sets: 3, reps: "10", restSeconds: 60, tempo: "3-2-1-0", notes: "Focus on depth and control" },
        { name: "Push-Ups", category: "strength", muscleGroup: "chest", sets: 3, reps: "10", restSeconds: 45, tempo: "2-1-2-0" },
        { name: "Dead Bug", category: "accessory", muscleGroup: "core", sets: 3, reps: "10 each", restSeconds: 30 },
        { name: "Plank", category: "accessory", muscleGroup: "core", sets: 3, reps: "30 sec", restSeconds: 30 },
      ],
      conditioningFormat: "15 min steady state",
      conditioningNotes: "Easy row or bike at conversational pace",
      scalingOptions: "Reduce tempo, shorten holds",
    },
  ],

  // Thursday - Upper Body Strength + Longer Metcon
  4: [
    {
      name: "Push Day Power",
      description: "Upper body pressing focus with conditioning finisher",
      workoutType: "strength",
      durationMinutes: 55,
      emphasis: "Pressing strength & muscular endurance",
      warmupNotes: "Band pull-aparts, arm circles, light pressing warmup",
      exercises: [
        { name: "Bench Press", category: "strength", muscleGroup: "chest", sets: 4, reps: "5", restSeconds: 120, notes: "Build to working weight" },
        { name: "Overhead Press", category: "strength", muscleGroup: "shoulders", sets: 4, reps: "6", restSeconds: 90 },
        { name: "Dips", category: "strength", muscleGroup: "triceps", sets: 3, reps: "8-10", restSeconds: 60, alternatives: ["Bench Dips", "Tricep Pushdowns"] },
        { name: "Barbell Row", category: "strength", muscleGroup: "back", sets: 3, reps: "8", restSeconds: 60 },
      ],
      conditioningFormat: "18 min AMRAP",
      conditioningNotes: "15 wall balls, 12 KB swings, 9 burpees",
      scalingOptions: "DB press, push-ups, knee push-ups",
    },
    {
      name: "Upper Body Builder",
      description: "Volume pressing with accessory work",
      workoutType: "strength",
      durationMinutes: 55,
      emphasis: "Hypertrophy & conditioning",
      warmupNotes: "Shoulder dislocates, scap push-ups, light pressing",
      exercises: [
        { name: "Push Press", category: "strength", muscleGroup: "shoulders", sets: 4, reps: "5", restSeconds: 120 },
        { name: "Incline Dumbbell Press", category: "strength", muscleGroup: "chest", sets: 3, reps: "10", restSeconds: 90 },
        { name: "Seated Cable Row", category: "strength", muscleGroup: "back", sets: 3, reps: "12", restSeconds: 60 },
        { name: "Tricep Extensions", category: "accessory", muscleGroup: "triceps", sets: 3, reps: "12", restSeconds: 45 },
      ],
      conditioningFormat: "15 min AMRAP",
      conditioningNotes: "10 DB thrusters, 15 cal bike, 10 push-ups",
      scalingOptions: "Lighter DB, seated bike, knee push-ups",
    },
  ],

  // Friday - Full Body Power + Intervals
  5: [
    {
      name: "Friday Firepower",
      description: "Full body power development with interval training",
      workoutType: "mixed",
      durationMinutes: 50,
      emphasis: "Power & metabolic conditioning",
      warmupNotes: "Dynamic warmup, light cleans/swings, jumping drills",
      exercises: [
        { name: "Trap Bar Deadlift", category: "strength", muscleGroup: "full body", sets: 4, reps: "5", restSeconds: 120, alternatives: ["Conventional Deadlift", "Sumo Deadlift"] },
        { name: "Push Press", category: "strength", muscleGroup: "shoulders", sets: 3, reps: "6", restSeconds: 90 },
        { name: "Pull-Ups", category: "strength", muscleGroup: "back", sets: 3, reps: "6-8", restSeconds: 60 },
      ],
      conditioningFormat: "5 rounds for time",
      conditioningNotes: "15 cal row, 10 KB swings, 5 burpees. Rest 1 min between rounds",
      scalingOptions: "Romanian deadlift, strict press, ring rows",
    },
    {
      name: "Total Body Friday",
      description: "Balanced full body session",
      workoutType: "mixed",
      durationMinutes: 55,
      emphasis: "Strength endurance & conditioning",
      warmupNotes: "500m row, mobility, activation drills",
      exercises: [
        { name: "Back Squat", category: "strength", muscleGroup: "quads", sets: 3, reps: "6", restSeconds: 90 },
        { name: "Bench Press", category: "strength", muscleGroup: "chest", sets: 3, reps: "8", restSeconds: 90 },
        { name: "Dumbbell Row", category: "strength", muscleGroup: "back", sets: 3, reps: "10 each", restSeconds: 60 },
        { name: "Farmers Carry", category: "cardio", muscleGroup: "full body", sets: 3, reps: "40m", restSeconds: 60 },
      ],
      conditioningFormat: "12 min AMRAP",
      conditioningNotes: "10 thrusters, 10 pull-ups, 200m run",
      scalingOptions: "Goblet squat, DB press, ring rows, row instead of run",
    },
  ],

  // Saturday - Fun/Active Recovery
  6: [
    {
      name: "Saturday Sweat",
      description: "Fun partner-style workout or challenge",
      workoutType: "cardio",
      durationMinutes: 40,
      emphasis: "Fun, community, active recovery",
      warmupNotes: "Easy jog, dynamic stretches, light movements",
      exercises: [
        { name: "Kettlebell Swings", category: "cardio", muscleGroup: "posterior chain", sets: 3, reps: "15", restSeconds: 45 },
        { name: "Box Step-Ups", category: "cardio", muscleGroup: "legs", sets: 3, reps: "10 each", restSeconds: 45 },
        { name: "Push-Ups", category: "strength", muscleGroup: "chest", sets: 3, reps: "10", restSeconds: 45 },
        { name: "Plank", category: "accessory", muscleGroup: "core", sets: 3, reps: "30 sec", restSeconds: 30 },
      ],
      conditioningFormat: "20 min partner or solo AMRAP",
      conditioningNotes: "Partner alternates: 200m run, 15 wall balls, 10 burpees. Solo: same movements, you-go-I-go style every round",
      scalingOptions: "Walking, lighter ball, no-jump burpees",
    },
    {
      name: "Weekend Warrior",
      description: "Light conditioning and mobility focus",
      workoutType: "cardio",
      durationMinutes: 35,
      emphasis: "Movement quality & aerobic base",
      warmupNotes: "Easy movement, foam rolling",
      exercises: [
        { name: "Goblet Squat", category: "strength", muscleGroup: "quads", sets: 2, reps: "10", restSeconds: 45 },
        { name: "Push-Ups", category: "strength", muscleGroup: "chest", sets: 2, reps: "10", restSeconds: 45 },
        { name: "Inverted Rows", category: "strength", muscleGroup: "back", sets: 2, reps: "10", restSeconds: 45 },
        { name: "Dead Bug", category: "accessory", muscleGroup: "core", sets: 2, reps: "10 each", restSeconds: 30 },
      ],
      conditioningFormat: "15-20 min easy pace",
      conditioningNotes: "Choice: bike, row, walk, or easy run at conversational pace",
      scalingOptions: "All bodyweight, no conditioning if needed",
    },
  ],

  // Sunday - Rest Day (but provide optional light workout)
  0: [
    {
      name: "Active Rest",
      description: "Optional light movement for recovery",
      workoutType: "cardio",
      durationMinutes: 30,
      emphasis: "Recovery & mobility",
      warmupNotes: "Gentle movement, no structure needed",
      exercises: [
        { name: "Walking", category: "cardio", muscleGroup: "cardio", sets: 1, reps: "15-20 min", restSeconds: 0, notes: "Outdoor walk preferred" },
        { name: "Bird Dogs", category: "accessory", muscleGroup: "core", sets: 2, reps: "10 each", restSeconds: 30 },
        { name: "Dead Bug", category: "accessory", muscleGroup: "core", sets: 2, reps: "10 each", restSeconds: 30 },
      ],
      conditioningFormat: "None",
      conditioningNotes: "Focus on mobility, stretching, and recovery",
      scalingOptions: "Complete rest is also valid",
    },
  ],
}

// Get appropriate templates for the current day
export function getDayTemplates(dayOfWeek: DayOfWeek): WorkoutTemplate[] {
  return DAILY_TEMPLATES[dayOfWeek] || DAILY_TEMPLATES[0]
}

// Get a random template for variety
export function getRandomTemplate(dayOfWeek: DayOfWeek): WorkoutTemplate {
  const templates = getDayTemplates(dayOfWeek)
  return templates[Math.floor(Math.random() * templates.length)]
}

// Get day name from number
export function getDayName(dayOfWeek: DayOfWeek): string {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  return days[dayOfWeek]
}

// Get the emphasis description for a day
export function getDayEmphasis(dayOfWeek: DayOfWeek): string {
  const emphases: Record<number, string> = {
    0: "Rest & Recovery",
    1: "Lower Body Strength",
    2: "Skill & Conditioning",
    3: "Tempo & Recovery",
    4: "Upper Body Strength",
    5: "Full Body Power",
    6: "Active Fun",
  }
  return emphases[dayOfWeek] || "Training"
}

// Calculate week number for progression tracking
export function getWeekOfMonth(): number {
  const now = new Date()
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
  return Math.ceil((now.getDate() + firstDay.getDay()) / 7)
}

// Determine intensity based on week (4-week microcycle)
export function getWeekIntensity(): { label: string; modifier: number } {
  const week = getWeekOfMonth()
  switch (week % 4) {
    case 1:
      return { label: "Base", modifier: 0.85 } // Week 1: moderate loads
    case 2:
      return { label: "Build", modifier: 0.9 } // Week 2: increase intensity
    case 3:
      return { label: "Peak", modifier: 0.95 } // Week 3: peak intensity
    case 0:
      return { label: "Deload", modifier: 0.7 } // Week 4: recovery
    default:
      return { label: "Base", modifier: 0.85 }
  }
}

// Get the day's programming context for display
export function getTodaysProgrammingContext() {
  const dayOfWeek = new Date().getDay() as DayOfWeek
  const dayName = getDayName(dayOfWeek)
  const emphasis = getDayEmphasis(dayOfWeek)
  const weekInfo = getWeekIntensity()

  return {
    dayName,
    emphasis,
    weekPhase: weekInfo.label,
    isSunday: dayOfWeek === 0,
  }
}

