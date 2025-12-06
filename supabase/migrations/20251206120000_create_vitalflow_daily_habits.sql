-- ============================================================================
-- VitalFlow Daily Habits System
-- ============================================================================
-- This migration creates the schema for AI-powered daily habit suggestions
-- that adapt to user data and context without constantly recalculating the
-- base metabolic/calorie plan.

-- Enable pgvector extension for RAG (if not already enabled)
create extension if not exists vector;

-- ============================================================================
-- VITALFLOW HABITS KNOWLEDGE BASE (for RAG)
-- ============================================================================
-- This table stores the knowledge base of habit templates and coaching wisdom
-- that the AI uses to generate contextually appropriate suggestions.

create table if not exists public.vitalflow_habits_knowledge (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  category text not null check (category in ('movement', 'nutrition', 'sleep', 'mindset', 'recovery', 'hydration')),
  tags text[] default '{}',
  goal_segments text[] default '{}', -- e.g., ['fat_loss', 'muscle_gain', 'strength', 'endurance', 'stress_reduction']
  contraindications text[] default '{}', -- e.g., ['injury', 'poor_sleep', 'overtraining']
  default_energy_delta_kcal integer default 0, -- typical calorie impact
  default_time_minutes integer default 10,
  difficulty_level text check (difficulty_level in ('easy', 'moderate', 'hard')),
  embedding vector(1536), -- OpenAI text-embedding-3-small
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_vitalflow_habits_knowledge_category 
  on public.vitalflow_habits_knowledge(category);

create index if not exists idx_vitalflow_habits_knowledge_goal_segments 
  on public.vitalflow_habits_knowledge using gin(goal_segments);

create index if not exists idx_vitalflow_habits_knowledge_tags 
  on public.vitalflow_habits_knowledge using gin(tags);

-- HNSW index for fast vector similarity search
create index if not exists idx_vitalflow_habits_knowledge_embedding 
  on public.vitalflow_habits_knowledge using hnsw (embedding vector_cosine_ops);

comment on table public.vitalflow_habits_knowledge is 
  'Knowledge base of habit templates for VitalFlow AI suggestions with RAG';

-- ============================================================================
-- VITALFLOW HABIT TEMPLATES (User-specific or Global)
-- ============================================================================
-- Extends the existing habits table concept with templates that can be
-- user-specific or global (user_id = null for global templates).
-- This table can be used to create reusable habit patterns.

create table if not exists public.vitalflow_habit_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade, -- null = global template
  title text not null,
  description text,
  category text not null check (category in ('movement', 'nutrition', 'sleep', 'mindset', 'recovery', 'hydration')),
  default_energy_delta_kcal integer default 0,
  default_time_minutes integer default 10,
  tags text[] default '{}',
  is_template boolean default true, -- true = template, false = user-created habit
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_vitalflow_habit_templates_user_id 
  on public.vitalflow_habit_templates(user_id);

create index if not exists idx_vitalflow_habit_templates_category 
  on public.vitalflow_habit_templates(category);

create index if not exists idx_vitalflow_habit_templates_is_template 
  on public.vitalflow_habit_templates(is_template);

comment on table public.vitalflow_habit_templates is 
  'Reusable habit templates for VitalFlow suggestions';

-- ============================================================================
-- DAILY HABIT SUGGESTIONS
-- ============================================================================
-- AI-generated habit suggestions for each user, per day.
-- These are the actual suggestions shown to the user.

create table if not exists public.daily_habit_suggestions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null default current_date,
  habit_template_id uuid references public.vitalflow_habit_templates(id) on delete set null, -- nullable for brand-new AI suggestions
  knowledge_id uuid references public.vitalflow_habits_knowledge(id) on delete set null, -- link to source knowledge
  title text not null,
  reason text, -- AI-generated explanation for why this habit was suggested
  category text not null check (category in ('movement', 'nutrition', 'sleep', 'mindset', 'recovery', 'hydration')),
  source text not null check (source in ('ai', 'template', 'manual')) default 'ai',
  energy_delta_kcal integer default 0, -- estimated calorie impact for this specific suggestion
  time_minutes integer default 10,
  tags text[] default '{}',
  rank integer default 0, -- priority ranking (1 = highest)
  status text not null check (status in ('suggested', 'accepted', 'skipped', 'completed', 'failed')) default 'suggested',
  skip_reason text, -- if skipped, why? (e.g., "Too busy", "Injury", "Already did it")
  completion_ratio numeric(3,2) default 0, -- 0.0 to 1.0 for partial completions
  completed_at timestamptz,
  metadata jsonb default '{}', -- flexible storage for AI context, user notes, etc.
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint daily_habit_suggestions_user_date_rank_unique unique (user_id, date, rank)
);

