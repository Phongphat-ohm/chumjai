"use client";

import React, { useEffect, useState } from "react";
import QRCode from "qrcode";

interface DocumentQrCodeProps {
  /** ค่าที่ต้องการบรรจุใน QR Code เช่น รหัสเอกสาร REF-XXXX, HN690001 หรือ JSON */
  value: string;
  /** ขนาดพิกเซล (default: 60) */
  size?: number;
  /** ป้ายข้อความกำกับใต้ QR code (optional) */
  label?: string;
  /** className เพิ่มเติม */
  className?: string;
}

/**
 * 📱 DocumentQrCode
 * สร้าง QR Code สำหรับตรวจสอบและสืบค้นเอกสารทางการแพทย์
 * รองรับการสแกนด้วยเครื่องสแกนบาร์โค้ด หรือกล้องมือถือ เพื่อดึงรหัสอ้างอิงทันที
 */
export function DocumentQrCode({
  value,
  size = 60,
  label,
  className = "",
}: DocumentQrCodeProps) {
  const [dataUrl, setDataUrl] = useState<string>("");

  useEffect(() => {
    if (!value) return;
    QRCode.toDataURL(value, {
      width: size * 2.5, // เรนเดอร์ 2.5x เพื่อความคมชัดสูงเมื่อพิมพ์
      margin: 1,
      color: {
        dark: "#0f172a", // Slate-900
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
        className="bg-slate-100 rounded border border-slate-200 animate-pulse shrink-0"
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
        className="border border-slate-300 bg-white p-0.5 rounded shadow-2xs"
      />
      {label && (
        <span className="text-[8.5px] font-mono text-slate-600 font-bold mt-0.5 tracking-tight text-center leading-none">
          {label}
        </span>
      )}
    </div>
  );
}
