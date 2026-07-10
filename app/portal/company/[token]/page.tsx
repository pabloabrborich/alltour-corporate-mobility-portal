import Link from "next/link";
import { BarChart3, CalendarCheck, CheckCircle2, Clock3 } from "lucide-react";
import { Footer } from "@/components/footer";
import { RouteStopsTimeline } from "@/components/route-stops-timeline";
import { SiteHeader } from "@/components/site-header";
import { StatCard } from "@/components/stat-card";
import { StatusPill } from "@/components/status-pill";
import { formatDateTime } from "@/lib/format";
import { getSupabaseAdminClient, hasSupabaseConfig } from "@/lib/supabase";
import type { Company, ServiceRequest } from "@/lib/types";

type CompanyPortalData = Company & {
  service_requests: ServiceRequest[];
};

export default async function CompanyPortalPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
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

  const requests = company.service_requests || [];
  const upcoming = requests.filter((request) => new Date(request.pickup_datetime) >= new Date());
  const pending = requests.filter((request) => request.status !== "Completado" && request.status !== "Cancelado");
  const completed = requests.filter((request) => request.status === "Completado");

  return (
    <main>
      <SiteHeader />
      <section className="bg-navy py-10 text-white">
        <div className="container-page flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold text-gold">Portal corporativo</p>
            <h1 className="font-display mt-2 text-5xl font-medium">{company.name}</h1>
            <p className="mt-3 max-w-2xl text-slate-200">
              Servicios, itinerarios, estados operativos y confirmaciones asociadas a su empresa.
            </p>
          </div>
          <Link href="/request" className="btn-primary">
            Nueva solicitud
          </Link>
        </div>
      </section>

      <section className="container-page py-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Proximos servicios" value={upcoming.length} icon={CalendarCheck} />
          <StatCard label="Servicios activos" value={pending.length} icon={Clock3} />
          <StatCard label="Completados" value={completed.length} icon={CheckCircle2} />
          <StatCard label="Volumen registrado" value={requests.length} icon={BarChart3} />
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
  const { data, error } = await supabase
    .from("companies")
    .select("*, service_requests(*)")
    .eq("portal_access_token", token)
    .eq("portal_enabled", true)
    .order("pickup_datetime", { referencedTable: "service_requests", ascending: false })
    .single();

  if (error) {
    return null;
  }

  return data as CompanyPortalData;
}
