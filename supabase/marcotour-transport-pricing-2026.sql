create extension if not exists "pgcrypto";

create table if not exists suppliers (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists supplier_vehicle_classes (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid not null references suppliers(id) on delete cascade,
  supplier_code text not null,
  supplier_vehicle_name text not null,
  capacity_min int not null default 1,
  capacity_max int not null,
  alltour_display_class text not null,
  display_order int not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (supplier_id, supplier_code)
);

create table if not exists routes (
  id uuid primary key default gen_random_uuid(),
  origin_name text not null,
  destination_name text not null,
  origin_key text not null,
  destination_key text not null,
  route_type text not null default 'point_to_point',
  origin_city text,
  destination_city text,
  is_airport_route boolean not null default false,
  source text not null default 'ALLTOUR',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (origin_key, destination_key, route_type)
);

create table if not exists supplier_route_rates (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid not null references suppliers(id) on delete cascade,
  route_id uuid not null references routes(id) on delete cascade,
  supplier_vehicle_class_id uuid not null references supplier_vehicle_classes(id) on delete cascade,
  supplier_rate numeric(10,2) not null,
  currency text not null default 'USD',
  rate_type text not null default 'point_to_point',
  valid_from date not null default '2026-01-01',
  valid_until date not null default '2026-12-31',
  source_reference text not null,
  source_version int not null default 2026,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (supplier_id, route_id, supplier_vehicle_class_id, rate_type, valid_from)
);

create table if not exists supplier_service_rates (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid not null references suppliers(id) on delete cascade,
  supplier_vehicle_class_id uuid not null references supplier_vehicle_classes(id) on delete cascade,
  service_code text not null,
  service_name text not null,
  service_type text not null,
  duration_hours int,
  duration_days int,
  supplier_rate numeric(10,2) not null,
  currency text not null default 'USD',
  valid_from date not null default '2026-01-01',
  valid_until date not null default '2026-12-31',
  source_reference text not null,
  source_version int not null default 2026,
  metadata jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (supplier_id, supplier_vehicle_class_id, service_code, valid_from)
);

create index if not exists routes_origin_destination_idx on routes(origin_key, destination_key, active);
create index if not exists routes_origin_idx on routes(origin_key);
create index if not exists routes_destination_idx on routes(destination_key);
create index if not exists supplier_route_rates_lookup_idx on supplier_route_rates(route_id, active);
create index if not exists supplier_route_rates_supplier_idx on supplier_route_rates(supplier_id);
create index if not exists supplier_route_rates_vehicle_idx on supplier_route_rates(supplier_vehicle_class_id);
create index if not exists supplier_service_rates_lookup_idx on supplier_service_rates(service_code, active);

alter table suppliers enable row level security;
alter table supplier_vehicle_classes enable row level security;
alter table routes enable row level security;
alter table supplier_route_rates enable row level security;
alter table supplier_service_rates enable row level security;

insert into suppliers (code, name, active)
values ('MARCOTOUR', 'MARCOTOUR TRANSSERVICE', true)
on conflict (code) do update set name = excluded.name, active = excluded.active, updated_at = now();

with supplier as (
  select id from suppliers where code = 'MARCOTOUR'
),
vehicle_rows as (
  select * from (values
    ('SUV_GLORY_DFSK', 'SUV GLORY DFSK', 1, 4, 'SUV PREMIUM', 1),
    ('VAN_STARIA', 'VAN STARIA (5 + 1 PAX)', 1, 5, 'VAN EJECUTIVA', 2),
    ('FOTON_SUNRAY', 'FOTON (12 PAX) / SUNRAY (15 PAX)', 1, 15, 'MINIBUS', 3),
    ('MERCEDES_ROSA_HD_COUNTY_COASTER', 'MERCEDES (15 PAX) / ROSA O HD (19 PAX) / COUNTY (16 PAX) / COASTER', 1, 19, 'MINIBUS CORPORATIVO', 4),
    ('BUS_30', 'BUS 30', 1, 30, 'BUS / GRUPO', 5),
    ('BUS_35', 'BUS 35', 1, 35, 'BUS / GRUPO', 6),
    ('BUS_42_45', 'BUS 42/45', 1, 45, 'BUS / GRUPO', 7)
  ) as rows(supplier_code, supplier_vehicle_name, capacity_min, capacity_max, alltour_display_class, display_order)
)
insert into supplier_vehicle_classes (
  supplier_id,
  supplier_code,
  supplier_vehicle_name,
  capacity_min,
  capacity_max,
  alltour_display_class,
  display_order,
  active
)
select
  supplier.id,
  vehicle_rows.supplier_code,
  vehicle_rows.supplier_vehicle_name,
  vehicle_rows.capacity_min,
  vehicle_rows.capacity_max,
  vehicle_rows.alltour_display_class,
  vehicle_rows.display_order,
  true
from supplier
cross join vehicle_rows
on conflict (supplier_id, supplier_code) do update set
  supplier_vehicle_name = excluded.supplier_vehicle_name,
  capacity_min = excluded.capacity_min,
  capacity_max = excluded.capacity_max,
  alltour_display_class = excluded.alltour_display_class,
  display_order = excluded.display_order,
  active = excluded.active,
  updated_at = now();

with route_rows as (
  select * from (values
    ('Quito', 'quito', 'Esmeraldas', 'esmeraldas', false, 'MARCOTOUR'),
    ('Quito', 'quito', 'Guayaquil', 'guayaquil', false, 'MARCOTOUR'),
    ('Quito', 'quito', 'Cuenca', 'cuenca', false, 'MARCOTOUR'),
    ('Quito', 'quito', 'Manta', 'manta', false, 'MARCOTOUR'),
    ('Quito', 'quito', 'Tulcan', 'tulcan', false, 'MARCOTOUR'),
    ('Quito', 'quito', 'Lago Agrio', 'lago_agrio', false, 'MARCOTOUR'),
    ('Quito', 'quito', 'Coca', 'coca', false, 'MARCOTOUR'),
    ('Quito', 'quito', 'Tena', 'tena', false, 'MARCOTOUR'),
    ('Quito', 'quito', 'Misahualli', 'misahualli', false, 'MARCOTOUR'),
    ('Quito', 'quito', 'Loja', 'loja', false, 'MARCOTOUR'),
    ('Quito', 'quito', 'Machala', 'machala', false, 'MARCOTOUR'),
    ('Quito', 'quito', 'Macas', 'macas', false, 'MARCOTOUR'),
    ('Quito', 'quito', 'Puyo', 'puyo', false, 'MARCOTOUR'),
    ('Quito', 'quito', 'Casa Sulto', 'casa_sulto', false, 'MARCOTOUR'),
    ('Quito', 'quito', 'Salinas', 'salinas', false, 'MARCOTOUR'),
    ('Quito', 'quito', 'Santa Elena', 'santa_elena', false, 'MARCOTOUR'),
    ('Quito', 'quito', 'Montanita', 'montanita', false, 'MARCOTOUR'),
    ('Quito', 'quito', 'Huigra', 'huigra', false, 'MARCOTOUR'),
    ('Quito', 'quito', 'Alausi', 'alausi', false, 'MARCOTOUR'),
    ('Guayaquil', 'guayaquil', 'Cuenca', 'cuenca', false, 'ALLTOUR_QUOTE_ONLY'),
    ('Guayaquil', 'guayaquil', 'Manta', 'manta', false, 'ALLTOUR_QUOTE_ONLY'),
    ('Guayaquil', 'guayaquil', 'Salinas', 'salinas', false, 'ALLTOUR_QUOTE_ONLY'),
    ('Guayaquil', 'guayaquil', 'Santa Elena', 'santa_elena', false, 'ALLTOUR_QUOTE_ONLY'),
    ('Guayaquil', 'guayaquil', 'Montanita', 'montanita', false, 'ALLTOUR_QUOTE_ONLY'),
    ('Guayaquil', 'guayaquil', 'Puerto Lopez', 'puerto_lopez', false, 'ALLTOUR_QUOTE_ONLY'),
    ('Guayaquil', 'guayaquil', 'Machala', 'machala', false, 'ALLTOUR_QUOTE_ONLY'),
    ('Guayaquil', 'guayaquil', 'Loja', 'loja', false, 'ALLTOUR_QUOTE_ONLY'),
    ('Guayaquil', 'guayaquil', 'Riobamba', 'riobamba', false, 'ALLTOUR_QUOTE_ONLY'),
    ('Guayaquil', 'guayaquil', 'Banos', 'banos', false, 'ALLTOUR_QUOTE_ONLY'),
    ('Cuenca', 'cuenca', 'Loja', 'loja', false, 'ALLTOUR_QUOTE_ONLY'),
    ('Cuenca', 'cuenca', 'Machala', 'machala', false, 'ALLTOUR_QUOTE_ONLY'),
    ('Cuenca', 'cuenca', 'Riobamba', 'riobamba', false, 'ALLTOUR_QUOTE_ONLY'),
    ('Cuenca', 'cuenca', 'Banos', 'banos', false, 'ALLTOUR_QUOTE_ONLY'),
    ('Cuenca', 'cuenca', 'Ingapirca', 'ingapirca', false, 'ALLTOUR_QUOTE_ONLY'),
    ('Cuenca', 'cuenca', 'Guayaquil', 'guayaquil', false, 'ALLTOUR_QUOTE_ONLY'),
    ('Manta', 'manta', 'Guayaquil', 'guayaquil', false, 'ALLTOUR_QUOTE_ONLY'),
    ('Manta', 'manta', 'Montanita', 'montanita', false, 'ALLTOUR_QUOTE_ONLY'),
    ('Manta', 'manta', 'Puerto Lopez', 'puerto_lopez', false, 'ALLTOUR_QUOTE_ONLY'),
    ('Manta', 'manta', 'Salinas', 'salinas', false, 'ALLTOUR_QUOTE_ONLY'),
    ('Manta', 'manta', 'Pedernales', 'pedernales', false, 'ALLTOUR_QUOTE_ONLY'),
    ('Manta', 'manta', 'Esmeraldas', 'esmeraldas', false, 'ALLTOUR_QUOTE_ONLY'),
    ('Banos', 'banos', 'Riobamba', 'riobamba', false, 'ALLTOUR_QUOTE_ONLY'),
    ('Banos', 'banos', 'Cuenca', 'cuenca', false, 'ALLTOUR_QUOTE_ONLY'),
    ('Banos', 'banos', 'Puyo', 'puyo', false, 'ALLTOUR_QUOTE_ONLY'),
    ('Banos', 'banos', 'Tena', 'tena', false, 'ALLTOUR_QUOTE_ONLY'),
    ('Riobamba', 'riobamba', 'Cuenca', 'cuenca', false, 'ALLTOUR_QUOTE_ONLY'),
    ('Riobamba', 'riobamba', 'Guayaquil', 'guayaquil', false, 'ALLTOUR_QUOTE_ONLY'),
    ('Aeropuerto UIO', 'airport_uio', 'Quito', 'quito', true, 'ALLTOUR_QUOTE_ONLY'),
    ('Aeropuerto UIO', 'airport_uio', 'Cumbaya', 'cumbaya', true, 'ALLTOUR_QUOTE_ONLY'),
    ('Aeropuerto UIO', 'airport_uio', 'Tumbaco', 'tumbaco', true, 'ALLTOUR_QUOTE_ONLY'),
    ('Aeropuerto UIO', 'airport_uio', 'Otavalo', 'otavalo', true, 'ALLTOUR_QUOTE_ONLY'),
    ('Aeropuerto UIO', 'airport_uio', 'Ibarra', 'ibarra', true, 'ALLTOUR_QUOTE_ONLY'),
    ('Aeropuerto UIO', 'airport_uio', 'Cotopaxi', 'cotopaxi', true, 'ALLTOUR_QUOTE_ONLY'),
    ('Aeropuerto UIO', 'airport_uio', 'Mindo', 'mindo', true, 'ALLTOUR_QUOTE_ONLY'),
    ('Aeropuerto GYE', 'airport_gye', 'Guayaquil', 'guayaquil', true, 'ALLTOUR_QUOTE_ONLY'),
    ('Aeropuerto GYE', 'airport_gye', 'Salinas', 'salinas', true, 'ALLTOUR_QUOTE_ONLY'),
    ('Aeropuerto GYE', 'airport_gye', 'Montanita', 'montanita', true, 'ALLTOUR_QUOTE_ONLY'),
    ('Aeropuerto GYE', 'airport_gye', 'Cuenca', 'cuenca', true, 'ALLTOUR_QUOTE_ONLY'),
    ('Aeropuerto CUE', 'airport_cue', 'Cuenca', 'cuenca', true, 'ALLTOUR_QUOTE_ONLY'),
    ('Aeropuerto MEC', 'airport_mec', 'Manta', 'manta', true, 'ALLTOUR_QUOTE_ONLY')
  ) as rows(origin_name, origin_key, destination_name, destination_key, is_airport_route, source)
)
insert into routes (origin_name, origin_key, destination_name, destination_key, route_type, origin_city, destination_city, is_airport_route, source, active)
select origin_name, origin_key, destination_name, destination_key, 'point_to_point', origin_key, destination_key, is_airport_route, source, true
from route_rows
on conflict (origin_key, destination_key, route_type) do update set
  origin_name = excluded.origin_name,
  destination_name = excluded.destination_name,
  origin_city = excluded.origin_city,
  destination_city = excluded.destination_city,
  is_airport_route = excluded.is_airport_route,
  source = excluded.source,
  active = excluded.active,
  updated_at = now();

with supplier as (
  select id from suppliers where code = 'MARCOTOUR'
),
rate_rows as (
  select * from (values
    ('esmeraldas', array[290,300,350,450,650,720,800]::numeric[]),
    ('guayaquil', array[350,370,430,550,750,820,900]::numeric[]),
    ('cuenca', array[350,370,430,550,750,820,900]::numeric[]),
    ('manta', array[350,370,430,550,750,820,900]::numeric[]),
    ('tulcan', array[220,260,300,360,480,540,660]::numeric[]),
    ('lago_agrio', array[290,300,350,450,650,720,800]::numeric[]),
    ('coca', array[290,300,350,450,650,720,800]::numeric[]),
    ('tena', array[220,260,300,360,480,540,660]::numeric[]),
    ('misahualli', array[220,260,300,360,480,540,660]::numeric[]),
    ('loja', array[550,600,700,900,1100,1150,1300]::numeric[]),
    ('machala', array[550,600,700,900,1100,1150,1300]::numeric[]),
    ('macas', array[550,600,700,900,1100,1150,1300]::numeric[]),
    ('puyo', array[220,260,300,360,480,540,660]::numeric[]),
    ('casa_sulto', array[220,260,300,360,480,540,660]::numeric[]),
    ('salinas', array[520,570,660,850,1050,1100,1220]::numeric[]),
    ('santa_elena', array[520,570,660,850,1050,1100,1220]::numeric[]),
    ('montanita', array[520,570,660,850,1050,1100,1220]::numeric[]),
    ('huigra', array[220,260,300,360,480,540,660]::numeric[]),
    ('alausi', array[220,260,300,360,480,540,660]::numeric[])
  ) as rows(destination_key, rates)
),
expanded as (
  select route.id as route_id, class.id as class_id, rate_value.rate
  from supplier
  join rate_rows on true
  join routes route on route.origin_key = 'quito' and route.destination_key = rate_rows.destination_key and route.route_type = 'point_to_point'
  cross join lateral unnest(rate_rows.rates) with ordinality as rate_value(rate, display_order)
  join supplier_vehicle_classes class on class.supplier_id = supplier.id and class.display_order = rate_value.display_order
)
insert into supplier_route_rates (
  supplier_id,
  route_id,
  supplier_vehicle_class_id,
  supplier_rate,
  currency,
  rate_type,
  valid_from,
  valid_until,
  source_reference,
  source_version,
  active
)
select
  supplier.id,
  expanded.route_id,
  expanded.class_id,
  expanded.rate,
  'USD',
  'point_to_point',
  '2026-01-01',
  '2026-12-31',
  'Marcotour Tarifario Oficial Transporte Turistico Ecuador - Vigencia 2026',
  2026,
  true
from supplier
join expanded on true
on conflict (supplier_id, route_id, supplier_vehicle_class_id, rate_type, valid_from) do update set
  supplier_rate = excluded.supplier_rate,
  currency = excluded.currency,
  valid_until = excluded.valid_until,
  source_reference = excluded.source_reference,
  source_version = excluded.source_version,
  active = excluded.active,
  updated_at = now();

with supplier as (
  select id from suppliers where code = 'MARCOTOUR'
),
service_rows as (
  select * from (values
    ('transfer_night_cena_2h', 'Transfer night o cena', 'time', 2, null, '{}'::jsonb, array[45,55,70,90,130,150,170]::numeric[]),
    ('city_linea_shopping_museo_3h', 'City / linea / shopping o museo', 'time', 3, null, '{}'::jsonb, array[80,90,100,120,160,180,200]::numeric[]),
    ('city_linea_lunch_8_10h', 'City linea lunch', 'time', 10, null, '{"source_duration":"8 a 10 horas"}'::jsonb, array[120,130,150,180,220,260,300]::numeric[]),
    ('full_day_otavalo', 'Otavalo', 'full_day', null, 1, '{"source_group":"Otavalo / Mindo / Saquisili / Pujili / Salcedo"}'::jsonb, array[130,140,160,190,240,280,320]::numeric[]),
    ('full_day_mindo', 'Mindo', 'full_day', null, 1, '{"source_group":"Otavalo / Mindo / Saquisili / Pujili / Salcedo"}'::jsonb, array[130,140,160,190,240,280,320]::numeric[]),
    ('full_day_saquisili', 'Saquisili', 'full_day', null, 1, '{"source_group":"Otavalo / Mindo / Saquisili / Pujili / Salcedo"}'::jsonb, array[130,140,160,190,240,280,320]::numeric[]),
    ('full_day_pujili', 'Pujili', 'full_day', null, 1, '{"source_group":"Otavalo / Mindo / Saquisili / Pujili / Salcedo"}'::jsonb, array[130,140,160,190,240,280,320]::numeric[]),
    ('full_day_salcedo', 'Salcedo', 'full_day', null, 1, '{"source_group":"Otavalo / Mindo / Saquisili / Pujili / Salcedo"}'::jsonb, array[130,140,160,190,240,280,320]::numeric[]),
    ('full_day_cotopaxi', 'Cotopaxi', 'full_day', null, 1, '{"source_group":"Cotopaxi / Ibarra"}'::jsonb, array[150,160,170,210,250,300,350]::numeric[]),
    ('full_day_ibarra', 'Ibarra', 'full_day', null, 1, '{"source_group":"Cotopaxi / Ibarra"}'::jsonb, array[150,160,170,210,250,300,350]::numeric[]),
    ('full_day_riobamba', 'Riobamba', 'full_day', null, 1, '{"source_group":"Riobamba / Banos / Santo Domingo / Puerto Quito"}'::jsonb, array[180,200,230,250,380,415,450]::numeric[]),
    ('full_day_banos', 'Banos', 'full_day', null, 1, '{"source_group":"Riobamba / Banos / Santo Domingo / Puerto Quito"}'::jsonb, array[180,200,230,250,380,415,450]::numeric[]),
    ('full_day_santo_domingo', 'Santo Domingo', 'full_day', null, 1, '{"source_group":"Riobamba / Banos / Santo Domingo / Puerto Quito"}'::jsonb, array[180,200,230,250,380,415,450]::numeric[]),
    ('full_day_puerto_quito', 'Puerto Quito', 'full_day', null, 1, '{"source_group":"Riobamba / Banos / Santo Domingo / Puerto Quito"}'::jsonb, array[180,200,230,250,380,415,450]::numeric[]),
    ('full_day_papallacta', 'Papallacta', 'full_day', null, 1, '{"source_group":"Papallacta / Pasachoa"}'::jsonb, array[120,130,150,180,220,260,300]::numeric[]),
    ('full_day_pasachoa', 'Pasachoa', 'full_day', null, 1, '{"source_group":"Papallacta / Pasachoa"}'::jsonb, array[120,130,150,180,220,260,300]::numeric[]),
    ('full_day_calacali', 'Calacali', 'full_day', null, 1, '{"source_group":"Calacali / Volcan / Refugio Chimborazo / Chachimbiro"}'::jsonb, array[180,200,230,250,380,415,450]::numeric[]),
    ('full_day_volcan', 'Volcan', 'full_day', null, 1, '{"source_group":"Calacali / Volcan / Refugio Chimborazo / Chachimbiro","ambiguous_label":true}'::jsonb, array[180,200,230,250,380,415,450]::numeric[]),
    ('full_day_refugio_chimborazo', 'Refugio Chimborazo', 'full_day', null, 1, '{"source_group":"Calacali / Volcan / Refugio Chimborazo / Chachimbiro"}'::jsonb, array[180,200,230,250,380,415,450]::numeric[]),
    ('full_day_chachimbiro', 'Chachimbiro', 'full_day', null, 1, '{"source_group":"Calacali / Volcan / Refugio Chimborazo / Chachimbiro"}'::jsonb, array[180,200,230,250,380,415,450]::numeric[]),
    ('full_day_guaranda', 'Guaranda', 'full_day', null, 1, '{"source_group":"Guaranda / Salinas de Bolivar / Guardaloma Republica"}'::jsonb, array[220,240,270,300,440,495,550]::numeric[]),
    ('full_day_salinas_de_bolivar', 'Salinas de Bolivar', 'full_day', null, 1, '{"source_group":"Guaranda / Salinas de Bolivar / Guardaloma Republica"}'::jsonb, array[220,240,270,300,440,495,550]::numeric[]),
    ('full_day_guardaloma_republica', 'Guardaloma Republica', 'full_day', null, 1, '{"source_group":"Guaranda / Salinas de Bolivar / Guardaloma Republica","ambiguous_label":true}'::jsonb, array[220,240,270,300,440,495,550]::numeric[]),
    ('multi_day_esmeraldas_3d', 'Esmeraldas - 3 dias', 'multi_day', null, 3, '{"source_description":"Salida viernes noche y retorno domingo"}'::jsonb, array[390,390,450,540,660,780,900]::numeric[]),
    ('multi_day_cuenca_4d', 'Cuenca - 4 dias', 'multi_day', null, 4, '{"source_description":"Salida jueves noche y retorno domingo"}'::jsonb, array[520,560,640,760,960,1120,1280]::numeric[]),
    ('multi_day_alojamientos_4d', 'Alojamientos - 4 dias', 'multi_day', null, 4, '{"source_group":"Alojamientos / Pedernales / Esmeraldas","source_description":"Salida jueves noche y retorno domingo"}'::jsonb, array[480,520,600,720,880,1040,1200]::numeric[]),
    ('multi_day_pedernales_4d', 'Pedernales - 4 dias', 'multi_day', null, 4, '{"source_group":"Alojamientos / Pedernales / Esmeraldas","source_description":"Salida jueves noche y retorno domingo"}'::jsonb, array[480,520,600,720,880,1040,1200]::numeric[]),
    ('multi_day_esmeraldas_4d', 'Esmeraldas - 4 dias', 'multi_day', null, 4, '{"source_group":"Alojamientos / Pedernales / Esmeraldas","source_description":"Salida jueves noche y retorno domingo"}'::jsonb, array[480,520,600,720,880,1040,1200]::numeric[]),
    ('multi_day_guayaquil_4d', 'Guayaquil - 4 dias', 'multi_day', null, 4, '{"source_group":"Guayaquil o Manta","source_description":"Salida jueves noche y retorno domingo"}'::jsonb, array[550,594,660,770,1045,1240,1430]::numeric[]),
    ('multi_day_manta_4d', 'Manta - 4 dias', 'multi_day', null, 4, '{"source_group":"Guayaquil o Manta","source_description":"Salida jueves noche y retorno domingo"}'::jsonb, array[550,594,660,770,1045,1240,1430]::numeric[]),
    ('multi_day_lago_agrio_4d', 'Lago Agrio - 4 dias', 'multi_day', null, 4, '{"source_group":"Lago Agrio o Coca","source_description":"Salida jueves noche y retorno domingo"}'::jsonb, array[480,520,660,720,880,1040,1200]::numeric[]),
    ('multi_day_coca_4d', 'Coca - 4 dias', 'multi_day', null, 4, '{"source_group":"Lago Agrio o Coca","source_description":"Salida jueves noche y retorno domingo"}'::jsonb, array[480,520,660,720,880,1040,1200]::numeric[]),
    ('additional_hour', 'Hora adicional', 'additional_hour', 1, null, '{}'::jsonb, array[10,10,12,15,20,25,30]::numeric[])
  ) as rows(service_code, service_name, service_type, duration_hours, duration_days, metadata, rates)
),
expanded as (
  select class.id as class_id, service_rows.*, rate_value.rate
  from supplier
  join service_rows on true
  cross join lateral unnest(service_rows.rates) with ordinality as rate_value(rate, display_order)
  join supplier_vehicle_classes class on class.supplier_id = supplier.id and class.display_order = rate_value.display_order
)
insert into supplier_service_rates (
  supplier_id,
  supplier_vehicle_class_id,
  service_code,
  service_name,
  service_type,
  duration_hours,
  duration_days,
  supplier_rate,
  currency,
  valid_from,
  valid_until,
  source_reference,
  source_version,
  metadata,
  active
)
select
  supplier.id,
  expanded.class_id,
  expanded.service_code,
  expanded.service_name,
  expanded.service_type,
  expanded.duration_hours,
  expanded.duration_days,
  expanded.rate,
  'USD',
  '2026-01-01',
  '2026-12-31',
  'Marcotour Tarifario Oficial Transporte Turistico Ecuador - Vigencia 2026',
  2026,
  expanded.metadata,
  true
from supplier
join expanded on true
on conflict (supplier_id, supplier_vehicle_class_id, service_code, valid_from) do update set
  service_name = excluded.service_name,
  service_type = excluded.service_type,
  duration_hours = excluded.duration_hours,
  duration_days = excluded.duration_days,
  supplier_rate = excluded.supplier_rate,
  currency = excluded.currency,
  valid_until = excluded.valid_until,
  source_reference = excluded.source_reference,
  source_version = excluded.source_version,
  metadata = excluded.metadata,
  active = excluded.active,
  updated_at = now();
