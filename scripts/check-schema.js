// Script to check remote database schema
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  console.log('Checking remote database schema...\n');
  
  // Get all tables
  const { data: tables, error: tablesError } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public');
  
  if (tablesError) {
    // Try direct SQL query
    const { data, error } = await supabase.rpc('exec_sql', {
      query: `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        ORDER BY table_name;
      `
    });
    
    if (error) {
      console.log('Cannot query information_schema directly. Using alternative method...\n');
      console.log('Please check your Supabase dashboard for the current schema.');
      console.log('Or run this SQL query in your Supabase SQL editor:');
      console.log(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        ORDER BY table_name;
      `);
      return;
    }
  }
  
  // List expected tables from local schema
  const expectedTables = [
    'profiles',
    'workouts',
    'exercises',
    'workout_exercises',
    'exercise_logs',
    'meals',
    'meal_logs',
    'grocery_lists',
    'habits',
    'habit_logs',
    'streaks',
    'posts',
    'comments',
    'post_reactions',
    'follows',
    'challenges',
    'challenge_participants',
    'weight_entries',
    'progress_photos',
    'supplements',
    'supplement_logs',
    'referrals',
    'credit_transactions',
    'affiliate_applications'
  ];
  
  console.log('Expected tables from local schema:');
  expectedTables.forEach(table => console.log(`  - ${table}`));
  console.log('\nTo compare with remote database, please:');
  console.log('1. Go to your Supabase dashboard');
  console.log('2. Navigate to SQL Editor');
  console.log('3. Run: SELECT table_name FROM information_schema.tables WHERE table_schema = \'public\' AND table_type = \'BASE TABLE\' ORDER BY table_name;');
}

checkSchema().catch(console.error);

