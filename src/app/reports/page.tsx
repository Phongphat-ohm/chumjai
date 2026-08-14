"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  BarChart3,
  Printer,
  Calendar,
  Users,
  Activity,
  Pill,
  ShieldCheck,
  TrendingUp,
  Loader2,
  FileSpreadsheet,
  CheckCircle2,
  RefreshCw,
  Award,
  BarChart2,
  Table as TableIcon,
  Download,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getClinicExecutiveReportAction } from "@/server/actions/reports";
import { GraphReportView } from "@/components/reports/GraphReportView";

export default function ClinicReportsPage() {
  const [isPending, startTransition] = useTransition();

  const [viewMode, setViewMode] = useState<"GRAPH" | "TABLE">("GRAPH");
  const [period, setPeriod] = useState<"7DAYS" | "30DAYS" | "MONTH" | "ALL">("30DAYS");
  const [reportData, setReportData] = useState<any | null>(null);

  const fetchReport = (p = period) => {
    startTransition(async () => {
      const res = await getClinicExecutiveReportAction({ period: p });
      if (res.success && res.data) {
        setReportData(res.data);
      }
    });
  };

  useEffect(() => {
    fetchReport(period);
  }, [period]);

  const getRightsLabel = (rt: string) => {
    switch (rt) {
      case "UNIVERSAL_COVERAGE":
        return "สิทธิหลักประกันสุขภาพถ้วนหน้า (30 บาท / บัตรทอง)";
      case "SOCIAL_SECURITY":
        return "สิทธิประกันสังคม";
      case "CIVIL_SERVANT":
        return "สิทธิข้าราชการ / จ่ายตรง";
      case "SELF_PAY":
        return "ชำระเงินเอง (เงินสด/โอน)";
      default:
        return rt;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-chunjai-600 text-white shadow-md">
              <BarChart3 className="h-5 w-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-chunjai-950">
              รายงานสถิติและกราฟวิเคราะห์คลินิก (GraphReport Analytics)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            สรุปสถิติแนวโน้มผู้ป่วย 10 อันดับโรค สิทธิการรักษา ความเร่งด่วนคัดกรอง ผลแล็บ และโภชนาการชุมชน
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode("GRAPH")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === "GRAPH"
                  ? "bg-white text-chunjai-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <BarChart2 className="h-3.5 w-3.5" />
              รายงานกราฟ (Graph)
            </button>
            <button
              onClick={() => setViewMode("TABLE")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === "TABLE"
                  ? "bg-white text-chunjai-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <TableIcon className="h-3.5 w-3.5" />
              ตารางสรุปผล (Table)
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchReport(period)}
            className="text-xs font-semibold"
          >
            <RefreshCw className={`mr-1.5 h-3.5 w-3.5 text-chunjai-600 ${isPending ? "animate-spin" : ""}`} />
            รีเฟรช
          </Button>

          <Button
            onClick={() => window.print()}
            size="sm"
            className="bg-chunjai-600 hover:bg-chunjai-700 text-white font-semibold text-xs shadow-sm"
          >
            <Printer className="mr-1.5 h-4 w-4" />
            พิมพ์รายงาน
          </Button>
        </div>
      </div>

      {/* Filter Period Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setPeriod("7DAYS")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              period === "7DAYS"
                ? "bg-chunjai-600 text-white shadow-xs"
                : "bg-white text-slate-700 border border-slate-200 hover:bg-chunjai-50"
            }`}
          >
            7 วันล่าสุด
          </button>
          <button
            onClick={() => setPeriod("30DAYS")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              period === "30DAYS"
                ? "bg-chunjai-600 text-white shadow-xs"
                : "bg-white text-slate-700 border border-slate-200 hover:bg-chunjai-50"
            }`}
          >
            30 วันล่าสุด
          </button>
          <button
            onClick={() => setPeriod("MONTH")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              period === "MONTH"
                ? "bg-chunjai-600 text-white shadow-xs"
                : "bg-white text-slate-700 border border-slate-200 hover:bg-chunjai-50"
            }`}
          >
            เดือนนี้
          </button>
          <button
            onClick={() => setPeriod("ALL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              period === "ALL"
                ? "bg-chunjai-600 text-white shadow-xs"
                : "bg-white text-slate-700 border border-slate-200 hover:bg-chunjai-50"
            }`}
          >
            ประวัติทั้งหมด
          </button>
        </div>

        {reportData && (
          <span className="text-[11px] text-slate-500 font-mono">
            ช่วงเวลาข้อมูล: {new Date(reportData.startDate).toLocaleDateString("th-TH")} ถึง{" "}
            {new Date(reportData.endDate).toLocaleDateString("th-TH")}
          </span>
        )}
      </div>

      {isPending && !reportData ? (
        <div className="p-20 text-center text-slate-400 space-y-2">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-chunjai-600" />
          <p className="text-xs font-medium">กำลังประมวลผลรายงานสถิติและกราฟ...</p>
        </div>
      ) : reportData ? (
        viewMode === "GRAPH" ? (
          /* Graph Analytics View */
          <GraphReportView data={reportData} period={period} />
        ) : (
          /* Table Summary View */
          <div className="space-y-6">
            {/* Executive KPI Overview Cards */}
            <div className="grid gap-4 sm:grid-cols-4">
              <Card className="border-chunjai-200 bg-white">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-xs text-slate-500 font-semibold">ผู้ป่วยเข้ารับบริการรวม</span>
                    <div className="text-2xl font-bold text-chunjai-950 font-mono">
                      {reportData.totalVisits} <span className="text-xs font-normal text-slate-500">ครั้ง</span>
                    </div>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-chunjai-50 text-chunjai-600">
                    <Users className="h-5 w-5" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-emerald-200 bg-emerald-50/40">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-xs text-slate-500 font-semibold">รับยาเสร็จสิ้นสมบูรณ์</span>
                    <div className="text-2xl font-bold text-emerald-700 font-mono">
                      {reportData.completedVisits} <span className="text-xs font-normal text-slate-500">ครั้ง</span>
                    </div>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-blue-200 bg-blue-50/40">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-xs text-slate-500 font-semibold">ใบสั่งยาออกในระบบ</span>
                    <div className="text-2xl font-bold text-blue-700 font-mono">
                      {reportData.totalPrescriptions} <span className="text-xs font-normal text-slate-500">ฉบับ</span>
                    </div>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                    <Pill className="h-5 w-5" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-amber-200 bg-amber-50/40">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-xs text-slate-500 font-semibold">รายการยาสต็อกต่ำ</span>
                    <div className="text-2xl font-bold text-amber-700 font-mono">
                      {reportData.lowStockDrugsCount} <span className="text-xs font-normal text-slate-500">รายการ</span>
                    </div>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                    <Pill className="h-5 w-5" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Section: Top 10 ICD-10 Diagnoses Breakdown Table */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader className="pb-3 border-b border-slate-100">
                  <CardTitle className="text-base font-bold text-chunjai-950 flex items-center gap-2">
                    <Award className="h-5 w-5 text-chunjai-600" />
                    10 อันดับโรคที่พบมากที่สุด (Top 10 ICD-10 Diagnoses)
                  </CardTitle>
                  <CardDescription className="text-xs">
                    สรุปสถิติจากการวินิจฉัยโรคของแพทย์ประจำคลินิก
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-4 space-y-3 text-xs">
                  {reportData.topDiagnoses.length === 0 ? (
                    <div className="p-8 text-center text-slate-400">ยังไม่มีข้อมูลสถิติการวินิจฉัยโรคในช่วงเวลานี้</div>
                  ) : (
                    reportData.topDiagnoses.map((item: any, idx: number) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-900">
                            {idx + 1}. {item.name} <span className="font-mono text-chunjai-600">({item.code})</span>
                          </span>
                          <span className="font-mono font-bold text-chunjai-700">
                            {item.count} ครั้ง ({item.percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-chunjai-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${Math.max(item.percentage, 5)}%` }}
                          ></div>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Section: Rights Type Proportions */}
              <Card>
                <CardHeader className="pb-3 border-b border-slate-100">
                  <CardTitle className="text-base font-bold text-chunjai-950 flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-chunjai-600" />
                    สัดส่วนสิทธิการรักษาพยาบาล (Rights Type Distribution)
                  </CardTitle>
                  <CardDescription className="text-xs">
                    สัดส่วนจำแนกตามประเภทสิทธิสวัสดิการของผู้ป่วย
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-4 space-y-4 text-xs">
                  {reportData.rightsDistribution.length === 0 ? (
                    <div className="p-8 text-center text-slate-400">ยังไม่มีข้อมูลผู้ป่วยลงทะเบียนสิทธิ</div>
                  ) : (
                    reportData.rightsDistribution.map((item: any, idx: number) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-900">
                            {getRightsLabel(item.rightsType)}
                          </span>
                          <span className="font-mono font-bold text-chunjai-700">
                            {item.count} ราย ({item.percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                          <div
                            className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500"
                            style={{ width: `${Math.max(item.percentage, 5)}%` }}
                          ></div>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )
      ) : null}
    </div>
  );
}
