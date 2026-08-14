"use client";

import React, { forwardRef } from "react";
import { CalendarDays, AlertCircle, Phone } from "lucide-react";
import {
  DocumentHeader,
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
 * 📅 เทมเพลต: ใบนัดหมายตรวจรักษาและติดตามผล (Hospital Outpatient Appointment Slip)
 * ออกแบบขนาดมาตรฐาน (720px) ไม่บีบอัด ไม่เบียดตัวหนังสือ
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

    const accent = clinicInfo.accentColor || "#1b5e3b";

    return (
      <div
        ref={ref}
        className="font-sarabun bg-white text-slate-900 shadow-md print:shadow-none print:m-0"
        style={{
          width: "720px",
          minHeight: "780px",
          padding: "36px 44px",
          boxSizing: "border-box",
        }}
      >
        {/* หัวกระดาษใบนัดหมาย */}
        <DocumentHeader
          clinic={clinicInfo}
          docTitle="ใบนัดหมายผู้ป่วย"
          docNumber={`APP-${appointment.id.slice(0, 8).toUpperCase()}`}
          rightContent={
            <div className="flex items-center gap-1.5 justify-end text-xs text-slate-500 font-medium mt-1">
              <CalendarDays className="h-3.5 w-3.5" style={{ color: accent }} />
              <span>Outpatient Appointment Slip</span>
            </div>
          }
        />

        <div className="mt-6 space-y-5 text-sm leading-relaxed">
          {/* ข้อมูลประจำตัวผู้ป่วย */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 block text-[11px]">ชื่อ-นามสกุล ผู้ป่วย:</span>
              <strong className="text-slate-950 text-sm">
                {appointment.patient.firstName} {appointment.patient.lastName}
              </strong>
            </div>
            <div className="text-right">
              <span className="text-slate-500 block text-[11px]">เลขประจำตัว (HN):</span>
              <strong className="font-mono text-sm" style={{ color: accent }}>
                {appointment.patient.hn}
              </strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">สิทธิการรักษา:</span>
              <span className="font-medium text-slate-900">
                {appointment.patient.rightsType || "หลักประกันสุขภาพถ้วนหน้า"}
              </span>
            </div>
            <div className="text-right">
              <span className="text-slate-500 block text-[11px]">เบอร์โทรศัพท์ติดต่อ:</span>
              <span className="font-medium text-slate-900">
                {appointment.patient.phoneNumber || clinicInfo.phone}
              </span>
            </div>
          </div>

          {/* กล่องกำหนดวัน-เวลานัดหมาย (ไฮไลต์โดดเด่นชัดเจน) */}
          <div
            className="p-5 rounded-xl border-2 space-y-2 text-center"
            style={{
              backgroundColor: `${accent}08`,
              borderColor: accent,
            }}
          >
            <span
              className="text-xs font-bold uppercase tracking-wider block"
              style={{ color: accent }}
            >
              ★ วันและเวลานัดหมายตรวจรักษา ★
            </span>
            <div className="text-2xl font-bold text-slate-950">
              {dateStr}
            </div>
            <div
              className="text-lg font-bold font-mono tracking-tight"
              style={{ color: accent }}
            >
              เวลา {timeStr} น.
            </div>
            <p className="text-xs text-slate-600 font-medium pt-1">
              แผนกตรวจ: ตรวจโรคทั่วไปและโรคเรื้อรัง (OPD Clinic)
            </p>
          </div>

          {/* วัตถุประสงค์และเหตุผลการนัด */}
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
            <span className="font-bold text-slate-900 block text-xs">
              วัตถุประสงค์ในการนัดหมาย:
            </span>
            <p className="text-slate-800 text-xs font-medium pl-2">
              {appointment.reason || "ตรวจติดตามอาการและรับยาต่อเนื่องตามแผนการรักษา"}
            </p>
          </div>

          {/* รายการสิ่งที่ต้องเตรียมตัวก่อนมาพบแพทย์ (Pre-visit Checklist) */}
          <div className="p-4 rounded-lg border border-amber-200 bg-amber-50/70 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-amber-900 text-xs">
              <AlertCircle className="h-4 w-4 text-amber-700 shrink-0" />
              <span>คำแนะนำและการเตรียมตัวก่อนมาพบแพทย์:</span>
            </div>
            <ul className="text-xs text-amber-950 space-y-1.5 pl-6 list-disc">
              {appointment.notes ? (
                <li className="font-medium text-amber-900">{appointment.notes}</li>
              ) : (
                <>
                  <li>กรุณานำใบนัดหมายฉบับนี้พร้อมบัตรประชาชนมาแสดง ณ จุดคัดกรอง</li>
                  <li>นำซองยาเดิมที่กำลังรับประทานอยู่ทั้งหมดมาด้วยทุกครั้ง</li>
                  <li>หากมีนัดเจาะเลือด กรุณางดน้ำและอาหารหลัง 20.00 น. ในคืนก่อนวันตรวจ</li>
                </>
              )}
            </ul>
          </div>

          {/* ท้ายใบนัดและเบอร์ติดต่อเลื่อนนัด */}
          <div className="border-t border-slate-200 pt-4 flex justify-between items-center text-xs text-slate-500">
            <div className="space-y-0.5">
              <p>* หากประสงค์จะเลื่อนวันนัดหมาย กรุณาแจ้งล่วงหน้าอย่างน้อย 1-2 วันทำการ</p>
              <p className="font-semibold text-slate-700 flex items-center gap-1">
                <Phone className="h-3.5 w-3.5" />
                ติดต่อศูนย์นัดหมาย: {clinicInfo.phone}
              </p>
            </div>
            <div className="text-right font-mono text-xs text-slate-400">
              {clinicInfo.clinicName}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

AppointmentSlipTemplate.displayName = "AppointmentSlipTemplate";
