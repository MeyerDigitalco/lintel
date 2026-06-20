-- Per-user notification preferences. Absence of a row = enabled (opt-out model).
create table if not exists notification_prefs (
  user_id uuid not null references auth.users(id) on delete cascade,
  type    text not null,
  enabled boolean not null default true,
  primary key (user_id, type)
);
alter table notification_prefs enable row level security;
drop policy if exists notification_prefs_self on notification_prefs;
create policy notification_prefs_self on notification_prefs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
