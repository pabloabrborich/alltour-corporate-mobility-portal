import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { updateLeadRequestStatus } from "@/app/actions";
import { requireAdmin } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";
import { getSupabaseAdminClient, hasSupabaseConfig } from "@/lib/supabase";
import type { LeadRequest } from "@/lib/types";
import { createWhatsappUrl } from "@/lib/whatsapp";

const statuses = ["nuevo", "contactado", "cotizado", "confirmado", "cerrado", "cancelado"];

export const dynamic = "force-dynamic";

export default async function AdminLeadsPage() {
  await requireAdmin();
  const leads = await getLeadRequests();

  return (
    <main className="min-h-screen bg-mist">
      <header className="border-b border-line bg-white">
        <div className="container-page flex min-h-16 items-center justify-between gap-3">
          <div>
            <Link href="/admin" className="text-sm font-bold text-navy">
              ALLTOUR Admin
            </Link>
            <p className="text-xs text-steel">Leads de destinos y aereos</p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin/transport" className="btn-secondary">
              Inbox reservas
            </Link>
            <Link href="/admin" className="btn-secondary">
              Agenda
            </Link>
          </div>
        </div>
      </header>

      <section className="container-page py-8">
        <div className="panel overflow-hidden">
          <div className="border-b border-line p-5">
            <h1 className="text-2xl font-bold">Inbox de leads</h1>
            <p className="mt-1 text-sm text-steel">Solicitudes simples para contacto comercial y cotizacion manual.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1120px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-steel">
                <tr>
                  <th className="px-5 py-3">Referencia</th>
                  <th className="px-5 py-3">Fecha</th>
                  <th className="px-5 py-3">Tipo</th>
                  <th className="px-5 py-3">Solicitud</th>
                  <th className="px-5 py-3">Cliente</th>
                  <th className="px-5 py-3">Contacto</th>
                  <th className="px-5 py-3">Estado</th>
                  <th className="px-5 py-3">Accion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {leads.map((lead) => {
                  const whatsappUrl = createWhatsappUrl(lead.customer_phone, buildLeadMessage(lead));

                  return (
                    <tr key={lead.id} className="bg-white align-top">
                      <td className="px-5 py-4 font-bold">{lead.reference}</td>
                      <td className="px-5 py-4">{formatDateTime(lead.created_at)}</td>
                      <td className="px-5 py-4 capitalize">{lead.lead_type === "destination" ? "Destino" : "Aereos"}</td>
                      <td className="px-5 py-4">
                        <LeadSummary lead={lead} />
                        {lead.customer_notes ? <div className="mt-1 text-xs text-steel">Notas: {lead.customer_notes}</div> : null}
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-semibold">{lead.customer_name}</div>
                        {lead.customer_email ? <div className="text-xs text-steel">{lead.customer_email}</div> : null}
                      </td>
                      <td className="px-5 py-4">{lead.customer_phone}</td>
                      <td className="px-5 py-4">
                        <form action={updateLeadRequestStatus} className="flex gap-2">
                          <input type="hidden" name="id" value={lead.id} />
                          <select className="field h-9 py-1" name="status" defaultValue={lead.status}>
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
                      </td>
                      <td className="px-5 py-4">
                        {whatsappUrl ? (
                          <a className="btn-primary min-h-9 px-3 py-1" href={whatsappUrl} target="_blank" rel="noreferrer">
                            <MessageCircle size={16} /> WhatsApp
                          </a>
                        ) : (
                          <span className="text-xs text-steel">Telefono invalido</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {leads.length === 0 ? (
                  <tr>
                    <td className="px-5 py-8 text-center text-steel" colSpan={8}>
                      No hay leads todavia.
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

async function getLeadRequests(): Promise<LeadRequest[]> {
  if (!hasSupabaseConfig()) {
    return [];
  }

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("lead_requests")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    throw new Error(error.message);
  }

  return (data || []) as LeadRequest[];
}

function LeadSummary({ lead }: { lead: LeadRequest }) {
  if (lead.lead_type === "destination") {
    return (
      <div>
        <div className="font-semibold">{lead.destination || "Destino por definir"}</div>
        <div className="text-xs text-steel">
          {lead.nights || "-"} noches - {lead.adults || "-"} adultos - {lead.children || 0} ninos - {lead.tentative_date || "fecha por definir"}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="font-semibold">
        {lead.flight_from || "Origen"} {"->"} {lead.flight_to || "Destino"}
      </div>
      <div className="text-xs text-steel">
        Salida {lead.departure_date || "por definir"} - Retorno {lead.return_date || "por definir"} - {lead.passengers || "-"} pax - {lead.cabin_class || "cabina por definir"}
      </div>
    </div>
  );
}

function buildLeadMessage(lead: LeadRequest) {
  if (lead.lead_type === "destination") {
    return `Hola ${lead.customer_name}, gracias por contactar a ALLTOUR.

Recibimos tu solicitud ${lead.reference}:
Destino: ${lead.destination || "por definir"}
Noches: ${lead.nights || "por definir"}
Adultos: ${lead.adults || "por definir"}
Ninos: ${lead.children || 0}
Fecha tentativa: ${lead.tentative_date || "por definir"}

Te contactamos para revisar opciones y disenar la propuesta.`;
  }

  return `Hola ${lead.customer_name}, gracias por contactar a ALLTOUR.

Recibimos tu solicitud ${lead.reference}:
Ruta aerea: ${lead.flight_from || "origen"} -> ${lead.flight_to || "destino"}
Salida: ${lead.departure_date || "por definir"}
Retorno: ${lead.return_date || "por definir"}
Pasajeros: ${lead.passengers || "por definir"}
Cabina: ${lead.cabin_class || "por definir"}

Te contactamos para revisar disponibilidad y opciones.`;
}
