import Link from "next/link";
import { notFound } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { getSupabaseAdminClient, hasSupabaseConfig } from "@/lib/supabase";
import type { TransportRequest } from "@/lib/types";
import { createWhatsappUrl } from "@/lib/whatsapp";

type VoucherRequest = TransportRequest & {
  companies?: {
    name: string;
    brand_name: string | null;
    contact_name: string | null;
    phone: string | null;
  } | null;
};

export const dynamic = "force-dynamic";

export default async function VoucherPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const request = await getVoucher(token);

  if (!request) {
    notFound();
  }

  const voucherUrl = `https://portal.alltourdmc.com/voucher/${token}`;
  const whatsappUrl = createWhatsappUrl(
    request.customer_phone,
    `Hola ${request.passenger_name || request.customer_name}, este es tu voucher de servicio ALLTOUR: ${voucherUrl}`
  );

  return (
    <main className="min-h-screen bg-[#f3f0ea] px-4 py-6 text-[#111] print:bg-white print:px-0 print:py-0">
      <section className="mx-auto max-w-4xl border border-[#1f2933] bg-white shadow-sm print:border-0 print:shadow-none">
        <header className="grid grid-cols-[1fr_auto] border-b border-[#1f2933]">
          <div className="p-5">
            <p className="font-mono text-xs uppercase tracking-[0.18em]">ALLTOUR ECUADOR</p>
            <h1 className="mt-2 font-mono text-2xl font-bold uppercase tracking-[0.08em]">Service Voucher</h1>
            <p className="mt-1 font-mono text-xs uppercase tracking-[0.12em] text-[#4b5563]">
              Ground Transportation / Operational Confirmation
            </p>
          </div>
          <div className="border-l border-[#1f2933] p-5 text-right font-mono">
            <div className="text-xs uppercase text-[#4b5563]">Reference</div>
            <div className="text-xl font-bold">{request.reference}</div>
            <div className="mt-2 text-xs uppercase text-[#4b5563]">Status</div>
            <div className="font-bold uppercase">{request.status}</div>
          </div>
        </header>

        <div className="grid border-b border-[#1f2933] md:grid-cols-3">
          <VoucherCell label="Account" value={request.companies?.brand_name || request.companies?.name || "ALLTOUR CLIENT"} />
          <VoucherCell label="Passenger" value={request.passenger_name || request.customer_name} />
          <VoucherCell label="VIP / Security" value={`${request.is_vip ? "VIP YES" : "VIP NO"} / ${securityLabel(request.security_level)}`} />
        </div>

        <div className="grid border-b border-[#1f2933] md:grid-cols-4">
          <VoucherCell label="Service Date" value={request.service_date || request.scheduled_date || "TBC"} />
          <VoucherCell label="Service Time" value={request.service_time || request.scheduled_time || "TBC"} />
          <VoucherCell label="Passengers" value={String(request.passengers)} />
          <VoucherCell label="Flight" value={request.flight_number || "N/A"} />
        </div>

        <div className="grid border-b border-[#1f2933] md:grid-cols-2">
          <VoucherCell label="Pickup" value={request.pickup} large />
          <VoucherCell label="Dropoff" value={request.destination} large />
        </div>

        {request.stops?.length ? (
          <div className="border-b border-[#1f2933] p-5">
            <div className="font-mono text-xs uppercase tracking-[0.14em] text-[#4b5563]">Stops</div>
            <ol className="mt-2 list-decimal space-y-1 pl-5 font-mono text-sm">
              {request.stops.map((stop, index) => (
                <li key={`${stop.place}-${index}`}>{stop.place}</li>
              ))}
            </ol>
          </div>
        ) : null}

        <div className="grid border-b border-[#1f2933] md:grid-cols-4">
          <VoucherCell label="Vehicle Class" value={request.assigned_vehicle || request.selected_vehicle} />
          <VoucherCell label="Plate" value={request.vehicle_plate || "TBC"} />
          <VoucherCell label="Driver" value={request.driver_name || "TBC"} />
          <VoucherCell label="Driver Phone" value={request.driver_phone || "TBC"} />
        </div>

        <div className="grid border-b border-[#1f2933] md:grid-cols-2">
          <VoucherCell label="Security Protocol" value={securityLabel(request.security_level)} large />
          <VoucherCell label="Operational Notes" value={request.operational_notes || request.customer_notes || "No additional notes registered."} large />
        </div>

        <footer className="grid gap-4 p-5 md:grid-cols-[1fr_auto] md:items-center">
          <div className="font-mono text-xs leading-5 text-[#4b5563]">
            This voucher confirms the service details registered by ALLTOUR. Final operational adjustments may be coordinated by the ALLTOUR operations team.
          </div>
          <div className="flex flex-wrap gap-2 print:hidden">
            {whatsappUrl ? (
              <a className="inline-flex min-h-10 items-center justify-center gap-2 rounded border border-[#1f2933] px-4 py-2 font-mono text-xs font-bold uppercase" href={whatsappUrl} target="_blank" rel="noreferrer">
                <MessageCircle size={16} /> Share
              </a>
            ) : null}
            <Link className="inline-flex min-h-10 items-center justify-center rounded border border-[#1f2933] px-4 py-2 font-mono text-xs font-bold uppercase" href="/booking">
              ALLTOUR
            </Link>
          </div>
        </footer>
      </section>
    </main>
  );
}

async function getVoucher(token: string): Promise<VoucherRequest | null> {
  if (!hasSupabaseConfig()) {
    return null;
  }

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("transport_requests")
    .select("*, companies(name, brand_name, contact_name, phone)")
    .eq("voucher_token", token)
    .single();

  if (error) {
    return null;
  }

  return data as VoucherRequest;
}

function VoucherCell({ label, value, large = false }: { label: string; value: string; large?: boolean }) {
  return (
    <div className="border-b border-[#1f2933] p-4 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0">
      <div className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#4b5563]">{label}</div>
      <div className={`mt-2 font-mono font-bold uppercase ${large ? "text-base leading-6" : "text-sm"}`}>{value}</div>
    </div>
  );
}

function securityLabel(value?: string | null) {
  const labels: Record<string, string> = {
    standard: "Standard service",
    vip_protocol: "VIP protocol",
    security_agent: "Security agent available",
    armed_security: "Armed security available",
    escort_vehicle: "Escort vehicle / convoy available"
  };

  return labels[value || "standard"] || labels.standard;
}
