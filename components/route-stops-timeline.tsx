import { ExternalLink, MapPinned } from "lucide-react";
import type { RouteStop } from "@/lib/types";

const labels: Record<RouteStop["type"], string> = {
  pickup: "Pickup",
  stop: "Parada",
  dropoff: "Dropoff"
};

export function RouteStopsTimeline({ stops }: { stops?: RouteStop[] | null }) {
  if (!stops?.length) {
    return null;
  }

  const routeUrl = buildGoogleRouteUrl(stops);

  return (
    <div className="panel p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold">Itinerario operativo</h2>
          <p className="mt-1 text-sm text-steel">Pickups, paradas, dropoffs y referencias exactas.</p>
        </div>
        {routeUrl ? (
          <a className="btn-secondary" href={routeUrl} target="_blank" rel="noreferrer">
            <MapPinned size={16} /> Abrir ruta
          </a>
        ) : null}
      </div>

      <div className="mt-5 space-y-4">
        {stops.map((stop, index) => (
          <div key={`${stop.type}-${index}-${stop.place}`} className="grid gap-3 rounded-md border border-line bg-slate-50 p-4 md:grid-cols-[92px_1fr_auto]">
            <div>
              <span className="status-pill border-blue-200 bg-blue-50 text-blue-700">{labels[stop.type] || "Parada"}</span>
              <p className="mt-2 text-xs font-bold text-steel">#{index + 1}</p>
            </div>
            <div>
              <p className="font-bold text-ink">{stop.place || "Lugar por confirmar"}</p>
              {stop.reference ? <p className="mt-1 text-sm text-steel">Referencia: {stop.reference}</p> : null}
              {stop.passengers ? <p className="mt-1 text-sm text-steel">Pasajeros: {stop.passengers}</p> : null}
              {stop.time ? <p className="mt-1 text-sm text-steel">Hora / ventana: {stop.time}</p> : null}
              {stop.notes ? <p className="mt-1 text-sm text-steel">Notas: {stop.notes}</p> : null}
            </div>
            {stop.maps_url ? (
              <a className="btn-secondary min-h-9 px-3 py-1" href={stop.maps_url} target="_blank" rel="noreferrer">
                Maps <ExternalLink size={14} />
              </a>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

export function formatRouteStops(stops?: RouteStop[] | null) {
  if (!stops?.length) return "";

  return stops
    .map((stop, index) => {
      const details = [stop.reference, stop.passengers ? `Pasajeros: ${stop.passengers}` : "", stop.time ? `Hora: ${stop.time}` : ""]
        .filter(Boolean)
        .join(" | ");
      return `${index + 1}. ${labels[stop.type] || "Parada"} - ${stop.place}${details ? ` (${details})` : ""}`;
    })
    .join("\n");
}

function buildGoogleRouteUrl(stops: RouteStop[]) {
  const locations = stops
    .map((stop) => getDirectionsLocation(stop))
    .filter((location): location is string => Boolean(location));
  if (locations.length < 2) return null;

  const [origin, ...rest] = locations;
  const destination = rest.pop();
  if (!destination) return null;

  const params = new URLSearchParams({
    api: "1",
    origin,
    destination
  });

  if (rest.length) {
    params.set("waypoints", rest.join("|"));
  }

  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

function getDirectionsLocation(stop: RouteStop) {
  const coordinates = extractCoordinates(stop.maps_url);
  if (coordinates) {
    return coordinates;
  }

  const textLocation = [stop.place, stop.reference].filter(Boolean).join(", ").trim();
  return textLocation || null;
}

function extractCoordinates(url?: string) {
  if (!url) return null;

  const decodedUrl = decodeURIComponent(url);
  const atMatch = decodedUrl.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
  if (atMatch) {
    return `${atMatch[1]},${atMatch[2]}`;
  }

  const queryMatch = decodedUrl.match(/[?&](?:q|query|destination|origin)=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
  if (queryMatch) {
    return `${queryMatch[1]},${queryMatch[2]}`;
  }

  return null;
}
