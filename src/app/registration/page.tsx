"use client";

import React, { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import {
  UserPlus,
  Stethoscope,
  Clock,
  CheckCircle2,
  Loader2,
  CalendarDays,
  PlusCircle,
  ArrowRight,
  Search,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PatientExactSearchInput } from "@/components/patients/PatientExactSearchInput";
import { getVisitsAction, updateVisitStatusAction } from "@/server/actions/visit";
import { CreateVisitDialog } from "@/components/registration/CreateVisitDialog";
import { PatientFormDialog } from "@/components/patients/PatientFormDialog";
import { VisitStatus } from "@/generated/client";

export default function RegistrationPage() {
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
  const [isNewPatientModalOpen, setIsNewPatientModalOpen] = useState(false);

  const [activeVisits, setActiveVisits] = useState<any[]>([]);
  const [visitSearchPending, startVisitTransition] = useTransition();

  // Fetch today's active visits
  const fetchActiveVisits = () => {
    startVisitTransition(async () => {
      const res = await getVisitsAction();
      if (res.success && res.data) {
        setActiveVisits(res.data);
      }
    });
  };

  useEffect(() => {
    fetchActiveVisits();
  }, []);

  const getVisitStatusBadge = (status: VisitStatus) => {
    switch (status) {
      case VisitStatus.REGISTERED:
      case VisitStatus.WAITING_TRIAGE:
        return <Badge variant="warning" className="text-[10px]">รอคัดกรองสัญญาณชีพ</Badge>;
      case VisitStatus.TRIAGED:
      case VisitStatus.WAITING_DOCTOR:
        return <Badge variant="secondary" className="text-[10px] bg-chunjai-100 text-chunjai-800">รอพบแพทย์</Badge>;
      case VisitStatus.IN_CONSULTATION:
        return <Badge variant="default" className="text-[10px] bg-chunjai-600">กำลังพบแพทย์</Badge>;
      case VisitStatus.WAITING_PHARMACY:
        return <Badge variant="warning" className="text-[10px] bg-purple-100 text-purple-800">รอรับยา</Badge>;
      case VisitStatus.DISPENSED:
      case VisitStatus.COMPLETED:
        return <Badge variant="success" className="text-[10px]">เสร็จสิ้นการบริการ</Badge>;
      case VisitStatus.CANCELLED:
        return <Badge variant="destructive" className="text-[10px]">ยกเลิก</Badge>;
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
              <UserPlus className="h-5 w-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-chunjai-950">
              จุดลงทะเบียนและต้อนรับผู้ป่วย (Registration Hub)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            ค้นหาผู้ป่วย เปิด Visit เคสใหม่ และติดตามสถานะบริการประจำวัน
          </p>
        </div>

        <Button
          onClick={() => setIsNewPatientModalOpen(true)}
          className="bg-chunjai-600 hover:bg-chunjai-700 text-white font-semibold text-xs shadow-sm"
        >
          <PlusCircle className="mr-1.5 h-4 w-4" />
          ลงทะเบียนผู้ป่วยใหม่
        </Button>
      </div>

      {/* Instant Patient Search & Visit Creation Card */}
      <Card className="border-chunjai-200 bg-gradient-to-r from-chunjai-50/50 via-white to-white">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold text-chunjai-950 flex items-center gap-2">
            <Search className="h-5 w-5 text-chunjai-600" />
            ค้นหาผู้ป่วยเพื่อเปิด Visit ใหม่
          </CardTitle>
          <CardDescription className="text-xs">
            กรอก HN หรือเลขบัตรประชาชน 13 หลัก ให้ถูกต้อง 100% แล้วกด Enter หรือปุ่ม &quot;ค้นหา&quot;
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <PatientExactSearchInput
            onPatientFound={(p) => {
              setSelectedPatient(p);
              setIsVisitModalOpen(true);
            }}
            inputHeight="h-11"
            dropdownMaxHeight="max-h-64"
          />
          <div className="flex items-center justify-between pt-1">
            <p className="text-[11px] text-slate-400">
              ยังไม่มีประวัติผู้ป่วย?
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsNewPatientModalOpen(true)}
              className="text-xs h-7"
            >
              <PlusCircle className="mr-1 h-3.5 w-3.5" />
              ลงทะเบียนผู้ป่วยใหม่
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Active Visits Stream */}
      <Card>
        <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Clock className="h-5 w-5 text-chunjai-600" />
              รายการเปิด Visit รับบริการวันนี้ ({activeVisits.length} เคส)
            </CardTitle>
            <CardDescription className="text-xs">
              ติดตามสถานะการรับบริการของผู้ป่วยแบบเรียลไทม์
            </CardDescription>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchActiveVisits()}
            className="text-xs"
          >
            รีเฟรชข้อมูล
          </Button>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          {visitSearchPending && activeVisits.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-chunjai-600" />
              <p className="text-xs font-medium">กำลังโหลดรายการ Visit วันนี้...</p>
            </div>
          ) : activeVisits.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <CalendarDays className="mx-auto h-10 w-10 text-slate-300" />
              <p className="text-sm font-semibold text-slate-700">ยังไม่มีเคสเปิด Visit ในวันนี้</p>
              <p className="text-xs">ค้นหาผู้ป่วยด้านบนเพื่อเริ่มเปิด Visit รับบริการเคสแรกของวัน</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3">Visit Number</th>
                  <th className="px-6 py-3">HN / ชื่อผู้ป่วย</th>
                  <th className="px-6 py-3">อาการสำคัญ (Chief Complaint)</th>
                  <th className="px-6 py-3">เวลาเปิด Visit</th>
                  <th className="px-6 py-3">สถานะบริการ</th>
                  <th className="px-6 py-3 text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {activeVisits.map((visit) => (
                  <tr key={visit.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-bold text-chunjai-700 font-mono">
                      {visit.visitNumber}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-900 block">
                        {visit.patient?.firstName} {visit.patient?.lastName}
                      </span>
                      <span className="text-[11px] text-chunjai-600 font-mono">
                        {visit.patient?.hn}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-700 max-w-xs truncate">
                      {visit.chiefComplaint || "-"}
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-mono">
                      {new Date(visit.createdAt).toLocaleTimeString("th-TH", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })} น.
                    </td>
                    <td className="px-6 py-4">
                      {getVisitStatusBadge(visit.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/patient/${visit.patientId}`}>
                        <Button variant="ghost" size="sm" className="h-8 text-chunjai-700">
                          ดูประวัติ
                          <ArrowRight className="ml-1 h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Open Visit Modal */}
      <CreateVisitDialog
        isOpen={isVisitModalOpen}
        patient={selectedPatient}
        onClose={() => {
          setIsVisitModalOpen(false);
          setSelectedPatient(null);
        }}
        onSuccess={() => fetchActiveVisits()}
      />

      {/* Create New Patient Modal */}
      <PatientFormDialog
        isOpen={isNewPatientModalOpen}
        onClose={() => setIsNewPatientModalOpen(false)}
        onSuccess={() => fetchActiveVisits()}
      />
    </div>
  );
}
