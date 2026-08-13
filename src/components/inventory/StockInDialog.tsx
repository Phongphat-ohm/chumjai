"use client";

import React, { useState, useTransition } from "react";
import { PlusCircle, X, PackagePlus, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { stockInAction } from "@/server/actions/inventory";

interface StockInDialogProps {
  isOpen: boolean;
  drugs: { id: string; code: string; genericName: string; unit: string }[];
  onClose: () => void;
  onSuccess?: () => void;
}

export function StockInDialog({
  isOpen,
  drugs,
  onClose,
  onSuccess,
}: StockInDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [drugId, setDrugId] = useState(drugs[0]?.id || "");
  const [lotNumber, setLotNumber] = useState("");
  const [quantity, setQuantity] = useState<number>(200);
  const [expiredAt, setExpiredAt] = useState("");
  const [notes, setNotes] = useState("");

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    startTransition(async () => {
      const res = await stockInAction({
        drugId: drugId || drugs[0]?.id,
        lotNumber,
        quantity,
        expiredAt,
        notes,
      });

      if (res.success) {
        setSuccessMessage("รับยาเข้าคลังและสร้างล็อตยาสำเร็จ!");
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 1000);
      } else {
        setErrorMessage(res.error || "ไม่สามารถรับยาเข้าคลังได้");
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
              <PackagePlus className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-chunjai-950">
                รับยาเข้าคลัง (Stock In & Batch Entry)
              </h3>
              <p className="text-xs text-slate-500">
                สร้างล็อตยาใหม่และเพิ่มจำนวนสต็อกรวม
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

          <div className="space-y-1">
            <label className="font-semibold text-slate-700 block">
              เลือกตัวยา <span className="text-rose-500">*</span>
            </label>
            <select
              value={drugId}
              onChange={(e) => setDrugId(e.target.value)}
              className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:border-chunjai-500 focus:outline-none"
            >
              {drugs.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.genericName} ({d.code})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">
                เลขล็อต (Lot Number) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={lotNumber}
                onChange={(e) => setLotNumber(e.target.value)}
                placeholder="เช่น LOT-2026-001"
                className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 text-xs uppercase focus:border-chunjai-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">
                จำนวนที่รับเข้า <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min={1}
                required
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
                placeholder="200"
                className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 text-xs font-bold text-chunjai-700 focus:border-chunjai-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700 block">
              วันหมดอายุ (Expired Date) <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              required
              value={expiredAt}
              onChange={(e) => setExpiredAt(e.target.value)}
              className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:border-chunjai-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700 block">
              หมายเหตุการรับเข้า
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="เช่น รับจากบริษัทเวชภัณฑ์ A..."
              className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 text-xs focus:border-chunjai-500 focus:bg-white focus:outline-none"
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
                  กำลังรับยาเข้าคลัง...
                </>
              ) : (
                "ยืนยันรับยาเข้าคลัง"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
