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
    const allPeriodVisits = await prisma.visit.findMany({
      where: whereDate,
      select: {
        id: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    });

    const totalVisits = allPeriodVisits.length;
    const completedVisits = allPeriodVisits.filter(
      (v) => v.status === "DISPENSED" || v.status === "COMPLETED"
    ).length;

    // 1.1 Daily Visit Trends
    const daysMap: Record<string, { date: string; label: string; total: number; completed: number }> = {};
    
    // Generate dates timeline
    const iterDate = new Date(start);
    const stopDate = new Date(end);
    if (period === "ALL") {
      iterDate.setDate(stopDate.getDate() - 30); // show last 30 days for all time timeline
    }

    while (iterDate <= stopDate) {
      const dKey = iterDate.toISOString().slice(0, 10);
      const dLabel = `${iterDate.getDate()}/${iterDate.getMonth() + 1}`;
      daysMap[dKey] = { date: dKey, label: dLabel, total: 0, completed: 0 };
      iterDate.setDate(iterDate.getDate() + 1);
    }

    for (const v of allPeriodVisits) {
      const dKey = v.createdAt.toISOString().slice(0, 10);
      if (daysMap[dKey]) {
        daysMap[dKey].total += 1;
        if (v.status === "DISPENSED" || v.status === "COMPLETED") {
          daysMap[dKey].completed += 1;
        }
      }
    }

    const dailyVisitTrends = Object.values(daysMap);

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

    // 4. Triage Urgency Distribution
    const triageRecords = await prisma.triageRecord.findMany({
      where: whereDate,
      select: { urgency: true },
    });

    const urgencyCounts: Record<string, number> = {
      RESUSCITATION: 0,
      EMERGENCY: 0,
      URGENT: 0,
      SEMI_URGENT: 0,
      NON_URGENT: 0,
    };

    for (const tr of triageRecords) {
      if (urgencyCounts[tr.urgency] !== undefined) {
        urgencyCounts[tr.urgency] += 1;
      }
    }

    const totalTriage = triageRecords.length;
    const urgencyDistribution = [
      { urgency: "RESUSCITATION", label: "ระดับ 1: วิกฤต (Red)", count: urgencyCounts.RESUSCITATION, color: "#e11d48", percentage: totalTriage > 0 ? Math.round((urgencyCounts.RESUSCITATION / totalTriage) * 100) : 0 },
      { urgency: "EMERGENCY", label: "ระดับ 2: ฉุกเฉิน (Pink)", count: urgencyCounts.EMERGENCY, color: "#db2777", percentage: totalTriage > 0 ? Math.round((urgencyCounts.EMERGENCY / totalTriage) * 100) : 0 },
      { urgency: "URGENT", label: "ระดับ 3: ด่วน (Yellow)", count: urgencyCounts.URGENT, color: "#d97706", percentage: totalTriage > 0 ? Math.round((urgencyCounts.URGENT / totalTriage) * 100) : 0 },
      { urgency: "SEMI_URGENT", label: "ระดับ 4: ไม่ด่วน (Green)", count: urgencyCounts.SEMI_URGENT, color: "#059669", percentage: totalTriage > 0 ? Math.round((urgencyCounts.SEMI_URGENT / totalTriage) * 100) : 0 },
      { urgency: "NON_URGENT", label: "ระดับ 5: ทั่วไป (White)", count: urgencyCounts.NON_URGENT, color: "#475569", percentage: totalTriage > 0 ? Math.round((urgencyCounts.NON_URGENT / totalTriage) * 100) : 0 },
    ];

    // 5. Lab Statistics & Top Tests
    const labOrders = await prisma.labOrder.findMany({
      where: whereDate,
      include: { results: true },
    });

    const totalLabOrders = labOrders.length;
    const completedLabOrders = labOrders.filter((l) => l.status === "COMPLETED").length;
    let abnormalResultCount = 0;
    let totalResultParams = 0;

    const labTestMap: Record<string, number> = {};
    for (const l of labOrders) {
      labTestMap[l.testName] = (labTestMap[l.testName] || 0) + 1;
      for (const r of l.results) {
        totalResultParams += 1;
        if (r.isAbnormal) abnormalResultCount += 1;
      }
    }

    const topLabTests = Object.entries(labTestMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, count]) => ({ name, count }));

    // 6. Prescriptions & Top Drugs
    const totalPrescriptions = await prisma.prescription.count({ where: whereDate });
    const totalDrugs = await prisma.drug.count({ where: { isActive: true } });
    const lowStockDrugsCount = await prisma.drug.count({
      where: { isActive: true, totalStock: { lte: 10 } },
    });

    const prescriptionItems = await prisma.prescriptionItem.findMany({
      where: { prescription: whereDate },
      include: { drug: true },
    });

    const drugFreqMap: Record<string, { name: string; genericName: string; count: number; quantity: number }> = {};
    for (const item of prescriptionItems) {
      const dName = item.drug.genericName;
      if (!drugFreqMap[dName]) {
        drugFreqMap[dName] = {
          name: item.drug.tradeName || item.drug.genericName,
          genericName: item.drug.genericName,
          count: 0,
          quantity: 0,
        };
      }
      drugFreqMap[dName].count += 1;
      drugFreqMap[dName].quantity += item.quantity;
    }

    const topDrugs = Object.values(drugFreqMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    // 7. BMI Distribution in Community
    const vitalSigns = await prisma.vitalSign.findMany({
      where: whereDate,
      select: { bmi: true },
    });

    const bmiCategories = {
      underweight: 0, // < 18.5
      normal: 0,      // 18.5 - 22.9
      overweight: 0,  // 23.0 - 24.9
      obese1: 0,      // 25.0 - 29.9
      obese2: 0,      // >= 30.0
    };

    let totalBmiCount = 0;
    for (const vs of vitalSigns) {
      if (vs.bmi && vs.bmi > 0) {
        totalBmiCount += 1;
        if (vs.bmi < 18.5) bmiCategories.underweight += 1;
        else if (vs.bmi < 23.0) bmiCategories.normal += 1;
        else if (vs.bmi < 25.0) bmiCategories.overweight += 1;
        else if (vs.bmi < 30.0) bmiCategories.obese1 += 1;
        else bmiCategories.obese2 += 1;
      }
    }

    const bmiDistribution = [
      { category: "น้ำหนักน้อย / ผอม (< 18.5)", count: bmiCategories.underweight, color: "#38bdf8", percentage: totalBmiCount > 0 ? Math.round((bmiCategories.underweight / totalBmiCount) * 100) : 0 },
      { category: "สมส่วน / สุขภาพดี (18.5 - 22.9)", count: bmiCategories.normal, color: "#10b981", percentage: totalBmiCount > 0 ? Math.round((bmiCategories.normal / totalBmiCount) * 100) : 0 },
      { category: "ท้วม / น้ำหนักเกิน (23.0 - 24.9)", count: bmiCategories.overweight, color: "#f59e0b", percentage: totalBmiCount > 0 ? Math.round((bmiCategories.overweight / totalBmiCount) * 100) : 0 },
      { category: "โรคอ้วนระดับ 1 (25.0 - 29.9)", count: bmiCategories.obese1, color: "#f43f5e", percentage: totalBmiCount > 0 ? Math.round((bmiCategories.obese1 / totalBmiCount) * 100) : 0 },
      { category: "โรคอ้วนระดับ 2 (≥ 30.0)", count: bmiCategories.obese2, color: "#be123c", percentage: totalBmiCount > 0 ? Math.round((bmiCategories.obese2 / totalBmiCount) * 100) : 0 },
    ];

    return {
      success: true,
      data: {
        period,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        totalVisits,
        completedVisits,
        dailyVisitTrends,
        topDiagnoses,
        rightsDistribution,
        urgencyDistribution,
        labStats: {
          total: totalLabOrders,
          completed: completedLabOrders,
          pending: totalLabOrders - completedLabOrders,
          abnormalCount: abnormalResultCount,
          totalResults: totalResultParams,
          abnormalRate: totalResultParams > 0 ? Math.round((abnormalResultCount / totalResultParams) * 100) : 0,
          topTests: topLabTests,
        },
        topDrugs,
        bmiDistribution,
        totalPrescriptions,
        totalDrugs,
        lowStockDrugsCount,
      },
    };
  } catch (error: any) {
    console.error("Error in getClinicExecutiveReportAction:", error);
    return { success: false, error: error.message || "ไม่สามารถสรุปรายงานการบริหารคลินิกได้" };
  }
}
