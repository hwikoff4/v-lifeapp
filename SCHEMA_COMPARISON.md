# Database Schema Comparison

This document helps compare the local SQL migration files with the remote Supabase database.

## Local Migration Files Summary

### Core Schema Files:
1. **001_create_tables.sql** - Initial basic tables (profiles, workouts, exercises, meals, habits, posts, comments, likes, follows)
2. **002_create_comprehensive_schema.sql** - Complete schema with all tables (drops and recreates everything)
3. **004_clean_reset_schema.sql** - Clean reset schema (most comprehensive, includes email in profiles)

### Migration Files (incremental):
- **004_add_notification_preferences.sql** - Adds notification columns to profiles + notification_logs table
- **005_add_timezone_to_profiles.sql** - Adds timezone and last_habit_reset columns
- **005_create_profile_trigger.sql** - Profile creation trigger
- **006_add_community_functions.sql** - Community-related functions
- **006_add_onboarding_completed.sql** - Adds onboarding_completed column
- **006_create_exercise_images_storage.sql** - Storage bucket setup
- **007_create_meal_images_storage.sql** - Storage bucket setup
- **007_fix_profile_trigger.sql** - Fixes profile trigger
- **008_add_onboarding_completed_column.sql** - Another onboarding_completed migration (with DO block)
- **009_fix_profiles_rls.sql** - Fixes RLS policies for profiles

## Expected Tables (from 004_clean_reset_schema.sql):

1. **profiles** - User profiles (with email, name, onboarding_completed, timezone, notification prefs)
2. **workouts** - Workout sessions
3. **exercises** - Exercise catalog
4. **workout_exercises** - Junction table for workouts and exercises
5. **exercise_logs** - Exercise completion logs
6. **meals** - Meal catalog
7. **meal_logs** - Meal consumption logs
8. **grocery_lists** - Shopping lists
9. **habits** - User habits
10. **habit_logs** - Habit completion logs
11. **streaks** - Streak tracking
12. **posts** - Community posts
13. **comments** - Post comments
14. **post_reactions** - Post reactions (replaces likes)
15. **follows** - User follows
16. **challenges** - Community challenges
17. **challenge_participants** - Challenge participation
18. **weight_entries** - Weight tracking
19. **progress_photos** - Progress photos
20. **supplements** - Supplement catalog
21. **supplement_logs** - Supplement logs
22. **referrals** - Referral tracking
23. **credit_transactions** - Credit transactions
24. **affiliate_applications** - Affiliate applications
25. **notification_logs** - Notification logs (from 004_add_notification_preferences.sql)

## Key Differences to Check:

### Profiles Table:
- Should have `email` column (from 004_clean_reset_schema.sql)
- Should have `onboarding_completed` (from 006 or 008)
- Should have `timezone` (from 005)
- Should have notification preference columns (from 004_add_notification_preferences.sql)

### Posts Table:
- Should have `title` column (nullable in 004_clean_reset_schema.sql)
- Should use `post_reactions` instead of `likes` table

### RLS Policies:
- Profiles should have "Public profiles viewable" policy (from 004_clean_reset_schema.sql line 422)
- Should have service_role policy for profile insertion (from 009_fix_profiles_rls.sql)

## How to Compare:

1. Run `scripts/inspect-remote-schema.sql` in Supabase SQL Editor
2. Compare the output with the expected schema above
3. Check for missing tables, columns, or policies
4. Apply any missing migrations in order

## Recommended Migration Order:

If starting fresh or syncing:
1. Run `004_clean_reset_schema.sql` (drops everything and recreates)
2. Run `004_add_notification_preferences.sql`
3. Run `005_add_timezone_to_profiles.sql`
4. Run `005_create_profile_trigger.sql` (or 007_fix_profile_trigger.sql if issues)
5. Run `006_add_onboarding_completed.sql` or `008_add_onboarding_completed_column.sql`
6. Run `009_fix_profiles_rls.sql`
7. Run storage bucket scripts if needed (006_create_exercise_images_storage.sql, 007_create_meal_images_storage.sql)

