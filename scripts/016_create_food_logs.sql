-- AI Food Logging System
-- This table stores user-logged food entries with AI-parsed nutritional data

-- ============================================================================
-- FOOD LOGS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS food_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Food details (AI-parsed or user-entered)
  name TEXT NOT NULL,
  description TEXT, -- Original natural language input
  quantity DECIMAL(8,2) DEFAULT 1,
  unit TEXT DEFAULT 'serving', -- serving, cup, oz, g, piece, etc.
  
  -- Nutritional information
  calories INTEGER NOT NULL DEFAULT 0,
  protein DECIMAL(6,2) DEFAULT 0,
  carbs DECIMAL(6,2) DEFAULT 0,
  fat DECIMAL(6,2) DEFAULT 0,
  fiber DECIMAL(6,2) DEFAULT 0,
  sugar DECIMAL(6,2) DEFAULT 0,
  sodium DECIMAL(8,2) DEFAULT 0, -- mg
  
  -- Meal categorization
  meal_type TEXT NOT NULL CHECK (meal_type IN ('Breakfast', 'Lunch', 'Dinner', 'Snack')),
  
  -- Date/time tracking (supports past and future entries)
  logged_date DATE NOT NULL DEFAULT CURRENT_DATE,
  logged_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- AI parsing metadata
  original_input TEXT, -- The raw user input (text or voice transcript)
  input_type TEXT DEFAULT 'text' CHECK (input_type IN ('text', 'voice', 'image', 'manual')),
  image_url TEXT, -- If logged via photo
  ai_confidence DECIMAL(3,2), -- AI confidence score 0-1
  ai_parsed_data JSONB, -- Raw AI response for debugging
  
  -- Edit tracking
  is_edited BOOLEAN DEFAULT FALSE,
  edited_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_food_logs_user_id ON food_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_food_logs_user_date ON food_logs(user_id, logged_date);
CREATE INDEX IF NOT EXISTS idx_food_logs_meal_type ON food_logs(user_id, meal_type, logged_date);
CREATE INDEX IF NOT EXISTS idx_food_logs_date_desc ON food_logs(logged_date DESC);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE food_logs ENABLE ROW LEVEL SECURITY;

-- Users can only view their own food logs
CREATE POLICY "Users can view own food logs" ON food_logs 
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own food logs
CREATE POLICY "Users can create own food logs" ON food_logs 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own food logs
CREATE POLICY "Users can update own food logs" ON food_logs 
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own food logs
CREATE POLICY "Users can delete own food logs" ON food_logs 
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE TRIGGER update_food_logs_updated_at 
  BEFORE UPDATE ON food_logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- GAMIFICATION: Add food_logged XP event type
-- ============================================================================

-- Note: The XP system already supports 'meal_logged' event type
-- We'll use that for food logging XP rewards

-- ============================================================================
-- ACHIEVEMENT: Add nutrition-related achievements for food logging
-- ============================================================================

-- Insert food logging achievements if they don't exist
INSERT INTO achievements (slug, name, description, icon, category, xp_reward, sort_order)
VALUES 
  ('first_food_log', 'First Bite', 'Log your first food entry', '🍽️', 'nutrition', 25, 30),
  ('food_log_streak_3', 'Consistent Logger', 'Log food for 3 days in a row', '📝', 'nutrition', 50, 31),
  ('food_log_streak_7', 'Week of Tracking', 'Log food for 7 days in a row', '🗓️', 'nutrition', 100, 32),
  ('food_log_50', 'Food Diary Pro', 'Log 50 food entries', '📚', 'nutrition', 150, 33),
  ('daily_log_complete', 'Full Day Tracker', 'Log all 4 meals in one day', '✅', 'nutrition', 75, 34)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- HELPER FUNCTION: Get daily food log totals
-- ============================================================================

CREATE OR REPLACE FUNCTION get_daily_food_totals(
  p_user_id UUID,
  p_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  total_calories INTEGER,
  total_protein DECIMAL,
  total_carbs DECIMAL,
  total_fat DECIMAL,
  total_fiber DECIMAL,
  meal_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(calories), 0)::INTEGER as total_calories,
    COALESCE(SUM(protein), 0) as total_protein,
    COALESCE(SUM(carbs), 0) as total_carbs,
    COALESCE(SUM(fat), 0) as total_fat,
    COALESCE(SUM(fiber), 0) as total_fiber,
    COUNT(*)::INTEGER as meal_count
  FROM food_logs
  WHERE user_id = p_user_id
    AND logged_date = p_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- HELPER FUNCTION: Get food log streak
-- ============================================================================

CREATE OR REPLACE FUNCTION get_food_log_streak(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  streak INTEGER := 0;
  check_date DATE := CURRENT_DATE;
  has_log BOOLEAN;
BEGIN
  LOOP
    SELECT EXISTS(
      SELECT 1 FROM food_logs 
      WHERE user_id = p_user_id 
        AND logged_date = check_date
    ) INTO has_log;
    
    IF NOT has_log THEN
      EXIT;
    END IF;
    
    streak := streak + 1;
    check_date := check_date - 1;
  END LOOP;
  
  RETURN streak;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
