"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/server/permissions/guard";
import { soapNoteSchema } from "@/schemas/doctor";
import { VisitStatus, QueueStatus, DiagnosisType } from "@/generated/client";

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// ----------------------------------------------------
// Action 1: Start Doctor Consultation
// ----------------------------------------------------
export async function startConsultationAction(visitId: string): Promise<ActionResult<any>> {
  try {
    const session = await requirePermission("CONSULTATION_CREATE");

    const consultation = await prisma.$transaction(async (tx) => {
      // 1. Create or get Consultation record
      const consult = await tx.consultation.upsert({
        where: { visitId },
        update: {
          doctorId: session.userId,
          startTime: new Date(),
        },
        create: {
          visitId,
          doctorId: session.userId,
          startTime: new Date(),
        },
      });

      // 2. Update Visit Status to IN_CONSULTATION
      await tx.visit.update({
        where: { id: visitId },
        data: { status: VisitStatus.IN_CONSULTATION },
      });

      // 3. Update Doctor Queue to SERVING
      const docQueue = await tx.queue.findFirst({
        where: {
          visitId,
          queueType: { code: "DOC" },
          status: { in: [QueueStatus.WAITING, QueueStatus.CALLED] },
        },
      });

      if (docQueue) {
        await tx.queue.update({
          where: { id: docQueue.id },
          data: { status: QueueStatus.SERVING, servedAt: new Date() },
        });
      }

      return consult;
    });

    // Record Audit Log
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: "CONSULTATION_STARTED",
        resourceType: "VISIT",
        resourceId: visitId,
        success: true,
      },
    });

    revalidatePath("/doctor");
    revalidatePath("/queue");
    return { success: true, data: consultation };
  } catch (error: any) {
    console.error("Error in startConsultationAction:", error);
    return { success: false, error: error.message || "ไม่สามารถเริ่มการตรวจรักษาได้" };
  }
}

// ----------------------------------------------------
// Action 2: Save SOAP Note & ICD-10 Diagnosis
// ----------------------------------------------------
export async function saveSoapAndDiagnosisAction(
  formData: Record<string, any>
): Promise<ActionResult<any>> {
  try {
    const session = await requirePermission("SOAP_CREATE");

    const validated = soapNoteSchema.safeParse(formData);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.errors[0]?.message || "ข้อมูล SOAP หรือ ICD-10 ไม่ถูกต้อง",
      };
    }

    const { visitId, subjective, objective, assessment, plan, diagnoses } = validated.data;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Ensure Consultation Record exists
      const consultation = await tx.consultation.upsert({
        where: { visitId },
        update: { doctorId: session.userId, endTime: new Date() },
        create: { visitId, doctorId: session.userId, endTime: new Date() },
      });

      // 2. Save / Update SOAP Note
      const soapNote = await tx.soapNote.upsert({
        where: { consultationId: consultation.id },
        update: { subjective, objective, assessment, plan },
        create: { consultationId: consultation.id, subjective, objective, assessment, plan },
      });

      // 3. Clear & Save ICD-10 Diagnoses
      await tx.diagnosis.deleteMany({
        where: { consultationId: consultation.id },
      });

      await tx.diagnosis.createMany({
        data: diagnoses.map((d) => ({
          consultationId: consultation.id,
          icd10Code: d.icd10Code,
          icd10Name: d.icd10Name,
          type: d.type as DiagnosisType,
          notes: d.notes || null,
        })),
      });

      // 4. Update Visit status to WAITING_PHARMACY
      await tx.visit.update({
        where: { id: visitId },
        data: { status: VisitStatus.WAITING_PHARMACY },
      });

      // 5. Complete Doctor Queue
      const docQueue = await tx.queue.findFirst({
        where: {
          visitId,
          queueType: { code: "DOC" },
          status: { in: [QueueStatus.WAITING, QueueStatus.CALLED, QueueStatus.SERVING] },
        },
      });

      if (docQueue) {
        await tx.queue.update({
          where: { id: docQueue.id },
          data: { status: QueueStatus.COMPLETED, completedAt: new Date() },
        });
      }

      // 6. Auto Create Pharmacy Queue (PHARM prefix P)
      const pharmType = await tx.queueType.findUnique({
        where: { code: "PHARM" },
      });

      if (pharmType) {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const countTodayPharm = await tx.queue.count({
          where: {
            queueTypeId: pharmType.id,
            createdAt: { gte: startOfDay },
          },
        });

        const pharmQueueNumber = `${pharmType.prefix}${(countTodayPharm + 1).toString().padStart(3, "0")}`;

        await tx.queue.create({
          data: {
            queueNumber: pharmQueueNumber,
            queueTypeId: pharmType.id,
            visitId,
            status: QueueStatus.WAITING,
          },
        });
      }

      return { consultation, soapNote };
    });

    // Record Audit Log (SOAP_CREATED & DIAGNOSIS_CREATED)
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: "SOAP_CREATED",
        resourceType: "VISIT",
        resourceId: visitId,
        success: true,
      },
    });

    revalidatePath("/doctor");
    revalidatePath("/queue");
    revalidatePath("/pharmacy");
    return { success: true, data: result };
  } catch (error: any) {
    console.error("Error in saveSoapAndDiagnosisAction:", error);
    return { success: false, error: error.message || "ไม่สามารถบันทึกผลการตรวจรักษาได้" };
  }
}

// ----------------------------------------------------
// Action 3: Get Visits Waiting for Doctor
// ----------------------------------------------------
export async function getDoctorQueueVisitsAction(): Promise<ActionResult<any[]>> {
  try {
    const session = await requirePermission("CONSULTATION_VIEW");

    const visits = await prisma.visit.findMany({
      where: {
        status: {
          in: [
            VisitStatus.WAITING_DOCTOR,
            VisitStatus.IN_CONSULTATION,
            VisitStatus.TRIAGED,
            VisitStatus.WAITING_TRIAGE,
            VisitStatus.REGISTERED,
          ],
        },
      },
      orderBy: { createdAt: "asc" },
      include: {
        patient: {
          include: {
            allergies: true,
            conditions: true,
            medications: true,
          },
        },
        triageRecord: true,
        vitalSigns: {
          take: 1,
          orderBy: { createdAt: "desc" },
        },
        queues: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        consultation: {
          include: {
            soapNote: true,
            diagnoses: true,
          },
        },
        labOrders: {
          orderBy: { createdAt: "desc" },
          include: {
            results: true,
          },
        },
      },
    });

    return { success: true, data: visits };
  } catch (error: any) {
    console.error("Error in getDoctorQueueVisitsAction:", error);
    return { success: false, error: error.message || "เกิดข้อผิดพลาดในการดึงรายการผู้ป่วยห้องตรวจ" };
  }
}
