"use client";

import { Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import type { RouteStop } from "@/lib/types";

const stopTypes: Array<{ label: string; value: RouteStop["type"] }> = [
  { label: "Pickup", value: "pickup" },
  { label: "Parada", value: "stop" },
  { label: "Dropoff", value: "dropoff" }
];

const initialStops: RouteStop[] = [
  { id: "pickup-1", type: "pickup", place: "", reference: "", maps_url: "", passengers: "", time: "", notes: "" },
  { id: "dropoff-1", type: "dropoff", place: "", reference: "", maps_url: "", passengers: "", time: "", notes: "" }
];

export function RouteStopsBuilder() {
  const [stops, setStops] = useState<RouteStop[]>(initialStops);

  const serializedStops = useMemo(() => {
    return JSON.stringify(
      stops
        .map((stop) => ({
          ...stop,
          place: stop.place.trim(),
          reference: stop.reference?.trim(),
          maps_url: stop.maps_url?.trim(),
          passengers: stop.passengers?.trim(),
          time: stop.time?.trim(),
          notes: stop.notes?.trim()
        }))
        .filter((stop) => stop.place || stop.reference || stop.maps_url || stop.passengers || stop.time || stop.notes)
    );
  }, [stops]);

  function updateStop(index: number, key: keyof RouteStop, value: string) {
    setStops((current) => current.map((stop, stopIndex) => (stopIndex === index ? { ...stop, [key]: value } : stop)));
  }

  function addStop(type: RouteStop["type"] = "stop") {
    setStops((current) => [
      ...current,
      { id: `${type}-${Date.now()}`, type, place: "", reference: "", maps_url: "", passengers: "", time: "", notes: "" }
    ]);
  }

  function removeStop(index: number) {
    setStops((current) => current.filter((_, stopIndex) => stopIndex !== index));
  }

  return (
    <section>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-ink">Itinerario y puntos del recorrido</h2>
          <p className="mt-1 text-sm text-steel">
            Agregue todos los pickups, paradas y dropoffs necesarios. Use links de Google Maps para ubicaciones exactas.
          </p>
        </div>
        <button className="btn-secondary" type="button" onClick={() => addStop()}>
          <Plus size={16} /> Agregar parada
        </button>
      </div>

      <input type="hidden" name="route_stops" value={serializedStops} />

      <div className="space-y-4">
        {stops.map((stop, index) => (
          <div key={stop.id || index} className="rounded-lg border border-line bg-slate-50 p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="font-bold text-ink">Punto {index + 1}</p>
              <button
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-line bg-white text-steel hover:text-red-600"
                type="button"
                aria-label="Eliminar parada"
                onClick={() => removeStop(index)}
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="label">Tipo de punto</span>
                <select className="field" value={stop.type} onChange={(event) => updateStop(index, "type", event.target.value)}>
                  {stopTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="label">Lugar</span>
                <input
                  className="field"
                  value={stop.place}
                  placeholder="Ej. Swissotel Quito"
                  onChange={(event) => updateStop(index, "place", event.target.value)}
                />
              </label>
              <label className="block">
                <span className="label">Referencia / entrada exacta</span>
                <input
                  className="field"
                  value={stop.reference || ""}
                  placeholder="Ej. lobby principal, puerta posterior"
                  onChange={(event) => updateStop(index, "reference", event.target.value)}
                />
              </label>
              <label className="block">
                <span className="label">Link Google Maps</span>
                <input
                  className="field"
                  value={stop.maps_url || ""}
                  placeholder="https://maps.app.goo.gl/..."
                  onChange={(event) => updateStop(index, "maps_url", event.target.value)}
                />
              </label>
              <label className="block">
                <span className="label">Pasajeros asociados</span>
                <input
                  className="field"
                  value={stop.passengers || ""}
                  placeholder="Ej. Dr. Perez, Ana Ruiz"
                  onChange={(event) => updateStop(index, "passengers", event.target.value)}
                />
              </label>
              <label className="block">
                <span className="label">Hora / ventana</span>
                <input
                  className="field"
                  value={stop.time || ""}
                  placeholder="Ej. 08:30 o 08:30-08:45"
                  onChange={(event) => updateStop(index, "time", event.target.value)}
                />
              </label>
              <label className="block md:col-span-2">
                <span className="label">Notas del punto</span>
                <textarea
                  className="field min-h-20"
                  value={stop.notes || ""}
                  placeholder="Instrucciones para operaciones o conductor"
                  onChange={(event) => updateStop(index, "notes", event.target.value)}
                />
              </label>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
