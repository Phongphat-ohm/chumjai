import { z } from "zod";
import { ReferralStatus } from "@/generated/client";

export const createReferralSchema = z.object({
  patientId: z.string().min(1, "กรุณาเลือกผู้ป่วย"),
  visitId: z.string().min(1, "กรุณาระบุ Visit"),
  hospitalName: z.string().min(1, "กรุณาระบุชื่อโรงพยาบาลปลายทาง"),
  reason: z.string().min(1, "กรุณาระบุเหตุผลการส่งตัว"),
  diagnosisSummary: z.string().optional(),
});

export const updateReferralStatusSchema = z.object({
  referralId: z.string().min(1, "กรุณาระบุรายการส่งตัว"),
  status: z.nativeEnum(ReferralStatus),
});

export type CreateReferralInput = z.infer<typeof createReferralSchema>;
export type UpdateReferralStatusInput = z.infer<typeof updateReferralStatusSchema>;
