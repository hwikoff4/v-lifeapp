"use server"

import { revalidatePath } from "next/cache"
import { createClient, getAuthUser } from "@/lib/supabase/server"

interface GroceryItemSeed {
  name: string
  category: string
  quantity?: string
}

const DEFAULT_ITEMS: GroceryItemSeed[] = [
  { name: "Chicken Breast", category: "Proteins", quantity: "2 lbs" },
  { name: "Salmon Fillets", category: "Proteins", quantity: "1 lb" },
  { name: "Greek Yogurt", category: "Proteins", quantity: "32 oz" },
  { name: "Eggs", category: "Proteins", quantity: "1 dozen" },
  { name: "Protein Powder", category: "Proteins", quantity: "1 container" },
  { name: "Oats", category: "Carbohydrates", quantity: "1 container" },
  { name: "Brown Rice", category: "Carbohydrates", quantity: "2 lbs" },
  { name: "Sweet Potatoes", category: "Carbohydrates", quantity: "3 lbs" },
  { name: "Quinoa", category: "Carbohydrates", quantity: "1 lb" },
  { name: "Broccoli", category: "Vegetables", quantity: "2 heads" },
  { name: "Spinach", category: "Vegetables", quantity: "1 bag" },
  { name: "Bell Peppers", category: "Vegetables", quantity: "4 pieces" },
  { name: "Carrots", category: "Vegetables", quantity: "2 lbs" },
  { name: "Cucumber", category: "Vegetables", quantity: "2 pieces" },
  { name: "Blueberries", category: "Fruits", quantity: "1 container" },
  { name: "Bananas", category: "Fruits", quantity: "6 pieces" },
  { name: "Apples", category: "Fruits", quantity: "6 pieces" },
  { name: "Avocados", category: "Fruits", quantity: "4 pieces" },
  { name: "Olive Oil", category: "Healthy Fats", quantity: "1 bottle" },
  { name: "Almonds", category: "Healthy Fats", quantity: "1 bag" },
  { name: "Chia Seeds", category: "Healthy Fats", quantity: "1 bag" },
  { name: "Coconut Milk", category: "Pantry Items", quantity: "2 cans" },
  { name: "Black Beans", category: "Pantry Items", quantity: "2 cans" },
  { name: "Whole Grain Bread", category: "Pantry Items", quantity: "1 loaf" },
]

async function ensureDefaults(userId: string, supabase: Awaited<ReturnType<typeof createClient>>) {
  const { count } = await supabase
    .from("grocery_lists")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)

  if (!count || count === 0) {
    await supabase.from("grocery_lists").insert(
      DEFAULT_ITEMS.map((item) => ({
        user_id: userId,
        item_name: item.name,
        category: item.category,
        quantity: item.quantity,
      })),
    )
  }
}

export async function getGroceryItems() {
  const { user, error } = await getAuthUser()
  if (error || !user) {
    return []
  }

  const supabase = await createClient()
  await ensureDefaults(user.id, supabase)

  const { data } = await supabase
    .from("grocery_lists")
    .select("*")
    .eq("user_id", user.id)
    .order("category", { ascending: true })
    .order("created_at", { ascending: true })

  return data || []
}

export async function toggleGroceryItem(itemId: string, checked: boolean) {
  const { user, error } = await getAuthUser()
  if (error || !user) {
    return { success: false, error: "Not authenticated" }
  }

  const supabase = await createClient()
  const { error: updateError } = await supabase
    .from("grocery_lists")
    .update({ checked })
    .eq("id", itemId)
    .eq("user_id", user.id)

  if (updateError) {
    console.error("[Grocery] Failed to toggle item:", updateError)
    return { success: false, error: "Unable to update item" }
  }

  revalidatePath("/grocery-list")
  return { success: true }
}

export async function addGroceryItem(name: string, category: string) {
  const { user, error } = await getAuthUser()
  if (error || !user) {
    return { success: false, error: "Not authenticated" }
  }

  if (!name.trim()) {
    return { success: false, error: "Item name is required" }
  }

  const supabase = await createClient()
  const { error: insertError } = await supabase.from("grocery_lists").insert({
    user_id: user.id,
    item_name: name.trim(),
    category,
    checked: false,
  })

  if (insertError) {
    console.error("[Grocery] Failed to add item:", insertError)
    return { success: false, error: "Unable to add grocery item" }
  }

  revalidatePath("/grocery-list")
  return { success: true }
}

export async function removeGroceryItem(itemId: string) {
  const { user, error } = await getAuthUser()
  if (error || !user) {
    return { success: false, error: "Not authenticated" }
  }

  const supabase = await createClient()
  const { error: deleteError } = await supabase
    .from("grocery_lists")
    .delete()
    .eq("id", itemId)
    .eq("user_id", user.id)

  if (deleteError) {
    console.error("[Grocery] Failed to remove item:", deleteError)
    return { success: false, error: "Unable to remove grocery item" }
  }

  revalidatePath("/grocery-list")
  return { success: true }
}

export async function clearCompletedItems() {
  const { user, error } = await getAuthUser()
  if (error || !user) {
    return { success: false, error: "Not authenticated" }
  }

  const supabase = await createClient()
  const { error: deleteError } = await supabase
    .from("grocery_lists")
    .delete()
    .eq("user_id", user.id)
    .eq("checked", true)

  if (deleteError) {
    console.error("[Grocery] Failed to clear items:", deleteError)
    return { success: false, error: "Unable to clear completed items" }
  }

  revalidatePath("/grocery-list")
  return { success: true }
}

