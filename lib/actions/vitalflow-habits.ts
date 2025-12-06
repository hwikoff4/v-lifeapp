"use server"

import { createClient } from "@/lib/supabase/server"

export interface VitalFlowSuggestion {
  id: string
  user_id: string
  date: string
  habit_template_id?: string
  knowledge_id?: string
  title: string
  reason: string
  category: 'movement' | 'nutrition' | 'sleep' | 'mindset' | 'recovery' | 'hydration'
  source: 'ai' | 'template' | 'manual'
  energy_delta_kcal: number
  time_minutes: number
  tags: string[]
  rank: number
  status: 'suggested' | 'accepted' | 'skipped' | 'completed' | 'failed'
  skip_reason?: string
  completion_ratio: number
  completed_at?: string
  metadata: any
  created_at: string
  updated_at: string
}

/**
 * Get VitalFlow Daily Habit suggestions for a specific date
 */
export async function getVitalFlowSuggestions(date?: string) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { suggestions: null, error: "Not authenticated" }
    }

    const targetDate = date || new Date().toISOString().split('T')[0]

    // First, try to get from database
    const { data, error } = await supabase
      .from('daily_habit_suggestions')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', targetDate)
      .order('rank', { ascending: true })

    if (error) {
      console.error("[VitalFlow] Error fetching suggestions:", error)
      return { suggestions: null, error: error.message }
    }

    return { suggestions: data as VitalFlowSuggestion[], error: null }
  } catch (error) {
    console.error("[VitalFlow] Exception:", error)
    return { suggestions: null, error: "Failed to fetch suggestions" }
  }
}

/**
 * Generate new VitalFlow suggestions by calling the Edge Function
 */
export async function generateVitalFlowSuggestions(context?: string, regenerate = false) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { suggestions: null, error: "Not authenticated" }
    }

    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) {
      return { suggestions: null, error: "No session token" }
    }

    // Call the Edge Function
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/vitalflow-daily-habits`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          context: context || "It's a regular day.",
          regenerate,
        }),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[VitalFlow] Edge Function error:", errorText)
      return { suggestions: null, error: "Failed to generate suggestions" }
    }

    const result = await response.json()
    return { suggestions: result.suggestions as VitalFlowSuggestion[], error: null, cached: result.cached }
  } catch (error) {
    console.error("[VitalFlow] Exception:", error)
    return { suggestions: null, error: "Failed to generate suggestions" }
  }
}

/**
 * Update suggestion status (accept, skip, complete)
 */
export async function updateSuggestionStatus(
  suggestionId: string,
  status: 'accepted' | 'skipped' | 'completed' | 'failed',
  skipReason?: string,
  completionRatio?: number
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: "Not authenticated" }
    }

    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    }

    if (status === 'skipped' && skipReason) {
      updateData.skip_reason = skipReason
    }

    if (status === 'completed') {
      updateData.completed_at = new Date().toISOString()
      updateData.completion_ratio = completionRatio || 1.0
    }

    const { error } = await supabase
      .from('daily_habit_suggestions')
      .update(updateData)
      .eq('id', suggestionId)
      .eq('user_id', user.id)

    if (error) {
      console.error("[VitalFlow] Error updating suggestion:", error)
      return { success: false, error: error.message }
    }

    return { success: true, error: null }
  } catch (error) {
    console.error("[VitalFlow] Exception:", error)
    return { success: false, error: "Failed to update suggestion" }
  }
}

/**
 * Log a habit event (for learning and personalization)
 */
export async function logHabitEvent(
  suggestionId: string,
  status: 'completed' | 'partial' | 'failed' | 'skipped',
  completionRatio = 1.0,
  actualTimeMinutes?: number,
  actualEnergyDelta?: number,
  notes?: string,
  contextJson?: any
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: "Not authenticated" }
    }

    // Get the suggestion to extract template info
    const { data: suggestion } = await supabase
      .from('daily_habit_suggestions')
      .select('habit_template_id, date')
      .eq('id', suggestionId)
      .single()

    const { error } = await supabase
      .from('habit_events')
      .insert({
        user_id: user.id,
        suggestion_id: suggestionId,
        habit_template_id: suggestion?.habit_template_id,
        date: suggestion?.date || new Date().toISOString().split('T')[0],
        status,
        completion_ratio: completionRatio,
        actual_time_minutes: actualTimeMinutes,
        actual_energy_delta_kcal: actualEnergyDelta,
        context_json: contextJson || {},
        notes,
      })

    if (error) {
      console.error("[VitalFlow] Error logging event:", error)
      return { success: false, error: error.message }
    }

    return { success: true, error: null }
  } catch (error) {
    console.error("[VitalFlow] Exception:", error)
    return { success: false, error: "Failed to log event" }
  }
}

/**
 * Get today's total energy delta from accepted habits
 */
export async function getTodaysEnergyDelta(date?: string) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { energyDelta: 0, error: "Not authenticated" }
    }

    const targetDate = date || new Date().toISOString().split('T')[0]

    const { data, error } = await supabase.rpc('get_todays_habit_energy_delta', {
      p_user_id: user.id,
      p_date: targetDate,
    })

    if (error) {
      console.error("[VitalFlow] Error fetching energy delta:", error)
      return { energyDelta: 0, error: error.message }
    }

    return { energyDelta: data || 0, error: null }
  } catch (error) {
    console.error("[VitalFlow] Exception:", error)
    return { energyDelta: 0, error: "Failed to fetch energy delta" }
  }
}

/**
 * Create a manual daily habit (user-created custom habit)
 */
export async function createManualVitalFlowHabit(
  title: string,
  category: 'movement' | 'nutrition' | 'sleep' | 'mindset' | 'recovery' | 'hydration',
  timeMinutes: number,
  energyDeltaKcal: number = 0,
  reason?: string,
  tags?: string[]
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { suggestion: null, error: "Not authenticated" }
    }

    const today = new Date().toISOString().split('T')[0]

    // Get the max rank for today to add this as the last item
    const { data: existingSuggestions } = await supabase
      .from('daily_habit_suggestions')
      .select('rank')
      .eq('user_id', user.id)
      .eq('date', today)
      .order('rank', { ascending: false })
      .limit(1)

    const nextRank = existingSuggestions && existingSuggestions.length > 0 
      ? existingSuggestions[0].rank + 1 
      : 1

    const { data, error } = await supabase
      .from('daily_habit_suggestions')
      .insert({
        user_id: user.id,
        date: today,
        title,
        reason: reason || `Custom habit: ${title}`,
        category,
        source: 'manual',
        energy_delta_kcal: energyDeltaKcal,
        time_minutes: timeMinutes,
        tags: tags || [],
        rank: nextRank,
        status: 'accepted', // Manual habits are immediately accepted
        metadata: { is_custom: true },
      })
      .select()
      .single()

    if (error) {
      console.error("[VitalFlow] Error creating manual habit:", error)
      return { suggestion: null, error: error.message }
    }

    return { suggestion: data as VitalFlowSuggestion, error: null }
  } catch (error) {
    console.error("[VitalFlow] Exception:", error)
    return { suggestion: null, error: "Failed to create manual habit" }
  }
}

