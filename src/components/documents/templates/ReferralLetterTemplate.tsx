"use client";

import React, { forwardRef } from "react";
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
 * 📄 เทมเพลต: หนังสือส่งตัวผู้ป่วยเพื่อการตรวจและรักษาต่อ (มาตรฐานเอกสารราชการไทย - ขาวดำ 100%)
 * กระดาษมาตรฐาน A4 (210 x 297 mm) ฟอนต์ TH Sarabun New
 */
export const ReferralLetterTemplate = forwardRef<HTMLDivElement, ReferralLetterTemplateProps>(
  ({ clinicInfo, referral }, ref) => {
    const patient = referral.patient;
    const visit = referral.visit;
    const vitals = visit.vitalSigns?.[0];
    const soap = visit.consultation?.soapNote;
    const diagnoses = visit.consultation?.diagnoses || [];
    const rxItems = visit.prescription?.items || [];

    let ageText = "ไม่ระบุ";
    if (patient.dateOfBirth) {
      const birth = new Date(patient.dateOfBirth);
      const diff = Date.now() - birth.getTime();
      const ageDate = new Date(diff);
      const calcAge = Math.abs(ageDate.getUTCFullYear() - 1970);
      ageText = `${calcAge} ปี`;
    }

    const docDateStr = new Date(referral.createdAt).toLocaleDateString("th-TH", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    return (
      <div
        ref={ref}
        className="font-sarabun bg-white text-black print:m-0 mx-auto shrink-0"
        style={{
          width: "794px",
          minHeight: "1123px",
          padding: "40px 48px",
          boxSizing: "border-box",
        }}
      >
        {/* หัวกระดาษราชการ */}
        <DocumentHeader
          clinic={clinicInfo}
          docTitle="หนังสือส่งตัวผู้ป่วยเพื่อการตรวจและรักษาต่อ"
          docNumber={`REF-${referral.id.slice(0, 8).toUpperCase()}`}
          qrCodeValue={`REF:${referral.id.slice(0, 8).toUpperCase()}|HN:${patient.hn}|CID:${patient.nationalId || ""}`}
          qrCodeLabel={`REF-${referral.id.slice(0, 8).toUpperCase()}`}
          docSubtitle={`วันที่ออกเอกสาร: ${docDateStr}`}
        />

        <div className="mt-5 space-y-4 text-[16pt] text-black leading-relaxed">
          {/* ข้อมูลการส่งต่อปลายทาง */}
          <div className="border border-black p-3 space-y-1">
            <div className="flex justify-between items-baseline">
              <div>
                <span className="font-bold">เรียน: </span>
                <span className="font-bold text-[16.5pt]">
                  ผู้อำนวยการ / แพทย์ผู้รับการส่งต่อ {referral.hospitalName}
                </span>
              </div>
              <span className="text-[14pt] font-semibold border border-black px-2 py-0.5">
                สถานะ: {referral.status === "PENDING" ? "รอดำเนินการ" : "ส่งตัวเรียบร้อย"}
              </span>
            </div>
            <p className="text-[15.5pt] gov-indent leading-snug">
              ด้วย {clinicInfo.clinicName} ขอส่งตัวผู้ป่วยตามรายละเอียดด้านล่างนี้ เพื่อรับการตรวจวินิจฉัยและรักษาต่อตามดุลยพินิจทางการแพทย์
            </p>
          </div>

          {/* ตอนที่ 1: ข้อมูลประจำตัวและสิทธิการรักษาของผู้ป่วย */}
          <div className="space-y-1.5 border-b border-black pb-3">
            <h3 className="text-[17.5pt] font-bold text-black">
              1. ข้อมูลประจำตัวและสิทธิการรักษาของผู้ป่วย
            </h3>
            <div className="grid grid-cols-3 gap-y-1 gap-x-4 pl-4 text-[15.5pt]">
              <div>
                <span className="font-semibold">ชื่อ-นามสกุล: </span>
                <span>{patient.firstName} {patient.lastName}</span>
              </div>
              <div>
                <span className="font-semibold">เลขประจำตัว (HN): </span>
                <span className="font-bold">{patient.hn}</span>
              </div>
              <div>
                <span className="font-semibold">เลขประจำตัวประชาชน: </span>
                <span>{patient.nationalId || "ไม่ระบุ"}</span>
              </div>
              <div>
                <span className="font-semibold">เพศ / อายุ: </span>
                <span>{patient.gender === "MALE" ? "ชาย" : "หญิง"} ({ageText})</span>
              </div>
              <div>
                <span className="font-semibold">สิทธิการรักษา: </span>
                <span>{patient.rightsType || "หลักประกันสุขภาพถ้วนหน้า"}</span>
              </div>
              <div>
                <span className="font-semibold">โทรศัพท์: </span>
                <span>{patient.phoneNumber || "-"}</span>
              </div>
              <div className="col-span-3">
                <span className="font-semibold">ที่อยู่: </span>
                <span>{patient.address || "ไม่ระบุที่อยู่"}</span>
              </div>
            </div>
          </div>

          {/* ตอนที่ 2: ประวัติการเจ็บป่วยและสัญญาณชีพแรกรับ */}
          <div className="space-y-1.5 border-b border-black pb-3">
            <h3 className="text-[17.5pt] font-bold text-black">
              2. ประวัติการเจ็บป่วยและสัญญาณชีพแรกรับ (Clinical Summary & Vital Signs)
            </h3>
            <div className="pl-4 space-y-1.5 text-[15.5pt]">
              {vitals ? (
                <table className="w-full border-collapse border border-black text-center text-[15pt]">
                  <thead>
                    <tr className="border-b border-black bg-white">
                      <th className="border-r border-black p-1 font-bold">ความดันโลหิต (BP)</th>
                      <th className="border-r border-black p-1 font-bold">ชีพจร (PR)</th>
                      <th className="border-r border-black p-1 font-bold">อุณหภูมิ (Temp)</th>
                      <th className="border-r border-black p-1 font-bold">น้ำหนัก / ส่วนสูง</th>
                      <th className="p-1 font-bold">ดัชนีมวลกาย (BMI)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border-r border-black p-1">{vitals.systolicBp}/{vitals.diastolicBp} mmHg</td>
                      <td className="border-r border-black p-1">{vitals.pulseRate} ครั้ง/นาที</td>
                      <td className="border-r border-black p-1">{vitals.temperatureC} °C</td>
                      <td className="border-r border-black p-1">{vitals.weightKg || "-"} กก. / {vitals.heightCm || "-"} ซม.</td>
                      <td className="p-1">{vitals.bmi || "-"}</td>
                    </tr>
                  </tbody>
                </table>
              ) : (
                <p className="italic">ไม่มีบันทึกสัญญาณชีพแรกรับ</p>
              )}

              {soap?.subjective && (
                <p className="pt-1">
                  <strong className="font-bold">อาการสำคัญ (Chief Complaint): </strong>
                  <span>{soap.subjective}</span>
                </p>
              )}

              {soap?.objective && (
                <p>
                  <strong className="font-bold">ผลการตรวจร่างกาย (Physical Exam): </strong>
                  <span>{soap.objective}</span>
                </p>
              )}
            </div>
          </div>

          {/* ตอนที่ 3: การวินิจฉัยโรคเบื้องต้น */}
          <div className="space-y-1.5 border-b border-black pb-3">
            <h3 className="text-[17.5pt] font-bold text-black">
              3. การวินิจฉัยโรคเบื้องต้น (Provisional Diagnosis / ICD-10)
            </h3>
            <div className="pl-4 text-[15.5pt]">
              <p className="font-bold">
                {referral.diagnosisSummary || "ตรวจพบอาการผิดปกติที่ต้องอาศัยการตรวจวินิจฉัยและรักษาต่อ"}
              </p>
              {diagnoses.length > 0 && (
                <ul className="list-disc list-inside mt-1 space-y-0.5">
                  {diagnoses.map((d: any, idx: number) => (
                    <li key={idx}>
                      <span className="font-bold">{d.icd10Code ? `[${d.icd10Code}] ` : ""}</span>
                      <span>{d.description || d.diagnosisName}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* ตอนที่ 4: การรักษาที่ได้ให้ไว้เบื้องต้นและยาปัจจุบัน */}
          {rxItems.length > 0 && (
            <div className="space-y-1.5 border-b border-black pb-3">
              <h3 className="text-[17.5pt] font-bold text-black">
                4. ยาและการรักษาเบื้องต้นที่ได้รับ (Current Treatments & Medications)
              </h3>
              <div className="pl-4 text-[15.5pt]">
                <ul className="list-decimal list-inside space-y-0.5">
                  {rxItems.map((item: any, idx: number) => (
                    <li key={idx}>
                      <span className="font-bold">{item.drug?.genericName || "ยา"} {item.drug?.strength || ""}</span>
                      <span> — วิธีใช้: {item.dosage} {item.frequency} (จำนวน {item.quantity} {item.drug?.unit || "หน่วย"})</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* ตอนที่ 5: เหตุผลและความจำเป็นในการส่งต่อ */}
          <div className="space-y-1.5">
            <h3 className="text-[17.5pt] font-bold text-black">
              5. เหตุผลและจุดประสงค์ในการส่งตัวผู้ป่วย (Reason for Referral)
            </h3>
            <div className="pl-4 text-[15.5pt]">
              <div className="border border-black p-2.5 font-bold">
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
            leftNote={`* เอกสารส่งต่อผู้ป่วยทางการ แพทย์ผู้รับส่งต่อสามารถดูประวัติสุขภาพต่อเนื่องผ่านระบบสารสนเทศ ${clinicInfo.clinicName}`}
          />
        </div>
      </div>
    );
  }
);

ReferralLetterTemplate.displayName = "ReferralLetterTemplate";
