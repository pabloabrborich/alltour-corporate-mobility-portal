import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ALLTOUR Corporate Mobility Portal",
  description:
    "Portal de logistica de transporte corporativo para traslados, eventos y movilidad empresarial en Ecuador."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
