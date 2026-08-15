"use client";

import React, { forwardRef } from "react";
import {
  DocumentHeader,
  DocumentFooter,
  type DocumentClinicInfo,
} from "@/components/documents/DocumentHeader";

export interface AppointmentSlipData {
  id: string;
  appointmentDate: string;
  reason?: string;
  notes?: string;
  patient: {
    hn: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    rightsType?: string;
  };
}

interface AppointmentSlipTemplateProps {
  clinicInfo: DocumentClinicInfo;
  appointment: AppointmentSlipData;
}

/**
 * 📅 เทมเพลต: ใบนัดหมายตรวจรักษาและติดตามผล (มาตรฐานเอกสารราชการไทย - ขาวดำ 100%)
 * กระดาษมาตรฐาน A4/A5 ฟอนต์ TH Sarabun New
 */
export const AppointmentSlipTemplate = forwardRef<HTMLDivElement, AppointmentSlipTemplateProps>(
  ({ clinicInfo, appointment }, ref) => {
    const appDate = new Date(appointment.appointmentDate);
    const dateStr = appDate.toLocaleDateString("th-TH", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const timeStr = appDate.toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return (
      <div
        ref={ref}
        className="font-sarabun bg-white text-black print:m-0 mx-auto shrink-0"
        style={{
          width: "794px",
          minHeight: "780px",
          padding: "40px 48px",
          boxSizing: "border-box",
        }}
      >
        {/* หัวกระดาษใบนัดหมาย */}
        <DocumentHeader
          clinic={clinicInfo}
          docTitle="ใบนัดหมายตรวจรักษาผู้ป่วยนอก"
          docNumber={`APP-${appointment.id.slice(0, 8).toUpperCase()}`}
          qrCodeValue={`APP:${appointment.id.slice(0, 8).toUpperCase()}|HN:${appointment.patient.hn}|DATE:${appointment.appointmentDate}`}
          qrCodeLabel={`APP-${appointment.id.slice(0, 8).toUpperCase()}`}
          docSubtitle={`วันที่ออกเอกสาร: ${new Date().toLocaleDateString("th-TH", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}`}
        />

        <div className="mt-5 space-y-4 text-[16pt] text-black leading-relaxed">
          {/* ข้อมูลประจำตัวผู้ป่วย */}
          <div className="border border-black p-3 text-[15.5pt]">
            <div className="grid grid-cols-2 gap-y-1 gap-x-4">
              <div>
                <span className="font-semibold">ชื่อ-นามสกุล ผู้ป่วย: </span>
                <span className="font-bold">{appointment.patient.firstName} {appointment.patient.lastName}</span>
              </div>
              <div className="text-right">
                <span className="font-semibold">เลขประจำตัว (HN): </span>
                <span className="font-bold">{appointment.patient.hn}</span>
              </div>
              <div>
                <span className="font-semibold">สิทธิการรักษา: </span>
                <span>{appointment.patient.rightsType || "หลักประกันสุขภาพถ้วนหน้า"}</span>
              </div>
              <div className="text-right">
                <span className="font-semibold">โทรศัพท์ติดต่อ: </span>
                <span>{appointment.patient.phoneNumber || "-"}</span>
              </div>
            </div>
          </div>

          {/* ตารางกำหนดวันและเวลานัดหมาย */}
          <div className="border border-black p-4 text-center space-y-1">
            <p className="text-[16pt] font-semibold">กำหนดวันและเวลาที่นัดหมายมาตรวจ</p>
            <p className="text-[20pt] font-bold">
              {dateStr}
            </p>
            <p className="text-[17pt] font-bold">
              เวลา {timeStr} น.
            </p>
          </div>

          {/* รายละเอียดและเหตุผลการนัด */}
          <div className="border border-black p-3 space-y-2 text-[15.5pt]">
            <div>
              <span className="font-bold">วัตถุประสงค์ / เหตุผลที่นัดหมาย: </span>
              <span>{appointment.reason || "ติดตามผลการรักษาและตรวจประเมินอาการต่อเนื่อง"}</span>
            </div>

            {appointment.notes && (
              <div>
                <span className="font-bold">คำแนะนำแพทย์เพิ่มเติม: </span>
                <span>{appointment.notes}</span>
              </div>
            )}
          </div>

          {/* คำแนะนำและการเตรียมตัวก่อนมาพบแพทย์ */}
          <div className="border border-black p-3 text-[14.5pt] space-y-1">
            <p className="font-bold text-[15pt]">คำแนะนำและการเตรียมตัวก่อนมาพบแพทย์:</p>
            <ul className="list-disc list-inside space-y-0.5 pl-2">
              <li>กรุณานำใบนัดหมายนี้ บัตรประจำตัวประชาชน และบัตรสิทธิการรักษามาแสดงทุกครั้ง</li>
              <li>หากมียาเดิมที่รับประทานประจำ กรุณานำซองยาเดิมมาด้วยเพื่อความต่อเนื่องในการรักษา</li>
              <li>กรณีมีรายการตรวจเลือดที่ต้องงดอาหาร กรุณางดน้ำและอาหารหลัง 20.00 น. ก่อนวันนัดหมาย</li>
              <li>หากไม่สามารถมาตามวันนัดได้ กรุณาติดต่อเลื่อนนัดล่วงหน้า โทร. {clinicInfo.phone}</li>
            </ul>
          </div>
        </div>

        {/* ท้ายเอกสารและลายมือชื่อผู้ออกใบนัด */}
        <div className="mt-8">
          <DocumentFooter
            clinic={clinicInfo}
            signatoryName={clinicInfo.directorName || "เจ้าหน้าที่ / แพทย์ผู้นัดหมาย"}
            signatoryTitle="แพทย์ / เจ้าหน้าที่ผู้ออกใบนัดหมาย"
            leftNote={`* สถานพยาบาลเปิดให้บริการตามวันและเวลาทำการ ติดต่อสอบถาม โทร. ${clinicInfo.phone}`}
          />
        </div>
      </div>
    );
  }
);

AppointmentSlipTemplate.displayName = "AppointmentSlipTemplate";
