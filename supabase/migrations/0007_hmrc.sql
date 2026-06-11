-- ===========================================================================
-- Lintel — HMRC MTD ITSA connection (Phase 7)
-- Stores OAuth tokens + the taxpayer's NINO / property business id per org.
-- RLS is enabled with NO policies: only the service role (server-side, trusted)
-- may read or write. Tokens are NEVER exposed to client/anon sessions. The app
-- surfaces connection status via a server-only helper, not direct selects.
-- ===========================================================================

create table hmrc_connections (
  id            uuid primary key default gen_random_uuid(),
  org_id        uuid not null references orgs(id) on delete cascade,
  nino          text,                  -- National Insurance number
  business_id   text,                  -- HMRC property business id
  access_token  text,
  refresh_token text,
  expires_at    timestamptz,
  scope         text,
  connected_at  timestamptz not null default now(),
  unique (org_id)
);

alter table hmrc_connections enable row level security;
-- Intentionally no policies → service role only.

create index idx_hmrc_org on hmrc_connections(org_id);
