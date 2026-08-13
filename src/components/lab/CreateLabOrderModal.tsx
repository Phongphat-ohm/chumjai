"use client";

import React, { useState, useTransition } from "react";
import { TestTube, Search, X, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPatientsAction } from "@/server/actions/patient";
import { createLabOrderAction } from "@/server/actions/lab";

interface CreateLabOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const COMMON_LAB_TESTS = [
  "Fasting Blood Sugar (FBS)",
  "HbA1c (Glycated Hemoglobin)",
  "Lipid Profile (Cholesterol, Triglycerides, HDL, LDL)",
  "Complete Blood Count (CBC)",
  "Liver Function Test (ALT, AST, ALP)",
  "Renal Function Test (BUN, Creatinine)",
  "Urine Analysis (UA)",
  "Uric Acid",
];

export function CreateLabOrderModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateLabOrderModalProps) {
  const [isPending, startTransition] = useTransition();
  const [isSearching, setIsSearching] = useState(false);

  const [patientSearch, setPatientSearch] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);

  const [testName, setTestName] = useState(COMMON_LAB_TESTS[0]);
  const [customTestName, setCustomTestName] = useState("");
  const [notes, setNotes] = useState("");

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSearchPatient = async (q: string) => {
    setPatientSearch(q);
    if (!q.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const res = await getPatientsAction({ search: q, limit: 5 });
      if (res.success && res.data) {
        setSearchResults(res.data.patients);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!selectedPatient) {
      setErrorMessage("กรุณาเลือกผู้ป่วยสำหรับใบสั่งตรวจแล็บ");
      return;
    }

    const latestVisit = selectedPatient.visits?.[0];
    if (!latestVisit) {
      setErrorMessage("ผู้ป่วยยังไม่มี Visit ที่เปิดอยู่ กรุณาเปิด Visit ในระบบก่อนสั่งแล็บ");
      return;
    }

    const finalTestName = testName === "OTHER" ? customTestName : testName;
    if (!finalTestName.trim()) {
      setErrorMessage("กรุณาระบุชื่อรายการตรวจแล็บ");
      return;
    }

    startTransition(async () => {
      const res = await createLabOrderAction({
        patientId: selectedPatient.id,
        visitId: latestVisit.id,
        testName: finalTestName,
        notes,
      });

      if (res.success) {
        setSuccessMessage("สร้างใบสั่งตรวจแล็บสำเร็จ!");
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 1000);
      } else {
        setErrorMessage(res.error || "ไม่สามารถสั่งตรวจแล็บได้");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-lg rounded-xl bg-white shadow-2xl border border-chunjai-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-chunjai-100 px-6 py-4 bg-chunjai-50/60 rounded-t-xl">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-chunjai-600 text-white">
              <TestTube className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-chunjai-950">
                สั่งตรวจแล็บ/ชันสูตรใหม่ (New Lab Order)
              </h3>
              <p className="text-xs text-slate-500">
                สร้างใบส่งตรวจห้องปฏิบัติการสำหรับผู้ป่วยที่มี Visit อยู่
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

          {/* Patient Lookup */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 block">
              ค้นหาและเลือกผู้ป่วย <span className="text-rose-500">*</span>
            </label>
            {selectedPatient ? (
              <div className="flex items-center justify-between p-2.5 rounded-lg border border-chunjai-200 bg-chunjai-50">
                <div>
                  <span className="font-bold text-chunjai-900">
                    {selectedPatient.firstName} {selectedPatient.lastName}
                  </span>
                  <span className="text-[11px] text-chunjai-600 font-mono ml-2 font-bold">
                    HN: {selectedPatient.hn} · Visit: {selectedPatient.visits?.[0]?.visitNumber || "ไม่มี Visit"}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedPatient(null)}
                  className="h-7 text-xs text-slate-500 hover:text-rose-600"
                >
                  เปลี่ยน
                </Button>
              </div>
            ) : (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={patientSearch}
                  onChange={(e) => handleSearchPatient(e.target.value)}
                  placeholder="พิมพ์ HN, ชื่อผู้ป่วย หรือเบอร์โทร..."
                  className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50/50 pl-9 pr-3 text-xs focus:border-chunjai-500 focus:bg-white focus:outline-none"
                />

                {/* Dropdown Results */}
                {patientSearch.trim() && searchResults.length > 0 && (
                  <div className="absolute left-0 right-0 top-10 z-10 rounded-lg border border-slate-200 bg-white p-1 shadow-lg space-y-1 max-h-40 overflow-y-auto">
                    {searchResults.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => {
                          setSelectedPatient(p);
                          setPatientSearch("");
                        }}
                        className="p-2 rounded hover:bg-chunjai-50 cursor-pointer flex justify-between"
                      >
                        <span className="font-bold text-slate-900">{p.firstName} {p.lastName}</span>
                        <span className="font-mono text-chunjai-600 font-bold">HN: {p.hn}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Test Name Select */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 block">
              เลือกชุดการตรวจแล็บ <span className="text-rose-500">*</span>
            </label>
            <select
              value={testName}
              onChange={(e) => setTestName(e.target.value)}
              className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-chunjai-900 focus:border-chunjai-500 focus:outline-none"
            >
              {COMMON_LAB_TESTS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
              <option value="OTHER">อื่นๆ (ระบุชื่อการตรวจเอง)</option>
            </select>
          </div>

          {testName === "OTHER" && (
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">
                ระบุชื่อการตรวจเพิ่มเติม <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={customTestName}
                onChange={(e) => setCustomTestName(e.target.value)}
                placeholder="เช่น Thyroid Profile (FT3, FT4, TSH)..."
                className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 text-xs focus:border-chunjai-500 focus:bg-white focus:outline-none"
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="font-semibold text-slate-700 block">
              หมายเหตุ / คำสั่งเพิ่มเติมถึงห้องแล็บ
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="เช่น ผู้ป่วยงดน้ำและอาหารมาแล้ว 8 ชั่วโมง..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50/50 p-2.5 text-xs focus:border-chunjai-500 focus:bg-white focus:outline-none"
            />
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
                  กำลังสร้างใบสั่งตรวจ...
                </>
              ) : (
                "ยืนยันสั่งตรวจแล็บ"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
