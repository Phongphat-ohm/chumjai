"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  Printer,
  Download,
  X,
  Loader2,
  TestTube,
  CheckCircle2,
  Eye,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DocumentClinicInfo } from "@/components/documents/DocumentHeader";
import {
  LabReportTemplate,
  type LabReportData,
} from "@/components/documents/templates/LabReportTemplate";
import { generatePdfBlob } from "@/lib/pdf/printPdfHelper";

interface LabReportModalProps {
  isOpen: boolean;
  clinicInfo: DocumentClinicInfo;
  labOrder: LabReportData | null;
  onClose: () => void;
}

export function LabReportModal({
  isOpen,
  clinicInfo,
  labOrder,
  onClose,
}: LabReportModalProps) {
  const hiddenPrintRef = useRef<HTMLDivElement>(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Generate PDF Blob when modal opens or labOrder changes
  useEffect(() => {
    let currentBlobUrl: string | null = null;

    if (isOpen && labOrder) {
      setIsGeneratingPdf(true);
      setPdfBlobUrl(null);

      const timer = setTimeout(async () => {
        if (!hiddenPrintRef.current) {
          setIsGeneratingPdf(false);
          return;
        }

        try {
          const { blobUrl } = await generatePdfBlob(hiddenPrintRef.current, {
            orientation: "portrait",
            format: "a4",
          });
          currentBlobUrl = blobUrl;
          setPdfBlobUrl(blobUrl);
        } catch (error) {
          console.error("Error generating PDF preview:", error);
        } finally {
          setIsGeneratingPdf(false);
        }
      }, 150);

      return () => {
        clearTimeout(timer);
        if (currentBlobUrl) {
          URL.revokeObjectURL(currentBlobUrl);
        }
      };
    }
  }, [isOpen, labOrder]);

  if (!isOpen || !labOrder) return null;

  const handlePrint = () => {
    if (!pdfBlobUrl) return;
    const printIframe = document.createElement("iframe");
    printIframe.style.position = "fixed";
    printIframe.style.right = "0";
    printIframe.style.bottom = "0";
    printIframe.style.width = "0";
    printIframe.style.height = "0";
    printIframe.style.border = "0";
    printIframe.src = pdfBlobUrl;
    document.body.appendChild(printIframe);

    printIframe.onload = () => {
      setTimeout(() => {
        printIframe.contentWindow?.focus();
        printIframe.contentWindow?.print();
        setTimeout(() => {
          if (document.body.contains(printIframe)) {
            document.body.removeChild(printIframe);
          }
        }, 60000);
      }, 300);
    };
  };

  const handleDownload = () => {
    if (!pdfBlobUrl) return;
    const link = document.createElement("a");
    link.href = pdfBlobUrl;
    link.download = `lab_report_${labOrder.patient.hn}_${labOrder.id}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  const handleOpenInNewTab = () => {
    if (!pdfBlobUrl) return;
    window.open(pdfBlobUrl, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-2 sm:p-4 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Hidden Offscreen Template for PDF Generation */}
      <div
        style={{
          position: "fixed",
          left: "-9999px",
          top: "0",
          width: "794px",
          pointerEvents: "none",
          opacity: 0,
          zIndex: -100,
        }}
      >
        <LabReportTemplate
          ref={hiddenPrintRef}
          clinicInfo={clinicInfo}
          labOrder={labOrder}
        />
      </div>

      <div className="relative w-full max-w-5xl rounded-2xl bg-white shadow-2xl border border-slate-200 flex flex-col h-[92vh] max-h-[92vh] overflow-hidden">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-3.5 bg-slate-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-chunjai-600 text-white shadow-md">
              <TestTube className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-950">
                  ตัวอย่างใบรายงานผลแล็บ (PDF Preview)
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-100 text-cyan-800">
                  {labOrder.testName}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                ผู้ป่วย: {labOrder.patient.firstName} {labOrder.patient.lastName} (HN: {labOrder.patient.hn}) · Visit: {labOrder.visit.visitNumber}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleOpenInNewTab}
              disabled={!pdfBlobUrl || isGeneratingPdf}
              className="text-xs font-semibold h-9 px-3 border-slate-300 hover:bg-slate-100 shadow-xs"
              title="เปิดดูในแท็บใหม่ของเบราว์เซอร์"
            >
              <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
              เปิดแท็บใหม่
            </Button>
            <Button
              size="sm"
              onClick={handleDownload}
              disabled={!pdfBlobUrl || isGeneratingPdf}
              className="bg-chunjai-600 hover:bg-chunjai-700 text-white font-semibold text-xs h-9 px-4 shadow-sm"
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
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-9 w-9 text-slate-500 hover:text-slate-900 rounded-lg ml-1"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* PDF Viewer Workstation */}
        <div className="flex-1 bg-slate-200/80 p-3 sm:p-4 flex items-center justify-center overflow-hidden">
          {isGeneratingPdf || !pdfBlobUrl ? (
            <div className="flex flex-col items-center justify-center p-12 text-center space-y-3 bg-white rounded-2xl shadow-sm border border-slate-200 max-w-md mx-auto">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-chunjai-50 text-chunjai-600 shadow-xs">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  กำลังสร้างไฟล์ PDF ตัวอย่างผลการตรวจแล็บ...
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  เรนเดอร์เอกสารตามมาตรฐานกระทรวงสาธารณสุข ฟอนต์สารบรรณ (TH Sarabun)
                </p>
              </div>
            </div>
          ) : (
            <div className="w-full h-full rounded-xl overflow-hidden shadow-md border border-slate-300 bg-slate-900 flex justify-center">
              <iframe
                src={`${pdfBlobUrl}#toolbar=1&navpanes=0`}
                className="w-full h-full border-0"
                title="ตัวอย่างผลแล็บ PDF"
              />
            </div>
          )}
        </div>

        {/* Bottom Control Bar */}
        <div className="flex items-center justify-between border-t border-slate-200 px-6 py-3 bg-white text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-1.5 font-medium">
            <Eye className="h-3.5 w-3.5 text-slate-400" />
            <span>แสดงผลผ่าน Native PDF Viewer (ฟอนต์สารบรรณ TH Sarabun ขนาด A4)</span>
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

