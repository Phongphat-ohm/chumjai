"use client";

import React, { forwardRef } from "react";
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
 * 🧪 เทมเพลต: ใบรายงานผลการตรวจทางห้องปฏิบัติการ (มาตรฐานเอกสารราชการไทย - ขาวดำ 100%)
 * กระดาษมาตรฐาน A4 (210 x 297 mm) ฟอนต์ TH Sarabun New
 */
export const LabReportTemplate = forwardRef<HTMLDivElement, LabReportTemplateProps>(
  ({ clinicInfo, labOrder }, ref) => {
    const results = labOrder.results || [];
    const hasAbnormal = results.some((r) => r.isAbnormal);

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
        className="font-sarabun bg-white text-black print:m-0 mx-auto shrink-0"
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
          qrCodeValue={`LAB:${labOrder.id.slice(0, 8).toUpperCase()}|HN:${labOrder.patient.hn}|VISIT:${labOrder.visit.visitNumber}`}
          qrCodeLabel={`LAB-${labOrder.id.slice(0, 8).toUpperCase()}`}
          docSubtitle={`วันที่ตรวจวิเคราะห์: ${reportDate} เวลา ${reportTime} น.`}
        />

        <div className="mt-5 space-y-4 text-[16pt] text-black leading-relaxed">
          {/* ข้อมูลประจำตัวผู้ป่วยและเลขที่สั่งตรวจ */}
          <div className="border border-black p-3 text-[15.5pt]">
            <div className="grid grid-cols-2 gap-y-1 gap-x-4">
              <div>
                <span className="font-semibold">ชื่อ-นามสกุล ผู้ป่วย: </span>
                <span className="font-bold">{labOrder.patient.firstName} {labOrder.patient.lastName}</span>
              </div>
              <div>
                <span className="font-semibold">เลขประจำตัว (HN): </span>
                <span className="font-bold">{labOrder.patient.hn}</span>
              </div>
              <div>
                <span className="font-semibold">ลำดับการตรวจ (Visit No): </span>
                <span>{labOrder.visit.visitNumber}</span>
              </div>
              <div>
                <span className="font-semibold">ชุดการตรวจวิเคราะห์: </span>
                <span className="font-bold">{labOrder.testName}</span>
              </div>
            </div>
          </div>

          {/* สรุปสถานะผลตรวจ */}
          {hasAbnormal ? (
            <div className="border border-black p-2 text-[15pt]">
              <strong>ข้อสังเกต: </strong> มีบางรายการตรวจวิเคราะห์พบค่าเกินเกณฑ์อ้างอิงมาตรฐาน (โปรดดูรายละเอียดในตาราง)
            </div>
          ) : (
            <div className="border border-black p-2 text-[15pt]">
              <strong>สรุปผล: </strong> ผลการตรวจวิเคราะห์ทั้งหมดอยู่ในเกณฑ์ปกติมาตรฐาน
            </div>
          )}

          {/* ตารางที่ 1 ผลการตรวจวิเคราะห์ทางห้องปฏิบัติการ */}
          <div>
            <h3 className="text-[16.5pt] font-bold text-black mb-1">
              ตารางที่ 1 รายการตรวจวิเคราะห์และผลการทดสอบ (Laboratory Test Results)
            </h3>
            <table className="w-full border-collapse border border-black text-left text-[14.5pt]">
              <thead>
                <tr className="border-b border-black bg-white">
                  <th className="border-r border-black p-1.5 text-center w-12 font-bold">ลำดับ</th>
                  <th className="border-r border-black p-1.5 font-bold">รายการตรวจวิเคราะห์</th>
                  <th className="border-r border-black p-1.5 text-center font-bold">ผลที่ตรวจได้</th>
                  <th className="border-r border-black p-1.5 text-center font-bold">หน่วย</th>
                  <th className="border-r border-black p-1.5 text-center font-bold">ค่าอ้างอิงมาตรฐาน</th>
                  <th className="p-1.5 text-center font-bold w-20">แปลผล</th>
                </tr>
              </thead>
              <tbody>
                {results.length > 0 ? (
                  results.map((r, i) => (
                    <tr key={r.id || i} className="border-b border-black">
                      <td className="border-r border-black p-1.5 text-center">{i + 1}</td>
                      <td className="border-r border-black p-1.5">{r.paramName}</td>
                      <td className={`border-r border-black p-1.5 text-center ${r.isAbnormal ? "font-bold" : ""}`}>
                        {r.value}
                      </td>
                      <td className="border-r border-black p-1.5 text-center">{r.unit || "-"}</td>
                      <td className="border-r border-black p-1.5 text-center">{r.normalRange || "-"}</td>
                      <td className={`p-1.5 text-center ${r.isAbnormal ? "font-bold" : ""}`}>
                        {r.isAbnormal ? "ผิดปกติ" : "ปกติ"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr className="border-b border-black">
                    <td colSpan={6} className="p-3 text-center italic">
                      อยู่ระหว่างการตรวจวิเคราะห์หรือไม่มีรายการผลตรวจ
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* หมายเหตุทางวิชาชีพ */}
          <div className="border border-black p-3 text-[14pt] space-y-0.5">
            <p className="font-bold">หมายเหตุ:</p>
            <p className="gov-indent">
              ผลการตรวจทางห้องปฏิบัติการนี้มีผลสมบูรณ์เฉพาะสิ่งส่งตรวจที่ได้รับ และต้องนำไปแปลผลร่วมกับอาการทางคลินิกโดยแพทย์ผู้ตรวจรักษาเท่านั้น
            </p>
          </div>
        </div>

        {/* ท้ายเอกสารและลายมือชื่อผู้รายงานผล */}
        <div className="mt-8">
          <DocumentFooter
            clinic={clinicInfo}
            signatoryName={clinicInfo.directorName || "นักเทคนิคการแพทย์วิชาชีพ"}
            signatoryTitle="นักเทคนิคการแพทย์ / ผู้ตรวจวิเคราะห์และอนุมัติผล (ทนพ.)"
            licenseNumber="ทนพ. 12345"
            leftNote={`* ผลการตรวจวิเคราะห์ได้รับการรับรองคุณภาพมาตรฐานห้องปฏิบัติการ ${clinicInfo.clinicName}`}
          />
        </div>
      </div>
    );
  }
);

LabReportTemplate.displayName = "LabReportTemplate";
