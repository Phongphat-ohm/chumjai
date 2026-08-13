"use client";

import React, { useState } from "react";
import { Search, Plus, X, Stethoscope, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { searchIcd10Codes, Icd10Item } from "@/lib/icd10-data";
import { DiagnosisType } from "@/generated/client";

interface Icd10SearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (item: Icd10Item, type: DiagnosisType) => void;
}

export function Icd10SearchDialog({
  isOpen,
  onClose,
  onSelect,
}: Icd10SearchDialogProps) {
  const [query, setQuery] = useState("");
  const [selectedType, setSelectedType] = useState<DiagnosisType>(DiagnosisType.PRIMARY);

  if (!isOpen) return null;

  const results = searchIcd10Codes(query);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-xl rounded-xl bg-white shadow-2xl border border-chunjai-100 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-chunjai-100 px-6 py-4 bg-chunjai-50/60 rounded-t-xl shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-chunjai-600 text-white">
              <Stethoscope className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-chunjai-950">
                ค้นหารหัสวินิจฉัยโรค (ICD-10 Picker)
              </h3>
              <p className="text-xs text-slate-500">
                ค้นหาตามรหัส ICD-10 หรือชื่อโรคภาษาไทย / ภาษาอังกฤษ
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Search & Type Select */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 space-y-3 shrink-0 text-xs">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="พิมพ์รหัส ICD-10 เช่น J00, E11 หรือชื่อโรค..."
              className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-4 text-xs font-medium text-slate-900 focus:border-chunjai-500 focus:outline-none focus:ring-2 focus:ring-chunjai-200"
              autoFocus
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">ประเภทโรค:</span>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedType(DiagnosisType.PRIMARY)}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                  selectedType === DiagnosisType.PRIMARY
                    ? "bg-chunjai-600 text-white shadow-xs"
                    : "bg-white text-slate-700 border border-slate-200 hover:bg-chunjai-50"
                }`}
              >
                โรคหลัก (Primary)
              </button>
              <button
                type="button"
                onClick={() => setSelectedType(DiagnosisType.SECONDARY)}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                  selectedType === DiagnosisType.SECONDARY
                    ? "bg-purple-600 text-white shadow-xs"
                    : "bg-white text-slate-700 border border-slate-200 hover:bg-purple-50"
                }`}
              >
                โรคร่วม (Secondary)
              </button>
              <button
                type="button"
                onClick={() => setSelectedType(DiagnosisType.COMPLICATION)}
                className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                  selectedType === DiagnosisType.COMPLICATION
                    ? "bg-amber-600 text-white shadow-xs"
                    : "bg-white text-slate-700 border border-slate-200 hover:bg-amber-50"
                }`}
              >
                ภาวะแทรกซ้อน (Complication)
              </button>
            </div>
          </div>
        </div>

        {/* ICD-10 Search List Results */}
        <div className="flex-1 overflow-y-auto p-4 divide-y divide-slate-100 text-xs">
          {results.length === 0 ? (
            <div className="py-8 text-center text-slate-400">
              ไม่พบรหัส ICD-10 ที่ตรงกับคำค้นหา
            </div>
          ) : (
            results.map((item) => (
              <div
                key={item.code}
                className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-chunjai-50/70 transition-colors group cursor-pointer"
                onClick={() => {
                  onSelect(item, selectedType);
                  onClose();
                }}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="bg-chunjai-700 text-white font-mono text-xs">
                      {item.code}
                    </Badge>
                    <span className="font-bold text-slate-900">{item.nameTh}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {item.nameEn} · <span className="text-chunjai-600">{item.category}</span>
                  </p>
                </div>

                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 text-chunjai-700 group-hover:bg-chunjai-600 group-hover:text-white"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  เลือก
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
