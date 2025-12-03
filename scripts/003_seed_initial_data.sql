-- V-Life Fitness App - Seed Initial Data
-- This script populates the database with initial data

-- ============================================================================
-- SEED EXERCISES
-- ============================================================================

INSERT INTO exercises (name, category, muscle_group, equipment, description) VALUES
-- Strength Exercises
('Bench Press', 'strength', 'Chest', 'Barbell', 'Classic chest exercise for building upper body strength'),
('Dumbbell Bench Press', 'strength', 'Chest', 'Dumbbells', 'Chest exercise with greater range of motion'),
('Push-Ups', 'strength', 'Chest', 'Bodyweight', 'Bodyweight chest exercise'),
('Incline Bench Press', 'strength', 'Chest', 'Barbell', 'Targets upper chest'),
('Pull-Ups', 'strength', 'Back', 'Pull-up Bar', 'Compound back exercise'),
('Lat Pulldown', 'strength', 'Back', 'Cable Machine', 'Back exercise alternative to pull-ups'),
('Barbell Row', 'strength', 'Back', 'Barbell', 'Compound back exercise'),
('Deadlift', 'strength', 'Back', 'Barbell', 'Full body compound exercise'),
('Squats', 'strength', 'Legs', 'Barbell', 'King of leg exercises'),
('Leg Press', 'strength', 'Legs', 'Machine', 'Leg exercise with machine support'),
('Lunges', 'strength', 'Legs', 'Dumbbells', 'Unilateral leg exercise'),
('Romanian Deadlift', 'strength', 'Legs', 'Barbell', 'Hamstring focused exercise'),
('Shoulder Press', 'strength', 'Shoulders', 'Barbell', 'Overhead pressing movement'),
('Dumbbell Shoulder Press', 'strength', 'Shoulders', 'Dumbbells', 'Shoulder press with dumbbells'),
('Lateral Raises', 'strength', 'Shoulders', 'Dumbbells', 'Isolation exercise for side delts'),
('Bicep Curls', 'strength', 'Arms', 'Dumbbells', 'Classic bicep exercise'),
('Hammer Curls', 'strength', 'Arms', 'Dumbbells', 'Bicep exercise with neutral grip'),
('Tricep Extensions', 'strength', 'Arms', 'Dumbbells', 'Tricep isolation exercise'),
('Tricep Dips', 'strength', 'Arms', 'Bodyweight', 'Compound tricep exercise'),
('Plank', 'strength', 'Core', 'Bodyweight', 'Core stability exercise'),

-- Cardio Exercises
('Running', 'cardio', 'Full Body', 'None', 'Classic cardiovascular exercise'),
('Cycling', 'cardio', 'Legs', 'Bike', 'Low-impact cardio exercise'),
('Rowing', 'cardio', 'Full Body', 'Rowing Machine', 'Full body cardio workout'),
('Jump Rope', 'cardio', 'Full Body', 'Jump Rope', 'High-intensity cardio'),
('Swimming', 'cardio', 'Full Body', 'Pool', 'Low-impact full body cardio'),
('Elliptical', 'cardio', 'Full Body', 'Elliptical Machine', 'Low-impact cardio machine'),
('Stair Climber', 'cardio', 'Legs', 'Stair Machine', 'Leg-focused cardio'),
('Burpees', 'cardio', 'Full Body', 'Bodyweight', 'High-intensity full body exercise')
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- SEED SUPPLEMENTS
-- ============================================================================

INSERT INTO supplements (name, category, description, benefits, recommended_dosage, recommended_time, featured, product_url) VALUES
('Vital Flow', 'Testosterone Support', 'Premium testosterone booster formulated with natural ingredients to optimize hormone levels and maximize fitness results', 
  ARRAY['Naturally boost testosterone levels', 'Enhance muscle growth and recovery', 'Improve energy and vitality', 'Support healthy hormone balance'],
  '2 capsules', 'Morning', true, '#'),
('Protein Powder', 'Muscle Building', 'High-quality whey protein to fuel muscle growth and recovery after intense workouts',
  ARRAY['Supports muscle growth', 'Aids recovery', 'Convenient protein source'],
  '1 scoop', 'Post-workout', false, '#'),
('Creatine', 'Performance', 'Proven supplement for increasing strength, power output, and lean muscle mass',
  ARRAY['Increases strength', 'Improves performance', 'Enhances muscle mass'],
  '5g', 'Morning', false, '#'),
('Multivitamin', 'General Health', 'Complete daily vitamin and mineral support for optimal health and performance',
  ARRAY['Fills nutritional gaps', 'Supports immune system', 'Boosts overall health'],
  '1 tablet', 'Morning', false, '#'),
('Omega-3 Fish Oil', 'General Health', 'Essential fatty acids for heart health, brain function, and inflammation reduction',
  ARRAY['Supports heart health', 'Reduces inflammation', 'Improves brain function'],
  '2 capsules', 'With meals', false, '#'),
('Pre-Workout', 'Performance', 'Energy and focus formula to maximize workout intensity and performance',
  ARRAY['Increases energy', 'Enhances focus', 'Improves endurance'],
  '1 scoop', '30 min before workout', false, '#')
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- SEED CHALLENGES
-- ============================================================================

INSERT INTO challenges (title, description, challenge_type, target_value, duration_days, start_date, end_date, participants_count) VALUES
('30-Day Consistency Challenge', 'Complete 30 workouts in 30 days', 'workout', 30, 30, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 156),
('10K Steps Daily', 'Hit 10,000 steps every day this week', 'steps', 10000, 7, CURRENT_DATE, CURRENT_DATE + INTERVAL '7 days', 234),
('Protein Goal Master', 'Meet your protein goal for 14 days straight', 'nutrition', 14, 14, CURRENT_DATE, CURRENT_DATE + INTERVAL '14 days', 189),
('Morning Workout Streak', 'Complete a morning workout for 21 days', 'workout', 21, 21, CURRENT_DATE, CURRENT_DATE + INTERVAL '21 days', 98),
('Hydration Challenge', 'Drink 8 glasses of water daily for 30 days', 'habit', 30, 30, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 312);
