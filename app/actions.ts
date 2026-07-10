"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSupabaseAdminClient, hasSupabaseConfig } from "@/lib/supabase";
import { setAdminCookie } from "@/lib/auth";
import { createPortalToken } from "@/lib/company-portal";
import type { RouteStop } from "@/lib/types";

function required(formData: FormData, key: string) {
  const value = String(formData.get(key) || "").trim();
  if (!value) {
    throw new Error(`Campo requerido: ${key}`);
  }
  return value;
}

function optional(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim() || null;
}

function parseRouteStops(formData: FormData): RouteStop[] | null {
  const raw = optional(formData, "route_stops");
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;

    const stops = parsed
      .map((stop) => ({
        type: stop.type === "pickup" || stop.type === "dropoff" || stop.type === "stop" ? stop.type : "stop",
        place: String(stop.place || "").trim(),
        reference: String(stop.reference || "").trim(),
        maps_url: String(stop.maps_url || "").trim(),
        passengers: String(stop.passengers || "").trim(),
        time: String(stop.time || "").trim(),
        notes: String(stop.notes || "").trim()
      }))
      .filter((stop) => stop.place || stop.reference || stop.maps_url || stop.passengers || stop.time || stop.notes);

    return stops.length ? stops : null;
  } catch {
    return null;
  }
}

export async function createServiceRequest(formData: FormData) {
  if (!hasSupabaseConfig()) {
    redirect("/request/success?demo=1");
  }

  const supabase = getSupabaseAdminClient();
  const companyName = required(formData, "company_name");
  const contactName = required(formData, "contact_name");
  const email = required(formData, "email");
  const phone = required(formData, "phone");
  const industry = optional(formData, "industry");

  const { data: existingCompany, error: companyFindError } = await supabase
    .from("companies")
    .select("*")
    .eq("name", companyName)
    .maybeSingle();

  if (companyFindError) {
    throw new Error(companyFindError.message);
  }

  const company =
    existingCompany ||
    (
      await supabase
        .from("companies")
        .insert({
          name: companyName,
          contact_name: contactName,
          email,
          phone,
          industry,
          portal_access_token: createPortalToken(),
          portal_enabled: true
        })
        .select()
        .single()
    ).data;

  if (!company) {
    throw new Error("No se pudo crear la empresa.");
  }

  if (existingCompany && !existingCompany.portal_access_token) {
    const { data: updatedCompany, error: tokenError } = await supabase
      .from("companies")
      .update({
        portal_access_token: createPortalToken(),
        portal_enabled: true
      })
      .eq("id", existingCompany.id)
      .select()
      .single();

    if (tokenError || !updatedCompany) {
      throw new Error(tokenError?.message || "No se pudo activar el portal de la empresa.");
    }

    company.portal_access_token = updatedCompany.portal_access_token;
    company.portal_enabled = updatedCompany.portal_enabled;
  }

  const routeStops = parseRouteStops(formData);
  const requestPayload = {
    company_id: company.id,
    service_type: required(formData, "service_type"),
    pickup_location: required(formData, "pickup_location"),
    dropoff_location: required(formData, "dropoff_location"),
    pickup_datetime: required(formData, "pickup_datetime"),
    passengers_count: Number(required(formData, "passengers_count")),
    passenger_names: optional(formData, "passenger_names"),
    vehicle_type: optional(formData, "vehicle_type"),
    flight_info: optional(formData, "flight_info"),
    special_requirements: optional(formData, "special_requirements"),
    ...(routeStops ? { route_stops: routeStops } : {}),
    status: "Nueva solicitud",
    internal_notes: optional(formData, "notes")
  };

  const { data: request, error: requestError } = await supabase
    .from("service_requests")
    .insert(requestPayload)
    .select()
    .single();

  if (requestError || !request) {
    throw new Error(requestError?.message || "No se pudo crear la solicitud.");
  }

  const { error: ticketError } = await supabase.from("service_tickets").insert({
    request_id: request.id,
    confirmation_status: "Pendiente",
    operation_status: "Por asignar",
    invoice_status: "Pendiente"
  });

  if (ticketError) {
    throw new Error(ticketError.message);
  }

  revalidatePath("/admin");
  redirect(`/request/success?id=${request.id}`);
}

export async function adminLogin(formData: FormData) {
  const password = required(formData, "password");
  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
    redirect("/admin/login?error=1");
  }

  await setAdminCookie(password);
  redirect("/admin");
}

export async function updateRequestStatus(formData: FormData) {
  const id = required(formData, "id");
  const status = required(formData, "status");
  const supabase = getSupabaseAdminClient();

  const { error } = await supabase.from("service_requests").update({ status }).eq("id", id);
  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin");
}

export async function updateTicket(formData: FormData) {
  const requestId = required(formData, "request_id");
  const ticketId = required(formData, "ticket_id");
  const supabase = getSupabaseAdminClient();

  const requestUpdate = {
    status: required(formData, "status"),
    estimated_price: optional(formData, "estimated_price") ? Number(optional(formData, "estimated_price")) : null,
    vehicle_type: optional(formData, "vehicle_type"),
    internal_notes: optional(formData, "internal_notes")
  };

  const ticketUpdate = {
    assigned_driver: optional(formData, "assigned_driver"),
    driver_phone: optional(formData, "driver_phone"),
    vehicle_plate: optional(formData, "vehicle_plate"),
    operation_status: optional(formData, "operation_status"),
    invoice_status: optional(formData, "invoice_status"),
    confirmation_status: optional(formData, "confirmation_status")
  };

  const { error: requestError } = await supabase.from("service_requests").update(requestUpdate).eq("id", requestId);
  if (requestError) {
    throw new Error(requestError.message);
  }

  const { error: ticketError } = await supabase.from("service_tickets").update(ticketUpdate).eq("id", ticketId);
  if (ticketError) {
    throw new Error(ticketError.message);
  }

  revalidatePath("/admin");
  revalidatePath(`/admin/services/${requestId}`);
  revalidatePath(`/confirmation/${requestId}`);
}
