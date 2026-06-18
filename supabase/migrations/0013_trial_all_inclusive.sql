-- ===========================================================================
-- Lintel — all-inclusive free trial.
-- New signups get EVERY add-on switched on for the 30-day trial. After the
-- trial the landlord keeps the always-on core and chooses which add-ons to
-- retain (managed on the billing page / via Stripe).
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

  -- Everything on during the free trial.
  insert into entitlements (org_id, feature, active) values
    (new_org_id, 'core', true),
    (new_org_id, 'voice', true),
    (new_org_id, 'tenant_portal', true),
    (new_org_id, 'maintenance_portal', true);

  return new;
end;
$$;

-- Backfill: switch all add-ons on for orgs currently in trial.
update entitlements e
set active = true, updated_at = now()
from subscriptions s
where s.org_id = e.org_id
  and s.status = 'trialing'
  and e.feature in ('voice', 'tenant_portal', 'maintenance_portal');
