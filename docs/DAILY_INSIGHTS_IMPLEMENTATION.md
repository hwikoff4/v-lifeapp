# Daily AI Insights Implementation

## Overview

This document describes the implementation of AI-generated daily insights for the V-Life dashboard. The system generates personalized, motivational messages for users based on their real fitness data, updating once per day at local midnight.

## Architecture

### Components

1. **Database Layer** (`supabase/migrations/20251206000000_create_daily_insights.sql`)
   - `daily_insights` table stores generated insights
   - Unique constraint on `(user_id, local_date)` ensures one insight per user per day
   - Row-level security policies protect user data

2. **Supabase Edge Function** (`supabase/functions/daily-insight/`)
   - Handles authentication and authorization
   - Checks for cached insights (by user_id + local_date)
   - Builds `UserDashboardSnapshot` from database
   - Calls OpenAI API to generate personalized insights
   - Stores new insights with idempotency protection
   - Uses `OPENAI_API_KEY` from Supabase environment

3. **Server Actions** (`lib/actions/daily-insights.ts`)
   - `getDailyInsight()`: Main function to get/create daily insight
   - `regenerateDailyInsight()`: Force regenerate for testing
   - Handles errors gracefully with fallback messages

4. **Timezone Support**
   - `lib/utils/timezone.ts`: Server-side timezone utilities
   - `lib/hooks/use-timezone.ts`: Client-side timezone detection and sync
   - `lib/actions/timezone.ts`: Update user timezone in profile
   - Automatic browser timezone detection on dashboard load

5. **Dashboard UI** (`app/dashboard/DashboardClient.tsx`)
   - Loads daily insight on mount
   - Shows loading state while generating
   - Displays insight with error handling
   - Replaces hardcoded motivational messages

## Data Flow

### First Visit of the Day

1. User opens dashboard
2. `useTimezoneSync()` detects browser timezone and updates profile if changed
3. Dashboard calls `getDailyInsight()`
4. Server action gets user timezone and calculates local date
5. Calls Supabase Edge Function with timezone and date
6. Edge Function checks `daily_insights` table - no entry found
7. Edge Function builds user snapshot from habits, progress, and profile data
8. Edge Function calls OpenAI API with personalized prompt
9. Edge Function saves insight to database
10. Insight returned and displayed to user

### Subsequent Visits Same Day

1. User opens dashboard
2. Dashboard calls `getDailyInsight()`
3. Server action calls Edge Function
4. Edge Function finds existing insight in database
5. Cached insight returned immediately (no OpenAI call)
6. Insight displayed to user

### After Midnight (New Day)

1. User opens dashboard
2. Local date calculation shows new date
3. No insight exists for new date
4. System generates fresh insight (same flow as first visit)

## Idempotency & Race Conditions

The system handles concurrent requests gracefully:

- Unique constraint on `(user_id, local_date)` prevents duplicates
- On constraint violation (code 23505), fetch and return existing insight
- No wasted OpenAI API calls due to races

## Error Handling

**Graceful Degradation:**
- If Edge Function fails: return static fallback message
- If OpenAI quota exceeded: return fallback message
- If network issues: return fallback message
- User always sees a message, never an error

**Fallback Messages:**
- "Keep pushing forward! Every small step counts toward your goals."
- "Stay focused on your journey. You've got this!"
- "Start small and build momentum. Complete one habit today!"

## AI Prompt Strategy

The OpenAI prompt includes:
- User's name
- Weekly progress percentage
- Habits completed today vs. total
- List of habits with categories and streaks
- Primary fitness goal
- Activity level

**Guidelines for AI:**
- 1-2 sentences maximum (under 160 characters preferred)
- Motivational, encouraging, and action-oriented
- Reference specific habits or streaks when relevant
- No medical advice
- Friendly, supportive tone
- Vary message style (motivational, congratulatory, challenging, reflective)

## Configuration

### Environment Variables (Supabase)

Required in Supabase project settings:
- `OPENAI_API_KEY`: Your OpenAI API key

### Database Migration

Run the migration to create the `daily_insights` table:

```bash
# Push to Supabase
supabase db push

# Or apply specific migration
supabase migration up 20251206000000_create_daily_insights
```

### Deploy Edge Function

```bash
# Deploy the daily-insight function
supabase functions deploy daily-insight

# Set environment variables (if not already set)
supabase secrets set OPENAI_API_KEY=your_key_here
```

