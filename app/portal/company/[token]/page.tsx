import Link from "next/link";
import { BarChart3, CalendarCheck, CheckCircle2, Clock3, FileText, ShieldCheck } from "lucide-react";
import { Footer } from "@/components/footer";
import { RouteStopsTimeline } from "@/components/route-stops-timeline";
import { SiteHeader } from "@/components/site-header";
import { StatCard } from "@/components/stat-card";
import { StatusPill } from "@/components/status-pill";
import { formatDateTime } from "@/lib/format";
import { getSupabaseAdminClient, hasSupabaseConfig } from "@/lib/supabase";
import type { Company, ServiceRequest, TransportRequest } from "@/lib/types";

type CompanyPortalData = Company & {
  service_requests: ServiceRequest[];
  transport_requests: TransportRequest[];
};

export default async function CompanyPortalPage({
  params,
  searchParams
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ code?: string }>;
}) {
  const { token } = await params;
  const { code } = await searchParams;
  const company = await getCompanyPortal(token);

  if (!company) {
    return (
      <main>
        <SiteHeader />
        <section className="container-page py-16">
          <div className="panel mx-auto max-w-2xl p-8">
            <h1 className="text-2xl font-bold">Portal no disponible</h1>
            <p className="mt-3 text-steel">El enlace no esta activo o no corresponde a una empresa habilitada.</p>
            <Link href="/request" className="btn-primary mt-6">
              Crear solicitud
            </Link>
          </div>
        </section>
        <Footer />
      </main>
    );
  }

  const accessCode = company.portal_access_code?.trim();
  const unlocked = !accessCode || code?.trim().toLowerCase() === accessCode.toLowerCase();

  if (!unlocked) {
    return (
      <main>
        <SiteHeader />
        <section className="container-page py-16">
          <div className="panel mx-auto max-w-xl p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gold">Portal corporativo</p>
            <h1 className="font-display mt-3 text-4xl font-medium">{company.brand_name || company.name}</h1>
            <p className="mt-3 text-sm text-steel">Ingrese el codigo de acceso para ver los servicios activos de esta cuenta.</p>
            <form className="mt-6 grid gap-3">
              <input className="field" name="code" placeholder="Codigo de acceso" />
              <button className="btn-primary" type="submit">
                Acceder
              </button>
            </form>
          </div>
        </section>
        <Footer />
      </main>
    );
  }

  const requests = company.service_requests || [];
  const transportRequests = company.transport_requests || [];
  const upcomingTransport = transportRequests.filter((request) => getTransportDate(request) >= new Date());
  const pending = transportRequests.filter((request) => !["cerrado", "cancelado"].includes(request.status));
  const completed = transportRequests.filter((request) => request.status === "cerrado");

  return (
    <main>
      <SiteHeader />
      <section className="bg-navy py-10 text-white">
        <div className="container-page flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold text-gold">Portal corporativo</p>
            <h1 className="font-display mt-2 text-5xl font-medium">{company.brand_name || company.name}</h1>
            <p className="mt-3 max-w-2xl text-slate-200">
              Servicios, vouchers, rutas y estados operativos asociados a su cuenta ALLTOUR.
            </p>
          </div>
          <Link href="/request" className="btn-primary">
            Nueva solicitud
          </Link>
        </div>
      </section>

      <section className="container-page py-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Proximos servicios" value={upcomingTransport.length} icon={CalendarCheck} />
          <StatCard label="Servicios activos" value={pending.length} icon={Clock3} />
          <StatCard label="Completados" value={completed.length} icon={CheckCircle2} />
          <StatCard label="Volumen registrado" value={transportRequests.length + requests.length} icon={BarChart3} />
        </div>

        <div className="panel mt-8 overflow-hidden">
          <div className="border-b border-line p-5">
            <h2 className="text-xl font-bold">Servicios de transporte</h2>
            <p className="mt-1 text-sm text-steel">Reservas confirmadas, vouchers y detalles operativos disponibles para la cuenta.</p>
          </div>
          <div className="grid gap-4 p-5">
            {transportRequests.map((request) => (
              <article key={request.id} className="rounded-xl border border-line bg-white p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold uppercase tracking-[0.14em] text-steel">{request.reference}</span>
                      <StatusPill status={request.status} />
                      {request.is_vip ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs font-bold text-navy">
                          <ShieldCheck size={14} /> VIP
                        </span>
                      ) : null}
                    </div>
                    <h3 className="mt-3 text-xl font-bold">{request.passenger_name || request.customer_name}</h3>
                    <p className="mt-1 text-sm text-steel">
                      {formatTransportDate(request)} | {request.passengers} pasajero{request.passengers === 1 ? "" : "s"}
                    </p>
                    {request.passenger_phone ? (
                      <p className="mt-1 text-sm text-steel">Contacto PAX: {request.passenger_phone}</p>
                    ) : null}
                  </div>
                  {request.voucher_token ? (
                    <Link className="btn-primary" href={`/voucher/${request.voucher_token}`} target="_blank">
                      <FileText size={16} /> Ver voucher
                    </Link>
                  ) : null}
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <InfoBlock label="Ruta" value={`${request.pickup} -> ${request.destination}`} />
                  <InfoBlock label="Vehiculo" value={request.assigned_vehicle || request.selected_vehicle} />
                  <InfoBlock label="Coordinador" value={`${request.customer_name} / ${request.customer_phone}`} />
                  <InfoBlock label="Vuelo" value={request.flight_number || "No registrado"} />
                  <InfoBlock label="Seguridad" value={securityLabel(request.security_level)} />
                </div>

                {request.stops?.length ? (
                  <div className="mt-4 rounded-lg bg-slate-50 p-4 text-sm text-steel">
                    <span className="font-semibold text-navy">Paradas:</span>{" "}
                    {request.stops.map((stop) => stop.place).join(" | ")}
                  </div>
                ) : null}

                {request.operational_notes ? (
                  <div className="mt-4 rounded-lg border border-line p-4 text-sm text-steel">
                    <span className="font-semibold text-navy">Notas operativas:</span> {request.operational_notes}
                  </div>
                ) : null}
              </article>
            ))}

            {transportRequests.length === 0 ? (
              <div className="rounded-xl border border-line bg-white p-8 text-center text-steel">
                Aun no hay servicios de transporte asociados a esta cuenta.
              </div>
            ) : null}
          </div>
        </div>

        <div className="panel mt-8 overflow-hidden">
          <div className="border-b border-line p-5">
            <h2 className="text-xl font-bold">Servicios de la empresa</h2>
            <p className="mt-1 text-sm text-steel">Agenda visible para seguimiento corporativo.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-steel">
                <tr>
                  <th className="px-5 py-3">Fecha / hora</th>
                  <th className="px-5 py-3">Servicio</th>
                  <th className="px-5 py-3">Ruta</th>
                  <th className="px-5 py-3">Pasajeros</th>
                  <th className="px-5 py-3">Estado</th>
                  <th className="px-5 py-3">Confirmacion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {requests.map((request) => (
                  <tr key={request.id}>
                    <td className="px-5 py-4 font-semibold">{formatDateTime(request.pickup_datetime)}</td>
                    <td className="px-5 py-4">{request.service_type}</td>
                    <td className="px-5 py-4">
                      {request.pickup_location} {"->"} {request.dropoff_location}
                    </td>
                    <td className="px-5 py-4">{request.passengers_count}</td>
                    <td className="px-5 py-4">
                      <StatusPill status={request.status} />
                    </td>
                    <td className="px-5 py-4">
                      <Link className="btn-secondary min-h-9 px-3 py-1" href={`/confirmation/${request.id}`}>
                        Ver
                      </Link>
                    </td>
                  </tr>
                ))}
                {requests.length === 0 ? (
                  <tr>
                    <td className="px-5 py-8 text-center text-steel" colSpan={6}>
                      Aun no hay servicios registrados para esta empresa.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 grid gap-6">
          {requests
            .filter((request) => request.route_stops?.length)
            .slice(0, 3)
            .map((request) => (
              <RouteStopsTimeline key={request.id} stops={request.route_stops} />
            ))}
        </div>
      </section>
      <Footer />
    </main>
  );
}

async function getCompanyPortal(token: string): Promise<CompanyPortalData | null> {
  if (!hasSupabaseConfig()) {
    return null;
  }

  const supabase = getSupabaseAdminClient();
  const { data: company, error } = await supabase
    .from("companies")
    .select("*")
    .eq("portal_access_token", token)
    .eq("portal_enabled", true)
    .single();

  if (error) {
    return null;
  }

  const [{ data: serviceRequests }, { data: transportRequests }] = await Promise.all([
    supabase
      .from("service_requests")
      .select("*")
      .eq("company_id", company.id)
      .order("pickup_datetime", { ascending: false }),
    supabase
      .from("transport_requests")
      .select("*")
      .eq("company_id", company.id)
      .order("created_at", { ascending: false })
  ]);

  return {
    ...(company as Company),
    service_requests: (serviceRequests || []) as ServiceRequest[],
    transport_requests: (transportRequests || []) as TransportRequest[]
  };
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 p-4">
      <div className="text-xs font-bold uppercase tracking-[0.12em] text-steel">{label}</div>
      <div className="mt-1 font-semibold text-navy">{value}</div>
    </div>
  );
}

function getTransportDate(request: TransportRequest) {
  const date = request.service_date || request.scheduled_date;
  const time = request.service_time || request.scheduled_time || "00:00";
  return date ? new Date(`${date}T${time}`) : new Date(request.created_at);
}

function formatTransportDate(request: TransportRequest) {
  const date = request.service_date || request.scheduled_date;
  const time = request.service_time || request.scheduled_time;

  if (!date) {
    return "Horario por confirmar";
  }

  return `${date}${time ? ` ${time}` : ""}`;
}

function securityLabel(value?: string | null) {
  const labels: Record<string, string> = {
    standard: "Servicio estandar",
    vip_protocol: "Protocolo VIP",
    security_agent: "Agente de seguridad disponible bajo solicitud",
    armed_security: "Agente armado disponible bajo solicitud",
    escort_vehicle: "Vehiculo custodio / caravana bajo solicitud"
  };

  return labels[value || "standard"] || labels.standard;
}
