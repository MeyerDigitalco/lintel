-- Flag entries created as a monthly recurring series.
alter table transactions add column if not exists recurring boolean not null default false;
