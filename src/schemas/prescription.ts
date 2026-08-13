import { z } from "zod";

export const prescriptionItemSchema = z.object({
  drugId: z.string().min(1, "กรุณาเลือกตัวยา"),
  drugName: z.string().optional(),
  quantity: z.number().min(1, "จำนวนยาต้องมากกว่า 0"),
  dosage: z.string().min(1, "กรุณาระบุขนาดยา เช่น 1 เม็ด"),
  frequency: z.string().min(1, "กรุณาระบุความถี่ เช่น วันละ 3 ครั้ง หลังอาหาร"),
  instruction: z.string().optional(),
});

export const prescriptionSchema = z.object({
  visitId: z.string().min(1, "กรุณาระบุรหัส Visit"),
  notes: z.string().optional(),
  items: z.array(prescriptionItemSchema).min(1, "กรุณาสั่งยาอย่างน้อย 1 รายการ"),
});

export type PrescriptionItemInput = z.infer<typeof prescriptionItemSchema>;
export type PrescriptionInput = z.infer<typeof prescriptionSchema>;
