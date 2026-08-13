"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  Activity,
  Search,
  Users,
  HeartPulse,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  Loader2,
  Calendar,
  Stethoscope,
  Pill,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getPatientsAction } from "@/server/actions/patient";
import { getPatientLongitudinalHealthAction } from "@/server/actions/settings";

export default function HealthTrackingDashboardPage() {
  const [isPending, startTransition] = useTransition();

  const [patientSearch, setPatientSearch] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);

  const [vitalsHistory, setVitalsHistory] = useState<any[]>([]);
  const [fullPatientData, setFullPatientData] = useState<any | null>(null);

  const handleSearchPatient = (q: string) => {
    setPatientSearch(q);
    if (!q.trim()) {
      setSearchResults([]);
      return;
    }

    startTransition(async () => {
      const res = await getPatientsAction({ search: q, limit: 5 });
      if (res.success && res.data) {
        setSearchResults(res.data.patients);
      }
    });
  };

  const loadPatientHealth = (p: any) => {
    setSelectedPatient(p);
    setPatientSearch("");
    setSearchResults([]);

    startTransition(async () => {
      const res = await getPatientLongitudinalHealthAction(p.id);
      if (res.success && res.data) {
        setFullPatientData(res.data.patient);
        setVitalsHistory(res.data.vitalsHistory);
      }
    });
  };

  const latestVitals = vitalsHistory[0];

  // NCD Risk Evaluator Helper
  const getBpRiskBadge = (bps?: number, bpd?: number) => {
    if (!bps || !bpd) return null;
    if (bps >= 140 || bpd >= 90) {
      return <Badge variant="destructive" className="text-[10px]">ความดันสูง Stage 2 (เสี่ยง)</Badge>;
    }
    if (bps >= 130 || bpd >= 80) {
      return <Badge variant="warning" className="text-[10px]">ความดันเริ่มสูง Stage 1</Badge>;
    }
    return <Badge variant="success" className="text-[10px]">ความดันปกติ</Badge>;
  };

  const getBmiRiskBadge = (bmi?: number) => {
    if (!bmi) return null;
    if (bmi >= 25) {
      return <Badge variant="destructive" className="text-[10px]">โรคอ้วน (Obese)</Badge>;
    }
    if (bmi >= 23) {
      return <Badge variant="warning" className="text-[10px]">น้ำหนักเกิน</Badge>;
    }
    return <Badge variant="success" className="text-[10px]">BMI สมส่วน</Badge>;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-chunjai-600 text-white shadow-md">
              <Activity className="h-5 w-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-chunjai-950">
              ศูนย์ติดตามประวัติสุขภาพระยะยาว (Longitudinal Health Profile)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            ติดตามแนวโน้มสัญญาณชีพ ดัชนีมวลกาย และประเมินความเสี่ยงโรคเรื้อรัง (NCDs) รายบุคคล
          </p>
        </div>
      </div>

      {/* Patient Lookup Search Bar */}
      <Card className="border-chunjai-200 bg-chunjai-50/50">
        <CardContent className="p-4 space-y-2">
          <label className="text-xs font-bold text-chunjai-900 block">
            ค้นหาและเลือกผู้ป่วยเพื่อดูแนวโน้มสุขภาพ:
          </label>
          {selectedPatient ? (
            <div className="flex items-center justify-between p-3 rounded-lg border border-chunjai-200 bg-white">
              <div>
                <span className="font-bold text-slate-900 text-sm">
                  {selectedPatient.firstName} {selectedPatient.lastName}
                </span>
                <span className="text-xs text-chunjai-600 font-mono ml-3 font-bold">
                  HN: {selectedPatient.hn}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedPatient(null);
                  setVitalsHistory([]);
                  setFullPatientData(null);
                }}
                className="text-xs text-slate-500 hover:text-chunjai-700"
              >
                เปลี่ยนผู้ป่วย
              </Button>
            </div>
          ) : (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={patientSearch}
                onChange={(e) => handleSearchPatient(e.target.value)}
                placeholder="พิมพ์ HN, ชื่อผู้ป่วย หรือเบอร์โทรศัพท์..."
                className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-xs focus:border-chunjai-500 focus:outline-none"
              />

              {/* Dropdown Results */}
              {patientSearch.trim() && searchResults.length > 0 && (
                <div className="absolute left-0 right-0 top-11 z-10 rounded-lg border border-slate-200 bg-white p-1.5 shadow-xl space-y-1 max-h-48 overflow-y-auto">
                  {searchResults.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => loadPatientHealth(p)}
                      className="p-2.5 rounded-lg hover:bg-chunjai-50 cursor-pointer flex justify-between items-center text-xs"
                    >
                      <span className="font-bold text-slate-900">{p.firstName} {p.lastName}</span>
                      <span className="font-mono text-chunjai-600 font-bold">HN: {p.hn}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {!selectedPatient ? (
        <Card className="border-dashed p-12 text-center text-slate-400 space-y-3">
          <HeartPulse className="mx-auto h-12 w-12 text-chunjai-300" />
          <h3 className="text-base font-bold text-slate-700">
            โปรดเลือกผู้ป่วยจากช่องค้นหาด้านบน
          </h3>
          <p className="text-xs max-w-sm mx-auto">
            เพื่อดึงและประมวลผลประวัติสัญญาณชีพย้อนหลัง แนวโน้มความดันโลหิต BMI และติดตามโรคเรื้อรัง (NCDs)
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Latest Vitals & NCD Risk Summary Cards */}
          {latestVitals && (
            <div className="grid gap-4 sm:grid-cols-3">
              <Card className="border-chunjai-200">
                <CardContent className="p-4 space-y-2">
                  <span className="text-xs text-slate-500 font-semibold block">ความดันโลหิตล่าสุด</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-bold font-mono text-slate-900">
                      {latestVitals.bps}/{latestVitals.bpd} <span className="text-xs text-slate-500 font-normal">mmHg</span>
                    </span>
                    {getBpRiskBadge(latestVitals.bps, latestVitals.bpd)}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-chunjai-200">
                <CardContent className="p-4 space-y-2">
                  <span className="text-xs text-slate-500 font-semibold block">ดัชนีมวลกาย (BMI) ล่าสุด</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-bold font-mono text-chunjai-800">
                      {latestVitals.bmi} <span className="text-xs text-slate-500 font-normal">kg/m²</span>
                    </span>
                    {getBmiRiskBadge(latestVitals.bmi)}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-chunjai-200">
                <CardContent className="p-4 space-y-2">
                  <span className="text-xs text-slate-500 font-semibold block">ระดับน้ำตาล DTX ล่าสุด</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-bold font-mono text-slate-900">
                      {latestVitals.dtx ? `${latestVitals.dtx} mg/dL` : "ไม่ได้เจาะ"}
                    </span>
                    {latestVitals.dtx && (
                      <Badge variant={latestVitals.dtx > 126 ? "destructive" : "success"} className="text-[10px]">
                        {latestVitals.dtx > 126 ? "เสี่ยงเบาหวาน" : "ปกติ"}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Vitals History Timeline Table */}
          <Card>
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-base font-bold text-chunjai-950 flex items-center gap-2">
                <HeartPulse className="h-5 w-5 text-chunjai-600" />
                ประวัติสัญญาณชีพและการตรวจร่างกายย้อนหลัง ({vitalsHistory.length} ครั้ง)
              </CardTitle>
              <CardDescription className="text-xs">
                เรียงลำดับจากครั้งล่าสุด สำหรับติดตามการรักษากลุ่มโรคเรื้อรัง (NCDs)
              </CardDescription>
            </CardHeader>

            <CardContent className="p-0 overflow-x-auto">
              {isPending && vitalsHistory.length === 0 ? (
                <div className="p-12 text-center text-slate-400 space-y-2">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-chunjai-600" />
                  <p className="text-xs font-medium">กำลังโหลดประวัติสัญญาณชีพ...</p>
                </div>
              ) : vitalsHistory.length === 0 ? (
                <div className="p-12 text-center text-slate-400">ยังไม่มีบันทึกประวัติสัญญาณชีพย้อนหลัง</div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-3">วัน-เวลา ที่ตรวจ</th>
                      <th className="px-6 py-3">Visit No.</th>
                      <th className="px-6 py-3">ความดันโลหิต (BP)</th>
                      <th className="px-6 py-3">ชีพจร (PR)</th>
                      <th className="px-6 py-3">น้ำหนัก / ส่วนสูง</th>
                      <th className="px-6 py-3">BMI</th>
                      <th className="px-6 py-3 text-right">DTX</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {vitalsHistory.map((vh) => (
                      <tr key={vh.visitId} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4 font-mono text-slate-600 text-[11px]">
                          {new Date(vh.date).toLocaleString("th-TH")}
                        </td>
                        <td className="px-6 py-4 font-mono font-bold text-chunjai-700">
                          {vh.visitNumber}
                        </td>
                        <td className="px-6 py-4 font-bold font-mono text-slate-900">
                          {vh.bps}/{vh.bpd} mmHg
                        </td>
                        <td className="px-6 py-4 font-mono text-slate-700">
                          {vh.pulseRate} bpm
                        </td>
                        <td className="px-6 py-4 text-slate-700">
                          {vh.weight} kg / {vh.height} cm
                        </td>
                        <td className="px-6 py-4 font-bold font-mono text-chunjai-800">
                          {vh.bmi}
                        </td>
                        <td className="px-6 py-4 text-right font-mono text-slate-700">
                          {vh.dtx ? `${vh.dtx} mg/dL` : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
