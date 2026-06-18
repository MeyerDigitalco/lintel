-- Per-property documents can be marked visible in the tenant portal.
alter table property_documents
  add column if not exists visible_to_tenant boolean not null default false;