create index if not exists idx_daily_habit_suggestions_user_date 
  on public.daily_habit_suggestions(user_id, date desc);

create index if not exists idx_daily_habit_suggestions_status 
  on public.daily_habit_suggestions(user_id, status);

create index if not exists idx_daily_habit_suggestions_category 
  on public.daily_habit_suggestions(category);

create index if not exists idx_daily_habit_suggestions_date 
  on public.daily_habit_suggestions(date desc);

comment on table public.daily_habit_suggestions is 
  'AI-generated daily habit suggestions for users in the VitalFlow system';

-- ============================================================================
-- HABIT EVENTS (Completion & Learning Log)
-- ============================================================================
-- Detailed log of habit completions, failures, and partial completions.
-- Used to personalize future suggestions and track long-term behavior.

create table if not exists public.habit_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  suggestion_id uuid references public.daily_habit_suggestions(id) on delete cascade, -- nullable if logging a non-suggested habit
  habit_template_id uuid references public.vitalflow_habit_templates(id) on delete set null,
  date date not null default current_date,
  status text not null check (status in ('completed', 'partial', 'failed', 'skipped')),
  completion_ratio numeric(3,2) default 1.0, -- 0.0 to 1.0
  actual_time_minutes integer,
  actual_energy_delta_kcal integer,
  context_json jsonb default '{}', -- store contextual info like sleep quality, stress level, etc.
  notes text,
  logged_at timestamptz default now()
);

create index if not exists idx_habit_events_user_date 
  on public.habit_events(user_id, date desc);

create index if not exists idx_habit_events_suggestion_id 
  on public.habit_events(suggestion_id);

create index if not exists idx_habit_events_status 
  on public.habit_events(status);

comment on table public.habit_events is 
  'Detailed log of habit completions for learning and personalization';

-- ============================================================================
-- WEEKLY REFLECTIONS (User Check-ins)
-- ============================================================================
-- Lightweight weekly check-ins to capture user sentiment and adjust AI suggestions.

create table if not exists public.weekly_reflections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  week_start_date date not null,
  fatigue_level integer check (fatigue_level between 1 and 10), -- 1 = very low, 10 = extremely high
  enjoyment_level integer check (enjoyment_level between 1 and 10), -- 1 = not enjoying, 10 = loving it
  difficulty_level integer check (difficulty_level between 1 and 10), -- 1 = too easy, 10 = too hard
  notes text,
  created_at timestamptz default now(),
  constraint weekly_reflections_user_week_unique unique (user_id, week_start_date)
);

create index if not exists idx_weekly_reflections_user_week 
  on public.weekly_reflections(user_id, week_start_date desc);

comment on table public.weekly_reflections is 
  'Weekly user reflections to tune VitalFlow suggestions';

-- ============================================================================
-- AI LOGS (Auditing & Debugging)
-- ============================================================================
-- Log AI function calls, prompts, and responses for monitoring and debugging.

