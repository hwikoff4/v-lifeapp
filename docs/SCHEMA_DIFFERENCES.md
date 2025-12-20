# Schema Differences: Remote vs Local

## Summary
Successfully pulled remote schema on 2025-12-03. The remote database is mostly in sync with local migrations, but there are a few key differences.

## ✅ Tables Present in Remote
All expected tables are present:
- profiles, workouts, exercises, workout_exercises, exercise_logs
- meals, meal_logs, grocery_lists
- habits, habit_logs, streaks
- posts, comments, post_reactions, follows
- challenges, challenge_participants
- weight_entries, progress_photos
- supplements, supplement_logs
- referrals, credit_transactions, affiliate_applications
- notification_logs

## 🔍 Key Differences

### 1. **Profiles Table - Missing `email` Column** ✅ RESOLVED
- **Remote**: Does NOT have `email` column ✅ CORRECT
- **Local (004_clean_reset_schema.sql)**: Has `email TEXT UNIQUE NOT NULL` ❌ INCORRECT
- **Analysis**: 
  - Email is stored in `auth.users` table (Supabase auth)
  - `createProfile()` function doesn't use email parameter
  - Application code doesn't query email from profiles table
- **Action**: ✅ Remote is correct. Local migration file should be updated to remove email column

### 2. **Posts Table - Title Constraint**
- **Remote**: `title TEXT NOT NULL` (required)
- **Local (004_clean_reset_schema.sql)**: `title TEXT` (nullable)
- **Impact**: Remote requires title, local allows null
- **Action**: Decide which is correct and align

### 3. **Duplicate RLS Policies for Profiles**
- **Remote**: Has both:
  - "Users can insert own profile" (line 1194)
  - "Users can insert their own profile" (line 1198)
- **Impact**: Redundant policies, should clean up
- **Action**: Remove duplicate policy

### 4. **Additional Functions in Remote**
- **Remote**: Has `handle_new_user()` function (lines 75-103)
  - Automatically creates profile when auth user is created
  - Uses trigger `on_auth_user_created`
- **Local**: Not in migration files
- **Impact**: This is good! Auto-creates profiles
- **Action**: Consider documenting this or adding to local migrations

- **Remote**: Has `increment_comments_count()` function (lines 109-117)
- **Local**: Not in migration files
- **Impact**: Helper function for comments
- **Action**: Consider adding to local migrations

### 5. **Storage Policies**
- **Remote**: Has storage bucket policies for:
  - `exercise-images` bucket
  - `meal-images` bucket
- **Local**: These are in separate scripts (006_create_exercise_images_storage.sql, 007_create_meal_images_storage.sql)
- **Status**: ✅ In sync

## ✅ What's Correctly Synced

1. All notification preference columns in profiles ✅
2. Timezone and last_habit_reset columns ✅
3. Onboarding_completed column ✅
4. All RLS policies (except duplicate) ✅
5. All indexes ✅
6. All triggers ✅
7. All foreign key constraints ✅

## 📋 Recommended Actions

### High Priority
1. ✅ **Email column**: Remote is correct - email belongs in `auth.users`, not `profiles`. Update local migration to remove email.

2. **Remove duplicate RLS policy**:
   ```sql
   DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
   ```

### Medium Priority
3. **Align posts.title constraint** - decide if title should be required or nullable

4. **Document handle_new_user() function** - add to local migrations or documentation

### Low Priority
5. **Add increment_comments_count() to local migrations** for consistency

## Migration Status

The remote database appears to have been created using a combination of:
- `004_clean_reset_schema.sql` (base schema)
- `004_add_notification_preferences.sql` ✅
- `005_add_timezone_to_profiles.sql` ✅
- `006_add_onboarding_completed.sql` ✅
- `009_fix_profiles_rls.sql` ✅ (but has duplicate)
- Storage bucket scripts ✅

**Status**: Remote database is correct! The local migration file incorrectly includes `email` column which should not be in profiles table (email is in auth.users).

