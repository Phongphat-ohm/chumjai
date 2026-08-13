"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/server/permissions/guard";
import { prescriptionSchema } from "@/schemas/prescription";
import { PrescriptionStatus } from "@prisma/client";

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// ----------------------------------------------------
// Action 1: Get Active Drugs in Inventory
// ----------------------------------------------------
export async function getAvailableDrugsAction(search?: string): Promise<ActionResult<any[]>> {
  try {
    await requirePermission("DRUG_VIEW");

    const where: any = { isActive: true };
    if (search?.trim()) {
      const q = search.trim();
      where.OR = [
        { code: { contains: q, mode: "insensitive" } },
        { genericName: { contains: q, mode: "insensitive" } },
        { tradeName: { contains: q, mode: "insensitive" } },
      ];
    }

    const drugs = await prisma.drug.findMany({
      where,
      orderBy: { genericName: "asc" },
      take: 50,
    });

    return { success: true, data: drugs };
  } catch (error: any) {
    return { success: false, error: error.message || "ไม่สามารถดึงข้อมูลคลังยาได้" };
  }
}

// ----------------------------------------------------
// Action 2: Save Prescription (Prisma Transaction)
// ----------------------------------------------------
export async function savePrescriptionAction(
  formData: Record<string, any>
): Promise<ActionResult<any>> {
  try {
    const session = await requirePermission("PRESCRIPTION_CREATE");

    const validated = prescriptionSchema.safeParse(formData);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.errors[0]?.message || "ข้อมูลใบสั่งยาไม่ถูกต้อง",
      };
    }

    const { visitId, notes, items } = validated.data;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Delete existing draft prescription if any
      const existing = await tx.prescription.findUnique({
        where: { visitId },
      });

      if (existing) {
        await tx.prescriptionItem.deleteMany({
          where: { prescriptionId: existing.id },
        });
        await tx.prescription.delete({
          where: { id: existing.id },
        });
      }

      // 2. Create Prescription
      const prescription = await tx.prescription.create({
        data: {
          visitId,
          doctorId: session.userId,
          status: PrescriptionStatus.PENDING,
          notes: notes || null,
        },
      });

      // 3. Create PrescriptionItems
      await tx.prescriptionItem.createMany({
        data: items.map((item) => ({
          prescriptionId: prescription.id,
          drugId: item.drugId,
          quantity: item.quantity,
          dosage: item.dosage,
          frequency: item.frequency,
          instruction: item.instruction || null,
        })),
      });

      return prescription;
    });

    // Record Audit Log (PRESCRIPTION_CREATED)
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: "PRESCRIPTION_CREATED",
        resourceType: "PRESCRIPTION",
        resourceId: result.id,
        success: true,
      },
    });

    revalidatePath("/doctor");
    revalidatePath("/pharmacy");
    return { success: true, data: result };
  } catch (error: any) {
    console.error("Error in savePrescriptionAction:", error);
    return { success: false, error: error.message || "ไม่สามารถบันทึกใบสั่งยาได้" };
  }
}

// ----------------------------------------------------
// Action 3: Get Prescription by Visit ID
// ----------------------------------------------------
export async function getPrescriptionByVisitAction(visitId: string): Promise<ActionResult<any>> {
  try {
    await requirePermission("PRESCRIPTION_VIEW");

    const prescription = await prisma.prescription.findUnique({
      where: { visitId },
      include: {
        items: {
          include: { drug: true },
        },
        doctor: {
          select: { id: true, fullName: true },
        },
      },
    });

    return { success: true, data: prescription };
  } catch (error: any) {
    return { success: false, error: error.message || "ไม่สามารถดึงข้อมูลใบสั่งยาได้" };
  }
}
