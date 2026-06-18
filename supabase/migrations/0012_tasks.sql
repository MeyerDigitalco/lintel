-- ===========================================================================
-- Lintel — Tasks (landlord to-do list), optionally linked to a property.
-- ===========================================================================

create table tasks (
  id            uuid primary key default gen_random_uuid(),
  org_id        uuid not null references orgs(id) on delete cascade,
  property_id   uuid references properties(id) on delete set null,
  title         text not null,
  notes         text,
  due_on        date,
  priority      text not null default 'normal',   -- low | normal | high
  status        text not null default 'open',     -- open | done
  created_by    uuid references auth.users(id) on delete set null,
  created_at    timestamptz not null default now(),
  completed_at  timestamptz
);

alter table tasks enable row level security;

-- Reads for any org member (incl. read-only accountants); writes for writers.
create policy tasks_read on tasks
  for select using (is_org_member(org_id));
create policy tasks_write on tasks
  for all using (is_org_writer(org_id)) with check (is_org_writer(org_id));

create index idx_tasks_org on tasks(org_id);
create index idx_tasks_due on tasks(due_on);
