import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CalendarCheck,
  CheckCircle2,
  ClipboardList,
  Route,
  ShieldCheck,
  Users
} from "lucide-react";
import { Footer } from "@/components/footer";
import { SiteHeader } from "@/components/site-header";

const problems = [
  "Coordinacion dispersa por WhatsApp",
  "Recogidas tardias sin trazabilidad",
  "Conductores o placas poco claras",
  "Listas de pasajeros incompletas",
  "Reportes manuales al cierre del servicio"
];

const solutions = [
  "Agenda operativa centralizada",
  "Listas de pasajeros por servicio",
  "Tickets con estado y confirmaciones",
  "Asignacion de vehiculo y conductor",
  "Soporte y reporte corporativo"
];

const services = [
  "Traslados aeropuerto",
  "Autos ejecutivos",
  "Vans y buses",
  "Rutas de personal",
  "Hoteles y venues",
  "Eventos corporativos",
  "Transporte interciudad",
  "Extensiones turisticas"
];

const industries = [
  "Farmaceuticas",
  "Congresos medicos",
  "Embajadas",
  "ONGs",
  "Universidades",
  "Construccion",
  "Mineria y energia",
  "Delegaciones internacionales"
];

export default function HomePage() {
  return (
    <main>
      <SiteHeader />
      <section className="bg-navy text-white">
        <div className="container-page grid min-h-[620px] gap-10 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <p className="mb-5 inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm text-slate-200">
              Operaciones corporativas en Ecuador
            </p>
            <h1 className="font-display max-w-3xl text-4xl font-medium leading-tight sm:text-5xl lg:text-6xl">
              Logistica de transporte corporativo en Ecuador
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200">
              Traslados aeropuerto, movilidad ejecutiva, vans, buses, rutas de personal, eventos y delegaciones
              internacionales gestionados desde una mesa operativa centralizada.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/request" className="btn-primary">
                Solicitar transporte corporativo <ArrowRight size={17} />
              </Link>
              <Link href="/portal" className="inline-flex min-h-11 items-center justify-center rounded-md border border-white/25 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10">
                Ver portal corporativo
              </Link>
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
            <div className="rounded-md bg-white p-5 text-ink">
              <div className="flex items-center justify-between border-b border-line pb-4">
                <div>
                  <p className="text-sm font-semibold text-steel">Agenda operativa</p>
                  <p className="text-2xl font-bold">12 servicios activos</p>
                </div>
                <CalendarCheck className="text-ocean" />
              </div>
              <div className="mt-5 space-y-3">
                {[
                  ["07:40", "UIO -> Swissotel", "Confirmado"],
                  ["12:15", "JW Marriott -> Centro de Convenciones", "Vehiculo asignado"],
                  ["18:20", "Hotel Oro Verde -> GYE", "Nueva solicitud"]
                ].map(([time, route, status]) => (
                  <div key={route} className="grid grid-cols-[64px_1fr] gap-3 rounded-md border border-line p-3">
                    <span className="font-bold text-navy">{time}</span>
                    <span>
                      <span className="block text-sm font-semibold">{route}</span>
                      <span className="text-xs text-steel">{status}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="container-page grid gap-8 lg:grid-cols-2">
          <InfoBlock title="Problemas que frenan la operacion" items={problems} icon={ClipboardList} />
          <InfoBlock title="La solucion ALLTOUR" items={solutions} icon={ShieldCheck} />
        </div>
      </section>

      <section className="py-16">
        <div className="container-page">
          <SectionTitle
            eyebrow="Servicios"
            title="Movilidad corporativa para traslados simples y operaciones complejas"
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((service) => (
              <div key={service} className="panel p-5">
                <Route className="mb-4 text-ocean" size={22} />
                <p className="font-semibold">{service}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="container-page grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <SectionTitle eyebrow="Industrias" title="Disenado para compradores exigentes de transporte" />
          <div className="grid gap-3 sm:grid-cols-2">
            {industries.map((industry) => (
              <div key={industry} className="flex items-center gap-3 rounded-md border border-line p-4">
                <Building2 size={18} className="text-gold" />
                <span className="font-semibold">{industry}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container-page">
          <SectionTitle eyebrow="Proceso" title="De la solicitud al reporte, con control visible" />
          <div className="mt-8 grid gap-4 md:grid-cols-3 lg:grid-cols-6">
            {["Solicitar", "Revisar", "Confirmar", "Asignar vehiculo", "Operar", "Reportar"].map((step, index) => (
              <div key={step} className="panel p-5">
                <span className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-ocean text-sm font-bold text-white">
                  {index + 1}
                </span>
                <p className="font-semibold">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-navy py-16 text-white">
        <div className="container-page grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-sm font-semibold text-gold">Mesa operativa ALLTOUR</p>
            <h2 className="mt-2 text-3xl font-bold">Active una solicitud corporativa hoy</h2>
            <p className="mt-3 max-w-2xl text-slate-200">
              Recibimos los datos clave, revisamos disponibilidad y devolvemos una confirmacion operativa clara.
            </p>
          </div>
          <Link href="/request" className="btn-primary">
            Abrir formulario <ArrowRight size={17} />
          </Link>
        </div>
      </section>
      <Footer />
    </main>
  );
}

function InfoBlock({
  title,
  items,
  icon: Icon
}: {
  title: string;
  items: string[];
  icon: typeof Users;
}) {
  return (
    <div className="panel p-6">
      <Icon className="mb-5 text-ocean" size={26} />
      <h2 className="font-display text-3xl font-medium">{title}</h2>
      <div className="mt-5 space-y-3">
        {items.map((item) => (
          <p key={item} className="flex gap-3 text-steel">
            <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-sage" />
            <span>{item}</span>
          </p>
        ))}
      </div>
    </div>
  );
}

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <p className="text-sm font-bold uppercase tracking-wider text-gold">{eyebrow}</p>
      <h2 className="font-display mt-2 max-w-3xl text-4xl font-medium text-ink">{title}</h2>
    </div>
  );
}
