"use client";

import { Copy } from "lucide-react";

export function CopyButton({ text, label }: { text: string; label: string }) {
  return (
    <button
      className="btn-secondary"
      type="button"
      onClick={() => {
        void navigator.clipboard.writeText(text);
      }}
    >
      <Copy size={16} /> {label}
    </button>
  );
}
