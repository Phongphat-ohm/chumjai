"use client";

import React, { useState, useEffect, useTransition } from "react";
import { TestTube, Search, X, Loader2, AlertCircle, CheckCircle2, User, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPatientsAction } from "@/server/actions/patient";
import { createLabOrderAction } from "@/server/actions/lab";

interface CreateLabOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialPatient?: any;
  initialVisitId?: string;
  initialVisit?: any;
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
  "Electrolytes (Na, K, Cl, CO2)",
  "Thyroid Function Test (TSH, FT3, FT4)",
];

const VISIT_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  REGISTERED: { label: "ลงทะเบียนแล้ว", color: "bg-slate-100 text-slate-700" },
  WAITING_TRIAGE: { label: "รอคัดกรอง", color: "bg-blue-100 text-blue-800" },
  TRIAGED: { label: "คัดกรองแล้ว", color: "bg-indigo-100 text-indigo-800" },
  WAITING_DOCTOR: { label: "รอพบแพทย์", color: "bg-amber-100 text-amber-800" },
  IN_CONSULTATION: { label: "กำลังตรวจรักษา", color: "bg-emerald-100 text-emerald-800" },
  WAITING_PHARMACY: { label: "รอรับยา", color: "bg-purple-100 text-purple-800" },
  DISPENSED: { label: "จ่ายยาแล้ว", color: "bg-teal-100 text-teal-800" },
  COMPLETED: { label: "เสร็จสิ้น", color: "bg-slate-100 text-slate-600" },
  CANCELLED: { label: "ยกเลิก", color: "bg-rose-100 text-rose-700" },
};

