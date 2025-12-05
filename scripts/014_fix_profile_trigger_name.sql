-- Fix the handle_new_user trigger to provide a default name
-- The profiles table has name as NOT NULL, but the trigger wasn't providing a name

-- First, make name column nullable so existing users without profiles can still work
ALTER TABLE public.profiles ALTER COLUMN name DROP NOT NULL;

-- Update the trigger function to handle profile creation properly
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert minimal profile data with NULL name (will be set during onboarding)
  INSERT INTO public.profiles (
    id,
    name,
    referral_code,
    credits,
    onboarding_completed,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NULL,  -- Name will be set during onboarding
    'VLIFE-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8)),
    0,
    false,
    NOW(),
    NOW()
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres, anon, authenticated, service_role;

