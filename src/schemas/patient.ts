import { z } from "zod";
import { Gender, RightsType } from "@prisma/client";

export const patientSchema = z.object({
  hn: z.string().optional(),
  nationalId: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.replace(/\D/g, "").length === 13,
      "เลขบัตรประชาชนต้องเป็นตัวเลข 13 หลัก"
    ),
  firstName: z.string().min(1, "กรุณากรอกชื่อ"),
  lastName: z.string().min(1, "กรุณากรอกนามสกุล"),
  gender: z.nativeEnum(Gender, { required_error: "กรุณาเลือกเพศ" }),
  dateOfBirth: z.string().min(1, "กรุณาระบุวันเกิด"),
  phoneNumber: z.string().min(9, "กรุณากรอกเบอร์โทรศัพท์อย่างน้อย 9 หลัก"),
  address: z.string().optional(),
  subdistrict: z.string().optional(),
  district: z.string().optional(),
  province: z.string().optional(),
  postalCode: z.string().optional(),
  rightsType: z.nativeEnum(RightsType).default(RightsType.UNIVERSAL_COVERAGE),
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),
  bloodType: z.string().optional(),
});

export const patientAllergySchema = z.object({
  patientId: z.string().min(1, "ระบุรหัสผู้ป่วย"),
  allergen: z.string().min(1, "กรุณากรอกสารหรือยาที่แพ้"),
  reaction: z.string().optional(),
  severity: z.string().optional(),
  notes: z.string().optional(),
});

export const patientConditionSchema = z.object({
  patientId: z.string().min(1, "ระบุรหัสผู้ป่วย"),
  condition: z.string().min(1, "กรุณากรอกชื่อโรคประจำตัว"),
  icd10Code: z.string().optional(),
  diagnosedAt: z.string().optional(),
  notes: z.string().optional(),
});

export type PatientInput = z.infer<typeof patientSchema>;
export type PatientAllergyInput = z.infer<typeof patientAllergySchema>;
export type PatientConditionInput = z.infer<typeof patientConditionSchema>;
