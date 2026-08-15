"use client";

import React, { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  Lock,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Sparkles,
  Building2,
  ChevronLeft,
  ChevronRight,
  Filter,
  UserCheck,
  LayoutGrid,
  List,
  User,
  Info,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  getServiceStationsAction,
  createStationScheduleAction,
  getStationSchedulesAction,
  deleteStationScheduleAction,
  syncStationAutoShiftsAction,
} from "@/server/actions/station";
import { getUsersAction } from "@/server/actions/user-management";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { RoomScheduleModal } from "@/components/stations/RoomScheduleModal";
import { StationType } from "@/generated/client";

// Timeline Constants (07:00 to 21:00 = 14 hours)
const TIMELINE_START_HOUR = 7;
const TIMELINE_END_HOUR = 21;
const TOTAL_TIMELINE_HOURS = TIMELINE_END_HOUR - TIMELINE_START_HOUR;

export default function DutyShiftSchedulePage() {
  const [isPending, startTransition] = useTransition();

  const [stations, setStations] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<"TIMELINE" | "LIST">("TIMELINE");

  // Room Schedule Modal for specific room
  const [roomScheduleModalStation, setRoomScheduleModalStation] = useState<any | null>(null);

  // Delete Confirm Dialog State
  const [deleteDialogScheduleId, setDeleteDialogScheduleId] = useState<string | null>(null);

  // Current time tracker for red vertical indicator line
  const [currentTimeMinutes, setCurrentTimeMinutes] = useState<number>(0);
  const [currentDateStr, setCurrentDateStr] = useState<string>("");

  // Shift Form / Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedStationId, setSelectedStationId] = useState<string>("");
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [scheduleDate, setScheduleDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [startTimeStr, setStartTimeStr] = useState<string>("08:00");
  const [endTimeStr, setEndTimeStr] = useState<string>("12:00");
  const [isShiftLocked, setIsShiftLocked] = useState<boolean>(true);
  const [shiftNotes, setShiftNotes] = useState<string>("");

  const [filterStationType, setFilterStationType] = useState<string>("ALL");

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchData = () => {
    startTransition(async () => {
      const [stRes, scRes, uRes] = await Promise.all([
        getServiceStationsAction(),
        getStationSchedulesAction(undefined, scheduleDate),
        getUsersAction(),
      ]);

      if (stRes.success && stRes.data) setStations(stRes.data);
      if (scRes.success && scRes.data) setSchedules(scRes.data);
      if (uRes.success && uRes.data) setUsers(uRes.data);
    });
  };

  useEffect(() => {
    fetchData();
  }, [scheduleDate]);

  useEffect(() => {
    if (stations.length > 0 && !selectedStationId) {
      setSelectedStationId(stations[0].id);
    }
  }, [stations]);

  // Update current time indicator every 30 seconds
  useEffect(() => {
    const updateNow = () => {
      const now = new Date();
      setCurrentDateStr(now.toISOString().split("T")[0]);
      const mins = (now.getHours() - TIMELINE_START_HOUR) * 60 + now.getMinutes();
      setCurrentTimeMinutes(mins);
    };
    updateNow();
    const timer = setInterval(updateNow, 30000);
    return () => clearInterval(timer);
  }, []);

  const handleCreateSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!selectedStationId || !selectedUserId) {
      setErrorMessage("กรุณาเลือกช่องบริการและบุคลากร");
      return;
    }

    const startDateTime = `${scheduleDate}T${startTimeStr}:00`;
    const endDateTime = `${scheduleDate}T${endTimeStr}:00`;

    startTransition(async () => {
      const res = await createStationScheduleAction({
        serviceStationId: selectedStationId,
        userId: selectedUserId,
        startTime: startDateTime,
        endTime: endDateTime,
        isLocked: isShiftLocked,
        notes: shiftNotes,
      });

      if (res.success) {
        setSuccessMessage("บันทึกตารางเวรปฏิบัติหน้าที่สำเร็จ!");
        setShiftNotes("");
        setIsAddModalOpen(false);
        fetchData();
      } else {
        setErrorMessage(res.error || "ไม่สามารถสร้างตารางเวรได้");
      }
    });
  };

  const handleDeleteClick = (scheduleId: string) => {
    setDeleteDialogScheduleId(scheduleId);
  };

  const confirmDeleteSchedule = () => {
    if (!deleteDialogScheduleId) return;

    setErrorMessage(null);
    setSuccessMessage(null);

    const targetId = deleteDialogScheduleId;
    setDeleteDialogScheduleId(null);

    startTransition(async () => {
      const res = await deleteStationScheduleAction(targetId);
      if (res.success) {
        setSuccessMessage("ลบตารางเวรสำเร็จ");
        fetchData();
      } else {
        setErrorMessage(res.error || "ไม่สามารถลบตารางเวรได้");
      }
    });
  };

  const handleTriggerSync = () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    startTransition(async () => {
      const res = await syncStationAutoShiftsAction();
      if (res.success) {
        setSuccessMessage("ซิงก์สถานะผลัดกะอัตโนมัติสำเร็จ!");
        fetchData();
      } else {
        setErrorMessage(res.error || "ซิงก์ไม่สำเร็จ");
      }
    });
  };

  const changeDateByDays = (days: number) => {
    const current = new Date(scheduleDate);
    current.setDate(current.getDate() + days);
    setScheduleDate(current.toISOString().split("T")[0]);
  };

  // Quick Open Modal with prefilled station & time
  const handleQuickAddShift = (stationId: string, hour?: number) => {
    setSelectedStationId(stationId);
    if (hour !== undefined) {
      const sHour = String(hour).padStart(2, "0");
      const eHour = String(Math.min(hour + 4, 21)).padStart(2, "0");
      setStartTimeStr(`${sHour}:00`);
      setEndTimeStr(`${eHour}:00`);
    }
    setIsAddModalOpen(true);
  };

  const filteredStations = stations.filter((st) => {
    if (filterStationType === "ALL") return true;
    return st.type === filterStationType;
  });

  // Calculate timeline hours array: [7, 8, 9, ..., 21]
  const timelineHours = Array.from(
    { length: TOTAL_TIMELINE_HOURS + 1 },
    (_, i) => TIMELINE_START_HOUR + i
  );

  const isToday = scheduleDate === currentDateStr;
  const currentIndicatorPercent = Math.max(
    0,
    Math.min(100, (currentTimeMinutes / (TOTAL_TIMELINE_HOURS * 60)) * 100)
  );
  const isIndicatorVisible =
    isToday && currentTimeMinutes >= 0 && currentTimeMinutes <= TOTAL_TIMELINE_HOURS * 60;

  const ROLE_COLOR_MAP: Record<string, { bg: string; border: string; text: string }> = {
    DOCTOR: { bg: "bg-emerald-600", border: "border-emerald-700", text: "text-white" },
    NURSE: { bg: "bg-blue-600", border: "border-blue-700", text: "text-white" },
    PHARMACIST: { bg: "bg-indigo-600", border: "border-indigo-700", text: "text-white" },
    RECEPTIONIST: { bg: "bg-amber-600", border: "border-amber-700", text: "text-white" },
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-chunjai-600 text-white shadow-md">
              <Calendar className="h-5 w-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-chunjai-950">
              ตารางเวรปฏิบัติหน้าที่ (Visual Duty Shift Schedule)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            แผนผังไทม์ไลน์แสดงกะเวลาของแต่ละห้องตรวจและบุคลากร พร้อมเส้นบอกเวลาปัจจุบันแบบ Real-time
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/settings/stations">
            <Button
              variant="outline"
              size="sm"
              className="text-xs font-semibold border-chunjai-300 text-chunjai-800 hover:bg-chunjai-50 shadow-xs"
            >
              <Building2 className="mr-1.5 h-3.5 w-3.5 text-chunjai-600" />
              จัดการช่องบริการ
            </Button>
          </Link>

          <Button
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            className="bg-chunjai-600 hover:bg-chunjai-700 text-white text-xs font-bold shadow-xs"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            เพิ่มตารางเวร
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleTriggerSync}
            disabled={isPending}
            className="text-xs font-semibold border-chunjai-200 text-chunjai-800 hover:bg-chunjai-50"
            title="ซิงก์ผลัดกะตามเวลาจริง"
          >
            <Sparkles className="mr-1.5 h-3.5 w-3.5 text-chunjai-600" />
            ซิงก์ผลัดกะ
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            className="text-xs font-semibold"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isPending ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Messages */}
      {errorMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700 font-medium shadow-xs">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
      {successMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-700 font-semibold shadow-xs">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Date Bar & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        {/* Date Controls */}
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="outline"
            onClick={() => changeDateByDays(-1)}
            className="h-8 w-8 text-slate-600"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <input
            type="date"
            value={scheduleDate}
            onChange={(e) => setScheduleDate(e.target.value)}
            className="h-8 rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:bg-white"
          />

          <Button
            size="icon"
            variant="outline"
            onClick={() => changeDateByDays(1)}
            className="h-8 w-8 text-slate-600"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          <Button
            size="sm"
            variant={isToday ? "default" : "outline"}
            onClick={() => setScheduleDate(new Date().toISOString().split("T")[0])}
            className={`text-xs font-bold h-8 px-3 ${
              isToday ? "bg-chunjai-600 text-white" : "text-slate-700"
            }`}
          >
            วันนี้
          </Button>

          <span className="text-xs text-slate-500 font-medium pl-2 hidden md:inline">
            {new Date(scheduleDate).toLocaleDateString("th-TH", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>

        {/* Filter & View Switcher */}
        <div className="flex items-center gap-2">
          {/* Station Filter */}
          <select
            value={filterStationType}
            onChange={(e) => setFilterStationType(e.target.value)}
            className="h-8 rounded-lg border border-slate-200 bg-slate-50 px-2 text-xs font-semibold text-slate-700 focus:outline-none"
          >
            <option value="ALL">ทุกหมวดหมู่ ({stations.length} ห้อง)</option>
            <option value={StationType.DOCTOR}>ห้องตรวจแพทย์</option>
            <option value={StationType.TRIAGE}>จุดซักประวัติ</option>
            <option value={StationType.PHARMACY}>ห้องจ่ายยา</option>
            <option value={StationType.CASHIER}>การเงิน</option>
            <option value={StationType.LAB}>ห้องแล็บ</option>
          </select>

          {/* Switch View Buttons */}
          <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5">
            <button
              type="button"
              onClick={() => setViewMode("TIMELINE")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                viewMode === "TIMELINE"
                  ? "bg-white text-chunjai-700 shadow-xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              ผังไทม์ไลน์
            </button>
            <button
              type="button"
              onClick={() => setViewMode("LIST")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                viewMode === "LIST"
                  ? "bg-white text-chunjai-700 shadow-xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <List className="h-3.5 w-3.5" />
              ตารางรายการ ({schedules.length})
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 1: Visual Timeline Grid (Gantt Chart with Real-time Indicator Line) */}
      {viewMode === "TIMELINE" && (
        <Card className="border-slate-200 overflow-hidden shadow-xs">
          <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Clock className="h-4 w-4 text-chunjai-600" />
                แผนผังตารางเวลาประจำห้องตรวจ (07:00 - 21:00 น.)
              </CardTitle>
              <CardDescription className="text-xs">
                คลิกที่ช่องว่างของแต่ละห้องเพื่อเพิ่มกะเวลา หรือคลิกที่แถบชื่อเพื่อดูรายละเอียด/ลบเวร
              </CardDescription>
            </div>

            {/* Role Legend */}
            <div className="hidden lg:flex items-center gap-3 text-[11px] font-semibold">
              <span className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" /> แพทย์
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-600" /> พยาบาล
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-full bg-indigo-600" /> เภสัชกร
              </span>
              <span className="flex items-center gap-1 text-rose-600 font-bold">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500 animate-ping" /> เส้นเวลาปัจจุบัน
              </span>
            </div>
          </CardHeader>

          <CardContent className="p-0 overflow-x-auto">
            <div className="min-w-[900px] select-none">
              {/* Timeline Header (Cell-Based Hour Boxes) */}
              <div className="flex border-b border-slate-300 bg-slate-100/90 text-xs font-mono font-bold text-slate-800">
                <div className="w-56 shrink-0 px-3 py-2.5 border-r border-slate-300 font-sans text-slate-900 font-bold bg-slate-200/80 flex items-center justify-between">
                  <span>ห้อง / ช่องบริการ</span>
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
                      className="py-2 px-1 border-r border-slate-300 text-center font-mono text-[11px] font-bold text-slate-800 bg-slate-100 hover:bg-slate-200/60 transition-colors"
                    >
                      <span>{String(hour).padStart(2, "0")}:00</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Timeline Rows for each Service Station */}
              <div className="divide-y divide-slate-200 relative">
                {filteredStations.map((station) => {
                  // Get shifts for this station
                  const stationShifts = schedules.filter(
                    (s) => s.serviceStationId === station.id
                  );

                  return (
                    <div
                      key={station.id}
                      className="flex hover:bg-slate-50/50 transition-colors group relative min-h-[64px]"
                    >
                      {/* Left: Station Info (Clickable to open Room Schedule Modal) */}
                      <div
                        onClick={() => setRoomScheduleModalStation(station)}
                        className="w-56 shrink-0 p-3 border-r border-slate-300 bg-slate-50/70 hover:bg-chunjai-50/80 cursor-pointer transition-colors flex flex-col justify-center group/station"
                        title="คลิกเพื่อดูตารางเวลาประจำห้องนี้"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-900 group-hover/station:text-chunjai-700 flex items-center gap-1.5 transition-colors">
                            <Building2 className="h-3.5 w-3.5 text-chunjai-600 shrink-0" />
                            {station.name}
                          </span>
                          <Calendar className="h-3 w-3 text-slate-400 group-hover/station:text-chunjai-600 transition-colors" />
                        </div>
                        <div className="flex items-center justify-between mt-0.5 text-[10px]">
                          <span className="text-slate-400 font-mono">
                            {station.code} • {stationShifts.length} กะ
                          </span>
                          <span className="text-chunjai-600 font-semibold opacity-0 group-hover/station:opacity-100 transition-opacity">
                            ดูตารางห้อง &rarr;
                          </span>
                        </div>
                      </div>

                      {/* Right: Timeline Grid Cells with Shift Bars */}
                      <div
                        className="flex-1 relative bg-white cursor-pointer min-h-[64px]"
                        style={{
                          display: "grid",
                          gridTemplateColumns: `repeat(${TOTAL_TIMELINE_HOURS}, minmax(0, 1fr))`,
                        }}
                        onClick={(e) => {
                          // Allow quick click to add shift
                          if ((e.target as HTMLElement).closest(".shift-block")) return;
                          handleQuickAddShift(station.id, 8);
                        }}
                      >
                        {/* Boxed Hour Cells */}
                        {Array.from({ length: TOTAL_TIMELINE_HOURS }, (_, i) => TIMELINE_START_HOUR + i).map((hour) => (
                          <div
                            key={hour}
                            className="border-r border-slate-200 h-full hover:bg-chunjai-50/50 transition-colors relative"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuickAddShift(station.id, hour);
                            }}
                          >
                            {/* Subtle 30-min dashed middle guideline inside each hour cell */}
                            <div className="absolute inset-y-0 left-1/2 w-px border-r border-dashed border-slate-100 pointer-events-none" />
                          </div>
                        ))}

                        {/* Render Shift Bars */}
                        {stationShifts.map((shift) => {
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
                              className={`shift-block absolute top-1.5 bottom-1.5 rounded-lg border p-1.5 shadow-sm transition-all hover:scale-[1.01] hover:shadow-md flex items-center justify-between z-10 ${style.bg} ${style.border} ${style.text}`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="truncate pr-1">
                                <div className="flex items-center gap-1 font-bold text-xs truncate">
                                  <UserCheck className="h-3 w-3 shrink-0" />
                                  <span className="truncate">{shift.user?.fullName}</span>
                                </div>
                                <div className="flex items-center gap-1 text-[10px] opacity-95 font-mono font-semibold">
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
                                onClick={() => handleDeleteClick(shift.id)}
                                disabled={isPending}
                                className="h-6 w-6 text-white/80 hover:text-white hover:bg-black/20 shrink-0"
                                title="ลบตารางเวรนี้"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {/* Real-Time Red Vertical Indicator Line */}
                {isIndicatorVisible && (
                  <div
                    style={{ left: `calc(14rem + (100% - 14rem) * ${currentIndicatorPercent / 100})` }}
                    className="absolute top-0 bottom-0 w-0.5 bg-rose-500 z-20 pointer-events-none shadow-md flex flex-col items-center"
                  >
                    <div className="bg-rose-600 text-white text-[9px] font-mono font-bold px-1.5 py-0.5 rounded shadow-md -translate-y-2 whitespace-nowrap animate-pulse">
                      ⏱️ เวลาปัจจุบัน
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* VIEW 2: Detailed List View */}
      {viewMode === "LIST" && (
        <Card className="border-slate-200">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-sm font-bold text-slate-900">
              รายการตารางเวรทั้งหมด ({schedules.length} รายการ)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            {schedules.length === 0 ? (
              <div className="p-12 text-center text-slate-400 space-y-2">
                <Calendar className="mx-auto h-8 w-8 text-slate-300" />
                <p className="text-xs font-semibold text-slate-700">ไม่มีตารางเวรในวันที่เลือก</p>
                <Button
                  size="sm"
                  onClick={() => setIsAddModalOpen(true)}
                  className="bg-chunjai-600 text-white text-xs font-bold mt-2"
                >
                  <Plus className="mr-1 h-3.5 w-3.5" />
                  เพิ่มตารางเวรแรก
                </Button>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-3">ช่วงเวลา</th>
                    <th className="px-4 py-3">ห้อง/ช่องบริการ</th>
                    <th className="px-4 py-3">ผู้ปฏิบัติงาน</th>
                    <th className="px-4 py-3">สถานะล็อก</th>
                    <th className="px-4 py-3">บันทึกเพิ่มเติม</th>
                    <th className="px-4 py-3 text-right">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {schedules.map((sc) => {
                    const startTime = new Date(sc.startTime).toLocaleTimeString("th-TH", {
                      hour: "2-digit",
                      minute: "2-digit",
                    });
                    const endTime = new Date(sc.endTime).toLocaleTimeString("th-TH", {
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                    return (
                      <tr key={sc.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3.5 font-mono font-bold text-chunjai-700">
                          {startTime} - {endTime} น.
                        </td>
                        <td className="px-4 py-3.5 font-bold text-slate-900">
                          {sc.serviceStation?.name}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="font-semibold text-slate-800 block">
                            {sc.user?.fullName}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {sc.user?.role}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          {sc.isLocked ? (
                            <Badge className="bg-amber-100 text-amber-900 border-amber-300 text-[10px]">
                              <Lock className="mr-1 h-2.5 w-2.5" /> ล็อกห้อง
                            </Badge>
                          ) : (
                            <span className="text-slate-400 text-[11px]">ไม่ล็อก</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-slate-500">
                          {sc.notes || "-"}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(sc.id)}
                            disabled={isPending}
                            className="h-7 w-7 text-rose-500 hover:bg-rose-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Add Shift Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-950 flex items-center gap-2">
                <Plus className="h-5 w-5 text-chunjai-600" />
                เพิ่มตารางเวรปฏิบัติหน้าที่
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsAddModalOpen(false)}
                className="h-8 w-8 text-slate-500"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleCreateSchedule} className="space-y-3.5 text-xs">
              {/* Station Selection */}
              <div className="space-y-1">
                <label className="font-bold text-slate-800 block">
                  เลือกช่อง/ห้องบริการ <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedStationId}
                  onChange={(e) => setSelectedStationId(e.target.value)}
                  required
                  className="w-full h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold focus:border-chunjai-500 focus:outline-none"
                >
                  {stations.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name} ({st.type})
                    </option>
                  ))}
                </select>
              </div>

              {/* Staff Selection */}
              <div className="space-y-1">
                <label className="font-bold text-slate-800 block">
                  เลือกบุคลากรที่เข้าเวร <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  required
                  className="w-full h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold focus:border-chunjai-500 focus:outline-none"
                >
                  <option value="">-- เลือกแพทย์/พยาบาล/เจ้าหน้าที่ --</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.fullName} ({u.role})
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div className="space-y-1">
                <label className="font-bold text-slate-800 block">
                  วันที่เข้าปฏิบัติหน้าที่ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  required
                  className="w-full h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-mono font-semibold focus:border-chunjai-500 focus:outline-none"
                />
              </div>

              {/* Start & End Time */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-800 block">
                    เวลาเริ่มกะ <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={startTimeStr}
                    onChange={(e) => setStartTimeStr(e.target.value)}
                    required
                    className="w-full h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-mono font-bold focus:border-chunjai-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-800 block">
                    เวลาสิ้นสุดกะ <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={endTimeStr}
                    onChange={(e) => setEndTimeStr(e.target.value)}
                    required
                    className="w-full h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-mono font-bold focus:border-chunjai-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Quick Presets */}
              <div className="flex items-center gap-1.5 pt-1">
                <span className="text-[11px] text-slate-500">กะแนะนำ:</span>
                {[
                  { label: "เช้า (08-12)", s: "08:00", e: "12:00" },
                  { label: "บ่าย (12-16)", s: "12:00", e: "16:00" },
                  { label: "เย็น (16-20)", s: "16:00", e: "20:00" },
                ].map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setStartTimeStr(p.s);
                      setEndTimeStr(p.e);
                    }}
                    className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-[10px] font-bold text-slate-700"
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Lock Option */}
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-50/70 border border-amber-200">
                <input
                  type="checkbox"
                  id="modalLockCheck"
                  checked={isShiftLocked}
                  onChange={(e) => setIsShiftLocked(e.target.checked)}
                  className="h-4 w-4 rounded border-amber-300 text-chunjai-600 focus:ring-chunjai-500"
                />
                <label htmlFor="modalLockCheck" className="text-xs text-amber-900 font-semibold cursor-pointer">
                  🔒 ล็อกห้องตลอดเวลากะ (ไม่อนุญาตให้ออกก่อนเวลา)
                </label>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="font-bold text-slate-800 block">หมายเหตุตารางเวร</label>
                <input
                  type="text"
                  value={shiftNotes}
                  onChange={(e) => setShiftNotes(e.target.value)}
                  placeholder="เช่น เวรประจำ, แทน นพ.สมชาย"
                  className="w-full h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-xs focus:border-chunjai-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  ยกเลิก
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="bg-chunjai-600 hover:bg-chunjai-700 text-white font-bold"
                >
                  บันทึกตารางเวร
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deleteDialogScheduleId}
        onClose={() => setDeleteDialogScheduleId(null)}
        onConfirm={confirmDeleteSchedule}
        title="ยืนยันการลบตารางเวร"
        description="คุณต้องการลบตารางเวรปฏิบัติหน้าที่นี้ออกจากระบบใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้"
        confirmText="ลบตารางเวร"
        cancelText="ยกเลิก"
        variant="danger"
        isLoading={isPending}
      />

      {/* Room Schedule Modal */}
      <RoomScheduleModal
        isOpen={!!roomScheduleModalStation}
        onClose={() => setRoomScheduleModalStation(null)}
        station={roomScheduleModalStation}
        initialDate={scheduleDate}
        onAddShiftForStation={(stId, hour) => {
          handleQuickAddShift(stId, hour || 8);
        }}
      />
    </div>
  );
}
