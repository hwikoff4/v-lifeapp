# Daily AI Insights - Quick Start Guide

## 🚀 Deploy in 5 Minutes

### Prerequisites
- Supabase project configured
- OpenAI API key
- Supabase CLI installed

### Step 1: Database (30 seconds)
```bash
supabase db push
```

### Step 2: Configure OpenAI Key (15 seconds)
```bash
supabase secrets set OPENAI_API_KEY=sk-your-key-here
```

### Step 3: Deploy Edge Function (45 seconds)
```bash
supabase functions deploy daily-insight
```

### Step 4: Deploy Frontend (2 minutes)
```bash
npm run build
vercel --prod  # or your deployment method
```

### Step 5: Test (1 minute)
1. Login to your app
2. Go to dashboard
3. See personalized AI insight appear!

---

## ✅ Verification Checklist

After deployment, verify:

- [ ] Dashboard loads without errors
- [ ] "Generating your daily insight..." appears briefly
- [ ] Personalized message appears in AI Insight card
- [ ] Refresh page - same message loads faster (cached)
- [ ] Check Supabase logs: `supabase functions logs daily-insight`
- [ ] Check database: `SELECT * FROM daily_insights LIMIT 5;`

---

## 📊 What Changed

**Before:**
```typescript
<p>
  {progress > 75 ? "You're crushing it!" : "Keep going!"}
</p>
```

**After:**
```typescript
<p>
  {dailyInsight || "Keep going!"}
</p>
```

Now loads from AI based on user's real data!

---

## 🔧 How to Test Different Scenarios

### Test New Day Generation
```typescript
// In browser console (hack for testing)
localStorage.removeItem('user-timezone')
// Then refresh - will generate new insight
```

### Test Error Handling
```bash
# Break the API key temporarily
supabase secrets set OPENAI_API_KEY=invalid-key

# Refresh dashboard - should see fallback message
# Then restore
supabase secrets set OPENAI_API_KEY=your-real-key
```

### Force Regenerate Today's Insight
```sql
-- In Supabase SQL Editor
DELETE FROM daily_insights 
WHERE user_id = 'your-user-id' 
AND local_date = CURRENT_DATE;

-- Then refresh dashboard
```

---

## 📈 Monitoring

### Check Logs
```bash
supabase functions logs daily-insight --follow
```

### Check Database
```sql
-- Today's insights
SELECT * FROM daily_insights 
WHERE local_date = CURRENT_DATE;

-- Recent insights by user
SELECT user_id, local_date, insight 
FROM daily_insights 
ORDER BY created_at DESC 
LIMIT 10;
```

### Check Costs
- OpenAI Dashboard → Usage
- Expected: ~1 call per active user per day
- Model: gpt-4o-mini (~$0.00015 per insight)

---

## 🐛 Troubleshooting

| Issue | Fix |
|-------|-----|
| No insight appears | Check browser console, verify auth |
| "Generating..." forever | Check network tab, edge function logs |
| Same insight every day | Verify timezone, check local_date values |
| OpenAI errors | Check secrets set, API key valid, credits available |

---

## 📚 Full Documentation

- **Complete details**: See `DAILY_INSIGHTS_IMPLEMENTATION.md`
- **Deployment steps**: See `DEPLOYMENT_CHECKLIST.md`
- **Overview**: See `IMPLEMENTATION_SUMMARY.md`

---

## 🎯 What Users See

**Old (Hardcoded):**
> "Start small and build momentum. Complete one habit today to boost your progress!"

**New (AI-Generated, Personalized):**
> "Sarah, you're crushing that 7-day workout streak! Keep the momentum going with your water intake today."

---

## 💡 Tips

1. **First deployment**: Expect 2-5 seconds for first insight generation
2. **Subsequent loads**: Should be instant (cached in database)
3. **After midnight**: New insight generates on first visit
4. **Timezone matters**: Uses browser timezone, auto-syncs to profile
5. **Errors are graceful**: Users always see a message, never an error

---

## ✨ Success Metrics

After 1 week, check:
- [ ] >90% of active users seeing daily insights
- [ ] >90% cache hit rate (logged insights vs. new)
- [ ] <1% error rate
- [ ] <3 second average load time

---

**That's it! Your AI daily insights are live! 🎉**

Questions? Check the full docs or review the code:
- Edge Function: `supabase/functions/daily-insight/index.ts`
- Server Action: `lib/actions/daily-insights.ts`
- Dashboard UI: `app/dashboard/DashboardClient.tsx`

