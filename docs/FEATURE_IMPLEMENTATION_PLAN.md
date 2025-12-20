# V-Life Feature Implementation Plan

> Created: 2025-12-20
> Status: Ready for Implementation

## Summary of User Decisions
- **Body Visualizer**: Keep retired (not implementing)
- **Logo**: Current logo is fine (no changes)
- **Food Scanner**: Implement with camera + upload support
- **Voice Features**: Full voice interaction (input + output)
- **VitalFlow Data**: User will provide correct info
- **Workout Media**: Use quality stock images/videos

---

## Quick Answers to User Questions

| Question | Current State | Action |
|----------|---------------|--------|
| Home screen? | Dashboard IS the home screen (weekly progress, habits, AI tip) | No changes needed |
| AI Visualization tool? | Retired before launch | Keep retired |
| VitalFlow info wrong? | Placeholder data | Update when user provides real data |
| Workout pics/videos? | Unsplash placeholders | Source quality stock |
| Food plate scanner? | NOT implemented | Build with GPT-4 Vision |
| Logo? | White V-Life logo exists | Keep current |
| Food library? | Static images only | Enhance with USDA database |
| Audio/voice? | NOT implemented | Build with Web Speech API |

---

## Implementation Order

### Phase 1: VitalFlow Supplement Data Correction
**Priority: HIGH | Effort: ~2 hours | Status: Waiting for user data**

User will provide real product data. Once provided:

**Files to Modify:**
- `supabase/migrations/20251206170000_seed_supplements.sql` - Update seed data
- `app/vitalflow-supplement-modal.tsx` - Update UI content/ingredients section

**Data Needed from User:**
- Complete ingredient list with dosages
- Scientifically-backed benefits
- Recommended usage instructions
- Any contraindications/warnings
- Product images (optional)

---

### Phase 2: Food Plate Scanner (Cal AI Style)
**Priority: HIGH | Effort: ~2-3 days**

Camera + photo upload → AI calorie/macro estimation using OpenAI GPT-4 Vision.

**New Files to Create:**
| File | Purpose |
|------|---------|
| `supabase/migrations/20251220_add_scanned_meals.sql` | Database schema |
| `app/api/scan-meal/route.ts` | API route for GPT-4 Vision analysis |
| `app/food-scanner-modal.tsx` | Camera/upload UI modal |
| `lib/actions/food-scanner.ts` | Server actions for saving scans |
| `lib/types/food-scanner.ts` | TypeScript interfaces |
| `lib/validations/food-scanner.ts` | Zod schemas |

**Files to Modify:**
- `app/nutrition/NutritionClient.tsx` - Add "Scan Meal" button

**Database Schema:**
```sql
-- Migration: 20251220_add_scanned_meals.sql
CREATE TABLE IF NOT EXISTS public.scanned_meals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    raw_analysis JSONB,
    estimated_calories INTEGER,
    estimated_protein NUMERIC(5,2),
    estimated_carbs NUMERIC(5,2),
    estimated_fat NUMERIC(5,2),
    confidence_level TEXT CHECK (confidence_level IN ('high', 'medium', 'low')),
    detected_foods TEXT[],
    meal_type TEXT CHECK (meal_type IN ('Breakfast', 'Lunch', 'Dinner', 'Snack')),
    consumed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.scanned_meals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own scanned meals" ON public.scanned_meals
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scanned meals" ON public.scanned_meals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own scanned meals" ON public.scanned_meals
    FOR DELETE USING (auth.uid() = user_id);
```

**Storage Bucket:**
```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('scanned-meals', 'scanned-meals', false);

-- RLS for bucket
CREATE POLICY "Users can upload scanned meal images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'scanned-meals' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own scanned meal images"
ON storage.objects FOR SELECT
USING (bucket_id = 'scanned-meals' AND auth.uid()::text = (storage.foldername(name))[1]);
```

**API Route Implementation (`app/api/scan-meal/route.ts`):**
```typescript
// System prompt for GPT-4 Vision
const SYSTEM_PROMPT = `You are a nutrition analysis AI. Analyze this food image and estimate:
1. Each food item visible
2. Estimated portion sizes
3. Calories per item and total
4. Macronutrients (protein, carbs, fat in grams)

Respond in JSON format:
{
  "foods": [{"name": "...", "portion": "...", "calories": X, "protein": X, "carbs": X, "fat": X}],
  "totals": {"calories": X, "protein": X, "carbs": X, "fat": X},
  "confidence": "high|medium|low",
  "notes": "..."
}`;
```