export function CreateLabOrderModal({
  isOpen,
  onClose,
  onSuccess,
  initialPatient,
  initialVisitId,
  initialVisit,
}: CreateLabOrderModalProps) {
  const [isPending, startTransition] = useTransition();
  const [isSearching, setIsSearching] = useState(false);

  const [patientSearch, setPatientSearch] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  const [selectedVisitId, setSelectedVisitId] = useState<string>("");

  const [testName, setTestName] = useState(COMMON_LAB_TESTS[0]);
  const [customTestName, setCustomTestName] = useState("");
  const [notes, setNotes] = useState("");

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Initialize with initial props if provided
  useEffect(() => {
    if (isOpen) {
      if (initialVisit) {
        const patientData = initialVisit.patient || initialPatient;
        const patientWithVisits = {
          ...patientData,
          visits: patientData?.visits?.length > 0 ? patientData.visits : [initialVisit],
        };
        setSelectedPatient(patientWithVisits);
        setSelectedVisitId(initialVisit.id);
      } else if (initialPatient) {
        const activeVisit =
          initialVisitId ||
          initialPatient.visits?.find(
            (v: any) => v.status !== "CANCELLED" && v.status !== "COMPLETED"
          )?.id ||
          initialPatient.visits?.[0]?.id ||
          "";
        setSelectedPatient(initialPatient);
        setSelectedVisitId(activeVisit);
      } else {
        setSelectedPatient(null);
        setSelectedVisitId("");
      }
      setErrorMessage(null);
      setSuccessMessage(null);
      setPatientSearch("");
      setSearchResults([]);
    }
  }, [isOpen, initialPatient, initialVisitId, initialVisit]);

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

  const handleSelectPatient = (p: any) => {
    setSelectedPatient(p);
    setPatientSearch("");
    setSearchResults([]);

    // Auto-select active visit (e.g. WAITING_DOCTOR, IN_CONSULTATION, etc.)
    const activeVisit =
      p.visits?.find(
        (v: any) => v.status !== "CANCELLED" && v.status !== "COMPLETED"
      )?.id ||
      p.visits?.[0]?.id ||
      "";
    setSelectedVisitId(activeVisit);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!selectedPatient) {
      setErrorMessage("กรุณาเลือกผู้ป่วยสำหรับใบสั่งตรวจแล็บ");
      return;
    }

    if (!selectedVisitId) {
      setErrorMessage(
        "ผู้ป่วยรายนี้ยังไม่มี Visit หรือรอบการตรวจที่เปิดอยู่ กรุณาเปิด Visit ณ จุดลงทะเบียนก่อนสั่งตรวจแล็บ"
      );
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
        visitId: selectedVisitId,
        testName: finalTestName,
        notes,
      });

      if (res.success) {
        setSuccessMessage("สร้างใบสั่งตรวจแล็บสำเร็จ!");
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 800);
      } else {
        setErrorMessage(res.error || "ไม่สามารถสั่งตรวจแล็บได้");
      }
    });
  };

  // Resolve list of visits for selected patient
  const patientVisits: any[] =
    selectedPatient?.visits && selectedPatient.visits.length > 0
      ? selectedPatient.visits
      : initialVisit
      ? [initialVisit]
      : selectedVisitId
      ? [{ id: selectedVisitId, visitNumber: "รอบการตรวจปัจจุบัน", status: "WAITING_DOCTOR", createdAt: new Date() }]
      : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-chunjai-600 text-white shadow-md">
              <TestTube className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-950">
                สั่งตรวจแล็บ / ชันสูตรใหม่ (New Lab Order)
              </h3>
              <p className="text-xs text-slate-500">
                สร้างใบส่งตรวจห้องปฏิบัติการสำหรับผู้ป่วยที่กำลังเข้ารับการตรวจรักษา
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-slate-500 hover:text-slate-900 rounded-lg">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {errorMessage && (
            <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-rose-700 font-medium">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-emerald-700 font-semibold">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Patient Lookup */}
          <div className="space-y-1">
            <label className="font-bold text-slate-800 block">
              ผู้ป่วยที่ส่งตรวจ <span className="text-rose-500">*</span>
            </label>
            {selectedPatient ? (
              <div className="p-3.5 rounded-xl border border-chunjai-200 bg-chunjai-50/60 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-chunjai-600 shrink-0" />
                    <span className="font-bold text-slate-950 text-sm">
                      {selectedPatient.firstName} {selectedPatient.lastName}
                    </span>
                    <span className="font-mono text-xs text-chunjai-700 font-bold px-2 py-0.5 rounded bg-chunjai-100">
                      HN: {selectedPatient.hn}
                    </span>
                  </div>
                  {!initialPatient && !initialVisit && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedPatient(null);
                        setSelectedVisitId("");
                      }}
                      className="h-7 text-xs text-slate-500 hover:text-rose-600"
                    >
                      เปลี่ยนผู้ป่วย
                    </Button>
                  )}
                </div>

                {/* Visit Selection */}
                {patientVisits.length === 0 ? (
                  <div className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-200 font-medium flex items-center gap-1.5">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>ผู้ป่วยรายนี้ยังไม่มี Visit ในระบบ กรุณาเปิด Visit ที่จุดลงทะเบียนก่อน</span>
                  </div>
                ) : (
                  <div className="pt-2 border-t border-chunjai-100 space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 block">
                      เลือกรอบการตรวจ (Visit):
                    </label>
                    <select
                      value={selectedVisitId}
                      onChange={(e) => setSelectedVisitId(e.target.value)}
                      className="h-9 w-full rounded-lg border border-slate-300 bg-white px-2.5 text-xs font-bold text-slate-900 focus:border-chunjai-500 focus:outline-none"
                    >
                      {patientVisits.map((v: any) => {
                        const statusObj = VISIT_STATUS_LABELS[v.status] || {
                          label: v.status || "รอพบแพทย์",
                          color: "",
                        };
                        const dateStr = v.createdAt ? new Date(v.createdAt).toLocaleDateString("th-TH") : "วันนี้";
                        return (
                          <option key={v.id} value={v.id}>
                            {v.visitNumber || "Visit ปัจจุบัน"} — สถานะ: {statusObj.label} ({dateStr})
                          </option>
                        );
                      })}
                    </select>
                  </div>
                )}
              </div>
            ) : (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={patientSearch}
                  onChange={(e) => handleSearchPatient(e.target.value)}
                  placeholder="พิมพ์ HN, ชื่อผู้ป่วย หรือเบอร์โทรศัพท์..."
                  className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-3 text-xs focus:border-chunjai-500 focus:bg-white focus:outline-none"
                />

                {/* Dropdown Results */}
                {patientSearch.trim() && searchResults.length > 0 && (
                  <div className="absolute left-0 right-0 top-11 z-20 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl space-y-1 max-h-48 overflow-y-auto">
                    {searchResults.map((p) => {
                      const activeV = p.visits?.find(
                        (v: any) => v.status !== "CANCELLED" && v.status !== "COMPLETED"
                      );
                      const statusObj = activeV ? VISIT_STATUS_LABELS[activeV.status] : null;

                      return (
                        <div
                          key={p.id}
                          onClick={() => handleSelectPatient(p)}
                          className="p-2.5 rounded-lg hover:bg-chunjai-50 cursor-pointer flex items-center justify-between transition-colors"
                        >
                          <div>
                            <span className="font-bold text-slate-900 block text-xs">
                              {p.firstName} {p.lastName}
                            </span>
                            <span className="font-mono text-[11px] text-chunjai-700 font-semibold">
                              HN: {p.hn}
                            </span>
                          </div>

                          <div>
                            {statusObj ? (
                              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${statusObj.color}`}>
                                {statusObj.label}
                              </span>
                            ) : p.visits?.length > 0 ? (
                              <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600 font-mono">
                                Visit ล่าสุด
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] bg-rose-50 text-rose-600 font-semibold">
                                ไม่มี Visit
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Test Name Select */}
          <div className="space-y-1">
            <label className="font-bold text-slate-800 block">
              เลือกชุดการตรวจแล็บ (Laboratory Test) <span className="text-rose-500">*</span>
            </label>
            <select
              value={testName}
              onChange={(e) => setTestName(e.target.value)}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-900 focus:border-chunjai-500 focus:outline-none"
            >
              {COMMON_LAB_TESTS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
              <option value="OTHER">อื่นๆ (ระบุชื่อการตรวจเพิ่มเติมเอง)</option>
            </select>
          </div>

          {testName === "OTHER" && (
            <div className="space-y-1">
              <label className="font-bold text-slate-800 block">
                ระบุชื่อการตรวจแล็บเพิ่มเติม <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={customTestName}
                onChange={(e) => setCustomTestName(e.target.value)}
                placeholder="เช่น Thyroid Profile (FT3, FT4, TSH), Trop-I..."
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-xs focus:border-chunjai-500 focus:bg-white focus:outline-none"
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="font-bold text-slate-800 block">
              หมายเหตุ / คำสั่งเพิ่มเติมถึงห้องแล็บ
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="เช่น ผู้ป่วยงดน้ำและอาหารมาแล้ว 8 ชั่วโมง, เจาะเลือดด่วน..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs focus:border-chunjai-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
              className="h-9 text-xs font-semibold border-slate-300"
            >
              ยกเลิก
            </Button>
            <Button
              type="submit"
              disabled={isPending || !selectedPatient || !selectedVisitId}
              className="bg-chunjai-600 hover:bg-chunjai-700 text-white font-bold text-xs h-9 px-5 shadow-sm"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  กำลังสั่งตรวจ...
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
