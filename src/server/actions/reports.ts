"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/server/permissions/guard";

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function getClinicExecutiveReportAction(params?: {
  period?: "7DAYS" | "30DAYS" | "MONTH" | "ALL";
  startDate?: string;
  endDate?: string;
}): Promise<ActionResult<any>> {
  try {
    await requireAuth();

    let start = new Date();
    let end = new Date();

    const period = params?.period || "30DAYS";

    if (period === "7DAYS") {
      start.setDate(start.getDate() - 7);
      start.setHours(0, 0, 0, 0);
    } else if (period === "30DAYS") {
      start.setDate(start.getDate() - 30);
      start.setHours(0, 0, 0, 0);
    } else if (period === "MONTH") {
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
    } else if (params?.startDate && params?.endDate) {
      start = new Date(params.startDate);
      end = new Date(params.endDate);
      end.setHours(23, 59, 59, 999);
    } else {
      // ALL
      start = new Date(2020, 0, 1);
    }

    const whereDate = {
      createdAt: {
        gte: start,
        lte: end,
      },
    };

    // 1. Visit Stats
    const totalVisits = await prisma.visit.count({ where: whereDate });
    const completedVisits = await prisma.visit.count({
      where: { ...whereDate, status: "DISPENSED" },
    });

    // 2. Top 10 ICD-10 Diagnoses
    const diagnoses = await prisma.diagnosis.findMany({
      where: whereDate,
      select: {
        icd10Code: true,
        icd10Name: true,
      },
    });

    const diagnosisMap: Record<string, { code: string; name: string; count: number }> = {};
    for (const d of diagnoses) {
      const key = `${d.icd10Code}_${d.icd10Name}`;
      if (!diagnosisMap[key]) {
        diagnosisMap[key] = {
          code: d.icd10Code,
          name: d.icd10Name,
          count: 0,
        };
      }
      diagnosisMap[key].count += 1;
    }

    const topDiagnoses = Object.values(diagnosisMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map((item) => ({
        ...item,
        percentage: diagnoses.length > 0 ? Math.round((item.count / diagnoses.length) * 100) : 0,
      }));

    // 3. Rights Type Distribution
    const patientsWithRights = await prisma.patient.groupBy({
      by: ["rightsType"],
      _count: {
        id: true,
      },
    });

    const totalPatientsCount = patientsWithRights.reduce((acc, curr) => acc + curr._count.id, 0);
    const rightsDistribution = patientsWithRights.map((item) => ({
      rightsType: item.rightsType,
      count: item._count.id,
      percentage: totalPatientsCount > 0 ? Math.round((item._count.id / totalPatientsCount) * 100) : 0,
    }));

    // 4. Prescriptions & Pharmacy Stats
    const totalPrescriptions = await prisma.prescription.count({ where: whereDate });
    const totalDrugs = await prisma.drug.count({ where: { isActive: true } });
    const lowStockDrugsCount = await prisma.drug.count({
      where: { isActive: true, totalStock: { lte: 10 } },
    });

    return {
      success: true,
      data: {
        period,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        totalVisits,
        completedVisits,
        topDiagnoses,
        rightsDistribution,
        totalPrescriptions,
        totalDrugs,
        lowStockDrugsCount,
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message || "ไม่สามารถสรุปรายงานการบริหารคลินิกได้" };
  }
}
