import { PlaneTakeoff, Send } from "lucide-react";
import { Footer } from "@/components/footer";
import { SelectField, TextArea, TextField } from "@/components/forms";
import { SiteHeader } from "@/components/site-header";
import { createServiceRequest } from "@/app/actions";

const industries = [
  "Farmaceutica",
  "Congreso medico",
  "Embajada",
  "Evento corporativo",
  "ONG",
  "Universidad",
  "Construccion",
  "Mineria / energia",
  "Delegacion internacional",
  "Otra"
];

const serviceTypes = [
  "Traslado aeropuerto",
  "Auto ejecutivo",
  "Van corporativa",
  "Bus",
  "Ruta de personal",
  "Traslado hotel / venue",
  "Evento corporativo",
  "Interciudad",
  "Extension turistica"
];

const vehicleTypes = ["Sedan ejecutivo", "SUV", "Van", "Minibus", "Bus", "Por recomendar"];

export default function RequestPage() {
  return (
    <main>
      <SiteHeader />
      <section className="bg-navy py-12 text-white">
        <div className="container-page">
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-gold">
            <PlaneTakeoff size={17} /> Nueva solicitud
          </p>
          <h1 className="max-w-3xl text-4xl font-bold">Solicitud de transporte corporativo</h1>
          <p className="mt-4 max-w-2xl text-slate-200">
            Complete los datos operativos. ALLTOUR revisara disponibilidad, asignacion y condiciones antes de confirmar.
          </p>
        </div>
      </section>
      <section className="py-10">
        <div className="container-page">
          <form action={createServiceRequest} className="panel grid gap-8 p-6 lg:p-8">
            <FormSection title="Empresa y contacto">
              <TextField name="company_name" label="Empresa" required />
              <TextField name="contact_name" label="Contacto" required />
              <TextField name="email" label="Email" type="email" required />
              <TextField name="phone" label="Telefono" required />
              <SelectField name="industry" label="Industria" options={industries} />
            </FormSection>

            <FormSection title="Servicio">
              <SelectField name="service_type" label="Tipo de servicio" options={serviceTypes} required />
              <TextField name="pickup_location" label="Lugar de recogida" required />
              <TextField name="dropoff_location" label="Destino" required />
              <TextField name="pickup_datetime" label="Fecha y hora de recogida" type="datetime-local" required />
              <TextField name="passengers_count" label="Numero de pasajeros" type="number" min="1" required />
              <SelectField name="vehicle_type" label="Vehiculo solicitado" options={vehicleTypes} />
            </FormSection>

            <FormSection title="Pasajeros y operacion">
              <TextArea name="passenger_names" label="Nombres de pasajeros" placeholder="Un pasajero por linea" />
              <TextField name="flight_info" label="Informacion de vuelo" placeholder="Ej. AV7391 llegada 18:20" />
              <TextArea name="special_requirements" label="Requerimientos especiales" />
              <TextArea name="notes" label="Notas adicionales" />
            </FormSection>

            <div className="flex flex-col gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-xl text-sm text-steel">
                Al enviar, se crea una solicitud y un ticket operativo para revision interna.
              </p>
              <button className="btn-primary" type="submit">
                Enviar solicitud <Send size={16} />
              </button>
            </div>
          </form>
        </div>
      </section>
      <Footer />
    </main>
  );
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-4 text-lg font-bold text-ink">{title}</h2>
      <div className="grid gap-4 md:grid-cols-2">{children}</div>
    </section>
  );
}
