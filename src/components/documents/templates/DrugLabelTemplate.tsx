"use client";

import React, { forwardRef } from "react";
import { type DocumentClinicInfo } from "@/components/documents/DocumentHeader";
import { DocumentQrCode } from "@/components/documents/DocumentQrCode";

export interface DrugLabelItem {
  id: string;
  drug?: {
    genericName: string;
    tradeName?: string;
    strength?: string;
    unit: string;
    category?: string;
  };
  quantity: number;
  dosage: string;
  frequency: string;
  instruction?: string;
  warnings?: string;
}

interface DrugLabelTemplateProps {
  clinicInfo: DocumentClinicInfo;
  patient: {
    hn: string;
    firstName: string;
    lastName: string;
    allergies?: string[];
  };
  items: DrugLabelItem[];
  pharmacistName?: string;
}

/**
 * 💊 เทมเพลต: ฉลากยามาตรฐานสถานพยาบาล (มาตรฐานเอกสารราชการไทย - ขาวดำ 100%)
 * กำหนดขนาดฉลากสติ๊กเกอร์ (500px) ฟอนต์ TH Sarabun New ชัดเจน อ่านง่าย
 */
export const DrugLabelTemplate = forwardRef<HTMLDivElement, DrugLabelTemplateProps>(
  ({ clinicInfo, patient, items, pharmacistName }, ref) => {
    const todayStr = new Date().toLocaleDateString("th-TH", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    return (
      <div ref={ref} className="font-sarabun w-full space-y-6 bg-transparent flex flex-col items-center">
        {items.map((item, idx) => (
          <div
            key={item.id || idx}
            className="bg-white border-2 border-black p-5 space-y-3 print:m-0 mx-auto shrink-0 text-black"
            style={{
              width: "500px",
              boxSizing: "border-box",
            }}
          >
            {/* ส่วนหัวฉลาก: ชื่อคลินิก & วันที่จ่ายยา & QR Code ยืนยัน */}
            <div className="border-b-2 border-black pb-2 flex justify-between items-start">
              <div className="space-y-0.5">
                <h2 className="text-[17pt] font-bold text-black leading-tight">
                  {clinicInfo.clinicName}
                </h2>
                <p className="text-[13.5pt] text-black">
                  โทร. {clinicInfo.phone} {clinicInfo.licenseNo ? `(ใบอนุญาต ${clinicInfo.licenseNo})` : ""}
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="text-right text-[13.5pt]">
                  <span className="block font-semibold">วันที่จ่ายยา</span>
                  <strong>{todayStr}</strong>
                </div>
                <DocumentQrCode
                  value={`HN:${patient.hn}|RX:${item.id.slice(0, 8)}|${item.drug?.genericName || "MED"}`}
                  size={46}
                  label={patient.hn}
                />
              </div>
            </div>

            {/* ข้อมูลผู้ป่วย */}
            <div className="border border-black px-3 py-1.5 flex items-center justify-between text-[15pt]">
              <div>
                <span className="font-semibold">ชื่อผู้ป่วย: </span>
                <span className="font-bold">{patient.firstName} {patient.lastName}</span>
              </div>
              <div>
                <span className="font-semibold">HN: </span>
                <span className="font-bold">{patient.hn}</span>
              </div>
            </div>

            {/* ข้อมูลยา: ชื่อสามัญ / ขนาด / จำนวน */}
            <div className="border-b border-black pb-2 space-y-0.5">
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="text-[17.5pt] font-bold text-black">
                  {item.drug?.genericName || "ยาชนิดเม็ด"} {item.drug?.strength || ""}
                </h3>
                <span className="font-bold text-[15pt] border border-black px-2 py-0.5">
                  จำนวน {item.quantity} {item.drug?.unit || "เม็ด"}
                </span>
              </div>
              {item.drug?.tradeName && (
                <p className="text-[14pt] text-black">
                  (ชื่อการค้า: {item.drug.tradeName})
                </p>
              )}
            </div>

            {/* วิธีการใช้ยา (Usage Instruction) */}
            <div className="border border-black p-3 space-y-1 text-[15.5pt]">
              <p className="font-bold text-[17pt]">
                วิธีใช้: {item.dosage} {item.frequency}
              </p>

              {item.instruction && (
                <p className="font-semibold text-[15pt]">
                  • {item.instruction}
                </p>
              )}

              <div className="border-t border-black pt-1 mt-1 text-[14pt]">
                <strong>คำเตือน: </strong>
                <span>{item.warnings || "ยานี้ใช้เฉพาะบุคคลที่มีชื่อบนฉลากเท่านั้น เก็บในที่แห้งและพ้นมือเด็ก"}</span>
              </div>
            </div>

            {/* ส่วนท้ายฉลาก: เภสัชกรผู้จ่ายยาและข้อควรระวัง */}
            <div className="flex justify-between items-center text-[13.5pt] pt-1">
              <span>
                เภสัชกร: <strong>{pharmacistName || "เภสัชกรประจำคลินิก (ภก.)"}</strong>
              </span>
              <span>
                Rx-{item.id ? item.id.slice(0, 6).toUpperCase() : "001"}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  }
);

DrugLabelTemplate.displayName = "DrugLabelTemplate";
