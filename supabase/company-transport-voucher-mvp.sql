create extension if not exists "pgcrypto";

alter table companies
  add column if not exists portal_access_code text,
  add column if not exists brand_name text;

alter table transport_requests
  add column if not exists company_id uuid references companies(id),
  add column if not exists passenger_name text,
  add column if not exists service_date date,
  add column if not exists service_time time,
  add column if not exists assigned_vehicle text,
  add column if not exists driver_name text,
  add column if not exists driver_phone text,
  add column if not exists vehicle_plate text,
  add column if not exists is_vip boolean not null default false,
  add column if not exists security_level text,
  add column if not exists operational_notes text,
  add column if not exists voucher_token text;

update transport_requests
set voucher_token = gen_random_uuid()::text
where voucher_token is null;

alter table transport_requests
  alter column voucher_token set default gen_random_uuid()::text;

create unique index if not exists transport_requests_voucher_token_idx
  on transport_requests(voucher_token);

create index if not exists transport_requests_company_id_idx
  on transport_requests(company_id);

create index if not exists companies_portal_access_code_idx
  on companies(portal_access_code);

insert into companies (
  name,
  brand_name,
  contact_name,
  phone,
  email,
  portal_access_token,
  portal_access_code,
  portal_enabled
)
values (
  'WEF - Women Economic Forum',
  'WEF',
  'Catalina Cajias',
  '0987716399',
  null,
  'wef-' || replace(gen_random_uuid()::text, '-', ''),
  'WEF2026',
  true
)
on conflict (name) do update set
  brand_name = excluded.brand_name,
  contact_name = excluded.contact_name,
  phone = excluded.phone,
  portal_access_code = coalesce(companies.portal_access_code, excluded.portal_access_code),
  portal_access_token = coalesce(companies.portal_access_token, excluded.portal_access_token),
  portal_enabled = true;
