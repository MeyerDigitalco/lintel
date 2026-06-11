-- ===========================================================================
-- Lintel — toolkit notices & generated documents.
-- Stores template-assisted notices/agreements with served-status tracking.
-- Used for e.g. the England information-sheet served-tracker and Section 8/13,
-- Welsh s.173 / written statement, Scottish Notice to Leave, NI Notice to Quit.
-- ===========================================================================

create table notices (
  id               uuid primary key default gen_random_uuid(),
  org_id           uuid not null references orgs(id) on delete cascade,
  property_id      uuid references properties(id) on delete set null,
  tenancy_id       uuid references tenancies(id) on delete set null,
  kind             text not null,        -- section_8 | section_13 | s173 | notice_to_leave | notice_to_quit | written_statement | info_sheet | ...
  jurisdiction     jurisdiction not null,
  status           text not null default 'draft',  -- draft | served
  served_at        date,
  template_version text,
  title            text,
  payload          jsonb,                -- inputs + rendered body
  created_at       timestamptz not null default now()
);

alter table notices enable row level security;

create policy notices_org_all on notices
  for all using (is_org_member(org_id)) with check (is_org_member(org_id));

create index idx_notices_org on notices(org_id);
create index idx_notices_property on notices(property_id);
create index idx_notices_kind on notices(kind);
