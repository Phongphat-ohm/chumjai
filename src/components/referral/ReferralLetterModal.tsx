"use client";

import React, { useRef, useState } from "react";
import { Printer, Download, X, Loader2, FileText, CheckCircle2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DocumentClinicInfo } from "@/components/documents/DocumentHeader";
import {
  ReferralLetterTemplate,
  type ReferralLetterData,
} from "@/components/documents/templates/ReferralLetterTemplate";
import { printElementAsPdf, downloadElementAsPdf } from "@/lib/pdf/printPdfHelper";

interface ReferralLetterModalProps {
  isOpen: boolean;
  clinicInfo: DocumentClinicInfo;
  referral: ReferralLetterData | null;
  onClose: () => void;
}

export function ReferralLetterModal({
  isOpen,
  clinicInfo,
  referral,
  onClose,
}: ReferralLetterModalProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen || !referral) return null;

  const handlePrintPdf = async () => {
    if (!printRef.current) return;
    try {
      setIsGeneratingPdf(true);
      await printElementAsPdf(printRef.current, {
        filename: `referral_${referral.patient.hn}_${referral.id}.pdf`,
        orientation: "portrait",
      });
    } catch (err) {
      console.error("PDF generation failed, falling back to window.print()", err);
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!printRef.current) return;
    try {
      setIsGeneratingPdf(true);
      await downloadElementAsPdf(
        printRef.current,
        `referral_${referral.patient.hn}_${referral.id}.pdf`,
        { orientation: "portrait" }
      );
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error("PDF download failed", err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-3 sm:p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl rounded-2xl bg-white shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-chunjai-600 text-white shadow-md">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-950">
                  หนังสือส่งตัวผู้ป่วย (Referral Letter PDF)
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-chunjai-100 text-chunjai-800">
                  แบบฟอร์มทางการ
                </span>
              </div>
              <p className="text-xs text-slate-500">
                ผู้ป่วย: {referral.patient.firstName} {referral.patient.lastName} (HN: {referral.patient.hn}) · ส่งต่อไปยัง: {referral.hospitalName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="text-xs font-semibold h-9 px-3.5 border-slate-300 hover:bg-slate-100 shadow-xs"
            >
              {downloadSuccess ? (
                <>
                  <CheckCircle2 className="mr-1.5 h-4 w-4 text-emerald-600" />
                  บันทึกสำเร็จ
                </>
              ) : (
                <>
                  <Download className="mr-1.5 h-4 w-4" />
                  ดาวน์โหลด PDF
                </>
              )}
            </Button>
            <Button
              size="sm"
              onClick={handlePrintPdf}
              disabled={isGeneratingPdf}
              className="bg-chunjai-600 hover:bg-chunjai-700 text-white font-bold text-xs h-9 px-4 shadow-sm"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  กำลังสร้าง PDF...
                </>
              ) : (
                <>
                  <Printer className="mr-1.5 h-4 w-4" />
                  พิมพ์เอกสาร (PDF Print)
                </>
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-9 w-9 text-slate-500 hover:text-slate-900 rounded-lg ml-1"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Document Preview Workstation (Realistic A4 Page Canvas) */}
        <div className="p-4 sm:p-6 overflow-y-auto bg-slate-100/70 flex-1 flex justify-center items-start">
          <div className="w-full flex justify-center">
            <ReferralLetterTemplate
              ref={printRef}
              clinicInfo={clinicInfo}
              referral={referral}
            />
          </div>
        </div>

        {/* Bottom Control Bar */}
        <div className="flex items-center justify-between border-t border-slate-200 px-6 py-3 bg-white text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-1.5 font-medium">
            <Eye className="h-3.5 w-3.5 text-slate-400" />
            <span>ตัวอย่างเอกสารฟอนต์สารบรรณ (TH Sarabun) ขนาด A4</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-xs font-medium text-slate-600 hover:text-slate-900"
            >
              ปิดหน้าต่าง
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
