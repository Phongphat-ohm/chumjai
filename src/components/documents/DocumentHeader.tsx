"use client";

import React from "react";
import { DocumentQrCode } from "@/components/documents/DocumentQrCode";

export interface DocumentClinicInfo {
  clinicName: string;
  address: string;
  phone: string;
  email?: string;
  licenseNo?: string;
  directorName?: string;
  logoUrl?: string;
  accentColor?: string;
  footerText?: string;
  signatureTitle?: string;
  showLogo?: boolean;
}

interface DocumentHeaderProps {
  clinic: DocumentClinicInfo;
  docTitle: string;
  docSubtitle?: string;
  docNumber?: string;
  qrCodeValue?: string;
  qrCodeLabel?: string;
  rightContent?: React.ReactNode;
}

/**
 * 🏛️ หัวกระดาษเอกสารทางการแพทย์มาตรฐานราชการไทย (Official Thai Government Header - ขาวดำ 100%)
 * ใช้ฟอนต์ TH Sarabun New ขนาดตามระเบียบสารบรรณ
 */
export function DocumentHeader({
  clinic,
  docTitle,
  docSubtitle,
  docNumber,
  qrCodeValue,
  qrCodeLabel,
  rightContent,
}: DocumentHeaderProps) {
  return (
    <div className="font-sarabun text-black border-b-2 border-black pb-3">
      {/* แถวบน: ข้อมูลสถานพยาบาล และ QR Code ยืนยันเอกสาร */}
      <div className="flex justify-between items-start">
        {/* ฝั่งซ้าย: ข้อมูลสถานพยาบาลทางการ */}
        <div className="space-y-0.5 max-w-[500px]">
          <h1 className="text-[19pt] font-bold text-black leading-tight tracking-tight">
            {clinic.clinicName}
          </h1>
          <p className="text-[14.5pt] text-black leading-snug">
            {clinic.address}
          </p>
          <div className="flex flex-wrap items-center gap-x-4 text-[14pt] text-black pt-0.5">
            {clinic.phone && <span>โทรศัพท์: {clinic.phone}</span>}
            {clinic.email && <span>อีเมล: {clinic.email}</span>}
            {clinic.licenseNo && (
              <span>เลขที่ใบอนุญาต: {clinic.licenseNo}</span>
            )}
          </div>
        </div>

        {/* ฝั่งขวา: QR Code ตรวจสอบเอกสาร และเลขอ้างอิง */}
        <div className="flex items-start gap-3 shrink-0">
          {qrCodeValue && (
            <DocumentQrCode
              value={qrCodeValue}
              size={64}
              label={qrCodeLabel || docNumber}
            />
          )}
          {rightContent}
        </div>
      </div>

      {/* แถวล่าง: ชื่อเรื่องเอกสาร (21pt ตัวหนา จัดกึ่งกลาง) และเลขที่/วันที่ */}
      <div className="mt-4 pt-2 border-t border-black text-center relative">
        <h2 className="text-[21pt] font-bold text-black tracking-wide leading-tight">
          {docTitle}
        </h2>
        <div className="flex justify-between items-center text-[14.5pt] text-black mt-1 font-normal">
          <div>
            {docNumber && (
              <span>
                <strong>เลขที่:</strong> {docNumber}
              </span>
            )}
          </div>
          <div>
            {docSubtitle && <span>{docSubtitle}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

/** ท้ายเอกสารพร้อมช่องลงลายมือชื่อมาตรฐานราชการไทย (ขาว-ดำ 100%) */
interface DocumentFooterProps {
  clinic: DocumentClinicInfo;
  signatoryName?: string;
  signatoryTitle?: string;
  licenseNumber?: string;
  leftNote?: string;
}

export function DocumentFooter({
  clinic,
  signatoryName,
  signatoryTitle,
  licenseNumber,
  leftNote,
}: DocumentFooterProps) {
  const resolvedTitle =
    signatoryTitle || clinic.signatureTitle || "แพทย์ผู้ตรวจรักษา";
  const resolvedName =
    signatoryName || clinic.directorName || "......................................................";
  const resolvedNote =
    leftNote ||
    clinic.footerText ||
    `* เอกสารฉบับนี้ออกโดยระบบสารสนเทศทางการแพทย์ ${clinic.clinicName}`;

  return (
    <div className="font-sarabun border-t border-black pt-4 mt-6 flex justify-between items-end text-[14pt] text-black">
      <div className="space-y-1 max-w-sm">
        <p className="leading-tight text-[13.5pt] text-black">{resolvedNote}</p>
        <p className="text-[13.5pt] text-black font-medium">
          {clinic.clinicName} · โทร. {clinic.phone}
        </p>
      </div>

      <div className="text-center space-y-1 shrink-0">
        <p className="text-[15pt] font-normal mb-8">ลงชื่อ ................................................................</p>
        <p className="text-[16pt] font-bold text-black leading-tight">
          ({resolvedName})
        </p>
        <p className="text-[15pt] text-black">{resolvedTitle}</p>
        {licenseNumber && (
          <p className="text-[14pt] text-black">
            เลขที่ใบอนุญาตประกอบวิชาชีพ: {licenseNumber}
          </p>
        )}
      </div>
    </div>
  );
}

