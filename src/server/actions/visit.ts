"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/server/permissions/guard";
import { createVisitSchema, updateVisitStatusSchema } from "@/schemas/visit";
import { VisitStatus, QueueStatus } from "@prisma/client";

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// ----------------------------------------------------
// Helper: Auto Generate Visit Number (VYYYYMMDD-XXXX)
// ----------------------------------------------------
async function generateVisitNumber(): Promise<string> {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const day = now.getDate().toString().padStart(2, "0");
  const dateStr = `${year}${month}${day}`;
  const prefix = `V${dateStr}-`;

  const startOfDay = new Date(year, now.getMonth(), now.getDate(), 0, 0, 0);
  const endOfDay = new Date(year, now.getMonth(), now.getDate(), 23, 59, 59);

  const countToday = await prisma.visit.count({
    where: {
      createdAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
  });

  const nextSeq = (countToday + 1).toString().padStart(4, "0");
  return `${prefix}${nextSeq}`;
}

// ----------------------------------------------------
// Action 1: Create New Visit
// ----------------------------------------------------
export async function createVisitAction(formData: Record<string, any>): Promise<ActionResult<any>> {
  try {
    const session = await requirePermission("VISIT_CREATE");

    const validated = createVisitSchema.safeParse(formData);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.errors[0]?.message || "ข้อมูลเปิด Visit ไม่ถูกต้อง",
      };
    }

    const { patientId, chiefComplaint } = validated.data;

    // Check if patient exists
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
    });
    if (!patient || patient.isDeleted) {
      return { success: false, error: "ไม่พบข้อมูลผู้ป่วยในระบบ" };
    }

    // Check if patient already has an active incomplete visit today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const existingActiveVisit = await prisma.visit.findFirst({
      where: {
        patientId,
        createdAt: { gte: startOfDay },
        status: {
          notIn: [VisitStatus.COMPLETED, VisitStatus.CANCELLED],
        },
      },
    });

    if (existingActiveVisit) {
      return {
        success: false,
        error: `ผู้ป่วยรายนี้มี Visit ที่กำลังรับบริการอยู่แล้ว (${existingActiveVisit.visitNumber})`,
      };
    }

    const visitNumber = await generateVisitNumber();

    // Create Visit & Initial Triage Queue in DB Transaction
    const visit = await prisma.$transaction(async (tx) => {
      const newVisit = await tx.visit.create({
        data: {
          visitNumber,
          patientId,
          chiefComplaint,
          status: VisitStatus.WAITING_TRIAGE,
          createdById: session.userId,
        },
      });

      // Find Triage Queue Type
      const triageQueueType = await tx.queueType.findUnique({
        where: { code: "TRIAGE" },
      });

      if (triageQueueType) {
        const queueCount = await tx.queue.count({
          where: {
            queueTypeId: triageQueueType.id,
            createdAt: { gte: startOfDay },
          },
        });

        const queueNum = `${triageQueueType.prefix}${(queueCount + 1).toString().padStart(3, "0")}`;

        await tx.queue.create({
          data: {
            queueNumber: queueNum,
            queueTypeId: triageQueueType.id,
            visitId: newVisit.id,
            status: QueueStatus.WAITING,
          },
        });
      }

      return newVisit;
    });

    // Record Audit Log (VISIT_CREATED)
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: "VISIT_CREATED",
        resourceType: "VISIT",
        resourceId: visit.id,
        success: true,
      },
    });

    revalidatePath("/registration");
    revalidatePath("/queue");
    return { success: true, data: visit };
  } catch (error: any) {
    console.error("Error in createVisitAction:", error);
    return { success: false, error: error.message || "ไม่สามารถเปิด Visit ได้" };
  }
}

// ----------------------------------------------------
// Action 2: Get Active Visits Today
// ----------------------------------------------------
export async function getVisitsAction(params?: {
  status?: VisitStatus;
  limit?: number;
}): Promise<ActionResult<any[]>> {
  try {
    const session = await requirePermission("VISIT_VIEW");

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const where: any = {
      createdAt: { gte: startOfDay },
    };

    if (params?.status) {
      where.status = params.status;
    }

    const visits = await prisma.visit.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: params?.limit || 50,
      include: {
        patient: {
          select: {
            id: true,
            hn: true,
            firstName: true,
            lastName: true,
            nationalId: true,
            phoneNumber: true,
            rightsType: true,
            allergies: true,
          },
        },
        triageRecord: true,
        queues: {
          take: 1,
          orderBy: { createdAt: "desc" },
        },
      },
    });

    // Audit Log (VISIT_VIEWED)
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: "VISIT_VIEWED",
        resourceType: "VISIT",
        success: true,
      },
    });

    return { success: true, data: visits };
  } catch (error: any) {
    return { success: false, error: error.message || "เกิดข้อผิดพลาดในการดึงรายการ Visit" };
  }
}

// ----------------------------------------------------
// Action 3: Update Visit Status
// ----------------------------------------------------
export async function updateVisitStatusAction(
  visitId: string,
  newStatus: VisitStatus
): Promise<ActionResult<any>> {
  try {
    const session = await requirePermission("VISIT_UPDATE");

    const visit = await prisma.visit.update({
      where: { id: visitId },
      data: { status: newStatus },
    });

    // Audit Log (VISIT_UPDATED)
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: "VISIT_UPDATED",
        resourceType: "VISIT",
        resourceId: visitId,
        success: true,
      },
    });

    revalidatePath("/registration");
    revalidatePath("/queue");
    return { success: true, data: visit };
  } catch (error: any) {
    return { success: false, error: error.message || "ไม่สามารถเปลี่ยนสถานะ Visit ได้" };
  }
}
