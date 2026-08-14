"use client";

import React, { forwardRef } from "react";
import { Pill, AlertCircle, HeartPulse, Clock, ShieldCheck } from "lucide-react";
import { type DocumentClinicInfo } from "@/components/documents/DocumentHeader";

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
 * 💊 เทมเพลต: ฉลากยาภาษาไทยมาตรฐานสถานพยาบาล (Thai GPP Hospital Drug Label Standard)
 * กำหนดขนาดฉลากสติ๊กเกอร์ (480px) มีระยะห่างที่สบายตา ไม่เบียดตัวหนังสือ
 */
export const DrugLabelTemplate = forwardRef<HTMLDivElement, DrugLabelTemplateProps>(
  ({ clinicInfo, patient, items, pharmacistName }, ref) => {
    const todayStr = new Date().toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    const accent = clinicInfo.accentColor || "#1b5e3b";

    return (
      <div ref={ref} className="font-sarabun w-full space-y-6 bg-transparent flex flex-col items-center">
        {items.map((item, idx) => (
          <div
            key={item.id || idx}
            className="bg-white border-2 border-slate-900 rounded-xl p-5 shadow-sm space-y-3.5 print:border-black print:shadow-none print:break-inside-avoid print:m-0"
            style={{
              width: "480px",
              boxSizing: "border-box",
            }}
          >
            {/* ส่วนหัวฉลาก: ชื่อคลินิก & วันที่จ่ายยา */}
            <div className="border-b-2 border-slate-800 pb-2.5 flex justify-between items-start">
              <div className="flex items-center gap-2.5">
                <div
                  className="h-8 w-8 rounded-lg flex items-center justify-center text-white shrink-0 shadow-xs"
                  style={{ backgroundColor: accent }}
                >
                  <HeartPulse className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-950 leading-tight">
                    {clinicInfo.clinicName}
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    โทร. {clinicInfo.phone} {clinicInfo.licenseNo ? `(ใบอนุญาต ${clinicInfo.licenseNo})` : ""}
                  </p>
                </div>
              </div>
              <div className="text-right font-mono text-xs shrink-0">
                <span className="text-slate-500 block text-[10px]">วันที่จ่ายยา</span>
                <strong className="text-slate-900">{todayStr}</strong>
              </div>
            </div>

            {/* ข้อมูลผู้ป่วย */}
            <div className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 text-xs">
              <div>
                <span className="text-slate-500 text-xs mr-1.5">ชื่อผู้ป่วย:</span>
                <strong className="text-slate-950 text-sm">
                  {patient.firstName} {patient.lastName}
                </strong>
              </div>
              <div className="font-mono text-xs">
                <span className="text-slate-500 mr-1">HN:</span>
                <strong className="text-sm" style={{ color: accent }}>{patient.hn}</strong>
              </div>
            </div>

            {/* ข้อมูลยา: ชื่อสามัญ / ชื่อการค้า / ขนาด / จำนวน */}
            <div className="space-y-1 border-b border-slate-200 pb-2.5">
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="text-base font-bold text-slate-950 tracking-tight flex items-center gap-1.5">
                  <Pill className="h-4 w-4 shrink-0" style={{ color: accent }} />
                  <span>{item.drug?.genericName || "ยาชนิดเม็ด"} {item.drug?.strength || ""}</span>
                </h3>
                <span className="font-mono font-bold text-xs px-2.5 py-0.5 rounded bg-slate-100 border border-slate-300 shrink-0">
                  จำนวน {item.quantity} {item.drug?.unit || "เม็ด"}
                </span>
              </div>
              {item.drug?.tradeName && (
                <p className="text-xs text-slate-600 font-medium pl-5">
                  (ชื่อการค้า: {item.drug.tradeName})
                </p>
              )}
            </div>

            {/* วิธีการใช้ยา (Usage Instruction Box) */}
            <div
              className="p-3 rounded-lg border text-xs space-y-2"
              style={{ backgroundColor: `${accent}0A`, borderColor: `${accent}40` }}
            >
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 shrink-0" style={{ color: accent }} />
                <span className="font-bold text-slate-950 text-sm">
                  วิธีใช้: {item.dosage} {item.frequency}
                </span>
              </div>

              {/* ข้อแนะนำเพิ่มเติม */}
              {item.instruction && (
                <p className="text-xs font-semibold text-slate-800 pl-5 leading-normal">
                  • {item.instruction}
                </p>
              )}

              {/* คำเตือนสำคัญ */}
              <div className="flex items-start gap-1.5 text-xs text-amber-900 font-medium bg-amber-50 p-2 rounded border border-amber-200">
                <AlertCircle className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
                <span className="leading-tight">
                  {item.warnings || "ยานี้ใช้เฉพาะบุคคลที่มีชื่อบนฉลากเท่านั้น เก็บในที่แห้งและพ้นมือเด็ก"}
                </span>
              </div>
            </div>

            {/* ส่วนท้ายฉลาก: เภสัชกรผู้จ่ายยาและข้อควรระวัง */}
            <div className="flex justify-between items-center text-xs text-slate-500 pt-1">
              <span className="flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-slate-400" />
                เภสัชกร: <strong>{pharmacistName || "เภสัชกรประจำคลินิก (ภก.)"}</strong>
              </span>
              <span className="font-mono text-[11px]">
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
