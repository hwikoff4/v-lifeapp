/**
 * XP & Leveling System for V-Life Gamification
 * 
 * This module handles XP calculations, level progression, and titles.
 */

// XP rewards for different actions
export const XP_REWARDS = {
  // VitalFlow Missions
  mission_complete: 30,
  mission_complete_bonus: 50, // For high-energy missions
  all_missions_complete: 100, // Daily bonus
  
  // Workouts
  workout_complete: 100,
  workout_streak_7: 200,
  
  // Nutrition & Food Logging
  meal_logged: 10,
  food_logged: 15, // AI food logging
  food_log_streak_3: 50,
  food_log_streak_7: 100,
  full_day_logged: 30, // All 4 meals logged in a day
  macro_goal_hit: 75,
  
  // Weight & Progress
  weight_logged: 25,
  progress_photo: 50,
  
  // Engagement
  weekly_reflection: 100,
  
  // Streak bonuses
  streak_bonus_7: 200,
  streak_bonus_14: 400,
  streak_bonus_30: 1000,
} as const

export type XPEventType = keyof typeof XP_REWARDS

// Level titles based on level ranges
export interface LevelTier {
  minLevel: number
  maxLevel: number
  title: string
  color: string // Tailwind color class
  icon: string
}

export const LEVEL_TIERS: LevelTier[] = [
  { minLevel: 1, maxLevel: 5, title: "Beginner", color: "text-gray-400", icon: "🌱" },
  { minLevel: 6, maxLevel: 10, title: "Rising Star", color: "text-blue-400", icon: "⭐" },
  { minLevel: 11, maxLevel: 20, title: "Champion", color: "text-green-400", icon: "🏅" },
  { minLevel: 21, maxLevel: 35, title: "Wellness Warrior", color: "text-purple-400", icon: "⚔️" },
  { minLevel: 36, maxLevel: 50, title: "V-Life Elite", color: "text-yellow-400", icon: "💎" },
  { minLevel: 51, maxLevel: Infinity, title: "V-Life Legend", color: "text-accent", icon: "👑" },
]

/**
 * Calculate level from total XP
 * Formula: level = floor(sqrt(xp / 100)) + 1
 * 
 * This creates a natural progression curve:
 * - Level 1: 0-99 XP
 * - Level 2: 100-399 XP
 * - Level 3: 400-899 XP
 * - Level 4: 900-1599 XP
 * - Level 5: 1600-2499 XP
 * etc.
 */
export function calculateLevel(totalXP: number): number {
  return Math.floor(Math.sqrt(totalXP / 100)) + 1
}

/**
 * Calculate XP required for a specific level
 */
export function xpForLevel(level: number): number {
  if (level <= 1) return 0
  return Math.pow(level - 1, 2) * 100
}

/**
 * Calculate XP required for the next level
 */
export function xpForNextLevel(currentLevel: number): number {
  return xpForLevel(currentLevel + 1)
}

/**
 * Get progress towards next level (0-100)
 */
export function getLevelProgress(totalXP: number): number {
  const currentLevel = calculateLevel(totalXP)
  const currentLevelXP = xpForLevel(currentLevel)
  const nextLevelXP = xpForLevel(currentLevel + 1)
  const xpIntoCurrentLevel = totalXP - currentLevelXP
  const xpNeededForNextLevel = nextLevelXP - currentLevelXP
  
  if (xpNeededForNextLevel === 0) return 100
  return Math.min(100, Math.round((xpIntoCurrentLevel / xpNeededForNextLevel) * 100))
}

/**
 * Get XP remaining until next level
 */
export function xpUntilNextLevel(totalXP: number): number {
  const currentLevel = calculateLevel(totalXP)
  const nextLevelXP = xpForLevel(currentLevel + 1)
  return Math.max(0, nextLevelXP - totalXP)
}

/**
 * Get the tier information for a given level
 */
export function getLevelTier(level: number): LevelTier {
  return LEVEL_TIERS.find(tier => level >= tier.minLevel && level <= tier.maxLevel) || LEVEL_TIERS[0]
}

/**
 * Get user's title based on their level
 */
export function getUserTitle(level: number): string {
  return getLevelTier(level).title
}

/**
 * Format XP for display (e.g., 1500 -> "1.5K")
 */
export function formatXP(xp: number): string {
  if (xp >= 10000) {
    return `${(xp / 1000).toFixed(1)}K`
  }
  if (xp >= 1000) {
    return `${(xp / 1000).toFixed(1)}K`
  }
  return xp.toString()
}

/**
 * Calculate streak bonus XP
 */
export function getStreakBonus(streakDays: number): number {
  if (streakDays >= 30) return XP_REWARDS.streak_bonus_30
  if (streakDays >= 14) return XP_REWARDS.streak_bonus_14
  if (streakDays >= 7) return XP_REWARDS.streak_bonus_7
  return 0
}

/**
 * Gamification stats for display
 */
export interface GamificationStats {
  xpTotal: number
  currentLevel: number
  levelProgress: number // 0-100
  xpUntilNext: number
  title: string
  tier: LevelTier
  todayXP: number
}

/**
 * Build gamification stats from raw data
 */
export function buildGamificationStats(
  xpTotal: number,
  todayXP: number = 0
): GamificationStats {
  const currentLevel = calculateLevel(xpTotal)
  const tier = getLevelTier(currentLevel)
  
  return {
    xpTotal,
    currentLevel,
    levelProgress: getLevelProgress(xpTotal),
    xpUntilNext: xpUntilNextLevel(xpTotal),
    title: tier.title,
    tier,
    todayXP,
  }
}
