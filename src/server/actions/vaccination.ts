"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/server/permissions/guard";
import { recordVaccinationSchema } from "@/schemas/vaccination";

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

const DEFAULT_VACCINES = [
  { name: "วัคซีนไข้หวัดใหญ่ (Influenza Vaccine)", manufacturer: "Sanofi Pasteur", description: "ป้องกันไข้หวัดใหญ่ 4 สายพันธุ์ประจำปี" },
  { name: "วัคซีนโควิด-19 (COVID-19 Vaccine)", manufacturer: "Pfizer / BioNTech", description: "ป้องกันเชื้อไวรัสโคโรนา 2019" },
  { name: "วัคซีนพิษสุนัขบ้า (Rabies Vaccine)", manufacturer: "Saveron", description: "ฉีดป้องกันกรณีสัมผัส/โดนสัตว์กัด" },
  { name: "วัคซีนบาดทะยัก (Tetanus Toxoid)", manufacturer: "GPO", description: "ป้องกันบาดทะยักและคอดิฟทีเรีย" },
  { name: "วัคซีนไวรัสตับอักเสบบี (Hepatitis B Vaccine)", manufacturer: "GSK", description: "ป้องกันเชื้อไวรัสตับอักเสบบี" },
];

// ----------------------------------------------------
// Action 1: Get Vaccine Catalog (Auto Seed if Empty)
// ----------------------------------------------------
export async function getVaccineCatalogAction(): Promise<ActionResult<any[]>> {
  try {
    await requireAuth();

    let vaccines = await prisma.vaccine.findMany({
      orderBy: { name: "asc" },
    });

    if (vaccines.length === 0) {
      await prisma.vaccine.createMany({
        data: DEFAULT_VACCINES,
        skipDuplicates: true,
      });
      vaccines = await prisma.vaccine.findMany({
        orderBy: { name: "asc" },
      });
    }

    return { success: true, data: vaccines };
  } catch (error: any) {
    return { success: false, error: error.message || "ไม่สามารถดึงข้อมูลทะเบียนวัคซีนได้" };
  }
}

// ----------------------------------------------------
// Action 2: Get Patient Vaccination History
// ----------------------------------------------------
export async function getPatientVaccinationHistoryAction(
  patientId?: string
): Promise<ActionResult<any[]>> {
  try {
    await requireAuth();

    const where: any = {};
    if (patientId) {
      where.patientId = patientId;
    }

    const history = await prisma.vaccination.findMany({
      where,
      orderBy: { administeredAt: "desc" },
      include: {
        patient: {
          select: {
            id: true,
            hn: true,
            firstName: true,
            lastName: true,
          },
        },
        vaccine: true,
        vaccinator: {
          select: {
            id: true,
            fullName: true,
            role: true,
          },
        },
      },
    });

    return { success: true, data: history };
  } catch (error: any) {
    return { success: false, error: error.message || "ไม่สามารถดึงประวัติการรับวัคซีนได้" };
  }
}

// ----------------------------------------------------
// Action 3: Record Vaccination Entry
// ----------------------------------------------------
export async function recordVaccinationAction(
  formData: Record<string, any>
): Promise<ActionResult<any>> {
  try {
    const session = await requireAuth();

    const validated = recordVaccinationSchema.safeParse(formData);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.errors[0]?.message || "ข้อมูลการรับวัคซีนไม่ถูกต้อง",
      };
    }

    const {
      patientId,
      vaccineId,
      lotNumber,
      doseNumber,
      administeredAt,
      injectionSite,
    } = validated.data;

    const record = await prisma.vaccination.create({
      data: {
        patientId,
        vaccineId,
        lotNumber: lotNumber || null,
        doseNumber,
        administeredAt: new Date(administeredAt),
        injectionSite: injectionSite || "ต้นแขนขวา",
        vaccinatorId: session.userId,
      },
      include: {
        patient: true,
        vaccine: true,
      },
    });

    // Record Audit Log (VACCINATION_RECORDED)
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: "VACCINATION_RECORDED",
        resourceType: "VACCINATION",
        resourceId: record.id,
        success: true,
      },
    });

    revalidatePath("/vaccination");
    revalidatePath("/patient");
    return { success: true, data: record };
  } catch (error: any) {
    return { success: false, error: error.message || "ไม่สามารถบันทึกการรับวัคซีนได้" };
  }
}
