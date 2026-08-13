"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  HeartPulse,
  User,
  Search,
  ShieldCheck,
  Menu,
  LogOut,
  X,
  Loader2,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { logoutAction } from "@/server/actions/auth";
import { getPatientsAction } from "@/server/actions/patient";
import { NotificationDropdown } from "@/components/layout/NotificationDropdown";

interface HeaderProps {
  userSession?: {
    fullName: string;
    role: string;
    username: string;
  } | null;
  onToggleSidebar?: () => void;
}

export function Header({ userSession, onToggleSidebar }: HeaderProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleLogout = () => {
    startTransition(async () => {
      const res = await logoutAction();
      if (res.success) {
        window.location.href = "/login";
      }
    });
  };

  const handleSearchChange = async (q: string) => {
    setSearchQuery(q);
    if (!q.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    setShowResults(true);

    try {
      const res = await getPatientsAction({ search: q, limit: 5 });
      if (res.success && res.data) {
        setSearchResults(res.data.patients);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowResults(false);
      router.push(`/patient?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case "ADMIN":
        return "ผู้ดูแลระบบ";
      case "DOCTOR":
        return "แพทย์";
      case "NURSE":
        return "พยาบาล";
      case "RECEPTIONIST":
        return "เจ้าหน้าที่ลงทะเบียน";
      case "PHARMACIST":
        return "เภสัชกร";
      case "PATIENT":
        return "ผู้ป่วย";
      default:
        return "เจ้าหน้าที่คลินิก";
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-chunjai-100 bg-white/95 px-4 shadow-sm backdrop-blur md:px-6">
      {/* Left: Mobile Toggle & Brand Logo */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-chunjai-700"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="flex items-center gap-2.5">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-chunjai-600 text-white shadow-md shadow-chunjai-500/20 group-hover:bg-chunjai-700 transition-colors">
              <HeartPulse className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-chunjai-950">
                  ชุมใจ
                </span>
                <span className="text-xs font-semibold text-chunjai-600">
                  (Chunjai)
                </span>
                <Badge variant="secondary" className="hidden sm:inline-flex text-[10px]">
                  <ShieldCheck className="mr-1 h-3 w-3 text-chunjai-600" />
                  Smart Clinic
                </Badge>
              </div>
              <p className="hidden text-xs text-slate-500 sm:block">
                Community Clinic & Smart Health Tracking System
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* Right: Active Header Search, Notifications, User Profile & Logout */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Active Global Navbar Search Input */}
        <div className="relative hidden md:block">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => {
                if (searchQuery.trim() && searchResults.length > 0) setShowResults(true);
              }}
              placeholder="ค้นหาผู้ป่วย / HN / เบอร์โทร..."
              className="h-10 w-72 rounded-lg border border-chunjai-200 bg-slate-50/80 pl-9 pr-8 text-xs text-slate-900 transition-all focus:border-chunjai-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-chunjai-100 font-medium"
            />

            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSearchResults([]);
                  setShowResults(false);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </form>

          {/* Search Dropdown Results Popover */}
          {showResults && (
            <div className="absolute left-0 right-0 top-12 z-50 rounded-xl border border-chunjai-100 bg-white p-2 shadow-xl space-y-1 max-h-80 overflow-y-auto">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between border-b border-slate-100">
                <span>ผลการค้นหาผู้ป่วย</span>
                {isSearching && <Loader2 className="h-3 w-3 animate-spin text-chunjai-600" />}
              </div>

              {searchResults.length === 0 && !isSearching ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  ไม่พบข้อมูลผู้ป่วยที่ตรงกัน
                </div>
              ) : (
                searchResults.map((patient) => (
                  <Link
                    key={patient.id}
                    href={`/patient/${patient.id}`}
                    onClick={() => setShowResults(false)}
                    className="flex items-center justify-between p-2.5 rounded-lg hover:bg-chunjai-50 transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-chunjai-100 text-chunjai-700 font-bold text-xs">
                        <Users className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <span className="font-bold text-xs text-slate-900 group-hover:text-chunjai-700 block">
                          {patient.firstName} {patient.lastName}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {patient.phoneNumber || "ไม่มีเบอร์โทร"}
                        </span>
                      </div>
                    </div>
                    <span className="font-mono text-xs font-bold text-chunjai-600 bg-chunjai-50 px-2 py-0.5 rounded border border-chunjai-200">
                      {patient.hn}
                    </span>
                  </Link>
                ))
              )}
            </div>
          )}
        </div>

        {/* Notifications Dropdown Component */}
        <NotificationDropdown />

        {/* User Profile Info */}
        <div className="flex items-center gap-2 border-l border-chunjai-100 pl-3 sm:pl-4">
          <Link href="/profile" className="hidden text-right text-xs md:block hover:underline">
            <p className="font-semibold text-chunjai-950">
              {userSession?.fullName || "เจ้าหน้าที่คลินิก"}
            </p>
            <p className="text-[11px] text-chunjai-600">
              {getRoleLabel(userSession?.role)}
            </p>
          </Link>
          <Link
            href="/profile"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-chunjai-100 text-chunjai-700 font-bold border border-chunjai-200 hover:bg-chunjai-200 transition-colors"
            title="ตั้งค่าข้อมูลส่วนตัว"
          >
            <User className="h-5 w-5" />
          </Link>

          {/* Logout Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            disabled={isPending}
            className="text-slate-500 hover:text-rose-600 hover:bg-rose-50 ml-1"
            title="ออกจากระบบ"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
