create extension if not exists "pgcrypto";

create table if not exists public.companions (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  name text not null,
  avatar_url text,
  description text,
  traits text[] not null default '{}',
  communication_style text not null default 'casual',
  expertise_area text not null default 'general',
  custom_prompt text,
  background_story text,
  relationship_type text not null default 'friend',
  tone_preference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  companion_id uuid not null references public.companions(id) on delete cascade,
  title text not null default 'Conversation',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  title text not null,
  content text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.todos (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  title text not null,
  completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.companions enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.notes enable row level security;
alter table public.todos enable row level security;

drop policy if exists companions_policy on public.companions;
create policy companions_policy on public.companions
for all using (auth.uid()::text = user_id) with check (auth.uid()::text = user_id);

drop policy if exists conversations_policy on public.conversations;
create policy conversations_policy on public.conversations
for all using (auth.uid()::text = user_id) with check (auth.uid()::text = user_id);

drop policy if exists messages_policy on public.messages;
create policy messages_policy on public.messages
for all using (
  exists (
    select 1
    from public.conversations c
    where c.id = conversation_id
      and c.user_id = auth.uid()::text
  )
) with check (
  exists (
    select 1
    from public.conversations c
    where c.id = conversation_id
      and c.user_id = auth.uid()::text
  )
);

drop policy if exists notes_policy on public.notes;
create policy notes_policy on public.notes
for all using (auth.uid()::text = user_id) with check (auth.uid()::text = user_id);

drop policy if exists todos_policy on public.todos;
create policy todos_policy on public.todos
for all using (auth.uid()::text = user_id) with check (auth.uid()::text = user_id);

alter publication supabase_realtime add table public.messages;
