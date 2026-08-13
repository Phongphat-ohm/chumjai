"use client";

import React from "react";
import { Printer, X, Send, Building2, User, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ReferralLetterModalProps {
  isOpen: boolean;
  referral: {
    id: string;
    hospitalName: string;
    reason: string;
    diagnosisSummary?: string;
    status: string;
    createdAt: string;
    patient: {
      hn: string;
      nationalId?: string;
      firstName: string;
      lastName: string;
      gender: string;
      dateOfBirth: string;
      phoneNumber: string;
      address?: string;
    };
    visit: {
      visitNumber: string;
      vitalSigns?: any[];
      consultation?: {
        soapNote?: {
          subjective?: string;
          objective?: string;
          assessment?: string;
          plan?: string;
        };
        diagnoses?: any[];
      };
    };
  } | null;
  onClose: () => void;
}

export function ReferralLetterModal({
  isOpen,
  referral,
  onClose,
}: ReferralLetterModalProps) {
  if (!isOpen || !referral) return null;

  const handlePrint = () => {
    window.print();
  };

  const patient = referral.patient;
  const visit = referral.visit;
  const vitals = visit.vitalSigns?.[0];
  const soap = visit.consultation?.soapNote;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-3xl rounded-xl bg-white shadow-2xl border border-chunjai-100 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-chunjai-100 px-6 py-4 bg-chunjai-50/60 rounded-t-xl shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-chunjai-600 text-white">
              <Printer className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-chunjai-950">
                หนังสือส่งตัวผู้ป่วยเพื่อการตรวจและรักษาต่อ (Official Referral Letter)
              </h3>
              <p className="text-xs text-slate-500">
                เอกสารทางการสำหรับยื่นต่อสถานพยาบาลปลายทางรับส่งต่อ
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
              พิมพ์หนังสือส่งตัว (Print)
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Printable Official Referral Letter Body */}
        <div className="p-6 text-xs space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="border-2 border-slate-900 rounded-xl p-8 bg-white space-y-6 shadow-sm print:border-black print:shadow-none">
            {/* Header Banner */}
            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
              <div>
                <h1 className="text-lg font-black text-slate-950">
                  ชุมใจคลินิกเวชกรรม (Chunjai Community Clinic)
                </h1>
                <p className="text-xs text-slate-600">
                  99/1 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพมหานคร 10110 · โทร. 02-123-4567
                </p>
              </div>
              <div className="text-right">
                <Badge variant="outline" className="border-slate-900 font-mono text-xs px-3 py-1 font-bold">
                  หนังสือส่งตัวผู้ป่วย
                </Badge>
                <p className="text-[10px] text-slate-500 mt-1 font-mono">
                  วันที่ออก: {new Date(referral.createdAt).toLocaleDateString("th-TH")}
                </p>
              </div>
            </div>

            {/* Destination Info */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-300 space-y-1">
              <span className="text-slate-500 font-bold text-[11px]">เรียน:</span>
              <h2 className="text-base font-black text-slate-950">
                ผู้อำนวยการ / ทีมแพทย์รับส่งต่อ {referral.hospitalName}
              </h2>
              <p className="text-xs text-slate-700">
                เรื่อง: ขอส่งตัวผู้ป่วยเพื่อรับการตรวจวินิจฉัยและรักษาต่อ
              </p>
            </div>

            {/* Patient Demographics */}
            <div className="space-y-2">
              <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 border-b border-slate-200 pb-1">
                <User className="h-4 w-4 text-chunjai-600" />
                1. ข้อมูลประจำตัวผู้ป่วย (Patient Demographics)
              </h3>
              <div className="grid grid-cols-3 gap-3 pl-2">
                <div>
                  <span className="text-slate-500 text-[10px] block">ชื่อ-นามสกุล:</span>
                  <span className="font-bold text-slate-950 text-sm">
                    {patient.firstName} {patient.lastName}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">HN:</span>
                  <span className="font-bold font-mono text-chunjai-700">{patient.hn}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">เลขประจำตัวประชาชน:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {patient.nationalId || "ไม่ระบุ"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">เพศ / เบอร์โทร:</span>
                  <span className="font-bold text-slate-900">
                    {patient.gender === "MALE" ? "ชาย" : "หญิง"} · {patient.phoneNumber}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500 text-[10px] block">ที่อยู่ตามทะเบียน:</span>
                  <span className="text-slate-900">{patient.address || "ไม่ระบุ"}</span>
                </div>
              </div>
            </div>

            {/* Vitals & SOAP Summary */}
            <div className="space-y-2">
              <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 border-b border-slate-200 pb-1">
                <FileText className="h-4 w-4 text-chunjai-600" />
                2. สรุปประวัติและสัญญาณชีพเบื้องต้น (Clinical History & Vitals)
              </h3>
              <div className="pl-2 space-y-2">
                {vitals && (
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs font-mono">
                    BP: <strong>{vitals.systolicBp}/{vitals.diastolicBp} mmHg</strong> · PR: <strong>{vitals.pulseRate} bpm</strong> · Temp: <strong>{vitals.temperatureC} °C</strong> · BMI: <strong>{vitals.bmi}</strong>
                  </div>
                )}

                {referral.diagnosisSummary && (
                  <div>
                    <span className="text-slate-500 text-[10px] block font-bold">การวินิจฉัยโรคเบื้องต้น:</span>
                    <p className="font-semibold text-slate-900 bg-amber-50/60 p-2.5 rounded border border-amber-200">
                      {referral.diagnosisSummary}
                    </p>
                  </div>
                )}

                {soap?.subjective && (
                  <div>
                    <span className="text-slate-500 text-[10px] block">อาการสำคัญ (Chief Complaint):</span>
                    <p className="text-slate-800">{soap.subjective}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Reason for Referral */}
            <div className="space-y-2">
              <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 border-b border-slate-200 pb-1">
                <Send className="h-4 w-4 text-chunjai-600" />
                3. เหตุผลและจุดประสงค์ในการส่งตัว (Reason for Referral)
              </h3>
              <div className="pl-2">
                <p className="font-bold text-chunjai-950 bg-chunjai-50 p-3 rounded-lg border border-chunjai-200 text-sm">
                  {referral.reason}
                </p>
              </div>
            </div>

            {/* Doctor Signature */}
            <div className="border-t border-slate-300 pt-8 flex justify-between items-end">
              <div className="text-[10px] text-slate-500">
                <p>* เอกสารส่งตัวฉบับนี้ออกโดยระบบบริหารจัดการคลินิก ชุมใจ (Chunjai)</p>
                <p className="font-mono">Ref ID: {referral.id}</p>
              </div>

              <div className="text-center space-y-1">
                <div className="w-48 border-b border-slate-400 mx-auto"></div>
                <p className="font-bold text-slate-950">แพทย์ผู้ตรวจและส่งตัวผู้ป่วย</p>
                <p className="text-[10px] text-slate-500">ชุมใจคลินิกเวชกรรม</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
