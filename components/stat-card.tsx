import type { LucideIcon } from "lucide-react";

type StatCardProps = {
  label: string;
  value: string | number;
  detail?: string;
  icon: LucideIcon;
};

export function StatCard({ label, value, detail, icon: Icon }: StatCardProps) {
  return (
    <div className="panel p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-steel">{label}</p>
          <p className="mt-2 text-3xl font-bold text-ink">{value}</p>
          {detail ? <p className="mt-2 text-sm text-steel">{detail}</p> : null}
        </div>
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-ocean/10 text-ocean">
          <Icon size={20} />
        </span>
      </div>
    </div>
  );
}