## Testing

### Manual Testing Checklist

- [ ] First dashboard visit generates new insight
- [ ] Second dashboard visit same day returns cached insight
- [ ] Insight updates after local midnight
- [ ] Timezone changes are detected and synced
- [ ] Error states show fallback messages
- [ ] Loading state displays while generating
- [ ] Different users get different insights
- [ ] Insights are personalized based on user data

### Test Files

- `__tests__/lib/utils/timezone.test.ts`: Timezone utility tests
- `__tests__/lib/hooks/use-timezone.test.ts`: Client-side timezone tests

Run tests:
```bash
npm test
```

### Testing Regeneration

You can force regenerate today's insight for testing:

```typescript
import { regenerateDailyInsight } from "@/lib/actions/daily-insights"

// In a server action or API route
const result = await regenerateDailyInsight()
```

## Performance Considerations

**Caching:**
- Insights cached in database for 24 hours (local day)
- No redundant OpenAI API calls for same user/day
- Edge Function runs close to database for low latency

**Cost Optimization:**
- Max 1 OpenAI API call per user per day
- Using `gpt-4o-mini` model for cost efficiency
- Max tokens limited to 100 to control costs
- Temperature set to 0.8 for creative but consistent output

**Scalability:**
- Stateless Edge Function scales automatically
- Database unique constraint handles concurrency
- No background jobs or cron needed

## Monitoring & Debugging

**Edge Function Logs:**
```bash
supabase functions logs daily-insight
```

**Database Queries:**
```sql
-- Check recent insights
SELECT * FROM daily_insights 
WHERE user_id = 'user-uuid' 
ORDER BY local_date DESC 
LIMIT 7;

-- Count insights per day
SELECT local_date, COUNT(*) 
FROM daily_insights 
GROUP BY local_date 
ORDER BY local_date DESC;
```

**Client-side Debugging:**
- Check browser console for timezone sync messages
- Verify localStorage for `user-timezone` key
- Network tab shows Edge Function calls

## Future Enhancements

1. **Streak-aware Prompts**: Different tone based on user's streak status
2. **A/B Testing**: Test different prompt styles via `meta` field
3. **Insight History**: Allow users to view past insights
4. **Manual Refresh**: Add UI button to regenerate insight
5. **Insight Categories**: Tag insights by type (motivational, educational, etc.)
6. **Analytics**: Track which insights drive most engagement
7. **Multilingual Support**: Generate insights in user's language
8. **Scheduled Generation**: Pre-generate insights at midnight server-side

## Troubleshooting

### Insight not updating after midnight

- Check user's profile timezone is correct
- Verify `getTodayInTimezone()` is calculating correct local date
- Check Edge Function logs for errors

### Always showing loading state

- Check network tab for failed Edge Function calls
- Verify Supabase authentication is working
- Check browser console for JavaScript errors

### Same insight every day

- Verify local date calculation is correct for user's timezone
- Check database for duplicate entries with same date
- Ensure timezone is being passed to Edge Function

### OpenAI errors

- Verify `OPENAI_API_KEY` is set in Supabase secrets
- Check OpenAI account quota and billing
- Review Edge Function logs for API error messages

## Files Modified/Created

### Created
- `supabase/migrations/20251206000000_create_daily_insights.sql`
- `supabase/functions/daily-insight/index.ts`
- `supabase/functions/daily-insight/deno.json`
- `lib/actions/daily-insights.ts`
- `lib/actions/timezone.ts`
- `lib/hooks/use-timezone.ts`
- `__tests__/lib/utils/timezone.test.ts`
- `__tests__/lib/hooks/use-timezone.test.ts`
- `DAILY_INSIGHTS_IMPLEMENTATION.md`

### Modified
- `lib/types/index.ts`: Added `DailyInsight`, `DailyInsightResult`, `UserDashboardSnapshot`
- `app/dashboard/DashboardClient.tsx`: Integrated daily insight loading and display
- `app/dashboard/page.tsx`: Already had timezone support

## Summary

The daily insights feature provides users with personalized, AI-generated motivational messages that:
- Update automatically at local midnight
- Are based on real user data (habits, progress, goals)
- Cache efficiently to minimize API costs
- Degrade gracefully on errors
- Respect user privacy and data security

