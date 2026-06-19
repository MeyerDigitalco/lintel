-- Richer property details: photo, sub-type, bedrooms, status, all-electric
-- (skips the gas certificate), and ownership/company info for correct tax framing.
alter table properties add column if not exists photo_path     text;
alter table properties add column if not exists subtype        text;
alter table properties add column if not exists bedrooms       integer;
alter table properties add column if not exists status         text not null default 'vacant';
alter table properties add column if not exists all_electric   boolean not null default false;
alter table properties add column if not exists ownership      text not null default 'personal';
alter table properties add column if not exists company_name   text;
alter table properties add column if not exists company_no     text;
alter table properties add column if not exists year_end_month text;
