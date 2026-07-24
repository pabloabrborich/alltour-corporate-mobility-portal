"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  const confirmationRef = useRef<HTMLDivElement | null>(null);
  const vehiclesRef = useRef<HTMLDivElement | null>(null);
  const requestFormRef = useRef<HTMLDivElement | null>(null);

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

  useEffect(() => {
    if (reference) {
      confirmationRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [reference]);

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
    <main className="min-h-screen bg-[#f7f1e8] text-ink">
      <header className="border-b border-[#ded7ca] bg-[#fbf8f1]/90">
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

      <section className="container-page grid gap-10 py-10 lg:grid-cols-[0.92fr_1.08fr] lg:py-14">
        <div className="lg:pt-12">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-ocean">Portal de reservas ALLTOUR</p>
          <h1 className="font-display mt-5 max-w-2xl text-5xl font-medium leading-[0.95] text-ink md:text-7xl">
            Elige la ruta. Elige el vehiculo.
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-steel">
            ALLTOUR coordina el resto. Tu solicitud entra a una mesa operativa para confirmar disponibilidad, ruta,
            vehiculo y seguimiento.
          </p>
          <div className="mt-9 inline-flex rounded-full border border-[#ded7ca] bg-[#fbf8f1]/70 px-4 py-3 text-xs font-medium tracking-[0.03em] text-ocean">
            Reservas corporativas con coordinacion ALLTOUR.
          </div>
        </div>

        <section id="book" className="overflow-hidden rounded-2xl border border-[#ded7ca] bg-[#fffdf9]/90 shadow-[0_18px_54px_rgba(23,33,29,0.11)] backdrop-blur">
          <div className="grid grid-cols-3 border-b border-[#ded7ca] bg-[#f4ede4]">
            {[
              ["point", "Punto a punto"],
              ["hourly", "Por hora"],
              ["event", "Grupo / Evento"]
            ].map(([value, label]) => (
              <button
                key={value}
                className={`border-r border-[#ded7ca] px-3 py-4 text-sm font-medium last:border-r-0 ${
                  mode === value ? "bg-[#2f5a3d] text-white" : "text-steel"
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
            <div ref={confirmationRef} className="border-b border-[#ded7ca] bg-[#eef3eb] p-5 text-ocean">
              <div className="flex items-center gap-2 font-bold">
                <CheckCircle2 size={18} /> Solicitud recibida
              </div>
              <p className="mt-2 text-sm">Referencia: {reference}. ALLTOUR te contactara por WhatsApp o correo.</p>
            </div>
          ) : null}

          <form action={createTransportRequest} className="p-5 md:p-6">
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
                <div className="rounded-xl border border-dashed border-[#ded7ca] bg-[#eef3eb] p-4 md:col-span-2">
                  <button
                    className="flex w-full items-center justify-between text-left text-sm font-medium text-ocean"
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
              className="mt-7 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#2f5a3d] bg-[#2f5a3d] px-5 py-3 text-sm font-semibold tracking-[0.02em] text-white transition hover:border-[#284b34] hover:bg-[#284b34]"
              type="button"
              onClick={() => {
                setShowVehicles(true);
                setSelectedVehicle(null);
                window.setTimeout(() => {
                  vehiclesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                }, 80);
              }}
            >
              Ver vehiculos <ArrowRight size={16} />
            </button>

            {showVehicles ? (
              <div ref={vehiclesRef} className="mt-6 scroll-mt-6 space-y-4">
                <div className="rounded-xl bg-[#eef3eb] p-4 text-sm font-medium tracking-[0.02em] text-ocean">{priceStatus}</div>
                <div className="grid gap-3">
                  {availableVehicles.map((vehicle) => {
                    const choice = getVehicleChoice(vehicle, passengers, mode, complexTrip, estimatedTrip);
                    const selected = selectedVehicle?.vehicle === choice.vehicle;
                    return (
                      <button
                        key={vehicle.code}
                        className={`grid w-full gap-4 rounded-xl border px-4 py-3 text-left transition md:grid-cols-[1fr_auto] ${
                          selected ? "border-[#2f5a3d] bg-[#eef3eb] ring-4 ring-[#2f5a3d]/10" : "border-[#ded7ca] bg-white hover:border-gold"
                        }`}
                        type="button"
                        onClick={() => {
                          setSelectedVehicle(choice);
                          window.setTimeout(() => {
                            requestFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                          }, 80);
                        }}
                      >
                        <span>
                          <span className="block text-sm font-medium tracking-[0.03em] text-ink">{vehicle.code}</span>
                          <span className="mt-1 block text-sm leading-6 text-steel">
                            {vehicle.label}. Hasta {vehicle.pax} pasajeros - {vehicle.luggage}
                          </span>
                        </span>
                        <span className="text-left md:text-right">
                          <span className="block text-xl font-semibold text-ink">{choice.price}</span>
                          <span className="block text-xs text-steel">{choice.status}</span>
                          <span className="mt-2 inline-flex rounded-full border border-[#ded7ca] bg-[#fbf8f1] px-3 py-1 text-xs font-medium text-ink">
                            {choice.price.includes("$") ? "Reservar" : "Solicitar"}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>

                {selectedVehicle ? (
                  <div ref={requestFormRef} className="scroll-mt-6 rounded-xl border border-[#ded7ca] bg-[#fbf8f1] p-5">
                    <p className="text-sm font-medium tracking-[0.02em] text-ocean">
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
                    <button className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-[#2f5a3d] bg-[#2f5a3d] px-5 py-3 text-sm font-semibold tracking-[0.02em] text-white transition hover:border-[#284b34] hover:bg-[#284b34]" type="submit">
                      Enviar solicitud
                    </button>
                  </div>
                ) : null}
              </div>
            ) : null}
          </form>
        </section>
      </section>

      <section id="support" className="container-page grid gap-5 bg-[#f7f1e8] pb-12 md:grid-cols-2">
        <div className="rounded-xl border border-[#ded7ca] bg-[#fbf8f1] p-6">
          <h2 className="font-display text-3xl font-medium">Proximos viajes</h2>
          <p className="mt-3 text-sm text-steel">Al confirmar, ALLTOUR centraliza agenda, vehiculo, conductor y soporte.</p>
        </div>
        <div className="rounded-xl border border-[#ded7ca] bg-[#fbf8f1] p-6">
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
  const [open, setOpen] = useState(false);
  const filteredPlaces = places
    .filter((place) => place.toLowerCase().includes(value.toLowerCase()))
    .slice(0, 8);

  return (
    <label className={`relative ${name.startsWith("stop") ? "" : "md:col-span-2"}`}>
      <span className="label">{label}</span>
      <input
        className="field"
        name={name}
        value={value}
        onBlur={() => {
          window.setTimeout(() => setOpen(false), 120);
        }}
        onChange={(event) => {
          onChange(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="Hotel, aeropuerto, direccion o link de Google Maps"
        required={!name.startsWith("stop")}
      />
      <p className="mt-1 text-xs text-steel">Puedes escribir una direccion o pegar un link de Google Maps.</p>
      {open && filteredPlaces.length ? (
        <div className="absolute z-20 mt-2 max-h-64 w-full overflow-y-auto rounded-lg border border-[#ded7ca] bg-[#fffdf9] p-1 shadow-soft">
          {filteredPlaces.map((place) => (
            <button
              key={place}
              className="block w-full rounded-md px-3 py-2 text-left text-sm text-ink hover:bg-[#f4ede4]"
              type="button"
              onMouseDown={(event) => {
                event.preventDefault();
                onChange(place);
                setOpen(false);
              }}
            >
              {place}
            </button>
          ))}
          <div className="border-t border-[#ded7ca] px-3 py-2 text-xs text-steel">Puedes escribir otra direccion si no aparece en la lista.</div>
        </div>
      ) : null}
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
