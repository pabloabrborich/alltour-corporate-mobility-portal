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
    "Hilton Colon Quito",
    "Go Quito Hotel",
    "Hotel Dann Carlton Quito",
    "Hotel Sheraton Quito",
    "Quicentro Shopping",
    "Parque La Carolina",
    "Centro de Convenciones Quito",
    "Quito Centro Historico",
    "Cumbaya",
    "Tumbaco",
    "Puembo",
    "Valle de los Chillos",
    "Mitad del Mundo",
    "Otavalo",
    "Parque Nacional Cotopaxi",
    "Guayaquil",
    "Cuenca",
    "Manta",
    "Salinas",
    "Santa Elena",
    "Montanita",
    "Esmeraldas",
    "Tulcan",
    "Lago Agrio",
    "Coca",
    "Tena",
    "Misahualli",
    "Loja",
    "Machala",
    "Macas",
    "Puyo",
    "Casa Sulto",
    "Huigra",
    "Alausi"
  ],
  guayaquil: [
    "Aeropuerto de Guayaquil",
    "Hotel Oro Verde Guayaquil",
    "Hilton Colon Guayaquil",
    "Wyndham Guayaquil",
    "Courtyard by Marriott Guayaquil",
    "Mall del Sol",
    "Puerto Santa Ana",
    "Malecon 2000",
    "Centro de Convenciones Guayaquil",
    "Samborondon",
    "Parque Historico Guayaquil",
    "Duran",
    "Salinas",
    "Cuenca",
    "Manta",
    "Santa Elena",
    "Montanita",
    "Puerto Lopez",
    "Machala",
    "Loja",
    "Riobamba",
    "Banos"
  ],
  cuenca: [
    "Aeropuerto Mariscal La Mar",
    "Centro Historico de Cuenca",
    "Hotel Oro Verde Cuenca",
    "Mansion Alcazar Cuenca",
    "Hotel Santa Lucia Cuenca",
    "Parque Calderon",
    "Turi",
    "Museo Pumapungo",
    "Universidad de Cuenca",
    "Parque Nacional Cajas",
    "Gualaceo",
    "Chordeleg",
    "Loja",
    "Machala",
    "Riobamba",
    "Banos",
    "Ingapirca",
    "Guayaquil"
  ],
  manta: [
    "Aeropuerto Eloy Alfaro Manta",
    "Hotel Oro Verde Manta",
    "Wyndham Manta Sail Plaza",
    "Mall del Pacifico",
    "Puerto de Manta",
    "Ciudad del Sol Manta",
    "Montecristi",
    "Portoviejo",
    "Santa Marianita",
    "Guayaquil",
    "Montanita",
    "Puerto Lopez",
    "Salinas",
    "Pedernales",
    "Esmeraldas"
  ],
  galapagos: [
    "Aeropuerto Seymour Baltra",
    "Canal de Itabaca",
    "Puerto Ayora",
    "Hotel en Santa Cruz",
    "Muelle de Puerto Ayora",
    "Tortuga Bay",
    "Estacion Cientifica Charles Darwin",
    "Los Gemelos",
    "Rancho Primicias"
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
  { code: "SEDAN EJECUTIVO", label: "Servicio privado para ejecutivos", pax: 2, luggage: "2 maletas medianas" },
  { code: "SUV PREMIUM", label: "Mayor comodidad para pasajeros y equipaje", pax: 4, luggage: "4 maletas medianas" },
  { code: "VAN EJECUTIVA", label: "Traslados corporativos y familias", pax: 5, luggage: "5 maletas medianas" },
  { code: "MINIBUS", label: "Grupos pequenos y delegaciones", pax: 15, luggage: "Equipaje moderado" },
  { code: "MINIBUS CORPORATIVO", label: "Delegaciones, eventos y grupos medianos", pax: 19, luggage: "Equipaje grupal" },
  { code: "BUS / GRUPO", label: "Eventos, convenciones y movimientos especiales", pax: 45, luggage: "Gestionado por cotizacion" }
];

export const destinationOptions = [
  "Cruceros Galapagos",
  "Galapagos",
  "Amazonas",
  "Andes Ecuador",
  "Peru",
  "India",
  "Bali",
  "Sri Lanka",
  "Otro destino"
];

export const flightOriginOptions = [
  "Quito (UIO)",
  "Guayaquil (GYE)",
  "Cuenca (CUE)",
  "Manta (MEC)",
  "Galapagos / Baltra (GPS)",
  "Otro aeropuerto en Ecuador"
];

export const commonFlightDestinations = [
  "Miami",
  "Madrid",
  "New York",
  "Bogota",
  "Lima",
  "Buenos Aires",
  "Santiago",
  "Ciudad de Mexico",
  "Panama",
  "Destino mundial / por definir"
];
