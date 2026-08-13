"use client";

import React, { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import {
  Stethoscope,
  Activity,
  Heart,
  Thermometer,
  Weight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldAlert,
  Users,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getWaitingTriageVisitsAction } from "@/server/actions/triage";
import { TriageFormModal } from "@/components/triage/TriageFormModal";

export default function TriageStationPage() {
  const [isPending, startTransition] = useTransition();
  const [visits, setVisits] = useState<any[]>([]);
  const [selectedVisit, setSelectedVisit] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchWaitingVisits = () => {
    startTransition(async () => {
      const res = await getWaitingTriageVisitsAction();
      if (res.success && res.data) {
        setVisits(res.data);
      }
    });
  };

  useEffect(() => {
    fetchWaitingVisits();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-chunjai-600 text-white shadow-md">
              <Stethoscope className="h-5 w-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-chunjai-950">
              จุดคัดกรองสัญญาณชีพพยาบาล (Nurse Triage Station)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            วัดสัญญาณชีพ ประเมินระดับความรุนแรง 5 สี และคำนวณ BMI ฝั่ง Server
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchWaitingVisits()}
          className="text-xs font-semibold"
        >
          รีเฟรชรายการ
        </Button>
      </div>

      {/* Waiting Triage Patients Table */}
      <Card>
        <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Users className="h-5 w-5 text-chunjai-600" />
              ผู้ป่วยรอคัดกรองวัดสัญญาณชีพ ({visits.length} คน)
            </CardTitle>
            <CardDescription className="text-xs">
              เลือกผู้ป่วยเพื่อทำการวัดความดันโลหิต อุณหภูมิ น้ำหนัก และประเมินความรุนแรง
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          {isPending && visits.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-chunjai-600" />
              <p className="text-xs font-medium">กำลังโหลดผู้ป่วยรอคัดกรอง...</p>
            </div>
          ) : visits.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-400" />
              <p className="text-sm font-semibold text-slate-700">ไม่มีผู้ป่วยรอคัดกรองในขณะนี้</p>
              <p className="text-xs">ผู้ป่วยทุกเคสได้รับการคัดกรองและส่งต่อให้แพทย์เรียบร้อยแล้ว</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3">คิวคัดกรอง</th>
                  <th className="px-6 py-3">Visit / HN</th>
                  <th className="px-6 py-3">ชื่อ - นามสกุล</th>
                  <th className="px-6 py-3">อาการสำคัญ (Chief Complaint)</th>
                  <th className="px-6 py-3">ประวัติแพ้ยา</th>
                  <th className="px-6 py-3 text-right">ดำเนินการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {visits.map((visit) => {
                  const hasAllergies = visit.patient?.allergies?.length > 0;
                  const queueNum = visit.queues?.[0]?.queueNumber || "-";

                  return (
                    <tr key={visit.id} className="hover:bg-chunjai-50/50 transition-colors">
                      <td className="px-6 py-4 font-extrabold text-chunjai-700 font-mono text-base">
                        {queueNum}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-900 font-mono block">
                          {visit.visitNumber}
                        </span>
                        <span className="text-[11px] text-chunjai-600 font-mono">
                          HN: {visit.patient?.hn}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        {visit.patient?.firstName} {visit.patient?.lastName}
                      </td>
                      <td className="px-6 py-4 text-slate-700 max-w-xs truncate">
                        {visit.chiefComplaint || "-"}
                      </td>
                      <td className="px-6 py-4">
                        {hasAllergies ? (
                          <Badge variant="destructive" className="text-[10px]">
                            <ShieldAlert className="mr-1 h-3 w-3" />
                            แพ้ยา ({visit.patient.allergies.length})
                          </Badge>
                        ) : (
                          <span className="text-slate-400 text-[11px]">ไม่มี</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedVisit(visit);
                            setIsModalOpen(true);
                          }}
                          className="bg-chunjai-600 hover:bg-chunjai-700 text-white font-semibold text-xs shadow-xs"
                        >
                          <Stethoscope className="mr-1.5 h-3.5 w-3.5" />
                          คัดกรอง & วัดสัญญาณชีพ
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Triage Form Modal */}
      <TriageFormModal
        isOpen={isModalOpen}
        visit={selectedVisit}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedVisit(null);
        }}
        onSuccess={() => fetchWaitingVisits()}
      />
    </div>
  );
}
