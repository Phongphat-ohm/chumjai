"use client";

import React, { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  UserCheck,
  Stethoscope,
  Activity,
  FileText,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldAlert,
  Users,
  Clock,
  HeartPulse,
  Pill,
  TestTube,
  Search,
  RefreshCw,
  Eye,
  AlertTriangle,
  PauseCircle,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  getDoctorQueueVisitsAction,
  startConsultationAction,
  saveSoapAndDiagnosisAction,
  holdDoctorQueueForLabAction,
} from "@/server/actions/doctor";
import { getPrescriptionByVisitAction } from "@/server/actions/prescription";
import { Icd10SearchDialog } from "@/components/doctor/Icd10SearchDialog";
import { PrescriptionModal } from "@/components/doctor/PrescriptionModal";
import { CreateLabOrderModal } from "@/components/lab/CreateLabOrderModal";
import { StationBadgeBar } from "@/components/stations/StationBadgeBar";
import { useClinicSettings } from "@/hooks/useClinicSettings";
import { Icd10Item } from "@/lib/icd10-data";
import { DiagnosisType, LabOrderStatus, StationType } from "@/generated/client";

const LabReportModal = dynamic(
  () => import("@/components/lab/LabReportModal").then((mod) => mod.LabReportModal),
  { ssr: false }
);

const DOCTOR_QUEUE_STATUS_MAP: Record<string, { label: string; bg: string }> = {
  WAITING_DOCTOR: { label: "รอพบแพทย์", bg: "bg-amber-100 text-amber-800 border-amber-300" },
  IN_CONSULTATION: { label: "กำลังตรวจ", bg: "bg-emerald-100 text-emerald-800 border-emerald-300" },
  TRIAGED: { label: "คัดกรองแล้ว", bg: "bg-indigo-100 text-indigo-800 border-indigo-300" },
  WAITING_TRIAGE: { label: "รอคัดกรอง", bg: "bg-blue-100 text-blue-800 border-blue-300" },
  REGISTERED: { label: "ลงทะเบียนแล้ว", bg: "bg-slate-100 text-slate-700 border-slate-300" },
};

const LAB_STATUS_MAP: Record<LabOrderStatus, { label: string; bg: string; icon: string }> = {
  ORDERED: { label: "สั่งตรวจแล้ว (รอเก็บสิ่งส่งตรวจ)", bg: "bg-amber-100 text-amber-800 border-amber-300", icon: "⏳" },
  COLLECTED: { label: "เก็บตัวอย่างแล้ว (กำลังตรวจ)", bg: "bg-blue-100 text-blue-800 border-blue-300", icon: "🔬" },
  COMPLETED: { label: "รายงานผลแล็บแล้ว", bg: "bg-emerald-100 text-emerald-800 border-emerald-300", icon: "✅" },
  CANCELLED: { label: "ยกเลิกคำสั่งตรวจ", bg: "bg-rose-100 text-rose-800 border-rose-300", icon: "❌" },
};

