"use client";

import React, { useState, useTransition } from "react";
import { Send, X, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPatientsAction } from "@/server/actions/patient";
import { createReferralAction } from "@/server/actions/referral";
import { PatientExactSearchInput } from "@/components/patients/PatientExactSearchInput";

interface CreateReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const COMMON_HOSPITALS = [
  "โรงพยาบาลจุฬาลงกรณ์ สภากาชาดไทย",
  "โรงพยาบาลศิริราช",
  "โรงพยาบาลรามาธิบดี",
  "โรงพยาบาลราชวิถี",
  "โรงพยาบาลตำรวจ",
  "โรงพยาบาลภูมิพลอดุลยเดช",
  "โรงพยาบาลประจำจังหวัด/ศูนย์ประจำภาค",
];

export function CreateReferralModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateReferralModalProps) {
  const [isPending, startTransition] = useTransition();

  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);

  const [hospitalName, setHospitalName] = useState(COMMON_HOSPITALS[0]);
  const [customHospital, setCustomHospital] = useState("");
  const [reason, setReason] = useState("");
  const [diagnosisSummary, setDiagnosisSummary] = useState("");

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;



  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!selectedPatient) {
      setErrorMessage("กรุณาเลือกผู้ป่วยสำหรับออกหนังสือส่งตัว");
      return;
    }

    const latestVisit = selectedPatient.visits?.[0];
    if (!latestVisit) {
      setErrorMessage("ผู้ป่วยยังไม่มี Visit ที่เปิดอยู่ กรุณาเปิด Visit ในระบบก่อนส่งตัว");
      return;
    }

    const finalHospital = hospitalName === "OTHER" ? customHospital : hospitalName;
    if (!finalHospital.trim()) {
      setErrorMessage("กรุณาระบุชื่อโรงพยาบาลปลายทาง");
      return;
    }

    if (!reason.trim()) {
      setErrorMessage("กรุณาระบุเหตุผลในการส่งตัวผู้ป่วย");
      return;
    }

    startTransition(async () => {
      const res = await createReferralAction({
        patientId: selectedPatient.id,
        visitId: latestVisit.id,
        hospitalName: finalHospital,
        reason,
        diagnosisSummary,
      });

      if (res.success) {
        setSuccessMessage("ออกหนังสือส่งตัวผู้ป่วยสำเร็จ!");
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 1000);
      } else {
        setErrorMessage(res.error || "ไม่สามารถออกหนังสือส่งตัวได้");
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
              <Send className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-chunjai-950">
                ออกหนังสือส่งตัวผู้ป่วย (New Referral Order)
              </h3>
              <p className="text-xs text-slate-500">
                ส่งตัวผู้ป่วยไปยังโรงพยาบาลรับส่งต่อเครือข่าย
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
              <PatientExactSearchInput
                onPatientFound={(p) => setSelectedPatient(p)}
                inputHeight="h-9"
                dropdownMaxHeight="max-h-40"
              />
            )}
          </div>

          {/* Hospital Select */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 block">
              โรงพยาบาลปลายทางรับส่งต่อ <span className="text-rose-500">*</span>
            </label>
            <select
              value={hospitalName}
              onChange={(e) => setHospitalName(e.target.value)}
              className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-chunjai-900 focus:border-chunjai-500 focus:outline-none"
            >
              {COMMON_HOSPITALS.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
              <option value="OTHER">อื่นๆ (ระบุชื่อสถานพยาบาลเอง)</option>
            </select>
          </div>

          {hospitalName === "OTHER" && (
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">
                ระบุชื่อสถานพยาบาลปลายทาง <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={customHospital}
                onChange={(e) => setCustomHospital(e.target.value)}
                placeholder="เช่น โรงพยาบาลบำรุงราษฎร์..."
                className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 text-xs focus:border-chunjai-500 focus:bg-white focus:outline-none"
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="font-semibold text-slate-700 block">
              เหตุผลและจุดประสงค์ในการส่งตัว <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={2}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="เช่น ต้องการตรวจทางห้องปฏิบัติการเฉพาะทาง / ตรวจสแกน MRI / ทำหัตถการพิเศษ..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50/50 p-2.5 text-xs focus:border-chunjai-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700 block">
              สรุปการตรวจวินิจฉัยและประวัติการรักษาเบื้องต้น
            </label>
            <textarea
              rows={3}
              value={diagnosisSummary}
              onChange={(e) => setDiagnosisSummary(e.target.value)}
              placeholder="สรุปอาการ วินิจฉัยเบื้องต้น (ICD-10) และประวัติการให้ยา..."
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
                  กำลังออกหนังสือส่งตัว...
                </>
              ) : (
                "ยืนยันออกหนังสือส่งตัว"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
