"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/server/permissions/guard";
import { hashPassword, verifyPassword } from "@/lib/auth";
import {
  updateMyProfileSchema,
  changeMyPasswordSchema,
} from "@/schemas/user-profile";

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function getMyProfileAction(): Promise<ActionResult<any>> {
  try {
    const session = await requireAuth();

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        username: true,
        fullName: true,
        role: true,
        email: true,
        phoneNumber: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });

    if (!user) {
      return { success: false, error: "ไม่พบบัญชีผู้ใช้งาน" };
    }

    return { success: true, data: user };
  } catch (error: any) {
    return { success: false, error: error.message || "ไม่สามารถดึงข้อมูลโปรไฟล์ได้" };
  }
}

export async function updateMyProfileAction(
  formData: Record<string, any>
): Promise<ActionResult<any>> {
  try {
    const session = await requireAuth();

    const validated = updateMyProfileSchema.safeParse(formData);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.errors[0]?.message || "ข้อมูลโปรไฟล์ไม่ถูกต้อง",
      };
    }

    const { fullName, email, phoneNumber } = validated.data;

    const updatedUser = await prisma.user.update({
      where: { id: session.userId },
      data: {
        fullName,
        email: email || null,
        phoneNumber: phoneNumber || null,
      },
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        phoneNumber: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: "USER_PROFILE_UPDATED",
        resourceType: "USER",
        resourceId: session.userId,
        success: true,
      },
    });

    revalidatePath("/profile");
    return { success: true, data: updatedUser };
  } catch (error: any) {
    return { success: false, error: error.message || "ไม่สามารถอัปเดตข้อมูลโปรไฟล์ได้" };
  }
}

export async function changeMyPasswordAction(
  formData: Record<string, any>
): Promise<ActionResult<any>> {
  try {
    const session = await requireAuth();

    const validated = changeMyPasswordSchema.safeParse(formData);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.errors[0]?.message || "ข้อมูลรหัสผ่านไม่ถูกต้อง",
      };
    }

    const { currentPassword, newPassword } = validated.data;

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
    });

    if (!user) {
      return { success: false, error: "ไม่พบบัญชีผู้ใช้งาน" };
    }

    const isMatch = await verifyPassword(currentPassword, user.passwordHash);
    if (!isMatch) {
      return { success: false, error: "รหัสผ่านปัจจุบันไม่ถูกต้อง" };
    }

    const newHashed = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: session.userId },
      data: {
        passwordHash: newHashed,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: "USER_PASSWORD_CHANGED",
        resourceType: "USER",
        resourceId: session.userId,
        success: true,
      },
    });

    revalidatePath("/profile");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "ไม่สามารถเปลี่ยนรหัสผ่านได้" };
  }
}
