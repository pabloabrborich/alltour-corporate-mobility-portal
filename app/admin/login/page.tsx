import { LockKeyhole } from "lucide-react";
import { adminLogin } from "@/app/actions";

export default async function AdminLoginPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-navy px-4">
      <form action={adminLogin} className="w-full max-w-md rounded-lg bg-white p-8 shadow-2xl">
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-ocean/10 text-ocean">
          <LockKeyhole size={24} />
        </div>
        <h1 className="text-2xl font-bold">Acceso administrativo</h1>
        <p className="mt-2 text-sm text-steel">Ingrese la clave operativa definida en `ADMIN_PASSWORD`.</p>
        {params.error ? (
          <p className="mt-4 rounded-md bg-red-50 p-3 text-sm font-semibold text-red-700">Clave incorrecta.</p>
        ) : null}
        <label className="mt-6 block">
          <span className="label">Clave</span>
          <input className="field" name="password" type="password" required />
        </label>
        <button className="btn-primary mt-6 w-full" type="submit">
          Entrar
        </button>
      </form>
    </main>
  );
}
