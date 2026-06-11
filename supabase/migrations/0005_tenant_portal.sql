-- ===========================================================================
-- Lintel — tenant portal (Phase 4)
-- Two-way messaging, landlord-shared documents, notification prefs, and a
-- private storage bucket readable by tenancy members.
-- ===========================================================================

-- Notification preference for the tenant (email via SendGrid).
alter table tenancy_members
  add column if not exists notify_email boolean not null default true;

-- ---------------------------------------------------------------------------
-- Messages — two-way, audit-logged. Landlord (org) <-> tenant (tenancy member).
-- ---------------------------------------------------------------------------
create table messages (
  id           uuid primary key default gen_random_uuid(),
  org_id       uuid not null references orgs(id) on delete cascade,
  tenancy_id   uuid not null references tenancies(id) on delete cascade,
  sender_id    uuid references auth.users(id) on delete set null,
  sender_role  text not null,            -- 'landlord' | 'tenant'
  body         text not null,
  created_at   timestamptz not null default now()
);

alter table messages enable row level security;

-- Org members (landlord side) can read/write all messages for their org.
create policy messages_org_all on messages
  for all using (is_org_member(org_id)) with check (is_org_member(org_id));

-- Tenancy members can read messages for their tenancy and post new ones.
create policy messages_tenant_read on messages
  for select using (is_tenancy_member(tenancy_id));
create policy messages_tenant_insert on messages
  for insert with check (is_tenancy_member(tenancy_id) and sender_id = auth.uid());

create index idx_messages_tenancy on messages(tenancy_id);

-- ---------------------------------------------------------------------------
-- Shared documents — landlord shares a stored file with a tenancy.
-- ---------------------------------------------------------------------------
create table shared_documents (
  id            uuid primary key default gen_random_uuid(),
  org_id        uuid not null references orgs(id) on delete cascade,
  tenancy_id    uuid not null references tenancies(id) on delete cascade,
  label         text not null,
  kind          text,                    -- 'tenancy_agreement' | 'gas_cert' | 'epc' | 'notice' | ...
  storage_path  text not null,           -- path in the tenancy-docs bucket
  created_at    timestamptz not null default now()
);

alter table shared_documents enable row level security;

create policy shared_docs_org_all on shared_documents
  for all using (is_org_member(org_id)) with check (is_org_member(org_id));
create policy shared_docs_tenant_read on shared_documents
  for select using (is_tenancy_member(tenancy_id));

create index idx_shared_docs_tenancy on shared_documents(tenancy_id);

-- ---------------------------------------------------------------------------
-- Storage bucket for shared documents. Path convention: {tenancy_id}/{file}.
-- Org members can write; org members and tenancy members can read.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('tenancy-docs', 'tenancy-docs', false)
on conflict (id) do nothing;

create policy "tenancy-docs read"
on storage.objects for select
to authenticated
using (
  bucket_id = 'tenancy-docs'
  and is_tenancy_member( (storage.foldername(name))[1]::uuid )
);

create policy "tenancy-docs org write"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'tenancy-docs'
  and exists (
    select 1 from tenancies t
    where t.id = (storage.foldername(name))[1]::uuid
      and is_org_member(t.org_id)
  )
);

create policy "tenancy-docs org read"
on storage.objects for select
to authenticated
using (
  bucket_id = 'tenancy-docs'
  and exists (
    select 1 from tenancies t
    where t.id = (storage.foldername(name))[1]::uuid
      and is_org_member(t.org_id)
  )
);
