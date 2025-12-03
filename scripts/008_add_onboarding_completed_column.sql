-- Add onboarding_completed column to profiles table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'onboarding_completed'
  ) THEN
    ALTER TABLE public.profiles 
    ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE;
    
    COMMENT ON COLUMN public.profiles.onboarding_completed IS 'Tracks whether user has completed the onboarding flow';
  END IF;
END $$;
