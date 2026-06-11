-- ===========================================================================
-- Lintel — private storage bucket for receipts.
-- Files are namespaced by org id (first path segment). Access is restricted to
-- members of that org; viewing uses short-lived signed URLs.
-- ===========================================================================

insert into storage.buckets (id, name, public)
values ('receipts', 'receipts', false)
on conflict (id) do nothing;

-- Helper: the org id is the first folder segment of the object name.
-- storage.foldername(name) returns the path segments as an array.

create policy "receipts org read"
on storage.objects for select
to authenticated
using (
  bucket_id = 'receipts'
  and is_org_member( (storage.foldername(name))[1]::uuid )
);

create policy "receipts org insert"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'receipts'
  and is_org_member( (storage.foldername(name))[1]::uuid )
);

create policy "receipts org delete"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'receipts'
  and is_org_member( (storage.foldername(name))[1]::uuid )
);
