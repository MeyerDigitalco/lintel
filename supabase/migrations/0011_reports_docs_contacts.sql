-- ===========================================================================
-- Lintel — documents AI summary, tokenised tenant link, contacts CRM, invoices.
-- ===========================================================================

-- AI summary on property documents.
alter table property_documents add column if not exists ai_summary text;

-- Tokenised tenant portal link (no account needed).
alter table tenancies add column if not exists portal_token text unique;
create index if not exists idx_tenancies_portal_token on tenancies(portal_token);

-- ---------------------------------------------------------------------------
-- Contacts CRM: tenants, contractors, suppliers, agents, other.
-- ---------------------------------------------------------------------------
create table contacts (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references orgs(id) on delete cascade,
  kind        text not null default 'other',   -- tenant | contractor | supplier | agent | other
  name        text not null,
  company     text,
  email       text,
  phone       text,
  notes       text,
  archived    boolean not null default false,
  created_at  timestamptz not null default now()
);

alter table contacts enable row level security;
create policy contacts_read on contacts for select using (is_org_member(org_id));
create policy contacts_write on contacts for all using (is_org_writer(org_id)) with check (is_org_writer(org_id));
create index idx_contacts_org on contacts(org_id);

-- ---------------------------------------------------------------------------
-- Invoices.
-- ---------------------------------------------------------------------------
create table invoices (
  id           uuid primary key default gen_random_uuid(),
  org_id       uuid not null references orgs(id) on delete cascade,
  contact_id   uuid references contacts(id) on delete set null,
  property_id  uuid references properties(id) on delete set null,
  number       text not null,
  status       text not null default 'draft',  -- draft | sent | viewed | overdue | partial | paid | void
  amount       numeric(12,2) not null default 0,
  description  text,
  issue_date   date not null default current_date,
  due_date     date,
  created_at   timestamptz not null default now()
);

alter table invoices enable row level security;
create policy invoices_read on invoices for select using (is_org_member(org_id));
create policy invoices_write on invoices for all using (is_org_writer(org_id)) with check (is_org_writer(org_id));
create index idx_invoices_org on invoices(org_id);
