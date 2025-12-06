-- Add meal eaten tracking flags to meal_logs
BEGIN;

ALTER TABLE public.meal_logs
  ADD COLUMN IF NOT EXISTS is_eaten boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS eaten_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_meal_logs_user_consumed ON public.meal_logs (user_id, consumed_at);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'meal_logs'
      AND policyname = 'Users can update own meal logs'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can update own meal logs" ON public.meal_logs FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)';
  END IF;
END $$;

COMMIT;

