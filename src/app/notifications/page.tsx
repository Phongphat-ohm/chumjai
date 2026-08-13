"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  Bell,
  CheckCheck,
  RefreshCw,
  Package,
  Calendar,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  getNotificationsAction,
  markAsReadAction,
  markAllAsReadAction,
  generateSystemAlertsAction,
} from "@/server/actions/notification";

export default function NotificationCenterPage() {
  const [isPending, startTransition] = useTransition();

  const [activeTab, setActiveTab] = useState<"ALL" | "UNREAD" | "READ">("ALL");
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [systemAlertMessage, setSystemAlertMessage] = useState<string | null>(null);

  const fetchNotifications = () => {
    startTransition(async () => {
      const res = await getNotificationsAction();
      if (res.success && res.data) {
        setNotifications(res.data.notifications);
        setUnreadCount(res.data.unreadCount);
      }
    });
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleScanSystemAlerts = () => {
    setSystemAlertMessage(null);
    startTransition(async () => {
      const res = await generateSystemAlertsAction();
      if (res.success && res.data) {
        setSystemAlertMessage(
          `ประมวลผลระบบสำเร็จ! สร้างการแจ้งเตือนเพิ่มใหม่ ${res.data.createdCount} รายการ`
        );
        fetchNotifications();
        setTimeout(() => setSystemAlertMessage(null), 4000);
      }
    });
  };

  const handleMarkAsRead = (id: string) => {
    startTransition(async () => {
      await markAsReadAction(id);
      fetchNotifications();
    });
  };

  const handleMarkAllAsRead = () => {
    startTransition(async () => {
      await markAllAsReadAction();
      fetchNotifications();
    });
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "UNREAD") return !n.isRead;
    if (activeTab === "READ") return n.isRead;
    return true;
  });

  const lowStockCount = notifications.filter((n) => n.title.includes("ยาสต็อกต่ำ")).length;
  const appointmentCount = notifications.filter((n) => n.title.includes("นัดหมาย")).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-chunjai-600 text-white shadow-md">
              <Bell className="h-5 w-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-chunjai-950">
              ศูนย์การแจ้งเตือนคลินิก (Notification Center)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            ติดตามการแจ้งเตือนยาสต็อกต่ำ ยาใกล้หมดอายุ และการนัดหมายผู้ป่วยประจำวัน
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleScanSystemAlerts}
            disabled={isPending}
            className="text-xs font-bold text-chunjai-700 hover:bg-chunjai-50 border-chunjai-200"
          >
            <Sparkles className="mr-1.5 h-3.5 w-3.5 text-chunjai-600" />
            สแกนสร้างการแจ้งเตือนระบบ
          </Button>

          {unreadCount > 0 && (
            <Button
              onClick={handleMarkAllAsRead}
              disabled={isPending}
              size="sm"
              className="bg-chunjai-600 hover:bg-chunjai-700 text-white font-semibold text-xs shadow-xs"
            >
              <CheckCheck className="mr-1.5 h-4 w-4" />
              ทำเครื่องหมายอ่านแล้วทั้งหมด
            </Button>
          )}
        </div>
      </div>

      {systemAlertMessage && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 font-bold">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{systemAlertMessage}</span>
        </div>
      )}

      {/* KPI Overview Cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="border-chunjai-200 bg-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-slate-500 font-semibold">การแจ้งเตือนทั้งหมด</span>
              <div className="text-2xl font-bold text-chunjai-950 font-mono">
                {notifications.length} <span className="text-xs font-normal text-slate-500">รายการ</span>
              </div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-chunjai-50 text-chunjai-600">
              <Bell className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-rose-200 bg-rose-50/40">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-slate-500 font-semibold">ยังไม่ได้อ่าน</span>
              <div className="text-2xl font-bold text-rose-700 font-mono">
                {unreadCount} <span className="text-xs font-normal text-slate-500">รายการ</span>
              </div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
              <AlertCircle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-amber-50/40">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-slate-500 font-semibold">เตือนยาสต็อกต่ำ</span>
              <div className="text-2xl font-bold text-amber-700 font-mono">
                {lowStockCount} <span className="text-xs font-normal text-slate-500">รายการ</span>
              </div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <Package className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50/40">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-slate-500 font-semibold">เตือนนัดหมายผู้ป่วย</span>
              <div className="text-2xl font-bold text-blue-700 font-mono">
                {appointmentCount} <span className="text-xs font-normal text-slate-500">รายการ</span>
              </div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
              <Calendar className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab("ALL")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === "ALL"
              ? "bg-chunjai-600 text-white shadow-xs"
              : "bg-white text-slate-700 border border-slate-200 hover:bg-chunjai-50"
          }`}
        >
          ทั้งหมด ({notifications.length})
        </button>
        <button
          onClick={() => setActiveTab("UNREAD")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === "UNREAD"
              ? "bg-chunjai-600 text-white shadow-xs"
              : "bg-white text-slate-700 border border-slate-200 hover:bg-chunjai-50"
          }`}
        >
          ยังไม่ได้อ่าน ({unreadCount})
        </button>
        <button
          onClick={() => setActiveTab("READ")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === "READ"
              ? "bg-chunjai-600 text-white shadow-xs"
              : "bg-white text-slate-700 border border-slate-200 hover:bg-chunjai-50"
          }`}
        >
          อ่านแล้ว ({notifications.length - unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      <Card>
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-base font-bold text-chunjai-950 flex items-center gap-2">
            <Bell className="h-5 w-5 text-chunjai-600" />
            รายการแจ้งเตือนระบบ ({filteredNotifications.length} รายการ)
          </CardTitle>
          <CardDescription className="text-xs">
            เรียงลำดับจากเหตุการณ์ล่าสุด
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0 divide-y divide-slate-100">
          {isPending && notifications.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-chunjai-600" />
              <p className="text-xs font-medium">กำลังโหลดรายการแจ้งเตือน...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <Bell className="mx-auto h-10 w-10 text-slate-300" />
              <p className="text-sm font-semibold text-slate-700">ไม่พบรายการแจ้งเตือน</p>
            </div>
          ) : (
            filteredNotifications.map((n) => (
              <div
                key={n.id}
                className={`p-4 transition-colors flex items-start justify-between gap-4 text-xs ${
                  n.isRead ? "bg-white" : "bg-chunjai-50/40"
                }`}
              >
                <div className="flex gap-3 items-start">
                  <div className="mt-0.5 shrink-0">
                    {n.title.includes("ยาสต็อกต่ำ") ? (
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                        <Package className="h-4 w-4" />
                      </div>
                    ) : n.title.includes("นัดหมาย") ? (
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-chunjai-100 text-chunjai-700">
                        <Calendar className="h-4 w-4" />
                      </div>
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                        <AlertCircle className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${!n.isRead ? "text-chunjai-950 font-black text-sm" : "text-slate-900 text-sm"}`}>
                        {n.title}
                      </span>
                      {!n.isRead && (
                        <Badge variant="destructive" className="text-[9px]">
                          ยังไม่อ่าน
                        </Badge>
                      )}
                    </div>
                    <p className="text-slate-700 leading-relaxed">{n.message}</p>
                    <span className="text-[10px] text-slate-400 font-mono block pt-1">
                      {new Date(n.createdAt).toLocaleString("th-TH")}
                    </span>
                  </div>
                </div>

                {!n.isRead && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleMarkAsRead(n.id)}
                    className="h-8 text-xs text-chunjai-700 hover:bg-chunjai-50 shrink-0"
                  >
                    <CheckCheck className="mr-1 h-3.5 w-3.5" />
                    ทำเครื่องหมายอ่านแล้ว
                  </Button>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
