"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth, requirePermission } from "@/server/permissions/guard";
import { patientSchema, patientAllergySchema, patientConditionSchema } from "@/schemas/patient";
import { RightsType, Gender } from "@/generated/client";

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// ----------------------------------------------------
// Helper: Auto Generate HN (Hospital Number)
// ----------------------------------------------------
async function generateHnNumber(): Promise<string> {
  const yearShort = (new Date().getFullYear() + 543).toString().substring(2); // Thai BE year e.g. 69
  const prefix = `HN${yearShort}`;

  const lastPatient = await prisma.patient.findFirst({
    where: { hn: { startsWith: prefix } },
    orderBy: { createdAt: "desc" },
    select: { hn: true },
  });

  if (!lastPatient) {
    return `${prefix}0001`;
  }

  const currentNumStr = lastPatient.hn.replace(prefix, "");
  const nextNum = parseInt(currentNumStr, 10) + 1;
  return `${prefix}${nextNum.toString().padStart(4, "0")}`;
}

// ----------------------------------------------------
// Action 1: Get Patients List (Search & Filter)
// ----------------------------------------------------
export async function getPatientsAction(params: {
  search?: string;
  rightsType?: string;
  page?: number;
  limit?: number;
}): Promise<ActionResult<{ patients: any[]; total: number }>> {
  try {
    const session = await requirePermission("PATIENT_VIEW");

    const search = params.search?.trim() || "";
    const rightsType = params.rightsType as RightsType | undefined;
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(50, Math.max(1, params.limit || 10));
    const skip = (page - 1) * limit;

    const where: any = {
      isDeleted: false,
    };

    if (search) {
      where.OR = [
        { hn: { contains: search, mode: "insensitive" } },
        { nationalId: { contains: search } },
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { phoneNumber: { contains: search } },
      ];
    }

    if (rightsType) {
      where.rightsType = rightsType;
    }

    const [patients, total] = await Promise.all([
      prisma.patient.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          allergies: true,
          conditions: true,
        },
      }),
      prisma.patient.count({ where }),
    ]);

    // Record Audit Log (PATIENT_VIEWED)
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: "PATIENT_VIEWED",
        resourceType: "PATIENT",
        success: true,
      },
    });

    return { success: true, data: { patients, total } };
  } catch (error: any) {
    console.error("Error in getPatientsAction:", error);
    return { success: false, error: error.message || "ไม่สามารถดึงข้อมูลผู้ป่วยได้" };
  }
}

// ----------------------------------------------------
// Action 2: Get Single Patient Detail
// ----------------------------------------------------
export async function getPatientDetailAction(id: string): Promise<ActionResult<any>> {
  try {
    const session = await requirePermission("PATIENT_VIEW");

    const patient = await prisma.patient.findUnique({
      where: { id },
      include: {
        allergies: true,
        conditions: true,
        medications: true,
        visits: {
          take: 5,
          orderBy: { createdAt: "desc" },
          include: {
            triageRecord: true,
            consultation: true,
          },
        },
      },
    });

    if (!patient || patient.isDeleted) {
      return { success: false, error: "ไม่พบข้อมูลผู้ป่วย" };
    }

    // Record Audit Log (PATIENT_VIEWED)
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: "PATIENT_VIEWED",
        resourceType: "PATIENT",
        resourceId: id,
        success: true,
      },
    });

    return { success: true, data: patient };
  } catch (error: any) {
    return { success: false, error: error.message || "เกิดข้อผิดพลาดในการดึงข้อมูล" };
  }
}

// ----------------------------------------------------
// Action 3: Create New Patient
// ----------------------------------------------------
export async function createPatientAction(formData: Record<string, any>): Promise<ActionResult<any>> {
  try {
    const session = await requirePermission("PATIENT_CREATE");

    const validated = patientSchema.safeParse(formData);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.errors[0]?.message || "ข้อมูลไม่ถูกต้อง",
      };
    }

    const data = validated.data;
    const hn = data.hn?.trim() || (await generateHnNumber());

    // Check duplicate HN or National ID
    if (data.nationalId) {
      const existingNatId = await prisma.patient.findFirst({
        where: { nationalId: data.nationalId, isDeleted: false },
      });
      if (existingNatId) {
        return { success: false, error: "เลขบัตรประชาชนนี้ถูกลงทะเบียนแล้ว" };
      }
    }

    const patient = await prisma.patient.create({
      data: {
        hn,
        nationalId: data.nationalId || null,
        firstName: data.firstName,
        lastName: data.lastName,
        gender: data.gender as Gender,
        dateOfBirth: new Date(data.dateOfBirth),
        phoneNumber: data.phoneNumber,
        address: data.address || null,
        subdistrict: data.subdistrict || null,
        district: data.district || null,
        province: data.province || null,
        postalCode: data.postalCode || null,
        rightsType: data.rightsType as RightsType,
        emergencyContact: data.emergencyContact || null,
        emergencyPhone: data.emergencyPhone || null,
        bloodType: data.bloodType || null,
      },
    });

    // Audit Log (PATIENT_CREATED)
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: "PATIENT_CREATED",
        resourceType: "PATIENT",
        resourceId: patient.id,
        success: true,
      },
    });

    revalidatePath("/patient");
    return { success: true, data: patient };
  } catch (error: any) {
    console.error("Error in createPatientAction:", error);
    return { success: false, error: error.message || "เกิดข้อผิดพลาดในการลงทะเบียนผู้ป่วย" };
  }
}

// ----------------------------------------------------
// Action 4: Add Patient Allergy
// ----------------------------------------------------
export async function addPatientAllergyAction(formData: Record<string, any>): Promise<ActionResult<any>> {
  try {
    const session = await requirePermission("PATIENT_HEALTH_UPDATE");

    const validated = patientAllergySchema.safeParse(formData);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.errors[0]?.message || "ข้อมูลแพ้ยาไม่ถูกต้อง",
      };
    }

    const allergy = await prisma.patientAllergy.create({
      data: validated.data,
    });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: "PATIENT_ALLERGY_ADDED",
        resourceType: "PATIENT",
        resourceId: allergy.patientId,
        success: true,
      },
    });

    revalidatePath(`/patient/${allergy.patientId}`);
    return { success: true, data: allergy };
  } catch (error: any) {
    return { success: false, error: error.message || "ไม่สามารถบันทึกประวัติการแพ้ยาได้" };
  }
}

// ----------------------------------------------------
// Action 5: Add Patient Condition (Chronic Disease)
// ----------------------------------------------------
export async function addPatientConditionAction(formData: Record<string, any>): Promise<ActionResult<any>> {
  try {
    const session = await requirePermission("PATIENT_HEALTH_UPDATE");

    const validated = patientConditionSchema.safeParse(formData);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.errors[0]?.message || "ข้อมูลโรคประจำตัวไม่ถูกต้อง",
      };
    }

    const condition = await prisma.patientCondition.create({
      data: {
        ...validated.data,
        diagnosedAt: validated.data.diagnosedAt ? new Date(validated.data.diagnosedAt) : null,
      },
    });

    revalidatePath(`/patient/${condition.patientId}`);
    return { success: true, data: condition };
  } catch (error: any) {
    return { success: false, error: error.message || "ไม่สามารถบันทึกโรคประจำตัวได้" };
  }
}
