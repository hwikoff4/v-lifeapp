/**
 * Exercise image mappings using high-quality Unsplash stock photos
 * All images are licensed for free use with attribution
 */

export const EXERCISE_IMAGES: Record<string, string> = {
  // Strength exercises
  "Bench Press":
    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=400&fit=crop&auto=format",
  "Bicep Curls":
    "https://images.unsplash.com/photo-1581009146145-b5ef050c149a?w=600&h=400&fit=crop&auto=format",
  Squats:
    "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&h=400&fit=crop&auto=format",
  Squat:
    "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&h=400&fit=crop&auto=format",
  Deadlift:
    "https://images.unsplash.com/photo-1517963628607-235ccdd5476c?w=600&h=400&fit=crop&auto=format",
  "Push-Ups":
    "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=600&h=400&fit=crop&auto=format",
  "Push Ups":
    "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=600&h=400&fit=crop&auto=format",
  "Pull-Ups":
    "https://images.unsplash.com/photo-1597452485669-2c7bb5fef90d?w=600&h=400&fit=crop&auto=format",
  "Pull Ups":
    "https://images.unsplash.com/photo-1597452485669-2c7bb5fef90d?w=600&h=400&fit=crop&auto=format",
  "Shoulder Press":
    "https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?w=600&h=400&fit=crop&auto=format",
  "Tricep Extensions":
    "https://images.unsplash.com/photo-1590239926044-4131f5d0654d?w=600&h=400&fit=crop&auto=format",
  Lunges:
    "https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=600&h=400&fit=crop&auto=format",
  Plank:
    "https://images.unsplash.com/photo-1566241142559-40e1dab266c6?w=600&h=400&fit=crop&auto=format",
  "Lat Pulldown":
    "https://images.unsplash.com/photo-1597452485669-2c7bb5fef90d?w=600&h=400&fit=crop&auto=format",
  "Leg Press":
    "https://images.unsplash.com/photo-1434682772747-f16d3ea162c3?w=600&h=400&fit=crop&auto=format",
  "Dumbbell Rows":
    "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&h=400&fit=crop&auto=format",
  "Cable Flies":
    "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&h=400&fit=crop&auto=format",

  // Cardio exercises
  Running:
    "https://images.unsplash.com/photo-1461896836934- voices40a5611?w=600&h=400&fit=crop&auto=format",
  Jogging:
    "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=600&h=400&fit=crop&auto=format",
  Cycling:
    "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600&h=400&fit=crop&auto=format",
  Swimming:
    "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=600&h=400&fit=crop&auto=format",
  "Jump Rope":
    "https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?w=600&h=400&fit=crop&auto=format",
  Rowing:
    "https://images.unsplash.com/photo-1593079831268-3381b0db4a77?w=600&h=400&fit=crop&auto=format",
  "Treadmill":
    "https://images.unsplash.com/photo-1576678927484-cc907957088c?w=600&h=400&fit=crop&auto=format",
  "Elliptical":
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

// Fallback images by exercise category
const categoryFallbacks: Record<string, string> = {
  strength:
    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=400&fit=crop&auto=format",
  cardio:
    "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=600&h=400&fit=crop&auto=format",
  flexibility:
    "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=400&fit=crop&auto=format",
  default:
    "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&h=400&fit=crop&auto=format",
}

/**
 * Get exercise image URL by name
 * @param exerciseName - The name of the exercise
 * @param category - Optional category for better fallback
 * @returns The image URL
 */
export function getExerciseImage(exerciseName: string, category?: string): string {
  // Try exact match first
  const imageUrl = EXERCISE_IMAGES[exerciseName]
  if (imageUrl) {
    return imageUrl
  }

  // Try partial match
  const partialMatch = Object.keys(EXERCISE_IMAGES).find(
    (key) =>
      key.toLowerCase().includes(exerciseName.toLowerCase()) ||
      exerciseName.toLowerCase().includes(key.toLowerCase())
  )
  if (partialMatch) {
    return EXERCISE_IMAGES[partialMatch]
  }

  // Return category-based fallback or default
  if (category) {
    return categoryFallbacks[category.toLowerCase()] || categoryFallbacks.default
  }

  return categoryFallbacks.default
}

/**
 * Check if an exercise has a specific image
 * @param exerciseName - The name of the exercise
 * @returns true if specific image exists
 */
export function hasExerciseImage(exerciseName: string): boolean {
  return exerciseName in EXERCISE_IMAGES
}
