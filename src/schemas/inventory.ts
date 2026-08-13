import { z } from "zod";

export const createDrugSchema = z.object({
  code: z.string().min(1, "กรุณาระบุรหัสยา"),
  genericName: z.string().min(1, "กรุณาระบุชื่อสามัญทางยา"),
  tradeName: z.string().optional(),
  strength: z.string().optional(),
  unit: z.string().min(1, "กรุณาระบุหน่วยนับ เช่น เม็ด, ขวด"),
  description: z.string().optional(),
  minStockLevel: z
    .number({ invalid_type_error: "จำนวนขั้นต่ำต้องเป็นตัวเลข" })
    .min(0, "จำนวนขั้นต่ำต้องไม่ติดลบ"),
});

export const stockInSchema = z.object({
  drugId: z.string().min(1, "กรุณาเลือกตัวยา"),
  lotNumber: z.string().min(1, "กรุณาระบุเลขล็อต (Lot Number)"),
  quantity: z
    .number({ invalid_type_error: "จำนวนต้องเป็นตัวเลข" })
    .positive("จำนวนต้องมากกว่า 0"),
  manufactureDate: z.string().optional(),
  expiredAt: z.string().min(1, "กรุณาระบุวันหมดอายุ"),
  notes: z.string().optional(),
});

export const adjustStockSchema = z.object({
  batchId: z.string().min(1, "กรุณาเลือกล็อตยา"),
  newQuantity: z
    .number({ invalid_type_error: "จำนวนใหม่ต้องเป็นตัวเลข" })
    .min(0, "จำนวนต้องไม่ติดลบ"),
  notes: z.string().min(1, "กรุณาระบุเหตุผลในการปรับปรุงสต็อก"),
});

export type CreateDrugInput = z.infer<typeof createDrugSchema>;
export type StockInInput = z.infer<typeof stockInSchema>;
export type AdjustStockInput = z.infer<typeof adjustStockSchema>;
