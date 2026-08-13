import { z } from "zod";

export const updateMyProfileSchema = z.object({
  fullName: z.string().min(2, "กรุณาระบุชื่อ-นามสกุลความยาวอย่างน้อย 2 ตัวอักษร"),
  email: z.string().email("กรุณาระบุอีเมลที่ถูกต้อง").optional().or(z.literal("")),
  phoneNumber: z.string().optional().or(z.literal("")),
});

export const changeMyPasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "กรุณาระบุรหัสผ่านปัจจุบัน"),
    newPassword: z.string().min(6, "รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร"),
    confirmPassword: z.string().min(6, "กรุณายืนยันรหัสผ่านใหม่"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน",
    path: ["confirmPassword"],
  });

export type UpdateMyProfileInput = z.infer<typeof updateMyProfileSchema>;
export type ChangeMyPasswordInput = z.infer<typeof changeMyPasswordSchema>;
