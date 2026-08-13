"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserRole } from "@prisma/client";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Clock,
  Stethoscope,
  UserCheck,
  Pill,
  Package,
  Calendar,
  Settings,
  X,
  ShieldAlert,
  Syringe,
  TestTube,
  Send,
  Bell,
  BarChart3,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  Folder,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  userRole?: UserRole;
}

export interface NavItemConfig {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  allowedRoles?: UserRole[];
}

export interface NavCategoryConfig {
  id: string;
  name: string;
  items: NavItemConfig[];
}

export const navigationCategories: NavCategoryConfig[] = [
  {
    id: "services",
    name: "บริการและจุดรับผู้ป่วย",
    items: [
      {
        name: "แดชบอร์ด",
        href: "/",
        icon: LayoutDashboard,
      },
      {
        name: "ลงทะเบียน",
        href: "/registration",
        icon: UserPlus,
      },
      {
        name: "ศูนย์คิว",
        href: "/queue",
        icon: Clock,
      },
      {
        name: "คัดกรอง",
        href: "/triage",
        icon: Stethoscope,
      },
      {
        name: "ห้องตรวจ",
        href: "/doctor",
        icon: UserCheck,
      },
    ],
  },
  {
    id: "medical",
    name: "งานการแพทย์และแล็บ",
    items: [
      {
        name: "ผู้ป่วย",
        href: "/patient",
        icon: Users,
      },
      {
        name: "แล็บ/ชันสูตร",
        href: "/lab",
        icon: TestTube,
      },
      {
        name: "ห้องยา",
        href: "/pharmacy",
        icon: Pill,
      },
      {
        name: "คลังยา",
        href: "/inventory",
        icon: Package,
      },
      {
        name: "นัดหมาย",
        href: "/appointment",
        icon: Calendar,
      },
      {
        name: "วัคซีน",
        href: "/vaccination",
        icon: Syringe,
      },
      {
        name: "ส่งต่อผู้ป่วย",
        href: "/referral",
        icon: Send,
      },
    ],
  },
  {
    id: "management",
    name: "การบริหารงานและระบบ",
    items: [
      {
        name: "โปรไฟล์ส่วนตัว",
        href: "/profile",
        icon: User,
      },
      {
        name: "การแจ้งเตือน",
        href: "/notifications",
        icon: Bell,
      },
      {
        name: "รายงาน/วิเคราะห์",
        href: "/reports",
        icon: BarChart3,
      },
      {
        name: "จัดการผู้ใช้งาน",
        href: "/users",
        icon: Users,
        allowedRoles: ["ADMIN"],
      },
      {
        name: "ตั้งค่าคลินิก",
        href: "/settings",
        icon: Settings,
        allowedRoles: ["ADMIN"],
      },
      {
        name: "ความปลอดภัย",
        href: "/security",
        icon: ShieldCheck,
        allowedRoles: ["ADMIN"],
      },
      {
        name: "Audit Log",
        href: "/audit-log",
        icon: Settings,
        allowedRoles: ["ADMIN"],
      },
    ],
  },
];

export function Sidebar({ isOpen = false, onClose, userRole }: SidebarProps) {
  const pathname = usePathname();

  // Collapsible category state (all open by default)
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  const toggleCategory = (catId: string) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed bottom-0 top-16 z-40 flex w-64 shrink-0 flex-col border-r border-chunjai-100 bg-white transition-transform duration-300 md:static md:h-full md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Mobile Header Close Button */}
        <div className="flex items-center justify-between border-b border-chunjai-100 px-4 py-3 md:hidden">
          <span className="text-sm font-semibold text-chunjai-900">
            เมนูหลัก ชุมใจ
          </span>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation Categories List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {navigationCategories.map((category) => {
            const isCollapsed = !!collapsedCategories[category.id];

            // Filter items by role (Least Privilege)
            const allowedItems = category.items.filter((item) => {
              if (!item.allowedRoles) return true;
              if (!userRole) return true;
              return item.allowedRoles.includes(userRole);
            });

            if (allowedItems.length === 0) return null;

            return (
              <div key={category.id} className="space-y-1">
                {/* Category Header (Clickable to Show/Hide) */}
                <button
                  type="button"
                  onClick={() => toggleCategory(category.id)}
                  className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 hover:text-chunjai-700 transition-colors group"
                >
                  <span className="flex items-center gap-1.5">
                    <Folder className="h-3.5 w-3.5 text-chunjai-600" />
                    {category.name}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-normal text-slate-400 font-mono">
                      ({allowedItems.length})
                    </span>
                    {isCollapsed ? (
                      <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-chunjai-600 transition-colors" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5 text-slate-400 group-hover:text-chunjai-600 transition-colors" />
                    )}
                  </div>
                </button>

                {/* Category Items List (Show/Hide) */}
                {!isCollapsed && (
                  <nav className="space-y-1 pl-1">
                    {allowedItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname === item.href;

                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={onClose}
                          className={cn(
                            "group flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold transition-all duration-150",
                            isActive
                              ? "bg-chunjai-600 text-white shadow-sm shadow-chunjai-500/20"
                              : "text-slate-700 hover:bg-chunjai-50 hover:text-chunjai-900"
                          )}
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon
                              className={cn(
                                "h-4 w-4 transition-colors",
                                isActive
                                  ? "text-white"
                                  : "text-chunjai-600 group-hover:text-chunjai-700"
                              )}
                            />
                            <span>{item.name}</span>
                          </div>
                          {item.badge && (
                            <span
                              className={cn(
                                "rounded-full px-2 py-0.5 text-[10px] font-bold",
                                isActive
                                  ? "bg-white/20 text-white"
                                  : "bg-chunjai-100 text-chunjai-800"
                              )}
                            >
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </nav>
                )}
              </div>
            );
          })}
        </div>

        {/* Sidebar Footer Info */}
        <div className="border-t border-chunjai-100 p-4 bg-chunjai-50/50">
          <div className="flex items-center gap-2 rounded-lg border border-chunjai-100 bg-white p-2.5 shadow-xs">
            <ShieldAlert className="h-5 w-5 text-chunjai-600 shrink-0" />
            <div className="text-[11px] leading-tight text-slate-600">
              <span className="font-semibold text-chunjai-900 block">
                ระบบรักษาความปลอดภัย
              </span>
              Least Privilege & Ownership Active
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
