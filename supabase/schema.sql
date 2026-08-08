create table if not exists public.chats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  title text not null default 'New Chat',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.messages (
  id text primary key,
  chat_id uuid not null references public.chats(id) on delete cascade,
  role text not null,
  model text not null,
  content text not null default '',
  status text not null default 'done',
  kind text not null default 'text',
  created_at timestamptz not null default now()
);

alter table public.chats enable row level security;
alter table public.messages enable row level security;

create policy "select own chats" on public.chats for select using (auth.uid() = user_id);
create policy "insert own chats" on public.chats for insert with check (auth.uid() = user_id);
create policy "update own chats" on public.chats for update using (auth.uid() = user_id);
create policy "delete own chats" on public.chats for delete using (auth.uid() = user_id);

create policy "select own messages" on public.messages for select using (
  exists (select 1 from public.chats c where c.id = chat_id and c.user_id = auth.uid())
);
create policy "insert own messages" on public.messages for insert with check (
  exists (select 1 from public.chats c where c.id = chat_id and c.user_id = auth.uid())
);
create policy "update own messages" on public.messages for update using (
  exists (select 1 from public.chats c where c.id = chat_id and c.user_id = auth.uid())
);
create policy "delete own messages" on public.messages for delete using (
  exists (select 1 from public.chats c where c.id = chat_id and c.user_id = auth.uid())
);
