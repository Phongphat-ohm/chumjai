"use client";

import React, { useState, useTransition } from "react";
import {
  Stethoscope,
  Activity,
  Heart,
  Thermometer,
  Weight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TriageUrgency } from "@prisma/client";
import { saveTriageRecordAction } from "@/server/actions/triage";

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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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

  if (!isOpen || !visit) return null;

  // Live BMI Preview calculation
  const weight = parseFloat(weightKg);
  const height = parseFloat(heightCm);
  const liveBmi =
    weight > 0 && height > 0
      ? (weight / Math.pow(height / 100, 2)).toFixed(2)
      : null;

  const getBmiCategory = (bmiVal: number) => {
    if (bmiVal < 18.5) return { text: "น้ำหนักน้อย / ผอม", color: "text-amber-600 font-semibold" };
    if (bmiVal < 23.0) return { text: "ปกติ (สุขภาพดี)", color: "text-emerald-600 font-semibold" };
    if (bmiVal < 25.0) return { text: "ท้วม / น้ำหนักเกิน", color: "text-amber-600 font-semibold" };
    if (bmiVal < 30.0) return { text: "อ้วนระดับ 1", color: "text-rose-600 font-semibold" };
    return { text: "อ้วนระดับ 2 (อันตราย)", color: "text-rose-700 font-bold" };
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
        setSuccessMessage("บันทึกข้อมูลการคัดกรองและส่งต่อไปยังคิวแพทย์สำเร็จ!");
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 1200);
      } else {
        setErrorMessage(res.error || "ไม่สามารถบันทึกข้อมูลคัดกรองได้");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-xl bg-white shadow-2xl border border-chunjai-100 my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-chunjai-100 px-6 py-4 bg-chunjai-50/60 rounded-t-xl">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-chunjai-600 text-white">
              <Stethoscope className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-chunjai-950">
                คัดกรองและวัดสัญญาณชีพ (Triage & Vital Signs)
              </h3>
              <p className="text-xs text-slate-500">
                {visit.patient.firstName} {visit.patient.lastName} ({visit.patient.hn}) · Visit: {visit.visitNumber}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Allergy Alert Banner if Patient is Allergic */}
        {visit.patient.allergies && visit.patient.allergies.length > 0 && (
          <div className="bg-rose-50 border-b border-rose-200 px-6 py-2.5 flex items-center gap-2 text-xs font-bold text-rose-800">
            <ShieldAlert className="h-4 w-4 text-rose-600 shrink-0" />
            <span>
              ผู้ป่วยมีประวัติแพ้ยา: {visit.patient.allergies.map((a) => a.allergen).join(", ")}
            </span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 text-xs">
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

          {/* Chief Complaint Notice */}
          <div className="rounded-lg border border-chunjai-100 bg-chunjai-50/40 p-3">
            <span className="font-bold text-chunjai-900 block">อาการสำคัญที่มาโรงพยาบาล:</span>
            <p className="text-slate-700 mt-0.5">{visit.chiefComplaint || "ไม่ระบุ"}</p>
          </div>

          {/* Section 1: Vital Signs Grid */}
          <div className="space-y-3">
            <h4 className="font-bold text-chunjai-950 text-xs flex items-center gap-1.5 border-b border-slate-100 pb-1">
              <Activity className="h-4 w-4 text-chunjai-600" />
              การวัดสัญญาณชีพ (Vital Signs)
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Weight */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">น้ำหนัก (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  placeholder="65.0"
                  className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 text-xs text-slate-900 focus:border-chunjai-500 focus:bg-white focus:outline-none"
                />
              </div>

              {/* Height */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">ส่วนสูง (cm)</label>
                <input
                  type="number"
                  step="0.5"
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                  placeholder="170"
                  className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 text-xs text-slate-900 focus:border-chunjai-500 focus:bg-white focus:outline-none"
                />
              </div>

              {/* Live Server-Side Preview BMI */}
              <div className="space-y-1 col-span-2">
                <label className="font-semibold text-slate-700 block">BMI (คำนวณฝั่ง Server)</label>
                <div className="h-9 w-full rounded-lg border border-chunjai-200 bg-chunjai-50 px-3 flex items-center justify-between">
                  <span className="font-bold font-mono text-chunjai-900 text-sm">
                    {liveBmi ? `${liveBmi} kg/m²` : "-"}
                  </span>
                  {liveBmi && (
                    <span className={`text-[11px] ${getBmiCategory(parseFloat(liveBmi)).color}`}>
                      {getBmiCategory(parseFloat(liveBmi)).text}
                    </span>
                  )}
                </div>
              </div>

              {/* Systolic BP */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">ความดันบน (Systolic)</label>
                <input
                  type="number"
                  value={systolicBp}
                  onChange={(e) => setSystolicBp(e.target.value)}
                  placeholder="120"
                  className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 text-xs text-slate-900 focus:border-chunjai-500 focus:bg-white focus:outline-none"
                />
              </div>

              {/* Diastolic BP */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">ความดันล่าง (Diastolic)</label>
                <input
                  type="number"
                  value={diastolicBp}
                  onChange={(e) => setDiastolicBp(e.target.value)}
                  placeholder="80"
                  className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 text-xs text-slate-900 focus:border-chunjai-500 focus:bg-white focus:outline-none"
                />
              </div>

              {/* Temperature */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">อุณหภูมิ (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  value={temperatureC}
                  onChange={(e) => setTemperatureC(e.target.value)}
                  placeholder="36.5"
                  className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 text-xs text-slate-900 focus:border-chunjai-500 focus:bg-white focus:outline-none"
                />
              </div>

              {/* Pulse Rate */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">พัลส์/ชีพจร (bpm)</label>
                <input
                  type="number"
                  value={pulseRate}
                  onChange={(e) => setPulseRate(e.target.value)}
                  placeholder="78"
                  className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 text-xs text-slate-900 focus:border-chunjai-500 focus:bg-white focus:outline-none"
                />
              </div>

              {/* Respiratory Rate */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">อัตราการหายใจ (bpm)</label>
                <input
                  type="number"
                  value={respiratoryRate}
                  onChange={(e) => setRespiratoryRate(e.target.value)}
                  placeholder="18"
                  className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 text-xs text-slate-900 focus:border-chunjai-500 focus:bg-white focus:outline-none"
                />
              </div>

              {/* SpO2 */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">SpO2 (%)</label>
                <input
                  type="number"
                  value={spo2Percent}
                  onChange={(e) => setSpo2Percent(e.target.value)}
                  placeholder="98"
                  className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 text-xs text-slate-900 focus:border-chunjai-500 focus:bg-white focus:outline-none"
                />
              </div>

              {/* DTX Blood Glucose */}
              <div className="space-y-1 col-span-2">
                <label className="font-semibold text-slate-700 block">ระดับน้ำตาล DTX (mg/dL)</label>
                <input
                  type="number"
                  value={bloodGlucoseMgDl}
                  onChange={(e) => setBloodGlucoseMgDl(e.target.value)}
                  placeholder="เจาะน้ำตาลปลายนิ้ว (ถ้ามี)"
                  className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 text-xs text-slate-900 focus:border-chunjai-500 focus:bg-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Triage Urgency Level Selection (5 Colors) */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="font-bold text-chunjai-950 block">
              ระดับความรุนแรงการคัดกรอง (Triage Urgency) <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <button
                type="button"
                onClick={() => setUrgency(TriageUrgency.RESUSCITATION)}
                className={`p-2.5 rounded-lg border text-center font-bold text-xs transition-all ${
                  urgency === TriageUrgency.RESUSCITATION
                    ? "bg-rose-600 text-white border-rose-700 shadow-md ring-2 ring-rose-300"
                    : "bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100"
                }`}
              >
                🔴 วิกฤต (Red)
              </button>

              <button
                type="button"
                onClick={() => setUrgency(TriageUrgency.EMERGENCY)}
                className={`p-2.5 rounded-lg border text-center font-bold text-xs transition-all ${
                  urgency === TriageUrgency.EMERGENCY
                    ? "bg-pink-600 text-white border-pink-700 shadow-md ring-2 ring-pink-300"
                    : "bg-pink-50 text-pink-800 border-pink-200 hover:bg-pink-100"
                }`}
              >
                🩷 ฉุกเฉิน (Pink)
              </button>

              <button
                type="button"
                onClick={() => setUrgency(TriageUrgency.URGENT)}
                className={`p-2.5 rounded-lg border text-center font-bold text-xs transition-all ${
                  urgency === TriageUrgency.URGENT
                    ? "bg-amber-500 text-white border-amber-600 shadow-md ring-2 ring-amber-300"
                    : "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100"
                }`}
              >
                🟡 เร่งด่วน (Yellow)
              </button>

              <button
                type="button"
                onClick={() => setUrgency(TriageUrgency.SEMI_URGENT)}
                className={`p-2.5 rounded-lg border text-center font-bold text-xs transition-all ${
                  urgency === TriageUrgency.SEMI_URGENT
                    ? "bg-emerald-600 text-white border-emerald-700 shadow-md ring-2 ring-emerald-300"
                    : "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                }`}
              >
                🟢 ปานกลาง (Green)
              </button>

              <button
                type="button"
                onClick={() => setUrgency(TriageUrgency.NON_URGENT)}
                className={`p-2.5 rounded-lg border text-center font-bold text-xs transition-all ${
                  urgency === TriageUrgency.NON_URGENT
                    ? "bg-slate-700 text-white border-slate-800 shadow-md ring-2 ring-slate-300"
                    : "bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200"
                }`}
              >
                ⚪ ไม่เร่งด่วน (White)
              </button>
            </div>
          </div>

          {/* Triage Notes */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 block">
              บันทึกข้อสังเกตการคัดกรองพยาบาล
            </label>
            <textarea
              rows={2}
              value={triageNote}
              onChange={(e) => setTriageNote(e.target.value)}
              placeholder="บันทึกข้อสังเกตเพิ่มเติม..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50/50 p-2.5 text-xs text-slate-900 focus:border-chunjai-500 focus:bg-white focus:outline-none"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
            >
              ยกเลิก
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-chunjai-600 hover:bg-chunjai-700 text-white font-semibold"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  กำลังบันทึกและออกคิวพบแพทย์...
                </>
              ) : (
                "บันทึกคัดกรอง & ส่งพบแพทย์"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
