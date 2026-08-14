"use client";

import React, { forwardRef } from "react";
import { User, Activity, Stethoscope, Send } from "lucide-react";
import {
  DocumentHeader,
  DocumentFooter,
  type DocumentClinicInfo,
} from "@/components/documents/DocumentHeader";

export interface ReferralLetterData {
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
    dateOfBirth?: string;
    phoneNumber: string;
    address?: string;
    rightsType?: string;
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
    prescription?: {
      items?: any[];
    };
  };
}

interface ReferralLetterTemplateProps {
  clinicInfo: DocumentClinicInfo;
  referral: ReferralLetterData;
}

/**
 * 📄 เทมเพลต: หนังสือส่งตัวผู้ป่วยเพื่อการตรวจและรักษาต่อ (MOPH Patient Referral Form)
 * กำหนดขนาดกระดาษมาตรฐาน A4 (794px) ไม่บีบอัด ไม่เบียดตัวหนังสือ
 */
export const ReferralLetterTemplate = forwardRef<HTMLDivElement, ReferralLetterTemplateProps>(
  ({ clinicInfo, referral }, ref) => {
    const patient = referral.patient;
    const visit = referral.visit;
    const vitals = visit.vitalSigns?.[0];
    const soap = visit.consultation?.soapNote;
    const diagnoses = visit.consultation?.diagnoses || [];
    const rxItems = visit.prescription?.items || [];
    const accent = clinicInfo.accentColor || "#1b5e3b";

    let ageText = "ไม่ระบุ";
    if (patient.dateOfBirth) {
      const birth = new Date(patient.dateOfBirth);
      const diff = Date.now() - birth.getTime();
      const ageDate = new Date(diff);
      const calcAge = Math.abs(ageDate.getUTCFullYear() - 1970);
      ageText = `${calcAge} ปี`;
    }

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
        {/* หัวกระดาษทางการ */}
        <DocumentHeader
          clinic={clinicInfo}
          docTitle="หนังสือส่งตัวผู้ป่วย"
          docNumber={`REF-${referral.id.slice(0, 8).toUpperCase()}`}
          docSubtitle={`วันที่ออกเอกสาร: ${new Date(referral.createdAt).toLocaleDateString("th-TH", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}`}
        />

        <div className="mt-6 space-y-5 text-sm leading-relaxed">
          {/* ข้อมูลการส่งต่อปลายทาง */}
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-semibold text-slate-600 block text-xs">เรียน:</span>
                <h2 className="text-base font-bold text-slate-950">
                  ผู้อำนวยการ / แพทย์ผู้รับการส่งต่อ {referral.hospitalName}
                </h2>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                สถานะ: {referral.status === "PENDING" ? "รอดำเนินการ" : "ส่งตัวเรียบร้อย"}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1.5">
              ด้วย {clinicInfo.clinicName} ขอส่งตัวผู้ป่วยตามรายละเอียดด้านล่างนี้ เพื่อรับการตรวจวินิจฉัยและรักษาต่อตามดุลยพินิจทางการแพทย์
            </p>
          </div>

          {/* ตอนที่ 1: ข้อมูลผู้ป่วย (Patient Demographics) */}
          <div className="space-y-2 border-b border-slate-200 pb-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <User className="h-4 w-4 shrink-0" style={{ color: accent }} />
              ตอนที่ 1: ข้อมูลประจำตัวและสิทธิการรักษาของผู้ป่วย
            </h3>
            <div className="grid grid-cols-3 gap-y-2.5 gap-x-6 pl-6 text-xs">
              <div>
                <span className="text-slate-500 block">ชื่อ-นามสกุล:</span>
                <span className="font-bold text-slate-950 text-sm">
                  {patient.firstName} {patient.lastName}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">เลขประจำตัวผู้ป่วย (HN):</span>
                <span className="font-bold font-mono text-sm" style={{ color: accent }}>
                  {patient.hn}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">เลขบัตรประชาชน (CID):</span>
                <span className="font-mono font-semibold text-slate-900">
                  {patient.nationalId || "ไม่ระบุ"}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">เพศ / อายุ:</span>
                <span className="font-medium text-slate-900">
                  {patient.gender === "MALE" ? "ชาย" : "หญิง"} ({ageText})
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">สิทธิการรักษาพยาบาล:</span>
                <span className="font-semibold text-slate-900">
                  {patient.rightsType || "หลักประกันสุขภาพถ้วนหน้า (บัตรทอง)"}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">เบอร์โทรศัพท์ติดต่อ:</span>
                <span className="font-medium text-slate-900">{patient.phoneNumber || "-"}</span>
              </div>
              <div className="col-span-3">
                <span className="text-slate-500 block">ที่อยู่ตามทะเบียน / ปัจจุบัน:</span>
                <span className="text-slate-800">{patient.address || "ไม่ระบุที่อยู่"}</span>
              </div>
            </div>
          </div>

          {/* ตอนที่ 2: สรุปประวัติและสัญญาณชีพ (Clinical History & Vitals) */}
          <div className="space-y-2 border-b border-slate-200 pb-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Activity className="h-4 w-4 shrink-0" style={{ color: accent }} />
              ตอนที่ 2: ประวัติการเจ็บป่วยและสัญญาณชีพแรกรับ (Clinical Summary & Vital Signs)
            </h3>
            <div className="pl-6 space-y-2.5 text-xs">
              {vitals ? (
                <div className="grid grid-cols-5 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 text-center font-mono">
                  <div className="border-r border-slate-200 pr-2">
                    <span className="text-[11px] text-slate-500 block">ความดัน (BP)</span>
                    <strong className="text-slate-950 text-sm">{vitals.systolicBp}/{vitals.diastolicBp}</strong>
                    <span className="text-[10px] text-slate-400 block">mmHg</span>
                  </div>
                  <div className="border-r border-slate-200 pr-2">
                    <span className="text-[11px] text-slate-500 block">ชีพจร (PR)</span>
                    <strong className="text-slate-950 text-sm">{vitals.pulseRate}</strong>
                    <span className="text-[10px] text-slate-400 block">bpm</span>
                  </div>
                  <div className="border-r border-slate-200 pr-2">
                    <span className="text-[11px] text-slate-500 block">อุณหภูมิ (Temp)</span>
                    <strong className="text-slate-950 text-sm">{vitals.temperatureC}</strong>
                    <span className="text-[10px] text-slate-400 block">°C</span>
                  </div>
                  <div className="border-r border-slate-200 pr-2">
                    <span className="text-[11px] text-slate-500 block">น้ำหนัก/ส่วนสูง</span>
                    <strong className="text-slate-950 text-xs">{vitals.weightKg || "-"} kg / {vitals.heightCm || "-"} cm</strong>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block">ดัชนีมวลกาย (BMI)</span>
                    <strong className="text-slate-950 text-sm">{vitals.bmi || "-"}</strong>
                  </div>
                </div>
              ) : (
                <p className="text-slate-500 italic">ไม่มีบันทึกสัญญาณชีพแรกรับ</p>
              )}

              {soap?.subjective && (
                <div className="pt-1">
                  <span className="font-bold text-slate-800">อาการสำคัญ (Chief Complaint): </span>
                  <span className="text-slate-900">{soap.subjective}</span>
                </div>
              )}

              {soap?.objective && (
                <div>
                  <span className="font-bold text-slate-800">ผลการตรวจร่างกาย (Physical Exam): </span>
                  <span className="text-slate-900">{soap.objective}</span>
                </div>
              )}
            </div>
          </div>

          {/* ตอนที่ 3: การวินิจฉัยโรคเบื้องต้น (Provisional Diagnosis) */}
          <div className="space-y-2 border-b border-slate-200 pb-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Stethoscope className="h-4 w-4 shrink-0" style={{ color: accent }} />
              ตอนที่ 3: การวินิจฉัยโรคเบื้องต้น (Provisional Diagnosis / ICD-10)
            </h3>
            <div className="pl-6">
              <div className="p-3 rounded-lg bg-amber-50/80 border border-amber-200 space-y-1">
                <p className="font-bold text-slate-950 text-sm">
                  {referral.diagnosisSummary || "ตรวจพบอาการผิดปกติที่ต้องอาศัยการตรวจวินิจฉัยและรักษาต่อ"}
                </p>
                {diagnoses.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {diagnoses.map((d: any, idx: number) => (
                      <span key={idx} className="px-2.5 py-0.5 rounded text-xs bg-amber-200/70 text-amber-900 font-mono font-medium">
                        {d.icd10Code ? `[${d.icd10Code}] ` : ""}{d.description || d.diagnosisName}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ตอนที่ 4: การรักษาที่ได้ให้ไว้แล้วและยาปัจจุบัน */}
          {rxItems.length > 0 && (
            <div className="space-y-2 border-b border-slate-200 pb-4">
              <h3 className="font-bold text-slate-900 text-sm">
                ตอนที่ 4: ยาและการรักษาเบื้องต้นที่ได้รับ (Current Treatments & Medications)
              </h3>
              <div className="pl-6">
                <ul className="list-disc list-inside space-y-1 text-xs text-slate-800">
                  {rxItems.map((item: any, idx: number) => (
                    <li key={idx}>
                      <span className="font-bold text-slate-950">{item.drug?.genericName || "ยา"} {item.drug?.strength || ""}</span>
                      <span className="text-slate-600"> — วิธีใช้: {item.dosage} {item.frequency} (จำนวน {item.quantity} {item.drug?.unit || "หน่วย"})</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* ตอนที่ 5: เหตุผลและความจำเป็นในการส่งต่อ (Reason for Referral) */}
          <div className="space-y-2">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Send className="h-4 w-4 shrink-0" style={{ color: accent }} />
              ตอนที่ 5: เหตุผลและจุดประสงค์ในการส่งตัวผู้ป่วย (Reason for Referral)
            </h3>
            <div className="pl-6">
              <div
                className="p-3.5 rounded-lg border text-sm font-semibold text-slate-950"
                style={{ backgroundColor: `${accent}0D`, borderColor: `${accent}33` }}
              >
                {referral.reason}
              </div>
            </div>
          </div>
        </div>

        {/* ท้ายเอกสารและลายมือชื่อแพทย์ผู้ส่งต่อ */}
        <div className="mt-8">
          <DocumentFooter
            clinic={clinicInfo}
            signatoryName={clinicInfo.directorName || "นายแพทย์ผู้ตรวจรักษา"}
            signatoryTitle="แพทย์ผู้ตรวจรักษาและส่งตัวผู้ป่วย"
            licenseNumber={clinicInfo.licenseNo || "ว. 45678"}
            leftNote={`* แบบฟอร์มส่งต่อผู้ป่วยทางการ แพทย์ผู้รับส่งต่อสามารถดูประวัติสุขภาพต่อเนื่องผ่านระบบสารสนเทศ ${clinicInfo.clinicName}`}
          />
        </div>
      </div>
    );
  }
);

ReferralLetterTemplate.displayName = "ReferralLetterTemplate";
