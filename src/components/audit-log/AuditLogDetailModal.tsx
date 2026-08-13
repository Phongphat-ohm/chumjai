"use client";

import React from "react";
import { ShieldCheck, X, User, Clock, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AuditLogDetailModalProps {
  isOpen: boolean;
  log: {
    id: string;
    action: string;
    resourceType: string;
    resourceId?: string;
    ipAddress?: string;
    userAgent?: string;
    success: boolean;
    timestamp: string;
    user?: {
      fullName: string;
      username: string;
      role: string;
    };
  } | null;
  onClose: () => void;
}

export function AuditLogDetailModal({
  isOpen,
  log,
  onClose,
}: AuditLogDetailModalProps) {
  if (!isOpen || !log) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-lg rounded-xl bg-white shadow-2xl border border-chunjai-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-chunjai-100 px-6 py-4 bg-chunjai-50/60 rounded-t-xl">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-chunjai-600 text-white">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-chunjai-950">
                รายละเอียดบันทึก Audit Log (PDPA Event)
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                Log ID: {log.id}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Log Metadata Body */}
        <div className="p-6 space-y-4 text-xs">
          <div className="flex items-center justify-between p-3 rounded-lg border border-chunjai-100 bg-chunjai-50/40">
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold">
                สถานะผลลัพธ์
              </span>
              {log.success ? (
                <span className="font-bold text-emerald-600 flex items-center gap-1 text-sm">
                  <CheckCircle2 className="h-4 w-4" /> ดำเนินการสำเร็จ (Success)
                </span>
              ) : (
                <span className="font-bold text-rose-600 flex items-center gap-1 text-sm">
                  <AlertCircle className="h-4 w-4" /> ล้มเหลว / ถูกปฏิเสธ (Failed)
                </span>
              )}
            </div>
            <Badge variant="outline" className="font-mono text-xs">
              {log.action}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-3">
            <div>
              <span className="text-slate-500 font-semibold block">ผู้ใช้งานทำรายการ:</span>
              <span className="font-bold text-slate-900 block text-sm">
                {log.user?.fullName || "ระบบอัตโนมัติ / Anonymous"}
              </span>
              {log.user && (
                <span className="text-[11px] text-chunjai-600 font-mono">
                  (@{log.user.username}) · {log.user.role}
                </span>
              )}
            </div>

            <div>
              <span className="text-slate-500 font-semibold block">วันและเวลาที่บันทึก:</span>
              <span className="font-bold text-slate-900 font-mono block text-sm">
                {new Date(log.timestamp).toLocaleString("th-TH")}
              </span>
            </div>
          </div>

          <div className="space-y-2 border-t border-slate-100 pt-3">
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold">ประเภททรัพยากร (Resource):</span>
              <span className="font-bold text-slate-900 font-mono">{log.resourceType}</span>
            </div>

            {log.resourceId && (
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">รหัสอ้างอิง (Resource ID):</span>
                <span className="font-mono text-chunjai-700 font-bold">{log.resourceId}</span>
              </div>
            )}

            {log.ipAddress && (
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">IP Address:</span>
                <span className="font-mono text-slate-700">{log.ipAddress}</span>
              </div>
            )}
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
            <span className="text-[10px] text-slate-500 font-bold block">
              หมายเหตุการกำกับดูแลตามกฎหมาย (PDPA Compliance Note)
            </span>
            <p className="text-[11px] text-slate-600">
              บันทึกนี้เป็นข้อมูลประวัติถาวร (Immutable Audit Log) ไม่สามารถแก้ไขหรือลบย้อนหลังได้ ถูกจัดเก็บไว้เพื่อวัตถุประสงค์ในการตรวจสอบการเข้าถึงข้อมูลสุขภาพส่วนบุคคลตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล (PDPA)
            </p>
          </div>

          <div className="flex items-center justify-end pt-2">
            <Button onClick={onClose} className="bg-chunjai-600 text-white font-semibold">
              ปิดหน้าต่าง
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
