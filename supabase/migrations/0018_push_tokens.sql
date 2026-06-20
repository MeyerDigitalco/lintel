-- Expo push tokens per user device, for remote notifications.
create table if not exists push_tokens (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  token      text not null,
  platform   text,
  created_at timestamptz not null default now(),
  unique (user_id, token)
);
alter table push_tokens enable row level security;
drop policy if exists push_tokens_self on push_tokens;
create policy push_tokens_self on push_tokens for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists idx_push_tokens_user on push_tokens(user_id);
