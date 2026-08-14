"use client";

import React from "react";
import {
  FileText,
  Activity,
  HeartPulse,
  Pill,
  TestTube,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  Stethoscope,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface VisitDetailModalProps {
  isOpen: boolean;
  visit: any | null;
  patientName: string;
  hn: string;
  onClose: () => void;
}

const TRIAGE_URGENCY_MAP: Record<string, { label: string; bg: string }> = {
  RESUSCITATION: { label: "ระดับ 1 (วิกฤต - Resuscitation)", bg: "bg-rose-600 text-white" },
  EMERGENCY: { label: "ระดับ 2 (ฉุกเฉิน - Emergency)", bg: "bg-pink-600 text-white" },
  URGENT: { label: "ระดับ 3 (ด่วน - Urgent)", bg: "bg-amber-500 text-white" },
  SEMI_URGENT: { label: "ระดับ 4 (ไม่ด่วน - Semi-Urgent)", bg: "bg-emerald-600 text-white" },
  NON_URGENT: { label: "ระดับ 5 (ทั่วไป - Non-Urgent)", bg: "bg-slate-600 text-white" },
};

export function VisitDetailModal({
  isOpen,
  visit,
  patientName,
  hn,
  onClose,
}: VisitDetailModalProps) {
  if (!isOpen || !visit) return null;

  const vs = visit.vitalSigns?.[0];
  const consultation = visit.consultation;
  const soap = consultation?.soapNote;
  const diagnoses = consultation?.diagnoses || [];
  const prescription = visit.prescription;
  const prescriptionItems = prescription?.items || [];
  const labOrders = visit.labOrders || [];
  const triageRecord = visit.triageRecord;

  const triageObj = triageRecord
    ? TRIAGE_URGENCY_MAP[triageRecord.urgency] || { label: triageRecord.urgency, bg: "bg-slate-100 text-slate-700" }
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-2 sm:p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-3.5 bg-slate-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-chunjai-600 text-white shadow-md">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-950">
                  รายละเอียดเวชระเบียนการตรวจรักษา (Visit Record)
                </h3>
                <span className="font-mono text-xs font-bold text-chunjai-700 px-2 py-0.5 rounded bg-chunjai-100">
                  {visit.visitNumber}
                </span>
                <Badge variant="outline" className="text-[10px]">
                  สถานะ: {visit.status}
                </Badge>
              </div>
              <p className="text-xs text-slate-500">
                ผู้ป่วย: <span className="font-bold text-slate-800">{patientName}</span> (HN: {hn}) · 
                วันที่รับบริการ: {new Date(visit.createdAt).toLocaleDateString("th-TH")}{" "}
                {new Date(visit.createdAt).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })} น.
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-slate-500 hover:text-slate-900 rounded-lg"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {/* 1. Chief Complaint & Triage Summary */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-2">
              <div>
                <span className="text-[11px] text-slate-500 font-medium block">อาการสำคัญที่มาโรงพยาบาล:</span>
                <p className="font-bold text-slate-900 text-sm">{visit.chiefComplaint || "ไม่ระบุ"}</p>
              </div>
              {triageObj && (
                <div className="shrink-0">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${triageObj.bg}`}>
                    {triageObj.label}
                  </span>
                </div>
              )}
            </div>

            {triageRecord?.triageNote && (
              <p className="text-[11px] text-slate-600">
                <strong>บันทึกพยาบาลคัดกรอง:</strong> {triageRecord.triageNote}
              </p>
            )}
          </div>

          {/* 2. Vital Signs Section */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
              <HeartPulse className="h-4 w-4 text-chunjai-600" />
              สัญญาณชีพ & สัดส่วนร่างกาย (Vital Signs)
            </h4>
            {vs ? (
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5 text-center font-medium">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 block">ความดันโลหิต</span>
                  <span className="font-bold text-slate-900 font-mono text-xs">
                    {vs.systolicBp && vs.diastolicBp ? `${vs.systolicBp}/${vs.diastolicBp}` : "-"} mmHg
                  </span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 block">อุณหภูมิ</span>
                  <span className="font-bold text-slate-900 font-mono text-xs">
                    {vs.temperatureC || "-"} °C
                  </span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 block">ชีพจร</span>
                  <span className="font-bold text-slate-900 font-mono text-xs">
                    {vs.pulseRate || "-"} bpm
                  </span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 block">SpO2</span>
                  <span className="font-bold text-slate-900 font-mono text-xs">
                    {vs.spo2Percent || "-"} %
                  </span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 block">น้ำหนัก / ส่วนสูง</span>
                  <span className="font-bold text-slate-900 font-mono text-xs">
                    {vs.weightKg || "-"} kg / {vs.heightCm || "-"} cm
                  </span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 block">BMI</span>
                  <span className="font-bold text-chunjai-700 font-mono text-xs">
                    {vs.bmi ? `${vs.bmi} kg/m²` : "-"}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-slate-400 italic py-2">ไม่มีข้อมูลสัญญาณชีพในรอบการตรวจนี้</p>
            )}
          </div>

          {/* 3. Doctor SOAP Note & Diagnoses Section */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <h4 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
              <Stethoscope className="h-4 w-4 text-chunjai-600" />
              การตรวจรักษาของแพทย์ (Consultation & SOAP Note)
            </h4>

            {soap ? (
              <div className="space-y-2.5 bg-slate-50/50 p-4 rounded-xl border border-slate-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <span className="font-bold text-slate-700 block">Subjective (S) — อาการและประวัติ:</span>
                    <p className="p-2 bg-white rounded-lg border border-slate-200 text-slate-800 leading-relaxed">
                      {soap.subjective || "-"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="font-bold text-slate-700 block">Objective (O) — ผลตรวจร่างกาย:</span>
                    <p className="p-2 bg-white rounded-lg border border-slate-200 text-slate-800 leading-relaxed">
                      {soap.objective || "-"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <span className="font-bold text-slate-700 block">Assessment (A) — การประเมิน:</span>
                    <p className="p-2 bg-white rounded-lg border border-slate-200 text-slate-800 leading-relaxed">
                      {soap.assessment || "-"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="font-bold text-slate-700 block">Plan (P) — แผนการรักษา:</span>
                    <p className="p-2 bg-white rounded-lg border border-slate-200 text-slate-800 leading-relaxed">
                      {soap.plan || "-"}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-slate-400 italic py-2">ยังไม่มีการบันทึก SOAP Note จากแพทย์</p>
            )}

            {/* ICD-10 Diagnoses Table */}
            {diagnoses.length > 0 && (
              <div className="space-y-1.5">
                <span className="font-bold text-slate-800 block">การวินิจฉัยโรคตาม ICD-10:</span>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                  {diagnoses.map((d: any) => (
                    <div key={d.id} className="p-2.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Badge variant={d.type === "PRIMARY" ? "default" : "secondary"}>
                          {d.type === "PRIMARY" ? "โรคหลัก" : "โรคร่วม"}
                        </Badge>
                        <span className="font-mono font-bold text-slate-900">{d.icd10Code}</span>
                        <span className="text-slate-700">{d.icd10Name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 4. Prescribed Medications Section */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <h4 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
              <Pill className="h-4 w-4 text-chunjai-600" />
              รายการสั่งจ่ายยา (Prescription Items)
            </h4>

            {prescriptionItems.length > 0 ? (
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                    <tr>
                      <th className="px-3 py-2">ชื่อยา</th>
                      <th className="px-3 py-2">วิธีใช้ / ขนาดยา</th>
                      <th className="px-3 py-2 text-center">จำนวน</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {prescriptionItems.map((item: any) => (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="px-3 py-2">
                          <span className="font-bold text-slate-900 block">
                            {item.drug?.genericName} {item.drug?.strength}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {item.drug?.tradeName}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-slate-700">
                          {item.dosage} {item.frequency} {item.instructions}
                        </td>
                        <td className="px-3 py-2 text-center font-mono font-bold text-slate-900">
                          {item.quantity} {item.drug?.unit}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-slate-400 italic py-2">ไม่มีการสั่งยาในรอบการตรวจนี้</p>
            )}
          </div>

          {/* 5. Lab Orders & Results Section */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <h4 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
              <TestTube className="h-4 w-4 text-chunjai-600" />
              รายการตรวจแล็บ (Laboratory Orders & Results)
            </h4>

            {labOrders.length > 0 ? (
              <div className="space-y-2">
                {labOrders.map((order: any) => (
                  <div key={order.id} className="p-3 rounded-xl border border-slate-200 bg-white space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{order.testName}</span>
                      <Badge variant="outline" className="text-[10px]">
                        สถานะ: {order.status}
                      </Badge>
                    </div>
                    {order.results?.length > 0 && (
                      <div className="divide-y divide-slate-100 border border-slate-100 rounded-lg overflow-hidden text-[11px]">
                        {order.results.map((r: any) => (
                          <div key={r.id} className="px-3 py-1.5 flex justify-between">
                            <span className="text-slate-700">{r.paramName}</span>
                            <span className={`font-mono font-bold ${r.isAbnormal ? "text-rose-600" : "text-slate-900"}`}>
                              {r.value} {r.unit} (อ้างอิง: {r.normalRange || "-"})
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 italic py-2">ไม่มีรายการส่งตรวจแล็บในรอบการตรวจนี้</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3 border-t border-slate-200 bg-slate-50 shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="h-9 text-xs font-semibold"
          >
            ปิดหน้าต่าง
          </Button>
        </div>
      </div>
    </div>
  );
}
