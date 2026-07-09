import Link from "next/link";
import { CalendarDays, CheckCircle2, ClipboardList, Clock3 } from "lucide-react";
import { updateRequestStatus } from "@/app/actions";
import { requireAdmin } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";
import { getSupabaseAdminClient, hasSupabaseConfig } from "@/lib/supabase";
import type { ServiceRequest } from "@/lib/types";
import { StatCard } from "@/components/stat-card";
import { StatusPill } from "@/components/status-pill";

const statuses = ["Nueva solicitud", "Confirmado", "Vehiculo asignado", "En operacion", "Completado", "Cancelado"];

export const dynamic = "force-dynamic";

export default async function AdminPage({
  searchParams
}: {
  searchParams: Promise<{ status?: string; date?: string }>;
}) {
  await requireAdmin();
  const filters = await searchParams;

  const requests = await getRequests(filters.status, filters.date);
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const month = now.toISOString().slice(0, 7);

  const stats = {
    newRequests: requests.filter((item) => item.status === "Nueva solicitud").length,
    confirmed: requests.filter((item) => item.status === "Confirmado" || item.status === "Vehiculo asignado").length,
    today: requests.filter((item) => item.pickup_datetime?.startsWith(today)).length,
    completedMonth: requests.filter((item) => item.status === "Completado" && item.pickup_datetime?.startsWith(month)).length
  };

  return (
    <main className="min-h-screen bg-mist">
      <AdminHeader />
      <section className="container-page py-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Nuevas solicitudes" value={stats.newRequests} icon={ClipboardList} />
          <StatCard label="Servicios confirmados" value={stats.confirmed} icon={CheckCircle2} />
          <StatCard label="Servicios hoy" value={stats.today} icon={CalendarDays} />
          <StatCard label="Completados este mes" value={stats.completedMonth} icon={Clock3} />
        </div>

        <div className="panel mt-8 overflow-hidden">
          <div className="border-b border-line p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h1 className="text-2xl font-bold">Agenda de servicios</h1>
                <p className="mt-1 text-sm text-steel">Solicitudes, rutas, pasajeros y estados operativos.</p>
              </div>
              <form className="grid gap-3 sm:grid-cols-[180px_180px_auto]">
                <label>
                  <span className="label">Estado</span>
                  <select className="field" name="status" defaultValue={filters.status || ""}>
                    <option value="">Todos</option>
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span className="label">Fecha</span>
                  <input className="field" name="date" type="date" defaultValue={filters.date || ""} />
                </label>
                <button className="btn-dark self-end" type="submit">
                  Filtrar
                </button>
              </form>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-steel">
                <tr>
                  <th className="px-5 py-3">Fecha / hora</th>
                  <th className="px-5 py-3">Empresa</th>
                  <th className="px-5 py-3">Ruta</th>
                  <th className="px-5 py-3">Pasajeros</th>
                  <th className="px-5 py-3">Vehiculo</th>
                  <th className="px-5 py-3">Estado</th>
                  <th className="px-5 py-3">Accion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {requests.map((request) => (
                  <tr key={request.id} className="bg-white">
                    <td className="px-5 py-4 font-semibold">{formatDateTime(request.pickup_datetime)}</td>
                    <td className="px-5 py-4">{request.companies?.name || "Sin empresa"}</td>
                    <td className="px-5 py-4">
                      {request.pickup_location} {"->"} {request.dropoff_location}
                    </td>
                    <td className="px-5 py-4">{request.passengers_count}</td>
                    <td className="px-5 py-4">{request.vehicle_type || "Por definir"}</td>
                    <td className="px-5 py-4">
                      <StatusPill status={request.status} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <form action={updateRequestStatus} className="flex gap-2">
                          <input type="hidden" name="id" value={request.id} />
                          <select className="field h-9 py-1" name="status" defaultValue={request.status}>
                            {statuses.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                          <button className="btn-secondary min-h-9 px-3 py-1" type="submit">
                            Guardar
                          </button>
                        </form>
                        <Link className="btn-primary min-h-9 px-3 py-1" href={`/admin/services/${request.id}`}>
                          Ver ticket
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
                {requests.length === 0 ? (
                  <tr>
                    <td className="px-5 py-8 text-center text-steel" colSpan={7}>
                      No hay servicios para los filtros seleccionados.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}

function AdminHeader() {
  return (
    <header className="border-b border-line bg-white">
      <div className="container-page flex min-h-16 items-center justify-between">
        <Link href="/" className="font-bold text-navy">
          ALLTOUR Admin
        </Link>
        <Link href="/portal/demo" className="btn-secondary">
          Portal demo
        </Link>
      </div>
    </header>
  );
}

async function getRequests(status?: string, date?: string): Promise<ServiceRequest[]> {
  if (!hasSupabaseConfig()) {
    return [];
  }

  const supabase = getSupabaseAdminClient();
  let query = supabase
    .from("service_requests")
    .select("*, companies(*), service_tickets(*)")
    .order("pickup_datetime", { ascending: true });

  if (status) {
    query = query.eq("status", status);
  }

  if (date) {
    query = query.gte("pickup_datetime", `${date}T00:00:00`).lt("pickup_datetime", `${date}T23:59:59`);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(error.message);
  }

  return (data || []) as ServiceRequest[];
}
