"use client";

import React, { useState, useTransition } from "react";
import { ShieldAlert, Loader2, AlertCircle, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addPatientAllergyAction } from "@/server/actions/patient";

interface AddAllergyDialogProps {
  isOpen: boolean;
  patientId: string;
  patientName: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AddAllergyDialog({
  isOpen,
  patientId,
  patientName,
  onClose,
  onSuccess,
}: AddAllergyDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [allergen, setAllergen] = useState("");
  const [reaction, setReaction] = useState("");
  const [severity, setSeverity] = useState("SEVERE");
  const [notes, setNotes] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    startTransition(async () => {
      const res = await addPatientAllergyAction({
        patientId,
        allergen,
        reaction,
        severity,
        notes,
      });

      if (res.success) {
        setSuccessMessage("บันทึกข้อมูลการแพ้ยาสำเร็จ!");
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 1000);
      } else {
        setErrorMessage(res.error || "ไม่สามารถบันทึกข้อมูลการแพ้ยาได้");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-md rounded-xl bg-white shadow-xl border border-chunjai-100">
        <div className="flex items-center justify-between border-b border-rose-100 px-6 py-4 bg-rose-50/60 rounded-t-xl">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-rose-600" />
            <div>
              <h3 className="text-base font-bold text-rose-950">
                เพิ่มประวัติการแพ้ยา / อาหาร
              </h3>
              <p className="text-xs text-rose-700 font-medium">
                ผู้ป่วย: {patientName}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4 text-rose-800" />
          </Button>
        </div>

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

          <div className="space-y-1">
            <label className="font-semibold text-slate-700 block">
              ยา / สารที่แพ้ <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={allergen}
              onChange={(e) => setAllergen(e.target.value)}
              placeholder="เช่น Penicillin, Amoxicillin, อาหารทะเล"
              className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 text-xs text-slate-900 focus:border-chunjai-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700 block">
              อาการที่แสดง (Reaction)
            </label>
            <input
              type="text"
              value={reaction}
              onChange={(e) => setReaction(e.target.value)}
              placeholder="เช่น ผื่นคัน, แน่นหน้าอก, หายใจลำบาก"
              className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 text-xs text-slate-900 focus:border-chunjai-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700 block">
              ระดับความรุนแรง (Severity)
            </label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 text-xs text-slate-900 focus:border-chunjai-500 focus:bg-white focus:outline-none"
            >
              <option value="MILD">รุนแรงน้อย (Mild)</option>
              <option value="MODERATE">รุนแรงปานกลาง (Moderate)</option>
              <option value="SEVERE">รุนแรงมาก / รุนแรงถึงชีวิต (Severe / Anaphylaxis)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700 block">
              หมายเหตุเพิ่มเติม
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="รายละเอียดเพิ่มเติม..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50/50 p-2 text-xs text-slate-900 focus:border-chunjai-500 focus:bg-white focus:outline-none"
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
              className="bg-rose-600 hover:bg-rose-700 text-white font-semibold"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  กำลังบันทึก...
                </>
              ) : (
                "บันทึกประวัติการแพ้ยา"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
