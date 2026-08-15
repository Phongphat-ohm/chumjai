"use client";

import React, { useState, useTransition } from "react";
import { CalendarDays, X, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPatientsAction } from "@/server/actions/patient";
import { createAppointmentAction } from "@/server/actions/appointment";
import { PatientExactSearchInput } from "@/components/patients/PatientExactSearchInput";

interface CreateAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateAppointmentModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateAppointmentModalProps) {
  const [isPending, startTransition] = useTransition();

  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);

  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("09:00");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;



  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!selectedPatient) {
      setErrorMessage("กรุณาเลือกผู้ป่วยสำหรับใบนัดหมาย");
      return;
    }

    if (!appointmentDate) {
      setErrorMessage("กรุณาระบุวันนัดหมาย");
      return;
    }

    const fullDateTime = `${appointmentDate}T${appointmentTime}:00`;

    startTransition(async () => {
      const res = await createAppointmentAction({
        patientId: selectedPatient.id,
        appointmentDate: fullDateTime,
        reason,
        notes,
      });

      if (res.success) {
        setSuccessMessage("สร้างใบนัดหมายผู้ป่วยสำเร็จ!");
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 1000);
      } else {
        setErrorMessage(res.error || "ไม่สามารถสร้างใบนัดหมายได้");
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
              <CalendarDays className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-chunjai-950">
                สร้างใบนัดหมายติดตามผล (New Appointment)
              </h3>
              <p className="text-xs text-slate-500">
                กำหนดวันและเวลานัดตรวจติดตามผลสำหรับผู้ป่วย
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

          {/* Date & Time Select */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">
                วันนัดหมาย <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:border-chunjai-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">
                เวลานัดหมาย <span className="text-rose-500">*</span>
              </label>
              <input
                type="time"
                required
                value={appointmentTime}
                onChange={(e) => setAppointmentTime(e.target.value)}
                className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:border-chunjai-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700 block">
              วัตถุประสงค์การนัดหมาย <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="เช่น ตรวจติดตามอาการเบาหวาน / ฟังผลแล็บ..."
              className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 text-xs focus:border-chunjai-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700 block">
              คำแนะนำการเตรียมตัวผู้ป่วยเพิ่มเติม
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="เช่น งดน้ำและอาหาร 8 ชั่วโมงก่อนมาตรวจ..."
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
                  กำลังสร้างใบนัด...
                </>
              ) : (
                "ยืนยันสร้างใบนัดหมาย"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
