"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  ShieldCheck,
  Search,
  Filter,
  Clock,
  User,
  Eye,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Calendar,
  Lock,
  RefreshCw,
  Activity,
  KeyRound,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getAuditLogsAction, getAuditLogStatsAction } from "@/server/actions/audit-log";
import { AuditLogDetailModal } from "@/components/audit-log/AuditLogDetailModal";

export default function AuditLogDashboardPage() {
  const [isPending, startTransition] = useTransition();

  const [logs, setLogs] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>({ page: 1, totalPages: 1, totalCount: 0 });
  const [stats, setStats] = useState<any>({ totalToday: 0, loginAttempts: 0, pdpaAccesses: 0 });

  const [actionFilter, setActionFilter] = useState("ALL");
  const [resourceFilter, setResourceFilter] = useState("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const [selectedLog, setSelectedLog] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);

  const fetchLogs = (page: number = currentPage, limit: number = pageSize) => {
    setCurrentPage(page);
    startTransition(async () => {
      const res = await getAuditLogsAction({
        action: actionFilter,
        resourceType: resourceFilter,
        startDate,
        endDate,
        page,
        limit,
      });

      if (res.success && res.data) {
        setLogs(res.data.logs);
        setPagination(res.data.pagination);
        setAccessDenied(false);
      } else if (res.error?.includes("ไม่มีสิทธิ์")) {
        setAccessDenied(true);
      }

      const statsRes = await getAuditLogStatsAction();
      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data);
      }
    });
  };

  useEffect(() => {
    fetchLogs(1, pageSize);
  }, [actionFilter, resourceFilter, startDate, endDate, pageSize]);

  if (accessDenied) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-600">
          <Lock className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">
          การเข้าถึงถูกปฏิเสธ (Access Denied)
        </h2>
        <p className="text-xs text-slate-500">
          หน้าประวัติ Audit Log และการกำกับดูแลตามกฎหมาย PDPA สงวนสิทธิ์เฉพาะผู้ดูแลระบบ (ADMIN) หรือผู้ได้รับมอบหมายสิทธิ์เท่านั้น
        </p>
      </div>
    );
  }

  const startItem = pagination.totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, pagination.totalCount);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-chunjai-600 text-white shadow-md">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-chunjai-950">
              ศูนย์ตรวจสอบประวัติระบบและการกำกับดูแล PDPA (Audit Log & Compliance)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            บันทึกและตรวจสอบประวัติการเข้าถึงข้อมูลสุขภาพส่วนบุคคลแบบถาวร (Immutable Audit Log)
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchLogs(currentPage, pageSize)}
          className="text-xs font-semibold"
        >
          <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
          รีเฟรชข้อมูล
        </Button>
      </div>

      {/* KPI Cards Overview */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-chunjai-200 bg-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-slate-500 font-semibold">กิจกรรมในระบบวันนี้</span>
              <div className="text-2xl font-bold text-chunjai-950 font-mono">
                {stats.totalToday} <span className="text-xs font-normal text-slate-500">รายการ</span>
              </div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-chunjai-50 text-chunjai-600">
              <Activity className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-chunjai-200 bg-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-slate-500 font-semibold">การเข้าถึงประวัติสุขภาพ (PDPA)</span>
              <div className="text-2xl font-bold text-chunjai-700 font-mono">
                {stats.pdpaAccesses} <span className="text-xs font-normal text-slate-500">รายการ</span>
              </div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-chunjai-100 text-chunjai-700">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-chunjai-200 bg-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-slate-500 font-semibold">การเข้าสู่ระบบและรักษาความปลอดภัย</span>
              <div className="text-2xl font-bold text-emerald-700 font-mono">
                {stats.loginAttempts} <span className="text-xs font-normal text-slate-500">ครั้ง</span>
              </div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <KeyRound className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Bar */}
      <Card className="border-chunjai-200">
        <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-700">Action:</span>
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-xs focus:border-chunjai-500 focus:outline-none"
              >
                <option value="ALL">ทั้งหมด (All Actions)</option>
                <option value="LOGIN">LOGIN</option>
                <option value="LOGOUT">LOGOUT</option>
                <option value="PATIENT_CREATE">PATIENT_CREATE</option>
                <option value="VISIT_CREATED">VISIT_CREATED</option>
                <option value="TRIAGE_RECORDED">TRIAGE_RECORDED</option>
                <option value="SOAP_CREATED">SOAP_CREATED</option>
                <option value="PRESCRIPTION_CREATED">PRESCRIPTION_CREATED</option>
                <option value="DRUG_DISPENSED">DRUG_DISPENSED</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-700">Resource:</span>
              <select
                value={resourceFilter}
                onChange={(e) => setResourceFilter(e.target.value)}
                className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-xs focus:border-chunjai-500 focus:outline-none"
              >
                <option value="ALL">ทั้งหมด (All Resources)</option>
                <option value="USER">USER</option>
                <option value="PATIENT">PATIENT</option>
                <option value="VISIT">VISIT</option>
                <option value="QUEUE">QUEUE</option>
                <option value="PRESCRIPTION">PRESCRIPTION</option>
                <option value="DRUG">DRUG</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-xs focus:border-chunjai-500 focus:outline-none"
            />
            <span className="text-slate-400">-</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-xs focus:border-chunjai-500 focus:outline-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs Table */}
      <Card>
        <CardHeader className="pb-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-bold text-chunjai-950">
              รายการประวัติกิจกรรม Audit Log ({pagination.totalCount} รายการ)
            </CardTitle>
            <CardDescription className="text-xs">
              เรียงลำดับจากกิจกรรมล่าสุด ยืนยันการเข้าถึงและแก้ไขข้อมูลสุขภาพ
            </CardDescription>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-semibold">แสดงต่อหน้า:</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(parseInt(e.target.value, 10))}
              className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs font-bold text-chunjai-700 focus:border-chunjai-500 focus:outline-none"
            >
              <option value={10}>10 รายการ</option>
              <option value={20}>20 รายการ</option>
              <option value={50}>50 รายการ</option>
              <option value={100}>100 รายการ</option>
            </select>
          </div>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          {isPending && logs.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-chunjai-600" />
              <p className="text-xs font-medium">กำลังโหลดประวัติ Audit Log...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="p-12 text-center text-slate-400">ไม่พบประวัติ Audit Log ตามเงื่อนไข</div>
          ) : (
            <>
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3">วัน-เวลา</th>
                    <th className="px-6 py-3">ผู้กระทำ (User)</th>
                    <th className="px-6 py-3">กิจกรรม (Action)</th>
                    <th className="px-6 py-3">ทรัพยากร (Resource)</th>
                    <th className="px-6 py-3 text-center">สถานะ</th>
                    <th className="px-6 py-3 text-right">รายละเอียด</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-mono text-slate-500 text-[11px]">
                        {new Date(log.timestamp).toLocaleString("th-TH")}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900">
                        {log.user?.fullName || "ระบบอัตโนมัติ"}
                        <span className="text-[10px] text-chunjai-600 font-mono font-normal block">
                          {log.user ? `@${log.user.username} (${log.user.role})` : "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className="font-mono text-[10px] border-chunjai-300 text-chunjai-900">
                          {log.action}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 font-mono text-slate-700">
                        {log.resourceType} {log.resourceId ? `(${log.resourceId.slice(0, 8)}...)` : ""}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {log.success ? (
                          <Badge variant="success" className="text-[10px]">
                            สำเร็จ
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="text-[10px]">
                            ล้มเหลว
                          </Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedLog(log);
                            setIsModalOpen(true);
                          }}
                          className="h-8 text-chunjai-700 hover:bg-chunjai-50"
                        >
                          <Eye className="mr-1 h-3.5 w-3.5" />
                          ดู Metadata
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Table Pagination Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-t border-slate-100 bg-slate-50/40 text-xs">
                <div className="text-slate-500">
                  แสดงผล <span className="font-mono font-bold text-slate-900">{startItem}</span> ถึง{" "}
                  <span className="font-mono font-bold text-slate-900">{endItem}</span> จากทั้งหมด{" "}
                  <span className="font-mono font-bold text-chunjai-700">{pagination.totalCount}</span> รายการ
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage <= 1 || isPending}
                    onClick={() => fetchLogs(currentPage - 1, pageSize)}
                    className="h-8 text-xs font-semibold"
                  >
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    หน้าก่อนหน้า
                  </Button>

                  <span className="font-mono font-bold text-xs text-chunjai-900 px-2">
                    หน้า {currentPage} / {pagination.totalPages || 1}
                  </span>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage >= (pagination.totalPages || 1) || isPending}
                    onClick={() => fetchLogs(currentPage + 1, pageSize)}
                    className="h-8 text-xs font-semibold"
                  >
                    หน้าถัดไป
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Audit Log Detail Modal */}
      <AuditLogDetailModal
        isOpen={isModalOpen}
        log={selectedLog}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedLog(null);
        }}
      />
    </div>
  );
}
