"use client";

import React, { useState, useEffect, useTransition } from "react";
import { TestTube, Plus, Trash2, X, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { recordLabResultAction } from "@/server/actions/lab";

interface RecordLabResultModalProps {
  isOpen: boolean;
  labOrder: {
    id: string;
    testName: string;
    patient: {
      hn: string;
      firstName: string;
      lastName: string;
    };
    results?: any[];
  } | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export function RecordLabResultModal({
  isOpen,
  labOrder,
  onClose,
  onSuccess,
}: RecordLabResultModalProps) {
  const [isPending, startTransition] = useTransition();

  const [results, setResults] = useState<
    {
      paramName: string;
      value: string;
      unit: string;
      normalRange: string;
      isAbnormal: boolean;
    }[]
  >([]);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (labOrder) {
      if (labOrder.results && labOrder.results.length > 0) {
        setResults(
          labOrder.results.map((r) => ({
            paramName: r.paramName,
            value: r.value,
            unit: r.unit || "",
            normalRange: r.normalRange || "",
            isAbnormal: r.isAbnormal || false,
          }))
        );
      } else {
        // Preset default parameters depending on testName
        const testName = labOrder.testName;
        if (testName.includes("FBS") || testName.includes("Fasting Blood Sugar")) {
          setResults([
            { paramName: "Fasting Blood Sugar (FBS)", value: "95", unit: "mg/dL", normalRange: "70-99", isAbnormal: false },
          ]);
        } else if (testName.includes("HbA1c")) {
          setResults([
            { paramName: "HbA1c", value: "5.8", unit: "%", normalRange: "< 5.7", isAbnormal: true },
          ]);
        } else if (testName.includes("Lipid")) {
          setResults([
            { paramName: "Cholesterol", value: "210", unit: "mg/dL", normalRange: "< 200", isAbnormal: true },
            { paramName: "Triglycerides", value: "140", unit: "mg/dL", normalRange: "< 150", isAbnormal: false },
            { paramName: "HDL-C", value: "48", unit: "mg/dL", normalRange: "> 40", isAbnormal: false },
            { paramName: "LDL-C", value: "135", unit: "mg/dL", normalRange: "< 100", isAbnormal: true },
          ]);
        } else {
          setResults([
            { paramName: "Result Parameter", value: "Normal", unit: "", normalRange: "", isAbnormal: false },
          ]);
        }
      }
    }
  }, [labOrder]);

  if (!isOpen || !labOrder) return null;

  const handleAddRow = () => {
    setResults([
      ...results,
      { paramName: "", value: "", unit: "", normalRange: "", isAbnormal: false },
    ]);
  };

  const handleRemoveRow = (index: number) => {
    setResults(results.filter((_, i) => i !== index));
  };

  const handleRowChange = (index: number, field: string, value: any) => {
    const updated = [...results];
    updated[index] = { ...updated[index], [field]: value };
    setResults(updated);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    if (results.length === 0) {
      setErrorMessage("กรุณาระบุพารามิเตอร์ผลแล็บอย่างน้อย 1 รายการ");
      return;
    }

    startTransition(async () => {
      const res = await recordLabResultAction({
        labOrderId: labOrder.id,
        results,
      });

      if (res.success) {
        setSuccessMessage("ลงผลการตรวจแล็บสำเร็จ!");
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 1000);
      } else {
        setErrorMessage(res.error || "ไม่สามารถลงผลแล็บได้");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl rounded-xl bg-white shadow-2xl border border-chunjai-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-chunjai-100 px-6 py-4 bg-chunjai-50/60 rounded-t-xl">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-chunjai-600 text-white">
              <TestTube className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-chunjai-950">
                ลงบันทึกผลการตรวจแล็บ ({labOrder.testName})
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                ผู้ป่วย: {labOrder.patient.firstName} {labOrder.patient.lastName} (HN: {labOrder.patient.hn})
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {errorMessage && (
            <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-rose-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-emerald-700 font-semibold">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-800">รายการพารามิเตอร์ผลแล็บ:</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddRow}
              className="h-8 text-xs text-chunjai-700"
            >
              <Plus className="mr-1 h-3.5 w-3.5" />
              เพิ่มพารามิเตอร์
            </Button>
          </div>

          {/* Results Table Inputs */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-3 py-2.5">ชื่อพารามิเตอร์</th>
                  <th className="px-3 py-2.5">ค่าที่ตรวจได้</th>
                  <th className="px-3 py-2.5">หน่วย</th>
                  <th className="px-3 py-2.5">ค่าปกติอ้างอิง</th>
                  <th className="px-3 py-2.5 text-center">ผิดปกติ</th>
                  <th className="px-3 py-2.5 text-center">ลบ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {results.map((row, idx) => (
                  <tr key={idx} className={row.isAbnormal ? "bg-rose-50/40" : ""}>
                    <td className="p-2">
                      <input
                        type="text"
                        required
                        value={row.paramName}
                        onChange={(e) => handleRowChange(idx, "paramName", e.target.value)}
                        placeholder="เช่น Glucose"
                        className="h-8 w-full rounded border border-slate-200 px-2 text-xs font-semibold focus:border-chunjai-500 focus:outline-none"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        required
                        value={row.value}
                        onChange={(e) => handleRowChange(idx, "value", e.target.value)}
                        placeholder="110"
                        className="h-8 w-full rounded border border-slate-200 px-2 text-xs font-bold font-mono focus:border-chunjai-500 focus:outline-none"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={row.unit}
                        onChange={(e) => handleRowChange(idx, "unit", e.target.value)}
                        placeholder="mg/dL"
                        className="h-8 w-full rounded border border-slate-200 px-2 text-xs focus:border-chunjai-500 focus:outline-none"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={row.normalRange}
                        onChange={(e) => handleRowChange(idx, "normalRange", e.target.value)}
                        placeholder="70-99"
                        className="h-8 w-full rounded border border-slate-200 px-2 text-xs focus:border-chunjai-500 focus:outline-none"
                      />
                    </td>
                    <td className="p-2 text-center">
                      <input
                        type="checkbox"
                        checked={row.isAbnormal}
                        onChange={(e) => handleRowChange(idx, "isAbnormal", e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                      />
                    </td>
                    <td className="p-2 text-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveRow(idx)}
                        className="h-7 w-7 text-rose-500 hover:bg-rose-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              ยกเลิก
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-chunjai-600 hover:bg-chunjai-700 text-white font-semibold"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  กำลังบันทึก...
                </>
              ) : (
                "ยืนยันบันทึกผลแล็บ"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
