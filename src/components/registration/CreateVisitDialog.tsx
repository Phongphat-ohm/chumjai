"use client";

import React, { useState, useTransition } from "react";
import { Stethoscope, Loader2, AlertCircle, CheckCircle2, X, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createVisitAction } from "@/server/actions/visit";

interface CreateVisitDialogProps {
  isOpen: boolean;
  patient: {
    id: string;
    hn: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    rightsType?: string;
  } | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateVisitDialog({
  isOpen,
  patient,
  onClose,
  onSuccess,
}: CreateVisitDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [chiefComplaint, setChiefComplaint] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen || !patient) return null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    startTransition(async () => {
      const res = await createVisitAction({
        patientId: patient.id,
        chiefComplaint,
      });

      if (res.success) {
        setSuccessMessage(`เปิด Visit และออกคิวคัดกรองสำเร็จ! (${res.data.visitNumber})`);
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 1200);
      } else {
        setErrorMessage(res.error || "ไม่สามารถเปิด Visit ได้");
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
              <Stethoscope className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-chunjai-950">
                เปิดเคสรับบริการ (New Visit)
              </h3>
              <p className="text-xs text-slate-500">
                ส่งผู้ป่วยเข้าจุดคัดกรองวัดสัญญาณชีพ
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Patient Summary Badge */}
        <div className="p-6 pb-2">
          <div className="flex items-center gap-3 p-3 rounded-lg border border-chunjai-100 bg-chunjai-50/30 text-xs">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-chunjai-100 text-chunjai-700 font-bold shrink-0">
              <User className="h-4 w-4" />
            </div>
            <div>
              <p className="font-bold text-chunjai-950">
                {patient.firstName} {patient.lastName} ({patient.hn})
              </p>
              <p className="text-[11px] text-slate-500">
                สิทธิการรักษา: {patient.rightsType || "บัตรทอง 30 บาท"}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4 text-xs">
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

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 block">
              อาการสำคัญที่มาโรงพยาบาล / คลินิก (Chief Complaint) <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={chiefComplaint}
              onChange={(e) => setChiefComplaint(e.target.value)}
              placeholder="เช่น ไข้สูง ไอ เจ็บคอ ปวดศีรษะ 2 วัน หรือ มาตามนัดยารักษาเบาหวาน..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50/50 p-3 text-xs text-slate-900 focus:border-chunjai-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
            >
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
                  กำลังส่งเข้าจุดคัดกรอง...
                </>
              ) : (
                "ยืนยันเปิด Visit & ออกคิว"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
