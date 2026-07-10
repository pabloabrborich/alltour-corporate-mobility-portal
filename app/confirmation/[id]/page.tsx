import { CarFront, CheckCircle2, MessageCircle, Phone } from "lucide-react";
import { Footer } from "@/components/footer";
import { RouteStopsTimeline } from "@/components/route-stops-timeline";
import { SiteHeader } from "@/components/site-header";
import { StatusPill } from "@/components/status-pill";
import { formatDateTime } from "@/lib/format";
import { getSupabaseAdminClient, hasSupabaseConfig } from "@/lib/supabase";
import type { ServiceRequest, ServiceTicket } from "@/lib/types";
import { createWhatsappUrl } from "@/lib/whatsapp";

type ConfirmationRequest = ServiceRequest & {
  service_tickets: ServiceTicket[];
};

export default async function ConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const request = await getConfirmation(id);
  const ticket = request?.service_tickets?.[0];
  const driverWhatsappUrl = request ? createWhatsappUrl(ticket?.driver_phone, buildPassengerSupportMessage(request, ticket)) : null;
  const supportWhatsappUrl = request
    ? createWhatsappUrl(process.env.NEXT_PUBLIC_SUPPORT_PHONE, buildPassengerSupportMessage(request, ticket))
    : null;

  return (
    <main>
      <SiteHeader />
      <section className="container-page py-10">
        <div className="panel mx-auto max-w-3xl overflow-hidden">
          <div className="bg-navy p-6 text-white">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="text-gold" />
              <p className="font-semibold">Confirmacion de servicio ALLTOUR</p>
            </div>
            <h1 className="font-display mt-4 text-4xl font-medium">Detalle para pasajero</h1>
          </div>

          {request ? (
            <div className="p-6">
              <div className="mb-6">
                <StatusPill status={request.status} />
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <Detail label="Hora de recogida" value={formatDateTime(request.pickup_datetime)} />
                <Detail label="Lugar de recogida" value={request.pickup_location} />
                <Detail label="Destino" value={request.dropoff_location} />
                <Detail label="Conductor" value={ticket?.assigned_driver || "Por confirmar"} />
                <Detail label="Telefono conductor" value={ticket?.driver_phone || "Por confirmar"} />
                <Detail label="Vehiculo" value={request.vehicle_type || "Por confirmar"} />
                <Detail label="Placa" value={ticket?.vehicle_plate || "Por confirmar"} />
                <Detail label="Soporte" value={process.env.NEXT_PUBLIC_SUPPORT_PHONE || "+593 99 000 0000"} />
              </div>
              <div className="mt-6">
                <RouteStopsTimeline stops={request.route_stops} />
              </div>
              <div className="mt-6 rounded-md border border-line bg-slate-50 p-4">
                <p className="text-sm font-bold text-steel">Notas</p>
                <p className="mt-2 text-sm">{request.special_requirements || "Presentarse en el punto de encuentro acordado."}</p>
              </div>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                {ticket?.driver_phone ? (
                  <a className="btn-primary" href={`tel:${ticket.driver_phone}`}>
                    <Phone size={16} /> Llamar conductor
                  </a>
                ) : null}
                {driverWhatsappUrl ? (
                  <a className="btn-secondary" href={driverWhatsappUrl} target="_blank" rel="noreferrer">
                    <MessageCircle size={16} /> WhatsApp conductor
                  </a>
                ) : null}
                {supportWhatsappUrl ? (
                  <a className="btn-secondary" href={supportWhatsappUrl} target="_blank" rel="noreferrer">
                    <MessageCircle size={16} /> WhatsApp soporte
                  </a>
                ) : null}
                <div className="btn-secondary">
                  <CarFront size={16} /> Servicio monitoreado
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6">
              <p className="text-steel">No se encontro la confirmacion o Supabase no esta configurado.</p>
            </div>
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-line p-4">
      <p className="text-xs font-bold uppercase text-steel">{label}</p>
      <p className="mt-2 font-semibold">{value}</p>
    </div>
  );
}

async function getConfirmation(id: string): Promise<ConfirmationRequest | null> {
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

  return data as ConfirmationRequest;
}

function buildPassengerSupportMessage(request: ConfirmationRequest, ticket?: ServiceTicket) {
  return `Hola ALLTOUR, consulto sobre mi servicio:
Fecha/hora: ${formatDateTime(request.pickup_datetime)}
Ruta: ${request.pickup_location} -> ${request.dropoff_location}
Conductor: ${ticket?.assigned_driver || "Por confirmar"}
Placa: ${ticket?.vehicle_plate || "Por confirmar"}
Estado: ${request.status}`;
}
