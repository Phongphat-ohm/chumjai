import { z } from "zod";
import { AppointmentStatus } from "@prisma/client";

export const createAppointmentSchema = z.object({
  patientId: z.string().min(1, "กรุณาเลือกผู้ป่วย"),
  appointmentDate: z.string().min(1, "กรุณาระบุวันและเวลานัดหมาย"),
  reason: z.string().min(1, "กรุณาระบุวัตถุประสงค์การนัดหมาย"),
  notes: z.string().optional(),
});

export const updateAppointmentStatusSchema = z.object({
  appointmentId: z.string().min(1, "กรุณาระบุรหัสใบนัดหมาย"),
  status: z.nativeEnum(AppointmentStatus, { required_error: "กรุณาระบุสถานะนัดหมาย" }),
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type UpdateAppointmentStatusInput = z.infer<typeof updateAppointmentStatusSchema>;
