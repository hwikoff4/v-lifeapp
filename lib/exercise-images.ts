/**
 * Exercise image mappings
 *
 * Maps exercise names to their Supabase Storage URLs
 * Images are stored in the 'exercise-images' bucket
 */

// Helper to get Supabase URL that works on both client and server
const getSupabaseUrl = () => {
  if (typeof window !== "undefined") {
    // Client-side: use the public env var that's available in the browser
    return process.env.NEXT_PUBLIC_SUPABASE_URL
  }
  // Server-side
  return process.env.NEXT_PUBLIC_SUPABASE_URL
}

const STORAGE_BUCKET = "exercise-images"

// Helper to get Supabase storage URL
const getStorageUrl = (filename: string) => {
  const supabaseUrl = getSupabaseUrl()
  if (!supabaseUrl) {
    console.error("[v0] NEXT_PUBLIC_SUPABASE_URL is not defined")
    return `/placeholder.svg?height=200&width=400&query=${encodeURIComponent(filename)}`
  }
  return `${supabaseUrl}/storage/v1/object/public/${STORAGE_BUCKET}/${filename}`
}

export const EXERCISE_IMAGES: Record<string, string> = {
  // Strength exercises - using actual blob URLs from the upload script
  "Bench Press":
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/bench%20press-rTYnM7g7TD8SblHD5TBQIQWvl83MHR.png",
  "Bicep Curls":
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/bicep%20curl-ennJqdM578PuusWpZnj1CtEVLeg3Q3.png",
  Squats: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/squat-G650MLtSkdToQl53vSZMFaMMaKXbUP.png",
  Squat: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/squat-G650MLtSkdToQl53vSZMFaMMaKXbUP.png",
  Deadlift: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/deadlift-3eqEGjWP3sol62MsIUxzTXdLfw3mRU.png",
  "Push-Ups": "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/push%20up-xavg9CCjMGiwyU7gP5g9yUqtLLkmOQ.png",
  "Push Ups": "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/push%20up-xavg9CCjMGiwyU7gP5g9yUqtLLkmOQ.png",
  "Pull-Ups": "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/push%20up-xavg9CCjMGiwyU7gP5g9yUqtLLkmOQ.png", // Using push-ups temporarily
  "Shoulder Press":
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/bench%20press-rTYnM7g7TD8SblHD5TBQIQWvl83MHR.png", // Using bench press as fallback
  "Tricep Extensions":
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/bicep%20curl-ennJqdM578PuusWpZnj1CtEVLeg3Q3.png", // Using bicep curls as fallback

  // Cardio exercises
  Running: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/running-42rTvcDK4acqBGNqsKCIY6ZpMv25Ht.png",
  Cycling: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/cycling-yuIqRL6XWCE4oucD5evmgWB1MOBDMX.png",
  Swimming: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/swimming-ta28QJe30PnZuXKRviFwWqqnaCYLTy.png",
  "Jump Rope": "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/jump%20rope-l93HUuqpLPGXNLBGmc9zxEvKcFZpdo.png",
  Rowing: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/cycling-yuIqRL6XWCE4oucD5evmgWB1MOBDMX.png", // Using cycling as fallback
}

/**
 * Get exercise image URL by name
 * Falls back to a generic placeholder if not found
 */
export function getExerciseImage(exerciseName: string): string {
  const imageUrl = EXERCISE_IMAGES[exerciseName]

  if (imageUrl) {
    console.log(`[v0] Loading image for ${exerciseName}: ${imageUrl}`)
    return imageUrl
  }

  console.warn(`[v0] No image found for exercise: ${exerciseName}, using placeholder`)
  return `/placeholder.svg?height=200&width=400&query=${encodeURIComponent(exerciseName + " exercise")}`
}
