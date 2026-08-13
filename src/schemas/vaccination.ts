import { z } from "zod";

export const recordVaccinationSchema = z.object({
  patientId: z.string().min(1, "กรุณาเลือกผู้ป่วย"),
  vaccineId: z.string().min(1, "กรุณาเลือกประเภทวัคซีน"),
  lotNumber: z.string().optional(),
  doseNumber: z.number().min(1, "เข็มที่ต้องไม่น้อยกว่า 1").default(1),
  administeredAt: z.string().min(1, "กรุณาระบุวันและเวลารับวัคซีน"),
  injectionSite: z.string().optional(),
});

export type RecordVaccinationInput = z.infer<typeof recordVaccinationSchema>;
