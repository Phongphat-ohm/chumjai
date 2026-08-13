"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/server/permissions/guard";
import { dispenseSchema } from "@/schemas/pharmacy";
import {
  VisitStatus,
  QueueStatus,
  PrescriptionStatus,
  InventoryTransactionType,
} from "@prisma/client";

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// ----------------------------------------------------
// Action 1: Get Visits Waiting in Pharmacy Queue
// ----------------------------------------------------
export async function getPharmacyQueueVisitsAction(): Promise<ActionResult<any[]>> {
  try {
    const session = await requirePermission("DISPENSE_VIEW");

    const visits = await prisma.visit.findMany({
      where: {
        OR: [
          { status: { in: [VisitStatus.WAITING_PHARMACY, VisitStatus.DISPENSED, VisitStatus.COMPLETED] } },
          { prescription: { isNot: null } },
          { queues: { some: { queueType: { code: "PHARM" } } } },
        ],
      },
      orderBy: { updatedAt: "desc" },
      include: {
        patient: {
          include: {
            allergies: true,
          },
        },
        prescription: {
          include: {
            items: {
              include: { drug: true },
            },
            doctor: {
              select: { id: true, fullName: true },
            },
            dispense: {
              include: {
                pharmacist: {
                  select: { id: true, fullName: true },
                },
              },
            },
          },
        },
        consultation: {
          include: {
            soapNote: true,
            diagnoses: true,
          },
        },
        queues: {
          where: { queueType: { code: "PHARM" } },
          take: 1,
        },
      },
    });

    return { success: true, data: visits };
  } catch (error: any) {
    return { success: false, error: error.message || "ไม่สามารถดึงข้อมูลคิวห้องยาได้" };
  }
}

// ----------------------------------------------------
// Action 2: Dispense Prescription & Deduct FEFO Stock
// ----------------------------------------------------
export async function dispensePrescriptionAction(
  formData: Record<string, any>
): Promise<ActionResult<any>> {
  try {
    const session = await requirePermission("DISPENSE_CREATE");

    const validated = dispenseSchema.safeParse(formData);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.errors[0]?.message || "ข้อมูลจ่ายยาไม่ถูกต้อง",
      };
    }

    const { prescriptionId, visitId, notes } = validated.data;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Get Prescription & Items
      const prescription = await tx.prescription.findUnique({
        where: { id: prescriptionId },
        include: { items: true },
      });

      if (!prescription) {
        throw new Error("ไม่พบใบสั่งยาที่ระบุ");
      }

      if (prescription.status === PrescriptionStatus.DISPENSED) {
        throw new Error("ใบสั่งยานี้ได้รับการจ่ายยาเรียบร้อยแล้ว");
      }

      // 2. Loop each item and deduct stock using FEFO Strategy (expiredAt ASC)
      for (const item of prescription.items) {
        let remainingToDeduct = item.quantity;

        // Query active drug batches sorted by FEFO (expiredAt ASC)
        const batches = await tx.drugBatch.findMany({
          where: {
            drugId: item.drugId,
            quantity: { gt: 0 },
          },
          orderBy: { expiredAt: "asc" },
        });

        for (const batch of batches) {
          if (remainingToDeduct <= 0) break;

          const deductFromThisBatch = Math.min(batch.quantity, remainingToDeduct);
          remainingToDeduct -= deductFromThisBatch;

          // Deduct batch quantity
          await tx.drugBatch.update({
            where: { id: batch.id },
            data: { quantity: batch.quantity - deductFromThisBatch },
          });
        }

        // Deduct Drug totalStock
        await tx.drug.update({
          where: { id: item.drugId },
          data: {
            totalStock: { decrement: item.quantity },
          },
        });

        // Record InventoryTransaction (DISPENSED)
        await tx.inventoryTransaction.create({
          data: {
            drugId: item.drugId,
            type: InventoryTransactionType.DISPENSED,
            quantity: -item.quantity,
            notes: `จ่ายยาให้ Visit: ${visitId}`,
            createdById: session.userId,
          },
        });
      }

      // 3. Create Dispensation Record
      const dispensation = await tx.dispensation.create({
        data: {
          visitId,
          prescriptionId,
          pharmacistId: session.userId,
          notes: notes || null,
        },
      });

      // 4. Update Prescription Status to DISPENSED
      await tx.prescription.update({
        where: { id: prescriptionId },
        data: { status: PrescriptionStatus.DISPENSED },
      });

      // 5. Complete Pharmacy Queue (PHARM)
      const pharmQueue = await tx.queue.findFirst({
        where: {
          visitId,
          queueType: { code: "PHARM" },
          status: { in: [QueueStatus.WAITING, QueueStatus.CALLED, QueueStatus.SERVING] },
        },
      });

      if (pharmQueue) {
        await tx.queue.update({
          where: { id: pharmQueue.id },
          data: { status: QueueStatus.COMPLETED, completedAt: new Date() },
        });
      }

      // 6. Update Visit Status to COMPLETED (Lifecycle complete!)
      await tx.visit.update({
        where: { id: visitId },
        data: { status: VisitStatus.COMPLETED },
      });

      return dispensation;
    });

    // Record Audit Log (DRUG_DISPENSED)
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: "DRUG_DISPENSED",
        resourceType: "PRESCRIPTION",
        resourceId: prescriptionId,
        success: true,
      },
    });

    revalidatePath("/pharmacy");
    revalidatePath("/queue");
    revalidatePath("/patient");
    return { success: true, data: result };
  } catch (error: any) {
    console.error("Error in dispensePrescriptionAction:", error);
    return { success: false, error: error.message || "ไม่สามารถดำเนินการจ่ายยาได้" };
  }
}
