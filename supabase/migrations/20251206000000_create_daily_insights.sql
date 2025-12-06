-- Create daily_insights table for AI-generated daily motivational insights
CREATE TABLE IF NOT EXISTS public.daily_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  local_date DATE NOT NULL,
  timezone TEXT NOT NULL,
  insight TEXT NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  meta JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one insight per user per day
  CONSTRAINT unique_user_date UNIQUE (user_id, local_date)
);

-- Add index for faster lookups
CREATE INDEX idx_daily_insights_user_date ON public.daily_insights(user_id, local_date DESC);

-- Enable Row Level Security
ALTER TABLE public.daily_insights ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own daily insights"
  ON public.daily_insights
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily insights"
  ON public.daily_insights
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Optional: Allow updates (in case we want to regenerate)
CREATE POLICY "Users can update their own daily insights"
  ON public.daily_insights
  FOR UPDATE
  USING (auth.uid() = user_id);

