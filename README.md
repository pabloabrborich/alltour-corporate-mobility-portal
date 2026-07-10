# ALLTOUR Corporate Mobility Portal

MVP web app para gestion de transporte corporativo en Ecuador: landing, formulario de solicitud, agenda interna, tickets operativos, portal corporativo y pagina publica de confirmacion.

## Stack

- Next.js App Router
- React
- Tailwind CSS
- Supabase/Postgres
- Listo para Vercel y GitHub

## Configuracion local

1. Instale dependencias:

```bash
npm install
```

2. Copie variables de entorno:

```bash
cp .env.example .env.local
```

3. Complete:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_PASSWORD=
NEXT_PUBLIC_SUPPORT_PHONE=
NEXT_PUBLIC_SUPPORT_EMAIL=
```

4. En Supabase SQL Editor ejecute:

```text
supabase/schema.sql
supabase/seed.sql
```

Si el proyecto ya existia antes de agregar itinerarios con multiples paradas, ejecute tambien:

```text
supabase/add-route-stops.sql
```

Para activar portales privados por empresa en un proyecto existente, ejecute:

```text
supabase/add-company-portal.sql
```

5. Inicie desarrollo:

```bash
npm run dev
```

## Rutas

- `/` landing corporativa
- `/request` formulario de solicitud
- `/portal` portal corporativo
- `/portal/company/[token]` portal privado por empresa
- `/portal/demo` redireccion heredada hacia `/portal`
- `/admin` agenda interna protegida por `ADMIN_PASSWORD`
- `/admin/services/[id]` detalle y edicion del ticket operativo
- `/confirmation/[id]` confirmacion publica para pasajero

## Itinerarios y multiples paradas

El formulario permite agregar puntos ilimitados de recorrido: pickup, parada y dropoff. Cada punto puede incluir lugar, referencia exacta, link de Google Maps, pasajeros asociados, hora/ventana y notas. Estos datos se guardan en `service_requests.route_stops` como JSON.

## Notas de produccion

- El admin usa una cookie HTTP-only simple basada en `ADMIN_PASSWORD`; para una fase posterior conviene migrar a Supabase Auth o SSO corporativo.
- Las acciones de servidor usan `SUPABASE_SERVICE_ROLE_KEY`; mantenga esa variable solo en servidor.
- Si Supabase no esta configurado, las paginas publicas siguen renderizando y el formulario cae a una confirmacion local.
