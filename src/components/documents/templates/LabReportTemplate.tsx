"use client";

import React, { forwardRef } from "react";
import { TestTube, AlertTriangle, CheckCircle } from "lucide-react";
import {
  DocumentHeader,
  DocumentFooter,
  type DocumentClinicInfo,
} from "@/components/documents/DocumentHeader";

export interface LabReportData {
  id: string;
  testName: string;
  createdAt: string;
  patient: {
    hn: string;
    firstName: string;
    lastName: string;
    gender?: string;
    birthDate?: string;
  };
  visit: {
    visitNumber: string;
  };
  results?: {
    id: string;
    paramName: string;
    value: string;
    unit?: string;
    normalRange?: string;
    isAbnormal: boolean;
  }[];
}

interface LabReportTemplateProps {
  clinicInfo: DocumentClinicInfo;
  labOrder: LabReportData;
}

/**
 * 🧪 เทมเพลต: ใบรายงานผลการตรวจทางห้องปฏิบัติการทางการแพทย์ (Clinical Diagnostic Lab Report)
 * กำหนดขนาดกระดาษมาตรฐาน A4 (794px) ไม่บีบอัด ไม่เบียดตัวหนังสือ
 */
export const LabReportTemplate = forwardRef<HTMLDivElement, LabReportTemplateProps>(
  ({ clinicInfo, labOrder }, ref) => {
    const results = labOrder.results || [];
    const hasAbnormal = results.some((r) => r.isAbnormal);
    const accent = clinicInfo.accentColor || "#1b5e3b";

    const reportDate = new Date(labOrder.createdAt).toLocaleDateString("th-TH", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const reportTime = new Date(labOrder.createdAt).toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return (
      <div
        ref={ref}
        className="font-sarabun bg-white text-slate-900 shadow-md print:shadow-none print:m-0"
        style={{
          width: "794px",
          minHeight: "1123px",
          padding: "40px 48px",
          boxSizing: "border-box",
        }}
      >
        {/* หัวเอกสารแล็บทางการ */}
        <DocumentHeader
          clinic={clinicInfo}
          docTitle="ใบรายงานผลการตรวจทางห้องปฏิบัติการ"
          docNumber={`LAB-${labOrder.id.slice(0, 8).toUpperCase()}`}
          docSubtitle={`วันที่ตรวจวิเคราะห์: ${reportDate} เวลา ${reportTime} น.`}
          rightContent={
            <div className="flex items-center gap-1.5 justify-end text-xs text-slate-500 font-medium mt-1">
              <TestTube className="h-3.5 w-3.5" style={{ color: accent }} />
              <span>Medical Diagnostic Laboratory</span>
            </div>
          }
        />

        <div className="mt-6 space-y-5 text-sm leading-relaxed">
          {/* ข้อมูลประจำตัวผู้ป่วยและเลขที่สั่งตรวจ */}
          <div className="grid grid-cols-4 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 block text-[11px]">ชื่อ-สกุล ผู้ป่วย:</span>
              <strong className="text-slate-950 text-sm block truncate">
                {labOrder.patient.firstName} {labOrder.patient.lastName}
              </strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">เลขประจำตัว (HN):</span>
              <strong className="font-mono text-sm block" style={{ color: accent }}>
                {labOrder.patient.hn}
              </strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">ลำดับการตรวจ (Visit No):</span>
              <strong className="font-mono text-slate-900 block text-xs">{labOrder.visit.visitNumber}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">ชุดการตรวจ (Profile):</span>
              <strong className="text-slate-900 block text-xs">{labOrder.testName}</strong>
            </div>
          </div>

          {/* แถบแจ้งเตือนผลตรวจผิดปกติ */}
          {hasAbnormal ? (
            <div className="flex items-center gap-2 rounded-lg border border-rose-300 bg-rose-50 p-3 text-xs text-rose-900 font-medium">
              <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
              <span>
                <strong>แจ้งเตือน:</strong> มีบางรายการตรวจพบค่าผิดปกติจากเกณฑ์อ้างอิงมาตรฐาน (High / Low) โปรดปรึกษาแพทย์ผู้ดูแล
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-300 bg-emerald-50 p-2.5 text-xs text-emerald-900 font-medium">
              <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>ผลการตรวจวิเคราะห์ทั้งหมดอยู่ในเกณฑ์ปกติ (Normal Reference Range)</span>
            </div>
          )}

          {/* ตารางรายการตรวจวิเคราะห์ (Lab Results Table) */}
          <div className="border border-slate-300 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 text-slate-900 font-bold border-b border-slate-300">
                <tr>
                  <th className="px-5 py-3 w-5/12">รายการตรวจวิเคราะห์ (Test Parameter)</th>
                  <th className="px-4 py-3 text-right w-2/12">ผลที่ตรวจได้ (Result)</th>
                  <th className="px-4 py-3 text-center w-2/12">หน่วย (Unit)</th>
                  <th className="px-4 py-3 text-center w-2/12">ค่าปกติอ้างอิง (Reference Range)</th>
                  <th className="px-4 py-3 text-center w-1/12">สถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {results.map((r, i) => (
                  <tr key={r.id || i} className={r.isAbnormal ? "bg-rose-50/70 font-semibold" : "hover:bg-slate-50"}>
                    <td className="px-5 py-3 text-slate-950 font-medium text-xs">{r.paramName}</td>
                    <td
                      className={`px-4 py-3 text-right font-mono text-sm ${
                        r.isAbnormal ? "text-rose-700 font-bold" : "text-slate-950 font-semibold"
                      }`}
                    >
                      {r.value}
                    </td>
                    <td className="px-4 py-3 text-center text-slate-600 font-mono">{r.unit || "-"}</td>
                    <td className="px-4 py-3 text-center text-slate-700 font-mono">{r.normalRange || "-"}</td>
                    <td className="px-4 py-3 text-center">
                      {r.isAbnormal ? (
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-200 text-rose-900 border border-rose-400 whitespace-nowrap">
                          ผิดปกติ
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-100 text-emerald-800 border border-emerald-300 whitespace-nowrap">
                          ปกติ
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* หมายเหตุทางวิชาชีพเทคนิคการแพทย์ */}
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 space-y-1">
            <p className="font-semibold text-slate-800">• การแปลผลการตรวจวิเคราะห์:</p>
            <p className="leading-relaxed">
              ผลการตรวจทางห้องปฏิบัติการนี้ต้องนำไปใช้แปลผลร่วมกับอาการทางคลินิกและประวัติการรักษาโดยแพทย์ผู้ดูแลเท่านั้น
            </p>
          </div>
        </div>

        {/* ท้ายเอกสารและลายมือชื่อผู้รายงานผล */}
        <div className="mt-10">
          <DocumentFooter
            clinic={clinicInfo}
            signatoryName={clinicInfo.directorName || "นักเทคนิคการแพทย์วิชาชีพ"}
            signatoryTitle="นักเทคนิคการแพทย์ / ผู้ตรวจวิเคราะห์และอนุมัติผล (ทนพ.)"
            licenseNumber="ทนพ. 12345"
            leftNote={`* ผลการตรวจวิเคราะห์ได้รับการรับรองคุณภาพมาตรฐานห้องปฏิบัติการทางการแพทย์ ${clinicInfo.clinicName}`}
          />
        </div>
      </div>
    );
  }
);

LabReportTemplate.displayName = "LabReportTemplate";
