-- Tenant contact details + end date on tenancies, so a tenant can be captured
-- at add-property time (optionally auto-filled by AI from an uploaded contract).
alter table tenancies add column if not exists tenant_name  text;
alter table tenancies add column if not exists tenant_email text;
alter table tenancies add column if not exists tenant_phone text;
alter table tenancies add column if not exists end_date     date;
