"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  Building2,
  Calendar,
  Clock,
  Lock,
  UserCheck,
  Plus,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Loader2,
  LayoutGrid,
  List,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  getStationSchedulesAction,
  deleteStationScheduleAction,
} from "@/server/actions/station";
import { StationType } from "@/generated/client";

interface RoomScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  station: any | null;
  initialDate?: string;
  onAddShiftForStation?: (stationId: string, hour?: number) => void;
}

// Timeline Constants (07:00 to 21:00 = 14 hours)
const TIMELINE_START_HOUR = 7;
const TIMELINE_END_HOUR = 21;
const TOTAL_TIMELINE_HOURS = TIMELINE_END_HOUR - TIMELINE_START_HOUR;

const ROLE_COLOR_MAP: Record<string, { bg: string; border: string; text: string }> = {
  DOCTOR: {
    bg: "bg-emerald-600",
    border: "border-emerald-700",
    text: "text-white",
  },
  NURSE: {
    bg: "bg-blue-600",
    border: "border-blue-700",
    text: "text-white",
  },
  PHARMACIST: {
    bg: "bg-indigo-600",
    border: "border-indigo-700",
    text: "text-white",
  },
  STAFF: {
    bg: "bg-amber-600",
    border: "border-amber-700",
    text: "text-white",
  },
  ADMIN: {
    bg: "bg-purple-600",
    border: "border-purple-700",
    text: "text-white",
  },
};

