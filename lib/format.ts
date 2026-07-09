export function formatDateTime(value?: string | null) {
  if (!value) return "Por confirmar";

  return new Intl.DateTimeFormat("es-EC", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export function formatMonth(value?: string | null) {
  if (!value) return "";

  return new Intl.DateTimeFormat("es-EC", {
    month: "long",
    year: "numeric"
  }).format(new Date(value));
}

export function currency(value?: number | null) {
  if (value === null || value === undefined) return "Por cotizar";

  return new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD"
  }).format(value);
}
