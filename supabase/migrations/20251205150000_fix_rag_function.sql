-- Fix the match_chat_messages function to accept text input
-- This allows the Supabase client to pass embedding as a string which is then cast to vector

-- Drop existing function first (need to match exact signature)
drop function if exists public.match_chat_messages(vector(1536), uuid, float, int, uuid);

-- Recreate with text parameter that gets cast to vector
create or replace function public.match_chat_messages(
  query_embedding text,  -- Accept as text, cast to vector internally
  match_user_id uuid,
  match_threshold float default 0.4,  -- Lower default threshold for better recall
  match_count int default 8,
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
declare
  query_vec vector(1536);
begin
  -- Cast the text input to vector
  query_vec := query_embedding::vector(1536);
  
  return query
  select
    cm.id,
    cm.conversation_id,
    cm.content,
    cm.role,
    1 - (cm.embedding <=> query_vec) as similarity,
    cm.created_at
  from public.chat_messages cm
  where cm.user_id = match_user_id
    and cm.embedding is not null
    and (exclude_conversation_id is null or cm.conversation_id != exclude_conversation_id)
    and 1 - (cm.embedding <=> query_vec) > match_threshold
  order by cm.embedding <=> query_vec
  limit match_count;
end;
$$;

-- Grant execute permissions
grant execute on function public.match_chat_messages(text, uuid, float, int, uuid) to authenticated;

-- Add comment for documentation
comment on function public.match_chat_messages is 'Finds similar messages using vector similarity search. Accepts embedding as text for easier client usage.';

