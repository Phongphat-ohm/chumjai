"use client";

import React, { useState, useTransition } from "react";
import { Plus, X, Pill, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createDrugAction } from "@/server/actions/inventory";

interface DrugFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function DrugFormDialog({
  isOpen,
  onClose,
  onSuccess,
}: DrugFormDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [code, setCode] = useState("");
  const [genericName, setGenericName] = useState("");
  const [tradeName, setTradeName] = useState("");
  const [strength, setStrength] = useState("");
  const [unit, setUnit] = useState("เม็ด");
  const [minStockLevel, setMinStockLevel] = useState<number>(100);
  const [description, setDescription] = useState("");

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    startTransition(async () => {
      const res = await createDrugAction({
        code,
        genericName,
        tradeName,
        strength,
        unit,
        minStockLevel,
        description,
      });

      if (res.success) {
        setSuccessMessage("ลงทะเบียนรายการยาใหม่สำเร็จ!");
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 1000);
      } else {
        setErrorMessage(res.error || "ไม่สามารถเพิ่มรายการยาใหม่ได้");
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
              <Pill className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-chunjai-950">
                ลงทะเบียนรายการยาใหม่ (New Drug)
              </h3>
              <p className="text-xs text-slate-500">
                เพิ่มตัวยาเข้าสู่ทะเบียนคลังยาของคลินิก
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

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">
                รหัสยา (Drug Code) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="เช่น PARA500"
                className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 text-xs uppercase focus:border-chunjai-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">
                หน่วยนับ (Unit) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="เม็ด / ขวด / ซอง"
                className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 text-xs focus:border-chunjai-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700 block">
              ชื่อสามัญทางยา (Generic Name) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={genericName}
              onChange={(e) => setGenericName(e.target.value)}
              placeholder="เช่น Paracetamol, Amoxicillin"
              className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 text-xs focus:border-chunjai-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">
                ชื่อการค้า (Trade Name)
              </label>
              <input
                type="text"
                value={tradeName}
                onChange={(e) => setTradeName(e.target.value)}
                placeholder="เช่น Tylenol, Sara"
                className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 text-xs focus:border-chunjai-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">
                ความแรง (Strength)
              </label>
              <input
                type="text"
                value={strength}
                onChange={(e) => setStrength(e.target.value)}
                placeholder="เช่น 500 mg, 10 mg"
                className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 text-xs focus:border-chunjai-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700 block">
              จำนวนสต็อกเตือนขั้นต่ำ (Min Stock Level) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min={0}
              required
              value={minStockLevel}
              onChange={(e) => setMinStockLevel(parseInt(e.target.value, 10) || 0)}
              placeholder="100"
              className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 text-xs font-bold text-chunjai-700 focus:border-chunjai-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700 block">
              รายละเอียด / สรรพคุณ
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="รายละเอียดของยา..."
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
                  กำลังลงทะเบียน...
                </>
              ) : (
                "บันทึกลงทะเบียนยา"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
