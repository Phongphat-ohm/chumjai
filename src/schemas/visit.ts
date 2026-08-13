import { z } from "zod";
import { VisitStatus } from "@prisma/client";

export const createVisitSchema = z.object({
  patientId: z.string().min(1, "กรุณาระบุผู้ป่วย"),
  chiefComplaint: z
    .string()
    .min(1, "กรุณากรอกอาการสำคัญที่มาคลินิก (Chief Complaint)")
    .trim(),
});

export const updateVisitStatusSchema = z.object({
  visitId: z.string().min(1, "กรุณาระบุรหัส Visit"),
  status: z.nativeEnum(VisitStatus, { required_error: "กรุณาระบุสถานะ" }),
});

export type CreateVisitInput = z.infer<typeof createVisitSchema>;
export type UpdateVisitStatusInput = z.infer<typeof updateVisitStatusSchema>;
