import "server-only";

import { vehicleTypes } from "@/lib/booking-data";
import { getSupabaseAdminClient, hasSupabaseConfig } from "@/lib/supabase";
import type { TransportPricingOption } from "@/lib/types";

const QUOTE_TEXT = "Solicitar cotizacion";

type PricingInput = {
  city: string;
  pickup: string;
  destination: string;
  passengers: number;
  stopsCount?: number;
};

type RateRow = {
  supplier_rate: number | string;
  currency: string;
  supplier_vehicle_classes:
    | {
        supplier_vehicle_name: string;
        capacity_max: number;
        alltour_display_class: string;
        display_order: number;
      }
    | {
        supplier_vehicle_name: string;
        capacity_max: number;
        alltour_display_class: string;
        display_order: number;
      }[];
};

const labelByClass = new Map(vehicleTypes.map((vehicle) => [vehicle.code, vehicle]));

const cityHubKeys: Record<string, string> = {
  quito: "quito",
  guayaquil: "guayaquil",
  cuenca: "cuenca",
  manta: "manta"
};

const airportAliases: Record<string, string[]> = {
  airport_uio: ["aeropuerto internacional mariscal sucre", "aeropuerto quito", "aeropuerto uio", "uio"],
  airport_gye: ["aeropuerto de guayaquil", "aeropuerto guayaquil", "jose joaquin de olmedo", "gye"],
  airport_cue: ["aeropuerto mariscal la mar", "aeropuerto cuenca", "cue"],
  airport_mec: ["aeropuerto eloy alfaro manta", "aeropuerto manta", "mec"]
};

const locationAliases: Record<string, string[]> = {
  quito: [
    "quito",
    "quito centro norte",
    "la carolina",
    "swissotel quito",
    "jw marriott quito",
    "hilton colon quito",
    "go quito hotel",
    "hotel dann carlton quito",
    "hotel sheraton quito",
    "quicentro shopping",
    "parque la carolina",
    "centro de convenciones quito",
    "quito centro historico"
  ],
  guayaquil: ["guayaquil", "hotel oro verde guayaquil", "hilton colon guayaquil", "wyndham guayaquil"],
  cuenca: ["cuenca", "centro historico de cuenca", "hotel oro verde cuenca"],
  manta: ["manta", "hotel oro verde manta", "wyndham manta sail plaza"],
  cumbaya: ["cumbaya"],
  tumbaco: ["tumbaco"],
  otavalo: ["otavalo"],
  ibarra: ["ibarra"],
  cotopaxi: ["cotopaxi", "parque nacional cotopaxi"],
  mindo: ["mindo"],
  esmeraldas: ["esmeraldas"],
  tulcan: ["tulcan"],
  lago_agrio: ["lago agrio"],
  coca: ["coca"],
  tena: ["tena"],
  misahualli: ["misahualli"],
  loja: ["loja"],
  machala: ["machala"],
  macas: ["macas"],
  puyo: ["puyo"],
  casa_sulto: ["casa sulto"],
  salinas: ["salinas"],
  santa_elena: ["santa elena"],
  montanita: ["montanita", "montanita"],
  huigra: ["huigra"],
  alausi: ["alausi"],
  banos: ["banos", "banos de agua santa"],
  riobamba: ["riobamba"],
  puerto_lopez: ["puerto lopez"],
  ingapirca: ["ingapirca"],
  pedernales: ["pedernales"]
};

export async function getAvailableTransportOptions(input: PricingInput) {
  const passengers = normalizePassengers(input.passengers);

  if (input.stopsCount && input.stopsCount > 0) {
    return {
      route: { origin: input.pickup, destination: input.destination, matched: false },
      options: quoteOptions(passengers)
    };
  }

  const origin = normalizeLocation(input.pickup, input.city, "pickup");
  const destination = normalizeLocation(input.destination, input.city, "destination");

  if (!origin || !destination) {
    return {
      route: { origin: input.pickup, destination: input.destination, matched: false },
      options: quoteOptions(passengers)
    };
  }

  if (!hasSupabaseConfig()) {
    return {
      route: { origin: origin.name, destination: destination.name, matched: false },
      options: quoteOptions(passengers)
    };
  }

  try {
    const supabase = getSupabaseAdminClient();
    const { data: route, error: routeError } = await supabase
      .from("routes")
      .select("id, origin_name, destination_name")
      .eq("origin_key", origin.key)
      .eq("destination_key", destination.key)
      .eq("route_type", "point_to_point")
      .eq("active", true)
      .maybeSingle();

    if (routeError || !route) {
      return {
        route: { origin: origin.name, destination: destination.name, matched: false },
        options: quoteOptions(passengers)
      };
    }

    const { data: rates, error: ratesError } = await supabase
      .from("supplier_route_rates")
      .select(
        "supplier_rate, currency, supplier_vehicle_classes!inner(supplier_vehicle_name, capacity_max, alltour_display_class, display_order)"
      )
      .eq("route_id", route.id)
      .eq("active", true);

    if (ratesError || !rates?.length) {
      return {
        route: { origin: route.origin_name, destination: route.destination_name, matched: true },
        options: quoteOptions(passengers)
      };
    }

    return {
      route: { origin: route.origin_name, destination: route.destination_name, matched: true },
      options: mergeRateOptions(rates as RateRow[], passengers)
    };
  } catch {
    return {
      route: { origin: origin.name, destination: destination.name, matched: false },
      options: quoteOptions(passengers)
    };
  }
}

