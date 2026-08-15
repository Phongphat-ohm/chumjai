"use client";

import React, { useEffect, useState } from "react";
import QRCode from "qrcode";

interface DocumentQrCodeProps {
  /** ค่าที่ต้องการบรรจุใน QR Code เช่น รหัสเอกสาร REF-XXXX, HN690001 */
  value: string;
  /** ขนาดพิกเซล (default: 64) */
  size?: number;
  /** ป้ายข้อความกำกับใต้ QR code (optional) */
  label?: string;
  /** className เพิ่มเติม */
  className?: string;
}

/**
 * 📱 DocumentQrCode (มาตรฐานเอกสารราชการไทย - ขาวดำ 100%)
 * สร้าง QR Code สำหรับตรวจสอบและสืบค้นเอกสารทางการแพทย์
 */
export function DocumentQrCode({
  value,
  size = 64,
  label,
  className = "",
}: DocumentQrCodeProps) {
  const [dataUrl, setDataUrl] = useState<string>("");

  useEffect(() => {
    if (!value) return;
    QRCode.toDataURL(value, {
      width: size * 3, // เรนเดอร์ 3x เพื่อความคมชัดสูงสุดในการพิมพ์ A4
      margin: 1,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    })
      .then((url) => setDataUrl(url))
      .catch((err) => console.error("QR Code generation error:", err));
  }, [value, size]);

  if (!dataUrl) {
    return (
      <div
        style={{ width: `${size}px`, height: `${size}px` }}
        className="bg-white border border-black animate-pulse shrink-0"
      />
    );
  }

  return (
    <div className={`flex flex-col items-center shrink-0 ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={dataUrl}
        alt={`QR Code: ${value}`}
        style={{ width: `${size}px`, height: `${size}px` }}
        className="border border-black bg-white p-0.5"
      />
      {label && (
        <span className="font-sarabun text-[12px] font-bold text-black mt-0.5 tracking-tight text-center leading-none">
          {label}
        </span>
      )}
    </div>
  );
}

