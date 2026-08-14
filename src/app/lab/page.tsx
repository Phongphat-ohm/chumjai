"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  TestTube,
  Plus,
  Search,
  Printer,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Clock,
  FileSpreadsheet,
  RefreshCw,
  Eye,
  Edit3,
} from "lucide-react";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getLabOrdersAction } from "@/server/actions/lab";
import { CreateLabOrderModal } from "@/components/lab/CreateLabOrderModal";
import { RecordLabResultModal } from "@/components/lab/RecordLabResultModal";
import { LabOrderStatus } from "@/generated/client";
import { useClinicSettings } from "@/hooks/useClinicSettings";

const LabReportModal = dynamic(
  () => import("@/components/lab/LabReportModal").then((mod) => mod.LabReportModal),
  { ssr: false }
);

export default function LaboratoryHubPage() {
  const [isPending, startTransition] = useTransition();
  const { clinicInfo } = useClinicSettings();

  const [activeTab, setActiveTab] = useState<LabOrderStatus | "ALL">("ALL");
  const [orders, setOrders] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const fetchOrders = () => {
    startTransition(async () => {
      const res = await getLabOrdersAction();
      if (res.success && res.data) {
        setOrders(res.data);
      }
    });
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter((o) => {
    if (activeTab !== "ALL" && o.status !== activeTab) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      o.patient?.firstName.toLowerCase().includes(q) ||
      o.patient?.lastName.toLowerCase().includes(q) ||
      o.patient?.hn.toLowerCase().includes(q) ||
      o.testName.toLowerCase().includes(q)
    );
  });

  const orderedCount = orders.filter((o) => o.status === LabOrderStatus.ORDERED).length;
  const completedCount = orders.filter((o) => o.status === LabOrderStatus.COMPLETED).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-chunjai-600 text-white shadow-md">
              <TestTube className="h-5 w-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-chunjai-950">
              ศูนย์ปฏิบัติการแล็บ/ชันสูตร (Laboratory Station)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            รับคำสั่งตรวจแล็บ ลงบันทึกผลการตรวจ และออกใบรายงานผลการชันสูตร
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchOrders()}
            className="text-xs font-semibold"
          >
            <RefreshCw className="mr-1.5 h-3.5 w-3.5 text-chunjai-600" />
            รีเฟรชข้อมูล
          </Button>

          <Button
            onClick={() => setIsCreateModalOpen(true)}
            size="sm"
            className="bg-chunjai-600 hover:bg-chunjai-700 text-white font-semibold text-xs shadow-sm"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            สั่งตรวจแล็บใหม่
          </Button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-chunjai-200 bg-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-slate-500 font-semibold">คำสั่งตรวจแล็บทั้งหมด</span>
              <div className="text-2xl font-bold text-chunjai-950 font-mono">
                {orders.length} <span className="text-xs font-normal text-slate-500">รายการ</span>
              </div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-chunjai-50 text-chunjai-600">
              <TestTube className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-amber-50/40">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-slate-500 font-semibold">รอการลงผลการตรวจ</span>
              <div className="text-2xl font-bold text-amber-700 font-mono">
                {orderedCount} <span className="text-xs font-normal text-slate-500">รายการ</span>
              </div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 bg-emerald-50/40">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-slate-500 font-semibold">รายงานผลเรียบร้อยแล้ว</span>
              <div className="text-2xl font-bold text-emerald-700 font-mono">
                {completedCount} <span className="text-xs font-normal text-slate-500">รายการ</span>
              </div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("ALL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "ALL"
                ? "bg-chunjai-600 text-white shadow-xs"
                : "bg-white text-slate-700 border border-slate-200 hover:bg-chunjai-50"
            }`}
          >
            ทั้งหมด ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab(LabOrderStatus.ORDERED)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === LabOrderStatus.ORDERED
                ? "bg-chunjai-600 text-white shadow-xs"
                : "bg-white text-slate-700 border border-slate-200 hover:bg-chunjai-50"
            }`}
          >
            รอลงผลแล็บ ({orderedCount})
          </button>
          <button
            onClick={() => setActiveTab(LabOrderStatus.COMPLETED)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === LabOrderStatus.COMPLETED
                ? "bg-chunjai-600 text-white shadow-xs"
                : "bg-white text-slate-700 border border-slate-200 hover:bg-chunjai-50"
            }`}
          >
            รายงานผลแล้ว ({completedCount})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหา HN, ชื่อผู้ป่วย, ชื่อแล็บ..."
            className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-xs focus:border-chunjai-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Lab Orders Table */}
      <Card>
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-base font-bold text-chunjai-950 flex items-center gap-2">
            <TestTube className="h-5 w-5 text-chunjai-600" />
            รายการคำสั่งตรวจทางห้องปฏิบัติการ ({filteredOrders.length} รายการ)
          </CardTitle>
          <CardDescription className="text-xs">
            เรียงลำดับจากคำสั่งตรวจล่าสุด
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          {isPending && orders.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-chunjai-600" />
              <p className="text-xs font-medium">กำลังโหลดรายการแล็บ...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <TestTube className="mx-auto h-10 w-10 text-slate-300" />
              <p className="text-sm font-semibold text-slate-700">ไม่พบรายการคำสั่งตรวจแล็บ</p>
              <p className="text-xs">กดปุ่ม "สั่งตรวจแล็บใหม่" ด้านบนเพื่อเพิ่มคำสั่งตรวจ</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3">วัน-เวลา สั่งตรวจ</th>
                  <th className="px-6 py-3">HN / ชื่อผู้ป่วย</th>
                  <th className="px-6 py-3">รายการตรวจ (Test Name)</th>
                  <th className="px-6 py-3">สถานะ</th>
                  <th className="px-6 py-3 text-right">การกระทำ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredOrders.map((order) => {
                  const isDone = order.status === LabOrderStatus.COMPLETED;
                  const hasAbnormal = order.results?.some((r: any) => r.isAbnormal);

                  return (
                    <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-mono text-slate-600 text-[11px]">
                        {new Date(order.createdAt).toLocaleString("th-TH")}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-900 block">
                          {order.patient?.firstName} {order.patient?.lastName}
                        </span>
                        <span className="text-[11px] text-chunjai-600 font-mono">
                          HN: {order.patient?.hn} · Visit: {order.visit?.visitNumber}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-chunjai-950 block">
                          {order.testName}
                        </span>
                        {hasAbnormal && (
                          <Badge variant="destructive" className="text-[9px] mt-0.5">
                            มีค่าผิดปกติ
                          </Badge>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {isDone ? (
                          <Badge variant="success" className="text-[10px]">
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            รายงานผลแล้ว
                          </Badge>
                        ) : (
                          <Badge variant="warning" className="text-[10px]">
                            <Clock className="mr-1 h-3 w-3" />
                            รอลงผลแล็บ
                          </Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedOrder(order);
                            setIsRecordModalOpen(true);
                          }}
                          className="h-8 text-xs text-chunjai-700"
                        >
                          <Edit3 className="mr-1 h-3.5 w-3.5" />
                          {isDone ? "แก้ไขผลแล็บ" : "ลงผลแล็บ"}
                        </Button>

                        {isDone && (
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedOrder(order);
                              setIsReportModalOpen(true);
                            }}
                            className="h-8 bg-chunjai-600 hover:bg-chunjai-700 text-white font-semibold text-xs shadow-xs"
                          >
                            <Printer className="mr-1 h-3.5 w-3.5" />
                            ใบรายงานผล
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

      {/* Modals */}
      <CreateLabOrderModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => fetchOrders()}
      />

      <RecordLabResultModal
        isOpen={isRecordModalOpen}
        labOrder={selectedOrder}
        onClose={() => {
          setIsRecordModalOpen(false);
          setSelectedOrder(null);
        }}
        onSuccess={() => fetchOrders()}
      />

      <LabReportModal
        isOpen={isReportModalOpen}
        clinicInfo={clinicInfo}
        labOrder={selectedOrder}
        onClose={() => {
          setIsReportModalOpen(false);
          setSelectedOrder(null);
        }}
      />
    </div>
  );
}
