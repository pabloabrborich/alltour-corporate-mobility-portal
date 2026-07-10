"use client";

import Link from "next/link";
import { Copy, ExternalLink } from "lucide-react";
import { useMemo } from "react";

export function PortalLinkCard({ path }: { path: string | null }) {
  const url = useMemo(() => {
    if (!path || typeof window === "undefined") return null;
    return `${window.location.origin}${path}`;
  }, [path]);

  return (
    <div className="panel p-6">
      <h2 className="text-xl font-bold">Portal cliente</h2>
      {path ? (
        <>
          <p className="mt-2 text-sm text-steel">
            Link privado para que la empresa consulte sus servicios, rutas y estados.
          </p>
          <div className="mt-4 flex flex-col gap-3">
            <Link className="btn-secondary" href={path} target="_blank">
              Abrir portal <ExternalLink size={16} />
            </Link>
            <button
              className="btn-primary"
              type="button"
              onClick={() => {
                if (url) void navigator.clipboard.writeText(url);
              }}
            >
              Copiar link cliente <Copy size={16} />
            </button>
          </div>
        </>
      ) : (
        <p className="mt-2 text-sm text-steel">
          Esta empresa todavia no tiene portal activo. Las nuevas empresas lo reciben automaticamente.
        </p>
      )}
    </div>
  );
}
