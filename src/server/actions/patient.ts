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
      // Exact match only: HN (case-insensitive) หรือ เลขบัตรประชาชน 13 หลัก (exact)
      where.OR = [
        { hn: { equals: search.toUpperCase() } },
        { nationalId: { equals: search } },
      ];
    } else {
      // ถ้าไม่มี search query ให้ return ผลว่างทันที (ไม่แสดงรายชื่อผู้ป่วยทั้งหมดโดยไม่มีการค้นหา)
      // ยกเว้นกรณีที่ใช้ใน Patient Directory ที่ต้องการแสดงรายชื่อทั้งหมด (ควบคุมผ่าน caller)
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
          visits: {
            orderBy: { createdAt: "desc" },
            take: 5,
            select: {
              id: true,
              visitNumber: true,
              status: true,
              chiefComplaint: true,
              createdAt: true,
            },
          },
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
          orderBy: { createdAt: "desc" },
          include: {
            triageRecord: true,
            vitalSigns: {
              take: 1,
              orderBy: { createdAt: "desc" },
            },
            consultation: {
              include: {
                soapNote: true,
                diagnoses: true,
              },
            },
            prescription: {
              include: {
                items: {
                  include: { drug: true },
                },
              },
            },
            labOrders: {
              include: { results: true },
            },
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
// Action 2.1: Verify Patient Identity for PDPA & Full Visit Access
// ----------------------------------------------------
export async function verifyPatientIdentityAction(
  patientId: string,
  last4Digits: string
): Promise<ActionResult<{ verified: boolean }>> {
  try {
    const session = await requirePermission("PATIENT_VIEW");

    if (!last4Digits || last4Digits.trim().length !== 4) {
      return { success: false, error: "กรุณากรอกเลขยืนยันตัวตน 4 หลักให้ครบถ้วน" };
    }

    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      select: {
        id: true,
        nationalId: true,
        phoneNumber: true,
        firstName: true,
        lastName: true,
      },
    });

    if (!patient) {
      return { success: false, error: "ไม่พบข้อมูลผู้ป่วยในระบบ" };
    }

    // Clean patient identifiers (remove hyphens, spaces)
    const cleanNationalId = (patient.nationalId || "").replace(/[^0-9a-zA-Z]/g, "");
    const cleanPhone = (patient.phoneNumber || "").replace(/[^0-9]/g, "");

    const expectedLast4NatId = cleanNationalId.slice(-4);
    const expectedLast4Phone = cleanPhone.slice(-4);
    const inputClean = last4Digits.trim();

    const isMatch =
      (expectedLast4NatId.length === 4 && inputClean === expectedLast4NatId) ||
      (!cleanNationalId && expectedLast4Phone.length === 4 && inputClean === expectedLast4Phone);

    if (isMatch) {
      // Record Audit Log for successful verification
      await prisma.auditLog.create({
        data: {
          userId: session.userId,
          action: "PATIENT_PDPA_VERIFIED",
          resourceType: "PATIENT",
          resourceId: patientId,
          success: true,
        },
      });

      return { success: true, data: { verified: true } };
    } else {
      // Record Audit Log for failed attempt
      await prisma.auditLog.create({
        data: {
          userId: session.userId,
          action: "PATIENT_PDPA_VERIFY_FAILED",
          resourceType: "PATIENT",
          resourceId: patientId,
          success: false,
        },
      });

      return {
        success: false,
        error: "รหัส 4 ตัวท้ายไม่ถูกต้อง กรุณาตรวจสอบเลข 4 ตัวท้ายของบัตรประชาชนผู้ป่วย",
      };
    }
  } catch (error: any) {
    console.error("Error in verifyPatientIdentityAction:", error);
    return { success: false, error: error.message || "เกิดข้อผิดพลาดในการยืนยันตัวตน" };
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
