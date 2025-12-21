/**
 * Dynamic exercise image generation using Unsplash
 * Uses curated images and smart keyword matching for relevant exercise photos
 */

// Curated high-quality exercise images (exact matches)
export const EXERCISE_IMAGES: Record<string, string> = {
  // Chest exercises
  "Bench Press":
    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=400&fit=crop&auto=format",
  "Incline Bench Press":
    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=400&fit=crop&auto=format",
  "Decline Bench Press":
    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=400&fit=crop&auto=format",
  "Dumbbell Press":
    "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&h=400&fit=crop&auto=format",
  "Chest Fly":
    "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&h=400&fit=crop&auto=format",
  "Cable Flies":
    "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&h=400&fit=crop&auto=format",
  "Push-Ups":
    "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=600&h=400&fit=crop&auto=format",
  "Push Ups":
    "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=600&h=400&fit=crop&auto=format",

  // Back exercises
  "Pull-Ups":
    "https://images.unsplash.com/photo-1597452485669-2c7bb5fef90d?w=600&h=400&fit=crop&auto=format",
  "Pull Ups":
    "https://images.unsplash.com/photo-1597452485669-2c7bb5fef90d?w=600&h=400&fit=crop&auto=format",
  "Lat Pulldown":
    "https://images.unsplash.com/photo-1597452485669-2c7bb5fef90d?w=600&h=400&fit=crop&auto=format",
  "Dumbbell Rows":
    "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&h=400&fit=crop&auto=format",
  "Barbell Rows":
    "https://images.unsplash.com/photo-1517963628607-235ccdd5476c?w=600&h=400&fit=crop&auto=format",
  "Bent Over Row":
    "https://images.unsplash.com/photo-1517963628607-235ccdd5476c?w=600&h=400&fit=crop&auto=format",
  Deadlift:
    "https://images.unsplash.com/photo-1517963628607-235ccdd5476c?w=600&h=400&fit=crop&auto=format",
  "Romanian Deadlift":
    "https://images.unsplash.com/photo-1517963628607-235ccdd5476c?w=600&h=400&fit=crop&auto=format",
  "Seated Cable Row":
    "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&h=400&fit=crop&auto=format",

  // Shoulder exercises
  "Shoulder Press":
    "https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?w=600&h=400&fit=crop&auto=format",
  "Overhead Press":
    "https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?w=600&h=400&fit=crop&auto=format",
  "Military Press":
    "https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?w=600&h=400&fit=crop&auto=format",
  "Lateral Raises":
    "https://images.unsplash.com/photo-1581009146145-b5ef050c149a?w=600&h=400&fit=crop&auto=format",
  "Front Raises":
    "https://images.unsplash.com/photo-1581009146145-b5ef050c149a?w=600&h=400&fit=crop&auto=format",
  "Face Pulls":
    "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&h=400&fit=crop&auto=format",
  "Arnold Press":
    "https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?w=600&h=400&fit=crop&auto=format",

  // Arm exercises
  "Bicep Curls":
    "https://images.unsplash.com/photo-1581009146145-b5ef050c149a?w=600&h=400&fit=crop&auto=format",
  "Hammer Curls":
    "https://images.unsplash.com/photo-1581009146145-b5ef050c149a?w=600&h=400&fit=crop&auto=format",
  "Preacher Curls":
    "https://images.unsplash.com/photo-1581009146145-b5ef050c149a?w=600&h=400&fit=crop&auto=format",
  "Tricep Extensions":
    "https://images.unsplash.com/photo-1590239926044-4131f5d0654d?w=600&h=400&fit=crop&auto=format",
  "Tricep Pushdowns":
    "https://images.unsplash.com/photo-1590239926044-4131f5d0654d?w=600&h=400&fit=crop&auto=format",
  "Skull Crushers":
    "https://images.unsplash.com/photo-1590239926044-4131f5d0654d?w=600&h=400&fit=crop&auto=format",
  Dips:
    "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=600&h=400&fit=crop&auto=format",

  // Leg exercises
  Squats:
    "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&h=400&fit=crop&auto=format",
  Squat:
    "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&h=400&fit=crop&auto=format",
  "Back Squat":
    "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&h=400&fit=crop&auto=format",
  "Front Squat":
    "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&h=400&fit=crop&auto=format",
  "Goblet Squat":
    "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&h=400&fit=crop&auto=format",
  Lunges:
    "https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=600&h=400&fit=crop&auto=format",
  "Walking Lunges":
    "https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=600&h=400&fit=crop&auto=format",
  "Leg Press":
    "https://images.unsplash.com/photo-1434682772747-f16d3ea162c3?w=600&h=400&fit=crop&auto=format",
  "Leg Curls":
    "https://images.unsplash.com/photo-1434682772747-f16d3ea162c3?w=600&h=400&fit=crop&auto=format",
  "Leg Extensions":
    "https://images.unsplash.com/photo-1434682772747-f16d3ea162c3?w=600&h=400&fit=crop&auto=format",
  "Calf Raises":
    "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&h=400&fit=crop&auto=format",
  "Hip Thrusts":
    "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&h=400&fit=crop&auto=format",
  "Bulgarian Split Squat":
    "https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=600&h=400&fit=crop&auto=format",

  // Core exercises
  Plank:
    "https://images.unsplash.com/photo-1566241142559-40e1dab266c6?w=600&h=400&fit=crop&auto=format",
  Crunches:
    "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=400&fit=crop&auto=format",
  "Sit Ups":
    "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=400&fit=crop&auto=format",
  "Russian Twists":
    "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=400&fit=crop&auto=format",
  "Leg Raises":
    "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=400&fit=crop&auto=format",
  "Mountain Climbers":
    "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=600&h=400&fit=crop&auto=format",
  "Ab Wheel":
    "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=400&fit=crop&auto=format",

  // Cardio exercises
  Running:
    "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=600&h=400&fit=crop&auto=format",
  Jogging:
    "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=600&h=400&fit=crop&auto=format",
  Sprints:
    "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=600&h=400&fit=crop&auto=format",
  Cycling:
    "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600&h=400&fit=crop&auto=format",
  "Stationary Bike":
    "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600&h=400&fit=crop&auto=format",
  Swimming:
    "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=600&h=400&fit=crop&auto=format",
  "Jump Rope":
    "https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?w=600&h=400&fit=crop&auto=format",
  "Jumping Jacks":
    "https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?w=600&h=400&fit=crop&auto=format",
  Rowing:
    "https://images.unsplash.com/photo-1593079831268-3381b0db4a77?w=600&h=400&fit=crop&auto=format",
  Treadmill:
    "https://images.unsplash.com/photo-1576678927484-cc907957088c?w=600&h=400&fit=crop&auto=format",
  Elliptical:
    "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&h=400&fit=crop&auto=format",
  "Stair Climber":
    "https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=600&h=400&fit=crop&auto=format",
  HIIT:
    "https://images.unsplash.com/photo-1434596922112-19c563067271?w=600&h=400&fit=crop&auto=format",
  "Battle Ropes":
    "https://images.unsplash.com/photo-1517963628607-235ccdd5476c?w=600&h=400&fit=crop&auto=format",
  "Box Jumps":
    "https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=600&h=400&fit=crop&auto=format",
  Burpees:
    "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&h=400&fit=crop&auto=format",
  "Kettlebell Swings":
    "https://images.unsplash.com/photo-1517963628607-235ccdd5476c?w=600&h=400&fit=crop&auto=format",

  // Flexibility / Recovery
  Yoga:
    "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=400&fit=crop&auto=format",
  Stretching:
    "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&h=400&fit=crop&auto=format",
  Pilates:
    "https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=600&h=400&fit=crop&auto=format",
  "Foam Rolling":
    "https://images.unsplash.com/photo-1570691079236-bbee6e5b27a7?w=600&h=400&fit=crop&auto=format",
}

