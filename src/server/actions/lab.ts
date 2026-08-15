"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/server/permissions/guard";
import { createLabOrderSchema, recordLabResultSchema } from "@/schemas/lab";
import { LabOrderStatus, QueueStatus, VisitStatus } from "@/generated/client";

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// ----------------------------------------------------
// Action 1: Get Lab Orders (Status / Patient / Visit)
// ----------------------------------------------------
export async function getLabOrdersAction(params?: {
  status?: LabOrderStatus;
  patientId?: string;
  visitId?: string;
}): Promise<ActionResult<any[]>> {
  try {
    await requireAuth();

    const where: any = {};
    if (params?.status) {
      where.status = params.status;
    }
    if (params?.patientId) {
      where.patientId = params.patientId;
    }
    if (params?.visitId) {
      where.visitId = params.visitId;
    }

    const orders = await prisma.labOrder.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        patient: {
          select: {
            id: true,
            hn: true,
            firstName: true,
            lastName: true,
            gender: true,
            dateOfBirth: true,
          },
        },
        visit: {
          select: {
            id: true,
            visitNumber: true,
            status: true,
          },
        },
        results: true,
      },
    });

    return { success: true, data: orders };
  } catch (error: any) {
    return { success: false, error: error.message || "ไม่สามารถดึงข้อมูลรายการแล็บได้" };
  }
}

// ----------------------------------------------------
// Action 2: Create Lab Order
// ----------------------------------------------------
export async function createLabOrderAction(
  formData: Record<string, any>
): Promise<ActionResult<any>> {
  try {
    const session = await requireAuth();

    const validated = createLabOrderSchema.safeParse(formData);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.errors[0]?.message || "ข้อมูลการสั่งแล็บไม่ถูกต้อง",
      };
    }

    const { patientId, visitId, testName, notes } = validated.data;

    const order = await prisma.labOrder.create({
      data: {
        patientId,
        visitId,
        testName,
        notes: notes || null,
        status: LabOrderStatus.ORDERED,
      },
      include: {
        patient: true,
        visit: true,
      },
    });

    // Record Audit Log (LAB_ORDER_CREATED)
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: "LAB_ORDER_CREATED",
        resourceType: "LAB_ORDER",
        resourceId: order.id,
        success: true,
      },
    });

    revalidatePath("/lab");
    revalidatePath("/doctor");
    return { success: true, data: order };
  } catch (error: any) {
    return { success: false, error: error.message || "ไม่สามารถสร้างใบสั่งตรวจแล็บได้" };
  }
}

// ----------------------------------------------------
// Action 3: Record Lab Test Results & Mark Completed
// ----------------------------------------------------
export async function recordLabResultAction(
  formData: Record<string, any>
): Promise<ActionResult<any>> {
  try {
    const session = await requireAuth();

    const validated = recordLabResultSchema.safeParse(formData);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.errors[0]?.message || "ข้อมูลผลแล็บไม่ถูกต้อง",
      };
    }

    const { labOrderId, results } = validated.data;

    const updatedOrder = await prisma.$transaction(async (tx) => {
      // 1. Clear existing results if any
      await tx.labResult.deleteMany({
        where: { labOrderId },
      });

      // 2. Create LabResults
      await tx.labResult.createMany({
        data: results.map((r) => ({
          labOrderId,
          paramName: r.paramName,
          value: r.value,
          unit: r.unit || null,
          normalRange: r.normalRange || null,
          isAbnormal: r.isAbnormal || false,
        })),
      });

      // 3. Mark LabOrder Status as COMPLETED
      const order = await tx.labOrder.update({
        where: { id: labOrderId },
        data: { status: LabOrderStatus.COMPLETED },
        include: {
          patient: true,
          visit: true,
          results: true,
        },
      });

      // 4. Check if all lab orders for this visit are completed
      const remainingPendingOrders = await tx.labOrder.count({
        where: {
          visitId: order.visitId,
          status: {
            in: [LabOrderStatus.ORDERED, LabOrderStatus.COLLECTED],
          },
        },
      });

      // 5. If all lab orders are completed -> Auto-Resume Doctor Queue!
      if (remainingPendingOrders === 0) {
        // Ensure Visit status is WAITING_DOCTOR
        await tx.visit.update({
          where: { id: order.visitId },
          data: { status: VisitStatus.WAITING_DOCTOR },
        });

        // Find doctor queue for this visit
        const docQueue = await tx.queue.findFirst({
          where: {
            visitId: order.visitId,
            queueType: { code: "DOC" },
          },
        });

        if (docQueue) {
          // If queue was SKIPPED / on hold, resume to WAITING and bump priority
          await tx.queue.update({
            where: { id: docQueue.id },
            data: {
              status: QueueStatus.WAITING,
              calledAt: null,
              updatedAt: new Date(),
            },
          });
        }
      }

      return { order, allCompleted: remainingPendingOrders === 0 };
    });

    // Record Audit Log (LAB_RESULT_RECORDED & AUTO_RESUME)
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: updatedOrder.allCompleted ? "LAB_RESULT_RECORDED_AND_AUTO_RESUMED" : "LAB_RESULT_RECORDED",
        resourceType: "LAB_ORDER",
        resourceId: labOrderId,
        success: true,
      },
    });

    revalidatePath("/lab");
    revalidatePath("/doctor");
    revalidatePath("/queue");
    revalidatePath("/queue/display");
    return { success: true, data: updatedOrder.order };
  } catch (error: any) {
    return { success: false, error: error.message || "ไม่สามารถบันทึกผลแล็บได้" };
  }
}
