"use client";

import React, { useState } from "react";
import {
  TrendingUp,
  Activity,
  Users,
  Pill,
  TestTube,
  ShieldAlert,
  Award,
  BarChart2,
  PieChart as PieIcon,
  HeartPulse,
  Scale,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface GraphReportViewProps {
  data: any;
  period: string;
}

export function GraphReportView({ data, period }: GraphReportViewProps) {
  const [hoveredTrendIndex, setHoveredTrendIndex] = useState<number | null>(null);

  if (!data) return null;

  const dailyTrends = data.dailyVisitTrends || [];
  const topDiagnoses = data.topDiagnoses || [];
  const rightsDistribution = data.rightsDistribution || [];
  const urgencyDistribution = data.urgencyDistribution || [];
  const labStats = data.labStats || { total: 0, completed: 0, abnormalCount: 0, abnormalRate: 0, topTests: [] };
  const topDrugs = data.topDrugs || [];
  const bmiDistribution = data.bmiDistribution || [];

  // Calculate Max Visit for Trend Chart scaling
  const maxTrendVal = Math.max(...dailyTrends.map((d: any) => d.total), 5);

  const getRightsLabel = (rt: string) => {
    switch (rt) {
      case "UNIVERSAL_COVERAGE":
        return "สิทธิหลักประกันสุขภาพ (บัตรทอง 30 บาท)";
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

  const getRightsColor = (rt: string) => {
    switch (rt) {
      case "UNIVERSAL_COVERAGE":
        return "#10b981"; // Emerald
      case "SOCIAL_SECURITY":
        return "#3b82f6"; // Blue
      case "CIVIL_SERVANT":
        return "#f59e0b"; // Amber
      case "SELF_PAY":
        return "#8b5cf6"; // Purple
      default:
        return "#64748b";
    }
  };

  // SVG Area path generator
  const svgWidth = 800;
  const svgHeight = 220;
  const paddingX = 40;
  const paddingY = 30;
  const chartWidth = svgWidth - paddingX * 2;
  const chartHeight = svgHeight - paddingY * 2;

  const points = dailyTrends.map((d: any, idx: number) => {
    const x = paddingX + (idx / Math.max(dailyTrends.length - 1, 1)) * chartWidth;
    const y = svgHeight - paddingY - (d.total / maxTrendVal) * chartHeight;
    return { x, y, data: d };
  });

  const pathD = points.reduce((acc: string, curr: any, idx: number) => {
    if (idx === 0) return `M ${curr.x} ${curr.y}`;
    return `${acc} L ${curr.x} ${curr.y}`;
  }, "");

  const areaD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x} ${svgHeight - paddingY} L ${points[0].x} ${svgHeight - paddingY} Z`
    : "";

  return (
    <div className="space-y-6">
      {/* 1. Executive Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border-chunjai-200 bg-linear-to-br from-chunjai-50 to-white shadow-2xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-chunjai-600 text-white shadow-md">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[11px] text-slate-500 font-medium block">ผู้ป่วยเข้ารับบริการทั้งหมด</span>
              <span className="font-mono text-2xl font-black text-chunjai-950">
                {data.totalVisits} <span className="text-xs font-normal text-slate-500">ครั้ง</span>
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 bg-linear-to-br from-emerald-50 to-white shadow-2xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[11px] text-slate-500 font-medium block">ตรวจรักษาเสร็จสิ้น</span>
              <span className="font-mono text-2xl font-black text-emerald-950">
                {data.completedVisits} <span className="text-xs font-normal text-slate-500">เคส</span>
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-linear-to-br from-purple-50 to-white shadow-2xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-600 text-white shadow-md">
              <Pill className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[11px] text-slate-500 font-medium block">ใบสั่งยาที่จ่ายแล้ว</span>
              <span className="font-mono text-2xl font-black text-purple-950">
                {data.totalPrescriptions} <span className="text-xs font-normal text-slate-500">ใบ</span>
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-linear-to-br from-blue-50 to-white shadow-2xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md">
              <TestTube className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[11px] text-slate-500 font-medium block">รายการตรวจแล็บ</span>
              <span className="font-mono text-2xl font-black text-blue-950">
                {labStats.total} <span className="text-xs font-normal text-slate-500">รายการ</span>
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 2. Main Daily Patient Visit Trend Chart */}
      <Card className="border-slate-200">
        <CardHeader className="pb-2 border-b border-slate-100 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-slate-950 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-chunjai-600" />
              กราฟแนวโน้มจำนวนผู้ป่วยเข้ารับบริการรายวัน (Daily Patient Visit Trend)
            </CardTitle>
            <CardDescription className="text-xs">
              การกระจายตัวของจำนวนผู้ป่วยที่มาลงทะเบียนและตรวจรักษาในแต่ละวันตามช่วงเวลา
            </CardDescription>
          </div>
          {hoveredTrendIndex !== null && dailyTrends[hoveredTrendIndex] && (
            <div className="bg-chunjai-50 border border-chunjai-200 px-3 py-1 rounded-lg text-xs font-bold text-chunjai-900 animate-in fade-in">
              วันที่ {dailyTrends[hoveredTrendIndex].date}: {dailyTrends[hoveredTrendIndex].total} คน (เสร็จสิ้น {dailyTrends[hoveredTrendIndex].completed} คน)
            </div>
          )}
        </CardHeader>
        <CardContent className="p-4">
          <div className="w-full overflow-x-auto">
            <div className="min-w-[650px] relative">
              <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-56 overflow-visible">
                <defs>
                  <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0284c7" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                  const y = svgHeight - paddingY - ratio * chartHeight;
                  const val = Math.round(ratio * maxTrendVal);
                  return (
                    <g key={i}>
                      <line
                        x1={paddingX}
                        y1={y}
                        x2={svgWidth - paddingX}
                        y2={y}
                        stroke="#f1f5f9"
                        strokeDasharray="4 4"
                      />
                      <text
                        x={paddingX - 10}
                        y={y + 3}
                        fontSize="10"
                        fill="#94a3b8"
                        textAnchor="end"
                        fontFamily="monospace"
                      >
                        {val}
                      </text>
                    </g>
                  );
                })}

                {/* Area and Line */}
                {areaD && <path d={areaD} fill="url(#trendGradient)" />}
                {pathD && <path d={pathD} fill="none" stroke="#0284c7" strokeWidth="2.5" strokeLinecap="round" />}

                {/* Interactive Points */}
                {points.map((p: any, idx: number) => {
                  const isHovered = hoveredTrendIndex === idx;
                  return (
                    <g
                      key={idx}
                      onMouseEnter={() => setHoveredTrendIndex(idx)}
                      onMouseLeave={() => setHoveredTrendIndex(null)}
                      className="cursor-pointer transition-all"
                    >
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={isHovered ? "6" : "3.5"}
                        fill={isHovered ? "#0369a1" : "#ffffff"}
                        stroke="#0284c7"
                        strokeWidth={isHovered ? "3" : "2"}
                      />
                      {/* X Axis Labels */}
                      <text
                        x={p.x}
                        y={svgHeight - 10}
                        fontSize="9"
                        fill={isHovered ? "#0284c7" : "#64748b"}
                        fontWeight={isHovered ? "bold" : "normal"}
                        textAnchor="middle"
                      >
                        {p.data.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Grid: Top 10 Diseases & Health Rights Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top 10 ICD-10 Diseases Bar Chart */}
        <Card className="lg:col-span-7 border-slate-200">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-base font-bold text-slate-950 flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-500" />
              10 อันดับโรคที่พบมากที่สุด (Top 10 ICD-10 Diagnoses)
            </CardTitle>
            <CardDescription className="text-xs">
              สถิติการวินิจฉัยโรคตามรหัสมาตรฐาน ICD-10 เรียงตามความถี่
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 space-y-3 text-xs">
            {topDiagnoses.length === 0 ? (
              <p className="text-slate-400 text-center py-8">ยังไม่มีข้อมูลการวินิจฉัยโรคในช่วงเวลานี้</p>
            ) : (
              topDiagnoses.map((d: any, idx: number) => {
                const maxCount = topDiagnoses[0]?.count || 1;
                const barWidth = Math.max((d.count / maxCount) * 100, 8);

                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 max-w-[75%] truncate">
                        <span className="flex h-5 w-5 items-center justify-center rounded bg-slate-100 font-mono text-[10px] font-bold text-slate-700 shrink-0">
                          {idx + 1}
                        </span>
                        <span className="font-mono font-bold text-chunjai-700 shrink-0">
                          [{d.code}]
                        </span>
                        <span className="text-slate-800 truncate" title={d.name}>
                          {d.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 font-mono">
                        <span className="font-bold text-slate-900">{d.count} เคส</span>
                        <span className="text-[10px] text-slate-400">({d.percentage}%)</span>
                      </div>
                    </div>

                    <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-linear-to-r from-chunjai-500 to-sky-400 transition-all duration-500"
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Health Rights Distribution Donut / Radial Chart */}
        <Card className="lg:col-span-5 border-slate-200 flex flex-col justify-between">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-base font-bold text-slate-950 flex items-center gap-2">
              <PieIcon className="h-5 w-5 text-chunjai-600" />
              สัดส่วนสิทธิการรักษาพยาบาล (Rights Distribution)
            </CardTitle>
            <CardDescription className="text-xs">
              การกระจายตัวของประเภทสิทธิการรักษาของผู้ป่วยในระบบ
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 space-y-4 text-xs flex-1 flex flex-col justify-center">
            {rightsDistribution.length === 0 ? (
              <p className="text-slate-400 text-center py-8">ไม่มีข้อมูลสิทธิการรักษา</p>
            ) : (
              <>
                {/* Horizontal Segmented Bar */}
                <div className="h-6 w-full rounded-xl bg-slate-100 overflow-hidden flex shadow-inner">
                  {rightsDistribution.map((item: any, idx: number) => {
                    const color = getRightsColor(item.rightsType);
                    return (
                      <div
                        key={idx}
                        style={{ width: `${item.percentage}%`, backgroundColor: color }}
                        className="h-full transition-all hover:opacity-90 relative group"
                        title={`${getRightsLabel(item.rightsType)}: ${item.count} คน (${item.percentage}%)`}
                      />
                    );
                  })}
                </div>

                {/* Legend List */}
                <div className="space-y-2.5 pt-2">
                  {rightsDistribution.map((item: any, idx: number) => {
                    const color = getRightsColor(item.rightsType);
                    return (
                      <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                        <div className="flex items-center gap-2">
                          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
                          <span className="font-medium text-slate-800 text-[11px]">
                            {getRightsLabel(item.rightsType)}
                          </span>
                        </div>
                        <div className="font-mono text-xs">
                          <span className="font-bold text-slate-900">{item.count} คน</span>
                          <span className="text-[10px] text-slate-500 ml-1">({item.percentage}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 4. Grid: Triage Urgency & Community BMI Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Triage Urgency Distribution */}
        <Card className="lg:col-span-6 border-slate-200">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-base font-bold text-slate-950 flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-rose-500" />
              ระดับความเร่งด่วนการคัดกรองสัญญาณชีพ (Triage Urgency)
            </CardTitle>
            <CardDescription className="text-xs">
              สัดส่วนผู้ป่วยแยกตามระดับความรุนแรง 5 ระดับมาตรฐาน
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 space-y-3 text-xs">
            {urgencyDistribution.map((u: any, idx: number) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800">{u.label}</span>
                  <span className="font-mono font-bold text-slate-900">
                    {u.count} คน <span className="text-slate-400 font-normal">({u.percentage}%)</span>
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${u.percentage}%`, backgroundColor: u.color }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Community BMI & Body Composition Distribution */}
        <Card className="lg:col-span-6 border-slate-200">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-base font-bold text-slate-950 flex items-center gap-2">
              <Scale className="h-5 w-5 text-emerald-600" />
              การกระจายตัวดัชนีมวลกายในชุมชน (Community BMI Profile)
            </CardTitle>
            <CardDescription className="text-xs">
              สัดส่วนภาวะโภชนาการและสุขภาพผู้ป่วยตามเกณฑ์มาตรฐานเอเชีย
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 space-y-3 text-xs">
            {bmiDistribution.map((b: any, idx: number) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800">{b.category}</span>
                  <span className="font-mono font-bold text-slate-900">
                    {b.count} คน <span className="text-slate-400 font-normal">({b.percentage}%)</span>
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${b.percentage}%`, backgroundColor: b.color }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* 5. Grid: Lab Analytics & Top Prescribed Drugs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Lab Orders & Diagnostic Stats */}
        <Card className="lg:col-span-6 border-slate-200">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-base font-bold text-slate-950 flex items-center gap-2">
              <TestTube className="h-5 w-5 text-blue-600" />
              สถิติการส่งตรวจแล็บ (Laboratory Diagnostic Analytics)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4 text-xs">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-100">
                <span className="text-[10px] text-blue-700 block font-medium">สั่งตรวจทั้งหมด</span>
                <span className="font-mono text-lg font-black text-blue-950">{labStats.total}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100">
                <span className="text-[10px] text-emerald-700 block font-medium">ตรวจสำเร็จแล้ว</span>
                <span className="font-mono text-lg font-black text-emerald-950">{labStats.completed}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-100">
                <span className="text-[10px] text-rose-700 block font-medium">อัตราผลผิดปกติ</span>
                <span className="font-mono text-lg font-black text-rose-950">{labStats.abnormalRate}%</span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="font-bold text-slate-800 block text-[11px]">ชุดการตรวจที่ส่งบ่อย:</span>
              {labStats.topTests?.length > 0 ? (
                labStats.topTests.map((t: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="font-medium text-slate-800">{t.name}</span>
                    <span className="font-mono font-bold text-blue-700">{t.count} ครั้ง</span>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 italic">ไม่มีข้อมูลการส่งตรวจแล็บ</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Prescribed Drugs */}
        <Card className="lg:col-span-6 border-slate-200">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-base font-bold text-slate-950 flex items-center gap-2">
              <Pill className="h-5 w-5 text-purple-600" />
              ยาที่สั่งจ่ายมากที่สุด (Top Prescribed Medications)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-2.5 text-xs">
            {topDrugs.length > 0 ? (
              topDrugs.map((drug: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50/70">
                  <div>
                    <span className="font-bold text-slate-900 block">{drug.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{drug.genericName}</span>
                  </div>
                  <div className="text-right font-mono">
                    <span className="font-bold text-purple-700 block">{drug.count} ครั้ง</span>
                    <span className="text-[10px] text-slate-500">รวม {drug.quantity} หน่วย</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-400 text-center py-8">ไม่มีข้อมูลการสั่งจ่ายยา</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
