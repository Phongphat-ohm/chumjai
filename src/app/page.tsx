"use client";

import React, { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import {
  HeartPulse,
  Users,
  UserPlus,
  Clock,
  Stethoscope,
  UserCheck,
  Pill,
  Package,
  Calendar,
  Syringe,
  TestTube,
  Send,
  Bell,
  BarChart3,
  ShieldCheck,
  Settings,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getVisitsAction } from "@/server/actions/visit";
import { getClinicSettingsAction } from "@/server/actions/settings";

export default function ChunjaiDashboardPage() {
  const [isPending, startTransition] = useTransition();

  const [recentVisits, setRecentVisits] = useState<any[]>([]);
  const [clinicName, setClinicName] = useState("ชุมใจคลินิกเวชกรรม (Chunjai)");

  const fetchDashboardData = () => {
    startTransition(async () => {
      const [visitsRes, settingsRes] = await Promise.all([
        getVisitsAction({ limit: 10 }),
        getClinicSettingsAction(),
      ]);

      if (visitsRes.success && visitsRes.data) {
        setRecentVisits(visitsRes.data);
      }

      if (settingsRes.success && settingsRes.data?.CLINIC_NAME) {
        setClinicName(settingsRes.data.CLINIC_NAME);
      }
    });
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const totalVisitsToday = recentVisits.length;
  const waitingTriage = recentVisits.filter((v) => v.status === "REGISTERED").length;
  const waitingDoctor = recentVisits.filter((v) => v.status === "TRIAGED").length;
  const waitingPharmacy = recentVisits.filter((v) => v.status === "PRESCRIBED").length;
  const completedCount = recentVisits.filter((v) => v.status === "DISPENSED").length;

  const stationShortcuts = [
    { name: "ลงทะเบียนผู้ป่วย", href: "/registration", icon: UserPlus, desc: "รับผู้ป่วยใหม่/เปิด Visit", color: "bg-blue-50 text-blue-700 border-blue-200" },
    { name: "ศูนย์บริการคิว", href: "/queue", icon: Clock, desc: "จัดการคิว & จอมอนิเตอร์", color: "bg-sky-50 text-sky-700 border-sky-200" },
    { name: "คัดกรองสัญญาณชีพ", href: "/triage", icon: Stethoscope, desc: "บันทึก Vitals & BMI", color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
    { name: "ห้องตรวจแพทย์", href: "/doctor", icon: UserCheck, desc: "ตรวจ SOAP & ICD-10", color: "bg-chunjai-50 text-chunjai-700 border-chunjai-200" },
    { name: "แล็บ & ชันสูตร", href: "/lab", icon: TestTube, desc: "สั่งแล็บ & ลงผลตรวจ", color: "bg-cyan-50 text-cyan-700 border-cyan-200" },
    { name: "ห้องจ่ายยา", href: "/pharmacy", icon: Pill, desc: "จัดยา & พิมพ์ฉลากยา", color: "bg-teal-50 text-teal-700 border-teal-200" },
    { name: "คลังยา & สต็อก", href: "/inventory", icon: Package, desc: "บริหารคลัง & FEFO", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    { name: "นัดหมายติดตาม", href: "/appointment", icon: Calendar, desc: "นัดตรวจ & พิมพ์ใบนัด", color: "bg-amber-50 text-amber-700 border-amber-200" },
    { name: "ประวัติรับวัคซีน", href: "/vaccination", icon: Syringe, desc: "บันทึกวัคซีน & พิมพ์การ์ด", color: "bg-rose-50 text-rose-700 border-rose-200" },
    { name: "ส่งต่อผู้ป่วย", href: "/referral", icon: Send, desc: "ออกหนังสือส่งตัว รพ.", color: "bg-purple-50 text-purple-700 border-purple-200" },
    { name: "การแจ้งเตือน", href: "/notifications", icon: Bell, desc: "เตือนสต็อก & นัดหมาย", color: "bg-orange-50 text-orange-700 border-orange-200" },
    { name: "รายงาน & สถิติ", href: "/reports", icon: BarChart3, desc: " Top 10 ICD-10 & สิทธิ", color: "bg-slate-100 text-slate-800 border-slate-200" },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-fade-in">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-chunjai-900 via-chunjai-800 to-chunjai-600 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-2">
            <Badge className="bg-white/20 text-white hover:bg-white/30 backdrop-blur border-none font-semibold px-3 py-1">
              <Sparkles className="mr-1.5 h-3.5 w-3.5 text-amber-300" />
              Smart Health Tracking & Clinic Management
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            {clinicName}
          </h1>
          <p className="text-xs sm:text-sm text-chunjai-100 max-w-2xl leading-relaxed">
            ระบบบริหารจัดการคลินิกชุมชนอัจฉริยะแบบครบวงจร บริการรวดเร็ว คุ้มครองข้อมูล PDPA และยกระดับสุขภาพประชาชนระยะยาว
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Button
              asChild
              className="bg-white text-chunjai-900 hover:bg-chunjai-50 font-bold text-xs shadow-md"
            >
              <Link href="/registration">
                <UserPlus className="mr-1.5 h-4 w-4" />
                ลงทะเบียนรับบริการผู้ป่วย
              </Link>
            </Button>
            <Button
              asChild
              className="bg-chunjai-700 hover:bg-chunjai-800 text-white font-bold text-xs border border-white/40 shadow-sm"
            >
              <Link href="/queue">
                <Clock className="mr-1.5 h-4 w-4 text-white" />
                ดูสถานะคิวบริการ
              </Link>
            </Button>
          </div>
        </div>

        {/* Decorative Background Icon */}
        <HeartPulse className="absolute -right-8 -bottom-10 h-64 w-64 text-white/10 pointer-events-none" />
      </div>

      {/* Realtime KPI Overview Cards */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
        <Card className="border-chunjai-100 shadow-xs hover:shadow-md transition-shadow">
          <CardContent className="p-4 space-y-1">
            <span className="text-xs text-slate-500 font-semibold block">ผู้ป่วยเข้ารับบริการวันนี้</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono text-chunjai-950">
                {totalVisitsToday} <span className="text-xs font-normal text-slate-500">ราย</span>
              </span>
              <Badge variant="secondary" className="text-[10px]">เรียลไทม์</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-indigo-100 bg-indigo-50/30 shadow-xs hover:shadow-md transition-shadow">
          <CardContent className="p-4 space-y-1">
            <span className="text-xs text-slate-500 font-semibold block">รอแพทย์ตรวจ</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono text-indigo-700">
                {waitingDoctor} <span className="text-xs font-normal text-slate-500">ราย</span>
              </span>
              <Badge variant="outline" className="text-[10px] border-indigo-300 text-indigo-700">ห้องตรวจ</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-teal-100 bg-teal-50/30 shadow-xs hover:shadow-md transition-shadow">
          <CardContent className="p-4 space-y-1">
            <span className="text-xs text-slate-500 font-semibold block">รอห้องจ่ายยา</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono text-teal-700">
                {waitingPharmacy} <span className="text-xs font-normal text-slate-500">ราย</span>
              </span>
              <Badge variant="outline" className="text-[10px] border-teal-300 text-teal-700">ห้องยา</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-100 bg-emerald-50/30 shadow-xs hover:shadow-md transition-shadow">
          <CardContent className="p-4 space-y-1">
            <span className="text-xs text-slate-500 font-semibold block">บริการเสร็จสมบูรณ์</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono text-emerald-700">
                {completedCount} <span className="text-xs font-normal text-slate-500">ราย</span>
              </span>
              <Badge variant="success" className="text-[10px]">เรียบร้อย</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Station Modules Quick Access Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-chunjai-950 flex items-center gap-2">
            <HeartPulse className="h-5 w-5 text-chunjai-600" />
            จุดบริการและโมดูลการทำงาน (Station Modules)
          </h2>
          <span className="text-xs text-slate-500">เลือกเข้าสู่จุดบริการย่อย</span>
        </div>

        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {stationShortcuts.map((st) => {
            const Icon = st.icon;
            return (
              <Link
                key={st.name}
                href={st.href}
                className="group relative rounded-xl border bg-white p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg border ${st.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-chunjai-600" />
                </div>
                <div className="mt-3 space-y-0.5">
                  <h3 className="font-bold text-slate-900 text-sm group-hover:text-chunjai-700 transition-colors">
                    {st.name}
                  </h3>
                  <p className="text-[11px] text-slate-500">{st.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Patient Visits Table */}
      <Card>
        <CardHeader className="pb-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-bold text-chunjai-950 flex items-center gap-2">
              <Users className="h-5 w-5 text-chunjai-600" />
              รายการผู้ป่วยรับบริการล่าสุด (Recent Patient Visits)
            </CardTitle>
            <CardDescription className="text-xs">
              ผู้ป่วยที่เปิด Visit เข้ารับบริการในคลินิกชุมใจ
            </CardDescription>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchDashboardData()}
            className="text-xs font-semibold"
          >
            <RefreshCw className="mr-1.5 h-3.5 w-3.5 text-chunjai-600" />
            รีเฟรชรายการ
          </Button>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          {isPending && recentVisits.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-chunjai-600" />
              <p className="text-xs font-medium">กำลังโหลดรายการผู้ป่วย...</p>
            </div>
          ) : recentVisits.length === 0 ? (
            <div className="p-12 text-center text-slate-400">ยังไม่มีประวัติการเข้ารับบริการในระบบ</div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3">วัน-เวลา</th>
                  <th className="px-6 py-3">Visit No.</th>
                  <th className="px-6 py-3">HN / ชื่อผู้ป่วย</th>
                  <th className="px-6 py-3">สถานะขั้นตอน</th>
                  <th className="px-6 py-3 text-right">การกระทำ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {recentVisits.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-mono text-slate-600 text-[11px]">
                      {new Date(v.createdAt).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-chunjai-700">
                      {v.visitNumber}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-900 block">
                        {v.patient?.firstName} {v.patient?.lastName}
                      </span>
                      <span className="text-[11px] text-chunjai-600 font-mono">
                        HN: {v.patient?.hn}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {v.status === "REGISTERED" && <Badge variant="secondary" className="text-[10px]">รอคัดกรอง</Badge>}
                      {v.status === "TRIAGED" && <Badge variant="warning" className="text-[10px]">รอห้องตรวจ</Badge>}
                      {v.status === "PRESCRIBED" && <Badge variant="outline" className="text-[10px] border-teal-400 text-teal-700">รอห้องยา</Badge>}
                      {v.status === "DISPENSED" && <Badge variant="success" className="text-[10px]">รับยาเรียบร้อย</Badge>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        asChild
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs text-chunjai-700"
                      >
                        <Link href={`/patient/${v.patientId}`}>
                          ดูประวัติผู้ป่วย
                        </Link>
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
  );
}
