import { z } from "zod";
import { TriageUrgency } from "@prisma/client";

export const triageRecordSchema = z.object({
  visitId: z.string().min(1, "กรุณาระบุรหัส Visit"),
  weightKg: z
    .number({ invalid_type_error: "น้ำหนักต้องเป็นตัวเลข" })
    .positive("น้ำหนักต้องมากกว่า 0")
    .optional(),
  heightCm: z
    .number({ invalid_type_error: "ส่วนสูงต้องเป็นตัวเลข" })
    .positive("ส่วนสูงต้องมากกว่า 0")
    .optional(),
  temperatureC: z
    .number({ invalid_type_error: "อุณหภูมิต้องเป็นตัวเลข" })
    .optional(),
  systolicBp: z
    .number({ invalid_type_error: "ความดันโลหิตต้องเป็นตัวเลข" })
    .optional(),
  diastolicBp: z
    .number({ invalid_type_error: "ความดันโลหิตต้องเป็นตัวเลข" })
    .optional(),
  pulseRate: z
    .number({ invalid_type_error: "อัตราการเต้นหัวใจต้องเป็นตัวเลข" })
    .optional(),
  respiratoryRate: z
    .number({ invalid_type_error: "อัตราการหายใจต้องเป็นตัวเลข" })
    .optional(),
  spo2Percent: z
    .number({ invalid_type_error: "ค่า SpO2 ต้องเป็นตัวเลข" })
    .min(0)
    .max(100)
    .optional(),
  bloodGlucoseMgDl: z
    .number({ invalid_type_error: "ระดับน้ำตาลต้องเป็นตัวเลข" })
    .optional(),
  painScore: z
    .number({ invalid_type_error: "Pain Score ต้องเป็นตัวเลข" })
    .min(0)
    .max(10)
    .optional(),
  urgency: z.nativeEnum(TriageUrgency, {
    required_error: "กรุณาระบุระดับความรุนแรงการคัดกรอง",
  }),
  triageNote: z.string().optional(),
});

export type TriageRecordInput = z.infer<typeof triageRecordSchema>;
