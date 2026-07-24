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
  { code: "SEDAN EJECUTIVO", label: "Servicio privado para ejecutivos", pax: 2, luggage: "2 maletas medianas", base: 45 },
  { code: "SUV PREMIUM", label: "Mayor comodidad para pasajeros y equipaje", pax: 4, luggage: "4 maletas medianas", base: 62 },
  { code: "VAN EJECUTIVA", label: "Traslados corporativos y familias", pax: 7, luggage: "7 maletas", base: 85 },
  { code: "MINIBUS CORPORATIVO", label: "Delegaciones, eventos y grupos medianos", pax: 18, luggage: "12 maletas", base: 165 },
  { code: "BUS / GRUPO", label: "Eventos, convenciones y movimientos especiales", pax: 45, luggage: "Gestionado por cotizacion", base: null }
];
