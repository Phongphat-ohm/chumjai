import { z } from "zod";

export const loginSchema = z.object({
  username: z
    .string()
    .min(1, "กรุณากรอกชื่อผู้ใช้งาน (Username)")
    .trim(),
  password: z
    .string()
    .min(1, "กรุณากรอกรหัสผ่าน (Password)"),
});

export type LoginInput = z.infer<typeof loginSchema>;
