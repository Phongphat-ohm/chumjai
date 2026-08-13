"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  Send,
  Plus,
  Search,
  Printer,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Clock,
  Building2,
  RefreshCw,
  Eye,
  Check,
  XCircle,
} from "lucide-react";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getReferralsAction, updateReferralStatusAction } from "@/server/actions/referral";
import { CreateReferralModal } from "@/components/referral/CreateReferralModal";
import { ReferralStatus } from "@/generated/client";

const ReferralLetterModal = dynamic(
  () => import("@/components/referral/ReferralLetterModal").then((mod) => mod.ReferralLetterModal),
  { ssr: false }
);

export default function ReferralHubPage() {
  const [isPending, startTransition] = useTransition();

  const [activeTab, setActiveTab] = useState<ReferralStatus | "ALL">("ALL");
  const [referrals, setReferrals] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedReferral, setSelectedReferral] = useState<any | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLetterModalOpen, setIsLetterModalOpen] = useState(false);

  const fetchReferrals = () => {
    startTransition(async () => {
      const res = await getReferralsAction();
      if (res.success && res.data) {
        setReferrals(res.data);
      }
    });
  };

  useEffect(() => {
    fetchReferrals();
  }, []);

  const handleStatusChange = (referralId: string, status: ReferralStatus) => {
    startTransition(async () => {
      const res = await updateReferralStatusAction(referralId, status);
      if (res.success) {
        fetchReferrals();
      }
    });
  };

  const filteredReferrals = referrals.filter((r) => {
    if (activeTab !== "ALL" && r.status !== activeTab) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.patient?.firstName.toLowerCase().includes(q) ||
      r.patient?.lastName.toLowerCase().includes(q) ||
      r.patient?.hn.toLowerCase().includes(q) ||
      r.hospitalName.toLowerCase().includes(q)
    );
  });

  const pendingCount = referrals.filter((r) => r.status === ReferralStatus.PENDING).length;
  const acceptedCount = referrals.filter((r) => r.status === ReferralStatus.ACCEPTED).length;
  const completedCount = referrals.filter((r) => r.status === ReferralStatus.COMPLETED).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-chunjai-600 text-white shadow-md">
              <Send className="h-5 w-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-chunjai-950">
              ศูนย์การส่งต่อผู้ป่วย (Referral Center Station)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            ออกหนังสือส่งตัว ติดตามสถานะโรงพยาบาลปลายทาง และพิมพ์เอกสารส่งตัวผู้ป่วย
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchReferrals()}
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
            ออกหนังสือส่งตัวใหม่
          </Button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-amber-200 bg-amber-50/40">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-slate-500 font-semibold">รอส่งตัว (Pending)</span>
              <div className="text-2xl font-bold text-amber-700 font-mono">
                {pendingCount} <span className="text-xs font-normal text-slate-500">ราย</span>
              </div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50/40">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-slate-500 font-semibold">ปลายทางรับเรื่องแล้ว</span>
              <div className="text-2xl font-bold text-blue-700 font-mono">
                {acceptedCount} <span className="text-xs font-normal text-slate-500">ราย</span>
              </div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
              <Building2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 bg-emerald-50/40">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-slate-500 font-semibold">ส่งตัวเสร็จสมบูรณ์</span>
              <div className="text-2xl font-bold text-emerald-700 font-mono">
                {completedCount} <span className="text-xs font-normal text-slate-500">ราย</span>
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
            ทั้งหมด ({referrals.length})
          </button>
          <button
            onClick={() => setActiveTab(ReferralStatus.PENDING)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === ReferralStatus.PENDING
                ? "bg-chunjai-600 text-white shadow-xs"
                : "bg-white text-slate-700 border border-slate-200 hover:bg-chunjai-50"
            }`}
          >
            รอส่งตัว ({pendingCount})
          </button>
          <button
            onClick={() => setActiveTab(ReferralStatus.ACCEPTED)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === ReferralStatus.ACCEPTED
                ? "bg-chunjai-600 text-white shadow-xs"
                : "bg-white text-slate-700 border border-slate-200 hover:bg-chunjai-50"
            }`}
          >
            รับเรื่องแล้ว ({acceptedCount})
          </button>
          <button
            onClick={() => setActiveTab(ReferralStatus.COMPLETED)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === ReferralStatus.COMPLETED
                ? "bg-chunjai-600 text-white shadow-xs"
                : "bg-white text-slate-700 border border-slate-200 hover:bg-chunjai-50"
            }`}
          >
            เสร็จสมบูรณ์ ({completedCount})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหา HN, ชื่อผู้ป่วย, รพ. ปลายทาง..."
            className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-xs focus:border-chunjai-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Referrals Table */}
      <Card>
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-base font-bold text-chunjai-950 flex items-center gap-2">
            <Send className="h-5 w-5 text-chunjai-600" />
            รายการหนังสือส่งตัวผู้ป่วยทั้งหมด ({filteredReferrals.length} รายการ)
          </CardTitle>
          <CardDescription className="text-xs">
            เรียงลำดับจากใบส่งตัวล่าสุด
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          {isPending && referrals.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-chunjai-600" />
              <p className="text-xs font-medium">กำลังโหลดรายการส่งตัว...</p>
            </div>
          ) : filteredReferrals.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <Send className="mx-auto h-10 w-10 text-slate-300" />
              <p className="text-sm font-semibold text-slate-700">ไม่พบรายการออกหนังสือส่งตัว</p>
              <p className="text-xs">กดปุ่ม "ออกหนังสือส่งตัวใหม่" ด้านบนเพื่อเริ่มกระบวนการส่งต่อ</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3">วัน-เวลา ออกใบส่งตัว</th>
                  <th className="px-6 py-3">HN / ชื่อผู้ป่วย</th>
                  <th className="px-6 py-3">โรงพยาบาลปลายทาง</th>
                  <th className="px-6 py-3">เหตุผลการส่งตัว</th>
                  <th className="px-6 py-3">สถานะ</th>
                  <th className="px-6 py-3 text-right">การกระทำ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredReferrals.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-mono text-slate-600 text-[11px]">
                      {new Date(r.createdAt).toLocaleString("th-TH")}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-900 block">
                        {r.patient?.firstName} {r.patient?.lastName}
                      </span>
                      <span className="text-[11px] text-chunjai-600 font-mono">
                        HN: {r.patient?.hn}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-chunjai-950">
                      {r.hospitalName}
                    </td>
                    <td className="px-6 py-4 text-slate-700 max-w-xs truncate">
                      {r.reason}
                    </td>
                    <td className="px-6 py-4">
                      {r.status === ReferralStatus.PENDING && (
                        <Badge variant="warning" className="text-[10px]">
                          รอส่งตัว
                        </Badge>
                      )}
                      {r.status === ReferralStatus.ACCEPTED && (
                        <Badge variant="secondary" className="text-[10px]">
                          รับเรื่องแล้ว
                        </Badge>
                      )}
                      {r.status === ReferralStatus.COMPLETED && (
                        <Badge variant="success" className="text-[10px]">
                          ส่งตัวเสร็จสิ้น
                        </Badge>
                      )}
                      {r.status === ReferralStatus.CANCELLED && (
                        <Badge variant="destructive" className="text-[10px]">
                          ยกเลิก
                        </Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {r.status === ReferralStatus.PENDING && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange(r.id, ReferralStatus.ACCEPTED)}
                          className="h-8 text-xs text-blue-700 hover:bg-blue-50"
                        >
                          <Check className="mr-1 h-3.5 w-3.5" />
                          ปลายทางรับเรื่อง
                        </Button>
                      )}

                      {r.status === ReferralStatus.ACCEPTED && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange(r.id, ReferralStatus.COMPLETED)}
                          className="h-8 text-xs text-emerald-700 hover:bg-emerald-50"
                        >
                          <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                          จบขั้นตอนส่งตัว
                        </Button>
                      )}

                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedReferral(r);
                          setIsLetterModalOpen(true);
                        }}
                        className="h-8 bg-chunjai-600 hover:bg-chunjai-700 text-white font-semibold text-xs shadow-xs"
                      >
                        <Printer className="mr-1 h-3.5 w-3.5" />
                        หนังสือส่งตัว
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <CreateReferralModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => fetchReferrals()}
      />

      <ReferralLetterModal
        isOpen={isLetterModalOpen}
        referral={selectedReferral}
        onClose={() => {
          setIsLetterModalOpen(false);
          setSelectedReferral(null);
        }}
      />
    </div>
  );
}
