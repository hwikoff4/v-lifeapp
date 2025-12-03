-- Add notification preference columns to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS notifications_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS workout_reminders BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS workout_reminder_time TIME DEFAULT '08:00:00',
ADD COLUMN IF NOT EXISTS meal_reminders BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS breakfast_reminder_time TIME DEFAULT '08:00:00',
ADD COLUMN IF NOT EXISTS lunch_reminder_time TIME DEFAULT '12:00:00',
ADD COLUMN IF NOT EXISTS dinner_reminder_time TIME DEFAULT '18:00:00',
ADD COLUMN IF NOT EXISTS progress_updates BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS streak_warnings BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS achievement_notifications BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS habit_reminders BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS push_subscription JSONB;

-- Create notification_logs table to track sent notifications
CREATE TABLE IF NOT EXISTS notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read BOOLEAN DEFAULT false,
  clicked BOOLEAN DEFAULT false
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_notification_logs_user_id ON notification_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_sent_at ON notification_logs(sent_at);
