"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Plane, Plus, X } from "lucide-react";
import { createTransportRequest } from "@/app/actions";
import { cityDefaults, cityLocations, cityOptions, vehicleTypes } from "@/lib/booking-data";

type Mode = "point" | "hourly" | "event";
type VehicleChoice = {
  vehicle: string;
  price: string;
  status: string;
};

export function BookingClient({ reference }: { reference?: string }) {
  const [mode, setMode] = useState<Mode>("point");
  const [city, setCity] = useState("quito");
  const [pickup, setPickup] = useState(cityDefaults.quito[0]);
  const [destination, setDestination] = useState(cityDefaults.quito[1]);
  const [stops, setStops] = useState<string[]>([]);
  const [whenType, setWhenType] = useState("now");
  const [passengers, setPassengers] = useState(4);
  const [showVehicles, setShowVehicles] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleChoice | null>(null);
  const [airportOpen, setAirportOpen] = useState(false);

  const places = useMemo(() => {
    return city === "other" ? Object.values(cityLocations).flat() : cityLocations[city] || [];
  }, [city]);

  const airportTrip = isAirportTrip(pickup, destination);
  const complexTrip = mode === "event" || stops.length > 5 || passengers > 18 || destination.toLowerCase().includes("cotopaxi");
  const estimatedTrip = !complexTrip && !airportTrip && destination.trim().length > 0;
  const priceStatus = complexTrip
    ? "Cotizacion personalizada requerida"
    : estimatedTrip
      ? "Precio estimado - ALLTOUR confirma tarifa final"
      : "Precio confirmado al instante";

  const availableVehicles = vehicleTypes.filter((vehicle) => passengers <= vehicle.pax);

  function changeCity(value: string) {
    setCity(value);
    const defaults = cityDefaults[value];
    setPickup(defaults?.[0] || "");
    setDestination(defaults?.[1] || "");
    setStops([]);
    setShowVehicles(false);
    setSelectedVehicle(null);
    setAirportOpen(false);
  }

  return (
    <main className="min-h-screen bg-mist text-ink">
      <header className="border-b border-line bg-mist/90">
        <div className="container-page flex min-h-16 items-center justify-between gap-4">
          <Link href="/" className="text-sm font-bold tracking-[0.18em] text-ink">
            ALLTOUR ECUADOR
          </Link>
          <nav className="hidden items-center gap-5 text-sm text-steel md:flex">
            <a href="#book" className="hover:text-ink">
              Reservar
            </a>
            <a href="#support" className="hover:text-ink">
              Soporte
            </a>
          </nav>
        </div>
      </header>

      <section className="container-page grid gap-10 py-10 lg:grid-cols-[0.9fr_1.1fr] lg:py-16">
        <div className="lg:pt-10">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold">Portal de reservas ALLTOUR</p>
          <h1 className="font-display mt-4 max-w-3xl text-5xl font-medium leading-[0.95] text-ink md:text-7xl">
            Elige la ruta. Elige el vehiculo.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-steel">
            ALLTOUR coordina el resto. Tu solicitud entra a una mesa operativa para confirmar disponibilidad, ruta,
            vehiculo y seguimiento.
          </p>
          <div className="mt-8 inline-flex rounded-full border border-line bg-white/70 px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] text-ocean">
            Sin codigos internos. Sin complejidad operativa.
          </div>
        </div>

        <section id="book" className="overflow-hidden rounded-[1.5rem] border border-line bg-white/90 shadow-soft">
          <div className="grid grid-cols-3 border-b border-line bg-warm-secondary">
            {[
              ["point", "Punto a punto"],
              ["hourly", "Por hora"],
              ["event", "Grupo / Evento"]
            ].map(([value, label]) => (
              <button
                key={value}
                className={`border-r border-line px-3 py-4 text-xs font-bold uppercase tracking-[0.08em] last:border-r-0 ${
                  mode === value ? "bg-navy text-white" : "text-steel"
                }`}
                type="button"
                onClick={() => {
                  setMode(value as Mode);
                  setShowVehicles(false);
                  setSelectedVehicle(null);
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {reference ? (
            <div className="border-b border-line bg-ocean/10 p-5 text-ocean">
              <div className="flex items-center gap-2 font-bold">
                <CheckCircle2 size={18} /> Solicitud recibida
              </div>
              <p className="mt-2 text-sm">Referencia: {reference}. ALLTOUR te contactara por WhatsApp o correo.</p>
            </div>
          ) : null}

          <form action={createTransportRequest} className="p-5 md:p-7">
            <input type="hidden" name="booking_mode" value={mode} />
            <input type="hidden" name="stops" value={JSON.stringify(stops.filter(Boolean).map((place) => ({ place })))} />
            <input type="hidden" name="is_airport_trip" value={String(airportTrip)} />
            <input type="hidden" name="selected_vehicle" value={selectedVehicle?.vehicle || ""} />
            <input type="hidden" name="price_shown" value={selectedVehicle?.price || ""} />
            <input type="hidden" name="price_status" value={selectedVehicle?.status || ""} />

            <div className="grid gap-4 md:grid-cols-2">
              <label className="md:col-span-2">
                <span className="label">Ciudad</span>
                <select className="field" name="city" value={city} onChange={(event) => changeCity(event.target.value)}>
                  {cityOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <RouteInput label="Donde te recogemos" name="pickup" value={pickup} onChange={setPickup} places={places} />
              <RouteInput label="A donde vas" name="destination" value={destination} onChange={setDestination} places={places} />

              <div className="space-y-3 md:col-span-2">
                {stops.map((stop, index) => (
                  <div key={index} className="grid grid-cols-[1fr_auto] gap-2">
                    <RouteInput
                      label={`Parada ${index + 1}`}
                      name={`stop-${index}`}
                      value={stop}
                      onChange={(value) => setStops((current) => current.map((item, itemIndex) => (itemIndex === index ? value : item)))}
                      places={places}
                    />
                    <button
                      className="mb-0 self-end rounded-lg border border-line bg-white px-3 py-3 text-danger"
                      type="button"
                      onClick={() => setStops((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                      aria-label="Eliminar parada"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
                <button className="inline-flex items-center gap-2 text-sm font-bold text-ocean" type="button" onClick={() => setStops((current) => [...current, ""])}>
                  <Plus size={16} /> Agregar parada
                </button>
              </div>

              <label>
                <span className="label">Cuando</span>
                <select className="field" name="when_type" value={whenType} onChange={(event) => setWhenType(event.target.value)}>
                  <option value="now">Ahora</option>
                  <option value="schedule">Programar</option>
                </select>
              </label>

              <label>
                <span className="label">Pasajeros</span>
                <select className="field" name="passengers" value={passengers} onChange={(event) => setPassengers(Number(event.target.value))}>
                  {[1, 2, 3, 4, 5, 6, 12, 18, 30].map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </label>

              {whenType === "schedule" ? (
                <>
                  <label>
                    <span className="label">Fecha</span>
                    <input className="field" name="scheduled_date" type="date" />
                  </label>
                  <label>
                    <span className="label">Hora</span>
                    <input className="field" name="scheduled_time" type="time" />
                  </label>
                </>
              ) : null}

              {airportTrip ? (
                <div className="rounded-xl border border-dashed border-line bg-ocean/5 p-4 md:col-span-2">
                  <button
                    className="flex w-full items-center justify-between text-left text-sm font-bold uppercase tracking-[0.08em] text-ocean"
                    type="button"
                    onClick={() => setAirportOpen((value) => !value)}
                  >
                    <span className="inline-flex items-center gap-2">
                      <Plane size={16} /> Detalles de vuelo y recibimiento
                    </span>
                    <span>{airportOpen ? "Ocultar" : "Opcional"}</span>
                  </button>
                  {airportOpen ? (
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <label>
                        <span className="label">Numero de vuelo</span>
                        <input className="field" name="flight_number" placeholder="Ejemplo: AV1636" />
                      </label>
                      <label>
                        <span className="label">Llegada o salida</span>
                        <select className="field" name="flight_direction">
                          <option>Llegada</option>
                          <option>Salida</option>
                        </select>
                      </label>
                      <label className="md:col-span-2">
                        <span className="label">Recibimiento</span>
                        <select className="field" name="meet_and_greet">
                          <option>No, recogida estandar</option>
                          <option>Si, requiere recibimiento</option>
                        </select>
                      </label>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>

            <button
              className="btn-dark mt-6 w-full"
              type="button"
              onClick={() => {
                setShowVehicles(true);
                setSelectedVehicle(null);
              }}
            >
              Ver vehiculos <ArrowRight size={16} />
            </button>

            {showVehicles ? (
              <div className="mt-6 space-y-4">
                <div className="rounded-xl bg-ocean/10 p-4 text-sm font-bold uppercase tracking-[0.08em] text-ocean">{priceStatus}</div>
                <div className="grid gap-3">
                  {availableVehicles.map((vehicle) => {
                    const choice = getVehicleChoice(vehicle, passengers, mode, complexTrip, estimatedTrip);
                    const selected = selectedVehicle?.vehicle === choice.vehicle;
                    return (
                      <button
                        key={vehicle.code}
                        className={`grid w-full gap-4 rounded-xl border p-4 text-left transition md:grid-cols-[1fr_auto] ${
                          selected ? "border-ocean bg-ocean/5 ring-4 ring-ocean/10" : "border-line bg-white hover:border-gold"
                        }`}
                        type="button"
                        onClick={() => setSelectedVehicle(choice)}
                      >
                        <span>
                          <span className="block text-sm font-bold uppercase tracking-[0.12em]">{vehicle.code}</span>
                          <span className="mt-1 block text-sm text-steel">
                            {vehicle.label}. Hasta {vehicle.pax} pasajeros - {vehicle.luggage}
                          </span>
                        </span>
                        <span className="text-left md:text-right">
                          <span className="block text-2xl font-bold">{choice.price}</span>
                          <span className="block text-xs uppercase text-steel">{choice.status}</span>
                          <span className="mt-2 inline-flex rounded-full bg-navy px-3 py-1 text-xs font-bold uppercase text-white">
                            {choice.price.includes("$") ? "Reservar" : "Solicitar"}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>

                {selectedVehicle ? (
                  <div className="rounded-xl border border-line bg-warm-secondary p-5">
                    <p className="text-sm font-bold uppercase tracking-[0.08em] text-ocean">
                      {selectedVehicle.vehicle} - {selectedVehicle.price} - {selectedVehicle.status}
                    </p>
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <label>
                        <span className="label">Nombre</span>
                        <input className="field" name="customer_name" placeholder="Tu nombre" required />
                      </label>
                      <label>
                        <span className="label">Numero movil</span>
                        <input className="field" name="customer_phone" placeholder="WhatsApp o telefono" required />
                      </label>
                      <label className="md:col-span-2">
                        <span className="label">Correo opcional</span>
                        <input className="field" name="customer_email" type="email" placeholder="nombre@empresa.com" />
                      </label>
                      <label className="md:col-span-2">
                        <span className="label">Notas opcionales</span>
                        <textarea className="field min-h-24" name="customer_notes" placeholder="Pasajero, letrero, equipaje o notas de horario" />
                      </label>
                    </div>
                    <button className="btn-dark mt-5 w-full" type="submit">
                      Enviar solicitud
                    </button>
                  </div>
                ) : null}
              </div>
            ) : null}
          </form>
          <datalist id="booking-places">
            {places.map((place) => (
              <option key={place} value={place} />
            ))}
          </datalist>
        </section>
      </section>

      <section id="support" className="container-page grid gap-5 pb-12 md:grid-cols-2">
        <div className="panel p-6">
          <h2 className="font-display text-3xl font-medium">Proximos viajes</h2>
          <p className="mt-3 text-sm text-steel">Al confirmar, ALLTOUR centraliza agenda, vehiculo, conductor y soporte.</p>
        </div>
        <div className="panel p-6">
          <h2 className="font-display text-3xl font-medium">Soporte operativo</h2>
          <p className="mt-3 text-sm text-steel">Tu solicitud queda registrada para seguimiento manual por el equipo ALLTOUR.</p>
        </div>
      </section>
    </main>
  );
}

function RouteInput({
  label,
  name,
  value,
  onChange,
  places
}: {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  places: string[];
}) {
  return (
    <label className={name.startsWith("stop") ? "" : "md:col-span-2"}>
      <span className="label">{label}</span>
      <input className="field" name={name} list="booking-places" value={value} onChange={(event) => onChange(event.target.value)} placeholder={places[0] || "Lugar o direccion"} required={!name.startsWith("stop")} />
    </label>
  );
}

function isAirportTrip(pickup: string, destination: string) {
  const combined = `${pickup} ${destination}`.toLowerCase();
  return combined.includes("airport") || combined.includes("aeropuerto") || combined.includes("uio");
}

function getVehicleChoice(
  vehicle: (typeof vehicleTypes)[number],
  passengers: number,
  mode: Mode,
  custom: boolean,
  estimate: boolean
): VehicleChoice {
  const multiplier = mode === "hourly" ? 2.4 : mode === "event" ? 3.1 : 1;
  const passengerLift = passengers > 6 ? 1.3 : passengers > 3 ? 1.12 : 1;
  const price = vehicle.base ? Math.round(vehicle.base * multiplier * passengerLift) : null;
  const priceText = custom || !price ? "Solicitar cotizacion" : estimate ? `$${price}-${price + 25}` : `$${price}`;
  const caption = custom ? "Confirmado por ALLTOUR" : estimate ? "Total estimado" : "Reservar ahora";

  return {
    vehicle: vehicle.code,
    price: priceText,
    status: caption
  };
}
