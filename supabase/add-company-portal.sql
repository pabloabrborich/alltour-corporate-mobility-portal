alter table companies
add column if not exists portal_access_token text unique,
add column if not exists portal_enabled boolean default true;

update companies
set
  portal_access_token = encode(gen_random_bytes(24), 'hex'),
  portal_enabled = true
where portal_access_token is null;
