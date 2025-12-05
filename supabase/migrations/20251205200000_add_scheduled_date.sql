-- Add scheduled_date column to workouts table for better daily workout tracking
-- This allows us to associate workouts with specific dates for programming

ALTER TABLE workouts 
ADD COLUMN IF NOT EXISTS scheduled_date DATE;

-- Create index for efficient date-based queries
CREATE INDEX IF NOT EXISTS idx_workouts_scheduled_date 
ON workouts(user_id, scheduled_date);

-- Add comment for documentation
COMMENT ON COLUMN workouts.scheduled_date IS 'The date this workout is scheduled for (YYYY-MM-DD format)';

-- Allow authenticated users to insert exercises into the shared catalog
-- This enables AI workout generation to create new exercises as needed
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'exercises' 
    AND policyname = 'Authenticated users can create exercises'
  ) THEN
    CREATE POLICY "Authenticated users can create exercises" 
    ON exercises FOR INSERT 
    WITH CHECK (auth.role() = 'authenticated');
  END IF;
END $$;

