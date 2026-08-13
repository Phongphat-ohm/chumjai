"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  Syringe,
  Plus,
  Search,
  Printer,
  ShieldCheck,
  Loader2,
  Calendar,
  UserCheck,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getPatientVaccinationHistoryAction } from "@/server/actions/vaccination";
import { RecordVaccinationModal } from "@/components/vaccination/RecordVaccinationModal";

export default function VaccinationHubPage() {
  const [isPending, startTransition] = useTransition();

  const [history, setHistory] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);

  const fetchHistory = () => {
    startTransition(async () => {
      const res = await getPatientVaccinationHistoryAction();
      if (res.success && res.data) {
        setHistory(res.data);
      }
    });
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const filteredHistory = history.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.patient?.firstName.toLowerCase().includes(q) ||
      item.patient?.lastName.toLowerCase().includes(q) ||
      item.patient?.hn.toLowerCase().includes(q) ||
      item.vaccine?.name.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-chunjai-600 text-white shadow-md">
              <Syringe className="h-5 w-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-chunjai-950">
              ศูนย์บริหารจัดการและประวัติการรับวัคซีน (Vaccination Station)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            ลงบันทึกการฉีดวัคซีน ติดตามเข็มกระตุ้น และออกสมุดประวัติรับวัคซีนผู้ป่วย
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchHistory()}
            className="text-xs font-semibold"
          >
            <RefreshCw className="mr-1.5 h-3.5 w-3.5 text-chunjai-600" />
            รีเฟรชข้อมูล
          </Button>

          <Button
            onClick={() => setIsRecordModalOpen(true)}
            size="sm"
            className="bg-chunjai-600 hover:bg-chunjai-700 text-white font-semibold text-xs shadow-sm"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            บันทึกการรับวัคซีนใหม่
          </Button>
        </div>
      </div>

      {/* Main History Table */}
      <Card>
        <CardHeader className="pb-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-bold text-chunjai-950 flex items-center gap-2">
              <Syringe className="h-5 w-5 text-chunjai-600" />
              ประวัติบันทึกการรับวัคซีนทั้งหมด ({history.length} รายการ)
            </CardTitle>
            <CardDescription className="text-xs">
              เรียงลำดับจากการรับวัคซีนล่าสุด
            </CardDescription>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหา HN, ชื่อผู้ป่วย, ชื่อวัคซีน..."
              className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-xs focus:border-chunjai-500 focus:outline-none"
            />
          </div>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          {isPending && history.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-chunjai-600" />
              <p className="text-xs font-medium">กำลังโหลดประวัติการรับวัคซีน...</p>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <Syringe className="mx-auto h-10 w-10 text-slate-300" />
              <p className="text-sm font-semibold text-slate-700">ไม่พบประวัติบันทึกการรับวัคซีน</p>
              <p className="text-xs">กดปุ่ม "บันทึกการรับวัคซีนใหม่" ด้านบนเพื่อลงประวัติ</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3">วัน-เวลาที่ฉีด</th>
                  <th className="px-6 py-3">HN / ชื่อผู้ป่วย</th>
                  <th className="px-6 py-3">ชื่อวัคซีน</th>
                  <th className="px-6 py-3 text-center">เข็มที่ (Dose)</th>
                  <th className="px-6 py-3">เลขล็อต / ตำแหน่งที่ฉีด</th>
                  <th className="px-6 py-3">ผู้ฉีด (Vaccinator)</th>
                  <th className="px-6 py-3 text-right">พิมพ์การ์ด</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-mono text-slate-600 text-[11px]">
                      {new Date(item.administeredAt).toLocaleString("th-TH")}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-900 block">
                        {item.patient?.firstName} {item.patient?.lastName}
                      </span>
                      <span className="text-[11px] text-chunjai-600 font-mono">
                        HN: {item.patient?.hn}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-chunjai-950 block">
                        {item.vaccine?.name}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {item.vaccine?.manufacturer || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge variant="secondary" className="font-mono text-[10px]">
                        เข็มที่ {item.doseNumber}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      <span className="font-mono font-bold block">
                        {item.lotNumber || "N/A"}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {item.injectionSite || "ต้นแขนขวา"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      {item.vaccinator?.fullName || "เจ้าหน้าที่"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.print()}
                        className="h-8 text-xs text-chunjai-700"
                      >
                        <Printer className="mr-1 h-3.5 w-3.5" />
                        พิมพ์การ์ดวัคซีน
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Record Vaccination Modal */}
      <RecordVaccinationModal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        onSuccess={() => fetchHistory()}
      />
    </div>
  );
}
