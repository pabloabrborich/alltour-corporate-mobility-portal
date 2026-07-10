import Link from "next/link";
import { Mail, MessageCircle } from "lucide-react";
import { updateTicket } from "@/app/actions";
import { CopyButton } from "@/components/copy-tools";
import { PortalLinkCard } from "@/components/portal-link-card";
import { formatRouteStops, RouteStopsTimeline } from "@/components/route-stops-timeline";
import { StatusPill } from "@/components/status-pill";
import { requireAdmin } from "@/lib/auth";
import { getCompanyPortalPath } from "@/lib/company-portal";
import { currency, formatDateTime } from "@/lib/format";
import { getSupabaseAdminClient, hasSupabaseConfig } from "@/lib/supabase";
import type { ServiceRequest, ServiceTicket } from "@/lib/types";

const statuses = ["Nueva solicitud", "Confirmado", "Vehiculo asignado", "En operacion", "Completado", "Cancelado"];
const invoiceStatuses = ["Pendiente", "Incluido en factura mensual", "Facturado", "Pagado", "No facturable"];
const operationStatuses = ["Por asignar", "Asignado", "En ruta", "Pasajero a bordo", "Completado", "Incidencia"];

type FullRequest = ServiceRequest & {
  service_tickets: ServiceTicket[];
};

export default async function ServiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const request = await getRequest(id);

  if (!request) {
    return (
      <main className="min-h-screen bg-mist">
        <div className="container-page py-10">
          <Link href="/admin" className="btn-secondary">
            Volver
          </Link>
          <div className="panel mt-6 p-8">No se encontro el servicio.</div>
        </div>
      </main>
    );
  }

  const ticket = request.service_tickets?.[0];
  const passengerText = buildPassengerConfirmation(request, ticket);
  const emailText = buildCorporateEmail(request, ticket);
  const portalPath = getCompanyPortalPath(request.companies);

  return (
    <main className="min-h-screen bg-mist">
      <header className="border-b border-line bg-white">
        <div className="container-page flex min-h-16 items-center justify-between">
          <Link href="/admin" className="btn-secondary">
            Volver a agenda
          </Link>
          <StatusPill status={request.status} />
        </div>
      </header>

      <section className="container-page grid gap-6 py-8 lg:grid-cols-[1fr_420px]">
        <div className="space-y-6">
          <div className="panel p-6">
            <p className="text-sm font-semibold text-gold">Ticket operativo</p>
            <h1 className="mt-2 text-3xl font-bold">{request.companies?.name || "Empresa"}</h1>
            <p className="mt-2 text-steel">
              {request.pickup_location} {"->"} {request.dropoff_location}
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Detail label="Fecha / hora" value={formatDateTime(request.pickup_datetime)} />
              <Detail label="Tipo de servicio" value={request.service_type} />
              <Detail label="Pasajeros" value={String(request.passengers_count)} />
              <Detail label="Vehiculo solicitado" value={request.vehicle_type || "Por definir"} />
              <Detail label="Vuelo" value={request.flight_info || "No aplica"} />
              <Detail label="Precio estimado" value={currency(request.estimated_price)} />
            </div>
          </div>

          <RouteStopsTimeline stops={request.route_stops} />

          <div className="panel p-6">
            <h2 className="text-xl font-bold">Detalle de pasajeros y requisitos</h2>
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <TextBlock label="Pasajeros" value={request.passenger_names || "No informado"} />
              <TextBlock label="Requerimientos especiales" value={request.special_requirements || "Sin requerimientos"} />
              <TextBlock label="Notas internas" value={request.internal_notes || "Sin notas"} />
              <TextBlock label="Contacto" value={`${request.companies?.contact_name || ""}\n${request.companies?.email || ""}\n${request.companies?.phone || ""}`} />
            </div>
          </div>

          <div className="panel p-6">
            <h2 className="text-xl font-bold">Textos de confirmacion</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-md border border-line bg-slate-50 p-4">
                <div className="mb-3 flex items-center gap-2 font-semibold">
                  <MessageCircle size={18} /> WhatsApp pasajero
                </div>
                <p className="whitespace-pre-line text-sm text-steel">{passengerText}</p>
                <div className="mt-4">
                  <CopyButton text={passengerText} label="Copiar WhatsApp" />
                </div>
              </div>
              <div className="rounded-md border border-line bg-slate-50 p-4">
                <div className="mb-3 flex items-center gap-2 font-semibold">
                  <Mail size={18} /> Email corporativo
                </div>
                <p className="whitespace-pre-line text-sm text-steel">{emailText}</p>
                <div className="mt-4">
                  <CopyButton text={emailText} label="Copiar email" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <PortalLinkCard path={portalPath} />

          <form action={updateTicket} className="panel h-fit p-6">
            <h2 className="text-xl font-bold">Actualizar operacion</h2>
            <input type="hidden" name="request_id" value={request.id} />
            <input type="hidden" name="ticket_id" value={ticket?.id || ""} />
            <div className="mt-5 space-y-4">
              <Select name="status" label="Estado" options={statuses} defaultValue={request.status} />
              <Select
                name="operation_status"
                label="Estado operativo"
                options={operationStatuses}
                defaultValue={ticket?.operation_status || "Por asignar"}
              />
              <Select
                name="invoice_status"
                label="Estado de factura"
                options={invoiceStatuses}
                defaultValue={ticket?.invoice_status || "Pendiente"}
              />
              <Input name="estimated_price" label="Precio estimado" type="number" step="0.01" defaultValue={request.estimated_price || ""} />
              <Input name="vehicle_type" label="Tipo de vehiculo" defaultValue={request.vehicle_type || ""} />
              <Input name="assigned_driver" label="Conductor asignado" defaultValue={ticket?.assigned_driver || ""} />
              <Input name="driver_phone" label="Telefono conductor" defaultValue={ticket?.driver_phone || ""} />
              <Input name="vehicle_plate" label="Placa" defaultValue={ticket?.vehicle_plate || ""} />
              <label className="block">
                <span className="label">Notas internas</span>
                <textarea className="field min-h-28" name="internal_notes" defaultValue={request.internal_notes || ""} />
              </label>
            </div>
            <button className="btn-primary mt-6 w-full" type="submit">
              Guardar cambios
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase text-steel">{label}</p>
      <p className="mt-1 font-semibold text-ink">{value}</p>
    </div>
  );
}

function TextBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm font-bold text-steel">{label}</p>
      <p className="mt-2 whitespace-pre-line rounded-md border border-line bg-slate-50 p-3 text-sm text-ink">{value}</p>
    </div>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const { label, ...inputProps } = props;
  return (
    <label className="block">
      <span className="label">{label}</span>
      <input className="field" {...inputProps} />
    </label>
  );
}

function Select({
  label,
  options,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; options: string[] }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      <select className="field" {...props}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

async function getRequest(id: string): Promise<FullRequest | null> {
  if (!hasSupabaseConfig()) {
    return null;
  }

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("service_requests")
    .select("*, companies(*), service_tickets(*)")
    .eq("id", id)
    .single();

  if (error) {
    return null;
  }

  return data as FullRequest;
}

function buildPassengerConfirmation(request: FullRequest, ticket?: ServiceTicket) {
  const routeStops = formatRouteStops(request.route_stops);

  return `Confirmacion ALLTOUR
Hora de recogida: ${formatDateTime(request.pickup_datetime)}
Lugar: ${request.pickup_location}
Destino: ${request.dropoff_location}
${routeStops ? `Itinerario:\n${routeStops}\n` : ""}
Conductor: ${ticket?.assigned_driver || "Por confirmar"}
Telefono: ${ticket?.driver_phone || "Por confirmar"}
Vehiculo: ${request.vehicle_type || "Por confirmar"}
Placa: ${ticket?.vehicle_plate || "Por confirmar"}
Soporte: ${process.env.NEXT_PUBLIC_SUPPORT_PHONE || "+593 99 000 0000"}`;
}

function buildCorporateEmail(request: FullRequest, ticket?: ServiceTicket) {
  const routeStops = formatRouteStops(request.route_stops);

  return `Estimado equipo,

Confirmamos la recepcion y programacion del servicio:

Empresa: ${request.companies?.name || "Empresa"}
Fecha/hora: ${formatDateTime(request.pickup_datetime)}
Ruta: ${request.pickup_location} -> ${request.dropoff_location}
${routeStops ? `\nItinerario:\n${routeStops}` : ""}
Pasajeros: ${request.passengers_count}
Vehiculo: ${request.vehicle_type || "Por confirmar"}
Conductor: ${ticket?.assigned_driver || "Por confirmar"}
Placa: ${ticket?.vehicle_plate || "Por confirmar"}
Estado: ${request.status}

ALLTOUR mantendra monitoreo operativo hasta cierre del servicio.`;
}
