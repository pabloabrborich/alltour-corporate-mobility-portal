export const cityOptions = [
  { value: "quito", label: "Quito" },
  { value: "guayaquil", label: "Guayaquil" },
  { value: "cuenca", label: "Cuenca" },
  { value: "manta", label: "Manta" },
  { value: "galapagos", label: "Galapagos / Santa Cruz" },
  { value: "other", label: "Otra ciudad o destino" }
];

export const cityLocations: Record<string, string[]> = {
  quito: [
    "Aeropuerto Internacional Mariscal Sucre",
    "Quito Centro Norte / La Carolina",
    "Swissotel Quito",
    "JW Marriott Quito",
    "Centro de Convenciones Quito",
    "Quito Centro Historico",
    "Cumbaya",
    "Valle de los Chillos",
    "Mitad del Mundo",
    "Otavalo",
    "Parque Nacional Cotopaxi"
  ],
  guayaquil: [
    "Aeropuerto de Guayaquil",
    "Hotel Oro Verde Guayaquil",
    "Hilton Colon Guayaquil",
    "Puerto Santa Ana",
    "Centro de Convenciones Guayaquil",
    "Samborondon",
    "Duran",
    "Salinas"
  ],
  cuenca: [
    "Aeropuerto Mariscal La Mar",
    "Centro Historico de Cuenca",
    "Hotel Oro Verde Cuenca",
    "Parque Calderon",
    "Turi",
    "Gualaceo",
    "Chordeleg"
  ],
  manta: [
    "Aeropuerto Eloy Alfaro Manta",
    "Hotel Oro Verde Manta",
    "Puerto de Manta",
    "Ciudad del Sol Manta",
    "Montecristi",
    "Portoviejo"
  ],
  galapagos: [
    "Aeropuerto Seymour Baltra",
    "Canal de Itabaca",
    "Puerto Ayora",
    "Hotel en Santa Cruz",
    "Muelle de Puerto Ayora",
    "Tortuga Bay"
  ]
};

export const cityDefaults: Record<string, [string, string]> = {
  quito: ["Aeropuerto Internacional Mariscal Sucre", "Swissotel Quito"],
  guayaquil: ["Aeropuerto de Guayaquil", "Hotel Oro Verde Guayaquil"],
  cuenca: ["Aeropuerto Mariscal La Mar", "Centro Historico de Cuenca"],
  manta: ["Aeropuerto Eloy Alfaro Manta", "Hotel Oro Verde Manta"],
  galapagos: ["Aeropuerto Seymour Baltra", "Puerto Ayora"]
};

export const vehicleTypes = [
  { code: "EJECUTIVO", label: "Sedan o SUV premium", pax: 3, luggage: "2 maletas medianas", base: 48 },
  { code: "VAN EJECUTIVA", label: "Transporte comodo para grupos", pax: 6, luggage: "6 maletas", base: 78 },
  { code: "MINIBUS", label: "Grupos y delegaciones", pax: 18, luggage: "12 maletas", base: 155 },
  { code: "BUS", label: "Eventos y grupos grandes", pax: 30, luggage: "Gestionado por cotizacion", base: null }
];
