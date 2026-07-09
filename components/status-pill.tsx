import { clsx } from "clsx";

const styles: Record<string, string> = {
  "Nueva solicitud": "border-blue-200 bg-blue-50 text-blue-700",
  Confirmado: "border-emerald-200 bg-emerald-50 text-emerald-700",
  "Vehiculo asignado": "border-amber-200 bg-amber-50 text-amber-700",
  "En operacion": "border-purple-200 bg-purple-50 text-purple-700",
  Completado: "border-slate-200 bg-slate-50 text-slate-700",
  Cancelado: "border-red-200 bg-red-50 text-red-700"
};

export function StatusPill({ status }: { status?: string | null }) {
  const value = status || "Pendiente";

  return <span className={clsx("status-pill", styles[value] || "border-line bg-mist text-steel")}>{value}</span>;
}
