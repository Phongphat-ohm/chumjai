"use client";

import React from "react";
import { Building2, ShieldCheck, HeartPulse } from "lucide-react";

import { DocumentQrCode } from "@/components/documents/DocumentQrCode";

export interface DocumentClinicInfo {
  clinicName: string;
  address: string;
  phone: string;
  email?: string;
  licenseNo?: string;
  directorName?: string;
  // Level 2 — Document Template settings
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
 * หัวกระดาษเอกสารทางการแพทย์มาตรฐานไทย (Official Thai Clinical Document Header)
 * ใช้ฟอนต์สารบรรณ (Sarabun) และจัดรูปแบบตามระเบียบสารบรรณ/กระทรวงสาธารณสุข
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
  const accent = clinic.accentColor || "#1b5e3b";

  return (
    <div
      className="font-sarabun flex justify-between items-start border-b-2 pb-4"
      style={{ borderColor: accent }}
    >
      {/* ฝั่งซ้าย: โลโก้และข้อมูลสถานพยาบาล */}
      <div className="flex items-start gap-3.5">
        {clinic.showLogo && clinic.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={clinic.logoUrl}
            alt="clinic logo"
            className="h-14 w-14 object-contain rounded-md border border-slate-200 p-1 bg-white shrink-0"
          />
        ) : (
          <div
            className="flex h-12 w-12 items-center justify-center rounded-lg text-white shrink-0 shadow-sm"
            style={{ backgroundColor: accent }}
          >
            <HeartPulse className="h-7 w-7" />
          </div>
        )}
        <div className="space-y-0.5">
          <h1 className="text-lg font-bold text-slate-950 leading-tight tracking-tight">
            {clinic.clinicName}
          </h1>
          <p className="text-xs text-slate-600 leading-normal max-w-md">
            {clinic.address}
          </p>
          <div className="flex flex-wrap items-center gap-x-3 text-[11px] text-slate-500 font-medium pt-0.5">
            {clinic.phone && <span>โทรศัพท์: {clinic.phone}</span>}
            {clinic.email && <span>อีเมล: {clinic.email}</span>}
            {clinic.licenseNo && (
              <span className="font-mono text-slate-600">
                เลขที่ใบอนุญาต: {clinic.licenseNo}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ฝั่งขวา: QR Code ยืนยันเอกสาร / ป้ายชื่อเอกสารและวันที่ออก */}
      <div className="flex items-start gap-3 shrink-0">
        {qrCodeValue && (
          <DocumentQrCode
            value={qrCodeValue}
            size={58}
            label={qrCodeLabel || docNumber}
            className="mt-0.5"
          />
        )}
        <div className="text-right">
          <div
            className="inline-block rounded-md px-3.5 py-1 text-white text-sm font-bold shadow-xs tracking-wide"
            style={{ backgroundColor: accent }}
          >
            {docTitle}
          </div>
          {docNumber && (
            <p className="text-xs font-mono font-semibold text-slate-700 mt-1">
              เลขที่: {docNumber}
            </p>
          )}
          {docSubtitle && (
            <p className="text-xs text-slate-500 mt-0.5">{docSubtitle}</p>
          )}
          {rightContent}
        </div>
      </div>
    </div>
  );
}

/** ท้ายเอกสารพร้อมช่องลงลายมือชื่อมาตรฐานทางการแพทย์ */
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
  const resolvedName = signatoryName || clinic.directorName || "......................................................";
  const resolvedNote =
    leftNote ||
    clinic.footerText ||
    `* เอกสารฉบับนี้ออกโดยระบบเวชระเบียนอิเล็กทรอนิกส์ ${clinic.clinicName}`;

  return (
    <div className="font-sarabun border-t border-slate-300 pt-5 mt-6 flex justify-between items-end text-xs text-slate-600">
      <div className="space-y-1 max-w-sm">
        <p className="leading-tight text-[11px] text-slate-500">{resolvedNote}</p>
        <p className="text-[11px] font-medium text-slate-600">
          {clinic.clinicName} · โทร. {clinic.phone}
        </p>
      </div>

      <div className="text-center space-y-1 shrink-0">
        <div className="w-56 border-b border-dotted border-slate-400 mx-auto mb-1"></div>
        <p className="font-semibold text-slate-900 text-sm">
          ลงชื่อ ({resolvedName})
        </p>
        <p className="text-xs text-slate-600 font-medium">{resolvedTitle}</p>
        {licenseNumber && (
          <p className="text-[11px] text-slate-500 font-mono">
            เลขที่ ว. / ใบอนุญาต: {licenseNumber}
          </p>
        )}
      </div>
    </div>
  );
}
