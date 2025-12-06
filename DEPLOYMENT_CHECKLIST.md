# Daily Insights Deployment Checklist

Follow these steps to deploy the AI-generated daily insights feature to production.

## Prerequisites

- [ ] Supabase project is set up and configured
- [ ] Supabase CLI installed (`npm install -g supabase`)
- [ ] OpenAI API key available
- [ ] Access to Supabase project secrets

## Step 1: Database Migration

### Apply the Migration

```bash
# Link to your Supabase project (if not already linked)
supabase link --project-ref your-project-ref

# Push the migration to create daily_insights table
supabase db push

# Or run specific migration
supabase migration up 20251206000000_create_daily_insights
```

### Verify Migration

```bash
# Connect to database and verify table exists
supabase db reset --db-url "your-db-connection-string"

# Or check via SQL
psql "your-db-connection-string" -c "SELECT * FROM daily_insights LIMIT 1;"
```

## Step 2: Configure Environment Variables

### Set OpenAI API Key in Supabase

```bash
# Set the OpenAI API key as a Supabase secret
supabase secrets set OPENAI_API_KEY=sk-your-openai-api-key-here

# Verify it's set
supabase secrets list
```

Expected output:
```
OPENAI_API_KEY: sk-***...***
```

## Step 3: Deploy Edge Function

### Deploy the Function

```bash
# Deploy the daily-insight edge function
supabase functions deploy daily-insight

# Verify deployment
supabase functions list
```

Expected output should show `daily-insight` in the list of deployed functions.

### Test Edge Function

```bash
# Test with a sample request (requires auth token)
curl -i --location --request POST \
  'https://your-project-ref.supabase.co/functions/v1/daily-insight' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"localDate":"2024-12-06","timezone":"America/New_York"}'
```

## Step 4: Deploy Frontend Changes

### Build and Deploy Next.js App

```bash
# Install dependencies (if needed)
npm install

# Build the app
npm run build

# Test locally
npm run start

# Deploy to your hosting provider (Vercel, etc.)
# For Vercel:
vercel --prod

# For other platforms, follow their deployment docs
```

## Step 5: Verify End-to-End

### Manual Testing

1. **Login to Dashboard**
   - [ ] Open the app in a browser
   - [ ] Login with a test user account
   - [ ] Navigate to dashboard

2. **First Visit - Generate Insight**
   - [ ] Verify "Generating your daily insight..." loading state appears
   - [ ] Wait for insight to load (should take 2-5 seconds)
   - [ ] Verify personalized insight appears in AI Insight card
   - [ ] Check browser console - no errors
   - [ ] Check timezone was synced (localStorage key: `user-timezone`)

3. **Second Visit - Cache Check**
   - [ ] Refresh the page
   - [ ] Insight should load much faster (from cache)
   - [ ] Same insight text should appear
   - [ ] Check browser network tab - Edge Function should return cached: true

4. **Database Verification**
   ```sql
   -- Check insight was saved
   SELECT * FROM daily_insights 
   WHERE user_id = 'test-user-id' 
   ORDER BY created_at DESC 
   LIMIT 1;
   ```

5. **Error Handling**
   - [ ] Temporarily break OpenAI key in Supabase secrets
   - [ ] Reload dashboard
   - [ ] Verify fallback message appears (not an error)
   - [ ] Restore OpenAI key

6. **Timezone Testing**
   - [ ] Change browser timezone (use DevTools device emulation)
   - [ ] Reload dashboard
   - [ ] Verify timezone updates in profile
   - [ ] Check localStorage updated

### Cross-Browser Testing

Test in multiple browsers:
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari (if available)
- [ ] Mobile browsers (iOS Safari, Chrome Mobile)

## Step 6: Monitor in Production

### Check Edge Function Logs

```bash
# View real-time logs
supabase functions logs daily-insight --follow

# Or in Supabase Dashboard:
# Functions > daily-insight > Logs
```

### Monitor Database

