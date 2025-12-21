"use server"

/**
 * Server Actions for Gamification System
 */

import { createClient, getAuthUser } from "@/lib/supabase/server"
import { XP_REWARDS, type XPEventType, buildGamificationStats, type GamificationStats } from "@/lib/gamification"
import type { Achievement, UserAchievement } from "@/lib/gamification/achievements"

// Response types
interface AddXPResult {
  success: boolean
  newXpTotal?: number
  newLevel?: number
  leveledUp?: boolean
  error?: string
}

interface GamificationDataResult {
  stats: GamificationStats | null
  achievements: UserAchievement[]
  allAchievements: Achievement[]
  todayXP: number
  error?: string
}

/**
 * Add XP to user's profile
 */
export async function addXP(
  eventType: XPEventType,
  sourceId?: string,
  sourceType?: string,
  customXP?: number,
  metadata?: Record<string, unknown>
): Promise<AddXPResult> {
  try {
    const { user, error: authError } = await getAuthUser()
    if (authError || !user) {
      return { success: false, error: "Not authenticated" }
    }

    const supabase = await createClient()
    const xpAmount = customXP ?? XP_REWARDS[eventType]

    // Call the add_xp function we created in the migration
    const { data, error } = await supabase.rpc('add_xp', {
      p_user_id: user.id,
      p_event_type: eventType,
      p_xp_amount: xpAmount,
      p_source_id: sourceId || null,
      p_source_type: sourceType || null,
      p_metadata: metadata || {}
    })

    if (error) {
      console.error("[Gamification] Error adding XP:", error)
      return { success: false, error: error.message }
    }

    const result = data?.[0]
    return {
      success: true,
      newXpTotal: result?.new_xp_total,
      newLevel: result?.new_level,
      leveledUp: result?.level_up
    }
  } catch (error) {
    console.error("[Gamification] Error adding XP:", error)
    return { success: false, error: "Failed to add XP" }
  }
}

/**
 * Get user's gamification data (for internal use in app-data)
 */
export async function getGamificationDataInternal(
  userId: string,
  supabase: ReturnType<typeof createClient> extends Promise<infer T> ? T : never
): Promise<GamificationDataResult> {
  try {
    // Get profile XP data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('xp_total, current_level')
      .eq('id', userId)
      .single()

    if (profileError) {
      console.error("[Gamification] Error fetching profile:", profileError)
      return { stats: null, achievements: [], allAchievements: [], todayXP: 0, error: profileError.message }
    }

    // Get today's XP (for "XP earned today" display)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const { data: todayEvents, error: todayError } = await supabase
      .from('xp_events')
      .select('xp_amount')
      .eq('user_id', userId)
      .gte('created_at', today.toISOString())

    const todayXP = todayEvents?.reduce((sum, e) => sum + e.xp_amount, 0) || 0

    // Get user's unlocked achievements
    const { data: userAchievements, error: achievementError } = await supabase
      .from('user_achievements')
      .select(`
        id,
        unlocked_at,
        achievement:achievements(
          id,
          slug,
          name,
          description,
          icon,
          category,
          xp_reward,
          sort_order
        )
      `)
      .eq('user_id', userId)
      .order('unlocked_at', { ascending: false })

    // Get all achievements for the carousel
    const { data: allAchievements, error: allAchievementsError } = await supabase
      .from('achievements')
      .select('id, slug, name, description, icon, category, xp_reward, sort_order')
      .order('sort_order', { ascending: true })

    if (achievementError || allAchievementsError) {
      console.error("[Gamification] Error fetching achievements:", achievementError || allAchievementsError)
    }

    // Transform achievements data
    const transformedUserAchievements: UserAchievement[] = (userAchievements || []).map(ua => ({
      id: ua.id,
      achievementId: (ua.achievement as any)?.id,
      unlockedAt: ua.unlocked_at,
      achievement: {
        id: (ua.achievement as any)?.id,
        slug: (ua.achievement as any)?.slug,
        name: (ua.achievement as any)?.name,
        description: (ua.achievement as any)?.description,
        icon: (ua.achievement as any)?.icon,
        category: (ua.achievement as any)?.category,
        xpReward: (ua.achievement as any)?.xp_reward,
        sortOrder: (ua.achievement as any)?.sort_order,
      }
    }))

    const transformedAllAchievements: Achievement[] = (allAchievements || []).map(a => ({
      id: a.id,
      slug: a.slug,
      name: a.name,
      description: a.description,
      icon: a.icon,
      category: a.category as Achievement['category'],
      xpReward: a.xp_reward,
      sortOrder: a.sort_order,
    }))

    // Build stats
    const stats = buildGamificationStats(
      profile?.xp_total || 0,
      todayXP
    )

    return {
      stats,
      achievements: transformedUserAchievements,
      allAchievements: transformedAllAchievements,
      todayXP
    }
  } catch (error) {
    console.error("[Gamification] Error getting gamification data:", error)
    return { stats: null, achievements: [], allAchievements: [], todayXP: 0, error: "Failed to get gamification data" }
  }
}

/**
 * Unlock an achievement for the user
 */
export async function unlockAchievement(achievementSlug: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { user, error: authError } = await getAuthUser()
    if (authError || !user) {
      return { success: false, error: "Not authenticated" }
    }

    const supabase = await createClient()

    // Get achievement by slug
    const { data: achievement, error: achievementError } = await supabase
      .from('achievements')
      .select('id, xp_reward')
      .eq('slug', achievementSlug)
      .single()

    if (achievementError || !achievement) {
      return { success: false, error: "Achievement not found" }
    }

    // Check if already unlocked
    const { data: existing } = await supabase
      .from('user_achievements')
      .select('id')
      .eq('user_id', user.id)
      .eq('achievement_id', achievement.id)
      .single()

    if (existing) {
      return { success: true } // Already unlocked, no error
    }

    // Unlock the achievement
    const { error: insertError } = await supabase
      .from('user_achievements')
      .insert({
        user_id: user.id,
        achievement_id: achievement.id
      })

    if (insertError) {
      return { success: false, error: insertError.message }
    }

    // Award XP if the achievement has a reward
    if (achievement.xp_reward > 0) {
      await addXP('mission_complete', achievement.id, 'achievement', achievement.xp_reward, {
        achievement_slug: achievementSlug
      })
    }

    return { success: true }
  } catch (error) {
    console.error("[Gamification] Error unlocking achievement:", error)
    return { success: false, error: "Failed to unlock achievement" }
  }
}
