# VitalFlow Daily Habits - Quick Start Guide

## TL;DR - Deploy in 5 Minutes

```bash
# 1. Push database migrations
supabase db push

# 2. Set OpenAI API key (if not already set)
supabase secrets set OPENAI_API_KEY="sk-your-key-here"

# 3. Deploy Edge Functions
supabase functions deploy vitalflow-daily-habits
supabase functions deploy populate-habit-embeddings

# 4. Generate embeddings for knowledge base
curl -X POST \
  "https://YOUR_PROJECT_REF.supabase.co/functions/v1/populate-habit-embeddings" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY"

# Done! The VitalFlow component is already integrated into the dashboard.
```

## What Users Will See

1. **On Dashboard**: A new "VitalFlow Daily Habits" card with 3-5 AI-suggested habits
2. **Each Habit Shows**:
   - Title with category icon (🏃 💧 😴 🧠 etc.)
   - Time required (e.g., "10 min")
   - Energy impact (e.g., "+40 kcal")
   - "Why this?" explanation (expandable)
   - Accept / Skip buttons

3. **Once Weekly**: A reflection modal asking about:
   - How tired they felt this week (1-10)
   - How much they enjoyed their plan (1-10)
   - How difficult it was (1-10)

## User Flow Example

**Monday Morning:**
- User opens dashboard
- Sees VitalFlow suggestions:
  1. "Morning Hydration Ritual (16 oz)" - 2 min, 0 kcal
  2. "10-Minute Morning Walk" - 10 min, +40 kcal
  3. "Protein-First Breakfast" - 5 min, 0 kcal

**User Actions:**
- Clicks "Accept" on all 3
- Habits now show "Mark Complete" button
- After completing each, clicks "Mark Complete"
- Sees celebration toast: "Awesome! 🎉 You completed..."

**Sunday Evening:**
- Modal appears: "Weekly Reflection"
- User rates:
  - Fatigue: 6/10 (a bit tired)
  - Enjoyment: 8/10 (really enjoying it!)
  - Difficulty: 5/10 (just right)
- Saves reflection

**Next Monday:**
- AI notices high fatigue → suggests more recovery habits
- AI sees high enjoyment → continues current difficulty
- Suggestions adapt automatically

## Troubleshooting

**"No suggestions showing"**
→ Check browser console for errors
→ Verify Edge Function deployed: `supabase functions list`
→ Check AI logs: `SELECT * FROM ai_logs ORDER BY created_at DESC LIMIT 5;`

**"Suggestions not relevant"**
→ Ensure embeddings were generated (Step 4 above)
→ Check user profile is complete
→ Complete weekly reflection for better personalization

**"Error generating suggestions"**
→ Verify OpenAI API key: `supabase secrets list`
→ Check OpenAI API credits/quota
→ Review Edge Function logs in Supabase Dashboard

## Customization

### Add More Habits to Knowledge Base

```sql
INSERT INTO vitalflow_habits_knowledge (
  title,
  body,
  category,
  tags,
  goal_segments,
  default_energy_delta_kcal,
  default_time_minutes,
  difficulty_level
) VALUES (
  'Your Habit Title',
  'Detailed description explaining the habit, benefits, and how to do it...',
  'movement', -- movement, nutrition, sleep, mindset, recovery, hydration
  ARRAY['tag1', 'tag2'],
  ARRAY['fat_loss', 'strength'], -- fat_loss, muscle_gain, strength, endurance, general_wellness, stress_reduction
  50, -- calories burned
  15, -- minutes
  'easy' -- easy, moderate, hard
);
```

After adding habits, regenerate embeddings:
```bash
curl -X POST "https://YOUR_PROJECT_REF.supabase.co/functions/v1/populate-habit-embeddings" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY"
```

### Adjust Suggestion Count

Edit `supabase/functions/vitalflow-daily-habits/index.ts`:

```typescript
// Line ~87: Change from 3-5 to 2-4 suggestions
const systemPrompt = `...
2. Suggest 2-4 habits ranked by priority (rank 1 = highest).
...`
```

Redeploy:
```bash
supabase functions deploy vitalflow-daily-habits
```

### Change Weekly Reflection Cadence

Edit `lib/actions/weekly-reflections.ts` to prompt more/less frequently.

## Monitoring

### Check Suggestion Quality
```sql
SELECT 
  category,
  status,
  COUNT(*) as count
FROM daily_habit_suggestions
WHERE date >= CURRENT_DATE - 7
GROUP BY category, status
ORDER BY category, count DESC;
```

### View User Engagement
```sql
SELECT 
  COUNT(DISTINCT user_id) as total_users,
  COUNT(DISTINCT user_id) FILTER (WHERE status = 'accepted') as accepted_users,
  ROUND(AVG(completion_ratio), 2) as avg_completion
FROM daily_habit_suggestions
WHERE date >= CURRENT_DATE - 7;
```

### Check AI Costs
```sql
SELECT 
  DATE(created_at) as date,
  COUNT(*) as calls,
  SUM(tokens_used) as total_tokens,
  ROUND(SUM(tokens_used) * 0.0015 / 1000, 4) as estimated_cost_usd
FROM ai_logs
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

## Next Steps

1. **Monitor first week** - Check `ai_logs` and `daily_habit_suggestions` tables
2. **Gather feedback** - Ask users about suggestion quality
3. **Refine knowledge base** - Add/edit habits based on what users accept/skip
4. **Tune AI prompt** - Adjust system prompt in Edge Function if needed
5. **Consider Phase 2** - Activity factor auto-adjustment, time-of-day optimization

---

**You're all set!** 🚀

VitalFlow Daily Habits will now provide personalized, AI-powered habit suggestions to help your users achieve their fitness goals.

