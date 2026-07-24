create table if not exists transport_requests (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  status text not null default 'nuevo',
  city text not null,
  booking_mode text not null,
  pickup text not null,
  destination text not null,
  stops jsonb,
  when_type text not null,
  scheduled_date date,
  scheduled_time time,
  passengers int not null default 1,
  is_airport_trip boolean not null default false,
  flight_number text,
  flight_direction text,
  meet_and_greet text,
  selected_vehicle text not null,
  price_shown text not null,
  price_status text not null,
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  customer_notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index if not exists transport_requests_created_at_idx on transport_requests(created_at desc);
create index if not exists transport_requests_status_idx on transport_requests(status);
create index if not exists transport_requests_reference_idx on transport_requests(reference);

alter table transport_requests enable row level security;

create policy "public can create transport requests"
  on transport_requests for insert
  with check (true);
