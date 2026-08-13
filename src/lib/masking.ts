/**
 * Mask National ID according to Section 25 of PROMPT.md
 * Example: 1234567890123 -> 1-2345-*****-**-3
 */
export function maskNationalId(id?: string | null): string {
  if (!id) return "-";
  const cleaned = id.replace(/\D/g, "");
  if (cleaned.length !== 13) return id;

  const p1 = cleaned.substring(0, 1);
  const p2 = cleaned.substring(1, 5);
  const p5 = cleaned.substring(12, 13);

  return `${p1}-${p2}-*****-**-${p5}`;
}

/**
 * Mask Phone Number according to Section 25 of PROMPT.md
 * Example: 0812345678 -> 08X-XXX-5678
 */
export function maskPhoneNumber(phone?: string | null): string {
  if (!phone) return "-";
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length < 9) return phone;

  const prefix = cleaned.substring(0, 2);
  const suffix = cleaned.substring(cleaned.length - 4);

  return `${prefix}X-XXX-${suffix}`;
}

/**
 * Format National ID with hyphens (1-2345-67890-12-3)
 */
export function formatNationalId(id?: string | null): string {
  if (!id) return "-";
  const cleaned = id.replace(/\D/g, "");
  if (cleaned.length !== 13) return id;

  return `${cleaned.substring(0, 1)}-${cleaned.substring(1, 5)}-${cleaned.substring(5, 10)}-${cleaned.substring(10, 12)}-${cleaned.substring(12, 13)}`;
}
