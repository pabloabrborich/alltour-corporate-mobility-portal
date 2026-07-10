import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="border-b border-white/10 bg-navy text-white">
      <div className="container-page flex min-h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-md border border-white/20 bg-white">
            <Image src="/alltour-logo.png" alt="ALLTOUR" width={36} height={36} className="h-full w-full object-cover" />
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
