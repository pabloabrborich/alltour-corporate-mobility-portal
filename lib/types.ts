export type Company = {
  id: string;
  name: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  industry: string | null;
  notes: string | null;
  portal_access_token: string | null;
  portal_enabled: boolean | null;
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
  route_stops: RouteStop[] | null;
  created_at: string;
  companies?: Company | null;
  service_tickets?: ServiceTicket[] | null;
};

export type RouteStop = {
  id?: string;
  type: "pickup" | "stop" | "dropoff";
  place: string;
  reference?: string;
  maps_url?: string;
  passengers?: string;
  time?: string;
  notes?: string;
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

export type TransportStop = {
  place: string;
};

export type TransportRequest = {
  id: string;
  reference: string;
  status: string;
  city: string;
  booking_mode: string;
  pickup: string;
  destination: string;
  stops: TransportStop[] | null;
  when_type: string;
  scheduled_date: string | null;
  scheduled_time: string | null;
  passengers: number;
  is_airport_trip: boolean;
  flight_number: string | null;
  flight_direction: string | null;
  meet_and_greet: string | null;
  selected_vehicle: string;
  price_shown: string;
  price_status: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  customer_notes: string | null;
  created_at: string;
  updated_at: string;
};

export type LeadRequest = {
  id: string;
  reference: string;
  lead_type: "destination" | "flight" | string;
  status: string;
  destination: string | null;
  origin: string | null;
  travel_date: string | null;
  tentative_date: string | null;
  nights: number | null;
  adults: number | null;
  children: number | null;
  flight_from: string | null;
  flight_to: string | null;
  departure_date: string | null;
  return_date: string | null;
  passengers: number | null;
  cabin_class: string | null;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  customer_notes: string | null;
  payload: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};
