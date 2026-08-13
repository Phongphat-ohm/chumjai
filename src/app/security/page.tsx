"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  UserCheck,
  RefreshCw,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Database,
  EyeOff,
  Activity,
  Key,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getSecurityAuditReportAction } from "@/server/actions/security";

export default function SecurityAuditPage() {
  const [isPending, startTransition] = useTransition();

  const [auditData, setAuditData] = useState<any | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);
  const [scanMessage, setScanMessage] = useState<string | null>(null);

  const fetchAuditReport = () => {
    startTransition(async () => {
      const res = await getSecurityAuditReportAction();
      if (res.success && res.data) {
        setAuditData(res.data);
      } else if (res.error?.includes("ไม่มีสิทธิ์")) {
        setAccessDenied(true);
      }
    });
  };

  useEffect(() => {
    fetchAuditReport();
  }, []);

  const handleRunAuditScan = () => {
    setScanMessage(null);
    startTransition(async () => {
      const res = await getSecurityAuditReportAction();
      if (res.success && res.data) {
        setAuditData(res.data);
        setScanMessage("ประมวลผลสแกนตรวจสอบความปลอดภัยสำเร็จ! ระบบพร้อมใช้งานตามเกณฑ์ความปลอดภัยขั้นสูง");
        setTimeout(() => setScanMessage(null), 4000);
      }
    });
  };

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
          หน้าศูนย์ตรวจสอบและยกระดับความปลอดภัยระบบสงวนสิทธิ์เฉพาะผู้ดูแลระบบ (ADMIN) เท่านั้น
        </p>
      </div>
    );
  }

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
              ศูนย์ตรวจสอบและยกระดับความปลอดภัย (Security Audit & Hardening)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            ตรวจสอบนโยบายความปลอดภัย RBAC, การคุ้มครองข้อมูล PDPA, การป้องกัน SQL Injection และ Audit Log
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleRunAuditScan}
            disabled={isPending}
            size="sm"
            className="bg-chunjai-600 hover:bg-chunjai-700 text-white font-bold text-xs shadow-sm"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                กำลังสแกนระบบ...
              </>
            ) : (
              <>
                <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                สแกนตรวจสอบความปลอดภัย
              </>
            )}
          </Button>
        </div>
      </div>

      {scanMessage && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 font-bold">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{scanMessage}</span>
        </div>
      )}

      {isPending && !auditData ? (
        <div className="p-20 text-center text-slate-400 space-y-2">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-chunjai-600" />
          <p className="text-xs font-medium">กำลังโหลดรายงานนโยบายความปลอดภัย...</p>
        </div>
      ) : auditData ? (
        <div className="space-y-6">
          {/* Executive Security KPI Cards */}
          <div className="grid gap-4 sm:grid-cols-4">
            <Card className="border-chunjai-200 bg-white">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs text-slate-500 font-semibold">ผู้ใช้งานที่เปิดใช้งานในระบบ</span>
                  <div className="text-2xl font-bold text-chunjai-950 font-mono">
                    {auditData.totalUsers} <span className="text-xs font-normal text-slate-500">คน</span>
                  </div>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-chunjai-50 text-chunjai-600">
                  <UserCheck className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-emerald-200 bg-emerald-50/40">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs text-slate-500 font-semibold">เข้าสู่ระบบสำเร็จ</span>
                  <div className="text-2xl font-bold text-emerald-700 font-mono">
                    {auditData.successfulLogins} <span className="text-xs font-normal text-slate-500">ครั้ง</span>
                  </div>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-amber-200 bg-amber-50/40">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs text-slate-500 font-semibold">พยายามเข้าสู่ระบบผิดพลาด</span>
                  <div className="text-2xl font-bold text-amber-700 font-mono">
                    {auditData.failedLoginAttempts} <span className="text-xs font-normal text-slate-500">ครั้ง</span>
                  </div>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                  <AlertTriangle className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50/40">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs text-slate-500 font-semibold">บันทึกประวัติ Audit Logs</span>
                  <div className="text-2xl font-bold text-blue-700 font-mono">
                    {auditData.totalAuditLogs} <span className="text-xs font-normal text-slate-500">รายการ</span>
                  </div>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                  <Activity className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* System Hardening Security Checklist */}
          <Card>
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-base font-bold text-chunjai-950 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-chunjai-600" />
                สถานะการยกระดับความปลอดภัย (System Security Hardening Checklist)
              </CardTitle>
              <CardDescription className="text-xs">
                รายงานผลการตรวจสอบการคุ้มครองตามเกณฑ์ความปลอดภัยมาตรฐาน
              </CardDescription>
            </CardHeader>

            <CardContent className="p-0 divide-y divide-slate-100 text-xs">
              {auditData.securityChecklist.map((item: any) => (
                <div key={item.id} className="p-4 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{item.name}</span>
                      <Badge variant="success" className="text-[10px]">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        {item.status}
                      </Badge>
                    </div>
                    <p className="text-slate-600 text-xs">{item.description}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* User Role Distribution Summary */}
          <Card>
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-base font-bold text-chunjai-950 flex items-center gap-2">
                <Key className="h-5 w-5 text-chunjai-600" />
                สรุปการแจกแจงสิทธิ์ตามบทบาทผู้ใช้ (User Role Distribution)
              </CardTitle>
              <CardDescription className="text-xs">
                การจำกัดสิทธิ์ผู้ใช้ตามหลักการ Least Privilege
              </CardDescription>
            </CardHeader>

            <CardContent className="p-4 grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                <span className="text-[10px] text-slate-500 font-bold block">ผู้ดูแลระบบ (ADMIN)</span>
                <span className="text-xl font-bold font-mono text-chunjai-800">
                  {auditData.roleMap["ADMIN"] || 0} คน
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                <span className="text-[10px] text-slate-500 font-bold block">แพทย์ (DOCTOR)</span>
                <span className="text-xl font-bold font-mono text-chunjai-800">
                  {auditData.roleMap["DOCTOR"] || 0} คน
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                <span className="text-[10px] text-slate-500 font-bold block">พยาบาล (NURSE)</span>
                <span className="text-xl font-bold font-mono text-chunjai-800">
                  {auditData.roleMap["NURSE"] || 0} คน
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                <span className="text-[10px] text-slate-500 font-bold block">เภสัชกร (PHARMACIST)</span>
                <span className="text-xl font-bold font-mono text-chunjai-800">
                  {auditData.roleMap["PHARMACIST"] || 0} คน
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                <span className="text-[10px] text-slate-500 font-bold block">เจ้าหน้าที่ (RECEPTIONIST)</span>
                <span className="text-xl font-bold font-mono text-chunjai-800">
                  {auditData.roleMap["RECEPTIONIST"] || 0} คน
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
