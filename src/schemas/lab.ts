import { z } from "zod";
import { LabOrderStatus } from "@/generated/client";

export const createLabOrderSchema = z.object({
  patientId: z.string().min(1, "กรุณาเลือกผู้ป่วย"),
  visitId: z.string().min(1, "กรุณาระบุ Visit"),
  testName: z.string().min(1, "กรุณาระบุรายการตรวจแล็บ"),
  notes: z.string().optional(),
});

export const recordLabResultSchema = z.object({
  labOrderId: z.string().min(1, "กรุณาระบุใบสั่งตรวจแล็บ"),
  results: z.array(
    z.object({
      paramName: z.string().min(1, "กรุณาระบุชื่อพารามิเตอร์"),
      value: z.string().min(1, "กรุณาระบุค่าตรวจได้"),
      unit: z.string().optional(),
      normalRange: z.string().optional(),
      isAbnormal: z.boolean().default(false),
    })
  ).min(1, "กรุณาระบุผลตรวจอย่างน้อย 1 พารามิเตอร์"),
});

export type CreateLabOrderInput = z.infer<typeof createLabOrderSchema>;
export type RecordLabResultInput = z.infer<typeof recordLabResultSchema>;