create table if not exists public.ai_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  function_name text not null, -- e.g., 'vitalflow-daily-habits'
  prompt_hash text, -- hash of the prompt for deduplication
  input_data jsonb, -- sanitized input
  output_data jsonb, -- sanitized output
  model text, -- e.g., 'gpt-4o-mini'
  tokens_used integer,
  duration_ms integer,
  error text,
  created_at timestamptz default now()
);

create index if not exists idx_ai_logs_user_function 
  on public.ai_logs(user_id, function_name, created_at desc);

create index if not exists idx_ai_logs_created_at 
  on public.ai_logs(created_at desc);

comment on table public.ai_logs is 
  'Audit log for AI function calls in VitalFlow system';

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- vitalflow_habits_knowledge: read-only for all authenticated users (global knowledge)
alter table public.vitalflow_habits_knowledge enable row level security;

create policy "Anyone can view active knowledge"
  on public.vitalflow_habits_knowledge for select
  using (is_active = true);

-- vitalflow_habit_templates: users can view global templates + their own
alter table public.vitalflow_habit_templates enable row level security;

create policy "Users can view global templates and own templates"
  on public.vitalflow_habit_templates for select
  using (user_id is null or auth.uid() = user_id);

create policy "Users can create own templates"
  on public.vitalflow_habit_templates for insert
  with check (auth.uid() = user_id);

create policy "Users can update own templates"
  on public.vitalflow_habit_templates for update
  using (auth.uid() = user_id);

create policy "Users can delete own templates"
  on public.vitalflow_habit_templates for delete
  using (auth.uid() = user_id);

-- daily_habit_suggestions: users can only access their own
alter table public.daily_habit_suggestions enable row level security;

create policy "Users can view own suggestions"
  on public.daily_habit_suggestions for select
  using (auth.uid() = user_id);

create policy "Users can create own suggestions"
  on public.daily_habit_suggestions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own suggestions"
  on public.daily_habit_suggestions for update
  using (auth.uid() = user_id);

create policy "Users can delete own suggestions"
  on public.daily_habit_suggestions for delete
  using (auth.uid() = user_id);

-- habit_events: users can only access their own
alter table public.habit_events enable row level security;

create policy "Users can view own events"
  on public.habit_events for select
  using (auth.uid() = user_id);

create policy "Users can create own events"
  on public.habit_events for insert
  with check (auth.uid() = user_id);

create policy "Users can update own events"
  on public.habit_events for update
  using (auth.uid() = user_id);

create policy "Users can delete own events"
  on public.habit_events for delete
  using (auth.uid() = user_id);

-- weekly_reflections: users can only access their own
alter table public.weekly_reflections enable row level security;

create policy "Users can view own reflections"
  on public.weekly_reflections for select
  using (auth.uid() = user_id);

create policy "Users can create own reflections"
  on public.weekly_reflections for insert
  with check (auth.uid() = user_id);

create policy "Users can update own reflections"
  on public.weekly_reflections for update
  using (auth.uid() = user_id);

create policy "Users can delete own reflections"
  on public.weekly_reflections for delete
  using (auth.uid() = user_id);

-- ai_logs: users can only view their own logs
alter table public.ai_logs enable row level security;

create policy "Users can view own AI logs"
  on public.ai_logs for select
  using (auth.uid() = user_id);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to match habits knowledge by embedding similarity (RAG)
