export const demoServices = [
  {
    id: "SV-1048",
    company: "Cliente corporativo",
    date: "2026-07-13 07:40",
    route: "UIO Aeropuerto Mariscal Sucre -> Swissotel Quito",
    passengers: 4,
    status: "Confirmado",
    closeout: "Por validar"
  },
  {
    id: "SV-1051",
    company: "Delegacion corporativa",
    date: "2026-07-14 18:20",
    route: "Hotel corporativo -> Centro de Convenciones",
    passengers: 18,
    status: "Vehiculo asignado",
    closeout: "En operacion"
  },
  {
    id: "SV-1057",
    company: "Cliente institucional",
    date: "2026-07-16 05:30",
    route: "Hotel ejecutivo -> UIO Aeropuerto",
    passengers: 7,
    status: "Pendiente de manifiesto",
    closeout: "Pendiente"
  }
];

export const demoHistory = [
  { month: "Marzo", services: 42, passengers: 286, punctuality: "98%" },
  { month: "Abril", services: 51, passengers: 344, punctuality: "97%" },
  { month: "Mayo", services: 47, passengers: 319, punctuality: "99%" },
  { month: "Junio", services: 58, passengers: 402, punctuality: "98%" }
];

export const demoRoutes = [
  { route: "Aeropuerto UIO -> Hoteles Quito", count: 34 },
  { route: "Hoteles -> Centro de Convenciones", count: 28 },
  { route: "Quito -> Cayambe / Tabacundo", count: 12 },
  { route: "Guayaquil aeropuerto -> Samborondon", count: 9 }
];
