"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/server/permissions/guard";
import { triageRecordSchema } from "@/schemas/triage";
import { TriageUrgency, VisitStatus, QueueType, QueueStatus } from "@/generated/client";

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// ----------------------------------------------------
// Helper: Calculate BMI on Server (Section 40)
// ----------------------------------------------------
export async function calculateBmiServer(weightKg?: number, heightCm?: number): Promise<number | null> {
  if (!weightKg || !heightCm || heightCm <= 0) return null;
  const heightMeters = heightCm / 100;
  const bmi = weightKg / (heightMeters * heightMeters);
  return parseFloat(bmi.toFixed(2));
}

// ----------------------------------------------------
// Action 1: Save Triage & Vital Signs Record
// ----------------------------------------------------
export async function saveTriageRecordAction(
  formData: Record<string, any>
): Promise<ActionResult<any>> {
  try {
    const session = await requirePermission("TRIAGE_CREATE");

    const validated = triageRecordSchema.safeParse(formData);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.errors[0]?.message || "ข้อมูลคัดกรองไม่ถูกต้อง",
      };
    }

    const data = validated.data;

    // Calculate BMI on Server
    const calculatedBmi = await calculateBmiServer(data.weightKg, data.heightCm);

    // DB Transaction for Triage Record, Vital Signs, Visit Status, & Doctor Queue
    const result = await prisma.$transaction(async (tx) => {
      // 1. Save Vital Signs
      const vitalSign = await tx.vitalSign.create({
        data: {
          visitId: data.visitId,
          weightKg: data.weightKg || null,
          heightCm: data.heightCm || null,
          bmi: calculatedBmi,
          temperatureC: data.temperatureC || null,
          systolicBp: data.systolicBp || null,
          diastolicBp: data.diastolicBp || null,
          pulseRate: data.pulseRate || null,
          respiratoryRate: data.respiratoryRate || null,
          spo2Percent: data.spo2Percent || null,
          bloodGlucoseMgDl: data.bloodGlucoseMgDl || null,
          painScore: data.painScore || null,
        },
      });

      // 2. Save Triage Record (or update if already exists)
      const triageRecord = await tx.triageRecord.upsert({
        where: { visitId: data.visitId },
        update: {
          urgency: data.urgency,
          triageNote: data.triageNote || null,
          recordedById: session.userId,
        },
        create: {
          visitId: data.visitId,
          urgency: data.urgency,
          triageNote: data.triageNote || null,
          recordedById: session.userId,
        },
      });

      // 3. Update Visit status to WAITING_DOCTOR / TRIAGED
      await tx.visit.update({
        where: { id: data.visitId },
        data: { status: VisitStatus.WAITING_DOCTOR },
      });

      // 4. Complete current Triage Queue
      const currentTriageQueue = await tx.queue.findFirst({
        where: {
          visitId: data.visitId,
          status: { in: [QueueStatus.WAITING, QueueStatus.CALLED, QueueStatus.SERVING] },
        },
      });

      if (currentTriageQueue) {
        await tx.queue.update({
          where: { id: currentTriageQueue.id },
          data: { status: QueueStatus.COMPLETED, completedAt: new Date() },
        });
      }

      // 5. Auto Create Doctor Queue (DOC)
      const docType = await tx.queueType.findUnique({
        where: { code: "DOC" },
      });

      if (docType) {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const countTodayDoc = await tx.queue.count({
          where: {
            queueTypeId: docType.id,
            createdAt: { gte: startOfDay },
          },
        });

        const docQueueNumber = `${docType.prefix}${(countTodayDoc + 1).toString().padStart(3, "0")}`;

        await tx.queue.create({
          data: {
            queueNumber: docQueueNumber,
            queueTypeId: docType.id,
            visitId: data.visitId,
            status: QueueStatus.WAITING,
          },
        });
      }

      return { vitalSign, triageRecord };
    });

    // Record Audit Log (TRIAGE_RECORDED)
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: "TRIAGE_RECORDED",
        resourceType: "VISIT",
        resourceId: data.visitId,
        success: true,
      },
    });

    revalidatePath("/triage");
    revalidatePath("/queue");
    revalidatePath("/doctor");
    return { success: true, data: result };
  } catch (error: any) {
    console.error("Error in saveTriageRecordAction:", error);
    return { success: false, error: error.message || "ไม่สามารถบันทึกข้อมูลคัดกรองได้" };
  }
}

// ----------------------------------------------------
// Action 2: Get Visits Waiting for Triage
// ----------------------------------------------------
export async function getWaitingTriageVisitsAction(): Promise<ActionResult<any[]>> {
  try {
    const session = await requirePermission("TRIAGE_VIEW");

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const visits = await prisma.visit.findMany({
      where: {
        createdAt: { gte: startOfDay },
        status: { in: [VisitStatus.REGISTERED, VisitStatus.WAITING_TRIAGE] },
      },
      orderBy: { createdAt: "asc" },
      include: {
        patient: {
          select: {
            id: true,
            hn: true,
            firstName: true,
            lastName: true,
            dateOfBirth: true,
            gender: true,
            phoneNumber: true,
            allergies: true,
          },
        },
        queues: {
          take: 1,
          orderBy: { createdAt: "desc" },
        },
      },
    });

    return { success: true, data: visits };
  } catch (error: any) {
    return { success: false, error: error.message || "เกิดข้อผิดพลาดในการดึงรายการผู้ป่วยรอคัดกรอง" };
  }
}
