"use client";

import React, { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Plus,
  Printer,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Clock,
  UserCheck,
  Search,
  Users,
  ArrowRight,
  UserPlus,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  getAppointmentsAction,
  updateAppointmentStatusAction,
} from "@/server/actions/appointment";
import { CreateAppointmentModal } from "@/components/appointment/CreateAppointmentModal";
import { AppointmentStatus } from "@/generated/client";

const AppointmentSlipModal = dynamic(
  () => import("@/components/appointment/AppointmentSlipModal").then((mod) => mod.AppointmentSlipModal),
  { ssr: false }
);

export default function AppointmentHubPage() {
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<AppointmentStatus | "ALL">("ALL");
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );

  const [appointments, setAppointments] = useState<any[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<any | null>(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSlipModalOpen, setIsSlipModalOpen] = useState(false);

  const fetchAppointments = (date: string = selectedDate) => {
    startTransition(async () => {
      const res = await getAppointmentsAction({ date });
      if (res.success && res.data) {
        setAppointments(res.data);
      }
    });
  };

  useEffect(() => {
    fetchAppointments(selectedDate);
  }, [selectedDate]);

  const handleUpdateStatus = (appId: string, status: AppointmentStatus, autoVisit: boolean = false) => {
    startTransition(async () => {
      const res = await updateAppointmentStatusAction(appId, status, autoVisit);
      if (res.success) {
        fetchAppointments(selectedDate);
      }
    });
  };

  const filteredAppointments = appointments.filter((a) => {
    if (activeTab === "ALL") return true;
    return a.status === activeTab;
  });

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case AppointmentStatus.SCHEDULED:
        return <Badge variant="secondary" className="text-[10px]">นัดหมายไว้</Badge>;
      case AppointmentStatus.CONFIRMED:
        return <Badge variant="default" className="text-[10px] bg-chunjai-600">ยืนยันวันนัด</Badge>;
      case AppointmentStatus.ARRIVED:
        return <Badge variant="success" className="text-[10px]">มาตามนัดแล้ว</Badge>;
      case AppointmentStatus.COMPLETED:
        return <Badge variant="outline" className="text-[10px] text-emerald-700 border-emerald-200">ตรวจเสร็จแล้ว</Badge>;
      case AppointmentStatus.CANCELLED:
        return <Badge variant="destructive" className="text-[10px]">ยกเลิกนัด</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px]">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-chunjai-600 text-white shadow-md">
              <CalendarDays className="h-5 w-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-chunjai-950">
              ระบบนัดหมายติดตามผล (Appointment System)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            จัดการใบนัดหมาย เช็คอินเปิด Visit อัตโนมัติ และติดตามการรักษาระยะยาว
          </p>
        </div>

        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-chunjai-600 hover:bg-chunjai-700 text-white font-semibold text-xs shadow-sm"
        >
          <Plus className="mr-1.5 h-4 w-4" />
          สร้างใบนัดหมายใหม่
        </Button>
      </div>

      {/* Date & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700">เลือกวันที่:</span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:border-chunjai-500 focus:outline-none"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex gap-1.5 overflow-x-auto">
          <button
            onClick={() => setActiveTab("ALL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "ALL"
                ? "bg-chunjai-600 text-white shadow-xs"
                : "bg-white text-slate-700 border border-slate-200 hover:bg-chunjai-50"
            }`}
          >
            ทั้งหมด ({appointments.length})
          </button>
          <button
            onClick={() => setActiveTab(AppointmentStatus.SCHEDULED)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === AppointmentStatus.SCHEDULED
                ? "bg-chunjai-600 text-white shadow-xs"
                : "bg-white text-slate-700 border border-slate-200 hover:bg-chunjai-50"
            }`}
          >
            นัดหมายไว้
          </button>
          <button
            onClick={() => setActiveTab(AppointmentStatus.ARRIVED)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === AppointmentStatus.ARRIVED
                ? "bg-chunjai-600 text-white shadow-xs"
                : "bg-white text-slate-700 border border-slate-200 hover:bg-chunjai-50"
            }`}
          >
            มาตามนัดแล้ว
          </button>
        </div>
      </div>

      {/* Daily Appointments Table */}
      <Card>
        <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Users className="h-5 w-5 text-chunjai-600" />
              รายการนัดหมายประจำวัน ({filteredAppointments.length} คน)
            </CardTitle>
            <CardDescription className="text-xs">
              กด "เช็คอิน & เปิด Visit" เมื่อผู้ป่วยมาถึงคลินิกตามนัดหมาย
            </CardDescription>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchAppointments(selectedDate)}
            className="text-xs font-semibold"
          >
            รีเฟรช
          </Button>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          {isPending && appointments.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-chunjai-600" />
              <p className="text-xs font-medium">กำลังโหลดรายการนัดหมาย...</p>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <CalendarDays className="mx-auto h-10 w-10 text-slate-300" />
              <p className="text-sm font-semibold text-slate-700">ไม่มีนัดหมายในวันที่เลือก</p>
              <p className="text-xs">กดปุ่ม "สร้างใบนัดหมายใหม่" ด้านบนเพื่อเพิ่มนัดหมายใหม่</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3">เวลานัด</th>
                  <th className="px-6 py-3">HN / ชื่อผู้ป่วย</th>
                  <th className="px-6 py-3">วัตถุประสงค์นัดหมาย</th>
                  <th className="px-6 py-3">สถานะ</th>
                  <th className="px-6 py-3 text-right">การกระทำ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredAppointments.map((app) => {
                  const isArrived = app.status === AppointmentStatus.ARRIVED || app.status === AppointmentStatus.COMPLETED;

                  return (
                    <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-bold text-chunjai-700 font-mono text-sm">
                        {new Date(app.appointmentDate).toLocaleTimeString("th-TH", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        น.
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-900 block">
                          {app.patient?.firstName} {app.patient?.lastName}
                        </span>
                        <span className="text-[11px] text-chunjai-600 font-mono">
                          HN: {app.patient?.hn}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-700 max-w-xs truncate">
                        {app.reason || "-"}
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(app.status)}</td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedAppointment(app);
                            setIsSlipModalOpen(true);
                          }}
                          className="h-8 text-xs text-chunjai-700"
                        >
                          <Printer className="mr-1 h-3.5 w-3.5" />
                          พิมพ์ใบนัด
                        </Button>

                        {!isArrived && (
                          <Button
                            size="sm"
                            onClick={() =>
                              handleUpdateStatus(app.id, AppointmentStatus.ARRIVED, true)
                            }
                            disabled={isPending}
                            className="h-8 bg-chunjai-600 hover:bg-chunjai-700 text-white font-semibold text-xs shadow-xs"
                          >
                            <UserCheck className="mr-1.5 h-3.5 w-3.5" />
                            มาตามนัด & เปิด Visit
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Create Appointment Modal */}
      <CreateAppointmentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => fetchAppointments(selectedDate)}
      />

      {/* Printable Appointment Slip Modal */}
      <AppointmentSlipModal
        isOpen={isSlipModalOpen}
        appointment={selectedAppointment}
        onClose={() => setIsSlipModalOpen(false)}
      />
    </div>
  );
}