// Exercise keyword to Unsplash photo ID mapping
const exerciseKeywordImages: Record<string, string> = {
  // Body parts / muscle groups
  chest: "photo-1534438327276-14e5300c3a48",
  back: "photo-1597452485669-2c7bb5fef90d",
  shoulders: "photo-1532029837206-abbe2b7620e3",
  shoulder: "photo-1532029837206-abbe2b7620e3",
  arms: "photo-1581009146145-b5ef050c149a",
  bicep: "photo-1581009146145-b5ef050c149a",
  biceps: "photo-1581009146145-b5ef050c149a",
  tricep: "photo-1590239926044-4131f5d0654d",
  triceps: "photo-1590239926044-4131f5d0654d",
  legs: "photo-1574680096145-d05b474e2155",
  leg: "photo-1574680096145-d05b474e2155",
  glutes: "photo-1574680096145-d05b474e2155",
  abs: "photo-1544367567-0f2fcb009e0b",
  core: "photo-1566241142559-40e1dab266c6",
  calves: "photo-1574680096145-d05b474e2155",
  
  // Equipment
  dumbbell: "photo-1583454110551-21f2fa2afe61",
  dumbbells: "photo-1583454110551-21f2fa2afe61",
  barbell: "photo-1517963628607-235ccdd5476c",
  kettlebell: "photo-1517963628607-235ccdd5476c",
  cable: "photo-1571019614242-c5c5dee9f50b",
  machine: "photo-1434682772747-f16d3ea162c3",
  band: "photo-1598971639058-fab3c3109a00",
  resistance: "photo-1598971639058-fab3c3109a00",
  
  // Movement types
  press: "photo-1534438327276-14e5300c3a48",
  push: "photo-1598971639058-fab3c3109a00",
  pull: "photo-1597452485669-2c7bb5fef90d",
  row: "photo-1517963628607-235ccdd5476c",
  rows: "photo-1517963628607-235ccdd5476c",
  curl: "photo-1581009146145-b5ef050c149a",
  curls: "photo-1581009146145-b5ef050c149a",
  raise: "photo-1581009146145-b5ef050c149a",
  raises: "photo-1581009146145-b5ef050c149a",
  squat: "photo-1574680096145-d05b474e2155",
  lunge: "photo-1434682881908-b43d0467b798",
  lunges: "photo-1434682881908-b43d0467b798",
  fly: "photo-1571019614242-c5c5dee9f50b",
  flies: "photo-1571019614242-c5c5dee9f50b",
  extension: "photo-1590239926044-4131f5d0654d",
  extensions: "photo-1590239926044-4131f5d0654d",
  pulldown: "photo-1597452485669-2c7bb5fef90d",
  pullup: "photo-1597452485669-2c7bb5fef90d",
  pushup: "photo-1598971639058-fab3c3109a00",
  
  // Cardio keywords
  run: "photo-1476480862126-209bfaa8edc8",
  running: "photo-1476480862126-209bfaa8edc8",
  jog: "photo-1476480862126-209bfaa8edc8",
  sprint: "photo-1476480862126-209bfaa8edc8",
  bike: "photo-1517649763962-0c623066013b",
  cycle: "photo-1517649763962-0c623066013b",
  swim: "photo-1530549387789-4c1017266635",
  jump: "photo-1599058917212-d750089bc07e",
  jumping: "photo-1601422407692-ec4eeec1d9b3",
  rope: "photo-1601422407692-ec4eeec1d9b3",
  box: "photo-1599058917212-d750089bc07e",
  
  // Flexibility
  yoga: "photo-1544367567-0f2fcb009e0b",
  stretch: "photo-1518611012118-696072aa579a",
  stretching: "photo-1518611012118-696072aa579a",
  pilates: "photo-1518310383802-640c2de311b2",
  foam: "photo-1570691079236-bbee6e5b27a7",
  mobility: "photo-1518611012118-696072aa579a",
  
  // Compound movements
  deadlift: "photo-1517963628607-235ccdd5476c",
  clean: "photo-1517963628607-235ccdd5476c",
  snatch: "photo-1517963628607-235ccdd5476c",
  thrust: "photo-1574680096145-d05b474e2155",
  plank: "photo-1566241142559-40e1dab266c6",
  crunch: "photo-1544367567-0f2fcb009e0b",
}

