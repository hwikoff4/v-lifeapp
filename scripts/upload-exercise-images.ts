/**
 * Script to upload exercise images to Supabase Storage
 *
 * This script uploads the provided exercise images to Supabase Storage
 * and returns the public URLs for use in the app.
 */

import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Exercise image mappings - blob URLs to exercise names
const exerciseImages = [
  {
    name: "jump-rope",
    displayName: "Jump Rope",
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/jump%20rope-l93HUuqpLPGXNLBGmc9zxEvKcFZpdo.png",
    type: "cardio",
  },
  {
    name: "bicep-curls",
    displayName: "Bicep Curls",
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/bicep%20curl-ennJqdM578PuusWpZnj1CtEVLeg3Q3.png",
    type: "strength",
  },
  {
    name: "bench-press",
    displayName: "Bench Press",
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/bench%20press-rTYnM7g7TD8SblHD5TBQIQWvl83MHR.png",
    type: "strength",
  },
  {
    name: "cycling",
    displayName: "Cycling",
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/cycling-yuIqRL6XWCE4oucD5evmgWB1MOBDMX.png",
    type: "cardio",
  },
  {
    name: "swimming",
    displayName: "Swimming",
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/swimming-ta28QJe30PnZuXKRviFwWqqnaCYLTy.png",
    type: "cardio",
  },
  {
    name: "squats",
    displayName: "Squats",
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/squat-G650MLtSkdToQl53vSZMFaMMaKXbUP.png",
    type: "strength",
  },
  {
    name: "deadlift",
    displayName: "Deadlift",
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/deadlift-3eqEGjWP3sol62MsIUxzTXdLfw3mRU.png",
    type: "strength",
  },
  {
    name: "running",
    displayName: "Running",
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/running-42rTvcDK4acqBGNqsKCIY6ZpMv25Ht.png",
    type: "cardio",
  },
  {
    name: "push-ups",
    displayName: "Push-Ups",
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/push%20up-xavg9CCjMGiwyU7gP5g9yUqtLLkmOQ.png",
    type: "strength",
  },
]

async function uploadExerciseImages() {
  console.log("Starting exercise image upload...")

  const results = []

  for (const exercise of exerciseImages) {
    try {
      console.log(`Fetching ${exercise.displayName}...`)

      // Fetch the image from blob URL
      const response = await fetch(exercise.url)
      const blob = await response.blob()
      const arrayBuffer = await blob.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      // Upload to Supabase Storage
      const filePath = `${exercise.name}.png`
      const { data, error } = await supabase.storage.from("exercise-images").upload(filePath, buffer, {
        contentType: "image/png",
        upsert: true,
      })

      if (error) {
        console.error(`Error uploading ${exercise.displayName}:`, error)
        continue
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage.from("exercise-images").getPublicUrl(filePath)

      results.push({
        name: exercise.displayName,
        slug: exercise.name,
        type: exercise.type,
        publicUrl: publicUrlData.publicUrl,
      })

      console.log(`✓ Uploaded ${exercise.displayName}`)
    } catch (err) {
      console.error(`Failed to process ${exercise.displayName}:`, err)
    }
  }

  console.log("\n=== Upload Complete ===")
  console.log("Exercise Image URLs:")
  results.forEach((result) => {
    console.log(`${result.name}: ${result.publicUrl}`)
  })

  return results
}

// Run the upload
uploadExerciseImages()
  .then(() => {
    console.log("\nAll images uploaded successfully!")
    process.exit(0)
  })
  .catch((err) => {
    console.error("Upload failed:", err)
    process.exit(1)
  })
