import { z } from "zod";
import { UserRole } from "@/generated/client";

export const createUserSchema = z.object({
  username: z
    .string()
    .min(3, "ชื่อผู้ใช้งานต้องมีความยาวอย่างน้อย 3 ตัวอักษร")
    .regex(/^[a-zA-Z0-9_]+$/, "ชื่อผู้ใช้งานต้องเป็นตัวอักษรภาษาอังกฤษ ตัวเลข หรือ _ เท่านั้น"),
  password: z.string().min(6, "รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร"),
  fullName: z.string().min(2, "กรุณาระบุชื่อ-นามสกุลบุคลากร"),
  role: z.nativeEnum(UserRole).default(UserRole.RECEPTIONIST),
  email: z.string().email("กรุณาระบุอีเมลที่ถูกต้อง").optional().or(z.literal("")),
  phoneNumber: z.string().optional().or(z.literal("")),
});

export const updateUserSchema = z.object({
  userId: z.string().uuid("Invalid User ID"),
  fullName: z.string().min(2, "กรุณาระบุชื่อ-นามสกุลบุคลากร"),
  role: z.nativeEnum(UserRole),
  email: z.string().email("กรุณาระบุอีเมลที่ถูกต้อง").optional().or(z.literal("")),
  phoneNumber: z.string().optional().or(z.literal("")),
});

export const resetUserPasswordSchema = z.object({
  userId: z.string().uuid("Invalid User ID"),
  newPassword: z.string().min(6, "รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร"),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type ResetUserPasswordInput = z.infer<typeof resetUserPasswordSchema>;