**UI Features:**
- Camera capture using `navigator.mediaDevices.getUserMedia()`
- File upload from gallery via `<input type="file" accept="image/*" capture="environment">`
- Image preview before analysis
- Loading state during AI processing
- Results display with detected foods, calories, macros
- Confidence indicator (high/medium/low)
- "Add to Meal Log" action button

---

### Phase 3: Voice Interaction for AI Coach
**Priority: HIGH | Effort: ~2-3 days**

Full voice conversation: speak to VBot + hear responses.

**Approach:** Web Speech API (free, browser-native) for MVP

**New Files to Create:**
| File | Purpose |
|------|---------|
| `components/voice/voice-input-button.tsx` | Microphone button with STT |
| `components/voice/voice-output.tsx` | TTS player component |
| `hooks/use-speech-recognition.ts` | Web Speech API hook for voice input |
| `hooks/use-speech-synthesis.ts` | Web Speech API hook for TTS |
| `lib/utils/audio.ts` | Audio utilities |

**Files to Modify:**
- `app/vbot/page.tsx` - Add voice input button + TTS on messages

**Speech Recognition Hook (`hooks/use-speech-recognition.ts`):**
```typescript
import { useState, useEffect, useCallback } from 'react'

interface UseSpeechRecognitionReturn {
  isListening: boolean
  transcript: string
  startListening: () => void
  stopListening: () => void
  resetTranscript: () => void
  browserSupported: boolean
}

export function useSpeechRecognition(): UseSpeechRecognitionReturn {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null)

  const browserSupported = typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)

  useEffect(() => {
    if (!browserSupported) return

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognitionInstance = new SpeechRecognition()
    recognitionInstance.continuous = true
    recognitionInstance.interimResults = true
    recognitionInstance.lang = 'en-US'

    recognitionInstance.onresult = (event) => {
      const current = event.resultIndex
      const transcript = event.results[current][0].transcript
      setTranscript(transcript)
    }

    recognitionInstance.onend = () => setIsListening(false)

    setRecognition(recognitionInstance)
  }, [browserSupported])

  const startListening = useCallback(() => {
    if (recognition) {
      recognition.start()
      setIsListening(true)
    }
  }, [recognition])

  const stopListening = useCallback(() => {
    if (recognition) {
      recognition.stop()
      setIsListening(false)
    }
  }, [recognition])

  const resetTranscript = useCallback(() => setTranscript(''), [])

  return { isListening, transcript, startListening, stopListening, resetTranscript, browserSupported }
}
```

**Speech Synthesis Hook (`hooks/use-speech-synthesis.ts`):**
```typescript
import { useState, useCallback } from 'react'

interface UseSpeechSynthesisReturn {
  speak: (text: string) => void
  cancel: () => void
  isSpeaking: boolean
  browserSupported: boolean
}

export function useSpeechSynthesis(): UseSpeechSynthesisReturn {
  const [isSpeaking, setIsSpeaking] = useState(false)

  const browserSupported = typeof window !== 'undefined' && 'speechSynthesis' in window

  const speak = useCallback((text: string) => {
    if (!browserSupported) return

    window.speechSynthesis.cancel() // Cancel any ongoing speech

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 1
    utterance.pitch = 1
    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    window.speechSynthesis.speak(utterance)
  }, [browserSupported])

  const cancel = useCallback(() => {
    if (browserSupported) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }, [browserSupported])

  return { speak, cancel, isSpeaking, browserSupported }
}
```

**UI Features:**
- Microphone button next to text input (red when recording)
- Speaker icon on AI messages to read aloud
- Voice mode toggle for continuous conversation
- Visual feedback during recording (pulsing animation)
- Mobile-friendly permissions handling
- Fallback for unsupported browsers

---

### Phase 4: Workout Images/Videos Update
**Priority: MEDIUM | Effort: ~1-2 days**

Replace Unsplash placeholders with quality stock content.

**Files to Modify:**
- `lib/exercise-images.ts` - Update 40+ exercise image URLs

**Files to Create:**
| File | Purpose |
|------|---------|
| `supabase/migrations/20251220_seed_exercise_videos.sql` | Populate video_url column |
| `components/exercise-video-player.tsx` | Video player component |

**Action Items:**
1. Source quality stock images/videos from Pexels (free) or Shutterstock
2. Upload to Supabase storage bucket `exercise-media`
3. Update `lib/exercise-images.ts` with new URLs
4. Create video player component for exercise demonstrations
5. Update workout UI to show videos when available