create or replace function public.match_vitalflow_habits_knowledge(
  query_embedding vector(1536),
  match_threshold float default 0.5,
  match_count int default 10,
  filter_categories text[] default null,
  filter_goal_segments text[] default null
)
returns table (
  id uuid,
  title text,
  body text,
  category text,
  tags text[],
  goal_segments text[],
  default_energy_delta_kcal integer,
  default_time_minutes integer,
  difficulty_level text,
  similarity float
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select
    hk.id,
    hk.title,
    hk.body,
    hk.category,
    hk.tags,
    hk.goal_segments,
    hk.default_energy_delta_kcal,
    hk.default_time_minutes,
    hk.difficulty_level,
    1 - (hk.embedding <=> query_embedding) as similarity
  from public.vitalflow_habits_knowledge hk
  where hk.is_active = true
    and hk.embedding is not null
    and (filter_categories is null or hk.category = any(filter_categories))
    and (filter_goal_segments is null or hk.goal_segments && filter_goal_segments)
    and 1 - (hk.embedding <=> query_embedding) > match_threshold
  order by hk.embedding <=> query_embedding
  limit match_count;
end;
$$;

grant execute on function public.match_vitalflow_habits_knowledge to authenticated;

comment on function public.match_vitalflow_habits_knowledge is 
  'Find similar habit knowledge using vector similarity search (RAG)';

-- Function to get user habit adherence summary (for AI personalization)
create or replace function public.get_user_habit_adherence_summary(
  p_user_id uuid,
  p_days int default 30
)
returns table (
  total_suggestions integer,
  accepted_count integer,
  completed_count integer,
  skipped_count integer,
  acceptance_rate numeric,
  completion_rate numeric,
  avg_completion_ratio numeric,
  most_accepted_category text,
  most_skipped_category text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_total integer;
  v_accepted integer;
  v_completed integer;
  v_skipped integer;
  v_most_accepted text;
  v_most_skipped text;
begin
  -- Get counts
  select 
    count(*),
    count(*) filter (where status = 'accepted' or status = 'completed'),
    count(*) filter (where status = 'completed'),
    count(*) filter (where status = 'skipped')
  into v_total, v_accepted, v_completed, v_skipped
  from public.daily_habit_suggestions
  where user_id = p_user_id
    and date >= current_date - p_days;

  -- Most accepted category
  select category into v_most_accepted
  from public.daily_habit_suggestions
  where user_id = p_user_id
    and date >= current_date - p_days
    and (status = 'accepted' or status = 'completed')
  group by category
  order by count(*) desc
  limit 1;

  -- Most skipped category
  select category into v_most_skipped
  from public.daily_habit_suggestions
  where user_id = p_user_id
    and date >= current_date - p_days
    and status = 'skipped'
  group by category
  order by count(*) desc
  limit 1;

  return query
  select 
    v_total,
    v_accepted,
    v_completed,
    v_skipped,
    case when v_total > 0 then round(v_accepted::numeric / v_total, 2) else 0 end,
    case when v_accepted > 0 then round(v_completed::numeric / v_accepted, 2) else 0 end,
    (select avg(completion_ratio) from public.habit_events where user_id = p_user_id and date >= current_date - p_days),
    v_most_accepted,
    v_most_skipped;
end;
$$;

grant execute on function public.get_user_habit_adherence_summary to authenticated;

comment on function public.get_user_habit_adherence_summary is 
  'Get user habit adherence statistics for AI personalization';

-- Function to calculate today's expected energy burn from accepted habits
create or replace function public.get_todays_habit_energy_delta(
  p_user_id uuid,
  p_date date default current_date
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_total_delta integer;
begin
  select coalesce(sum(energy_delta_kcal), 0)
  into v_total_delta
  from public.daily_habit_suggestions
  where user_id = p_user_id
    and date = p_date
    and (status = 'accepted' or status = 'completed');
  
  return v_total_delta;
end;
$$;

grant execute on function public.get_todays_habit_energy_delta to authenticated;

comment on function public.get_todays_habit_energy_delta is 
  'Calculate total energy delta from accepted habits for a given day';

-- Trigger to auto-update updated_at timestamp
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger update_vitalflow_habits_knowledge_updated_at
  before update on public.vitalflow_habits_knowledge
  for each row
  execute function public.update_updated_at_column();

create trigger update_vitalflow_habit_templates_updated_at
  before update on public.vitalflow_habit_templates
  for each row
  execute function public.update_updated_at_column();

create trigger update_daily_habit_suggestions_updated_at
  before update on public.daily_habit_suggestions
  for each row
  execute function public.update_updated_at_column();