export default function DoctorConsultationPage() {
  const [isPending, startTransition] = useTransition();
  const { clinicInfo } = useClinicSettings();

  const [visits, setVisits] = useState<any[]>([]);
  const [queueSearch, setQueueSearch] = useState("");
  const [queueTab, setQueueTab] = useState<"ALL" | "WAITING" | "HOLD_FOR_LAB" | "LAB_READY">("ALL");
  const [selectedVisit, setSelectedVisit] = useState<any | null>(null);

  // SOAP Note Form State
  const [subjective, setSubjective] = useState("");
  const [objective, setObjective] = useState("");
  const [assessment, setAssessment] = useState("");
  const [plan, setPlan] = useState("");
  const [diagnoses, setDiagnoses] = useState<
    { icd10Code: string; icd10Name: string; type: DiagnosisType; notes?: string }[]
  >([]);

  const [prescribedItems, setPrescribedItems] = useState<any[]>([]);
  const [isIcdModalOpen, setIsIcdModalOpen] = useState(false);
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [isLabModalOpen, setIsLabModalOpen] = useState(false);

  // Lab Report Modal state
  const [selectedLabOrder, setSelectedLabOrder] = useState<any | null>(null);
  const [isLabReportModalOpen, setIsLabReportModalOpen] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchDoctorQueue = () => {
    startTransition(async () => {
      const res = await getDoctorQueueVisitsAction();
      if (res.success && res.data) {
        setVisits(res.data);
        // Keep selectedVisit synchronized with updated data (including fresh labOrders)
        if (selectedVisit) {
          const fresh = res.data.find((v: any) => v.id === selectedVisit.id);
          if (fresh) {
            setSelectedVisit(fresh);
          }
        }
      }
    });
  };

  const fetchPrescription = (visitId: string) => {
    startTransition(async () => {
      const res = await getPrescriptionByVisitAction(visitId);
      if (res.success && res.data?.items) {
        setPrescribedItems(res.data.items);
      } else {
        setPrescribedItems([]);
      }
    });
  };

  useEffect(() => {
    fetchDoctorQueue();
  }, []);

  const handleSelectVisit = (visit: any) => {
    setSelectedVisit(visit);
    setErrorMessage(null);
    setSuccessMessage(null);

    // Initialize Subjective from Chief Complaint
    setSubjective(visit.chiefComplaint || "ผู้ป่วยมารับการตรวจรักษาและติดตามอาการ");

    // Initialize Objective from Nurse Vital Signs
    const vs = visit.vitalSigns?.[0];
    if (vs) {
      const bp = vs.systolicBp && vs.diastolicBp ? `${vs.systolicBp}/${vs.diastolicBp} mmHg` : "-";
      setObjective(
        `BP: ${bp}, Temp: ${vs.temperatureC || "-"} °C, HR: ${vs.pulseRate || "-"} bpm, SpO2: ${vs.spo2Percent || "-"}%, BMI: ${vs.bmi || "-"} kg/m²`
      );
    } else {
      setObjective("สัญญาณชีพปกติ");
    }

    // Load existing SOAP if present or preset defaults
    if (visit.consultation?.soapNote) {
      const s = visit.consultation.soapNote;
      setSubjective(s.subjective || visit.chiefComplaint || "ผู้ป่วยมารับการตรวจรักษาและติดตามอาการ");
      setObjective(s.objective || "");
      setAssessment(s.assessment || "");
      setPlan(s.plan || "ให้การรักษาตามผลการตรวจวิเคราะห์และติดตามอาการ");
    } else {
      setPlan("ให้การรักษาตามผลการตรวจวิเคราะห์และติดตามอาการ");
    }

    if (visit.consultation?.diagnoses && visit.consultation.diagnoses.length > 0) {
      setDiagnoses(
        visit.consultation.diagnoses.map((d: any) => ({
          icd10Code: d.icd10Code,
          icd10Name: d.icd10Name,
          type: d.type as DiagnosisType,
          notes: d.notes || undefined,
        }))
      );
    } else {
      // Default to laboratory examination or general checkup diagnosis
      setDiagnoses([
        {
          icd10Code: "Z01.7",
          icd10Name: "Laboratory examination (การตรวจทางห้องปฏิบัติการและติดตามผล)",
          type: DiagnosisType.PRIMARY,
        },
      ]);
    }

    fetchPrescription(visit.id);

    // Start Consultation Server Action
    startTransition(async () => {
      await startConsultationAction(visit.id);
    });
  };

  const handleHoldForLab = () => {
    if (!selectedVisit) return;
    setErrorMessage(null);
    setSuccessMessage(null);

    startTransition(async () => {
      const res = await holdDoctorQueueForLabAction(selectedVisit.id, {
        subjective,
        objective,
        assessment,
        plan,
      });

      if (res.success) {
        setSuccessMessage(
          `พักคิวผู้ป่วย ${selectedVisit.patient?.firstName} (HN: ${selectedVisit.patient?.hn}) เพื่อรอผลแล็บเรียบร้อยแล้ว ห้องตรวจพร้อมรับผู้ป่วยรายถัดไป`
        );
        setSelectedVisit(null);
        fetchDoctorQueue();
      } else {
        setErrorMessage(res.error || "ไม่สามารถพักคิวเพื่อรอผลแล็บได้");
      }
    });
  };

  const handleAddIcd10 = (item: Icd10Item, type: DiagnosisType) => {
    if (diagnoses.some((d) => d.icd10Code === item.code)) return;

    // Filter out default placeholder Z01.7 if adding specific diagnosis
    const baseDiagnoses = diagnoses.filter((d) => d.icd10Code !== "Z01.7");
    const newDiagnoses = [
      ...baseDiagnoses,
      {
        icd10Code: item.code,
        icd10Name: item.nameTh,
        type,
      },
    ];

    setDiagnoses(newDiagnoses);
    const diagSummary = newDiagnoses.map((d) => `${d.icd10Code} (${d.icd10Name})`).join(", ");
    setAssessment(diagSummary);
  };

  const handleRemoveDiagnosis = (code: string) => {
    const updated = diagnoses.filter((d) => d.icd10Code !== code);
    setDiagnoses(updated);
    const diagSummary = updated.map((d) => `${d.icd10Code} (${d.icd10Name})`).join(", ");
    setAssessment(diagSummary);
  };

  const handleSubmitSoap = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!selectedVisit) {
      setErrorMessage("กรุณาเลือกผู้ป่วยในคิวก่อนบันทึก");
      return;
    }

    const finalDiagnoses =
      diagnoses.length > 0
        ? diagnoses
        : [
            {
              icd10Code: "Z01.7",
              icd10Name: "Laboratory examination (การตรวจทางห้องปฏิบัติการและติดตามผล)",
              type: DiagnosisType.PRIMARY,
            },
          ];

    const finalSubjective =
      subjective.trim() || selectedVisit.chiefComplaint || "ผู้ป่วยมารับการตรวจรักษาและติดตามอาการ";
    const finalPlan =
      plan.trim() ||
      (prescribedItems.length > 0
        ? "สั่งจ่ายยาตามแผนการรักษาและให้คำแนะนำการใช้ยา"
        : "ให้การรักษาตามผลการตรวจและติดตามอาการ");

    startTransition(async () => {
      const res = await saveSoapAndDiagnosisAction({
        visitId: selectedVisit.id,
        subjective: finalSubjective,
        objective: objective.trim() || "สัญญาณชีพปกติและผลการตรวจวิเคราะห์",
        assessment: assessment.trim() || finalDiagnoses.map((d) => `${d.icd10Code} (${d.icd10Name})`).join(", "),
        plan: finalPlan,
        diagnoses: finalDiagnoses,
      });

      if (res.success) {
        setSuccessMessage("บันทึกผลการตรวจรักษาและส่งต่อห้องยาเรียบร้อยแล้ว!");
        setSelectedVisit(null);
        fetchDoctorQueue();
      } else {
        setErrorMessage(res.error || "เกิดข้อผิดพลาดในการบันทึกผลการตรวจ");
      }
    });
  };

  const handleOpenLabReport = (order: any) => {
    setSelectedLabOrder({
      ...order,
      patient: selectedVisit.patient,
      visit: selectedVisit,
    });
    setIsLabReportModalOpen(true);
  };

  // Queue Counters
  const labReadyVisits = visits.filter(
    (v) =>
      v.labOrders?.length > 0 &&
      v.labOrders.every((l: any) => l.status === "COMPLETED")
  );
  const holdForLabVisits = visits.filter((v) =>
    v.labOrders?.some((l: any) => l.status === "ORDERED" || l.status === "COLLECTED")
  );
  const normalWaitingVisits = visits.filter(
    (v) => !v.labOrders || v.labOrders.length === 0
  );

  const filteredVisits = visits.filter((visit) => {
    // 1. Search Query Filter
    if (queueSearch.trim()) {
      const q = queueSearch.toLowerCase();
      const name = `${visit.patient?.firstName || ""} ${visit.patient?.lastName || ""}`.toLowerCase();
      const hn = (visit.patient?.hn || "").toLowerCase();
      const qNum = (visit.queues?.[0]?.queueNumber || "").toLowerCase();
      const vNum = (visit.visitNumber || "").toLowerCase();
      const match = name.includes(q) || hn.includes(q) || qNum.includes(q) || vNum.includes(q);
      if (!match) return false;
    }

    // 2. Tab Filter
    const vLabs = visit.labOrders || [];
    const isCompleted = vLabs.length > 0 && vLabs.every((l: any) => l.status === "COMPLETED");
    const isPendingLab = vLabs.some((l: any) => l.status === "ORDERED" || l.status === "COLLECTED");

    if (queueTab === "LAB_READY") return isCompleted;
    if (queueTab === "HOLD_FOR_LAB") return isPendingLab;
    if (queueTab === "WAITING") return !isPendingLab && !isCompleted;
    return true;
  });

  const vs = selectedVisit?.vitalSigns?.[0];
  const labOrders = selectedVisit?.labOrders || [];

  return (
    <div className="space-y-6">
      {/* Top Banner Alert when Lab Results are Ready for Consultation */}
      {labReadyVisits.length > 0 && (
        <div
          onClick={() => setQueueTab("LAB_READY")}
          className="cursor-pointer flex items-center justify-between p-3.5 bg-emerald-500 text-white rounded-xl shadow-md border border-emerald-600 transition-all hover:bg-emerald-600 animate-in fade-in"
        >
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white animate-pulse" />
            </div>
            <div>
              <p className="font-bold text-sm leading-tight">
                แจ้งเตือน: มีผลตรวจแล็บผู้ป่วยออกเรียบร้อยแล้ว {labReadyVisits.length} รายการ
              </p>
              <p className="text-xs text-emerald-100">
                ระบบ Auto-Resume คิวกลับเข้าห้องตรวจแล้ว คลิกที่นี่เพื่อดูคิวที่พร้อมเรียกตรวจต่อทันที
              </p>
            </div>
          </div>
          <Badge className="bg-white text-emerald-800 font-bold hover:bg-white text-xs">
            ดู {labReadyVisits.length} คิวที่พร้อมตรวจ
          </Badge>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-black text-slate-950 flex items-center gap-2">
            <Stethoscope className="h-6 w-6 text-chunjai-600" />
            ห้องตรวจแพทย์และเวชระเบียน (Doctor Consultation Room)
          </h1>
          <p className="text-xs text-slate-500">
            ตรวจรักษา บันทึกเวชระเบียน SOAP Note วินิจฉัยโรคตาม ICD-10 สั่งตรวจแล็บ และสั่งยา
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchDoctorQueue()}
          className="text-xs font-semibold"
        >
          <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${isPending ? "animate-spin" : ""}`} />
          รีเฟรชคิวแพทย์
        </Button>
      </div>

      {/* Station Active Badge Bar */}
      <StationBadgeBar filterType={StationType.DOCTOR} />

      {/* Alert Messages */}
      {successMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-lg text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-300 text-rose-900 rounded-lg text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid gap-6 md:grid-cols-12">
        {/* Left Column: Doctor Queue Waiting List */}
        <div className="md:col-span-4 space-y-4">
          <Card className="border-chunjai-200">
            <CardHeader className="pb-2 border-b border-slate-100 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Users className="h-4 w-4 text-chunjai-600" />
                คิวผู้ป่วยห้องตรวจ ({visits.length})
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => fetchDoctorQueue()}
                className="h-7 w-7 text-slate-500 hover:text-chunjai-600"
                title="รีเฟรชคิว"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isPending ? "animate-spin" : ""}`} />
              </Button>
            </CardHeader>

            {/* Smart Filter Tabs */}
            <div className="grid grid-cols-4 p-1.5 bg-slate-100/80 border-b border-slate-200 gap-1 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setQueueTab("ALL")}
                className={`py-1 rounded text-center transition-all ${
                  queueTab === "ALL"
                    ? "bg-white text-chunjai-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                ทั้งหมด ({visits.length})
              </button>
              <button
                type="button"
                onClick={() => setQueueTab("WAITING")}
                className={`py-1 rounded text-center transition-all ${
                  queueTab === "WAITING"
                    ? "bg-white text-chunjai-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                รอตรวจ ({normalWaitingVisits.length})
              </button>
              <button
                type="button"
                onClick={() => setQueueTab("HOLD_FOR_LAB")}
                className={`py-1 rounded text-center transition-all ${
                  queueTab === "HOLD_FOR_LAB"
                    ? "bg-amber-500 text-white shadow-xs"
                    : "text-amber-800 hover:text-amber-950"
                }`}
              >
                รอแล็บ ({holdForLabVisits.length})
              </button>
              <button
                type="button"
                onClick={() => setQueueTab("LAB_READY")}
                className={`py-1 rounded text-center transition-all ${
                  queueTab === "LAB_READY"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-emerald-800 hover:text-emerald-950"
                }`}
              >
                แล็บพร้อม ({labReadyVisits.length})
              </button>
            </div>

            {/* Queue Search Input */}
            <div className="p-2 border-b border-slate-100 bg-slate-50/50">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={queueSearch}
                  onChange={(e) => setQueueSearch(e.target.value)}
                  placeholder="ค้นหาชื่อ, HN, ลำดับคิว..."
                  className="h-8 w-full rounded-lg border border-slate-200 bg-white pl-8 pr-2.5 text-xs focus:border-chunjai-500 focus:outline-none"
                />
              </div>
            </div>

            <CardContent className="p-2 space-y-1.5 max-h-[70vh] overflow-y-auto">
              {isPending && visits.length === 0 ? (
                <div className="p-8 text-center text-slate-400 space-y-2">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-chunjai-600" />
                  <p className="text-xs">กำลังโหลดคิว...</p>
                </div>
              ) : filteredVisits.length === 0 ? (
                <div className="p-8 text-center text-slate-400 space-y-1">
                  <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-400" />
                  <p className="text-xs font-bold text-slate-700">ไม่มีคิวในหมวดหมู่นี้</p>
                  <p className="text-[11px] text-slate-400">เลือกแท็บอื่นหรือรีเฟรชคิวเพื่อดูผู้ป่วย</p>
                </div>
              ) : (
                filteredVisits.map((visit) => {
                  const isSelected = selectedVisit?.id === visit.id;
                  const queueNum = visit.queues?.[0]?.queueNumber || "A";
                  const hasAllergies = visit.patient?.allergies?.length > 0;
                  const statusObj = DOCTOR_QUEUE_STATUS_MAP[visit.status] || {
                    label: visit.status,
                    bg: "bg-slate-100 text-slate-600",
                  };

                  const visitLabs = visit.labOrders || [];
                  const hasCompletedLab = visitLabs.length > 0 && visitLabs.every((l: any) => l.status === "COMPLETED");
                  const hasPendingLab = visitLabs.some((l: any) => l.status === "ORDERED" || l.status === "COLLECTED");

                  return (
                    <div
                      key={visit.id}
                      onClick={() => handleSelectVisit(visit)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                        isSelected
                          ? "bg-chunjai-600 text-white border-chunjai-700 shadow-md"
                          : hasCompletedLab
                          ? "bg-emerald-50/70 border-emerald-300 hover:bg-emerald-100/70"
                          : hasPendingLab
                          ? "bg-amber-50/60 border-amber-200 hover:bg-amber-100/60"
                          : "bg-white text-slate-900 border-slate-200 hover:border-chunjai-300 hover:bg-chunjai-50/50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`font-extrabold font-mono text-sm ${isSelected ? "text-white" : hasCompletedLab ? "text-emerald-800" : "text-chunjai-700"}`}>
                          {queueNum}
                        </span>
                        <span className={`text-[10px] font-mono ${isSelected ? "text-chunjai-100" : "text-slate-400"}`}>
                          {visit.visitNumber}
                        </span>
                      </div>

                      <div className="flex items-baseline justify-between mt-1">
                        <p className="font-bold text-sm">
                          {visit.patient?.firstName} {visit.patient?.lastName}
                        </p>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
                            isSelected
                              ? "bg-white/20 text-white border-white/30"
                              : hasCompletedLab
                              ? "bg-emerald-200 text-emerald-900 border-emerald-400 font-bold"
                              : hasPendingLab
                              ? "bg-amber-200 text-amber-900 border-amber-400 font-semibold"
                              : statusObj.bg
                          }`}
                        >
                          {hasCompletedLab ? "ผลแล็บพร้อมแล้ว" : hasPendingLab ? "รอผลแล็บ" : statusObj.label}
                        </span>
                      </div>

                      <p className={`text-[11px] truncate mt-0.5 ${isSelected ? "text-chunjai-100" : "text-slate-500"}`}>
                        อาการ: {visit.chiefComplaint || "-"}
                      </p>

                      {/* Badges for Allergies & Lab Status */}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {hasAllergies && (
                          <div className="inline-flex items-center gap-1 rounded bg-rose-500 text-white px-2 py-0.5 text-[10px] font-bold">
                            <ShieldAlert className="h-3 w-3" />
                            แพ้ยา!
                          </div>
                        )}

                        {hasCompletedLab && (
                          <div className="inline-flex items-center gap-1 rounded bg-emerald-600 text-white px-2 py-0.5 text-[10px] font-bold shadow-2xs">
                            <Sparkles className="h-3 w-3" />
                            ผลแล็บออกครบแล้ว (ตรวจต่อ)
                          </div>
                        )}

                        {hasPendingLab && !hasCompletedLab && (
                          <div className="inline-flex items-center gap-1 rounded bg-amber-500 text-white px-2 py-0.5 text-[10px] font-bold">
                            <TestTube className="h-3 w-3" />
                            กำลังตรวจแล็บ ({visitLabs.length})
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Patient Chart & SOAP Note Editor */}
        <div className="md:col-span-8 space-y-6">
          {!selectedVisit ? (
            <Card className="border-dashed p-12 text-center text-slate-400 space-y-3">
              <UserCheck className="mx-auto h-12 w-12 text-chunjai-300" />
              <h3 className="text-base font-bold text-slate-700">
                เลือกผู้ป่วยจากคิวทางซ้ายเพื่อเริ่มทำการตรวจรักษา
              </h3>
              <p className="text-xs max-w-sm mx-auto">
                ระบบจะเปิดแฟ้มประวัติสุขภาพ สัญญาณชีพที่พยาบาลคัดกรอง ผลการตรวจแล็บ และฟอร์มสั่งยา
              </p>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Patient Vital Signs Summary Bar */}
              <Card className="border-chunjai-200 bg-chunjai-50/50">
                <CardContent className="p-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-chunjai-100 pb-2">
                    <div>
                      <h2 className="text-base font-bold text-chunjai-950">
                        {selectedVisit.patient?.firstName} {selectedVisit.patient?.lastName}
                      </h2>
                      <p className="text-xs text-slate-500 font-mono">
                        HN: {selectedVisit.patient?.hn} · สิทธิ: {selectedVisit.patient?.rightsType}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {selectedVisit.patient?.allergies?.length > 0 && (
                        <Badge variant="destructive" className="text-xs font-bold">
                          <ShieldAlert className="mr-1 h-3.5 w-3.5" />
                          แพ้ยา: {selectedVisit.patient.allergies.map((a: any) => a.allergen).join(", ")}
                        </Badge>
                      )}

                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsLabModalOpen(true)}
                        className="border-chunjai-300 text-chunjai-700 hover:bg-chunjai-50 font-bold text-xs"
                      >
                        <TestTube className="mr-1.5 h-4 w-4 text-chunjai-600" />
                        สั่งตรวจแล็บ
                      </Button>

                      {/* ปุ่มพักคิวรอผลแล็บ (Hold for Lab) */}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleHoldForLab}
                        disabled={isPending}
                        className="border-amber-400 bg-amber-50 text-amber-900 hover:bg-amber-100 font-bold text-xs shadow-xs"
                        title="พักคิวผู้ป่วยเพื่อรอผลแล็บ และปลดล็อกห้องตรวจเพื่อเรียกคิวถัดไป"
                      >
                        <PauseCircle className="mr-1.5 h-4 w-4 text-amber-700" />
                        พักคิวรอผลแล็บ
                      </Button>

                      <Button
                        type="button"
                        onClick={() => setIsPrescriptionModalOpen(true)}
                        className="bg-chunjai-600 hover:bg-chunjai-700 text-white font-bold text-xs"
                      >
                        <Pill className="mr-1.5 h-4 w-4" />
                        สั่งยา ({prescribedItems.length} รายการ)
                      </Button>
                    </div>
                  </div>

                  {/* Vital Signs Grid Bar */}
                  {vs ? (
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs text-center font-medium">
                      <div className="bg-white p-2 rounded-lg border border-chunjai-100">
                        <span className="text-[10px] text-slate-400 block">ความดันโลหิต</span>
                        <span className="font-bold text-slate-900 font-mono text-xs">
                          {vs.systolicBp && vs.diastolicBp ? `${vs.systolicBp}/${vs.diastolicBp}` : "-"} mmHg
                        </span>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-chunjai-100">
                        <span className="text-[10px] text-slate-400 block">อุณหภูมิ</span>
                        <span className="font-bold text-slate-900 font-mono text-xs">
                          {vs.temperatureC || "-"} °C
                        </span>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-chunjai-100">
                        <span className="text-[10px] text-slate-400 block">ชีพจร</span>
                        <span className="font-bold text-slate-900 font-mono text-xs">
                          {vs.pulseRate || "-"} bpm
                        </span>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-chunjai-100">
                        <span className="text-[10px] text-slate-400 block">SpO2</span>
                        <span className="font-bold text-slate-900 font-mono text-xs">
                          {vs.spo2Percent || "-"} %
                        </span>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-chunjai-100 col-span-2 sm:col-span-1">
                        <span className="text-[10px] text-slate-400 block">BMI (Server)</span>
                        <span className="font-bold text-chunjai-700 font-mono text-xs">
                          {vs.bmi ? `${vs.bmi} kg/m²` : "-"}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 text-center py-1">ไม่มีข้อมูลสัญญาณชีพ</p>
                  )}
                </CardContent>
              </Card>

              {/* Laboratory & Diagnostics Panel */}
              <Card className="border-slate-200">
                <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TestTube className="h-5 w-5 text-chunjai-600" />
                    <div>
                      <CardTitle className="text-sm font-bold text-slate-950">
                        รายการตรวจทางห้องปฏิบัติการ (Laboratory & Diagnostics)
                      </CardTitle>
                      <CardDescription className="text-xs">
                        ติดตามสถานะและผลการตรวจวิเคราะห์ทางห้องแล็บสำหรับรอบการตรวจนี้
                      </CardDescription>
                    </div>
                  </div>

                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setIsLabModalOpen(true)}
                    className="h-8 text-xs font-semibold text-chunjai-700 hover:bg-chunjai-50 border-chunjai-200"
                  >
                    <Plus className="mr-1 h-3.5 w-3.5" />
                    สั่งตรวจแล็บเพิ่ม
                  </Button>
                </CardHeader>

                <CardContent className="p-4 space-y-3 text-xs">
                  {labOrders.length === 0 ? (
                    <div className="p-6 rounded-lg border border-dashed border-slate-200 text-center text-slate-400 space-y-1">
                      <TestTube className="mx-auto h-6 w-6 text-slate-300" />
                      <p className="font-semibold text-slate-600">ยังไม่มีรายการสั่งตรวจแล็บในรอบการตรวจนี้</p>
                      <p className="text-[11px]">หากต้องการตรวจเลือด ปัสสาวะ หรือส่งแล็บ สามารถกดปุ่ม "สั่งตรวจแล็บเพิ่ม" ด้านบน</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {labOrders.map((order: any) => {
                        const statusObj = LAB_STATUS_MAP[order.status as LabOrderStatus] || {
                          label: order.status,
                          bg: "bg-slate-100 text-slate-700 border-slate-300",
                          icon: "📋",
                        };
                        const results = order.results || [];
                        const isCompleted = order.status === "COMPLETED";

                        return (
                          <div
                            key={order.id}
                            className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs space-y-2.5"
                          >
                            {/* Order Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-slate-950 text-sm">
                                    {order.testName}
                                  </span>
                                  <span
                                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${statusObj.bg}`}
                                  >
                                    {statusObj.icon} {statusObj.label}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-500 font-mono">
                                  สั่งตรวจเมื่อ: {new Date(order.createdAt).toLocaleDateString("th-TH")}{" "}
                                  {new Date(order.createdAt).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })} น.
                                  {order.notes && ` · คำสั่ง: ${order.notes}`}
                                </p>
                              </div>

                              {isCompleted && (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleOpenLabReport(order)}
                                  className="h-8 text-xs font-bold text-chunjai-700 hover:bg-chunjai-50 border-chunjai-200"
                                >
                                  <FileText className="mr-1.5 h-3.5 w-3.5 text-chunjai-600" />
                                  ดูใบรายงานผลแล็บทางการ (PDF)
                                </Button>
                              )}
                            </div>

                            {/* Lab Results Table or Pending Notice */}
                            {isCompleted && results.length > 0 ? (
                              <div className="border border-slate-200 rounded-lg overflow-hidden">
                                <table className="w-full text-left text-xs border-collapse">
                                  <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                                    <tr>
                                      <th className="px-3 py-1.5">รายการตรวจ (Parameter)</th>
                                      <th className="px-3 py-1.5 text-right">ค่าที่ได้ (Result)</th>
                                      <th className="px-3 py-1.5 text-center">หน่วย (Unit)</th>
                                      <th className="px-3 py-1.5 text-center">ค่าปกติอ้างอิง (Ref Range)</th>
                                      <th className="px-3 py-1.5 text-center">สถานะ</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100 font-medium">
                                    {results.map((r: any) => (
                                      <tr key={r.id} className={r.isAbnormal ? "bg-rose-50/70" : "hover:bg-slate-50"}>
                                        <td className="px-3 py-2 text-slate-900">{r.paramName}</td>
                                        <td
                                          className={`px-3 py-2 text-right font-mono font-bold text-sm ${
                                            r.isAbnormal ? "text-rose-700" : "text-slate-950"
                                          }`}
                                        >
                                          {r.value}
                                        </td>
                                        <td className="px-3 py-2 text-center text-slate-500 font-mono">{r.unit || "-"}</td>
                                        <td className="px-3 py-2 text-center text-slate-600 font-mono">{r.normalRange || "-"}</td>
                                        <td className="px-3 py-2 text-center">
                                          {r.isAbnormal ? (
                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-200 text-rose-900 border border-rose-300">
                                              ผิดปกติ
                                            </span>
                                          ) : (
                                            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-800 border border-emerald-300">
                                              ปกติ
                                            </span>
                                          )}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            ) : !isCompleted ? (
                              <div className="p-3 bg-amber-50/70 rounded-lg border border-amber-200 text-amber-900 text-xs flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-amber-600 shrink-0" />
                                  <span>กำลังรอผลการตรวจวิเคราะห์จากห้องปฏิบัติการ...</span>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => fetchDoctorQueue()}
                                  className="h-7 text-xs text-amber-800 hover:bg-amber-100"
                                >
                                  <RefreshCw className="mr-1 h-3 w-3" />
                                  ตรวจสอบผลล่าสุด
                                </Button>
                              </div>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* SOAP Note & Diagnosis Editor Card */}
              <Card>
                <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
                  <CardTitle className="text-base font-bold text-chunjai-950 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-chunjai-600" />
                    บันทึกเวชระเบียน SOAP Note & วินิจฉัยโรค (ICD-10)
                  </CardTitle>
                </CardHeader>

                <form onSubmit={handleSubmitSoap}>
                  <CardContent className="p-6 space-y-5 text-xs">
                    {errorMessage && (
                      <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-rose-700">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>{errorMessage}</span>
                      </div>
                    )}

                    {successMessage && (
                      <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-emerald-700 font-semibold">
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                        <span>{successMessage}</span>
                      </div>
                    )}

                    {/* Prescribed Summary Badge */}
                    {prescribedItems.length > 0 && (
                      <div className="p-3 bg-chunjai-50 rounded-lg border border-chunjai-100 space-y-1">
                        <span className="font-bold text-chunjai-900 block flex items-center gap-1.5">
                          <Pill className="h-4 w-4 text-chunjai-600" />
                          รายการสั่งยา ({prescribedItems.length} รายการ):
                        </span>
                        <div className="space-y-0.5 pl-5 text-slate-700">
                          {prescribedItems.map((item: any, idx: number) => (
                            <p key={idx}>
                              • {item.drug?.genericName} {item.drug?.strength} — {item.dosage} {item.frequency} (
                              {item.quantity} {item.drug?.unit})
                            </p>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* S: Subjective */}
                    <div className="space-y-1">
                      <label className="font-bold text-slate-800 block">
                        Subjective (S) — อาการสำคัญและประวัติปัจจุบัน <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        rows={2}
                        value={subjective}
                        onChange={(e) => setSubjective(e.target.value)}
                        placeholder="อาการสำคัญที่มาโรงพยาบาลและประวัติปัจจุบัน..."
                        className="w-full rounded-lg border border-slate-200 bg-slate-50/50 p-2.5 text-xs text-slate-900 focus:border-chunjai-500 focus:bg-white focus:outline-none"
                      />
                    </div>

                    {/* O: Objective */}
                    <div className="space-y-1">
                      <label className="font-bold text-slate-800 block">
                        Objective (O) — สัญญาณชีพและการตรวจร่างกาย
                      </label>
                      <textarea
                        rows={2}
                        value={objective}
                        onChange={(e) => setObjective(e.target.value)}
                        placeholder="ผลการตรวจร่างกายและสัญญาณชีพ..."
                        className="w-full rounded-lg border border-slate-200 bg-slate-50/50 p-2.5 text-xs text-slate-900 focus:border-chunjai-500 focus:bg-white focus:outline-none"
                      />
                    </div>

                    {/* A: Assessment & ICD-10 Diagnoses Picker */}
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-slate-800 block">
                          Assessment (A) — การวินิจฉัยโรคตามรหัส ICD-10 <span className="text-rose-500">*</span>
                        </label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setIsIcdModalOpen(true)}
                          className="h-8 text-xs text-chunjai-700 hover:bg-chunjai-50"
                        >
                          <Plus className="mr-1 h-3.5 w-3.5" />
                          ค้นหาและเพิ่มรหัส ICD-10
                        </Button>
                      </div>

                      {/* Diagnoses List */}
                      {diagnoses.length === 0 ? (
                        <div className="p-4 rounded-lg border border-dashed border-slate-200 text-center text-slate-400">
                          กดปุ่ม "ค้นหาและเพิ่มรหัส ICD-10" ด้านบนเพื่อระบุโรคหลักของการตรวจ
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          {diagnoses.map((d) => (
                            <div
                              key={d.icd10Code}
                              className="flex items-center justify-between p-2.5 rounded-lg border border-chunjai-100 bg-chunjai-50/40 text-xs font-medium"
                            >
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant={d.type === "PRIMARY" ? "default" : "secondary"}
                                  className={d.type === "PRIMARY" ? "bg-chunjai-600" : ""}
                                >
                                  {d.type === "PRIMARY" ? "โรคหลัก" : d.type === "SECONDARY" ? "โรคร่วม" : "แทรกซ้อน"}
                                </Badge>
                                <span className="font-mono font-bold text-chunjai-900">{d.icd10Code}</span>
                                <span className="text-slate-800">{d.icd10Name}</span>
                              </div>

                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveDiagnosis(d.icd10Code)}
                                className="h-7 w-7 text-rose-500 hover:bg-rose-50"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* P: Plan */}
                    <div className="space-y-1 pt-2 border-t border-slate-100">
                      <label className="font-bold text-slate-800 block">
                        Plan (P) — แผนการรักษา คำแนะนำ และรายการสั่งยา <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        rows={3}
                        value={plan}
                        onChange={(e) => setPlan(e.target.value)}
                        placeholder="แผนการรักษา คำแนะนำการดูแลสุขภาพ และยาที่สั่งจ่าย..."
                        className="w-full rounded-lg border border-slate-200 bg-slate-50/50 p-2.5 text-xs text-slate-900 focus:border-chunjai-500 focus:bg-white focus:outline-none"
                      />
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                      <Button
                        type="submit"
                        disabled={isPending}
                        className="bg-chunjai-600 hover:bg-chunjai-700 text-white font-bold text-xs h-10 px-6 shadow-md"
                      >
                        {isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            กำลังบันทึกและส่งต่อห้องยา...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            บันทึกผลการตรวจ & ส่งต่อห้องยา (Queue P)
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </form>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* ICD-10 Search Dialog */}
      <Icd10SearchDialog
        isOpen={isIcdModalOpen}
        onClose={() => setIsIcdModalOpen(false)}
        onSelect={handleAddIcd10}
      />

      {/* Prescription Modal */}
      {selectedVisit && (
        <PrescriptionModal
          isOpen={isPrescriptionModalOpen}
          visitId={selectedVisit.id}
          patientName={`${selectedVisit.patient?.firstName} ${selectedVisit.patient?.lastName}`}
          allergies={selectedVisit.patient?.allergies}
          onClose={() => setIsPrescriptionModalOpen(false)}
          onSuccess={() => fetchPrescription(selectedVisit.id)}
        />
      )}

      {/* Lab Order Modal */}
      {selectedVisit && (
        <CreateLabOrderModal
          isOpen={isLabModalOpen}
          initialPatient={selectedVisit.patient}
          initialVisitId={selectedVisit.id}
          initialVisit={selectedVisit}
          onClose={() => setIsLabModalOpen(false)}
          onSuccess={() => fetchDoctorQueue()}
        />
      )}

      {/* Official Printable Lab Report PDF Modal */}
      {selectedLabOrder && (
        <LabReportModal
          isOpen={isLabReportModalOpen}
          clinicInfo={clinicInfo}
          labOrder={selectedLabOrder}
          onClose={() => {
            setIsLabReportModalOpen(false);
            setSelectedLabOrder(null);
          }}
        />
      )}
    </div>
  );
}