export function RoomScheduleModal({
  isOpen,
  onClose,
  station,
  initialDate,
  onAddShiftForStation,
}: RoomScheduleModalProps) {
  const [isPending, startTransition] = useTransition();
  const [scheduleDate, setScheduleDate] = useState<string>(
    initialDate || new Date().toISOString().split("T")[0]
  );
  const [schedules, setSchedules] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<"TIMELINE" | "LIST">("TIMELINE");
  const [deleteScheduleId, setDeleteScheduleId] = useState<string | null>(null);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Current time tracker for red vertical indicator line
  const [currentTimeMinutes, setCurrentTimeMinutes] = useState<number>(0);
  const [currentDateStr, setCurrentDateStr] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const currentMinutes = (now.getHours() - TIMELINE_START_HOUR) * 60 + now.getMinutes();
      setCurrentTimeMinutes(currentMinutes);
      setCurrentDateStr(now.toISOString().split("T")[0]);
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchRoomSchedules = () => {
    if (!station) return;
    startTransition(async () => {
      const res = await getStationSchedulesAction(station.id, scheduleDate);
      if (res.success && res.data) {
        setSchedules(res.data);
      }
    });
  };

  useEffect(() => {
    if (isOpen && station) {
      if (initialDate) setScheduleDate(initialDate);
      fetchRoomSchedules();
    }
  }, [isOpen, station, scheduleDate]);

  if (!isOpen || !station) return null;

  const changeDateByDays = (days: number) => {
    const current = new Date(scheduleDate);
    current.setDate(current.getDate() + days);
    setScheduleDate(current.toISOString().split("T")[0]);
  };

  const confirmDeleteSchedule = () => {
    if (!deleteScheduleId) return;

    setErrorMessage(null);
    setSuccessMessage(null);

    const targetId = deleteScheduleId;
    setDeleteScheduleId(null);

    startTransition(async () => {
      const res = await deleteStationScheduleAction(targetId);
      if (res.success) {
        setSuccessMessage("ลบตารางเวรสำเร็จ");
        fetchRoomSchedules();
      } else {
        setErrorMessage(res.error || "ไม่สามารถลบตารางเวรได้");
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

  const isToday = scheduleDate === currentDateStr;
  const totalTimelineMinutes = TOTAL_TIMELINE_HOURS * 60;
  const currentIndicatorPercent = (currentTimeMinutes / totalTimelineMinutes) * 100;
  const isIndicatorVisible = isToday && currentIndicatorPercent >= 0 && currentIndicatorPercent <= 100;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs animate-in fade-in">
        <div className="relative w-full max-w-4xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/90 shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-chunjai-600 text-white shadow-md">
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-950">
                    ผังตารางเวลา: {station.name}
                  </h3>
                  <Badge variant="outline" className="text-[10px] font-mono">
                    {station.code}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500">
                  หมวดหมู่: {TYPE_NAME_MAP[station.type as StationType] || station.type}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 text-slate-500"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Body Content */}
          <div className="p-6 space-y-4 overflow-y-auto flex-1">
            {/* Live Station Summary Banner */}
            <div className="p-3.5 rounded-xl bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
                <div>
                  <span className="text-slate-400 block text-[10px]">สถานะสดปัจจุบัน:</span>
                  <span className="font-bold text-white text-xs">
                    {station.activeUser
                      ? `กำลังปฏิบัติหน้าที่โดย: ${station.activeUser.fullName} (${station.activeUser.role})`
                      : "ห้องว่าง (ไม่มีผู้ประจำการ)"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {station.occupiedUntil && (
                  <div className="text-[11px] text-chunjai-300 font-mono flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-lg">
                    <Clock className="h-3 w-3" />
                    ถึง {new Date(station.occupiedUntil).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })} น.
                  </div>
                )}
                {station.isLocked && (
                  <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-[10px]">
                    <Lock className="mr-1 h-2.5 w-2.5" /> ล็อกห้อง
                  </Badge>
                )}
              </div>
            </div>

            {/* Date Selector Navigation & View Switcher Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <div className="flex items-center gap-1.5">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => changeDateByDays(-1)}
                  className="h-7 w-7 text-slate-600"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>

                <input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="h-7 rounded-lg border border-slate-200 bg-white px-2 text-xs font-mono font-bold"
                />

                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => changeDateByDays(1)}
                  className="h-7 w-7 text-slate-600"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>

                <Button
                  size="sm"
                  variant={isToday ? "default" : "ghost"}
                  onClick={() => setScheduleDate(new Date().toISOString().split("T")[0])}
                  className={`text-xs font-bold h-7 px-2.5 ${
                    isToday ? "bg-chunjai-600 text-white" : "text-chunjai-700"
                  }`}
                >
                  วันนี้
                </Button>

                <span className="text-xs text-slate-500 font-medium pl-1 hidden sm:inline">
                  ({schedules.length} กะ)
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* View Switcher */}
                <div className="flex items-center rounded-lg border border-slate-200 bg-white p-0.5">
                  <button
                    type="button"
                    onClick={() => setViewMode("TIMELINE")}
                    className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-bold transition-all ${
                      viewMode === "TIMELINE"
                        ? "bg-chunjai-50 text-chunjai-700 shadow-2xs"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    <LayoutGrid className="h-3 w-3" />
                    ผังตาราง
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("LIST")}
                    className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-bold transition-all ${
                      viewMode === "LIST"
                        ? "bg-chunjai-50 text-chunjai-700 shadow-2xs"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    <List className="h-3 w-3" />
                    รายการ
                  </button>
                </div>

                {onAddShiftForStation && (
                  <Button
                    size="sm"
                    onClick={() => {
                      onClose();
                      onAddShiftForStation(station.id, 8);
                    }}
                    className="bg-chunjai-600 hover:bg-chunjai-700 text-white text-xs font-bold h-7 px-3 shadow-xs"
                  >
                    <Plus className="mr-1 h-3.5 w-3.5" />
                    เพิ่มกะใหม่
                  </Button>
                )}
              </div>
            </div>

            {/* Alert Messages */}
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

            {/* VIEW 1: TIMELINE GRID VIEW (Same as Main Schedule Page) */}
            {viewMode === "TIMELINE" && (
              <div className="rounded-xl border border-slate-300 bg-white overflow-hidden shadow-2xs">
                {/* Timeline Header (Cell-Based Hour Boxes) */}
                <div className="flex border-b border-slate-300 bg-slate-100 text-xs font-mono font-bold text-slate-800">
                  <div className="w-36 shrink-0 px-3 py-2 border-r border-slate-300 font-sans text-slate-900 font-bold bg-slate-200/80 flex items-center justify-between">
                    <span>ห้อง</span>
                    <span className="text-[10px] text-slate-500 font-mono font-normal">ชั่วโมง</span>
                  </div>
                  <div
                    className="flex-1"
                    style={{
                      display: "grid",
                      gridTemplateColumns: `repeat(${TOTAL_TIMELINE_HOURS}, minmax(0, 1fr))`,
                    }}
                  >
                    {Array.from({ length: TOTAL_TIMELINE_HOURS }, (_, i) => TIMELINE_START_HOUR + i).map((hour) => (
                      <div
                        key={hour}
                        className="py-2 px-1 border-r border-slate-300 text-center font-mono text-[11px] font-bold text-slate-800 bg-slate-100"
                      >
                        <span>{String(hour).padStart(2, "0")}:00</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Single Station Timeline Row */}
                <div className="relative min-h-[90px] flex">
                  {/* Left info */}
                  <div className="w-36 shrink-0 p-3 border-r border-slate-300 bg-slate-50/70 flex flex-col justify-center">
                    <span className="font-bold text-xs text-slate-900 flex items-center gap-1">
                      <Building2 className="h-3.5 w-3.5 text-chunjai-600 shrink-0" />
                      {station.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {schedules.length} กะในวันนี้
                    </span>
                  </div>

                  {/* Right Timeline Grid Area with Shift Bars */}
                  <div
                    className="flex-1 relative bg-white cursor-pointer min-h-[90px]"
                    style={{
                      display: "grid",
                      gridTemplateColumns: `repeat(${TOTAL_TIMELINE_HOURS}, minmax(0, 1fr))`,
                    }}
                    onClick={() => {
                      if (onAddShiftForStation) {
                        onClose();
                        onAddShiftForStation(station.id, 8);
                      }
                    }}
                  >
                    {/* Boxed Hour Cells */}
                    {Array.from({ length: TOTAL_TIMELINE_HOURS }, (_, i) => TIMELINE_START_HOUR + i).map((hour) => (
                      <div
                        key={hour}
                        className="border-r border-slate-200 h-full hover:bg-chunjai-50/50 transition-colors relative"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onAddShiftForStation) {
                            onClose();
                            onAddShiftForStation(station.id, hour);
                          }
                        }}
                      >
                        {/* 30-min dashed middle guideline */}
                        <div className="absolute inset-y-0 left-1/2 w-px border-r border-dashed border-slate-100 pointer-events-none" />
                      </div>
                    ))}

                    {/* Render Shift Bars */}
                    {schedules.map((shift) => {
                      const start = new Date(shift.startTime);
                      const end = new Date(shift.endTime);

                      const startMins =
                        (start.getHours() - TIMELINE_START_HOUR) * 60 +
                        start.getMinutes();
                      const endMins =
                        (end.getHours() - TIMELINE_START_HOUR) * 60 +
                        end.getMinutes();
                      const totalMins = TOTAL_TIMELINE_HOURS * 60;

                      const left = Math.max(0, (startMins / totalMins) * 100);
                      const width = Math.min(
                        100 - left,
                        Math.max(2, ((endMins - startMins) / totalMins) * 100)
                      );

                      const durationHours = (
                        (end.getTime() - start.getTime()) /
                        (1000 * 60 * 60)
                      ).toFixed(1).replace(".0", "");

                      const role = shift.user?.role || "DOCTOR";
                      const style = ROLE_COLOR_MAP[role] || ROLE_COLOR_MAP.DOCTOR;

                      const startTimeStr = start.toLocaleTimeString("th-TH", {
                        hour: "2-digit",
                        minute: "2-digit",
                      });
                      const endTimeStr = end.toLocaleTimeString("th-TH", {
                        hour: "2-digit",
                        minute: "2-digit",
                      });

                      return (
                        <div
                          key={shift.id}
                          style={{ left: `${left}%`, width: `${width}%` }}
                          className={`shift-block absolute top-2 bottom-2 rounded-xl border p-2 shadow-sm transition-all hover:scale-[1.01] hover:shadow-md flex items-center justify-between z-10 ${style.bg} ${style.border} ${style.text}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="truncate pr-1">
                            <div className="flex items-center gap-1 font-bold text-xs truncate">
                              <UserCheck className="h-3.5 w-3.5 shrink-0" />
                              <span className="truncate">{shift.user?.fullName}</span>
                            </div>
                            <div className="flex items-center gap-1 text-[10px] opacity-95 font-mono font-semibold mt-0.5">
                              <Clock className="h-2.5 w-2.5 shrink-0" />
                              <span>
                                {startTimeStr} - {endTimeStr} น. ({durationHours} ชม.)
                              </span>
                              {shift.isLocked && (
                                <Lock className="h-2.5 w-2.5 shrink-0 ml-1 text-amber-200" />
                              )}
                            </div>
                          </div>

                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setDeleteScheduleId(shift.id)}
                            disabled={isPending}
                            className="h-6 w-6 text-white/80 hover:text-white hover:bg-black/20 shrink-0"
                            title="ลบตารางเวรนี้"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      );
                    })}

                    {/* Real-Time Red Indicator */}
                    {isIndicatorVisible && (
                      <div
                        style={{ left: `${currentIndicatorPercent}%` }}
                        className="absolute top-0 bottom-0 w-0.5 bg-rose-500 z-20 pointer-events-none shadow-md flex flex-col items-center"
                      >
                        <div className="bg-rose-600 text-white text-[9px] font-mono font-bold px-1 py-0.5 rounded shadow-md -translate-y-2 whitespace-nowrap animate-pulse">
                          ⏱️ ตอนนี้
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* VIEW 2: DETAILED LIST VIEW */}
            {viewMode === "LIST" && (
              <div className="space-y-2">
                {isPending && schedules.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 space-y-2">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-chunjai-600" />
                    <p className="text-xs">กำลังโหลดตารางเวลา...</p>
                  </div>
                ) : schedules.length === 0 ? (
                  <div className="p-8 text-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-slate-400 space-y-2">
                    <Calendar className="mx-auto h-7 w-7 text-slate-300" />
                    <p className="text-xs font-semibold text-slate-700">ไม่มีตารางเวรสำหรับห้องนี้ในวันที่เลือก</p>
                    <p className="text-[11px] text-slate-400">คลิกปุ่ม &quot;เพิ่มกะใหม่&quot; เพื่อจัดตารางเวลาล่วงหน้า</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
                    {schedules.map((sc) => {
                      const start = new Date(sc.startTime);
                      const end = new Date(sc.endTime);
                      const startTimeStr = start.toLocaleTimeString("th-TH", {
                        hour: "2-digit",
                        minute: "2-digit",
                      });
                      const endTimeStr = end.toLocaleTimeString("th-TH", {
                        hour: "2-digit",
                        minute: "2-digit",
                      });
                      const durationHours = (
                        (end.getTime() - start.getTime()) /
                        (1000 * 60 * 60)
                      ).toFixed(1).replace(".0", "");

                      return (
                        <div
                          key={sc.id}
                          className="p-3 flex items-center justify-between hover:bg-slate-50 transition-colors text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-chunjai-50 text-chunjai-700 font-bold border border-chunjai-200 font-mono text-[11px]">
                              {startTimeStr}
                            </div>

                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2 font-bold text-slate-900">
                                <UserCheck className="h-3.5 w-3.5 text-chunjai-600" />
                                <span>{sc.user?.fullName}</span>
                                <Badge variant="outline" className="text-[10px] font-normal py-0">
                                  {sc.user?.role}
                                </Badge>
                              </div>

                              <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                                <Clock className="h-3 w-3 text-slate-400" />
                                <span>
                                  {startTimeStr} - {endTimeStr} น. ({durationHours} ชม.)
                                </span>
                                {sc.isLocked && (
                                  <span className="text-amber-700 font-bold flex items-center gap-0.5">
                                    <Lock className="h-2.5 w-2.5" /> ล็อกห้อง
                                  </span>
                                )}
                                {sc.notes && (
                                  <span className="text-slate-400 italic font-sans">
                                    • {sc.notes}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setDeleteScheduleId(sc.id)}
                            disabled={isPending}
                            className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                            title="ลบตารางเวรนี้"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end px-6 py-3 border-t border-slate-100 bg-slate-50 shrink-0">
            <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
              ปิดหน้าต่าง
            </Button>
          </div>
        </div>
      </div>

      {/* Confirm Delete Schedule Dialog */}
      <ConfirmDialog
        isOpen={!!deleteScheduleId}
        onClose={() => setDeleteScheduleId(null)}
        onConfirm={confirmDeleteSchedule}
        title="ยืนยันการลบตารางเวร"
        description="คุณต้องการลบตารางเวรปฏิบัติหน้าที่ของห้องนี้ใช่หรือไม่?"
        confirmText="ลบตารางเวร"
        cancelText="ยกเลิก"
        variant="danger"
        isLoading={isPending}
      />
    </>
  );
}
