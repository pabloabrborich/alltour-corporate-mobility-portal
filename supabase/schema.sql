create extension if not exists "pgcrypto";

create table if not exists companies (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  contact_name text,
  email text,
  phone text,
  industry text,
  notes text,
  created_at timestamp with time zone default now()
);

create table if not exists service_requests (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade,
  service_type text not null,
  pickup_location text not null,
  dropoff_location text not null,
  pickup_datetime timestamp with time zone not null,
  passengers_count int not null default 1,
  passenger_names text,
  vehicle_type text,
  flight_info text,
  special_requirements text,
  status text not null default 'Nueva solicitud',
  estimated_price numeric,
  internal_notes text,
  created_at timestamp with time zone default now()
);

create table if not exists vehicles (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  capacity int,
  supplier_name text,
  plate text,
  driver_name text,
  driver_phone text,
  created_at timestamp with time zone default now()
);

create table if not exists service_tickets (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references service_requests(id) on delete cascade,
  assigned_vehicle_id uuid references vehicles(id),
  assigned_driver text,
  driver_phone text,
  vehicle_plate text,
  confirmation_status text default 'Pendiente',
  operation_status text default 'Por asignar',
  invoice_status text default 'Pendiente',
  created_at timestamp with time zone default now()
);

create index if not exists service_requests_pickup_datetime_idx on service_requests(pickup_datetime);
create index if not exists service_requests_status_idx on service_requests(status);
create index if not exists service_tickets_request_id_idx on service_tickets(request_id);

alter table companies enable row level security;
alter table service_requests enable row level security;
alter table vehicles enable row level security;
alter table service_tickets enable row level security;

create policy "public can create companies"
  on companies for insert
  with check (true);

create policy "public can create service requests"
  on service_requests for insert
  with check (true);

create policy "public can create service tickets"
  on service_tickets for insert
  with check (true);
