"use client";

import React from "react";
import { Printer, X, TestTube, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface LabReportModalProps {
  isOpen: boolean;
  labOrder: {
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
  } | null;
  onClose: () => void;
}

export function LabReportModal({
  isOpen,
  labOrder,
  onClose,
}: LabReportModalProps) {
  if (!isOpen || !labOrder) return null;

  const handlePrint = () => {
    window.print();
  };

  const results = labOrder.results || [];
  const hasAbnormal = results.some((r) => r.isAbnormal);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl rounded-xl bg-white shadow-2xl border border-chunjai-100 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-chunjai-100 px-6 py-4 bg-chunjai-50/60 rounded-t-xl shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-chunjai-600 text-white">
              <Printer className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-chunjai-950">
                ใบรายงานผลการตรวจทางห้องปฏิบัติการ (Lab Report)
              </h3>
              <p className="text-xs text-slate-500">
                รายงานผลแล็บอย่างเป็นทางการสำหรับผู้ป่วยและเวชระเบียน
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handlePrint}
              className="bg-chunjai-600 hover:bg-chunjai-700 text-white font-bold text-xs"
            >
              <Printer className="mr-1.5 h-4 w-4" />
              พิมพ์ใบรายงานผล (Print)
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Printable Lab Report Body */}
        <div className="p-6 text-xs space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="border-2 border-slate-900 rounded-xl p-6 bg-white space-y-4 shadow-sm print:border-black print:shadow-none">
            {/* Report Clinic Header */}
            <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-chunjai-600 text-white">
                  <TestTube className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-950">
                    ใบรายงานผลการตรวจทางห้องปฏิบัติการ — ชุมใจคลินิก
                  </h2>
                  <p className="text-[10px] text-slate-500">
                    Chunjai Laboratory & Diagnostic Service
                  </p>
                </div>
              </div>
              <div className="text-right font-mono text-[11px]">
                <span className="text-slate-500 block">วันที่รายงาน:</span>
                <span className="font-bold text-slate-900">
                  {new Date(labOrder.createdAt).toLocaleDateString("th-TH")}
                </span>
              </div>
            </div>

            {/* Patient & Order Info Header */}
            <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div>
                <span className="text-slate-500 text-[10px] block">ชื่อผู้ป่วย:</span>
                <span className="font-bold text-slate-950 text-sm">
                  {labOrder.patient.firstName} {labOrder.patient.lastName}
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">HN / Visit No:</span>
                <span className="font-bold font-mono text-chunjai-700">
                  {labOrder.patient.hn} · {labOrder.visit.visitNumber}
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 text-[10px] block">ชุดการตรวจ:</span>
                <span className="font-bold text-slate-900">{labOrder.testName}</span>
              </div>
            </div>

            {/* Abnormal Alert Banner */}
            {hasAbnormal && (
              <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-800 font-bold">
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                <span>คำเตือน: พบค่าตรวจทางห้องปฏิบัติการบางพารามิเตอร์ผิดปกติจากค่าอ้างอิง</span>
              </div>
            )}

            {/* Parameters Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-800 uppercase text-[10px] font-bold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-2.5">รายการตรวจ (Parameter)</th>
                    <th className="px-4 py-2.5 text-right">ค่าที่ตรวจได้ (Result)</th>
                    <th className="px-4 py-2.5">หน่วย (Unit)</th>
                    <th className="px-4 py-2.5">ค่าปกติอ้างอิง (Reference Range)</th>
                    <th className="px-4 py-2.5 text-center">สถานะ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {results.map((r) => (
                    <tr key={r.id} className={r.isAbnormal ? "bg-rose-50/50 font-bold" : ""}>
                      <td className="px-4 py-3 text-slate-900">{r.paramName}</td>
                      <td className={`px-4 py-3 text-right font-mono text-sm ${r.isAbnormal ? "text-rose-700 font-black" : "text-slate-900"}`}>
                        {r.value}
                      </td>
                      <td className="px-4 py-3 text-slate-600 font-mono">{r.unit || "-"}</td>
                      <td className="px-4 py-3 text-slate-600 font-mono">{r.normalRange || "-"}</td>
                      <td className="px-4 py-3 text-center">
                        {r.isAbnormal ? (
                          <Badge variant="destructive" className="text-[10px]">
                            ผิดปกติ (High/Low)
                          </Badge>
                        ) : (
                          <Badge variant="success" className="text-[10px]">
                            ปกติ (Normal)
                          </Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer Signature */}
            <div className="border-t border-slate-200 pt-6 flex justify-between items-end text-[11px] text-slate-600">
              <div>
                <p>* ผลการตรวจใช้ประกอบการวินิจฉัยทางการแพทย์โดยแพทย์ผู้ดูแล</p>
                <p className="font-mono mt-0.5">ชุมใจคลินิกเวชกรรม โทร. 02-123-4567</p>
              </div>

              <div className="text-center space-y-1">
                <div className="w-40 border-b border-slate-400 mx-auto"></div>
                <p className="font-bold text-slate-900">นักเทคนิคการแพทย์ / นักวิทยาศาสตร์การแพทย์</p>
                <p className="text-[10px] text-slate-400">ผู้รายงานผลแล็บ</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
