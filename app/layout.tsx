import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://portal.alltourdmc.com"),
  title: "ALLTOUR | Movilidad y Transporte Corporativo",
  description:
    "Logistica de transporte corporativo en Ecuador: solicitudes, itinerarios, pasajeros, conductores, confirmaciones y rutas centralizadas.",
  icons: {
    icon: "/favicon.png"
  },
  openGraph: {
    title: "ALLTOUR | Movilidad y Transporte Corporativo",
    description:
      "Logistica de transporte corporativo en Ecuador con solicitudes, itinerarios, confirmaciones y rutas centralizadas.",
    url: "/",
    siteName: "ALLTOUR",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ALLTOUR Movilidad y Transporte Corporativo"
      }
    ],
    locale: "es_EC",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "ALLTOUR | Movilidad y Transporte Corporativo",
    description:
      "Logistica de transporte corporativo en Ecuador con solicitudes, itinerarios, confirmaciones y rutas centralizadas.",
    images: ["/og-image.png"]
  }
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
