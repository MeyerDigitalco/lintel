-- Inbound callback requests from the public marketing site.
--
-- Anyone may insert (the form is public and unauthenticated), but nobody may
-- read through the anon key. Leads are personal data: name, email, phone. They
-- are read only via the service role, from the dashboard or an export.

create table if not exists leads (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  name         text not null,
  email        text not null,
  phone        text not null,
  country      text,
  properties   text,
  note         text,
  source       text default 'home',
  status       text not null default 'new',
  contacted_at timestamptz
);

create index if not exists leads_created_at_idx on leads (created_at desc);
create index if not exists leads_status_idx on leads (status);

alter table leads enable row level security;

-- Public may submit a callback request.
drop policy if exists leads_public_insert on leads;
create policy leads_public_insert
  on leads for insert
  to anon, authenticated
  with check (true);

-- Deliberately no select/update/delete policy: with RLS enabled and no policy,
-- the anon and authenticated roles cannot read leads at all. The service role
-- bypasses RLS, which is how the team reads them.
