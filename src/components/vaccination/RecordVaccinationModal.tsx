"use client";

import React, { useState, useEffect, useTransition } from "react";
import { Syringe, X, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPatientsAction } from "@/server/actions/patient";
import {
  getVaccineCatalogAction,
  recordVaccinationAction,
} from "@/server/actions/vaccination";
import { PatientExactSearchInput } from "@/components/patients/PatientExactSearchInput";

interface RecordVaccinationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function RecordVaccinationModal({
  isOpen,
  onClose,
  onSuccess,
}: RecordVaccinationModalProps) {
  const [isPending, startTransition] = useTransition();

  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);

  const [vaccines, setVaccines] = useState<any[]>([]);
  const [selectedVaccineId, setSelectedVaccineId] = useState("");

  const [lotNumber, setLotNumber] = useState("");
  const [doseNumber, setDoseNumber] = useState<number>(1);
  const [administeredAt, setAdministeredAt] = useState(
    new Date().toISOString().slice(0, 16)
  );
  const [injectionSite, setInjectionSite] = useState("ต้นแขนขวา");

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      startTransition(async () => {
        const res = await getVaccineCatalogAction();
        if (res.success && res.data) {
          setVaccines(res.data);
          if (res.data.length > 0) {
            setSelectedVaccineId(res.data[0].id);
          }
        }
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;



  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!selectedPatient) {
      setErrorMessage("กรุณาเลือกผู้ป่วยสำหรับประวัติรับวัคซีน");
      return;
    }

    if (!selectedVaccineId) {
      setErrorMessage("กรุณาเลือกประเภทวัคซีน");
      return;
    }

    startTransition(async () => {
      const res = await recordVaccinationAction({
        patientId: selectedPatient.id,
        vaccineId: selectedVaccineId,
        lotNumber,
        doseNumber,
        administeredAt,
        injectionSite,
      });

      if (res.success) {
        setSuccessMessage("บันทึกการรับวัคซีนสำเร็จ!");
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 1000);
      } else {
        setErrorMessage(res.error || "ไม่สามารถบันทึกการรับวัคซีนได้");
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
              <Syringe className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-chunjai-950">
                ลงบันทึกการรับวัคซีน (Record Vaccination)
              </h3>
              <p className="text-xs text-slate-500">
                บันทึกการรับวัคซีน เข็มที่ เลขล็อต และบุคลากรผู้ฉีด
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
                  <span className="text-[11px] text-chunjai-600 font-mono ml-2">
                    HN: {selectedPatient.hn}
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

          {/* Vaccine Select */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 block">
              เลือกวัคซีน <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedVaccineId}
              onChange={(e) => setSelectedVaccineId(e.target.value)}
              className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-chunjai-900 focus:border-chunjai-500 focus:outline-none"
            >
              {vaccines.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.manufacturer || "N/A"})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">
                เข็มที่ (Dose No.) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min={1}
                required
                value={doseNumber}
                onChange={(e) => setDoseNumber(parseInt(e.target.value, 10) || 1)}
                className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 text-xs font-bold text-chunjai-700 focus:border-chunjai-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">
                เลขล็อต (Lot Number)
              </label>
              <input
                type="text"
                value={lotNumber}
                onChange={(e) => setLotNumber(e.target.value)}
                placeholder="เช่น VAC-2026-001"
                className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 text-xs uppercase focus:border-chunjai-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">
                วันและเวลาที่ฉีด <span className="text-rose-500">*</span>
              </label>
              <input
                type="datetime-local"
                required
                value={administeredAt}
                onChange={(e) => setAdministeredAt(e.target.value)}
                className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:border-chunjai-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">
                ตำแหน่งที่ฉีด
              </label>
              <select
                value={injectionSite}
                onChange={(e) => setInjectionSite(e.target.value)}
                className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs focus:border-chunjai-500 focus:outline-none"
              >
                <option value="ต้นแขนขวา">ต้นแขนขวา</option>
                <option value="ต้นแขนซ้าย">ต้นแขนซ้าย</option>
                <option value="สะโพกขวา">สะโพกขวา</option>
                <option value="สะโพกซ้าย">สะโพกซ้าย</option>
              </select>
            </div>
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
                "ยืนยันบันทึกการรับวัคซีน"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
