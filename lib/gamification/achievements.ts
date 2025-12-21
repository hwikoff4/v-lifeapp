/**
 * Achievement System for V-Life Gamification
 */

export interface Achievement {
  id: string
  slug: string
  name: string
  description: string | null
  icon: string
  category: 'streak' | 'workout' | 'nutrition' | 'level' | 'special'
  xpReward: number
  sortOrder: number
}

export interface UserAchievement {
  id: string
  achievementId: string
  unlockedAt: string
  achievement: Achievement
}

// Achievement category colors for UI
export const ACHIEVEMENT_CATEGORY_COLORS: Record<Achievement['category'], string> = {
  streak: 'from-orange-500/20 to-red-500/20 border-orange-500/30',
  workout: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
  nutrition: 'from-green-500/20 to-emerald-500/20 border-green-500/30',
  level: 'from-purple-500/20 to-pink-500/20 border-purple-500/30',
  special: 'from-yellow-500/20 to-amber-500/20 border-yellow-500/30',
}

// Achievement category icons
export const ACHIEVEMENT_CATEGORY_ICONS: Record<Achievement['category'], string> = {
  streak: '🔥',
  workout: '💪',
  nutrition: '🥗',
  level: '⭐',
  special: '✨',
}

/**
 * Check if an achievement should be unlocked based on user stats
 */
export interface AchievementCheckContext {
  overallStreak: number
  totalWorkouts: number
  totalMealsLogged: number
  totalMissionsComplete: number
  currentLevel: number
  macroStreakDays: number
  hasCompletedAllMissionsToday: boolean
  currentHour: number // 0-23
}

// Achievement unlock conditions
export const ACHIEVEMENT_CONDITIONS: Record<string, (ctx: AchievementCheckContext) => boolean> = {
  // Streak achievements
  streak_3: (ctx) => ctx.overallStreak >= 3,
  streak_7: (ctx) => ctx.overallStreak >= 7,
  streak_14: (ctx) => ctx.overallStreak >= 14,
  streak_30: (ctx) => ctx.overallStreak >= 30,
  streak_100: (ctx) => ctx.overallStreak >= 100,
  
  // Workout achievements
  first_workout: (ctx) => ctx.totalWorkouts >= 1,
  workout_10: (ctx) => ctx.totalWorkouts >= 10,
  workout_50: (ctx) => ctx.totalWorkouts >= 50,
  workout_100: (ctx) => ctx.totalWorkouts >= 100,
  
  // Nutrition achievements
  first_meal_log: (ctx) => ctx.totalMealsLogged >= 1,
  macro_streak_7: (ctx) => ctx.macroStreakDays >= 7,
  meals_logged_100: (ctx) => ctx.totalMealsLogged >= 100,
  
  // Level achievements
  level_5: (ctx) => ctx.currentLevel >= 5,
  level_10: (ctx) => ctx.currentLevel >= 10,
  level_25: (ctx) => ctx.currentLevel >= 25,
  level_50: (ctx) => ctx.currentLevel >= 50,
  
  // Mission achievements
  first_mission: (ctx) => ctx.totalMissionsComplete >= 1,
  missions_10: (ctx) => ctx.totalMissionsComplete >= 10,
  missions_50: (ctx) => ctx.totalMissionsComplete >= 50,
  perfect_day: (ctx) => ctx.hasCompletedAllMissionsToday,
  
  // Special achievements
  early_bird: (ctx) => ctx.currentHour < 7 && ctx.totalMissionsComplete > 0,
  night_owl: (ctx) => ctx.currentHour >= 21 && ctx.totalWorkouts > 0,
}

/**
 * Get achievements that should be checked for unlock
 */
export function getUnlockableAchievements(
  allAchievements: Achievement[],
  unlockedSlugs: Set<string>,
  context: AchievementCheckContext
): Achievement[] {
  return allAchievements.filter(achievement => {
    // Skip already unlocked
    if (unlockedSlugs.has(achievement.slug)) return false
    
    // Check if condition is met
    const condition = ACHIEVEMENT_CONDITIONS[achievement.slug]
    if (!condition) return false
    
    return condition(context)
  })
}
