-- ===========================================================================
-- Lintel — read-only accountant seat
-- Adds an 'accountant' org role that can READ everything in the org but WRITE
-- nothing (except posting accountant-notes replies). Achieved by splitting the
-- existing "org member can do all" policies into a read policy (is_org_member)
-- and a write policy (is_org_writer).
-- ===========================================================================

-- New role. (Adding the enum value in its own statement; not referenced as a
-- literal below, so no "unsafe use of new value" issue within this migration.)
alter type app_role add value if not exists 'accountant';

-- A "writer" is an owner / admin / landlord member of the org.
create or replace function is_org_writer(target_org uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from memberships m
    where m.org_id = target_org
      and m.user_id = auth.uid()
      and m.role in ('owner', 'admin', 'landlord')
  );
$$;

-- Helper to (re)build a read/write split for an org-scoped table.
-- We drop the existing "all" policy and add explicit read + write policies.

-- properties
drop policy if exists properties_all on properties;
create policy properties_read on properties for select using (is_org_member(org_id));
create policy properties_write on properties for all using (is_org_writer(org_id)) with check (is_org_writer(org_id));

-- units (scoped via parent property's org)
drop policy if exists units_all on units;
create policy units_read on units for select using (
  exists (select 1 from properties p where p.id = units.property_id and is_org_member(p.org_id))
);
create policy units_write on units for all using (
  exists (select 1 from properties p where p.id = units.property_id and is_org_writer(p.org_id))
) with check (
  exists (select 1 from properties p where p.id = units.property_id and is_org_writer(p.org_id))
);

-- registrations
drop policy if exists registrations_all on registrations;
create policy registrations_read on registrations for select using (
  exists (select 1 from properties p where p.id = registrations.property_id and is_org_member(p.org_id))
);
create policy registrations_write on registrations for all using (
  exists (select 1 from properties p where p.id = registrations.property_id and is_org_writer(p.org_id))
) with check (
  exists (select 1 from properties p where p.id = registrations.property_id and is_org_writer(p.org_id))
);

-- tenancies (keep the separate tenant-read policy from 0001)
drop policy if exists tenancies_org_all on tenancies;
create policy tenancies_org_read on tenancies for select using (is_org_member(org_id));
create policy tenancies_org_write on tenancies for all using (is_org_writer(org_id)) with check (is_org_writer(org_id));

-- tenancy_members (keep self-read from 0001)
drop policy if exists tenancy_members_org_all on tenancy_members;
create policy tenancy_members_org_read on tenancy_members for select using (
  exists (select 1 from tenancies t where t.id = tenancy_members.tenancy_id and is_org_member(t.org_id))
);
create policy tenancy_members_org_write on tenancy_members for all using (
  exists (select 1 from tenancies t where t.id = tenancy_members.tenancy_id and is_org_writer(t.org_id))
) with check (
  exists (select 1 from tenancies t where t.id = tenancy_members.tenancy_id and is_org_writer(t.org_id))
);

-- rent_ledger (keep tenant read/mark policies from 0001)
drop policy if exists rent_org_all on rent_ledger;
create policy rent_org_read on rent_ledger for select using (is_org_member(org_id));
create policy rent_org_write on rent_ledger for all using (is_org_writer(org_id)) with check (is_org_writer(org_id));

-- transactions
drop policy if exists transactions_all on transactions;
create policy transactions_read on transactions for select using (is_org_member(org_id));
create policy transactions_write on transactions for all using (is_org_writer(org_id)) with check (is_org_writer(org_id));

-- compliance_items
drop policy if exists compliance_all on compliance_items;
create policy compliance_read on compliance_items for select using (is_org_member(org_id));
create policy compliance_write on compliance_items for all using (is_org_writer(org_id)) with check (is_org_writer(org_id));

-- notices
drop policy if exists notices_org_all on notices;
create policy notices_read on notices for select using (is_org_member(org_id));
create policy notices_write on notices for all using (is_org_writer(org_id)) with check (is_org_writer(org_id));

-- shared_documents (keep tenant read from 0005)
drop policy if exists shared_docs_org_all on shared_documents;
create policy shared_docs_org_read on shared_documents for select using (is_org_member(org_id));
create policy shared_docs_org_write on shared_documents for all using (is_org_writer(org_id)) with check (is_org_writer(org_id));

-- property_documents
drop policy if exists property_docs_org_all on property_documents;
create policy property_docs_read on property_documents for select using (is_org_member(org_id));
create policy property_docs_write on property_documents for all using (is_org_writer(org_id)) with check (is_org_writer(org_id));

-- maintenance_requests (keep tenant policies from 0006)
drop policy if exists mr_org_all on maintenance_requests;
create policy mr_org_read on maintenance_requests for select using (is_org_member(org_id));
create policy mr_org_write on maintenance_requests for all using (is_org_writer(org_id)) with check (is_org_writer(org_id));

-- accountant_notes stays writable by ALL org members so the accountant can
-- reply to / resolve queries (policy accountant_notes_org_all from 0008 kept).
