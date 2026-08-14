"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  Stethoscope,
  Activity,
  Heart,
  Thermometer,
  Weight,
  Ruler,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X,
  ShieldAlert,
  Sparkles,
  History,
  RotateCcw,
  Pill,
  FileText,
  HelpCircle,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TriageUrgency } from "@/generated/client";
import {
  saveTriageRecordAction,
  getPatientLatestVitalsAndHistoryAction,
} from "@/server/actions/triage";

interface TriageFormModalProps {
  isOpen: boolean;
  visit: {
    id: string;
    visitNumber: string;
    chiefComplaint?: string;
    patient: {
      id: string;
      hn: string;
      firstName: string;
      lastName: string;
      allergies?: any[];
      conditions?: any[];
      medications?: any[];
    };
  } | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export function TriageFormModal({
  isOpen,
  visit,
  onClose,
  onSuccess,
}: TriageFormModalProps) {
  const [isPending, startTransition] = useTransition();
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [notificationNote, setNotificationNote] = useState<string | null>(null);

  // Latest Patient Vital Signs & History from DB
  const [latestVital, setLatestVital] = useState<any | null>(null);
  const [patientHistory, setPatientHistory] = useState<{
    allergies: any[];
    conditions: any[];
    medications: any[];
  }>({
    allergies: [],
    conditions: [],
    medications: [],
  });

  // Vital Signs Form State
  const [weightKg, setWeightKg] = useState<string>("");
  const [heightCm, setHeightCm] = useState<string>("");
  const [temperatureC, setTemperatureC] = useState<string>("36.5");
  const [systolicBp, setSystolicBp] = useState<string>("");
  const [diastolicBp, setDiastolicBp] = useState<string>("");
  const [pulseRate, setPulseRate] = useState<string>("");
  const [respiratoryRate, setRespiratoryRate] = useState<string>("18");
  const [spo2Percent, setSpo2Percent] = useState<string>("98");
  const [bloodGlucoseMgDl, setBloodGlucoseMgDl] = useState<string>("");
  const [painScore, setPainScore] = useState<number>(0);
  const [urgency, setUrgency] = useState<TriageUrgency>(TriageUrgency.SEMI_URGENT);
  const [triageNote, setTriageNote] = useState<string>("");

  // Load Patient History & Latest Vitals when modal opens
  useEffect(() => {
    if (isOpen && visit?.patient?.id) {
      setErrorMessage(null);
      setSuccessMessage(null);
      setNotificationNote(null);
      setIsLoadingHistory(true);

      getPatientLatestVitalsAndHistoryAction(visit.patient.id)
        .then((res) => {
          if (res.success && res.data) {
            setLatestVital(res.data.latestVital);
            setPatientHistory(res.data.patientHistory);

            // If height was previously measured, auto-suggest or prefill height
            if (res.data.latestVital?.heightCm) {
              setHeightCm(res.data.latestVital.heightCm.toString());
            }
          }
        })
        .catch((e) => console.error("Error fetching latest vitals:", e))
        .finally(() => setIsLoadingHistory(false));
    } else {
      setLatestVital(null);
      setWeightKg("");
      setHeightCm("");
      setTemperatureC("36.5");
      setSystolicBp("");
      setDiastolicBp("");
      setPulseRate("");
      setRespiratoryRate("18");
      setSpo2Percent("98");
      setBloodGlucoseMgDl("");
      setPainScore(0);
      setUrgency(TriageUrgency.SEMI_URGENT);
      setTriageNote("");
    }
  }, [isOpen, visit]);

  if (!isOpen || !visit) return null;

  // Live BMI Preview calculation
  const weight = parseFloat(weightKg);
  const height = parseFloat(heightCm);
  const liveBmi =
    weight > 0 && height > 0
      ? (weight / Math.pow(height / 100, 2)).toFixed(2)
      : null;

  const bmiVal = liveBmi ? parseFloat(liveBmi) : null;

  // Target Healthy Weight Range calculation based on Height (BMI 18.5 - 22.9 Asian Standard)
  const minHealthyWeight = height > 0 ? (18.5 * Math.pow(height / 100, 2)).toFixed(1) : null;
  const maxHealthyWeight = height > 0 ? (22.9 * Math.pow(height / 100, 2)).toFixed(1) : null;

  const getBmiCategory = (bmi: number) => {
    if (bmi < 18.5) {
      return {
        text: "น้ำหนักน้อยกว่าเกณฑ์ (ผอม)",
        color: "bg-sky-100 text-sky-800 border-sky-300",
        advice: "ควรได้รับสารอาหารและโปรตีนเพิ่มเติม",
      };
    }
    if (bmi < 23.0) {
      return {
        text: "สมส่วน / สุขภาพดี (Normal)",
        color: "bg-emerald-100 text-emerald-800 border-emerald-300",
        advice: "น้ำหนักอยู่ในเกณฑ์มาตรฐานสมส่วน",
      };
    }
    if (bmi < 25.0) {
      return {
        text: "ท้วม / น้ำหนักเกิน (Overweight)",
        color: "bg-amber-100 text-amber-800 border-amber-300",
        advice: "ควรควบคุมอาหารและออกกำลังกายสม่ำเสมอ",
      };
    }
    if (bmi < 30.0) {
      return {
        text: "โรคอ้วนระดับ 1 (Obese Class 1)",
        color: "bg-rose-100 text-rose-800 border-rose-300",
        advice: "มีความเสี่ยงโรคความดันโลหิตสูงและเบาหวาน",
      };
    }
    return {
      text: "โรคอ้วนระดับ 2 (Severe Obese)",
      color: "bg-rose-200 text-rose-900 border-rose-400 font-bold",
      advice: "มีความเสี่ยงสูงต่อโรคหลอดเลือดหัวใจและเมตาบอลิก",
    };
  };

  // Quick fill handlers
  const handleFillField = (field: string, value: any, labelText: string) => {
    if (value === undefined || value === null || value === "") return;
    switch (field) {
      case "height":
        setHeightCm(value.toString());
        break;
      case "weight":
        setWeightKg(value.toString());
        break;
      case "bp":
        if (value.systolic) setSystolicBp(value.systolic.toString());
        if (value.diastolic) setDiastolicBp(value.diastolic.toString());
        break;
      case "temperature":
        setTemperatureC(value.toString());
        break;
      case "pulse":
        setPulseRate(value.toString());
        break;
      case "rr":
        setRespiratoryRate(value.toString());
        break;
      case "spo2":
        setSpo2Percent(value.toString());
        break;
      case "glucose":
        setBloodGlucoseMgDl(value.toString());
        break;
      case "pain":
        setPainScore(Number(value));
        break;
    }
    setNotificationNote(`ดึงค่า "${labelText}" จากประวัติล่าสุดเรียบร้อย`);
    setTimeout(() => setNotificationNote(null), 2500);
  };

  const handleFillAllStableValues = () => {
    if (!latestVital) return;
    if (latestVital.heightCm) setHeightCm(latestVital.heightCm.toString());
    if (latestVital.temperatureC) setTemperatureC(latestVital.temperatureC.toString());
    if (latestVital.respiratoryRate) setRespiratoryRate(latestVital.respiratoryRate.toString());
    if (latestVital.spo2Percent) setSpo2Percent(latestVital.spo2Percent.toString());
    if (latestVital.pulseRate) setPulseRate(latestVital.pulseRate.toString());
    setNotificationNote("ดึงค่ามาตรฐานจากประวัติเดิมครบถ้วนแล้ว");
    setTimeout(() => setNotificationNote(null), 2500);
  };

  const handleFillAllLatestVitals = () => {
    if (!latestVital) return;
    if (latestVital.heightCm) setHeightCm(latestVital.heightCm.toString());
    if (latestVital.weightKg) setWeightKg(latestVital.weightKg.toString());
    if (latestVital.systolicBp) setSystolicBp(latestVital.systolicBp.toString());
    if (latestVital.diastolicBp) setDiastolicBp(latestVital.diastolicBp.toString());
    if (latestVital.temperatureC) setTemperatureC(latestVital.temperatureC.toString());
    if (latestVital.pulseRate) setPulseRate(latestVital.pulseRate.toString());
    if (latestVital.respiratoryRate) setRespiratoryRate(latestVital.respiratoryRate.toString());
    if (latestVital.spo2Percent) setSpo2Percent(latestVital.spo2Percent.toString());
    if (latestVital.bloodGlucoseMgDl) setBloodGlucoseMgDl(latestVital.bloodGlucoseMgDl.toString());
    if (latestVital.painScore !== null && latestVital.painScore !== undefined) {
      setPainScore(latestVital.painScore);
    }
    setNotificationNote("ดึงค่าสัญญาณชีพและประวัติล่าสุดทั้งหมดเรียบร้อย");
    setTimeout(() => setNotificationNote(null), 2500);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const formData = {
      visitId: visit.id,
      weightKg: weight > 0 ? weight : undefined,
      heightCm: height > 0 ? height : undefined,
      temperatureC: parseFloat(temperatureC) || undefined,
      systolicBp: parseInt(systolicBp, 10) || undefined,
      diastolicBp: parseInt(diastolicBp, 10) || undefined,
      pulseRate: parseInt(pulseRate, 10) || undefined,
      respiratoryRate: parseInt(respiratoryRate, 10) || undefined,
      spo2Percent: parseInt(spo2Percent, 10) || undefined,
      bloodGlucoseMgDl: parseInt(bloodGlucoseMgDl, 10) || undefined,
      painScore,
      urgency,
      triageNote,
    };

    startTransition(async () => {
      const res = await saveTriageRecordAction(formData);
      if (res.success) {
        setSuccessMessage("บันทึกข้อมูลการคัดกรองและส่งต่อไปยังคิวห้องตรวจแพทย์สำเร็จ!");
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 1000);
      } else {
        setErrorMessage(res.error || "ไม่สามารถบันทึกข้อมูลคัดกรองได้");
      }
    });
  };

