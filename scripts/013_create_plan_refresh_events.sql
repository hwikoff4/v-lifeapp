-- Track every time a user refreshes their AI plan
CREATE TABLE IF NOT EXISTS plan_refresh_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('processing', 'completed', 'failed')) DEFAULT 'processing',
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

ALTER TABLE plan_refresh_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their plan refresh events" ON plan_refresh_events
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their plan refresh events" ON plan_refresh_events
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their plan refresh events" ON plan_refresh_events
FOR UPDATE USING (auth.uid() = user_id);

