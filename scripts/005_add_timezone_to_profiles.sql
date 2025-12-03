-- Add timezone column to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'America/New_York';

-- Add last_habit_reset column to track when habits were last reset
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS last_habit_reset DATE DEFAULT CURRENT_DATE;

-- Create index for faster timezone queries
CREATE INDEX IF NOT EXISTS idx_profiles_timezone ON profiles(timezone);

-- Update existing users to have a default timezone
UPDATE profiles
SET timezone = 'America/New_York'
WHERE timezone IS NULL;