  const lastRecordedDateStr = latestVital?.createdAt
    ? `${new Date(latestVital.createdAt).toLocaleDateString("th-TH")} (${new Date(latestVital.createdAt).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })} น.)`
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-2 sm:p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-3.5 bg-slate-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-chunjai-600 text-white shadow-md shrink-0">
              <Stethoscope className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-950">
                  ซักประวัติและคัดกรองสัญญาณชีพ (Triage & Anamnesis)
                </h3>
                <span className="font-mono text-xs font-bold text-chunjai-700 px-2 py-0.5 rounded bg-chunjai-100">
                  {visit.visitNumber}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                ผู้ป่วย: <span className="font-bold text-slate-800">{visit.patient.firstName} {visit.patient.lastName}</span> (HN: {visit.patient.hn})
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-slate-500 hover:text-slate-900 rounded-lg"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden min-h-0">
          {/* Scrollable Form Body */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs">
            {errorMessage && (
              <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-rose-700 font-medium">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-emerald-700 font-semibold">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>{successMessage}</span>
              </div>
            )}

          {notificationNote && (
            <div className="flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 p-2.5 text-blue-800 font-medium animate-in fade-in">
              <Sparkles className="h-3.5 w-3.5 shrink-0 text-blue-600" />
              <span>{notificationNote}</span>
            </div>
          )}

          {/* Smart Auto-Fill Helper Banner */}
          {latestVital ? (
            <div className="p-3.5 rounded-xl border border-chunjai-200 bg-chunjai-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <History className="h-4 w-4 text-chunjai-600 mt-0.5 shrink-0" />
                <div className="space-y-0.5">
                  <p className="font-bold text-slate-900">
                    พบข้อมูลสัญญาณชีพเดิมในระบบ (ตรวจเมื่อ {lastRecordedDateStr})
                  </p>
                  <p className="text-[11px] text-slate-600">
                    ส่วนสูง: <span className="font-semibold text-slate-900">{latestVital.heightCm || "-"} cm</span> · 
                    น้ำหนักเดิม: <span className="font-semibold text-slate-900">{latestVital.weightKg || "-"} kg</span> · 
                    ความดันเดิม: <span className="font-semibold text-slate-900">{latestVital.systolicBp && latestVital.diastolicBp ? `${latestVital.systolicBp}/${latestVital.diastolicBp}` : "-"} mmHg</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleFillAllStableValues}
                  className="h-8 text-xs font-bold text-chunjai-700 bg-white hover:bg-chunjai-100 border-chunjai-300 shadow-2xs"
                  title="เติมเฉพาะค่าที่ไม่ค่อยเปลี่ยน เช่น ส่วนสูง, SpO2, ชีพจร"
                >
                  <Sparkles className="mr-1.5 h-3.5 w-3.5 text-chunjai-600" />
                  ดึงส่วนสูง & ค่าคงที่
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleFillAllLatestVitals}
                  className="h-8 text-xs font-bold text-white bg-chunjai-600 hover:bg-chunjai-700 shadow-2xs"
                  title="เติมข้อมูลทุกช่องตามค่าล่าสุดที่เคยบันทึกไว้"
                >
                  <Zap className="mr-1.5 h-3.5 w-3.5" />
                  ดึงค่าล่าสุดทั้งหมด
                </Button>
              </div>
            </div>
          ) : isLoadingHistory ? (
            <div className="p-3 text-center text-slate-400 flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-chunjai-600" />
              <span>กำลังค้นหาประวัติการตรวจเดิมของผู้ป่วย...</span>
            </div>
          ) : null}

          {/* Patient Anamnesis / Medical History Summary Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50/60">
            {/* Allergies */}
            <div className="space-y-1">
              <span className="font-bold text-slate-700 block flex items-center gap-1.5">
                <ShieldAlert className="h-3.5 w-3.5 text-rose-600" />
                ประวัติแพ้ยา / สารก่อภูมิแพ้:
              </span>
              {patientHistory.allergies?.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {patientHistory.allergies.map((a: any, idx: number) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-300 font-bold text-[10px]">
                      {a.allergen} ({a.reaction || "แพ้"})
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-slate-400 text-[11px]">ไม่มีประวัติแพ้ยา</span>
              )}
            </div>

            {/* Conditions */}
            <div className="space-y-1">
              <span className="font-bold text-slate-700 block flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5 text-indigo-600" />
                โรคประจำตัว (Conditions):
              </span>
              {patientHistory.conditions?.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {patientHistory.conditions.map((c: any, idx: number) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 border border-indigo-200 text-[10px]">
                      {c.condition}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-slate-400 text-[11px]">ไม่มีโรคประจำตัว</span>
              )}
            </div>

            {/* Chronic Medications */}
            <div className="space-y-1">
              <span className="font-bold text-slate-700 block flex items-center gap-1.5">
                <Pill className="h-3.5 w-3.5 text-purple-600" />
                ยาที่รับประทานประจำ:
              </span>
              {patientHistory.medications?.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {patientHistory.medications.map((m: any, idx: number) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-200 text-[10px]">
                      {m.drugName}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-slate-400 text-[11px]">ไม่มียารับประทานประจำ</span>
              )}
            </div>
          </div>

          {/* Chief Complaint / S: Subjective */}
          <div className="space-y-1">
            <label className="font-bold text-slate-800 block">
              อาการสำคัญที่มาโรงพยาบาล (Chief Complaint)
            </label>
            <input
              type="text"
              readOnly
              value={visit.chiefComplaint || "ไม่ระบุ"}
              className="h-9 w-full rounded-xl border border-slate-200 bg-slate-100 px-3 text-xs font-semibold text-slate-700 cursor-not-allowed"
            />
          </div>

          {/* VITAL SIGNS GRID */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                <Activity className="h-4 w-4 text-chunjai-600" />
                บันทึกสัญญาณชีพ & สัดส่วนร่างกาย (Vital Signs)
              </h4>
              <span className="text-[11px] text-slate-400">
                กดปุ่มสีฟ้าข้างชื่อช่องเพื่อดึงค่าเดิมจากประวัติล่าสุด
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
              {/* 1. ส่วนสูง (Height) */}
              <div className="space-y-1.5 p-3 rounded-xl border border-slate-200 bg-slate-50/40">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 flex items-center gap-1 text-[11px]">
                    <Ruler className="h-3.5 w-3.5 text-chunjai-600" />
                    ส่วนสูง (cm)
                  </label>
                  {latestVital?.heightCm && (
                    <button
                      type="button"
                      onClick={() => handleFillField("height", latestVital.heightCm, "ส่วนสูง")}
                      className="inline-flex items-center gap-1 text-[10px] font-bold text-chunjai-700 bg-chunjai-100 hover:bg-chunjai-200 px-1.5 py-0.5 rounded transition-colors"
                      title="กดเพื่อดึงค่าส่วนสูงเดิม"
                    >
                      <Sparkles className="h-2.5 w-2.5" />
                      เดิม: {latestVital.heightCm}
                    </button>
                  )}
                </div>
                <input
                  type="number"
                  step="0.1"
                  placeholder="เช่น 168.0"
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                  className="h-9 w-full rounded-lg border border-slate-300 bg-white px-2.5 font-mono text-xs font-bold text-slate-900 focus:border-chunjai-500 focus:outline-none"
                />
              </div>

              {/* 2. น้ำหนัก (Weight) */}
              <div className="space-y-1.5 p-3 rounded-xl border border-slate-200 bg-slate-50/40">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 flex items-center gap-1 text-[11px]">
                    <Weight className="h-3.5 w-3.5 text-chunjai-600" />
                    น้ำหนัก (kg)
                  </label>
                  {latestVital?.weightKg && (
                    <button
                      type="button"
                      onClick={() => handleFillField("weight", latestVital.weightKg, "น้ำหนัก")}
                      className="inline-flex items-center gap-1 text-[10px] font-bold text-chunjai-700 bg-chunjai-100 hover:bg-chunjai-200 px-1.5 py-0.5 rounded transition-colors"
                      title="กดเพื่อดึงค่าน้ำหนักเดิม"
                    >
                      <Sparkles className="h-2.5 w-2.5" />
                      เดิม: {latestVital.weightKg}
                    </button>
                  )}
                </div>
                <input
                  type="number"
                  step="0.1"
                  placeholder="เช่น 65.5"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  className="h-9 w-full rounded-lg border border-slate-300 bg-white px-2.5 font-mono text-xs font-bold text-slate-900 focus:border-chunjai-500 focus:outline-none"
                />
              </div>

              {/* 3. ความดันโลหิต (Systolic / Diastolic) */}
              <div className="space-y-1.5 p-3 rounded-xl border border-slate-200 bg-slate-50/40 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 flex items-center gap-1 text-[11px]">
                    <Heart className="h-3.5 w-3.5 text-rose-600" />
                    ความดันโลหิต (BP mmHg)
                  </label>
                  {latestVital?.systolicBp && latestVital?.diastolicBp && (
                    <button
                      type="button"
                      onClick={() =>
                        handleFillField(
                          "bp",
                          { systolic: latestVital.systolicBp, diastolic: latestVital.diastolicBp },
                          "ความดันโลหิต"
                        )
                      }
                      className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-100 hover:bg-rose-200 px-1.5 py-0.5 rounded transition-colors"
                      title="กดเพื่อดึงค่าความดันเดิม"
                    >
                      <Sparkles className="h-2.5 w-2.5" />
                      เดิม: {latestVital.systolicBp}/{latestVital.diastolicBp}
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="บน (SYS)"
                    value={systolicBp}
                    onChange={(e) => setSystolicBp(e.target.value)}
                    className="h-9 w-full rounded-lg border border-slate-300 bg-white px-2.5 font-mono text-xs font-bold text-slate-900 focus:border-chunjai-500 focus:outline-none"
                  />
                  <span className="font-bold text-slate-400">/</span>
                  <input
                    type="number"
                    placeholder="ล่าง (DIA)"
                    value={diastolicBp}
                    onChange={(e) => setDiastolicBp(e.target.value)}
                    className="h-9 w-full rounded-lg border border-slate-300 bg-white px-2.5 font-mono text-xs font-bold text-slate-900 focus:border-chunjai-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* 4. อุณหภูมิ (Temperature) */}
              <div className="space-y-1.5 p-3 rounded-xl border border-slate-200 bg-slate-50/40">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 flex items-center gap-1 text-[11px]">
                    <Thermometer className="h-3.5 w-3.5 text-amber-600" />
                    อุณหภูมิ (°C)
                  </label>
                  {latestVital?.temperatureC && (
                    <button
                      type="button"
                      onClick={() => handleFillField("temperature", latestVital.temperatureC, "อุณหภูมิ")}
                      className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100 hover:bg-amber-200 px-1.5 py-0.5 rounded transition-colors"
                    >
                      <Sparkles className="h-2.5 w-2.5" />
                      เดิม: {latestVital.temperatureC}
                    </button>
                  )}
                </div>
                <input
                  type="number"
                  step="0.1"
                  value={temperatureC}
                  onChange={(e) => setTemperatureC(e.target.value)}
                  className="h-9 w-full rounded-lg border border-slate-300 bg-white px-2.5 font-mono text-xs font-bold text-slate-900 focus:border-chunjai-500 focus:outline-none"
                />
              </div>

              {/* 5. ชีพจร (Pulse Rate) */}
              <div className="space-y-1.5 p-3 rounded-xl border border-slate-200 bg-slate-50/40">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 flex items-center gap-1 text-[11px]">
                    <Activity className="h-3.5 w-3.5 text-indigo-600" />
                    ชีพจร (HR bpm)
                  </label>
                  {latestVital?.pulseRate && (
                    <button
                      type="button"
                      onClick={() => handleFillField("pulse", latestVital.pulseRate, "ชีพจร")}
                      className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-700 bg-indigo-100 hover:bg-indigo-200 px-1.5 py-0.5 rounded transition-colors"
                    >
                      <Sparkles className="h-2.5 w-2.5" />
                      เดิม: {latestVital.pulseRate}
                    </button>
                  )}
                </div>
                <input
                  type="number"
                  placeholder="เช่น 78"
                  value={pulseRate}
                  onChange={(e) => setPulseRate(e.target.value)}
                  className="h-9 w-full rounded-lg border border-slate-300 bg-white px-2.5 font-mono text-xs font-bold text-slate-900 focus:border-chunjai-500 focus:outline-none"
                />
              </div>

              {/* 6. อัตราการหายใจ (RR) */}
              <div className="space-y-1.5 p-3 rounded-xl border border-slate-200 bg-slate-50/40">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 flex items-center gap-1 text-[11px]">
                    อัตราหายใจ (RR /min)
                  </label>
                  {latestVital?.respiratoryRate && (
                    <button
                      type="button"
                      onClick={() => handleFillField("rr", latestVital.respiratoryRate, "อัตราการหายใจ")}
                      className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-700 bg-slate-200 hover:bg-slate-300 px-1.5 py-0.5 rounded transition-colors"
                    >
                      <Sparkles className="h-2.5 w-2.5" />
                      เดิม: {latestVital.respiratoryRate}
                    </button>
                  )}
                </div>
                <input
                  type="number"
                  value={respiratoryRate}
                  onChange={(e) => setRespiratoryRate(e.target.value)}
                  className="h-9 w-full rounded-lg border border-slate-300 bg-white px-2.5 font-mono text-xs font-bold text-slate-900 focus:border-chunjai-500 focus:outline-none"
                />
              </div>

              {/* 7. SpO2 */}
              <div className="space-y-1.5 p-3 rounded-xl border border-slate-200 bg-slate-50/40">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 flex items-center gap-1 text-[11px]">
                    SpO2 (%)
                  </label>
                  {latestVital?.spo2Percent && (
                    <button
                      type="button"
                      onClick={() => handleFillField("spo2", latestVital.spo2Percent, "SpO2")}
                      className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 px-1.5 py-0.5 rounded transition-colors"
                    >
                      <Sparkles className="h-2.5 w-2.5" />
                      เดิม: {latestVital.spo2Percent}
                    </button>
                  )}
                </div>
                <input
                  type="number"
                  value={spo2Percent}
                  onChange={(e) => setSpo2Percent(e.target.value)}
                  className="h-9 w-full rounded-lg border border-slate-300 bg-white px-2.5 font-mono text-xs font-bold text-slate-900 focus:border-chunjai-500 focus:outline-none"
                />
              </div>

              {/* 8. ระดับน้ำตาล (DTX) */}
              <div className="space-y-1.5 p-3 rounded-xl border border-slate-200 bg-slate-50/40 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 flex items-center gap-1 text-[11px]">
                    ระดับน้ำตาลปลายนิ้ว (DTX mg/dL)
                  </label>
                  {latestVital?.bloodGlucoseMgDl && (
                    <button
                      type="button"
                      onClick={() => handleFillField("glucose", latestVital.bloodGlucoseMgDl, "ระดับน้ำตาล DTX")}
                      className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-700 bg-purple-100 hover:bg-purple-200 px-1.5 py-0.5 rounded transition-colors"
                    >
                      <Sparkles className="h-2.5 w-2.5" />
                      เดิม: {latestVital.bloodGlucoseMgDl}
                    </button>
                  )}
                </div>
                <input
                  type="number"
                  placeholder="เช่น 100 (หากไม่ได้ตรวจเว้นว่างได้)"
                  value={bloodGlucoseMgDl}
                  onChange={(e) => setBloodGlucoseMgDl(e.target.value)}
                  className="h-9 w-full rounded-lg border border-slate-300 bg-white px-2.5 font-mono text-xs font-bold text-slate-900 focus:border-chunjai-500 focus:outline-none"
                />
              </div>

              {/* 9. Pain Score */}
              <div className="space-y-1.5 p-3 rounded-xl border border-slate-200 bg-slate-50/40 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 flex items-center gap-1 text-[11px]">
                    ระดับความเจ็บปวด (Pain Score: {painScore}/10)
                  </label>
                  {latestVital?.painScore !== undefined && latestVital?.painScore !== null && (
                    <button
                      type="button"
                      onClick={() => handleFillField("pain", latestVital.painScore, "Pain Score")}
                      className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-700 bg-slate-200 hover:bg-slate-300 px-1.5 py-0.5 rounded transition-colors"
                    >
                      <Sparkles className="h-2.5 w-2.5" />
                      เดิม: {latestVital.painScore}
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-3 pt-1">
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={painScore}
                    onChange={(e) => setPainScore(parseInt(e.target.value, 10))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-chunjai-600"
                  />
                  <span className={`font-mono font-bold text-sm px-2 py-0.5 rounded ${painScore > 6 ? "bg-rose-500 text-white" : painScore > 3 ? "bg-amber-500 text-white" : "bg-slate-100 text-slate-800"}`}>
                    {painScore}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* REAL-TIME BMI & BODY COMPOSITION CARD */}
          <div className="p-4 rounded-xl border border-chunjai-200 bg-chunjai-50/50 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-xs">
                  ดัชนีมวลกายแบบเรียลไทม์ (Body Mass Index):
                </span>
                {bmiVal ? (
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-black text-chunjai-900">
                      {bmiVal} kg/m²
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getBmiCategory(bmiVal).color}`}>
                      {getBmiCategory(bmiVal).text}
                    </span>
                  </div>
                ) : (
                  <span className="text-slate-400 text-xs">
                    (กรอกส่วนสูงและน้ำหนักเพื่อคำนวณอัตโนมัติ)
                  </span>
                )}
              </div>

              {minHealthyWeight && maxHealthyWeight && (
                <div className="text-[11px] text-slate-600 bg-white px-2.5 py-1 rounded-lg border border-chunjai-100">
                  ⚖️ ช่วงน้ำหนักมาตรฐานที่เหมาะสม: <span className="font-bold text-chunjai-800">{minHealthyWeight} - {maxHealthyWeight} kg</span>
                </div>
              )}
            </div>

            {bmiVal && (
              <p className="text-[11px] text-slate-600 italic">
                คำแนะนำ: {getBmiCategory(bmiVal).advice}
              </p>
            )}
          </div>

          {/* TRIAGE URGENCY LEVEL SELECTION */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="font-bold text-slate-800 block text-xs">
              ระดับความเร่งด่วนในการตรวจ (Triage Urgency Level) <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
              <button
                type="button"
                onClick={() => setUrgency(TriageUrgency.RESUSCITATION)}
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                  urgency === TriageUrgency.RESUSCITATION
                    ? "bg-rose-600 text-white border-rose-700 shadow-md ring-2 ring-rose-400"
                    : "bg-white text-rose-700 border-rose-200 hover:bg-rose-50"
                }`}
              >
                🔴 ระดับ 1 (วิกฤต)
              </button>

              <button
                type="button"
                onClick={() => setUrgency(TriageUrgency.EMERGENCY)}
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                  urgency === TriageUrgency.EMERGENCY
                    ? "bg-pink-600 text-white border-pink-700 shadow-md ring-2 ring-pink-400"
                    : "bg-white text-pink-700 border-pink-200 hover:bg-pink-50"
                }`}
              >
                🟣 ระดับ 2 (ฉุกเฉิน)
              </button>

              <button
                type="button"
                onClick={() => setUrgency(TriageUrgency.URGENT)}
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                  urgency === TriageUrgency.URGENT
                    ? "bg-amber-600 text-white border-amber-700 shadow-md ring-2 ring-amber-400"
                    : "bg-white text-amber-700 border-amber-200 hover:bg-amber-50"
                }`}
              >
                🟡 ระดับ 3 (ด่วน)
              </button>

              <button
                type="button"
                onClick={() => setUrgency(TriageUrgency.SEMI_URGENT)}
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                  urgency === TriageUrgency.SEMI_URGENT
                    ? "bg-emerald-600 text-white border-emerald-700 shadow-md ring-2 ring-emerald-400"
                    : "bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                }`}
              >
                🟢 ระดับ 4 (ไม่ด่วน)
              </button>

              <button
                type="button"
                onClick={() => setUrgency(TriageUrgency.NON_URGENT)}
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                  urgency === TriageUrgency.NON_URGENT
                    ? "bg-slate-700 text-white border-slate-800 shadow-md ring-2 ring-slate-400"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                ⚪ ระดับ 5 (ทั่วไป)
              </button>
            </div>
          </div>

          {/* Triage Note / History Remarks */}
          <div className="space-y-1">
            <label className="font-bold text-slate-800 block">
              บันทึกการซักประวัติเพิ่มเติม / ข้อสังเกตของพยาบาลคัดกรอง
            </label>
            <textarea
              rows={2}
              value={triageNote}
              onChange={(e) => setTriageNote(e.target.value)}
              placeholder="เช่น ผู้ป่วยรู้สึกเวียนศีรษะ ทานข้าวได้น้อย, ปวดท้องด้านขวาล่างมา 2 วัน..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs focus:border-chunjai-500 focus:bg-white focus:outline-none"
            />
          </div>

          </div>

          {/* Sticky Modal Footer Action Bar */}
          <div className="flex items-center justify-end gap-3 px-6 py-3.5 border-t border-slate-200 bg-slate-50 shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
              className="h-9 text-xs font-semibold border-slate-300"
            >
              ยกเลิก
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-chunjai-600 hover:bg-chunjai-700 text-white font-bold text-xs h-9 px-6 shadow-sm"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  กำลังบันทึกและส่งคิวแพทย์...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  บันทึกสัญญาณชีพ & ส่งต่อห้องตรวจแพทย์ (Queue A)
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