function mergeRateOptions(rates: RateRow[], passengers: number) {
  const optionsByClass = new Map<string, TransportPricingOption>();

  for (const rate of rates) {
    const vehicleClass = Array.isArray(rate.supplier_vehicle_classes)
      ? rate.supplier_vehicle_classes[0]
      : rate.supplier_vehicle_classes;

    if (!vehicleClass || passengers > vehicleClass.capacity_max) {
      continue;
    }

    const visual = labelByClass.get(vehicleClass.alltour_display_class);
    const option = {
      vehicle: vehicleClass.alltour_display_class,
      label: visual?.label || vehicleClass.supplier_vehicle_name,
      pax: vehicleClass.capacity_max,
      luggage: visual?.luggage || "Capacidad segun proveedor",
      price: formatMoney(rate.supplier_rate),
      status: "Reservar ahora",
      quoteRequired: false
    };

    const existing = optionsByClass.get(option.vehicle);
    if (!existing || option.pax < existing.pax) {
      optionsByClass.set(option.vehicle, option);
    }
  }

  const pricedOptions = Array.from(optionsByClass.values()).sort((a, b) => a.pax - b.pax);
  const sedan = passengers <= 2 ? quoteOptions(passengers).filter((option) => option.vehicle === "SEDAN EJECUTIVO") : [];

  return [...sedan, ...pricedOptions].length ? [...sedan, ...pricedOptions] : quoteOptions(passengers);
}

function quoteOptions(passengers: number): TransportPricingOption[] {
  return vehicleTypes
    .filter((vehicle) => passengers <= vehicle.pax)
    .map((vehicle) => ({
      vehicle: vehicle.code,
      label: vehicle.label,
      pax: vehicle.pax,
      luggage: vehicle.luggage,
      price: QUOTE_TEXT,
      status: QUOTE_TEXT,
      quoteRequired: true
    }));
}

function normalizePassengers(value: number) {
  return Number.isFinite(value) && value > 0 ? value : 1;
}

function normalizeLocation(value: string, city: string, role: "pickup" | "destination") {
  const normalized = normalizeText(value);

  if (!normalized || isMapInput(normalized)) {
    return null;
  }

  for (const [key, aliases] of Object.entries(airportAliases)) {
    if (aliases.some((alias) => normalized.includes(normalizeText(alias)))) {
      return { key, name: displayName(key) };
    }
  }

  for (const [key, aliases] of Object.entries(locationAliases)) {
    if (aliases.some((alias) => normalized === normalizeText(alias))) {
      return { key, name: displayName(key) };
    }
  }

  for (const [key, aliases] of Object.entries(locationAliases)) {
    if (aliases.some((alias) => normalized.includes(normalizeText(alias)))) {
      return { key, name: displayName(key) };
    }
  }

  const cityKey = cityHubKeys[city];
  if (role === "pickup" && cityKey) {
    return { key: cityKey, name: displayName(cityKey) };
  }

  return null;
}

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/ñ/g, "n")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function isMapInput(normalized: string) {
  return normalized.includes("http") || normalized.includes("maps google") || /^-?\d+(\.\d+)?\s+-?\d+(\.\d+)?$/.test(normalized);
}

function displayName(key: string) {
  return key
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatMoney(value: number | string) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return QUOTE_TEXT;
  }

  return `$${numericValue % 1 === 0 ? numericValue.toFixed(0) : numericValue.toFixed(2)}`;
}
