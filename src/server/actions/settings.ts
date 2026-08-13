"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole, requirePermission } from "@/server/permissions/guard";
import { updateClinicSettingsSchema } from "@/schemas/settings";

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

const DEFAULT_SETTINGS: Record<string, string> = {
  CLINIC_NAME: "ชุมใจคลินิกเวชกรรม (Chunjai Community Clinic)",
  CLINIC_ADDRESS: "99/1 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพมหานคร 10110",
  CLINIC_PHONE: "02-123-4567, 081-987-6543",
  CLINIC_EMAIL: "contact@chunjai-clinic.com",
  CLINIC_LICENSE: "10101004567",
  CLINIC_TAX_ID: "0105566778899",
  CLINIC_DIRECTOR: "นพ. ชุมใจ รักษาดี (ว. 45678)",
  OPENING_HOURS: "จันทร์ - ศุกร์: 08:00 - 20:00 น. | เสาร์ - อาทิตย์: 09:00 - 17:00 น.",
  MIN_STOCK_THRESHOLD: "10",
  EXPIRY_WARNING_DAYS: "90",
};

// ----------------------------------------------------
// Action 1: Get Clinic Settings
// ----------------------------------------------------
export async function getClinicSettingsAction(): Promise<ActionResult<Record<string, string>>> {
  try {
    await requireAuth();

    const dbSettings = await prisma.clinicSetting.findMany();
    const settingsMap = { ...DEFAULT_SETTINGS };

    for (const item of dbSettings) {
      settingsMap[item.key] = item.value;
    }

    return { success: true, data: settingsMap };
  } catch (error: any) {
    return { success: false, error: error.message || "ไม่สามารถดึงข้อมูลการตั้งค่าได้" };
  }
}

// ----------------------------------------------------
// Action 2: Update Clinic Settings (Admin Only)
// ----------------------------------------------------
export async function updateClinicSettingsAction(
  formData: Record<string, any>
): Promise<ActionResult<any>> {
  try {
    const session = await requireRole(["ADMIN"]);

    const validated = updateClinicSettingsSchema.safeParse(formData);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.errors[0]?.message || "ข้อมูลการตั้งค่าไม่ถูกต้อง",
      };
    }

    const {
      clinicName,
      address,
      phone,
      email,
      licenseNo,
      taxId,
      directorName,
      openingHours,
      minStockThreshold,
      expiryWarningDays,
    } = validated.data;

    const itemsToUpsert = [
      { key: "CLINIC_NAME", value: clinicName },
      { key: "CLINIC_ADDRESS", value: address },
      { key: "CLINIC_PHONE", value: phone },
      { key: "CLINIC_EMAIL", value: email || "" },
      { key: "CLINIC_LICENSE", value: licenseNo || "" },
      { key: "CLINIC_TAX_ID", value: taxId || "" },
      { key: "CLINIC_DIRECTOR", value: directorName || "" },
      { key: "OPENING_HOURS", value: openingHours || "" },
      { key: "MIN_STOCK_THRESHOLD", value: minStockThreshold.toString() },
      { key: "EXPIRY_WARNING_DAYS", value: expiryWarningDays.toString() },
    ];

    await prisma.$transaction(
      itemsToUpsert.map((item) =>
        prisma.clinicSetting.upsert({
          where: { key: item.key },
          update: { value: item.value },
          create: { key: item.key, value: item.value },
        })
      )
    );

    // Record Audit Log (SETTINGS_UPDATED)
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: "SETTINGS_UPDATED",
        resourceType: "CLINIC_SETTING",
        success: true,
      },
    });

    revalidatePath("/settings");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "ไม่สามารถบันทึกการตั้งค่าได้" };
  }
}

// ----------------------------------------------------
// Action 3: Get Patient Longitudinal Health History
// ----------------------------------------------------
export async function getPatientLongitudinalHealthAction(patientId: string): Promise<ActionResult<any>> {
  try {
    await requirePermission("PATIENT_HEALTH_VIEW");

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
      return { success: false, error: "ไม่พบข้อมูลผู้ป่วย" };
    }

    // Extract longitudinal vitals timeline
    const vitalsHistory = patient.visits
      .filter((v) => v.vitalSigns && v.vitalSigns.length > 0)
      .map((v) => {
        const vs = v.vitalSigns[0];
        return {
          visitId: v.id,
          visitNumber: v.visitNumber,
          date: v.createdAt,
          bps: vs.systolicBp,
          bpd: vs.diastolicBp,
          pulseRate: vs.pulseRate,
          temp: vs.temperatureC,
          weight: vs.weightKg,
          height: vs.heightCm,
          bmi: vs.bmi,
          dtx: vs.bloodGlucoseMgDl,
        };
      });

    return {
      success: true,
      data: {
        patient,
        vitalsHistory,
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message || "ไม่สามารถดึงข้อมูลสุขภาพผู้ป่วยได้" };
  }
}
