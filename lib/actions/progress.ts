"use server"

import { revalidatePath } from "next/cache"
import { createClient, getAuthUser } from "@/lib/supabase/server"
import type { ProgressPhoto, WeightEntry } from "@/lib/types"

const DEFAULT_WEIGHT_LIMIT = 120
const DEFAULT_PHOTO_LIMIT = 18

export async function getWeightEntries(limit = DEFAULT_WEIGHT_LIMIT): Promise<{
  entries: WeightEntry[]
  latest?: WeightEntry
}> {
  const { user, error } = await getAuthUser()
  if (error || !user) {
    return { entries: [] }
  }

  const supabase = await createClient()
  const { data, error: fetchError } = await supabase
    .from("weight_entries")
    .select("*")
    .eq("user_id", user.id)
    .order("logged_at", { ascending: true })
    .limit(limit)

  if (fetchError || !data) {
    console.error("[Progress] Failed to load weight entries:", fetchError)
    return { entries: [] }
  }

  return { entries: data as WeightEntry[], latest: data[data.length - 1] }
}

export async function addWeightEntry(weight: number, note?: string) {
  const { user, error } = await getAuthUser()
  if (error || !user) {
    return { success: false, error: "Not authenticated" }
  }

  if (!weight || weight <= 0) {
    return { success: false, error: "Enter a valid weight" }
  }

  const supabase = await createClient()

  const { data: lastEntry } = await supabase
    .from("weight_entries")
    .select("weight")
    .eq("user_id", user.id)
    .order("logged_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  const change =
    lastEntry?.weight !== undefined
      ? Number((weight - Number(lastEntry.weight)).toFixed(1))
      : null

  const loggedAt = new Date().toISOString().split("T")[0]

  const { error: insertError } = await supabase.from("weight_entries").insert({
    user_id: user.id,
    weight,
    change,
    note: note?.trim() || null,
    logged_at: loggedAt,
  })

  if (insertError) {
    console.error("[Progress] Failed to create weight entry:", insertError)
    return { success: false, error: "Unable to save weight entry" }
  }

  // Award XP for logging weight
  try {
    const { addXP } = await import("@/lib/actions/gamification")
    await addXP('weight_logged', undefined, 'weight_entry')
  } catch (xpError) {
    console.error("[Progress] Failed to award XP:", xpError)
  }

  revalidatePath("/tools")
  return { success: true }
}

export async function getProgressPhotos(limit = DEFAULT_PHOTO_LIMIT): Promise<{
  photos: ProgressPhoto[]
}> {
  const { user, error } = await getAuthUser()
  if (error || !user) {
    return { photos: [] }
  }

  const supabase = await createClient()
  const { data, error: fetchError } = await supabase
    .from("progress_photos")
    .select("*")
    .eq("user_id", user.id)
    .order("taken_at", { ascending: false })
    .limit(limit)

  if (fetchError || !data) {
    console.error("[Progress] Failed to load photos:", fetchError)
    return { photos: [] }
  }

  return { photos: data as ProgressPhoto[] }
}

interface CreateProgressPhotoInput {
  imageUrl: string
  photoType: "front" | "side" | "back" | "custom"
  weight?: number
  note?: string
  takenAt?: string
}

export async function createProgressPhoto(input: CreateProgressPhotoInput) {
  const { user, error } = await getAuthUser()
  if (error || !user) {
    return { success: false, error: "Not authenticated" }
  }

  if (!input.imageUrl) {
    return { success: false, error: "Missing image" }
  }

  const supabase = await createClient()
  const { error: insertError } = await supabase.from("progress_photos").insert({
    user_id: user.id,
    image_url: input.imageUrl,
    photo_type: input.photoType,
    weight: input.weight ?? null,
    note: input.note?.trim() || null,
    taken_at: input.takenAt || new Date().toISOString().split("T")[0],
  })

  if (insertError) {
    console.error("[Progress] Failed to save progress photo:", insertError)
    return { success: false, error: "Unable to save progress photo" }
  }

  revalidatePath("/tools")
  return { success: true }
}

export async function deleteProgressPhoto(photoId: string) {
  const { user, error } = await getAuthUser()
  if (error || !user) {
    return { success: false, error: "Not authenticated" }
  }

  const supabase = await createClient()
  const { error: deleteError } = await supabase
    .from("progress_photos")
    .delete()
    .eq("id", photoId)
    .eq("user_id", user.id)

  if (deleteError) {
    console.error("[Progress] Failed to delete progress photo:", deleteError)
    return { success: false, error: "Unable to delete progress photo" }
  }

  revalidatePath("/tools")
  return { success: true }
}

