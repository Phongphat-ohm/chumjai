"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth, requirePermission } from "@/server/permissions/guard";
import { callQueueSchema, updateQueueStatusSchema, transferQueueSchema } from "@/schemas/queue";
import { QueueStatus, VisitStatus } from "@prisma/client";

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// ----------------------------------------------------
// Action 1: Get Today Queues (Filter by Queue Type & Status)
// ----------------------------------------------------
export async function getQueuesAction(params?: {
  typeCode?: string; // REG, TRIAGE, DOC, PHARM, VAC
  status?: QueueStatus;
  limit?: number;
}): Promise<ActionResult<any[]>> {
  try {
    await requireAuth();

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const where: any = {
      createdAt: { gte: startOfDay },
    };

    if (params?.typeCode) {
      const queueType = await prisma.queueType.findUnique({
        where: { code: params.typeCode },
      });
      if (queueType) {
        where.queueTypeId = queueType.id;
      }
    }

    if (params?.status) {
      where.status = params.status;
    }

    const queues = await prisma.queue.findMany({
      where,
      orderBy: [
        { status: "asc" },
        { createdAt: "asc" },
      ],
      take: params?.limit || 100,
      include: {
        queueType: true,
        visit: {
          include: {
            patient: {
              select: {
                id: true,
                hn: true,
                firstName: true,
                lastName: true,
                gender: true,
                rightsType: true,
                allergies: true,
              },
            },
            triageRecord: true,
          },
        },
      },
    });

    return { success: true, data: queues };
  } catch (error: any) {
    return { success: false, error: error.message || "ไม่สามารถดึงข้อมูลคิวได้" };
  }
}

// ----------------------------------------------------
// Action 2: Call Next Queue / Call Specific Queue
// ----------------------------------------------------
export async function callQueueAction(queueId: string): Promise<ActionResult<any>> {
  try {
    const session = await requireAuth();

    const queue = await prisma.queue.update({
      where: { id: queueId },
      data: {
        status: QueueStatus.CALLED,
        calledAt: new Date(),
      },
      include: {
        queueType: true,
        visit: {
          include: { patient: true },
        },
      },
    });

    // Record Audit Log
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: "QUEUE_CALLED",
        resourceType: "QUEUE",
        resourceId: queueId,
        success: true,
      },
    });

    revalidatePath("/queue");
    revalidatePath("/queue/display");
    return { success: true, data: queue };
  } catch (error: any) {
    return { success: false, error: error.message || "ไม่สามารถเรียกคิวได้" };
  }
}

// ----------------------------------------------------
// Action 3: Update Queue Status (SERVING, COMPLETED, SKIPPED)
// ----------------------------------------------------
export async function updateQueueStatusAction(
  queueId: string,
  newStatus: QueueStatus
): Promise<ActionResult<any>> {
  try {
    const session = await requireAuth();

    const updateData: any = { status: newStatus };
    if (newStatus === QueueStatus.SERVING) {
      updateData.servedAt = new Date();
    } else if (newStatus === QueueStatus.COMPLETED) {
      updateData.completedAt = new Date();
    }

    const queue = await prisma.queue.update({
      where: { id: queueId },
      data: updateData,
    });

    // Record Audit Log
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: `QUEUE_STATUS_${newStatus}`,
        resourceType: "QUEUE",
        resourceId: queueId,
        success: true,
      },
    });

    revalidatePath("/queue");
    revalidatePath("/queue/display");
    return { success: true, data: queue };
  } catch (error: any) {
    return { success: false, error: error.message || "ไม่สามารถอัปเดตสถานะคิวได้" };
  }
}

// ----------------------------------------------------
// Action 4: Transfer Visit to Next Queue Type
// ----------------------------------------------------
export async function transferQueueAction(
  visitId: string,
  targetQueueTypeCode: string,
  newVisitStatus?: VisitStatus
): Promise<ActionResult<any>> {
  try {
    const session = await requireAuth();

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const targetType = await prisma.queueType.findUnique({
      where: { code: targetQueueTypeCode },
    });

    if (!targetType) {
      return { success: false, error: "ไม่พบประเภทคิวปลายทาง" };
    }

    const nextQueue = await prisma.$transaction(async (tx) => {
      // Update Visit Status if provided
      if (newVisitStatus) {
        await tx.visit.update({
          where: { id: visitId },
          data: { status: newVisitStatus },
        });
      }

      // Count existing queues today for target queue type
      const countToday = await tx.queue.count({
        where: {
          queueTypeId: targetType.id,
          createdAt: { gte: startOfDay },
        },
      });

      const queueNumber = `${targetType.prefix}${(countToday + 1).toString().padStart(3, "0")}`;

      return tx.queue.create({
        data: {
          queueNumber,
          queueTypeId: targetType.id,
          visitId,
          status: QueueStatus.WAITING,
        },
      });
    });

    // Record Audit Log
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: "QUEUE_TRANSFERRED",
        resourceType: "QUEUE",
        resourceId: nextQueue.id,
        success: true,
      },
    });

    revalidatePath("/queue");
    revalidatePath("/queue/display");
    return { success: true, data: nextQueue };
  } catch (error: any) {
    return { success: false, error: error.message || "ไม่สามารถย้ายคิวได้" };
  }
}
