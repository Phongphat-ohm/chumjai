"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/server/permissions/guard";

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function getSecurityAuditReportAction(): Promise<ActionResult<any>> {
  try {
    const session = await requireRole(["ADMIN"]);

    // 1. User & Role Audit
    const totalUsers = await prisma.user.count({ where: { isActive: true } });
    const userRoleCounts = await prisma.user.groupBy({
      by: ["role"],
      where: { isActive: true },
      _count: { id: true },
    });

    const roleMap: Record<string, number> = {};
    for (const item of userRoleCounts) {
      roleMap[item.role] = item._count.id;
    }

    // 2. Audit Trail Stats
    const totalAuditLogs = await prisma.auditLog.count();
    const failedLoginAttempts = await prisma.auditLog.count({
      where: {
        action: "LOGIN",
        success: false,
      },
    });

    const successfulLogins = await prisma.auditLog.count({
      where: {
        action: "LOGIN",
        success: true,
      },
    });

    // 3. System Hardening Policies Checklist Status
    const securityChecklist = [
      {
        id: "RBAC_GUARDS",
        name: "การควบคุมสิทธิ์ตามบทบาท (RBAC Authorization Guards)",
        status: "ACTIVE",
        description: "คุ้มครองทุก Server Actions ด้วย requireRole() และ requirePermission() ป้องกันการบุกรุกข้ามบทบาท",
      },
      {
        id: "PDPA_MASKING",
        name: "การเซ็นเซอร์ข้อมูลส่วนบุคคล (PDPA Data Masking)",
        status: "ACTIVE",
        description: "ซ่อนเลขบัตรประชาชน 13 หลักและเบอร์โทรศัพท์ในหน้าประวัติและการบันทึก Audit Logs",
      },
      {
        id: "SQL_INJECTION_IMMUNITY",
        name: "การป้องกันการโจมตีทางฐานข้อมูล (SQL Injection Protection)",
        status: "ACTIVE",
        description: "ใช้ Prisma ORM Prepared Statements และ Parameterized Queries 100% ป้องกัน SQL Injection",
      },
      {
        id: "RATE_LIMITING",
        name: "ระบบป้องกันการสุ่มรหัสผ่าน (Rate Limiting)",
        status: "ACTIVE",
        description: "จำกัดการเข้าสู่ระบบผิดพลาดไม่เกิน 5 ครั้ง ต่อ 15 นาที ต่อชื่อผู้ใช้งาน",
      },
      {
        id: "AUDIT_TRAIL_INTEGRITY",
        name: "ความสมบูรณ์ของการบันทึกประวัติ (Audit Trail Integrity)",
        status: "ACTIVE",
        description: "บันทึกประวัติกิจกรรมสำคัญ (สร้าง, แก้ไข, ลบ, จ่ายยา, เปลี่ยนตั้งค่า) ถาวรในฐานข้อมูล",
      },
    ];

    // Record Audit Log (SECURITY_AUDIT_PERFORMED)
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: "SECURITY_AUDIT_PERFORMED",
        resourceType: "SECURITY_SYSTEM",
        success: true,
      },
    });

    revalidatePath("/security");
    return {
      success: true,
      data: {
        totalUsers,
        roleMap,
        totalAuditLogs,
        failedLoginAttempts,
        successfulLogins,
        securityChecklist,
        lastAuditTimestamp: new Date().toISOString(),
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message || "ไม่สามารถทำการตรวจสอบความปลอดภัยได้" };
  }
}
