-- Enable pgvector extension for embeddings
-- Note: pgvector must be enabled in Supabase Dashboard > Database > Extensions first
-- Or run: create extension if not exists vector;
create extension if not exists vector;

-- Chat conversations table
create table if not exists public.chat_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text default 'New Conversation',
  summary text,
  message_count int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Chat messages with embeddings
create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references public.chat_conversations(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  embedding vector(1536),  -- OpenAI text-embedding-3-small dimension
  token_count int default 0,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

-- Create indexes for performance
create index if not exists idx_chat_conversations_user_id 
  on public.chat_conversations(user_id);

create index if not exists idx_chat_conversations_updated_at 
  on public.chat_conversations(user_id, updated_at desc);

create index if not exists idx_chat_messages_conversation_id 
  on public.chat_messages(conversation_id);

create index if not exists idx_chat_messages_user_id 
  on public.chat_messages(user_id);

create index if not exists idx_chat_messages_created_at 
  on public.chat_messages(conversation_id, created_at desc);

-- Create HNSW index for fast vector similarity search (better than ivfflat for < 1M rows)
create index if not exists idx_chat_messages_embedding 
  on public.chat_messages using hnsw (embedding vector_cosine_ops);

-- Enable RLS
alter table public.chat_conversations enable row level security;
alter table public.chat_messages enable row level security;

-- RLS policies for conversations
create policy "Users can view own conversations"
  on public.chat_conversations for select
  using (auth.uid() = user_id);

create policy "Users can create own conversations"
  on public.chat_conversations for insert
  with check (auth.uid() = user_id);

create policy "Users can update own conversations"
  on public.chat_conversations for update
  using (auth.uid() = user_id);

create policy "Users can delete own conversations"
  on public.chat_conversations for delete
  using (auth.uid() = user_id);

-- RLS policies for messages
create policy "Users can view own messages"
  on public.chat_messages for select
  using (auth.uid() = user_id);

create policy "Users can create own messages"
  on public.chat_messages for insert
  with check (auth.uid() = user_id);

create policy "Users can update own messages"
  on public.chat_messages for update
  using (auth.uid() = user_id);

create policy "Users can delete own messages"
  on public.chat_messages for delete
  using (auth.uid() = user_id);

-- Function to match chat messages by embedding similarity
create or replace function public.match_chat_messages(
  query_embedding vector(1536),
  match_user_id uuid,
  match_threshold float default 0.7,
  match_count int default 5,
  exclude_conversation_id uuid default null
)
returns table (
  id uuid,
  conversation_id uuid,
  content text,
  role text,
  similarity float,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select
    cm.id,
    cm.conversation_id,
    cm.content,
    cm.role,
    1 - (cm.embedding <=> query_embedding) as similarity,
    cm.created_at
  from public.chat_messages cm
  where cm.user_id = match_user_id
    and cm.embedding is not null
    and (exclude_conversation_id is null or cm.conversation_id != exclude_conversation_id)
    and 1 - (cm.embedding <=> query_embedding) > match_threshold
  order by cm.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- Function to get recent messages from a conversation
create or replace function public.get_recent_messages(
  p_conversation_id uuid,
  p_limit int default 10
)
returns table (
  id uuid,
  role text,
  content text,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select
    cm.id,
    cm.role,
    cm.content,
    cm.created_at
  from public.chat_messages cm
  where cm.conversation_id = p_conversation_id
  order by cm.created_at desc
  limit p_limit;
end;
$$;

-- Function to update conversation metadata after new message
create or replace function public.update_conversation_on_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.chat_conversations
  set 
    message_count = message_count + 1,
    updated_at = now(),
    -- Auto-generate title from first user message if still default
    title = case 
      when title = 'New Conversation' and NEW.role = 'user' 
      then left(NEW.content, 50) || case when length(NEW.content) > 50 then '...' else '' end
      else title
    end
  where id = NEW.conversation_id;
  
  return NEW;
end;
$$;

-- Create trigger for auto-updating conversation
drop trigger if exists on_chat_message_insert on public.chat_messages;
create trigger on_chat_message_insert
  after insert on public.chat_messages
  for each row
  execute function public.update_conversation_on_message();

-- Function to create a new conversation and return it
create or replace function public.create_conversation(
  p_user_id uuid,
  p_title text default 'New Conversation'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_conversation_id uuid;
begin
  insert into public.chat_conversations (user_id, title)
  values (p_user_id, p_title)
  returning id into v_conversation_id;
  
  return v_conversation_id;
end;
$$;

-- Grant execute permissions
grant execute on function public.match_chat_messages to authenticated;
grant execute on function public.get_recent_messages to authenticated;
grant execute on function public.create_conversation to authenticated;

-- Add comment for documentation
comment on table public.chat_conversations is 'Stores chat conversation metadata for VBot RAG system';
comment on table public.chat_messages is 'Stores chat messages with embeddings for semantic search';
comment on function public.match_chat_messages is 'Finds similar messages using vector similarity search';

