-- ===========================================================================
-- Lintel — internationalisation: country + currency on the org.
-- region stays as the (UK) jurisdiction enum; country/currency widen support
-- to the US, UAE and South Africa. Sub-region (US state, emirate, province) is
-- carried in region_code as free text for non-UK orgs.
-- ===========================================================================

alter table orgs add column if not exists country     text not null default 'GB';
alter table orgs add column if not exists currency    text not null default 'GBP';
alter table orgs add column if not exists region_code text;

-- Seed signup metadata (org_name, region, country, currency, region_code).
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_org_id uuid;
  org_name text;
  meta_country text;
  meta_currency text;
  meta_region text;
  meta_region_code text;
begin
  org_name := coalesce(nullif(new.raw_user_meta_data ->> 'org_name', ''),
                       split_part(new.email, '@', 1) || '''s portfolio');
  meta_country  := coalesce(nullif(new.raw_user_meta_data ->> 'country', ''), 'GB');
  meta_currency := coalesce(nullif(new.raw_user_meta_data ->> 'currency', ''), 'GBP');
  meta_region_code := nullif(new.raw_user_meta_data ->> 'region_code', '');
  -- region column is the UK jurisdiction enum; default to england for non-UK.
  meta_region := coalesce(nullif(new.raw_user_meta_data ->> 'region', ''), 'england');
  if meta_region not in ('england','wales','scotland','northern_ireland') then
    meta_region := 'england';
  end if;

  insert into orgs (name, region, country, currency, region_code)
  values (org_name, meta_region::jurisdiction, meta_country, meta_currency, meta_region_code)
  returning id into new_org_id;

  insert into memberships (org_id, user_id, role) values (new_org_id, new.id, 'owner');

  insert into subscriptions (org_id, status, trial_ends_at)
  values (new_org_id, 'trialing', now() + interval '30 days');

  insert into entitlements (org_id, feature, active) values
    (new_org_id, 'core', true),
    (new_org_id, 'voice', true),
    (new_org_id, 'tenant_portal', true),
    (new_org_id, 'maintenance_portal', true);

  return new;
end;
$$;