// Fallback images by exercise category
const categoryFallbacks: Record<string, string> = {
  strength:
    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=400&fit=crop&auto=format",
  cardio:
    "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=600&h=400&fit=crop&auto=format",
  flexibility:
    "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=400&fit=crop&auto=format",
  hiit:
    "https://images.unsplash.com/photo-1434596922112-19c563067271?w=600&h=400&fit=crop&auto=format",
  core:
    "https://images.unsplash.com/photo-1566241142559-40e1dab266c6?w=600&h=400&fit=crop&auto=format",
  upper:
    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=400&fit=crop&auto=format",
  lower:
    "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&h=400&fit=crop&auto=format",
  push:
    "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=600&h=400&fit=crop&auto=format",
  pull:
    "https://images.unsplash.com/photo-1597452485669-2c7bb5fef90d?w=600&h=400&fit=crop&auto=format",
  default:
    "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&h=400&fit=crop&auto=format",
}

/**
 * Extract exercise keywords from an exercise name
 */
function extractExerciseKeywords(exerciseName: string): string[] {
  const normalized = exerciseName
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
  
  const words = normalized.split(" ")
  const keywords: string[] = []
  
  for (const word of words) {
    if (word in exerciseKeywordImages) {
      keywords.push(word)
    }
  }
  
  return keywords
}

