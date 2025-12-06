# VitalFlow Daily Habits - Deployment Guide

This guide will walk you through deploying the VitalFlow Daily Habits feature to your Supabase project.

## Overview

VitalFlow Daily Habits is an AI-powered system that provides personalized daily habit suggestions based on:
- User profile and goals
- Recent activity and adherence patterns
- Weekly reflections and check-ins
- RAG (Retrieval-Augmented Generation) over a curated knowledge base

## Prerequisites

- Supabase CLI installed and configured
- Supabase project linked (`supabase link --project-ref YOUR_PROJECT_REF`)
- OpenAI API key set in Supabase secrets
- Access to your Supabase dashboard

## Step 1: Run Database Migrations

Apply the VitalFlow schema migrations to your database:

```bash
# Navigate to your project root
cd /path/to/v-life

# Push migrations to Supabase
supabase db push
```

This will create the following tables:
- `vitalflow_habits_knowledge` - Knowledge base for RAG
- `vitalflow_habit_templates` - Reusable habit templates
- `daily_habit_suggestions` - Daily AI-generated suggestions
- `habit_events` - Completion logs for learning
- `weekly_reflections` - User check-ins
- `ai_logs` - AI call audit logs

## Step 2: Verify OpenAI API Key

Ensure your `OPENAI_API_KEY` is set in Supabase secrets:

```bash
# Check if the secret exists
supabase secrets list

# If not present, set it
supabase secrets set OPENAI_API_KEY="sk-your-openai-api-key-here"
```

## Step 3: Deploy Edge Functions

Deploy the VitalFlow Edge Functions:

```bash
# Deploy the main VitalFlow daily habits function
supabase functions deploy vitalflow-daily-habits

# Deploy the embeddings population function
supabase functions deploy populate-habit-embeddings
```

## Step 4: Populate Knowledge Base Embeddings

After the migrations have seeded the knowledge base, generate embeddings:

### Option A: Via curl (one-time)

```bash
# Get your service role key from Supabase Dashboard > Settings > API
# IMPORTANT: Keep this key secret!

curl -X POST \
  "https://YOUR_PROJECT_REF.supabase.co/functions/v1/populate-habit-embeddings" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json"
```

### Option B: Via Supabase Dashboard

1. Go to Supabase Dashboard > Edge Functions
2. Find `populate-habit-embeddings`
3. Click "Invoke" button
4. Wait for completion (should process ~30 entries)

**Expected Output:**
```json
{
  "success": true,
  "processed": 30,
  "errors": 0,
  "total": 30,
  "message": "Successfully processed 30 entries with 0 errors"
}
```

## Step 5: Verify Deployment

### Check Database Tables

Run this query in the Supabase SQL Editor:

```sql
-- Check knowledge base entries
SELECT COUNT(*) as total, 
       COUNT(embedding) as with_embeddings
FROM vitalflow_habits_knowledge;

-- Should return: total = 30+, with_embeddings = 30+
```

### Test the Edge Function

Make a test request to generate suggestions:

```bash
# Get a user access token from your app (from localStorage or session)
# Then make a test request:

curl -X POST \
  "https://YOUR_PROJECT_REF.supabase.co/functions/v1/vitalflow-daily-habits" \
  -H "Authorization: Bearer USER_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "context": "Testing VitalFlow",
    "regenerate": false
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "suggestions": [
    {
      "title": "Morning Hydration Ritual (16 oz)",
      "reason": "Starting your day hydrated...",
      "category": "hydration",
      "energy_delta_kcal": 0,
      "time_minutes": 2,
      "tags": ["water", "morning"],
      "rank": 1
    }
    // ... more suggestions
  ],
  "cached": false
}
```

## Step 6: Frontend Integration

The VitalFlow component is already integrated into the dashboard at:
- `app/dashboard/DashboardClient.tsx`
- Component: `components/vitalflow-daily-habits.tsx`

No additional frontend changes are needed.

## Monitoring & Debugging

### View AI Logs

Check the `ai_logs` table to monitor AI function calls:

```sql
SELECT 
  function_name,
  model,
  tokens_used,
  duration_ms,
  error,
  created_at
FROM ai_logs
ORDER BY created_at DESC
LIMIT 20;
```

### Check Suggestion Quality

Monitor user engagement with suggestions:

```sql
SELECT 
  category,
  status,
  COUNT(*) as count,
  AVG(completion_ratio) as avg_completion
FROM daily_habit_suggestions
WHERE date >= CURRENT_DATE - 7
GROUP BY category, status
ORDER BY category, status;
```

### Troubleshooting

**Problem: No suggestions generated**
- Check that `OPENAI_API_KEY` is set correctly
- Verify embeddings were populated
- Check `ai_logs` table for error messages

**Problem: Suggestions not personalized**
- Ensure user profile data is complete
- Check that habit adherence data exists
- Verify weekly reflections are being saved

**Problem: RAG not returning relevant knowledge**
- Re-run `populate-habit-embeddings` function
- Check embedding dimensions (should be 1536 for text-embedding-3-small)
- Verify `match_vitalflow_habits_knowledge` function exists

## Cost Estimation

**OpenAI API Costs (per user per day):**
- 1 embedding generation: ~$0.0001
- 1 GPT-4o-mini completion: ~$0.002
- **Total: ~$0.0021 per user per day**

**Supabase Costs:**
- Edge Function invocations: Free tier covers most usage
- Database storage: Minimal (< 1 MB per 1000 users)

## Security Notes

1. **Never expose service role keys** - Only use them server-side
2. **RLS policies are enabled** - Users can only access their own data
3. **AI logs are sanitized** - No sensitive user data in logs
4. **Rate limiting** - Consider adding rate limits in production

## Next Steps

### Phase 2 Enhancements (Optional)

1. **Activity Factor Adjustment**
   - Create a scheduled Edge Function (cron job) to analyze `habit_events`
   - Gradually adjust user's `activity_level` in `profiles` table based on 4+ weeks of consistent high movement habits

2. **A/B Testing**
   - Add `experiment_variant` field to `daily_habit_suggestions`
   - Test different suggestion counts, wording, or timing

3. **Admin Dashboard**
   - Create a view to manage habit templates
   - Monitor AI performance metrics
   - Review and edit knowledge base entries

## Support

If you encounter issues:
1. Check the `ai_logs` table for errors
2. Review Edge Function logs in Supabase Dashboard
3. Verify all migrations were applied successfully
4. Ensure OpenAI API key has sufficient credits

---

**Deployment Complete!** 🎉

Your VitalFlow Daily Habits system is now live. Users will see AI-powered habit suggestions on their dashboard, personalized to their goals and recent activity.

