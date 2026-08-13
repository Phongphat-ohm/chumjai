"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth, requirePermission } from "@/server/permissions/guard";
import { auditLogQuerySchema } from "@/schemas/audit-log";

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// ----------------------------------------------------
// Action 1: Get Audit Logs (Admin / Authorized Access)
// ----------------------------------------------------
export async function getAuditLogsAction(params?: {
  userId?: string;
  action?: string;
  resourceType?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}): Promise<ActionResult<any>> {
  try {
    const session = await requirePermission("AUDIT_LOG_VIEW");

    const page = params?.page || 1;
    const limit = params?.limit || 30;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params?.userId) {
      where.userId = params.userId;
    }

    if (params?.action && params.action !== "ALL") {
      where.action = { contains: params.action, mode: "insensitive" };
    }

    if (params?.resourceType && params.resourceType !== "ALL") {
      where.resourceType = params.resourceType;
    }

    if (params?.startDate || params?.endDate) {
      where.timestamp = {};
      if (params.startDate) {
        const start = new Date(params.startDate);
        start.setHours(0, 0, 0, 0);
        where.timestamp.gte = start;
      }
      if (params.endDate) {
        const end = new Date(params.endDate);
        end.setHours(23, 59, 59, 999);
        where.timestamp.lte = end;
      }
    }

    const [totalCount, logs] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { timestamp: "desc" },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              username: true,
              role: true,
            },
          },
        },
      }),
    ]);

    return {
      success: true,
      data: {
        logs,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message || "ไม่สามารถดึงประวัติ Audit Log ได้" };
  }
}

// ----------------------------------------------------
// Action 2: Get Audit Log Statistics
// ----------------------------------------------------
export async function getAuditLogStatsAction(): Promise<ActionResult<any>> {
  try {
    const session = await requirePermission("AUDIT_LOG_VIEW");

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [totalToday, loginAttempts, pdpaAccesses, totalAllTime] = await Promise.all([
      prisma.auditLog.count({
        where: { timestamp: { gte: startOfDay } },
      }),
      prisma.auditLog.count({
        where: {
          action: { in: ["LOGIN", "LOGOUT"] },
          timestamp: { gte: startOfDay },
        },
      }),
      prisma.auditLog.count({
        where: {
          resourceType: { in: ["PATIENT", "VISIT", "CONSULTATION"] },
          timestamp: { gte: startOfDay },
        },
      }),
      prisma.auditLog.count(),
    ]);

    return {
      success: true,
      data: {
        totalToday,
        loginAttempts,
        pdpaAccesses,
        totalAllTime,
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message || "ไม่สามารถดึงสถิติ Audit Log ได้" };
  }
}
