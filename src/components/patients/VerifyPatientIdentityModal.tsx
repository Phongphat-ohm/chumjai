"use client";

import React, { useState, useRef, useEffect, useTransition } from "react";
import { Lock, KeyRound, ShieldCheck, X, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { verifyPatientIdentityAction } from "@/server/actions/patient";

interface VerifyPatientIdentityModalProps {
  isOpen: boolean;
  patientId: string;
  patientName: string;
  hn: string;
  onClose: () => void;
  onVerified: () => void;
  title?: string;
  description?: string;
}

export function VerifyPatientIdentityModal({
  isOpen,
  patientId,
  patientName,
  hn,
  onClose,
  onVerified,
  title = "ยืนยันสิทธิ์เพื่อเข้าถึงข้อมูลเวชระเบียนและข้อมูลส่วนบุคคล",
  description = "ตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล (PDPA) กรุณาระบุเลข 4 ตัวท้ายของบัตรประชาชนผู้ป่วยเพื่อยืนยันตัวตน",
}: VerifyPatientIdentityModalProps) {
  const [isPending, startTransition] = useTransition();
  const [digits, setDigits] = useState<string[]>(["", "", "", ""]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  useEffect(() => {
    if (isOpen) {
      setDigits(["", "", "", ""]);
      setErrorMessage(null);
      setTimeout(() => {
        inputRefs[0].current?.focus();
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDigitChange = (index: number, val: string) => {
    // Only accept alphanumeric characters
    const clean = val.replace(/[^0-9a-zA-Z]/g, "").slice(-1);
    const newDigits = [...digits];
    newDigits[index] = clean;
    setDigits(newDigits);
    setErrorMessage(null);

    // Auto advance to next input
    if (clean && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/[^0-9a-zA-Z]/g, "").slice(0, 4);
    if (pasted.length > 0) {
      const newDigits = ["", "", "", ""];
      for (let i = 0; i < pasted.length; i++) {
        newDigits[i] = pasted[i];
      }
      setDigits(newDigits);
      if (pasted.length === 4) {
        inputRefs[3].current?.focus();
      } else {
        inputRefs[pasted.length]?.current?.focus();
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pin = digits.join("");
    if (pin.length !== 4) {
      setErrorMessage("กรุณากรอกเลขยืนยันให้ครบทั้ง 4 หลัก");
      return;
    }

    startTransition(async () => {
      const res = await verifyPatientIdentityAction(patientId, pin);
      if (res.success && res.data?.verified) {
        onVerified();
        onClose();
      } else {
        setErrorMessage(res.error || "เลข 4 ตัวท้ายไม่ถูกต้อง กรุณาตรวจสอบกับผู้ป่วย");
        setDigits(["", "", "", ""]);
        inputRefs[0].current?.focus();
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-white shadow-md">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-950">
                การยืนยันตัวตนความปลอดภัย (PDPA Security)
              </h3>
              <p className="text-[11px] text-slate-500 font-mono">
                HN: {hn} · {patientName}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-slate-500 hover:text-slate-900 rounded-lg"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content & Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs">
          <div className="text-center space-y-1.5">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 mb-1">
              <KeyRound className="h-6 w-6" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">{title}</h4>
            <p className="text-slate-500 text-xs leading-relaxed max-w-xs mx-auto">
              {description}
            </p>
          </div>

          {errorMessage && (
            <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-rose-700 font-medium">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 4 Digits Input Boxes */}
          <div className="flex justify-center items-center gap-3 py-2">
            {digits.map((digit, idx) => (
              <input
                key={idx}
                ref={inputRefs[idx]}
                type="password"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                onPaste={handlePaste}
                autoComplete="off"
                className="h-14 w-12 text-center text-xl font-bold font-mono rounded-xl border-2 border-slate-300 bg-slate-50 text-slate-900 focus:border-amber-500 focus:bg-white focus:outline-none transition-all shadow-2xs"
              />
            ))}
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 flex items-start gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              ระบบจะบันทึก Audit Log ทุกครั้งที่มีการเข้าถึงข้อมูลเวชระเบียน เพื่อความโปร่งใสตามมาตรฐานธรรมาภิบาลข้อมูลสุขภาพ
            </span>
          </div>

          {/* Footer Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
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
              disabled={isPending || digits.join("").length !== 4}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs h-9 px-5 shadow-sm"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  กำลังตรวจสอบ...
                </>
              ) : (
                "ยืนยันและปลดล็อกข้อมูล"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
