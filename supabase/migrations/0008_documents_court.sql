-- ===========================================================================
-- Lintel — per-property document vault + deposit-protection fields
-- (supports the document vault, court-readiness score and accountant evidence).
-- ===========================================================================

-- Deposit protection details (used by court-readiness scoring).
alter table tenancies
  add column if not exists deposit_protected_at date,
  add column if not exists deposit_scheme text;

-- General document vault per property: EPC, gas cert, deposit cert, inventory,
-- correspondence, etc. Distinct from compliance_items (which track expiry) and
-- shared_documents (which are shared with a tenant).
create table property_documents (
  id            uuid primary key default gen_random_uuid(),
  org_id        uuid not null references orgs(id) on delete cascade,
  property_id   uuid not null references properties(id) on delete cascade,
  label         text not null,
  doc_type      text,                 -- epc | gas_safety | eicr | deposit_cert | inventory | tenancy_agreement | correspondence | other
  storage_path  text not null,
  issued_at     date,
  expires_at    date,
  created_at    timestamptz not null default now()
);

alter table property_documents enable row level security;

create policy property_docs_org_all on property_documents
  for all using (is_org_member(org_id)) with check (is_org_member(org_id));

create index idx_property_docs_property on property_documents(property_id);
create index idx_property_docs_type on property_documents(doc_type);

-- Storage bucket for property documents. Path: {property_id}/{file}.
insert into storage.buckets (id, name, public)
values ('property-docs', 'property-docs', false)
on conflict (id) do nothing;

create policy "property-docs org all"
on storage.objects for all to authenticated
using (
  bucket_id = 'property-docs'
  and exists (
    select 1 from properties p
    where p.id = (storage.foldername(name))[1]::uuid and is_org_member(p.org_id)
  )
)
with check (
  bucket_id = 'property-docs'
  and exists (
    select 1 from properties p
    where p.id = (storage.foldername(name))[1]::uuid and is_org_member(p.org_id)
  )
);

-- Accountant notes / queries (org-level thread for the accountant workflow).
create table accountant_notes (
  id           uuid primary key default gen_random_uuid(),
  org_id       uuid not null references orgs(id) on delete cascade,
  author_id    uuid references auth.users(id) on delete set null,
  author_role  text not null default 'landlord',  -- landlord | accountant
  body         text not null,
  resolved     boolean not null default false,
  created_at   timestamptz not null default now()
);

alter table accountant_notes enable row level security;
create policy accountant_notes_org_all on accountant_notes
  for all using (is_org_member(org_id)) with check (is_org_member(org_id));
create index idx_accountant_notes_org on accountant_notes(org_id);
