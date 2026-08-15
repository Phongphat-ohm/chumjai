import { z } from "zod";
import { DiagnosisType } from "@/generated/client";

export const diagnosisItemSchema = z.object({
  icd10Code: z.string().min(1, "กรุณาระบุรหัส ICD-10"),
  icd10Name: z.string().min(1, "กรุณาระบุชื่อการวินิจฉัย"),
  type: z.nativeEnum(DiagnosisType, { required_error: "กรุณาระบุประเภทการวินิจฉัย" }),
  notes: z.string().optional(),
});

export const soapNoteSchema = z.object({
  visitId: z.string().min(1, "กรุณาระบุรหัส Visit"),
  subjective: z.string().optional().default("อาการทั่วไป / ตรวจติดตาม"),
  objective: z.string().optional().default(""),
  assessment: z.string().optional().default(""),
  plan: z.string().optional().default("ให้การรักษาตามผลตรวจและติดตามอาการ"),
  diagnoses: z
    .array(diagnosisItemSchema)
    .min(1, "กรุณาระบุการวินิจฉัยโรคตามรหัส ICD-10 อย่างน้อย 1 โรคหลัก"),
});

export type SoapNoteInput = z.infer<typeof soapNoteSchema>;
export type DiagnosisItemInput = z.infer<typeof diagnosisItemSchema>;

