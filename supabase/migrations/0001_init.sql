-- ===========================================================================
-- Lintel — initial schema (Phase 1 foundation)
-- Supabase / Postgres. RLS enabled on every table.
--
-- Tenancy model:
--   * Landlord side is scoped by org_id (an org = a landlord account / business).
--   * Tenant & contractor access is scoped by membership of a tenancy.
-- ===========================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type jurisdiction as enum ('england', 'wales', 'scotland', 'northern_ireland');
create type app_role as enum ('owner', 'admin', 'landlord', 'tenant', 'contractor');
create type rent_status as enum ('due', 'marked', 'confirmed', 'overdue');
create type sub_status as enum ('trialing', 'active', 'past_due', 'canceled', 'incomplete');

-- ---------------------------------------------------------------------------
-- Organisations (a landlord account)
-- ---------------------------------------------------------------------------
create table orgs (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  created_at    timestamptz not null default now()
);

-- Membership links auth.users to orgs with a role.
create table memberships (
  id            uuid primary key default gen_random_uuid(),
  org_id        uuid not null references orgs(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,
  role          app_role not null default 'landlord',
  created_at    timestamptz not null default now(),
  unique (org_id, user_id)
);

-- ---------------------------------------------------------------------------
-- Subscriptions & entitlements (synced from Stripe webhooks)
-- ---------------------------------------------------------------------------
create table subscriptions (
  id                     uuid primary key default gen_random_uuid(),
  org_id                 uuid not null references orgs(id) on delete cascade,
  stripe_customer_id     text,
  stripe_subscription_id text,
  status                 sub_status not null default 'trialing',
  trial_ends_at          timestamptz,
  current_period_end     timestamptz,
  updated_at             timestamptz not null default now(),
  unique (org_id)
);

-- One row per active add-on/feature the org is entitled to.
create table entitlements (
  id            uuid primary key default gen_random_uuid(),
  org_id        uuid not null references orgs(id) on delete cascade,
  feature       text not null,          -- 'core' | 'voice' | 'tenant_portal' | 'maintenance_portal'
  active        boolean not null default true,
  updated_at    timestamptz not null default now(),
  unique (org_id, feature)
);

-- ---------------------------------------------------------------------------
-- Properties & units
-- ---------------------------------------------------------------------------
create table properties (
  id            uuid primary key default gen_random_uuid(),
  org_id        uuid not null references orgs(id) on delete cascade,
  jurisdiction  jurisdiction not null,
  label         text not null,
  address_line1 text,
  address_line2 text,
  city          text,
  postcode      text,
  is_hmo        boolean not null default false,
  created_at    timestamptz not null default now()
);

create table units (
  id            uuid primary key default gen_random_uuid(),
  property_id   uuid not null references properties(id) on delete cascade,
  label         text not null,          -- e.g. "Flat 1", "Room A" for HMO units
  created_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Registrations (Rent Smart Wales, Scottish reg, NI reg, PRS Database)
-- ---------------------------------------------------------------------------
create table registrations (
  id            uuid primary key default gen_random_uuid(),
  property_id   uuid not null references properties(id) on delete cascade,
  scheme        text not null,
  reference     text,
  issued_at     date,
  renews_at     date,
  created_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Tenancies (type resolved from the property's jurisdiction)
-- ---------------------------------------------------------------------------
create table tenancies (
  id            uuid primary key default gen_random_uuid(),
  org_id        uuid not null references orgs(id) on delete cascade,
  property_id   uuid not null references properties(id) on delete cascade,
  unit_id       uuid references units(id) on delete set null,
  type          text not null,          -- e.g. 'periodic_assured', 'standard_occupation_contract'
  start_date    date,
  rent_amount   numeric(12,2),
  rent_period   text not null default 'monthly',  -- 'monthly' | 'weekly'
  deposit_amount numeric(12,2),
  status        text not null default 'active',
  created_at    timestamptz not null default now()
);

-- Membership of a tenancy for tenant-portal access. Links a user (the tenant)
-- to a tenancy; drives tenant-side RLS.
create table tenancy_members (
  id            uuid primary key default gen_random_uuid(),
  tenancy_id    uuid not null references tenancies(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,
  role          app_role not null default 'tenant',
  created_at    timestamptz not null default now(),
  unique (tenancy_id, user_id)
);

-- ---------------------------------------------------------------------------
-- Rent ledger — LOG ONLY. No bank feed, no card capture.
-- ---------------------------------------------------------------------------
create table rent_ledger (
  id            uuid primary key default gen_random_uuid(),
  org_id        uuid not null references orgs(id) on delete cascade,
  tenancy_id    uuid not null references tenancies(id) on delete cascade,
  period        text not null,          -- e.g. '2026-06'
  due_on        date,
  amount_due    numeric(12,2) not null,
  status        rent_status not null default 'due',
  marked_at     timestamptz,            -- tenant marked as paid
  confirmed_at  timestamptz,            -- landlord confirmed receipt
  created_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Income & expenses (SA105 categories)
-- ---------------------------------------------------------------------------
create table transactions (
  id              uuid primary key default gen_random_uuid(),
  org_id          uuid not null references orgs(id) on delete cascade,
  property_id     uuid references properties(id) on delete set null,
  tenancy_id      uuid references tenancies(id) on delete set null,
  direction       text not null,        -- 'income' | 'expense'
  sa105_category  text,                 -- e.g. 'rents', 'repairs_maintenance', 'finance_costs'
  amount          numeric(12,2) not null,
  occurred_on     date not null,
  description     text,
  receipt_url     text,                 -- signed URL to attachment in storage
  created_at      timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Compliance vault (jurisdiction-aware)
-- ---------------------------------------------------------------------------
create table compliance_items (
  id              uuid primary key default gen_random_uuid(),
  org_id          uuid not null references orgs(id) on delete cascade,
  property_id     uuid not null references properties(id) on delete cascade,
  item_key        text not null,        -- matches jurisdiction module key, e.g. 'gas_safety'
  label           text not null,
  statutory_basis text,                 -- for jurisdiction transparency
  issued_at       date,
  expires_at      date,
  document_url    text,
  created_at      timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Audit log
-- ---------------------------------------------------------------------------
create table audit_log (
  id            uuid primary key default gen_random_uuid(),
  org_id        uuid references orgs(id) on delete cascade,
  actor_id      uuid references auth.users(id) on delete set null,
  action        text not null,
  entity        text,
  entity_id     uuid,
  meta          jsonb,
  created_at    timestamptz not null default now()
);

-- ===========================================================================
-- Helper functions for RLS
-- ===========================================================================

-- True if the current user belongs to the given org.
create or replace function is_org_member(target_org uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from memberships m
    where m.org_id = target_org and m.user_id = auth.uid()
  );
$$;

-- True if the current user is a member of the given tenancy.
create or replace function is_tenancy_member(target_tenancy uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from tenancy_members tm
    where tm.tenancy_id = target_tenancy and tm.user_id = auth.uid()
  );
$$;

-- ===========================================================================
-- Row Level Security
-- ===========================================================================
alter table orgs              enable row level security;
alter table memberships       enable row level security;
alter table subscriptions     enable row level security;
alter table entitlements      enable row level security;
alter table properties        enable row level security;
alter table units             enable row level security;
alter table registrations     enable row level security;
alter table tenancies         enable row level security;
alter table tenancy_members   enable row level security;
alter table rent_ledger       enable row level security;
alter table transactions      enable row level security;
alter table compliance_items  enable row level security;
alter table audit_log         enable row level security;

-- Orgs: members can read their org.
create policy org_read on orgs
  for select using (is_org_member(id));

-- Memberships: a user can see membership rows for orgs they belong to.
create policy membership_read on memberships
  for select using (is_org_member(org_id));

-- Subscriptions & entitlements: read-only to org members (writes via service role / webhook).
create policy subs_read on subscriptions
  for select using (is_org_member(org_id));
create policy ent_read on entitlements
  for select using (is_org_member(org_id));

-- Properties: full CRUD for org members.
create policy properties_all on properties
  for all using (is_org_member(org_id)) with check (is_org_member(org_id));

-- Units: via parent property's org.
create policy units_all on units
  for all using (
    exists (select 1 from properties p where p.id = units.property_id and is_org_member(p.org_id))
  ) with check (
    exists (select 1 from properties p where p.id = units.property_id and is_org_member(p.org_id))
  );

-- Registrations: via parent property's org.
create policy registrations_all on registrations
  for all using (
    exists (select 1 from properties p where p.id = registrations.property_id and is_org_member(p.org_id))
  ) with check (
    exists (select 1 from properties p where p.id = registrations.property_id and is_org_member(p.org_id))
  );

-- Tenancies: org members manage; tenancy members can read their own tenancy.
create policy tenancies_org_all on tenancies
  for all using (is_org_member(org_id)) with check (is_org_member(org_id));
create policy tenancies_tenant_read on tenancies
  for select using (is_tenancy_member(id));

-- Tenancy members: org members manage; the tenant can read their own row.
create policy tenancy_members_org_all on tenancy_members
  for all using (
    exists (select 1 from tenancies t where t.id = tenancy_members.tenancy_id and is_org_member(t.org_id))
  ) with check (
    exists (select 1 from tenancies t where t.id = tenancy_members.tenancy_id and is_org_member(t.org_id))
  );
create policy tenancy_members_self_read on tenancy_members
  for select using (user_id = auth.uid());

-- Rent ledger: org members full; tenant can read + mark their own tenancy's rows.
create policy rent_org_all on rent_ledger
  for all using (is_org_member(org_id)) with check (is_org_member(org_id));
create policy rent_tenant_read on rent_ledger
  for select using (is_tenancy_member(tenancy_id));
create policy rent_tenant_mark on rent_ledger
  for update using (is_tenancy_member(tenancy_id)) with check (is_tenancy_member(tenancy_id));

-- Transactions: org members only.
create policy transactions_all on transactions
  for all using (is_org_member(org_id)) with check (is_org_member(org_id));

-- Compliance items: org members manage.
create policy compliance_all on compliance_items
  for all using (is_org_member(org_id)) with check (is_org_member(org_id));

-- Audit log: org members can read; inserts via service role.
create policy audit_read on audit_log
  for select using (is_org_member(org_id));

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------
create index idx_memberships_user on memberships(user_id);
create index idx_properties_org on properties(org_id);
create index idx_tenancies_org on tenancies(org_id);
create index idx_tenancy_members_user on tenancy_members(user_id);
create index idx_rent_tenancy on rent_ledger(tenancy_id);
create index idx_tx_org on transactions(org_id);
create index idx_compliance_property on compliance_items(property_id);
create index idx_compliance_expires on compliance_items(expires_at);
