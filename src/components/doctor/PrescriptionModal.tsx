"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  Pill,
  Search,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  X,
  ShieldAlert,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  getAvailableDrugsAction,
  savePrescriptionAction,
  getPrescriptionByVisitAction,
} from "@/server/actions/prescription";

interface PrescriptionModalProps {
  isOpen: boolean;
  visitId: string;
  patientName: string;
  allergies?: { id: string; allergen: string }[];
  onClose: () => void;
  onSuccess?: () => void;
}

export function PrescriptionModal({
  isOpen,
  visitId,
  patientName,
  allergies = [],
  onClose,
  onSuccess,
}: PrescriptionModalProps) {
  const [isPending, startTransition] = useTransition();
  const [drugSearch, setDrugSearch] = useState("");
  const [availableDrugs, setAvailableDrugs] = useState<any[]>([]);
  const [selectedItems, setSelectedItems] = useState<
    {
      drugId: string;
      code: string;
      genericName: string;
      tradeName?: string;
      quantity: number;
      dosage: string;
      frequency: string;
      instruction?: string;
    }[]
  >([]);

  const [notes, setNotes] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch available drugs
  useEffect(() => {
    if (isOpen) {
      startTransition(async () => {
        const res = await getAvailableDrugsAction();
        if (res.success && res.data) {
          setAvailableDrugs(res.data);
        }

        // Fetch existing prescription if any
        const pRes = await getPrescriptionByVisitAction(visitId);
        if (pRes.success && pRes.data?.items) {
          setNotes(pRes.data.notes || "");
          setSelectedItems(
            pRes.data.items.map((it: any) => ({
              drugId: it.drugId,
              code: it.drug?.code || "",
              genericName: it.drug?.genericName || "",
              tradeName: it.drug?.tradeName || undefined,
              quantity: it.quantity,
              dosage: it.dosage,
              frequency: it.frequency,
              instruction: it.instruction || undefined,
            }))
          );
        }
      });
    }
  }, [isOpen, visitId]);

  if (!isOpen) return null;

  const handleSearch = (q: string) => {
    setDrugSearch(q);
    startTransition(async () => {
      const res = await getAvailableDrugsAction(q);
      if (res.success && res.data) {
        setAvailableDrugs(res.data);
      }
    });
  };

  const handleAddDrug = (drug: any) => {
    if (selectedItems.some((item) => item.drugId === drug.id)) return;

    setSelectedItems([
      ...selectedItems,
      {
        drugId: drug.id,
        code: drug.code,
        genericName: drug.genericName,
        tradeName: drug.tradeName || undefined,
        quantity: 10,
        dosage: "1 เม็ด",
        frequency: "วันละ 3 ครั้ง หลังอาหาร",
        instruction: "ทานเมื่อมีอาการ",
      },
    ]);
  };

  const handleRemoveItem = (drugId: string) => {
    setSelectedItems(selectedItems.filter((it) => it.drugId !== drugId));
  };

  const handleItemChange = (
    drugId: string,
    field: "quantity" | "dosage" | "frequency" | "instruction",
    val: any
  ) => {
    setSelectedItems(
      selectedItems.map((it) => (it.drugId === drugId ? { ...it, [field]: val } : it))
    );
  };

  // Check if any selected drug matches patient allergy
  const checkAllergyWarning = (genericName: string) => {
    return allergies.some((a) =>
      genericName.toLowerCase().includes(a.allergen.toLowerCase()) ||
      a.allergen.toLowerCase().includes(genericName.toLowerCase())
    );
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    if (selectedItems.length === 0) {
      setErrorMessage("กรุณาสั่งยาอย่างน้อย 1 รายการ");
      return;
    }

    startTransition(async () => {
      const res = await savePrescriptionAction({
        visitId,
        notes,
        items: selectedItems.map((it) => ({
          drugId: it.drugId,
          quantity: it.quantity,
          dosage: it.dosage,
          frequency: it.frequency,
          instruction: it.instruction,
        })),
      });

      if (res.success) {
        setSuccessMessage("บันทึกใบสั่งยาเรียบร้อยแล้ว!");
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 1000);
      } else {
        setErrorMessage(res.error || "ไม่สามารถบันทึกใบสั่งยาได้");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-xl bg-white shadow-2xl border border-chunjai-100 my-6 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-chunjai-100 px-6 py-4 bg-chunjai-50/60 rounded-t-xl shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-chunjai-600 text-white">
              <Pill className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-chunjai-950">
                สั่งยาให้ผู้ป่วย (Doctor Prescription)
              </h3>
              <p className="text-xs text-slate-500">
                ผู้ป่วย: {patientName}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Allergy Alert Header */}
        {allergies.length > 0 && (
          <div className="bg-rose-50 border-b border-rose-200 px-6 py-2 flex items-center gap-2 text-xs font-bold text-rose-800 shrink-0">
            <ShieldAlert className="h-4 w-4 text-rose-600 shrink-0" />
            <span>
              ประวัติแพ้ยาผู้ป่วย: {allergies.map((a) => a.allergen).join(", ")}
            </span>
          </div>
        )}

        {/* Body Split View */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden">
            {/* Left Column: Drug Inventory Search */}
            <div className="md:col-span-5 border-b md:border-b-0 md:border-r border-slate-200 p-4 space-y-3 flex flex-col overflow-hidden text-xs">
              <span className="font-bold text-slate-900 block">ค้นหาตัวยาในคลัง</span>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={drugSearch}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="ค้นหาชื่อยา รหัสยา..."
                  className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50/50 pl-9 pr-3 text-xs focus:border-chunjai-500 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
                {availableDrugs.map((d) => {
                  const isAllergic = checkAllergyWarning(d.genericName);
                  const isSelected = selectedItems.some((it) => it.drugId === d.id);

                  return (
                    <div
                      key={d.id}
                      onClick={() => !isSelected && handleAddDrug(d)}
                      className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                        isAllergic
                          ? "bg-rose-50/80 border-rose-300 hover:bg-rose-100"
                          : isSelected
                          ? "bg-slate-100 border-slate-300 opacity-60 cursor-not-allowed"
                          : "bg-white border-slate-200 hover:bg-chunjai-50/60 hover:border-chunjai-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{d.genericName}</span>
                        <Badge variant="outline" className="text-[10px]">
                          {d.strength || d.unit}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {d.tradeName || d.code} · สต็อก: {d.totalStock} {d.unit}
                      </p>

                      {isAllergic && (
                        <p className="text-[10px] font-bold text-rose-700 mt-1 flex items-center gap-1">
                          <ShieldAlert className="h-3 w-3" />
                          ตรงกับประวัติแพ้ยาของผู้ป่วย!
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Prescribed Items Table */}
            <div className="md:col-span-7 p-4 space-y-4 flex flex-col overflow-hidden text-xs">
              <span className="font-bold text-slate-900 block">
                รายการยาที่สั่งจ่าย ({selectedItems.length} รายการ)
              </span>

              {errorMessage && (
                <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-rose-700">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-2.5 text-emerald-700 font-semibold">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {selectedItems.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 border border-dashed border-slate-200 rounded-lg">
                    เลือกตัวยาจากฝั่งซ้ายเพื่อสั่งจ่าย
                  </div>
                ) : (
                  selectedItems.map((item, idx) => {
                    const isAllergic = checkAllergyWarning(item.genericName);

                    return (
                      <div
                        key={item.drugId}
                        className={`p-3 rounded-lg border space-y-2 ${
                          isAllergic ? "bg-rose-50 border-rose-300" : "bg-slate-50/70 border-slate-200"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-bold text-slate-900 text-sm">
                              {idx + 1}. {item.genericName}
                            </span>
                            <span className="text-[11px] text-slate-500 ml-2">
                              ({item.code})
                            </span>
                          </div>

                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveItem(item.drugId)}
                            className="h-7 w-7 text-rose-500 hover:bg-rose-100"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        {isAllergic && (
                          <div className="text-[11px] font-bold text-rose-700 bg-rose-100 p-1.5 rounded flex items-center gap-1">
                            <ShieldAlert className="h-4 w-4 text-rose-600" />
                            เตือนอันตราย: ตัวยานี้ตรงกับประวัติแพ้ยาของผู้ป่วย!
                          </div>
                        )}

                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div>
                            <label className="text-[10px] text-slate-500 block font-semibold">
                              ขนาดยา (Dose)
                            </label>
                            <input
                              type="text"
                              value={item.dosage}
                              onChange={(e) =>
                                handleItemChange(item.drugId, "dosage", e.target.value)
                              }
                              className="h-8 w-full rounded border border-slate-200 px-2 text-xs"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] text-slate-500 block font-semibold">
                              ความถี่ (Frequency)
                            </label>
                            <input
                              type="text"
                              value={item.frequency}
                              onChange={(e) =>
                                handleItemChange(item.drugId, "frequency", e.target.value)
                              }
                              className="h-8 w-full rounded border border-slate-200 px-2 text-xs"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] text-slate-500 block font-semibold">
                              จำนวนรวม (Qty)
                            </label>
                            <input
                              type="number"
                              min={1}
                              value={item.quantity}
                              onChange={(e) =>
                                handleItemChange(
                                  item.drugId,
                                  "quantity",
                                  parseInt(e.target.value, 10) || 1
                                )
                              }
                              className="h-8 w-full rounded border border-slate-200 px-2 text-xs font-bold text-chunjai-700"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Note */}
              <div className="space-y-1 shrink-0 pt-2 border-t border-slate-100">
                <label className="font-semibold text-slate-700 block">
                  หมายเหตุใบสั่งยาเพิ่มเติม
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="คำแนะนำพิเศษแก่เภสัชกร..."
                  className="h-8 w-full rounded border border-slate-200 px-3 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Footer Action */}
          <div className="flex items-center justify-end gap-3 p-4 border-t border-slate-100 bg-slate-50/50 shrink-0">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              ยกเลิก
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-chunjai-600 hover:bg-chunjai-700 text-white font-bold"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  กำลังบันทึกใบสั่งยา...
                </>
              ) : (
                "บันทึกใบสั่งยา"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
