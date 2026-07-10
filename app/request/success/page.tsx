import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Footer } from "@/components/footer";
import { SiteHeader } from "@/components/site-header";

export default async function RequestSuccessPage({
  searchParams
}: {
  searchParams: Promise<{ id?: string; demo?: string }>;
}) {
  const params = await searchParams;

  return (
    <main>
      <SiteHeader />
      <section className="py-20">
        <div className="container-page">
          <div className="panel mx-auto max-w-2xl p-8 text-center">
            <CheckCircle2 className="mx-auto text-emerald-600" size={44} />
            <h1 className="mt-5 text-3xl font-bold">Su solicitud fue recibida</h1>
            <p className="mt-4 text-steel">
              ALLTOUR revisara disponibilidad y confirmara la operacion antes de asignar vehiculo y conductor.
            </p>
            {params.id ? <p className="mt-4 text-sm text-steel">Referencia: {params.id}</p> : null}
            {params.demo ? (
              <p className="mt-4 rounded-md bg-amber-50 p-3 text-sm text-amber-800">
                Solicitud recibida en modo local. Configure Supabase para guardar solicitudes reales.
              </p>
            ) : null}
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/" className="btn-secondary">
                Volver al inicio
              </Link>
              <Link href="/portal" className="btn-primary">
                Ver portal corporativo
              </Link>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