/**
 * Get exercise image URL by name
 * Uses smart keyword extraction to find the most relevant image
 * 
 * @param exerciseName - The name of the exercise
 * @param category - Optional category for better fallback (strength, cardio, flexibility, etc.)
 * @returns The image URL
 */
export function getExerciseImage(exerciseName: string, category?: string): string {
  // 1. Try exact match first
  if (exerciseName in EXERCISE_IMAGES) {
    return EXERCISE_IMAGES[exerciseName]
  }
  
  // 2. Try partial match from curated list
  const curatedMatch = Object.keys(EXERCISE_IMAGES).find(
    (key) =>
      key.toLowerCase().includes(exerciseName.toLowerCase()) ||
      exerciseName.toLowerCase().includes(key.toLowerCase())
  )
  if (curatedMatch) {
    return EXERCISE_IMAGES[curatedMatch]
  }
  
  // 3. Extract keywords and find best matching image
  const keywords = extractExerciseKeywords(exerciseName)
  
  if (keywords.length > 0) {
    // Prioritize movement-type keywords
    const priorityOrder = [
      "squat", "deadlift", "press", "curl", "row", "pull", "push",
      "lunge", "fly", "raise", "extension", "plank", "crunch"
    ]
    
    for (const priority of priorityOrder) {
      if (keywords.includes(priority)) {
        const photoId = exerciseKeywordImages[priority]
        return `https://images.unsplash.com/${photoId}?w=600&h=400&fit=crop&auto=format`
      }
    }
    
    // If no priority match, use the first keyword found
    const photoId = exerciseKeywordImages[keywords[0]]
    return `https://images.unsplash.com/${photoId}?w=600&h=400&fit=crop&auto=format`
  }
  
  // 4. Return category-based fallback or default
  if (category) {
    return categoryFallbacks[category.toLowerCase()] || categoryFallbacks.default
  }
  
  return categoryFallbacks.default
}

/**
 * Check if an exercise has a specific curated image
 * @param exerciseName - The name of the exercise
 * @returns true if specific image exists
 */
export function hasExerciseImage(exerciseName: string): boolean {
  return exerciseName in EXERCISE_IMAGES
}

/**
 * Get a list of all supported exercise keywords for debugging
 */
export function getSupportedExerciseKeywords(): string[] {
  return Object.keys(exerciseKeywordImages)
}
