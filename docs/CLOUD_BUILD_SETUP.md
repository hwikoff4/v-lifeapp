# Cloud Build Trigger Setup

## Critical: Set Substitution Variables in Trigger

The `cloudbuild.yaml` file has default substitutions, but **you must also set them in your Cloud Build trigger** for them to work.

## Steps to Fix:

1. **Go to Cloud Build → Triggers**
2. **Click on your trigger** (or create a new one)
3. **Scroll down to "Substitution variables"**
4. **Add these variables:**

```
_NEXT_PUBLIC_SUPABASE_URL = https://xiezvibwxvsulfiooknp.supabase.co
_NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpZXp2aWJ3eHZzdWxmaW9va25wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4NzU5MjcsImV4cCI6MjA3NzQ1MTkyN30.DIEEkCqaznYNJbIxstDWgdzFxIelCp5fxjI6Ka885pA
_NEXT_PUBLIC_APP_URL = https://v-life-placeholder.run.app
_REGION = us-central1
_SERVICE_NAME = v-life
_MIN_INSTANCES = 0
_MAX_INSTANCES = 5
```

5. **Save the trigger**
6. **Run the build again**

## Why This Is Needed

Cloud Build trigger substitutions **override** the ones in `cloudbuild.yaml`. If the trigger doesn't have them set, they'll be empty, causing the build to fail.

## After First Deploy

Once your service is deployed, get the actual Cloud Run URL and update `_NEXT_PUBLIC_APP_URL` in the trigger:

```bash
gcloud run services describe v-life --region us-central1 --format 'value(status.url)'
```

Then update the substitution variable in your trigger with that URL.

