import Link from "next/link";
import { FileText, MessageCircle } from "lucide-react";
import { updateTransportRequestOperations, updateTransportRequestStatus } from "@/app/actions";
import { requireAdmin } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";
import { getSupabaseAdminClient, hasSupabaseConfig } from "@/lib/supabase";
import type { Company, TransportRequest } from "@/lib/types";
import { createWhatsappUrl } from "@/lib/whatsapp";

const statuses = ["nuevo", "contactado", "cotizado", "confirmado", "cerrado", "cancelado"];

export const dynamic = "force-dynamic";

export default async function AdminTransportPage({
  searchParams
}: {
  searchParams: Promise<{ updated?: string }>;
}) {
  await requireAdmin();
  const { updated } = await searchParams;
  const requests = await getTransportRequests();
  const companies = await getCompanies();

  return (
    <main className="min-h-screen bg-mist">
      <header className="border-b border-line bg-white">
        <div className="container-page flex min-h-16 items-center justify-between gap-3">
          <div>
            <Link href="/admin" className="text-sm font-bold text-navy">
              ALLTOUR Admin
            </Link>
            <p className="text-xs text-steel">Solicitudes nuevas del portal de reservas</p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin/leads" className="btn-secondary">
              Inbox leads
            </Link>
            <Link href="/booking" className="btn-secondary">
              Ver booking
            </Link>
            <Link href="/admin" className="btn-secondary">
              Agenda
            </Link>
          </div>
        </div>
      </header>

      <section className="container-page py-8">
        {updated ? (
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-semibold text-emerald-900">
            {updated === "operation" ? "Operacion guardada correctamente." : "Estado actualizado correctamente."}
          </div>
        ) : null}
        <div className="panel overflow-hidden">
          <div className="border-b border-line p-5">
            <h1 className="text-2xl font-bold">Inbox de reservas</h1>
            <p className="mt-1 text-sm text-steel">Solicitudes de clientes para cotizar, contactar y confirmar manualmente.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1480px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-steel">
                <tr>
                  <th className="px-5 py-3">Referencia</th>
                  <th className="px-5 py-3">Fecha</th>
                  <th className="px-5 py-3">Ciudad</th>
                  <th className="px-5 py-3">Ruta</th>
                  <th className="px-5 py-3">Pax</th>
                  <th className="px-5 py-3">Vehiculo</th>
                  <th className="px-5 py-3">Precio</th>
                  <th className="px-5 py-3">Cliente</th>
                  <th className="px-5 py-3">Contacto</th>
                  <th className="px-5 py-3">Estado</th>
                  <th className="px-5 py-3">Operacion</th>
                  <th className="px-5 py-3">Accion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {requests.map((request) => {
                  const whatsappUrl = createWhatsappUrl(request.customer_phone, buildCustomerMessage(request));
                  const voucherPath = request.voucher_token ? `/voucher/${request.voucher_token}` : null;
                  const voucherUrl = voucherPath ? `https://portal.alltourdmc.com${voucherPath}` : null;
                  const voucherWhatsappUrl = createWhatsappUrl(
                    request.customer_phone,
                    voucherUrl
                      ? `Hola ${request.passenger_name || request.customer_name}, compartimos tu voucher de servicio ALLTOUR: ${voucherUrl}`
                      : ""
                  );

                  return (
                    <tr key={request.id} className="bg-white align-top">
                      <td className="px-5 py-4 font-bold">{request.reference}</td>
                      <td className="px-5 py-4">{formatDateTime(request.created_at)}</td>
                      <td className="px-5 py-4 capitalize">{request.city}</td>
                      <td className="px-5 py-4">
                        <div className="font-semibold">
                          <LocationValue value={request.pickup} /> {"->"} <LocationValue value={request.destination} />
                        </div>
                        {request.stops?.length ? (
                          <div className="mt-1 space-y-1 text-xs text-steel">
                            {request.stops.map((stop, index) => (
                              <div key={`${stop.place}-${index}`}>
                                Parada {index + 1}: <LocationValue value={stop.place} />
                              </div>
                            ))}
                          </div>
                        ) : null}
                        {request.customer_notes ? <div className="mt-1 text-xs text-steel">Notas: {request.customer_notes}</div> : null}
                      </td>
                      <td className="px-5 py-4">{request.passengers}</td>
                      <td className="px-5 py-4">{request.selected_vehicle}</td>
                      <td className="px-5 py-4">
                        <div className="font-bold">{request.price_shown}</div>
                        <div className="text-xs text-steel">{request.price_status}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-semibold">{request.customer_name}</div>
                        {request.companies?.name ? <div className="text-xs text-ocean">{request.companies.name}</div> : null}
                        {request.customer_email ? <div className="text-xs text-steel">{request.customer_email}</div> : null}
                      </td>
                      <td className="px-5 py-4">{request.customer_phone}</td>
                      <td className="px-5 py-4">
                        <form action={updateTransportRequestStatus} className="flex gap-2">
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
                      </td>
                      <td className="px-5 py-4">
                        <form action={updateTransportRequestOperations} className="grid min-w-[320px] gap-3 rounded-xl border border-line bg-slate-50 p-3">
                          <input type="hidden" name="id" value={request.id} />
                          <label>
                            <span className="text-xs font-semibold text-steel">Empresa</span>
                            <select className="field h-9 py-1" name="company_id" defaultValue={request.company_id || "none"}>
                              <option value="none">Sin empresa</option>
                              {companies.map((company) => (
                                <option key={company.id} value={company.id}>
                                  {company.brand_name || company.name}
                                </option>
                              ))}
                            </select>
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            <label>
                              <span className="text-xs font-semibold text-steel">Pasajero</span>
                              <input className="field h-9 py-1" name="passenger_name" defaultValue={request.passenger_name || ""} placeholder="Sandra - NASA" />
                            </label>
                            <label className="flex items-end gap-2 pb-2 text-xs font-semibold text-navy">
                              <input name="is_vip" type="checkbox" defaultChecked={Boolean(request.is_vip)} />
                              VIP
                            </label>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <label>
                              <span className="text-xs font-semibold text-steel">Fecha</span>
                              <input className="field h-9 py-1" name="service_date" type="date" defaultValue={request.service_date || request.scheduled_date || ""} />
                            </label>
                            <label>
                              <span className="text-xs font-semibold text-steel">Hora</span>
                              <input className="field h-9 py-1" name="service_time" type="time" defaultValue={request.service_time || request.scheduled_time || ""} />
                            </label>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <label>
                              <span className="text-xs font-semibold text-steel">Vehiculo asignado</span>
                              <input className="field h-9 py-1" name="assigned_vehicle" defaultValue={request.assigned_vehicle || request.selected_vehicle || ""} />
                            </label>
                            <label>
                              <span className="text-xs font-semibold text-steel">Placa</span>
                              <input className="field h-9 py-1" name="vehicle_plate" defaultValue={request.vehicle_plate || ""} />
                            </label>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <label>
                              <span className="text-xs font-semibold text-steel">Conductor</span>
                              <input className="field h-9 py-1" name="driver_name" defaultValue={request.driver_name || ""} />
                            </label>
                            <label>
                              <span className="text-xs font-semibold text-steel">Telefono conductor</span>
                              <input className="field h-9 py-1" name="driver_phone" defaultValue={request.driver_phone || ""} />
                            </label>
                          </div>
                          <label>
                            <span className="text-xs font-semibold text-steel">Seguridad / custodia</span>
                            <select className="field h-9 py-1" name="security_level" defaultValue={request.security_level || "standard"}>
                              <option value="standard">Servicio estandar</option>
                              <option value="vip_protocol">Protocolo VIP</option>
                              <option value="security_agent">Agente de seguridad</option>
                              <option value="armed_security">Agente armado</option>
                              <option value="escort_vehicle">Vehiculo custodio / caravana</option>
                            </select>
                          </label>
                          <label>
                            <span className="text-xs font-semibold text-steel">Notas operativas</span>
                            <textarea className="field min-h-16 py-2" name="operational_notes" defaultValue={request.operational_notes || ""} placeholder="Letrero, punto exacto, protocolo, contacto in situ" />
                          </label>
                          <button className="btn-secondary min-h-9 px-3 py-1" type="submit">
                            Guardar operacion
                          </button>
                        </form>
                      </td>
                      <td className="space-y-2 px-5 py-4">
                        {whatsappUrl ? (
                          <a className="btn-primary min-h-9 px-3 py-1" href={whatsappUrl} target="_blank" rel="noreferrer">
                            <MessageCircle size={16} /> WhatsApp
                          </a>
                        ) : (
                          <span className="text-xs text-steel">Telefono invalido</span>
                        )}
                        {voucherPath ? (
                          <>
                            <Link className="btn-secondary min-h-9 px-3 py-1" href={voucherPath} target="_blank">
                              <FileText size={16} /> Voucher
                            </Link>
                            {voucherWhatsappUrl ? (
                              <a className="btn-secondary min-h-9 px-3 py-1" href={voucherWhatsappUrl} target="_blank" rel="noreferrer">
                                Compartir voucher
                              </a>
                            ) : null}
                          </>
                        ) : null}
                      </td>
                    </tr>
                  );
                })}
                {requests.length === 0 ? (
                  <tr>
                    <td className="px-5 py-8 text-center text-steel" colSpan={12}>
                      No hay solicitudes de reservas todavia.
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

async function getTransportRequests(): Promise<TransportRequest[]> {
  if (!hasSupabaseConfig()) {
    return [];
  }

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("transport_requests")
    .select("*, companies(id, name, brand_name, contact_name, phone, email, portal_access_token, portal_access_code, portal_enabled, created_at)")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    throw new Error(error.message);
  }

  return (data || []) as TransportRequest[];
}

async function getCompanies(): Promise<Company[]> {
  if (!hasSupabaseConfig()) {
    return [];
  }

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("companies")
    .select("id, name, brand_name, contact_name, phone, email, portal_access_token, portal_access_code, portal_enabled, created_at")
    .eq("portal_enabled", true)
    .order("name", { ascending: true });

  if (error) {
    return [];
  }

  return (data || []) as Company[];
}

function buildCustomerMessage(request: TransportRequest) {
  return `Hola ${request.customer_name}, gracias por contactar a ALLTOUR.

Recibimos tu solicitud ${request.reference}:
Ciudad: ${request.city}
Ruta: ${request.pickup} -> ${request.destination}
Pasajeros: ${request.passengers}
Vehiculo: ${request.selected_vehicle}
Precio/estado: ${request.price_shown} - ${request.price_status}

Te ayudamos a confirmar disponibilidad y detalles del servicio.`;
}

function LocationValue({ value }: { value: string }) {
  if (isMapUrl(value)) {
    return (
      <a className="font-semibold text-ocean underline underline-offset-2" href={value} target="_blank" rel="noreferrer">
        Abrir mapa
      </a>
    );
  }

  return <span>{value}</span>;
}

function isMapUrl(value: string) {
  return /^https?:\/\//i.test(value.trim());
}
