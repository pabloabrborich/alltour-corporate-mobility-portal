import { clsx } from "clsx";

const styles: Record<string, string> = {
  "Nueva solicitud": "border-gold/40 bg-gold/10 text-amber-800",
  Confirmado: "border-sage/40 bg-sage/10 text-green-800",
  "Vehiculo asignado": "border-ocean/40 bg-ocean/10 text-ocean",
  "En operacion": "border-ocean/40 bg-ocean/10 text-ocean",
  Completado: "border-slate-300 bg-slate-100 text-slate-700",
  Cancelado: "border-red-300 bg-red-50 text-red-700"
};

export function StatusPill({ status }: { status?: string | null }) {
  const value = status || "Pendiente";

  return <span className={clsx("status-pill", styles[value] || "border-line bg-mist text-steel")}>{value}</span>;
}
