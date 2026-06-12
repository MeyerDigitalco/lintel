-- ===========================================================================
-- Lintel — account region.
-- A landlord chooses their nation at signup; the app then shows only that
-- region's UI. Properties default to (and are locked to) this region.
-- ===========================================================================

alter table orgs add column if not exists region jurisdiction;

-- Backfill existing orgs to England (safe default).
update orgs set region = 'england' where region is null;

-- Recreate the signup bootstrap to also set the org region from metadata.
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_org_id uuid;
  org_name text;
  org_region jurisdiction;
begin
  org_name := coalesce(
    nullif(new.raw_user_meta_data ->> 'org_name', ''),
    split_part(new.email, '@', 1) || '''s portfolio'
  );

  begin
    org_region := coalesce(
      nullif(new.raw_user_meta_data ->> 'region', ''),
      'england'
    )::jurisdiction;
  exception when others then
    org_region := 'england';
  end;

  insert into orgs (name, region) values (org_name, org_region) returning id into new_org_id;

  insert into memberships (org_id, user_id, role)
  values (new_org_id, new.id, 'owner');

  insert into subscriptions (org_id, status, trial_ends_at)
  values (new_org_id, 'trialing', now() + interval '30 days');

  insert into entitlements (org_id, feature, active) values
    (new_org_id, 'core', true),
    (new_org_id, 'voice', false),
    (new_org_id, 'tenant_portal', false),
    (new_org_id, 'maintenance_portal', false);

  return new;
end;
$$;
