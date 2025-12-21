-- Add voice preferences to profiles table for VBot voice chat feature
-- Stores user's preferred voice for Gemini TTS and voice interaction settings

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS voice_preferences JSONB DEFAULT '{
  "selectedVoice": "Kore",
  "voiceEnabled": true,
  "autoPlayResponses": false
}'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.voice_preferences IS 'User voice preferences for VBot: selectedVoice (Gemini TTS voice name), voiceEnabled (master toggle), autoPlayResponses (auto-play AI responses)';
