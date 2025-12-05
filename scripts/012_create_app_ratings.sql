-- Persistent storage for in-app ratings
CREATE TABLE IF NOT EXISTS app_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5) NOT NULL,
  feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE app_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create ratings" ON app_ratings
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their ratings" ON app_ratings
FOR SELECT USING (auth.uid() = user_id);

