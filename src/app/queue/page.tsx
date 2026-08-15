"use client";

import React, { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import {
  Clock,
  Volume2,
  Play,
  CheckCircle2,
  SkipForward,
  RotateCcw,
  Stethoscope,
  UserCheck,
  Pill,
  Monitor,
  Loader2,
  AlertCircle,
  Users,
  ShieldAlert,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  getQueuesAction,
  callQueueAction,
  updateQueueStatusAction,
} from "@/server/actions/queue";
import { QueueStatus, QueueType } from "@/generated/client";

export default function QueueManagementPage() {
  const [activeTab, setActiveTab] = useState<"TRIAGE" | "DOC" | "PHARM">("TRIAGE");
  const [isPending, startTransition] = useTransition();
  const [queues, setQueues] = useState<any[]>([]);

  const fetchQueues = (typeCode: string = activeTab) => {
    startTransition(async () => {
      const res = await getQueuesAction({ typeCode });
      if (res.success && res.data) {
        setQueues(res.data);
      }
    });
  };

  useEffect(() => {
    fetchQueues(activeTab);
  }, [activeTab]);

  const handleCallQueue = (queueId: string) => {
    startTransition(async () => {
      const res = await callQueueAction(queueId);
      if (res.success) {
        fetchQueues(activeTab);
      }
    });
  };

  const handleUpdateStatus = (queueId: string, status: QueueStatus) => {
    startTransition(async () => {
      const res = await updateQueueStatusAction(queueId, status);
      if (res.success) {
        fetchQueues(activeTab);
      }
    });
  };

  // Filter queues by status
  const currentCalled = queues.find(
    (q) => q.status === QueueStatus.CALLED || q.status === QueueStatus.SERVING
  );
  const waitingQueues = queues.filter((q) => q.status === QueueStatus.WAITING);
  const completedQueues = queues.filter(
    (q) => q.status === QueueStatus.COMPLETED || q.status === QueueStatus.SKIPPED
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-chunjai-600 text-white shadow-md">
              <Clock className="h-5 w-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-chunjai-950">
              ศูนย์ควบคุมคิวคลินิก (Queue Control Hub)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            จัดการคิว เรียกคิวเปลี่ยนสถานะบริการ และเปิดจอแสดงผลสำหรับห้องรอตรวจ
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/queue/display" target="_blank">
            <Button
              variant="outline"
              size="sm"
              className="bg-white border-chunjai-200 text-chunjai-700 hover:bg-chunjai-50 font-semibold text-xs shadow-xs"
            >
              <Monitor className="mr-1.5 h-4 w-4 text-chunjai-600" />
              เปิดจอแสดงคิวผู้ป่วย (Public Monitor)
            </Button>
          </Link>
        </div>
      </div>

      {/* Queue Type Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("TRIAGE")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-xs transition-all ${
            activeTab === "TRIAGE"
              ? "bg-chunjai-600 text-white shadow-sm"
              : "bg-white text-slate-700 hover:bg-chunjai-50 border border-slate-200"
          }`}
        >
          <Stethoscope className="h-4 w-4" />
          คิวคัดกรองสัญญาณชีพ (T)
        </button>

        <button
          onClick={() => setActiveTab("DOC")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-xs transition-all ${
            activeTab === "DOC"
              ? "bg-chunjai-600 text-white shadow-sm"
              : "bg-white text-slate-700 hover:bg-chunjai-50 border border-slate-200"
          }`}
        >
          <UserCheck className="h-4 w-4" />
          คิวพบแพทย์ตรวจรักษา (A)
        </button>

        <button
          onClick={() => setActiveTab("PHARM")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-xs transition-all ${
            activeTab === "PHARM"
              ? "bg-chunjai-600 text-white shadow-sm"
              : "bg-white text-slate-700 hover:bg-chunjai-50 border border-slate-200"
          }`}
        >
          <Pill className="h-4 w-4" />
          คิวรับยาห้องยา (P)
        </button>
      </div>

      {/* Main Grid: Serving Control & Waiting List */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column: Currently Serving Queue Box */}
        <Card className="md:col-span-1 border-chunjai-200 bg-gradient-to-b from-chunjai-50/60 via-white to-white">
          <CardHeader className="pb-3 border-b border-slate-100 text-center">
            <CardTitle className="text-sm font-bold text-chunjai-900">
              คิวที่กำลังรับบริการอยู่ขณะนี้
            </CardTitle>
            <CardDescription className="text-xs">
              ควบคุมการเรียกซ้ำและเปลี่ยนสถานะคิว
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 text-center space-y-4">
            {currentCalled ? (
              <div className="space-y-4">
                <div className="rounded-2xl border border-chunjai-200 bg-white p-6 shadow-md space-y-2">
                  <span className="text-xs font-semibold text-chunjai-600 block uppercase tracking-wider">
                    {currentCalled.queueType?.name}
                  </span>
                  <div className="text-5xl font-extrabold text-chunjai-700 font-mono tracking-tight">
                    {currentCalled.queueNumber}
                  </div>
                  <p className="text-sm font-bold text-slate-900">
                    {currentCalled.visit?.patient?.firstName}{" "}
                    {currentCalled.visit?.patient?.lastName}
                  </p>
                  <p className="text-xs text-slate-500 font-mono">
                    HN: {currentCalled.visit?.patient?.hn}
                  </p>

                  {/* Allergy Warning if any */}
                  {currentCalled.visit?.patient?.allergies?.length > 0 && (
                    <div className="inline-flex items-center gap-1 rounded-md bg-rose-100 text-rose-800 px-2.5 py-1 text-[11px] font-bold mt-2">
                      <ShieldAlert className="h-3.5 w-3.5" />
                      มีประวัติแพ้ยา!
                    </div>
                  )}
                </div>

                {/* Queue Control Action Buttons */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <Button
                    onClick={() => handleCallQueue(currentCalled.id)}
                    disabled={isPending}
                    variant="outline"
                    className="border-chunjai-300 text-chunjai-800 hover:bg-chunjai-50 font-semibold"
                  >
                    <Volume2 className="mr-1.5 h-4 w-4 text-chunjai-600" />
                    เรียกซ้ำ
                  </Button>

                  {currentCalled.status === QueueStatus.CALLED ? (
                    <Button
                      onClick={() =>
                        handleUpdateStatus(currentCalled.id, QueueStatus.SERVING)
                      }
                      disabled={isPending}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                    >
                      <Play className="mr-1.5 h-4 w-4" />
                      เริ่มบริการ
                    </Button>
                  ) : (
                    <Button
                      onClick={() =>
                        handleUpdateStatus(currentCalled.id, QueueStatus.COMPLETED)
                      }
                      disabled={isPending}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                    >
                      <CheckCircle2 className="mr-1.5 h-4 w-4" />
                      เสร็จสิ้น
                    </Button>
                  )}
                </div>

                <Button
                  onClick={() =>
                    handleUpdateStatus(currentCalled.id, QueueStatus.SKIPPED)
                  }
                  disabled={isPending}
                  variant="ghost"
                  className="w-full text-xs text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                >
                  <SkipForward className="mr-1.5 h-3.5 w-3.5" />
                  ข้ามคิวนี้ (Skipped)
                </Button>
              </div>
            ) : (
              <div className="py-8 space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-chunjai-100 text-chunjai-600">
                  <Clock className="h-8 w-8" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-800">
                    ยังไม่มีคิวที่กำลังรับบริการ
                  </p>
                  <p className="text-xs text-slate-400">
                    กดปุ่มเรียกคิวถัดไปจากตารางด้านข้างเพื่อเริ่มบริการ
                  </p>
                </div>

                {waitingQueues.length > 0 && (
                  <Button
                    onClick={() => handleCallQueue(waitingQueues[0].id)}
                    disabled={isPending}
                    className="w-full bg-chunjai-600 hover:bg-chunjai-700 text-white font-bold h-11 text-sm shadow-md"
                  >
                    <Volume2 className="mr-2 h-5 w-5" />
                    เรียกคิวถัดไป ({waitingQueues[0].queueNumber})
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Column: Waiting Queue List */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Users className="h-5 w-5 text-chunjai-600" />
                คิวรอรับบริการ ({waitingQueues.length} คน)
              </CardTitle>
              <CardDescription className="text-xs">
                รายการคิวที่ลงทะเบียนและกำลังรอเรียกเข้าบริการ
              </CardDescription>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchQueues(activeTab)}
              className="text-xs"
            >
              รีเฟรช
            </Button>
          </CardHeader>

          <CardContent className="p-0 overflow-x-auto">
            {isPending && queues.length === 0 ? (
              <div className="p-12 text-center text-slate-400 space-y-2">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-chunjai-600" />
                <p className="text-xs font-medium">กำลังโหลดคิว...</p>
              </div>
            ) : waitingQueues.length === 0 ? (
              <div className="p-12 text-center text-slate-400 space-y-2">
                <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-400" />
                <p className="text-sm font-semibold text-slate-700">ไม่มีคิวรอในขณะนี้</p>
                <p className="text-xs">คิวทั้งหมดได้รับการบริการเรียบร้อยแล้ว</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3">เลขคิว</th>
                    <th className="px-6 py-3">HN / ชื่อผู้ป่วย</th>
                    <th className="px-6 py-3">อาการสำคัญ (Chief Complaint)</th>
                    <th className="px-6 py-3">เวลารอ</th>
                    <th className="px-6 py-3 text-right">การกระทำ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {waitingQueues.map((q) => (
                    <tr key={q.id} className="hover:bg-chunjai-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-chunjai-700 font-mono text-base">
                        {q.queueNumber}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 block">
                            {q.visit?.patient?.firstName} {q.visit?.patient?.lastName}
                          </span>
                          {q.visit?.labOrders?.length > 0 && (
                            q.visit.labOrders.every((l: any) => l.status === "COMPLETED") ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                ผลแล็บพร้อมแล้ว
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                รอผลแล็บ
                              </span>
                            )
                          )}
                        </div>
                        <span className="text-[11px] text-chunjai-600 font-mono">
                          {q.visit?.patient?.hn}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-700 max-w-xs truncate">
                        {q.visit?.chiefComplaint || "-"}
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-mono">
                        {new Date(q.createdAt).toLocaleTimeString("th-TH", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })} น.
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          size="sm"
                          onClick={() => handleCallQueue(q.id)}
                          disabled={isPending}
                          className="bg-chunjai-600 hover:bg-chunjai-700 text-white font-semibold text-xs shadow-xs"
                        >
                          <Volume2 className="mr-1.5 h-3.5 w-3.5" />
                          เรียกคิวนี้
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
