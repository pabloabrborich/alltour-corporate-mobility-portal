import Link from "next/link";
import { BarChart3, CalendarCheck, CheckCircle2, Clock3, FileText, Users } from "lucide-react";
import { Footer } from "@/components/footer";
import { SiteHeader } from "@/components/site-header";
import { StatCard } from "@/components/stat-card";
import { StatusPill } from "@/components/status-pill";
import { demoHistory, demoRoutes, demoServices } from "@/lib/demo-data";

export default function PortalDemoPage() {
  return (
    <main>
      <SiteHeader />
      <section className="bg-navy py-10 text-white">
        <div className="container-page flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold text-gold">Portal corporativo demo</p>
            <h1 className="mt-2 text-4xl font-bold">Andes Pharma Mobility Desk</h1>
            <p className="mt-3 max-w-2xl text-slate-200">
              Vista de control para confirmar servicios, revisar historicos, rutas frecuentes y estado de facturacion.
            </p>
          </div>
          <Link href="/request" className="btn-primary">
            Crear solicitud real
          </Link>
        </div>
      </section>

      <section className="container-page py-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Proximos servicios" value="3" detail="Siguientes 7 dias" icon={CalendarCheck} />
          <StatCard label="Volumen mensual" value="58" detail="402 pasajeros" icon={BarChart3} />
          <StatCard label="Confirmaciones pendientes" value="1" detail="Manifiesto requerido" icon={Clock3} />
          <StatCard label="Servicios completados" value="214" detail="Ultimos 6 meses" icon={CheckCircle2} />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
          <div className="panel overflow-hidden">
            <div className="border-b border-line p-5">
              <h2 className="text-xl font-bold">Proximos servicios</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-steel">
                  <tr>
                    <th className="px-5 py-3">Codigo</th>
                    <th className="px-5 py-3">Fecha</th>
                    <th className="px-5 py-3">Ruta</th>
                    <th className="px-5 py-3">Pasajeros</th>
                    <th className="px-5 py-3">Estado</th>
                    <th className="px-5 py-3">Factura</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {demoServices.map((service) => (
                    <tr key={service.id}>
                      <td className="px-5 py-4 font-bold">{service.id}</td>
                      <td className="px-5 py-4">{service.date}</td>
                      <td className="px-5 py-4">{service.route}</td>
                      <td className="px-5 py-4">{service.passengers}</td>
                      <td className="px-5 py-4">
                        <StatusPill status={service.status} />
                      </td>
                      <td className="px-5 py-4">{service.invoice}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="panel p-5">
            <div className="flex items-center gap-3">
              <FileText className="text-ocean" />
              <h2 className="text-xl font-bold">Facturacion</h2>
            </div>
            <div className="mt-5 space-y-4 text-sm">
              <Line label="Pendiente de validar" value="$1,280.00" />
              <Line label="En factura mensual" value="$4,940.00" />
              <Line label="Pagado este mes" value="$7,320.00" />
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="panel p-5">
            <div className="flex items-center gap-3">
              <Users className="text-ocean" />
              <h2 className="text-xl font-bold">Historial de movimiento</h2>
            </div>
            <div className="mt-5 space-y-4">
              {demoHistory.map((item) => (
                <div key={item.month} className="grid grid-cols-4 gap-3 rounded-md border border-line p-3 text-sm">
                  <span className="font-bold">{item.month}</span>
                  <span>{item.services} servicios</span>
                  <span>{item.passengers} pasajeros</span>
                  <span>{item.punctuality} puntualidad</span>
                </div>
              ))}
            </div>
          </div>

          <div className="panel p-5">
            <div className="flex items-center gap-3">
              <BarChart3 className="text-ocean" />
              <h2 className="text-xl font-bold">Resumen de rutas</h2>
            </div>
            <div className="mt-5 space-y-4">
              {demoRoutes.map((item) => (
                <div key={item.route}>
                  <div className="mb-2 flex justify-between gap-3 text-sm">
                    <span className="font-semibold">{item.route}</span>
                    <span>{item.count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100">
                    <div className="h-2 rounded-full bg-ocean" style={{ width: `${Math.min(item.count * 2, 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-line pb-3">
      <span className="text-steel">{label}</span>
      <span className="font-bold">{value}</span>
    </div>
  );
}
