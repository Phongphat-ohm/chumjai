"use client";

import React, { useState, useEffect, useTransition, useRef } from "react";
import { Bell, CheckCheck, Loader2, AlertCircle, Calendar, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  getNotificationsAction,
  markAsReadAction,
  markAllAsReadAction,
} from "@/server/actions/notification";
import Link from "next/link";

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
    const interval = setInterval(fetchNotifications, 30000); // Polling every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchNotifications();
        }}
        className="relative h-9 w-9 text-slate-600 hover:text-chunjai-700 hover:bg-chunjai-50"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-xs">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-11 z-50 w-80 sm:w-96 rounded-xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 bg-slate-50/80">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-chunjai-600" />
              <span className="font-bold text-xs text-chunjai-950">การแจ้งเตือน (Notifications)</span>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="text-[10px] h-4 px-1.5">
                  {unreadCount} ใหม่
                </Badge>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                disabled={isPending}
                className="text-[11px] font-bold text-chunjai-600 hover:text-chunjai-800 flex items-center gap-1"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                อ่านแล้วทั้งหมด
              </button>
            )}
          </div>

          {/* Body List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 text-xs">
            {isPending && notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <Loader2 className="mx-auto h-5 w-5 animate-spin text-chunjai-600" />
                <p className="mt-1 text-[11px]">กำลังโหลดการแจ้งเตือน...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <p className="text-xs">ไม่มีรายการแจ้งเตือนใหม่</p>
              </div>
            ) : (
              notifications.slice(0, 10).map((n) => (
                <div
                  key={n.id}
                  onClick={() => !n.isRead && handleMarkAsRead(n.id)}
                  className={`p-3 transition-colors cursor-pointer flex gap-3 items-start ${
                    n.isRead ? "bg-white hover:bg-slate-50/60" : "bg-chunjai-50/50 hover:bg-chunjai-50"
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {n.title.includes("ยาสต็อกต่ำ") ? (
                      <Package className="h-4 w-4 text-amber-600" />
                    ) : n.title.includes("นัดหมาย") ? (
                      <Calendar className="h-4 w-4 text-chunjai-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-blue-600" />
                    )}
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <div className="flex justify-between items-baseline">
                      <span className={`font-bold text-slate-900 ${!n.isRead ? "text-chunjai-950 font-black" : ""}`}>
                        {n.title}
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono">
                        {new Date(n.createdAt).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 line-clamp-2">{n.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Link */}
          <div className="border-t border-slate-100 p-2 text-center bg-slate-50">
            <Link
              href="/notifications"
              onClick={() => setIsOpen(false)}
              className="text-xs font-bold text-chunjai-600 hover:text-chunjai-800 block py-1"
            >
              ดูการแจ้งเตือนทั้งหมด ({notifications.length} รายการ) →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
