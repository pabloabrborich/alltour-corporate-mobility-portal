export function normalizeWhatsappPhone(phone?: string | null) {
  if (!phone) {
    return null;
  }

  let digits = phone.replace(/[^\d]/g, "");

  if (digits.startsWith("00")) {
    digits = digits.slice(2);
  }

  if (digits.startsWith("0")) {
    digits = `593${digits.slice(1)}`;
  }

  if (digits.length === 9 && digits.startsWith("9")) {
    digits = `593${digits}`;
  }

  if (digits.length < 10) {
    return null;
  }

  return digits;
}

export function createWhatsappUrl(phone: string | null | undefined, message: string) {
  const normalizedPhone = normalizeWhatsappPhone(phone);

  if (!normalizedPhone) {
    return null;
  }

  return `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(message)}`;
}