**Storage Bucket:**
```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('exercise-media', 'exercise-media', true);
```

**Video Player Component (`components/exercise-video-player.tsx`):**
```typescript
'use client'

import { useState } from 'react'
import { Play, Pause, Volume2, VolumeX } from 'lucide-react'

interface ExerciseVideoPlayerProps {
  videoUrl: string
  posterUrl?: string
  exerciseName: string
}

export function ExerciseVideoPlayer({ videoUrl, posterUrl, exerciseName }: ExerciseVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)

  // Implementation details...
}
```

**Exercises Needing Media (from `lib/exercise-images.ts`):**
- Strength: Bench Press, Squats, Deadlift, Pull-ups, Rows, Shoulder Press, etc.
- Cardio: Running, Cycling, Swimming, HIIT, Jump Rope, etc.
- Flexibility: Yoga, Stretching, Pilates, Foam Rolling, etc.

---

### Phase 5: Food Library Enhancement (Future)
**Priority: LOWER | Effort: ~3-4 days**

Searchable food database using USDA FoodData Central API (free).

**New Files to Create:**
| File | Purpose |
|------|---------|
| `supabase/migrations/20251220_add_food_library.sql` | Food items table |
| `app/api/food-search/route.ts` | Search API with USDA fallback |
| `app/food-search-modal.tsx` | Search UI modal |
| `lib/actions/food-library.ts` | Server actions |

**Files to Modify:**
- `app/nutrition/NutritionClient.tsx` - Add "Search Foods" button

**Database Schema:**
```sql
-- Migration: 20251220_add_food_library.sql
CREATE TABLE IF NOT EXISTS public.food_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    fdc_id TEXT UNIQUE,  -- USDA FoodData Central ID
    name TEXT NOT NULL,
    brand_name TEXT,
    serving_size TEXT,
    serving_unit TEXT,
    calories_per_serving NUMERIC(7,2),
    protein_per_serving NUMERIC(5,2),
    carbs_per_serving NUMERIC(5,2),
    fat_per_serving NUMERIC(5,2),
    fiber_per_serving NUMERIC(5,2),
    is_custom BOOLEAN DEFAULT false,
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Full-text search index
CREATE INDEX idx_food_items_name ON public.food_items
    USING gin(to_tsvector('english', name));

-- RLS
ALTER TABLE public.food_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view food items" ON public.food_items
    FOR SELECT USING (true);

CREATE POLICY "Users can insert custom food items" ON public.food_items
    FOR INSERT WITH CHECK (auth.uid() = user_id AND is_custom = true);
```

**USDA API Integration:**
- Endpoint: `https://api.nal.usda.gov/fdc/v1/foods/search`
- Free API key required: https://fdc.nal.usda.gov/api-key-signup.html
- Rate limit: 3,600 requests/hour

---

## Environment Variables to Add
```env
# Already have OPENAI_API_KEY for GPT-4 Vision (required for food scanner)
USDA_API_KEY=your-usda-api-key  # For food library (Phase 5)
```

---

## Third-Party Dependencies

| Service | Purpose | Cost |
|---------|---------|------|
| OpenAI GPT-4 Vision | Food plate analysis | ~$0.01-0.03/image |
| Web Speech API | Voice input/output | Free (browser) |
| USDA FoodData Central | Food database | Free |
| Pexels/Shutterstock | Stock workout media | Free/Paid |

---

## Cost Estimates

| Feature | Per-Use Cost | Monthly Estimate (1000 users) |
|---------|--------------|-------------------------------|
| Food Scanner | $0.02/scan | ~$200 (10 scans/user) |
| Voice | Free | $0 |
| Food Library | Free | $0 |

**Consider:** Rate limiting food scanner (e.g., 10 scans/day for free users)

---

## NOT Implementing (Per User Decision)
- AI Body Visualizer - Keep retired
- Logo changes - Current logo is fine
- Home screen redesign - Dashboard is sufficient

---

## Execution Notes

When ready to implement, run phases in order:
1. Start with Phase 1 (VitalFlow) once user provides data
2. Phase 2 (Food Scanner) can begin immediately
3. Phase 3 (Voice) can run in parallel with Phase 2
4. Phase 4 (Workout Media) requires sourcing content first
5. Phase 5 (Food Library) is lower priority, implement last

Each phase is independent and can be deployed separately.
