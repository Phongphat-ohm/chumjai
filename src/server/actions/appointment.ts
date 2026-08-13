"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/server/permissions/guard";
import { createAppointmentSchema, updateAppointmentStatusSchema } from "@/schemas/appointment";
import { AppointmentStatus, VisitStatus, QueueStatus } from "@/generated/client";

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// ----------------------------------------------------
// Action 1: Get Appointments (Date Range & Status)
// ----------------------------------------------------
export async function getAppointmentsAction(params?: {
  date?: string;
  status?: AppointmentStatus;
  patientId?: string;
}): Promise<ActionResult<any[]>> {
  try {
    await requirePermission("APPOINTMENT_VIEW");

    const where: any = {};

    if (params?.date) {
      const start = new Date(params.date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(params.date);
      end.setHours(23, 59, 59, 999);
      where.appointmentDate = { gte: start, lte: end };
    }

    if (params?.status) {
      where.status = params.status;
    }

    if (params?.patientId) {
      where.patientId = params.patientId;
    }

    const appointments = await prisma.appointment.findMany({
      where,
      orderBy: { appointmentDate: "asc" },
      include: {
        patient: {
          select: {
            id: true,
            hn: true,
            firstName: true,
            lastName: true,
            phoneNumber: true,
            rightsType: true,
            allergies: true,
          },
        },
      },
    });

    return { success: true, data: appointments };
  } catch (error: any) {
    return { success: false, error: error.message || "ไม่สามารถดึงข้อมูลนัดหมายได้" };
  }
}

// ----------------------------------------------------
// Action 2: Create Appointment
// ----------------------------------------------------
export async function createAppointmentAction(
  formData: Record<string, any>
): Promise<ActionResult<any>> {
  try {
    const session = await requirePermission("APPOINTMENT_CREATE");

    const validated = createAppointmentSchema.safeParse(formData);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.errors[0]?.message || "ข้อมูลนัดหมายไม่ถูกต้อง",
      };
    }

    const { patientId, appointmentDate, reason, notes } = validated.data;

    const appointment = await prisma.appointment.create({
      data: {
        patientId,
        appointmentDate: new Date(appointmentDate),
        reason,
        notes: notes || null,
        status: AppointmentStatus.SCHEDULED,
      },
      include: {
        patient: true,
      },
    });

    // Record Audit Log (APPOINTMENT_CREATED)
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: "APPOINTMENT_CREATED",
        resourceType: "APPOINTMENT",
        resourceId: appointment.id,
        success: true,
      },
    });

    revalidatePath("/appointment");
    return { success: true, data: appointment };
  } catch (error: any) {
    return { success: false, error: error.message || "ไม่สามารถสร้างใบนัดหมายได้" };
  }
}

// ----------------------------------------------------
// Action 3: Update Appointment Status & Optional Check-in
// ----------------------------------------------------
export async function updateAppointmentStatusAction(
  appointmentId: string,
  newStatus: AppointmentStatus,
  autoCreateVisit: boolean = false
): Promise<ActionResult<any>> {
  try {
    const session = await requirePermission("APPOINTMENT_UPDATE");

    const result = await prisma.$transaction(async (tx) => {
      // 1. Update Appointment Status
      const appointment = await tx.appointment.update({
        where: { id: appointmentId },
        data: { status: newStatus },
        include: { patient: true },
      });

      // 2. If status is ARRIVED and autoCreateVisit requested
      if (newStatus === AppointmentStatus.ARRIVED && autoCreateVisit) {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        // Auto Visit Number
        const countTodayVisits = await tx.visit.count({
          where: { createdAt: { gte: startOfDay } },
        });
        const dateStr = startOfDay.toISOString().slice(0, 10).replace(/-/g, "");
        const visitNumber = `V${dateStr}-${(countTodayVisits + 1).toString().padStart(4, "0")}`;

        // Create Visit
        const visit = await tx.visit.create({
          data: {
            visitNumber,
            patientId: appointment.patientId,
            chiefComplaint: `มาตามนัดหมาย: ${appointment.reason || "ตรวจติดตาม"}`,
            status: VisitStatus.WAITING_TRIAGE,
            createdById: session.userId,
          },
        });

        // Create Triage Queue
        const triageType = await tx.queueType.findUnique({
          where: { code: "TRIAGE" },
        });

        if (triageType) {
          const countTodayTriage = await tx.queue.count({
            where: {
              queueTypeId: triageType.id,
              createdAt: { gte: startOfDay },
            },
          });
          const queueNumber = `${triageType.prefix}${(countTodayTriage + 1).toString().padStart(3, "0")}`;

          await tx.queue.create({
            data: {
              queueNumber,
              queueTypeId: triageType.id,
              visitId: visit.id,
              status: QueueStatus.WAITING,
            },
          });
        }
      }

      return appointment;
    });

    // Record Audit Log (APPOINTMENT_UPDATED)
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: `APPOINTMENT_STATUS_${newStatus}`,
        resourceType: "APPOINTMENT",
        resourceId: appointmentId,
        success: true,
      },
    });

    revalidatePath("/appointment");
    revalidatePath("/registration");
    revalidatePath("/queue");
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message || "ไม่สามารถอัปเดตสถานะนัดหมายได้" };
  }
}

// ----------------------------------------------------
// Action 4: Get Patient Longitudinal Health History
// ----------------------------------------------------
export async function getPatientHealthTrackingAction(patientId: string): Promise<ActionResult<any>> {
  try {
    await requirePermission("PATIENT_VIEW");

    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      include: {
        allergies: true,
        conditions: true,
        visits: {
          orderBy: { createdAt: "desc" },
          include: {
            vitalSigns: true,
            triageRecord: true,
            consultation: {
              include: {
                soapNote: true,
                diagnoses: true,
              },
            },
            prescription: {
              include: {
                items: { include: { drug: true } },
              },
            },
          },
        },
      },
    });

    if (!patient) {
      return { success: false, error: "ไม่พบข้อมูลประวัติผู้ป่วย" };
    }

    return { success: true, data: patient };
  } catch (error: any) {
    return { success: false, error: error.message || "ไม่สามารถดึงข้อมูลประวัติสุขภาพผู้ป่วยได้" };
  }
}
