"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/schemas/auth";
import { verifyPassword, setSessionCookie, clearSessionCookie, getSession } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";

export interface ActionResult {
  success: boolean;
  error?: string;
}

export async function loginAction(
  prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const rawUsername = formData.get("username") as string;
  const rawPassword = formData.get("password") as string;

  // 1. Zod Validation
  const validated = loginSchema.safeParse({
    username: rawUsername,
    password: rawPassword,
  });

  if (!validated.success) {
    const errorMsg = validated.error.errors[0]?.message || "ข้อมูลไม่ถูกต้อง";
    return { success: false, error: errorMsg };
  }

  const { username, password } = validated.data;

  // 2. Rate Limiting Check
  const rateLimitKey = `login_${username}`;
  const rateCheck = checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000);
  if (!rateCheck.success) {
    return {
      success: false,
      error: "ลองผิดพลาดเกินจำนวนที่กำหนด กรุณาลองใหม่อีกครั้งใน 15 นาที",
    };
  }

  // 3. Check User Existence in DB
  try {
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user || !user.isActive) {
      // Record Audit Log (Failed Login Attempt)
      await prisma.auditLog.create({
        data: {
          action: "LOGIN",
          resourceType: "USER",
          success: false,
        },
      });

      return {
        success: false,
        error: "ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง หรือบัญชีถูกระงับ",
      };
    }

    // 4. Verify Password Hash
    const isValidPassword = await verifyPassword(password, user.passwordHash);
    if (!isValidPassword) {
      // Record Audit Log (Failed Login Attempt)
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: "LOGIN",
          resourceType: "USER",
          resourceId: user.id,
          success: false,
        },
      });

      return {
        success: false,
        error: "ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง",
      };
    }

    // 5. Update Last Login Time
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // 6. Set Encrypted Session Cookie
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    await setSessionCookie({
      userId: user.id,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
      expiresAt,
    });

    // 7. Record Audit Log (Successful Login)
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "LOGIN",
        resourceType: "USER",
        resourceId: user.id,
        success: true,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Login Server Action Error:", error);
    return {
      success: false,
      error: "เกิดข้อผิดพลาดของระบบ กรุณาลองใหม่อีกครั้ง",
    };
  }
}

export async function logoutAction(): Promise<ActionResult> {
  const session = await getSession();

  if (session?.userId) {
    try {
      await prisma.auditLog.create({
        data: {
          userId: session.userId,
          action: "LOGOUT",
          resourceType: "USER",
          resourceId: session.userId,
          success: true,
        },
      });
    } catch (e) {
      console.error("Logout Audit Log Error:", e);
    }
  }

  await clearSessionCookie();
  return { success: true };
}
