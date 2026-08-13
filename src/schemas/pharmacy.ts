import { z } from "zod";

export const dispenseSchema = z.object({
  prescriptionId: z.string().min(1, "กรุณาระบุรหัสใบสั่งยา"),
  visitId: z.string().min(1, "กรุณาระบุรหัส Visit"),
  notes: z.string().optional(),
});

export type DispenseInput = z.infer<typeof dispenseSchema>;
