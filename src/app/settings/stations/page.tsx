"use client";

import React, { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import {
  Building2,
  Calendar,
  Clock,
  Lock,
  Unlock,
  Plus,
  Trash2,
  Edit2,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  LogOut,
  UserPlus,
  ArrowRight,
  Filter,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  getServiceStationsAction,
  adminSetStationLockAction,
  adminAssignStationAction,
  createServiceStationAction,
  updateServiceStationAction,
  deleteServiceStationAction,
} from "@/server/actions/station";
import { getUsersAction } from "@/server/actions/user-management";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { RoomScheduleModal } from "@/components/stations/RoomScheduleModal";
import { StationType } from "@/generated/client";

export default function StationManagementPage() {
  const [isPending, startTransition] = useTransition();

  const [stations, setStations] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<string>("ALL");

  // Room Schedule Modal State
  const [roomScheduleModalStation, setRoomScheduleModalStation] = useState<any | null>(null);

  // Delete Confirm Dialog State
  const [deleteDialogStation, setDeleteDialogStation] = useState<{ id: string; name: string } | null>(null);

  // Create Station Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [newName, setNewName] = useState("");
  const [newStationNumber, setNewStationNumber] = useState<number>(1);
  const [newType, setNewType] = useState<StationType>(StationType.DOCTOR);

  // Edit Station Modal State
  const [editingStation, setEditingStation] = useState<any | null>(null);
  const [editCode, setEditCode] = useState("");
  const [editName, setEditName] = useState("");
  const [editStationNumber, setEditStationNumber] = useState<number>(1);
  const [editType, setEditType] = useState<StationType>(StationType.DOCTOR);
  const [editIsActive, setEditIsActive] = useState<boolean>(true);

  // Direct Assign Modal State
  const [assignModalStation, setAssignModalStation] = useState<any | null>(null);
  const [assignUserId, setAssignUserId] = useState<string>("");
  const [assignDurationHours, setAssignDurationHours] = useState<number>(4);
  const [assignIsLocked, setAssignIsLocked] = useState<boolean>(true);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchData = () => {
    startTransition(async () => {
      const [stRes, uRes] = await Promise.all([
        getServiceStationsAction(),
        getUsersAction(),
      ]);

      if (stRes.success && stRes.data) setStations(stRes.data);
      if (uRes.success && uRes.data) setUsers(uRes.data);
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenEditModal = (station: any) => {
    setEditingStation(station);
    setEditCode(station.code);
    setEditName(station.name);
    setEditStationNumber(station.stationNumber || 1);
    setEditType(station.type);
    setEditIsActive(station.isActive ?? true);
  };

  const handleUpdateStation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStation || !editCode || !editName) return;

    setErrorMessage(null);
    setSuccessMessage(null);

    startTransition(async () => {
      const res = await updateServiceStationAction(editingStation.id, {
        code: editCode,
        name: editName,
        stationNumber: editStationNumber,
        type: editType,
        isActive: editIsActive,
      });

      if (res.success) {
        setSuccessMessage(`บันทึกการแก้ไขช่องบริการ "${editName}" สำเร็จ!`);
        setEditingStation(null);
        fetchData();
      } else {
        setErrorMessage(res.error || "ไม่สามารถแก้ไขช่องบริการได้");
      }
    });
  };

  const handleToggleLock = (stationId: string, currentLocked: boolean) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    startTransition(async () => {
      const res = await adminSetStationLockAction(stationId, !currentLocked);
      if (res.success) {
        setSuccessMessage(
          !currentLocked ? "ล็อกห้องบริการเรียบร้อยแล้ว" : "ปลดล็อกห้องบริการเรียบร้อยแล้ว"
        );
        fetchData();
      } else {
        setErrorMessage(res.error || "ไม่สามารถเปลี่ยนสถานะล็อกได้");
      }
    });
  };

  const handleForceVacate = (stationId: string) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    startTransition(async () => {
      const res = await adminAssignStationAction(stationId, null);
      if (res.success) {
        setSuccessMessage("บังคับปล่อยห้องบริการว่างเรียบร้อยแล้ว");
        fetchData();
      } else {
        setErrorMessage(res.error || "ไม่สามารถปล่อยห้องได้");
      }
    });
  };

  const handleCreateStation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode || !newName) return;

    setErrorMessage(null);
    setSuccessMessage(null);

    startTransition(async () => {
      const res = await createServiceStationAction({
        code: newCode,
        name: newName,
        stationNumber: newStationNumber,
        type: newType,
      });

      if (res.success) {
        setSuccessMessage(`เพิ่มช่องบริการ "${newName}" สำเร็จ!`);
        setIsCreateModalOpen(false);
        setNewCode("");
        setNewName("");
        fetchData();
      } else {
        setErrorMessage(res.error || "ไม่สามารถสร้างช่องบริการได้");
      }
    });
  };

  const handleDeleteStationClick = (stationId: string, name: string) => {
    setDeleteDialogStation({ id: stationId, name });
  };

  const confirmDeleteStation = () => {
    if (!deleteDialogStation) return;

    setErrorMessage(null);
    setSuccessMessage(null);

    const { id, name } = deleteDialogStation;
    setDeleteDialogStation(null);

    startTransition(async () => {
      const res = await deleteServiceStationAction(id);
      if (res.success) {
        setSuccessMessage(`ลบช่องบริการ "${name}" เรียบร้อยแล้ว`);
        fetchData();
      } else {
        setErrorMessage(res.error || "ไม่สามารถลบช่องบริการได้");
      }
    });
  };

  const handleDirectAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignModalStation || !assignUserId) return;

    setErrorMessage(null);
    setSuccessMessage(null);

    const untilDate = new Date();
    untilDate.setHours(untilDate.getHours() + assignDurationHours);

    startTransition(async () => {
      const res = await adminAssignStationAction(
        assignModalStation.id,
        assignUserId,
        untilDate.toISOString(),
        assignIsLocked
      );

      if (res.success) {
        setSuccessMessage(
          `มอบหมายบุคลากรเข้าประจำการใน ${assignModalStation.name} สำเร็จ!`
        );
        setAssignModalStation(null);
        fetchData();
      } else {
        setErrorMessage(res.error || "ไม่สามารถมอบหมายได้");
      }
    });
  };

  const filteredStations = stations.filter((st) => {
    if (activeTab === "ALL") return true;
    return st.type === activeTab;
  });

  const TYPE_NAME_MAP: Record<StationType, string> = {
    DOCTOR: "ห้องตรวจแพทย์",
    TRIAGE: "ช่องซักประวัติ/คัดกรอง",
    PHARMACY: "ช่องจ่ายยา",
    CASHIER: "ช่องการเงิน",
    LAB: "ห้องปฏิบัติการแล็บ",
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-chunjai-600 text-white shadow-md">
              <Building2 className="h-5 w-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-chunjai-950">
              ศูนย์จัดการช่องบริการและห้องตรวจ (Service Station Hub)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            กำหนดห้องตรวจ/ช่องบริการ ตรวจสอบสถานะการเข้าประจำการสด ควบคุมการล็อกห้อง และมอบหมายบุคลากร
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/settings/schedules">
            <Button
              variant="outline"
              size="sm"
              className="text-xs font-semibold border-chunjai-300 text-chunjai-800 hover:bg-chunjai-50 shadow-xs"
            >
              <Calendar className="mr-1.5 h-3.5 w-3.5 text-chunjai-600" />
              ไปยังหน้าจัดการตารางเวร
            </Button>
          </Link>

          <Button
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-chunjai-600 hover:bg-chunjai-700 text-white text-xs font-bold shadow-xs"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            เพิ่มช่องบริการใหม่
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

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200 pb-2">
        {[
          { id: "ALL", label: "ทั้งหมด" },
          { id: StationType.DOCTOR, label: "ห้องตรวจแพทย์" },
          { id: StationType.TRIAGE, label: "จุดซักประวัติ" },
          { id: StationType.PHARMACY, label: "ห้องจ่ายยา" },
          { id: StationType.CASHIER, label: "การเงิน" },
          { id: StationType.LAB, label: "ห้องแล็บ" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === tab.id
                ? "bg-chunjai-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Live Stations Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredStations.map((st) => {
          const isOccupied = !!st.activeUserId;

          return (
            <Card
              key={st.id}
              onClick={() => setRoomScheduleModalStation(st)}
              className={`transition-all border cursor-pointer hover:shadow-lg hover:border-chunjai-400 group/card relative ${
                isOccupied
                  ? "bg-white border-chunjai-300 shadow-sm"
                  : "bg-slate-50/70 border-slate-200"
              }`}
            >
              <CardHeader className="pb-2 flex flex-row items-center justify-between border-b border-slate-100">
                <div>
                  <CardTitle className="text-sm font-bold text-slate-900 group-hover/card:text-chunjai-700 flex items-center gap-1.5 transition-colors">
                    <Building2 className="h-4 w-4 text-chunjai-600" />
                    {st.name}
                  </CardTitle>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                    {st.code} • {TYPE_NAME_MAP[st.type as StationType] || st.type}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={`text-[10px] font-bold ${
                    isOccupied
                      ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                      : "bg-slate-100 text-slate-500 border-slate-200"
                  }`}
                >
                  {isOccupied ? "กำลังปฏิบัติงาน" : "ห้องว่าง"}
                </Badge>
              </CardHeader>

              <CardContent className="p-4 space-y-3 text-xs">
                <div className="space-y-1">
                  {st.activeUser ? (
                    <div className="flex items-center gap-1.5 font-bold text-slate-900">
                      <UserCheck className="h-4 w-4 text-chunjai-600" />
                      <span>{st.activeUser.fullName}</span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        ({st.activeUser.role})
                      </span>
                    </div>
                  ) : (
                    <p className="text-slate-400 italic">ไม่มีผู้ประจำการในขณะนี้</p>
                  )}

                  {st.occupiedUntil && (
                    <p className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      ถึง {new Date(st.occupiedUntil).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })} น.
                    </p>
                  )}

                  <div className="flex items-center gap-1 text-[11px]">
                    {st.isLocked ? (
                      <span className="text-rose-600 font-bold flex items-center gap-1">
                        <Lock className="h-3 w-3" /> ล็อกห้อง (ห้ามผู้ใช้ออกเอง)
                      </span>
                    ) : (
                      <span className="text-slate-400 flex items-center gap-1">
                        <Unlock className="h-3 w-3" /> ปลดล็อก (ออกได้อิสระ)
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-chunjai-600 font-semibold pt-1">
                  <span className="flex items-center gap-1 opacity-80 group-hover/card:opacity-100">
                    <Calendar className="h-3.5 w-3.5" /> คลิกการ์ดเพื่อดูตารางเวร &rarr;
                  </span>
                </div>

                {/* Admin Quick Action Controls */}
                <div
                  className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1 text-xs"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggleLock(st.id, st.isLocked)}
                    disabled={isPending}
                    className="text-[11px] h-7 px-2 font-semibold"
                  >
                    {st.isLocked ? (
                      <>
                        <Unlock className="mr-1 h-3 w-3 text-emerald-600" />
                        ปลดล็อก
                      </>
                    ) : (
                      <>
                        <Lock className="mr-1 h-3 w-3 text-amber-600" />
                        ล็อกห้อง
                      </>
                    )}
                  </Button>

                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setAssignModalStation(st);
                        setAssignUserId(st.activeUserId || (users[0]?.id || ""));
                      }}
                      className="text-[11px] h-7 px-2 border-chunjai-300 text-chunjai-800 hover:bg-chunjai-50 font-semibold"
                    >
                      <UserPlus className="mr-1 h-3 w-3" />
                      มอบหมาย
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleOpenEditModal(st)}
                      className="text-[11px] h-7 px-2 text-slate-600 hover:text-chunjai-700 hover:bg-chunjai-50 font-semibold"
                      title="แก้ไขข้อมูลช่องบริการนี้"
                    >
                      <Edit2 className="mr-1 h-3 w-3" />
                      แก้ไข
                    </Button>

                    {isOccupied && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleForceVacate(st.id)}
                        disabled={isPending}
                        className="text-[11px] h-7 px-1.5 text-rose-600 hover:bg-rose-50"
                        title="บังคับปล่อยห้องว่าง"
                      >
                        <LogOut className="h-3 w-3" />
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteStationClick(st.id, st.name)}
                      disabled={isPending || isOccupied}
                      className="text-[11px] h-7 px-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      title="ลบช่องบริการนี้"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Add New Station Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-950 flex items-center gap-2">
              <Plus className="h-5 w-5 text-chunjai-600" />
              เพิ่มช่องบริการ / ห้องตรวจใหม่
            </h3>

            <form onSubmit={handleCreateStation} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-800 block">หมวดหมู่จุดบริการ</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as StationType)}
                  required
                  className="w-full h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold focus:border-chunjai-500 focus:outline-none"
                >
                  <option value={StationType.DOCTOR}>ห้องตรวจแพทย์ (DOCTOR)</option>
                  <option value={StationType.TRIAGE}>ช่องซักประวัติ/คัดกรอง (TRIAGE)</option>
                  <option value={StationType.PHARMACY}>ช่องจ่ายยา (PHARMACY)</option>
                  <option value={StationType.CASHIER}>ช่องการเงิน (CASHIER)</option>
                  <option value={StationType.LAB}>ห้องปฏิบัติการแล็บ (LAB)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-800 block">ชื่อช่องบริการ / ห้อง</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="เช่น ห้องตรวจแพทย์ 4 (กุมารเวช)"
                  required
                  className="w-full h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-xs focus:border-chunjai-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-800 block">รหัสประจำช่อง (Code)</label>
                  <input
                    type="text"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    placeholder="เช่น DOC_4"
                    required
                    className="w-full h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-xs uppercase font-mono focus:border-chunjai-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-800 block">หมายเลขช่อง</label>
                  <input
                    type="number"
                    value={newStationNumber}
                    onChange={(e) => setNewStationNumber(Number(e.target.value))}
                    min={1}
                    required
                    className="w-full h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-mono focus:border-chunjai-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  ยกเลิก
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isPending}
                  className="bg-chunjai-600 hover:bg-chunjai-700 text-white font-bold"
                >
                  บันทึกช่องบริการ
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Direct Assign Modal */}
      {assignModalStation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-950 flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-chunjai-600" />
              มอบหมายบุคลากรเข้า {assignModalStation.name}
            </h3>

            <form onSubmit={handleDirectAssign} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-800 block">เลือกบุคลากร</label>
                <select
                  value={assignUserId}
                  onChange={(e) => setAssignUserId(e.target.value)}
                  required
                  className="w-full h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold focus:border-chunjai-500 focus:outline-none"
                >
                  <option value="">-- เลือกบุคลากร --</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.fullName} ({u.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-800 block">ระยะเวลาเข้าประจำการ</label>
                <select
                  value={assignDurationHours}
                  onChange={(e) => setAssignDurationHours(Number(e.target.value))}
                  className="w-full h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold focus:border-chunjai-500 focus:outline-none"
                >
                  <option value={2}>2 ชั่วโมง</option>
                  <option value={4}>4 ชั่วโมง (ครึ่งวัน/กะ)</option>
                  <option value={8}>8 ชั่วโมง (เต็มวัน)</option>
                  <option value={12}>12 ชั่วโมง</option>
                </select>
              </div>

              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-50 border border-amber-200">
                <input
                  type="checkbox"
                  id="assignLockCheck"
                  checked={assignIsLocked}
                  onChange={(e) => setAssignIsLocked(e.target.checked)}
                  className="h-4 w-4 rounded border-amber-300 text-chunjai-600 focus:ring-chunjai-500"
                />
                <label htmlFor="assignLockCheck" className="text-xs text-amber-900 font-semibold cursor-pointer">
                  🔒 ล็อกห้องไม่ให้ออกเอง
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAssignModalStation(null)}
                >
                  ยกเลิก
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isPending}
                  className="bg-chunjai-600 hover:bg-chunjai-700 text-white font-bold"
                >
                  ยืนยันการมอบหมาย
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Station Modal */}
      {editingStation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-950 flex items-center gap-2">
                <Edit2 className="h-5 w-5 text-chunjai-600" />
                แก้ไขข้อมูลช่องบริการ / ห้องตรวจ
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setEditingStation(null)}
                className="h-8 w-8 text-slate-500"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleUpdateStation} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-800 block">
                  รหัสช่องบริการ (Code) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={editCode}
                  onChange={(e) => setEditCode(e.target.value)}
                  placeholder="เช่น DOC-01, PHARM-01"
                  required
                  className="w-full h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-mono font-bold focus:border-chunjai-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-800 block">
                  ชื่อช่องบริการ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="เช่น ห้องตรวจแพทย์ 1, ช่องจ่ายยา 2"
                  required
                  className="w-full h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold focus:border-chunjai-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-800 block">
                    หมายเลขห้อง (Station No.) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={editStationNumber}
                    onChange={(e) => setEditStationNumber(Number(e.target.value))}
                    required
                    className="w-full h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-mono font-bold focus:border-chunjai-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-800 block">
                    ประเภทช่องบริการ <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value as StationType)}
                    className="w-full h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold focus:border-chunjai-500 focus:outline-none"
                  >
                    <option value={StationType.DOCTOR}>ห้องตรวจแพทย์</option>
                    <option value={StationType.TRIAGE}>จุดซักประวัติ</option>
                    <option value={StationType.PHARMACY}>ห้องจ่ายยา</option>
                    <option value={StationType.CASHIER}>การเงิน</option>
                    <option value={StationType.LAB}>ห้องแล็บ</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <input
                  type="checkbox"
                  id="editIsActiveCheck"
                  checked={editIsActive}
                  onChange={(e) => setEditIsActive(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-chunjai-600 focus:ring-chunjai-500"
                />
                <label htmlFor="editIsActiveCheck" className="text-xs text-slate-800 font-semibold cursor-pointer">
                  เปิดใช้งานช่องบริการนี้ในระบบ
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingStation(null)}
                >
                  ยกเลิก
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isPending}
                  className="bg-chunjai-600 hover:bg-chunjai-700 text-white font-bold"
                >
                  บันทึกการแก้ไข
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Station Dialog */}
      <ConfirmDialog
        isOpen={!!deleteDialogStation}
        onClose={() => setDeleteDialogStation(null)}
        onConfirm={confirmDeleteStation}
        title="ยืนยันการลบช่องบริการ"
        description={`คุณต้องการลบช่องบริการ "${deleteDialogStation?.name || ""}" ออกจากระบบใช่หรือไม่? ช่องบริการนี้จะไม่สามารถรับคิวหรือจัดตารางเวรได้อีก`}
        confirmText="ลบช่องบริการ"
        cancelText="ยกเลิก"
        variant="danger"
        isLoading={isPending}
      />

      {/* Room Schedule Modal */}
      <RoomScheduleModal
        isOpen={!!roomScheduleModalStation}
        onClose={() => setRoomScheduleModalStation(null)}
        station={roomScheduleModalStation}
      />
    </div>
  );
}
