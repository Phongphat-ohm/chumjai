"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  Building2,
  X,
  UserCheck,
  Lock,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldAlert,
  ArrowRight,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  getServiceStationsAction,
  occupyStationAction,
  vacateStationAction,
} from "@/server/actions/station";
import { StationType } from "@/generated/client";

interface StationSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  filterType?: StationType;
  currentUserId?: string;
  onStationChanged?: () => void;
}

export function StationSelectorModal({
  isOpen,
  onClose,
  filterType,
  currentUserId,
  onStationChanged,
}: StationSelectorModalProps) {
  const [isPending, startTransition] = useTransition();
  const [stations, setStations] = useState<any[]>([]);
  const [selectedDurationHours, setSelectedDurationHours] = useState<number>(4); // default 4 hours
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchStations = () => {
    startTransition(async () => {
      const res = await getServiceStationsAction(filterType);
      if (res.success && res.data) {
        setStations(res.data);
      }
    });
  };

  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      setSuccessMessage(null);
      fetchStations();
    }
  }, [isOpen, filterType]);

  if (!isOpen) return null;

  const handleOccupy = (stationId: string) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    const untilDate = new Date();
    untilDate.setHours(untilDate.getHours() + selectedDurationHours);

    startTransition(async () => {
      const res = await occupyStationAction(stationId, untilDate.toISOString());
      if (res.success) {
        setSuccessMessage("เข้าประจำการในห้องบริการสำเร็จ!");
        fetchStations();
        onStationChanged?.();
        setTimeout(() => {
          onClose();
        }, 800);
      } else {
        setErrorMessage(res.error || "ไม่สามารถเข้าประจำการได้");
      }
    });
  };

  const handleVacate = (stationId: string) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    startTransition(async () => {
      const res = await vacateStationAction(stationId);
      if (res.success) {
        setSuccessMessage("ออกจากห้องบริการเรียบร้อยแล้ว");
        fetchStations();
        onStationChanged?.();
      } else {
        setErrorMessage(res.error || "ไม่สามารถออกจากห้องบริการได้");
      }
    });
  };

  const TYPE_NAME_MAP: Record<StationType, string> = {
    DOCTOR: "ห้องตรวจแพทย์",
    TRIAGE: "ช่องซักประวัติ/คัดกรอง",
    PHARMACY: "ช่องจ่ายยา",
    CASHIER: "ช่องการเงิน",
    LAB: "ห้องปฏิบัติการแล็บ",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-3xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-chunjai-600 text-white shadow-md">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-950">
                เลือกห้อง/ช่องบริการเข้าปฏิบัติหน้าที่
              </h3>
              <p className="text-xs text-slate-500">
                {filterType ? `หมวดหมู่: ${TYPE_NAME_MAP[filterType]}` : "เลือกช่องบริการที่ว่างเพื่อเริ่มรับคิว"}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-slate-500">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {errorMessage && (
            <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 font-medium">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700 font-semibold">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Duration Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-chunjai-50/60 border border-chunjai-100 gap-2">
            <div className="flex items-center gap-2 text-xs text-chunjai-900 font-semibold">
              <Clock className="h-4 w-4 text-chunjai-600" />
              <span>กำหนดระยะเวลาเข้าประจำการรอบนี้:</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              {[2, 4, 8, 12].map((hours) => (
                <button
                  key={hours}
                  type="button"
                  onClick={() => setSelectedDurationHours(hours)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                    selectedDurationHours === hours
                      ? "bg-chunjai-600 text-white shadow-xs"
                      : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {hours} ชม.
                </button>
              ))}
            </div>
          </div>

          {/* Stations Grid */}
          {isPending && stations.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-chunjai-600" />
              <p className="text-xs">กำลังโหลดสถานะช่องบริการ...</p>
            </div>
          ) : stations.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Building2 className="mx-auto h-10 w-10 text-slate-300" />
              <p className="text-sm font-semibold text-slate-700">ไม่พบช่องบริการ</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {stations.map((st) => {
                const isOccupiedByMe = st.activeUserId === currentUserId;
                const isOccupiedByOther = st.activeUserId && !isOccupiedByMe;
                const isAvailable = !st.activeUserId;

                return (
                  <div
                    key={st.id}
                    className={`p-4 rounded-xl border transition-all flex flex-col justify-between space-y-3 ${
                      isOccupiedByMe
                        ? "bg-emerald-50/70 border-emerald-300 shadow-xs"
                        : isOccupiedByOther
                        ? "bg-slate-50/80 border-slate-200 opacity-90"
                        : "bg-white border-slate-200 hover:border-chunjai-400 hover:shadow-md"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                          <Building2 className="h-4 w-4 text-chunjai-600" />
                          {st.name}
                        </span>
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-bold ${
                            isOccupiedByMe
                              ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                              : isOccupiedByOther
                              ? "bg-rose-100 text-rose-800 border-rose-300"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200"
                          }`}
                        >
                          {isOccupiedByMe ? "คุณกำลังประจำการ" : isOccupiedByOther ? "ไม่ว่าง" : "ห้องว่าง"}
                        </Badge>
                      </div>

                      <div className="mt-2 text-xs text-slate-600 space-y-1">
                        {st.activeUser ? (
                          <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                            <UserCheck className="h-3.5 w-3.5 text-chunjai-600 shrink-0" />
                            <span>ผู้ประจำการ: {st.activeUser.fullName}</span>
                          </div>
                        ) : (
                          <p className="text-slate-400 italic">ไม่มีผู้ประจำการในขณะนี้</p>
                        )}

                        {st.occupiedUntil && (
                          <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
                            <Clock className="h-3 w-3" />
                            <span>
                              ถึงเวลา {new Date(st.occupiedUntil).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })} น.
                            </span>
                          </div>
                        )}

                        {st.isLocked && (
                          <div className="flex items-center gap-1 text-[11px] text-amber-700 font-bold">
                            <Lock className="h-3 w-3" />
                            <span>ล็อกโดยแอดมิน (ห้ามออกเอง)</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                      {isOccupiedByMe ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleVacate(st.id)}
                          disabled={isPending || st.isLocked}
                          className="text-xs text-rose-600 border-rose-200 hover:bg-rose-50 font-bold"
                        >
                          {st.isLocked ? (
                            <>
                              <Lock className="mr-1 h-3.5 w-3.5" />
                              ล็อกโดยแอดมิน
                            </>
                          ) : (
                            <>
                              <LogOut className="mr-1 h-3.5 w-3.5" />
                              ออกจากห้อง
                            </>
                          )}
                        </Button>
                      ) : isAvailable ? (
                        <Button
                          size="sm"
                          onClick={() => handleOccupy(st.id)}
                          disabled={isPending}
                          className="bg-chunjai-600 hover:bg-chunjai-700 text-white font-bold text-xs shadow-xs"
                        >
                          <ArrowRight className="mr-1.5 h-3.5 w-3.5" />
                          เข้าประจำการ ({selectedDurationHours} ชม.)
                        </Button>
                      ) : (
                        <Button size="sm" variant="ghost" disabled className="text-xs text-slate-400">
                          ไม่สามารถเลือกได้
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3 border-t border-slate-100 bg-slate-50">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            ปิดหน้าต่าง
          </Button>
        </div>
      </div>
    </div>
  );
}
