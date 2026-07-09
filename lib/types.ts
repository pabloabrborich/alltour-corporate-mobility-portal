export type Company = {
  id: string;
  name: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  industry: string | null;
  notes: string | null;
  created_at: string;
};

export type ServiceRequest = {
  id: string;
  company_id: string;
  service_type: string;
  pickup_location: string;
  dropoff_location: string;
  pickup_datetime: string;
  passengers_count: number;
  passenger_names: string | null;
  vehicle_type: string | null;
  flight_info: string | null;
  special_requirements: string | null;
  status: string;
  estimated_price: number | null;
  internal_notes: string | null;
  created_at: string;
  companies?: Company | null;
  service_tickets?: ServiceTicket[] | null;
};

export type Vehicle = {
  id: string;
  type: string;
  capacity: number | null;
  supplier_name: string | null;
  plate: string | null;
  driver_name: string | null;
  driver_phone: string | null;
  created_at: string;
};

export type ServiceTicket = {
  id: string;
  request_id: string;
  assigned_vehicle_id: string | null;
  assigned_driver: string | null;
  driver_phone: string | null;
  vehicle_plate: string | null;
  confirmation_status: string | null;
  operation_status: string | null;
  invoice_status: string | null;
  created_at: string;
  service_requests?: ServiceRequest | null;
};
