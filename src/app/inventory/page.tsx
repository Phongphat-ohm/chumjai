"use client";

import React, { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import {
  Package,
  PackagePlus,
  AlertTriangle,
  Clock,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileSpreadsheet,
  ArrowDownRight,
  ArrowUpRight,
  RefreshCw,
  Pill,
  ShieldAlert,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getInventoryOverviewAction } from "@/server/actions/inventory";
import { DrugFormDialog } from "@/components/inventory/DrugFormDialog";
import { StockInDialog } from "@/components/inventory/StockInDialog";

export default function DrugInventoryPage() {
  const [activeTab, setActiveTab] = useState<"CATALOG" | "BATCHES" | "LOGS">("CATALOG");
  const [isPending, startTransition] = useTransition();

  const [drugs, setDrugs] = useState<any[]>([]);
  const [lowStockDrugs, setLowStockDrugs] = useState<any[]>([]);
  const [expiringBatches, setExpiringBatches] = useState<any[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [isDrugModalOpen, setIsDrugModalOpen] = useState(false);
  const [isStockInModalOpen, setIsStockInModalOpen] = useState(false);

  const fetchOverview = () => {
    startTransition(async () => {
      const res = await getInventoryOverviewAction();
      if (res.success && res.data) {
        setDrugs(res.data.drugs);
        setLowStockDrugs(res.data.lowStockDrugs);
        setExpiringBatches(res.data.expiringBatches);
        setRecentTransactions(res.data.recentTransactions);
      }
    });
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  // Filtered drugs by search query
  const filteredDrugs = drugs.filter((d) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      d.code.toLowerCase().includes(q) ||
      d.genericName.toLowerCase().includes(q) ||
      (d.tradeName && d.tradeName.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-chunjai-600 text-white shadow-md">
              <Package className="h-5 w-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-chunjai-950">
              ระบบบริหารจัดการคลังยาและเวชภัณฑ์ (Drug Inventory System)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            ติดตามสต็อกยาคงเหลือ ควบคุมวันหมดอายุ (FEFO) และประวัติธุรกรรมคลัง
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsDrugModalOpen(true)}
            variant="outline"
            size="sm"
            className="text-xs font-semibold border-chunjai-300 text-chunjai-800 hover:bg-chunjai-50"
          >
            <Plus className="mr-1.5 h-4 w-4 text-chunjai-600" />
            เพิ่มทะเบียนยาใหม่
          </Button>

          <Button
            onClick={() => setIsStockInModalOpen(true)}
            size="sm"
            className="bg-chunjai-600 hover:bg-chunjai-700 text-white font-semibold text-xs shadow-sm"
          >
            <PackagePlus className="mr-1.5 h-4 w-4" />
            รับยาเข้าคลัง (Stock In)
          </Button>
        </div>
      </div>

      {/* KPI Cards Overview */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-chunjai-200 bg-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-slate-500 font-semibold">ทะเบียนยาในคลังทั้งหมด</span>
              <div className="text-2xl font-bold text-chunjai-950 font-mono">
                {drugs.length} <span className="text-xs font-normal text-slate-500">รายการ</span>
              </div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-chunjai-50 text-chunjai-600">
              <Pill className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className={`border-amber-200 ${lowStockDrugs.length > 0 ? "bg-amber-50/40" : "bg-white"}`}>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-slate-500 font-semibold">ยาสต็อกต่ำกว่าเกณฑ์ขั้นต่ำ</span>
              <div className="text-2xl font-bold text-amber-700 font-mono">
                {lowStockDrugs.length} <span className="text-xs font-normal text-slate-500">รายการ</span>
              </div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className={`border-rose-200 ${expiringBatches.length > 0 ? "bg-rose-50/40" : "bg-white"}`}>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-slate-500 font-semibold">ล็อตยาใกล้หมดอายุ (ภายใน 90 วัน)</span>
              <div className="text-2xl font-bold text-rose-700 font-mono">
                {expiringBatches.length} <span className="text-xs font-normal text-slate-500">ล็อต</span>
              </div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Warning Banners if Low Stock or Expiring */}
      {lowStockDrugs.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-center gap-3 text-xs text-amber-900">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
          <div>
            <span className="font-bold block">แจ้งเตือนยาสต็อกต่ำกว่าเกณฑ์ขั้นต่ำ!</span>
            <span>
              พบยา {lowStockDrugs.map((d) => `${d.genericName} (${d.totalStock} ${d.unit})`).join(", ")}{" "}
              มีจำนวนคงเหลือน้อยกว่ากำหนด กรุณาวางแผนสั่งซื้อเติมคลัง
            </span>
          </div>
        </div>
      )}

      {/* Inventory Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("CATALOG")}
            className={`px-4 py-2 rounded-lg font-semibold text-xs transition-all ${
              activeTab === "CATALOG"
                ? "bg-chunjai-600 text-white shadow-sm"
                : "bg-white text-slate-700 border border-slate-200 hover:bg-chunjai-50"
            }`}
          >
            ทะเบียนยาคงเหลือ ({drugs.length})
          </button>

          <button
            onClick={() => setActiveTab("BATCHES")}
            className={`px-4 py-2 rounded-lg font-semibold text-xs transition-all ${
              activeTab === "BATCHES"
                ? "bg-chunjai-600 text-white shadow-sm"
                : "bg-white text-slate-700 border border-slate-200 hover:bg-chunjai-50"
            }`}
          >
            ล็อตยาและติดตามวันหมดอายุ
          </button>

          <button
            onClick={() => setActiveTab("LOGS")}
            className={`px-4 py-2 rounded-lg font-semibold text-xs transition-all ${
              activeTab === "LOGS"
                ? "bg-chunjai-600 text-white shadow-sm"
                : "bg-white text-slate-700 border border-slate-200 hover:bg-chunjai-50"
            }`}
          >
            ประวัติความเคลื่อนไหวคลังยา (Movement Logs)
          </button>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => fetchOverview()}
          className="text-xs text-slate-500 hover:text-chunjai-700"
        >
          <RefreshCw className="mr-1 h-3.5 w-3.5" />
          รีเฟรช
        </Button>
      </div>

      {/* TAB 1: CATALOG & STOCK BALANCE TABLE */}
      {activeTab === "CATALOG" && (
        <Card>
          <CardHeader className="pb-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base font-bold text-chunjai-950">
                รายการทะเบียนยาและจำนวนสต็อกคงเหลือ
              </CardTitle>
              <CardDescription className="text-xs">
                แสดงยอดรวมคงเหลือและระดับเตือนการเติมคลัง
              </CardDescription>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหารหัสยา, ชื่อยา..."
                className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-xs focus:border-chunjai-500 focus:outline-none"
              />
            </div>
          </CardHeader>

          <CardContent className="p-0 overflow-x-auto">
            {isPending && drugs.length === 0 ? (
              <div className="p-12 text-center text-slate-400 space-y-2">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-chunjai-600" />
                <p className="text-xs font-medium">กำลังโหลดรายการยา...</p>
              </div>
            ) : filteredDrugs.length === 0 ? (
              <div className="p-12 text-center text-slate-400">ไม่พบรายการยาในทะเบียน</div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3">รหัสยา</th>
                    <th className="px-6 py-3">ชื่อสามัญ (Generic Name)</th>
                    <th className="px-6 py-3">ชื่อการค้า (Trade Name)</th>
                    <th className="px-6 py-3">ความแรง / หน่วย</th>
                    <th className="px-6 py-3 text-right">จำนวนคงเหลือ</th>
                    <th className="px-6 py-3 text-right">สต็อกขั้นต่ำ</th>
                    <th className="px-6 py-3 text-center">สถานะสต็อก</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredDrugs.map((d) => {
                    const isLow = d.totalStock <= d.minStockLevel;

                    return (
                      <tr key={d.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4 font-bold text-chunjai-700 font-mono">
                          {d.code}
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-900">{d.genericName}</td>
                        <td className="px-6 py-4 text-slate-600">{d.tradeName || "-"}</td>
                        <td className="px-6 py-4 text-slate-600">
                          {d.strength || "-"} ({d.unit})
                        </td>
                        <td className="px-6 py-4 text-right font-extrabold font-mono text-sm text-slate-900">
                          {d.totalStock} {d.unit}
                        </td>
                        <td className="px-6 py-4 text-right font-mono text-slate-500">
                          {d.minStockLevel} {d.unit}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {isLow ? (
                            <Badge variant="destructive" className="text-[10px]">
                              <AlertTriangle className="mr-1 h-3 w-3" />
                              สต็อกต่ำ
                            </Badge>
                          ) : (
                            <Badge variant="success" className="text-[10px]">
                              ปกติ
                            </Badge>
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
      )}

      {/* TAB 2: DRUG BATCHES & EXPIRED TRACKING */}
      {activeTab === "BATCHES" && (
        <Card>
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-base font-bold text-chunjai-950">
              ล็อตยาและการติดตามวันหมดอายุ (FEFO Tracking)
            </CardTitle>
            <CardDescription className="text-xs">
              เรียงลำดับล็อตยาที่มีวันหมดอายุเร็วที่สุดก่อนเสมอ
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3">ชื่อตัวยา</th>
                  <th className="px-6 py-3">เลขล็อต (Lot Number)</th>
                  <th className="px-6 py-3">วันหมดอายุ (Expiry Date)</th>
                  <th className="px-6 py-3 text-right">จำนวนในล็อต</th>
                  <th className="px-6 py-3 text-center">สถานะวันหมดอายุ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {drugs.flatMap((d) =>
                  d.batches.map((b: any) => {
                    const expDate = new Date(b.expiredAt);
                    const now = new Date();
                    const diffDays = Math.ceil(
                      (expDate.getTime() - now.getTime()) / (1000 * 3600 * 24)
                    );
                    const isExpiringSoon = diffDays <= 90;

                    return (
                      <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-bold text-slate-900 block">{d.genericName}</span>
                          <span className="text-[11px] text-chunjai-600 font-mono">{d.code}</span>
                        </td>
                        <td className="px-6 py-4 font-mono font-bold text-slate-800">
                          {b.lotNumber}
                        </td>
                        <td className="px-6 py-4 font-mono">
                          {expDate.toLocaleDateString("th-TH", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="px-6 py-4 text-right font-mono font-bold text-chunjai-700">
                          {b.quantity} {d.unit}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {diffDays <= 0 ? (
                            <Badge variant="destructive" className="text-[10px]">
                              หมดอายุแล้ว
                            </Badge>
                          ) : isExpiringSoon ? (
                            <Badge variant="warning" className="text-[10px]">
                              <Clock className="mr-1 h-3 w-3" />
                              หมดอายุใน {diffDays} วัน
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px] text-emerald-700 border-emerald-200">
                              อีก {diffDays} วัน
                            </Badge>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* TAB 3: INVENTORY TRANSACTION LOGS */}
      {activeTab === "LOGS" && (
        <Card>
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-base font-bold text-chunjai-950">
              ประวัติความเคลื่อนไหวคลังยา (Inventory Transactions)
            </CardTitle>
            <CardDescription className="text-xs">
              บันทึกการรับเข้า จ่ายยา ปรับปรุง และตัดหมดอายุ
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3">วัน-เวลา</th>
                  <th className="px-6 py-3">ประเภทธุรกรรม</th>
                  <th className="px-6 py-3">รายการยา</th>
                  <th className="px-6 py-3 text-right">จำนวน</th>
                  <th className="px-6 py-3">ผู้ทำรายการ</th>
                  <th className="px-6 py-3">หมายเหตุ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {recentTransactions.map((tx) => {
                  const isPositive = tx.quantity > 0;

                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-mono text-slate-500 text-[11px]">
                        {new Date(tx.createdAt).toLocaleString("th-TH")}
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={tx.type === "STOCK_IN" ? "success" : tx.type === "DISPENSED" ? "default" : "secondary"}
                          className="text-[10px]"
                        >
                          {tx.type}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900">
                        {tx.drug?.genericName || "ยา"}
                      </td>
                      <td
                        className={`px-6 py-4 text-right font-bold font-mono text-sm ${
                          isPositive ? "text-emerald-600" : "text-rose-600"
                        }`}
                      >
                        {isPositive ? `+${tx.quantity}` : tx.quantity}
                      </td>
                      <td className="px-6 py-4 text-slate-700">
                        {tx.createdBy?.fullName || "เจ้าหน้าที่"}
                      </td>
                      <td className="px-6 py-4 text-slate-500 max-w-xs truncate">
                        {tx.notes || "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Drug Form Dialog */}
      <DrugFormDialog
        isOpen={isDrugModalOpen}
        onClose={() => setIsDrugModalOpen(false)}
        onSuccess={() => fetchOverview()}
      />

      {/* Stock In Dialog */}
      <StockInDialog
        isOpen={isStockInModalOpen}
        drugs={drugs}
        onClose={() => setIsStockInModalOpen(false)}
        onSuccess={() => fetchOverview()}
      />
    </div>
  );
}
