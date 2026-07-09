"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSupabaseAdminClient, hasSupabaseConfig } from "@/lib/supabase";
import { setAdminCookie } from "@/lib/auth";

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
          industry
        })
        .select()
        .single()
    ).data;

  if (!company) {
    throw new Error("No se pudo crear la empresa.");
  }

  const { data: request, error: requestError } = await supabase
    .from("service_requests")
    .insert({
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
      status: "Nueva solicitud",
      internal_notes: optional(formData, "notes")
    })
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
