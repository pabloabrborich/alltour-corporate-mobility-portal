import { randomBytes } from "crypto";
import type { Company } from "@/lib/types";

export function createPortalToken() {
  return randomBytes(24).toString("hex");
}

export function getCompanyPortalPath(company?: Pick<Company, "portal_access_token" | "portal_enabled"> | null) {
  if (!company?.portal_enabled || !company.portal_access_token) {
    return null;
  }

  return `/portal/company/${company.portal_access_token}`;
}
