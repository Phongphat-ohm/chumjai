"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/server/permissions/guard";
import { createReferralSchema, updateReferralStatusSchema } from "@/schemas/referral";
import { ReferralStatus } from "@prisma/client";

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// ----------------------------------------------------
// Action 1: Get Referrals
// ----------------------------------------------------
export async function getReferralsAction(params?: {
  status?: ReferralStatus;
  patientId?: string;
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

    const referrals = await prisma.referral.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        patient: {
          select: {
            id: true,
            hn: true,
            nationalId: true,
            firstName: true,
            lastName: true,
            gender: true,
            dateOfBirth: true,
            phoneNumber: true,
            address: true,
          },
        },
        visit: {
          include: {
            vitalSigns: true,
            triageRecord: true,
            consultation: {
              include: {
                soapNote: true,
                diagnoses: true,
              },
            },
          },
        },
      },
    });

    return { success: true, data: referrals };
  } catch (error: any) {
    return { success: false, error: error.message || "ไม่สามารถดึงข้อมูลการส่งตัวได้" };
  }
}

// ----------------------------------------------------
// Action 2: Create Referral Entry
// ----------------------------------------------------
export async function createReferralAction(
  formData: Record<string, any>
): Promise<ActionResult<any>> {
  try {
    const session = await requireAuth();

    const validated = createReferralSchema.safeParse(formData);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.errors[0]?.message || "ข้อมูลการสั่งส่งตัวไม่ถูกต้อง",
      };
    }

    const { patientId, visitId, hospitalName, reason, diagnosisSummary } = validated.data;

    const referral = await prisma.referral.create({
      data: {
        patientId,
        visitId,
        hospitalName,
        reason,
        diagnosisSummary: diagnosisSummary || null,
        status: ReferralStatus.PENDING,
      },
      include: {
        patient: true,
        visit: true,
      },
    });

    // Record Audit Log (REFERRAL_CREATED)
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: "REFERRAL_CREATED",
        resourceType: "REFERRAL",
        resourceId: referral.id,
        success: true,
      },
    });

    revalidatePath("/referral");
    revalidatePath("/doctor");
    return { success: true, data: referral };
  } catch (error: any) {
    return { success: false, error: error.message || "ไม่สามารถออกหนังสือส่งตัวได้" };
  }
}

// ----------------------------------------------------
// Action 3: Update Referral Status
// ----------------------------------------------------
export async function updateReferralStatusAction(
  referralId: string,
  status: ReferralStatus
): Promise<ActionResult<any>> {
  try {
    const session = await requireAuth();

    const referral = await prisma.referral.update({
      where: { id: referralId },
      data: { status },
    });

    // Record Audit Log (REFERRAL_UPDATED)
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: "REFERRAL_UPDATED",
        resourceType: "REFERRAL",
        resourceId: referralId,
        success: true,
      },
    });

    revalidatePath("/referral");
    return { success: true, data: referral };
  } catch (error: any) {
    return { success: false, error: error.message || "ไม่สามารถอัปเดตสถานะการส่งตัวได้" };
  }
}
