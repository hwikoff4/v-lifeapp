-- ============================================
-- Gamification System: XP, Levels, and Achievements
-- ============================================

-- Add XP and level columns to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS xp_total INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS current_level INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS xp_last_calculated_at TIMESTAMPTZ DEFAULT NOW();

-- Create XP events table to track how XP was earned
CREATE TABLE IF NOT EXISTS xp_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'mission_complete', 'workout_complete', 'macro_goal', 'weight_log', 'streak_bonus', 'reflection'
  xp_amount INTEGER NOT NULL,
  source_id UUID, -- Optional reference to the source (habit_id, workout_id, etc.)
  source_type TEXT, -- 'vitalflow_suggestion', 'workout', 'meal', 'habit', 'weight_entry'
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL, -- 'first_workout', 'week_streak', 'level_10', etc.
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT NOT NULL, -- emoji or icon name
  category TEXT NOT NULL, -- 'streak', 'workout', 'nutrition', 'level', 'special'
  xp_reward INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_achievements junction table
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_xp_events_user_id ON xp_events(user_id);
CREATE INDEX IF NOT EXISTS idx_xp_events_created_at ON xp_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_xp_events_event_type ON xp_events(event_type);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);

-- Enable RLS
ALTER TABLE xp_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for xp_events
CREATE POLICY "Users can view own XP events"
  ON xp_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own XP events"
  ON xp_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for achievements (readable by all authenticated users)
CREATE POLICY "Authenticated users can view achievements"
  ON achievements FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for user_achievements
CREATE POLICY "Users can view own achievements"
  ON user_achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can unlock own achievements"
  ON user_achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- Seed initial achievements
-- ============================================
INSERT INTO achievements (slug, name, description, icon, category, xp_reward, sort_order) VALUES
  -- Streak achievements
  ('streak_3', '3-Day Streak', 'Maintain a 3-day activity streak', '🔥', 'streak', 50, 1),
  ('streak_7', 'Week Warrior', 'Maintain a 7-day activity streak', '⚡', 'streak', 100, 2),
  ('streak_14', 'Fortnight Fighter', 'Maintain a 14-day activity streak', '💪', 'streak', 200, 3),
  ('streak_30', 'Monthly Master', 'Maintain a 30-day activity streak', '🏆', 'streak', 500, 4),
  ('streak_100', 'Century Champion', 'Maintain a 100-day activity streak', '👑', 'streak', 1000, 5),
  
  -- Workout achievements
  ('first_workout', 'First Rep', 'Complete your first workout', '🎯', 'workout', 50, 10),
  ('workout_10', 'Getting Stronger', 'Complete 10 workouts', '💪', 'workout', 100, 11),
  ('workout_50', 'Gym Regular', 'Complete 50 workouts', '🏋️', 'workout', 250, 12),
  ('workout_100', 'Iron Dedication', 'Complete 100 workouts', '⭐', 'workout', 500, 13),
  
  -- Nutrition achievements
  ('first_meal_log', 'Fuel Up', 'Log your first meal', '🥗', 'nutrition', 25, 20),
  ('macro_streak_7', 'Macro Master', 'Hit macro goals 7 days in a row', '📊', 'nutrition', 150, 21),
  ('meals_logged_100', 'Nutrition Ninja', 'Log 100 meals', '🍽️', 'nutrition', 300, 22),
  
  -- Level achievements
  ('level_5', 'Rising Star', 'Reach Level 5', '⭐', 'level', 0, 30),
  ('level_10', 'Champion', 'Reach Level 10', '🌟', 'level', 0, 31),
  ('level_25', 'Elite', 'Reach Level 25', '💎', 'level', 0, 32),
  ('level_50', 'Legend', 'Reach Level 50', '👑', 'level', 0, 33),
  
  -- Mission achievements
  ('first_mission', 'Mission Accepted', 'Complete your first daily mission', '✅', 'special', 25, 40),
  ('missions_10', 'Mission Specialist', 'Complete 10 daily missions', '🎖️', 'special', 75, 41),
  ('missions_50', 'Mission Commander', 'Complete 50 daily missions', '🎗️', 'special', 200, 42),
  ('perfect_day', 'Perfect Day', 'Complete all daily missions in one day', '🌈', 'special', 100, 43),
  
  -- Special achievements
  ('early_bird', 'Early Bird', 'Complete a mission before 7 AM', '🌅', 'special', 50, 50),
  ('night_owl', 'Night Owl', 'Complete a workout after 9 PM', '🦉', 'special', 50, 51),
  ('weekend_warrior', 'Weekend Warrior', 'Work out on both Saturday and Sunday', '🗓️', 'special', 75, 52)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- Function to add XP and update level
-- ============================================
CREATE OR REPLACE FUNCTION add_xp(
  p_user_id UUID,
  p_event_type TEXT,
  p_xp_amount INTEGER,
  p_source_id UUID DEFAULT NULL,
  p_source_type TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS TABLE(new_xp_total INTEGER, new_level INTEGER, level_up BOOLEAN) AS $$
DECLARE
  v_old_level INTEGER;
  v_new_level INTEGER;
  v_new_xp INTEGER;
BEGIN
  -- Get current level
  SELECT current_level, xp_total INTO v_old_level, v_new_xp
  FROM profiles
  WHERE id = p_user_id;
  
  -- Add XP
  v_new_xp := COALESCE(v_new_xp, 0) + p_xp_amount;
  
  -- Calculate new level (simple formula: level = floor(sqrt(xp / 100)) + 1)
  -- This gives: Level 1 = 0-99 XP, Level 2 = 100-399 XP, Level 3 = 400-899 XP, etc.
  v_new_level := FLOOR(SQRT(v_new_xp::float / 100)) + 1;
  
  -- Update profile
  UPDATE profiles
  SET xp_total = v_new_xp,
      current_level = v_new_level,
      xp_last_calculated_at = NOW()
  WHERE id = p_user_id;
  
  -- Log the XP event
  INSERT INTO xp_events (user_id, event_type, xp_amount, source_id, source_type, metadata)
  VALUES (p_user_id, p_event_type, p_xp_amount, p_source_id, p_source_type, p_metadata);
  
  -- Return results
  RETURN QUERY SELECT v_new_xp, v_new_level, (v_new_level > COALESCE(v_old_level, 1));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION add_xp TO authenticated;
