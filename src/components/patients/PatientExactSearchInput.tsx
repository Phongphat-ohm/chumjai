"use client";

import React, { useState, useTransition } from "react";
import { Search, Loader2, AlertCircle, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPatientsAction } from "@/server/actions/patient";

interface PatientExactSearchInputProps {
  /** Callback เมื่อพบและเลือกผู้ป่วยสำเร็จ */
  onPatientFound: (patient: any) => void;
  /** className เพิ่มเติมสำหรับ wrapper div */
  className?: string;
  /** ความสูงของ input (default: h-10) */
  inputHeight?: string;
  /** ขนาด dropdown (default: max-h-48) */
  dropdownMaxHeight?: string;
  /** แสดง Visit status badge ใน dropdown หรือไม่ */
  showVisitStatus?: boolean;
}

/**
 * PatientExactSearchInput
 *
 * ค้นหาผู้ป่วยด้วย HN หรือเลขบัตรประชาชน แบบ Exact Match 100%
 * - กด Enter หรือคลิกปุ่ม "ค้นหา" เพื่อส้นหา (ไม่ใช่ auto-search)
 * - HN ต้องตรงทั้งหมด เช่น HN690001 (case-insensitive)
 * - เลขบัตรประชาชนต้องถูกต้องครบ 13 หลัก
 */
export function PatientExactSearchInput({
  onPatientFound,
  className = "",
  inputHeight = "h-10",
  dropdownMaxHeight = "max-h-48",
  showVisitStatus = false,
}: PatientExactSearchInputProps) {
  const [isPending, startTransition] = useTransition();
  const [inputValue, setInputValue] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  /**
   * ตรวจสอบว่า input เป็น HN หรือเลขบัตรประชาชนที่ถูก format
   * - HN: ขึ้นต้นด้วย "HN" (case-insensitive) ตามด้วยตัวเลข
   * - เลขบัตรประชาชน: ตัวเลข 13 หลัก (อาจมี - คั่น)
   */
  const validateInput = (value: string): string | null => {
    const trimmed = value.trim();
    if (!trimmed) {
      return "กรุณากรอก HN หรือเลขบัตรประชาชน";
    }

    const upperVal = trimmed.toUpperCase();

    // ตรวจสอบ HN format: ขึ้นต้นด้วย HN ตามด้วยตัวเลข
    if (upperVal.startsWith("HN")) {
      const hnNumPart = upperVal.replace(/^HN/, "").replace(/[^0-9]/g, "");
      if (hnNumPart.length < 1) {
        return "HN ไม่ถูกต้อง — ต้องมีตัวเลขหลัง HN เช่น HN690001";
      }
      return null; // HN valid
    }

    // ตรวจสอบเลขบัตรประชาชน: ต้องเป็นตัวเลข 13 หลัก (ลบ - ออกก่อน)
    const digitsOnly = trimmed.replace(/-/g, "");
    if (/^\d+$/.test(digitsOnly)) {
      if (digitsOnly.length !== 13) {
        return `เลขบัตรประชาชนต้องมี 13 หลัก (กรอกมา ${digitsOnly.length} หลัก)`;
      }
      return null; // National ID valid
    }

    return "กรุณากรอก HN (เช่น HN690001) หรือเลขบัตรประชาชน 13 หลัก เท่านั้น";
  };

  const handleSearch = () => {
    const trimmed = inputValue.trim();

    // Validate
    const error = validateInput(trimmed);
    if (error) {
      setValidationError(error);
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    setValidationError(null);
    setHasSearched(true);

    // ส่ง query ไปยัง server — ส่ง input ตรงๆ ไป (server จะ toUpperCase เอง)
    startTransition(async () => {
      const res = await getPatientsAction({ search: trimmed, limit: 5 });
      if (res.success && res.data) {
        setSearchResults(res.data.patients);
      } else {
        setSearchResults([]);
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  const handleSelect = (patient: any) => {
    onPatientFound(patient);
    // Reset state หลังเลือก
    setInputValue("");
    setSearchResults([]);
    setHasSearched(false);
    setValidationError(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    // Reset error + results เมื่อแก้ input ใหม่
    if (validationError) setValidationError(null);
    if (hasSearched) {
      setHasSearched(false);
      setSearchResults([]);
    }
  };

  const showDropdown = hasSearched && !isPending;
  const isNationalId = /^\d{13}$/.test(inputValue.trim().replace(/-/g, ""));

  return (
    <div className={`relative ${className}`}>
      {/* Input Row */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="พิมพ์ HN (เช่น HN690001) หรือเลขบัตรประชาชน 13 หลัก แล้วกด Enter"
            className={`${inputHeight} w-full rounded-lg border ${
              validationError
                ? "border-rose-400 bg-rose-50/50 focus:border-rose-500 focus:ring-rose-200"
                : "border-slate-200 bg-slate-50/50 focus:border-chunjai-500 focus:ring-chunjai-200"
            } pl-9 pr-3 text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 transition-colors`}
            autoComplete="off"
            spellCheck={false}
          />
        </div>
        <Button
          type="button"
          onClick={handleSearch}
          disabled={isPending || !inputValue.trim()}
          className="bg-chunjai-600 hover:bg-chunjai-700 text-white font-semibold text-xs px-4 shrink-0"
        >
          {isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            "ค้นหา"
          )}
        </Button>
      </div>

      {/* Validation Error Message */}
      {validationError && (
        <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-rose-600 font-medium">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Helper hint text */}
      {!validationError && !hasSearched && (
        <p className="mt-1 text-[10px] text-slate-400 pl-1">
          ต้องพิมพ์ข้อมูลอ้างอิงให้ถูกต้อง 100% — HN หรือเลขบัตรประชาชน 13 หลักเท่านั้น
        </p>
      )}

      {/* Search Results Dropdown */}
      {showDropdown && (
        <div
          className={`absolute left-0 right-0 top-full mt-1 z-30 rounded-xl border border-slate-200 bg-white shadow-xl overflow-hidden ${dropdownMaxHeight} overflow-y-auto`}
        >
          {searchResults.length === 0 ? (
            <div className="p-4 text-center space-y-1">
              <p className="text-xs font-semibold text-slate-700">
                ไม่พบข้อมูลผู้ป่วยในระบบ
              </p>
              <p className="text-[11px] text-slate-400">
                กรุณาตรวจสอบ{isNationalId ? "เลขบัตรประชาชน" : "HN"} ให้ถูกต้อง
              </p>
            </div>
          ) : (
            <div className="p-1.5 space-y-0.5">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 flex items-center gap-1.5">
                <UserCheck className="h-3 w-3 text-chunjai-600" />
                พบผู้ป่วย {searchResults.length} ราย
              </div>
              {searchResults.map((p) => (
                <div
                  key={p.id}
                  onClick={() => handleSelect(p)}
                  className="flex items-center justify-between p-2.5 rounded-lg hover:bg-chunjai-50 cursor-pointer transition-colors group"
                >
                  <div>
                    <span className="font-bold text-xs text-slate-900 group-hover:text-chunjai-800 block">
                      {p.firstName} {p.lastName}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {p.phoneNumber || "ไม่มีเบอร์โทร"}
                    </span>
                  </div>
                  <span className="font-mono text-xs font-bold text-chunjai-700 bg-chunjai-50 group-hover:bg-chunjai-100 px-2 py-0.5 rounded border border-chunjai-200 transition-colors shrink-0">
                    {p.hn}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
