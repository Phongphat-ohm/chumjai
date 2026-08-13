"use client";

import React from "react";
import { Printer, X, HeartPulse, Pill } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DrugLabelModalProps {
  isOpen: boolean;
  patient: {
    hn: string;
    firstName: string;
    lastName: string;
  } | null;
  items: {
    id: string;
    drug?: {
      genericName: string;
      tradeName?: string;
      strength?: string;
      unit: string;
    };
    quantity: number;
    dosage: string;
    frequency: string;
    instruction?: string;
  }[];
  pharmacistName?: string;
  onClose: () => void;
}

export function DrugLabelModal({
  isOpen,
  patient,
  items,
  pharmacistName,
  onClose,
}: DrugLabelModalProps) {
  if (!isOpen || !patient || items.length === 0) return null;

  const handlePrint = () => {
    window.print();
  };

  const todayStr = new Date().toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-xl bg-white shadow-2xl border border-chunjai-100 my-6 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-chunjai-100 px-6 py-4 bg-chunjai-50/60 rounded-t-xl shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-chunjai-600 text-white">
              <Printer className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-chunjai-950">
                ตัวอย่างฉลากยาภาษาไทย (Drug Label Preview & Print)
              </h3>
              <p className="text-xs text-slate-500">
                ฉลากยาสำหรับติดซองยาตามระเบียบกระทรวงสาธารณสุข
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handlePrint}
              className="bg-chunjai-600 hover:bg-chunjai-700 text-white font-bold text-xs"
            >
              <Printer className="mr-1.5 h-4 w-4" />
              พิมพ์ฉลากยา (Print)
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Printable Labels List Grid */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {items.map((item, idx) => (
            <div
              key={item.id || idx}
              className="border-2 border-slate-900 rounded-xl p-4 bg-white space-y-2 shadow-sm max-w-md mx-auto print:border-black print:shadow-none print:break-inside-avoid"
            >
              {/* Label Header */}
              <div className="flex items-center justify-between border-b border-slate-300 pb-2">
                <div className="flex items-center gap-1.5">
                  <HeartPulse className="h-4 w-4 text-chunjai-600 font-bold" />
                  <span className="font-bold text-slate-900 text-xs">
                    ชุมใจคลินิก (Chunjai Clinic)
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">{todayStr}</span>
              </div>

              {/* Patient Info Line */}
              <div className="flex items-center justify-between font-bold text-slate-900 border-b border-slate-100 pb-1 text-xs">
                <span>
                  ชื่อ: {patient.firstName} {patient.lastName}
                </span>
                <span className="font-mono text-chunjai-700">HN: {patient.hn}</span>
              </div>

              {/* Drug Name & Strength */}
              <div className="py-1">
                <div className="flex items-baseline justify-between">
                  <span className="font-black text-sm text-slate-950">
                    {item.drug?.genericName || "ยาชนิดเม็ด"} {item.drug?.strength}
                  </span>
                  <span className="font-extrabold text-chunjai-700 font-mono text-xs">
                    จำนวน {item.quantity} {item.drug?.unit || "เม็ด"}
                  </span>
                </div>
                {item.drug?.tradeName && (
                  <p className="text-[10px] text-slate-500 font-medium">
                    ({item.drug.tradeName})
                  </p>
                )}
              </div>

              {/* Usage & Frequency Instructions */}
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-1">
                <p className="font-bold text-chunjai-900 text-xs">
                  วิธีใช้: {item.dosage} {item.frequency}
                </p>
                {item.instruction && (
                  <p className="text-[11px] text-slate-700 font-medium">
                    คำแนะนำ: {item.instruction}
                  </p>
                )}
              </div>

              {/* Footer Pharmacist Signature Line */}
              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                <span>เภสัชกรผู้จ่ายยา: {pharmacistName || "เภสัชกรประจำคลินิก"}</span>
                <span className="font-mono">โทร. 02-123-4567</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
