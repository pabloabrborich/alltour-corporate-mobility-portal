import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="border-b border-white/10 bg-navy text-white">
      <div className="container-page flex min-h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-md border border-white/20 bg-white/10">
            <ShieldCheck size={20} />
          </span>
          <span>
            <span className="block text-sm font-bold tracking-wide">ALLTOUR</span>
            <span className="block text-xs text-slate-300">Movilidad y Transporte Corporativo</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-slate-200 md:flex">
          <Link href="/request" className="hover:text-white">
            Solicitud
          </Link>
          <Link href="/portal" className="hover:text-white">
            Portal corporativo
          </Link>
          <Link href="/admin" className="hover:text-white">
            Admin
          </Link>
        </nav>
        <Link href="/request" className="btn-primary">
          Solicitar <ArrowRight size={16} />
        </Link>
      </div>
    </header>
  );
}