```sql
-- Count insights generated per day
SELECT local_date, COUNT(*) as insight_count
FROM daily_insights
GROUP BY local_date
ORDER BY local_date DESC;

-- Check for errors (no insights for active users)
SELECT u.id, u.email, di.local_date
FROM auth.users u
LEFT JOIN daily_insights di ON u.id = di.user_id 
  AND di.local_date = CURRENT_DATE
WHERE di.id IS NULL
LIMIT 10;
```

### Set Up Alerts (Optional)

Consider setting up alerts for:
- Edge Function error rate > 5%
- OpenAI API failures
- Database constraint violations
- Unusually low insight generation

## Step 7: Performance Optimization

### Verify Caching

```bash
# Check database query performance
EXPLAIN ANALYZE 
SELECT insight FROM daily_insights 
WHERE user_id = 'test-user-id' 
AND local_date = CURRENT_DATE;
```

Should use index: `idx_daily_insights_user_date`

### Monitor API Costs

- [ ] Track OpenAI API usage in OpenAI dashboard
- [ ] Expected: ~1 call per active user per day
- [ ] Monitor for unexpected spikes

## Rollback Plan

If issues occur in production:

### Immediate Rollback

1. **Revert Dashboard UI**
   ```bash
   # Revert to previous commit
   git revert HEAD
   git push
   
   # Redeploy
   vercel --prod
   ```

2. **Keep Edge Function Running**
   - Edge Function can stay deployed (won't be called if UI reverted)
   - No need to remove database table (harmless)

3. **If Database Issues**
   ```sql
   -- Temporarily disable RLS (EMERGENCY ONLY)
   ALTER TABLE daily_insights DISABLE ROW LEVEL SECURITY;
   
   -- Or drop table entirely
   DROP TABLE daily_insights CASCADE;
   ```

### Gradual Rollout (Alternative)

Use feature flags to enable for subset of users:

```typescript
// In DashboardClient.tsx
const enableAIInsights = process.env.NEXT_PUBLIC_ENABLE_AI_INSIGHTS === 'true'

// Only load if enabled
if (enableAIInsights) {
  loadDailyInsight()
}
```

## Post-Deployment

### Week 1 Monitoring

- [ ] Check daily active users vs insights generated
- [ ] Monitor OpenAI API costs
- [ ] Review user feedback
- [ ] Check error rates in logs
- [ ] Verify timezone accuracy across regions

### Week 2+ Optimization

- [ ] Analyze which insights drive most engagement
- [ ] A/B test different prompt styles
- [ ] Consider pre-generating insights at midnight
- [ ] Add user feedback mechanism ("Was this helpful?")

## Troubleshooting Common Issues

### "Not authenticated" errors
- Check Supabase auth configuration
- Verify JWT tokens are being passed correctly
- Check RLS policies on daily_insights table

### Insights not updating after midnight
- Verify timezone stored in user profile
- Check getTodayInTimezone() calculation
- Look for clock skew issues

### OpenAI rate limits
- Check OpenAI account tier
- Consider implementing request queuing
- Add exponential backoff retry logic

### Database performance issues
- Verify index usage with EXPLAIN ANALYZE
- Consider partitioning table by date (if >1M rows)
- Add connection pooling if needed

## Success Metrics

After deployment, track:
- **Adoption Rate**: % of daily active users seeing insights
- **Cache Hit Rate**: % of requests served from cache (target: >90%)
- **Error Rate**: % of failed insight generations (target: <1%)
- **API Cost**: OpenAI spend per user per month
- **Load Time**: Time to generate first insight (target: <3s)
- **User Engagement**: Do users with insights have better retention?

## Support

If you encounter issues:
1. Check Edge Function logs: `supabase functions logs daily-insight`
2. Check browser console for client errors
3. Verify database with SQL queries above
4. Review DAILY_INSIGHTS_IMPLEMENTATION.md for architecture details

---

**Deployment Date**: _____________

**Deployed By**: _____________

**Production URL**: _____________

**Notes**: _____________

