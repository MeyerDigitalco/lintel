-- ===========================================================================
-- Lintel — auth bootstrap
-- When a new auth user signs up, create their org, an owner membership, a
-- trialing subscription (30-day trial) and the always-on 'core' entitlement.
-- Runs as SECURITY DEFINER so it can write across RLS-protected tables.
-- ===========================================================================

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_org_id uuid;
  org_name text;
begin
  org_name := coalesce(
    nullif(new.raw_user_meta_data ->> 'org_name', ''),
    split_part(new.email, '@', 1) || '''s portfolio'
  );

  insert into orgs (name) values (org_name) returning id into new_org_id;

  insert into memberships (org_id, user_id, role)
  values (new_org_id, new.id, 'owner');

  insert into subscriptions (org_id, status, trial_ends_at)
  values (new_org_id, 'trialing', now() + interval '30 days');

  -- Core is always on; add-ons are off until purchased.
  insert into entitlements (org_id, feature, active) values
    (new_org_id, 'core', true),
    (new_org_id, 'voice', false),
    (new_org_id, 'tenant_portal', false),
    (new_org_id, 'maintenance_portal', false);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
