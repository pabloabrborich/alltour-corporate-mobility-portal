insert into companies (name, contact_name, email, phone, industry)
values
  ('Andes Pharma', 'Daniela Rios', 'daniela.rios@andespharma.example', '+593 99 111 2222', 'Farmaceutica'),
  ('Delegacion Medica LATAM', 'Martin Vega', 'ops@delegacionlatam.example', '+593 98 333 4444', 'Congreso medico')
on conflict (name) do nothing;

insert into vehicles (type, capacity, supplier_name, plate, driver_name, driver_phone)
values
  ('Van ejecutiva', 10, 'ALLTOUR Quito', 'PBC-4182', 'Carlos Mena', '+593 99 555 1212'),
  ('SUV', 4, 'ALLTOUR Executive', 'GSK-7031', 'Paola Torres', '+593 98 777 9090'),
  ('Bus', 40, 'ALLTOUR Eventos', 'UAA-2084', 'Luis Andrade', '+593 99 444 8080');

with company as (
  select id from companies where name = 'Andes Pharma'
), request as (
  insert into service_requests (
    company_id,
    service_type,
    pickup_location,
    dropoff_location,
    pickup_datetime,
    passengers_count,
    passenger_names,
    vehicle_type,
    flight_info,
    special_requirements,
    status,
    estimated_price
  )
  select
    company.id,
    'Traslado aeropuerto',
    'Aeropuerto Mariscal Sucre, Quito',
    'Swissotel Quito',
    now() + interval '2 days',
    4,
    'Ana Torres
Miguel Salazar
Priya Nair
Thomas Beck',
    'Van ejecutiva',
    'AV7391 llegada 18:20',
    'Letrero con logo corporativo',
    'Vehiculo asignado',
    115
  from company
  returning id
)
insert into service_tickets (
  request_id,
  assigned_driver,
  driver_phone,
  vehicle_plate,
  confirmation_status,
  operation_status,
  invoice_status
)
select id, 'Carlos Mena', '+593 99 555 1212', 'PBC-4182', 'Confirmado', 'Asignado', 'Pendiente'
from request;
