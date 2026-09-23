alter table transport_requests
  add column if not exists passenger_phone text,
  add column if not exists passenger_email text;
