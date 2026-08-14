import { z } from "zod";

export const updateClinicSettingsSchema = z.object({
  clinicName: z.string().min(1, "กรุณาระบุชื่อคลินิก"),
  address: z.string().min(1, "กรุณาระบุที่อยู่สถานพยาบาล"),
  phone: z.string().min(1, "กรุณาระบุเบอร์โทรศัพท์ติดต่อ"),
  email: z.string().email("กรุณาระบุอีเมลที่ถูกต้อง").optional().or(z.literal("")),
  licenseNo: z.string().optional(),
  taxId: z.string().optional(),
  directorName: z.string().optional(),
  openingHours: z.string().optional(),
  minStockThreshold: z.number().min(1).default(10),
  expiryWarningDays: z.number().min(1).default(90),
  // Level 2: Document Template Settings
  docLogoUrl: z.string().url("URL รูปภาพไม่ถูกต้อง").optional().or(z.literal("")),
  docAccentColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "รูปแบบสี Hex ไม่ถูกต้อง เช่น #2B7A4B")
    .optional()
    .or(z.literal("")),
  docShowLogo: z.boolean().default(true),
  docFooterText: z.string().optional(),
  docSignatureTitle: z.string().optional(),
});

export type UpdateClinicSettingsInput = z.infer<typeof updateClinicSettingsSchema>;
