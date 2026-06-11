-- ===========================================================================
-- Lintel — maintenance portal (Phase 5)
-- Landlord <-> tenant <-> contractor. Contractors act via a tokenised link
-- (no account) handled server-side with the service role, so they are NOT given
-- RLS access here.
-- ===========================================================================

create table maintenance_requests (
  id                 uuid primary key default gen_random_uuid(),
  org_id             uuid not null references orgs(id) on delete cascade,
  property_id        uuid references properties(id) on delete set null,
  tenancy_id         uuid references tenancies(id) on delete set null,
  title              text not null,
  description        text,
  category           text,                 -- 'plumbing' | 'electrical' | 'heating' | ...
  is_hazard          boolean not null default false,
  priority           text not null default 'routine',  -- emergency | urgent | routine
  status             text not null default 'raised',
  -- raised | triaged | assigned | scheduled | in_progress | completed | closed
  raised_by_role     text not null default 'tenant',
  contractor_name    text,
  contractor_email   text,
  contractor_token   text unique,          -- tokenised link for contractor access
  scheduled_for      date,
  sla_due_at         timestamptz,          -- response/repair deadline
  cost               numeric(12,2),
  expense_tx_id      uuid references transactions(id) on delete set null,
  -- planned/recurring maintenance tied to the compliance vault
  compliance_item_id uuid references compliance_items(id) on delete set null,
  is_planned         boolean not null default false,
  created_at         timestamptz not null default now(),
  completed_at       timestamptz
);

create table maintenance_events (
  id           uuid primary key default gen_random_uuid(),
  request_id   uuid not null references maintenance_requests(id) on delete cascade,
  actor_role   text not null,              -- tenant | landlord | contractor | system
  kind         text not null default 'note', -- note | status_change | photo | schedule
  body         text,
  new_status   text,
  created_at   timestamptz not null default now()
);

create table maintenance_photos (
  id               uuid primary key default gen_random_uuid(),
  request_id       uuid not null references maintenance_requests(id) on delete cascade,
  storage_path     text not null,
  uploaded_by_role text not null,
  created_at       timestamptz not null default now()
);

alter table maintenance_requests enable row level security;
alter table maintenance_events   enable row level security;
alter table maintenance_photos   enable row level security;

-- Landlord (org) full access.
create policy mr_org_all on maintenance_requests
  for all using (is_org_member(org_id)) with check (is_org_member(org_id));
-- Tenant can read their tenancy's requests and raise new ones.
create policy mr_tenant_read on maintenance_requests
  for select using (is_tenancy_member(tenancy_id));
create policy mr_tenant_insert on maintenance_requests
  for insert with check (is_tenancy_member(tenancy_id));

-- Events: visible to org members or the tenancy's members; insert likewise.
create policy me_org_all on maintenance_events
  for all using (
    exists (select 1 from maintenance_requests r
            where r.id = maintenance_events.request_id and is_org_member(r.org_id))
  ) with check (
    exists (select 1 from maintenance_requests r
            where r.id = maintenance_events.request_id and is_org_member(r.org_id))
  );
create policy me_tenant_read on maintenance_events
  for select using (
    exists (select 1 from maintenance_requests r
            where r.id = maintenance_events.request_id and is_tenancy_member(r.tenancy_id))
  );
create policy me_tenant_insert on maintenance_events
  for insert with check (
    exists (select 1 from maintenance_requests r
            where r.id = maintenance_events.request_id and is_tenancy_member(r.tenancy_id))
  );

-- Photos mirror events.
create policy mp_org_all on maintenance_photos
  for all using (
    exists (select 1 from maintenance_requests r
            where r.id = maintenance_photos.request_id and is_org_member(r.org_id))
  ) with check (
    exists (select 1 from maintenance_requests r
            where r.id = maintenance_photos.request_id and is_org_member(r.org_id))
  );
create policy mp_tenant_read on maintenance_photos
  for select using (
    exists (select 1 from maintenance_requests r
            where r.id = maintenance_photos.request_id and is_tenancy_member(r.tenancy_id))
  );
create policy mp_tenant_insert on maintenance_photos
  for insert with check (
    exists (select 1 from maintenance_requests r
            where r.id = maintenance_photos.request_id and is_tenancy_member(r.tenancy_id))
  );

create index idx_mr_org on maintenance_requests(org_id);
create index idx_mr_tenancy on maintenance_requests(tenancy_id);
create index idx_mr_token on maintenance_requests(contractor_token);
create index idx_me_request on maintenance_events(request_id);
create index idx_mp_request on maintenance_photos(request_id);

-- Storage bucket for maintenance photos. Path convention: {request_id}/{file}.
insert into storage.buckets (id, name, public)
values ('maintenance', 'maintenance', false)
on conflict (id) do nothing;

create policy "maintenance read"
on storage.objects for select to authenticated
using (
  bucket_id = 'maintenance'
  and exists (
    select 1 from maintenance_requests r
    where r.id = (storage.foldername(name))[1]::uuid
      and (is_org_member(r.org_id) or is_tenancy_member(r.tenancy_id))
  )
);

create policy "maintenance write"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'maintenance'
  and exists (
    select 1 from maintenance_requests r
    where r.id = (storage.foldername(name))[1]::uuid
      and (is_org_member(r.org_id) or is_tenancy_member(r.tenancy_id))
  )
);
