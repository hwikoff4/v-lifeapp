"use server"

import { revalidatePath } from "next/cache"
import { createClient, getAuthUser } from "@/lib/supabase/server"

const PLAN_PRICING: Record<string, { price: number; billingCycle: "monthly" | "yearly" }> = {
  free: { price: 0, billingCycle: "monthly" },
  pro: { price: 29.99, billingCycle: "monthly" },
  elite: { price: 49.99, billingCycle: "monthly" },
}

async function ensureSubscriptionRecord(userId: string, supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle()

  if (data) return data

  const { data: created } = await supabase
    .from("subscriptions")
    .insert({
      user_id: userId,
      plan: "free",
      status: "active",
      billing_cycle: "monthly",
      price: 0,
      next_billing_date: null,
    })
    .select("*")
    .single()

  return created
}

export async function getSubscription() {
  const { user, error } = await getAuthUser()
  if (error || !user) {
    return null
  }

  const supabase = await createClient()
  const subscription = await ensureSubscriptionRecord(user.id, supabase)
  return subscription
}

export async function changeSubscriptionPlan(plan: "free" | "pro" | "elite") {
  const { user, error } = await getAuthUser()
  if (error || !user) {
    return { success: false, error: "Not authenticated" }
  }
  const pricing = PLAN_PRICING[plan]
  if (!pricing) {
    return { success: false, error: "Unknown plan" }
  }

  const supabase = await createClient()
  await ensureSubscriptionRecord(user.id, supabase)

  const nextBilling =
    pricing.price === 0
      ? null
      : (() => {
          const date = new Date()
          date.setMonth(date.getMonth() + 1)
          return date.toISOString().split("T")[0]
        })()

  const { error: updateError } = await supabase
    .from("subscriptions")
    .update({
      plan,
      billing_cycle: pricing.billingCycle,
      price: pricing.price,
      status: "active",
      next_billing_date: nextBilling,
    })
    .eq("user_id", user.id)

  if (updateError) {
    console.error("[Subscription] Failed to change plan:", updateError)
    return { success: false, error: "Unable to change plan" }
  }

  revalidatePath("/settings")
  return { success: true }
}

export async function cancelSubscription() {
  const { user, error } = await getAuthUser()
  if (error || !user) {
    return { success: false, error: "Not authenticated" }
  }

  const supabase = await createClient()
  const { error: updateError } = await supabase
    .from("subscriptions")
    .update({
      status: "cancelled",
      next_billing_date: null,
    })
    .eq("user_id", user.id)

  if (updateError) {
    console.error("[Subscription] Failed to cancel:", updateError)
    return { success: false, error: "Unable to cancel subscription" }
  }

  revalidatePath("/settings")
  return { success: true }
}

