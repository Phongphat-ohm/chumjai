"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/server/permissions/guard";
import { hashPassword } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import {
  createUserSchema,
  updateUserSchema,
  resetUserPasswordSchema,
} from "@/schemas/user-management";

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function getUsersAction(params?: {
  search?: string;
  role?: UserRole | "ALL";
}): Promise<ActionResult<any[]>> {
  try {
    await requireRole(["ADMIN"]);

    const search = params?.search?.trim();
    const roleFilter = params?.role && params.role !== "ALL" ? params.role : undefined;

    const users = await prisma.user.findMany({
      where: {
        role: roleFilter,
        OR: search
          ? [
              { username: { contains: search, mode: "insensitive" } },
              { fullName: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ]
          : undefined,
      },
      select: {
        id: true,
        username: true,
        fullName: true,
        role: true,
        email: true,
        phoneNumber: true,
        isActive: true,
        createdAt: true,
        lastLoginAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: users };
  } catch (error: any) {
    return { success: false, error: error.message || "ไม่สามารถดึงรายชื่อผู้ใช้งานได้" };
  }
}

export async function createUserAction(
  formData: Record<string, any>
): Promise<ActionResult<any>> {
  try {
    const session = await requireRole(["ADMIN"]);

    const validated = createUserSchema.safeParse(formData);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.errors[0]?.message || "ข้อมูลสร้างผู้ใช้ไม่ถูกต้อง",
      };
    }

    const { username, password, fullName, role, email, phoneNumber } = validated.data;

    // Check existing username
    const existing = await prisma.user.findUnique({
      where: { username },
    });

    if (existing) {
      return { success: false, error: "ชื่อผู้ใช้งานนี้ถูกใช้งานแล้วในระบบ" };
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        username,
        passwordHash,
        fullName,
        role,
        email: email || null,
        phoneNumber: phoneNumber || null,
        isActive: true,
      },
      select: {
        id: true,
        username: true,
        fullName: true,
        role: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: "USER_CREATED",
        resourceType: "USER",
        resourceId: user.id,
        success: true,
      },
    });

    revalidatePath("/users");
    return { success: true, data: user };
  } catch (error: any) {
    return { success: false, error: error.message || "ไม่สามารถสร้างผู้ใช้งานใหม่ได้" };
  }
}

export async function updateUserAction(
  formData: Record<string, any>
): Promise<ActionResult<any>> {
  try {
    const session = await requireRole(["ADMIN"]);

    const validated = updateUserSchema.safeParse(formData);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.errors[0]?.message || "ข้อมูลผู้ใช้ไม่ถูกต้อง",
      };
    }

    const { userId, fullName, role, email, phoneNumber } = validated.data;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        fullName,
        role,
        email: email || null,
        phoneNumber: phoneNumber || null,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: "USER_UPDATED",
        resourceType: "USER",
        resourceId: userId,
        success: true,
      },
    });

    revalidatePath("/users");
    return { success: true, data: user };
  } catch (error: any) {
    return { success: false, error: error.message || "ไม่สามารถอัปเดตข้อมูลผู้ใช้ได้" };
  }
}

export async function resetUserPasswordAction(
  formData: Record<string, any>
): Promise<ActionResult<any>> {
  try {
    const session = await requireRole(["ADMIN"]);

    const validated = resetUserPasswordSchema.safeParse(formData);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.errors[0]?.message || "ข้อมูลรหัสผ่านไม่ถูกต้อง",
      };
    }

    const { userId, newPassword } = validated.data;

    const passwordHash = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: "USER_PASSWORD_RESET",
        resourceType: "USER",
        resourceId: userId,
        success: true,
      },
    });

    revalidatePath("/users");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "ไม่สามารถรีเซ็ตรหัสผ่านได้" };
  }
}

export async function toggleUserActiveAction(
  userId: string
): Promise<ActionResult<any>> {
  try {
    const session = await requireRole(["ADMIN"]);

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return { success: false, error: "ไม่พบบัญชีผู้ใช้งาน" };
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { isActive: !user.isActive },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: "USER_STATUS_TOGGLED",
        resourceType: "USER",
        resourceId: userId,
        success: true,
      },
    });

    revalidatePath("/users");
    return { success: true, data: updated };
  } catch (error: any) {
    return { success: false, error: error.message || "ไม่สามารถเปลี่ยนสถานะบัญชีได้" };
  }
}
