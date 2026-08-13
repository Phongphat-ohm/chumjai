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
});

export type UpdateClinicSettingsInput = z.infer<typeof updateClinicSettingsSchema>;
