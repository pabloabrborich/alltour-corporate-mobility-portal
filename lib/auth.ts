import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE_NAME = "alltour_admin";

export async function isAdminAuthenticated() {
  if (!process.env.ADMIN_PASSWORD) {
    return false;
  }

  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(COOKIE_NAME)?.value;
  return Boolean(cookieValue && cookieValue === process.env.ADMIN_PASSWORD);
}

export async function requireAdmin() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }
}

export async function setAdminCookie(password: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, password, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8
  });
}
