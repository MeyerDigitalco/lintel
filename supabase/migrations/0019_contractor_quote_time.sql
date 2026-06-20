-- Contractor portal: quoted price and a scheduled time of attendance.
-- (final `cost` already exists on maintenance_requests.)
alter table maintenance_requests add column if not exists quote_amount  numeric(12,2);
alter table maintenance_requests add column if not exists scheduled_time text;
