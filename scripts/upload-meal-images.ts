import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Meal images mapping - blob URLs to meal names
const mealImages = [
  {
    name: "oatmeal",
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/oatmeal-aBEnOcP2pmkNqB50runN2mCqVp6sGD.png",
    fileName: "protein-oatmeal-bowl.png",
  },
  {
    name: "chicken-salad",
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/chicken-EOf0tIMETg0YJiDKnItJKo3vVEPYVf.png",
    fileName: "grilled-chicken-salad.png",
  },
  {
    name: "salmon",
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/salmon-y2hzCRkhKqCV8EaySiPuK6gvvYBHJ6.png",
    fileName: "salmon-with-vegetables.png",
  },
  {
    name: "yogurt",
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/yogurt-jL7Y0YtG0Ud3OdYT7Gne2YvF9Qvh6K.png",
    fileName: "greek-yogurt-berries.png",
  },
]

async function uploadMealImages() {
  console.log("Starting meal image upload...")

  for (const meal of mealImages) {
    try {
      console.log(`Fetching ${meal.name} from blob storage...`)

      // Fetch the image from blob storage
      const response = await fetch(meal.url)
      if (!response.ok) {
        throw new Error(`Failed to fetch ${meal.name}: ${response.statusText}`)
      }

      const imageBlob = await response.blob()
      const arrayBuffer = await imageBlob.arrayBuffer()

      console.log(`Uploading ${meal.name} to Supabase Storage...`)

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage.from("meal-images").upload(meal.fileName, arrayBuffer, {
        contentType: "image/png",
        upsert: true,
      })

      if (error) {
        console.error(`Error uploading ${meal.name}:`, error)
        continue
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("meal-images").getPublicUrl(meal.fileName)

      console.log(`✓ Uploaded ${meal.name}: ${publicUrl}`)
    } catch (error) {
      console.error(`Failed to process ${meal.name}:`, error)
    }
  }

  console.log("Meal image upload complete!")
}

uploadMealImages()
