"use client";

import React, { useState, useEffect, useTransition } from "react";
import Link from "next/link";
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
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  getDoctorQueueVisitsAction,
  startConsultationAction,
  saveSoapAndDiagnosisAction,
} from "@/server/actions/doctor";
import { getPrescriptionByVisitAction } from "@/server/actions/prescription";
import { Icd10SearchDialog } from "@/components/doctor/Icd10SearchDialog";
import { PrescriptionModal } from "@/components/doctor/PrescriptionModal";
import { Icd10Item } from "@/lib/icd10-data";
import { DiagnosisType } from "@/generated/client";

export default function DoctorConsultationPage() {
  const [isPending, startTransition] = useTransition();
  const [visits, setVisits] = useState<any[]>([]);
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchDoctorQueue = () => {
    startTransition(async () => {
      const res = await getDoctorQueueVisitsAction();
      if (res.success && res.data) {
        setVisits(res.data);
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
    setSubjective(visit.chiefComplaint || "");

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

    // Load existing SOAP if present
    if (visit.consultation?.soapNote) {
      const s = visit.consultation.soapNote;
      setSubjective(s.subjective || "");
      setObjective(s.objective || "");
      setAssessment(s.assessment || "");
      setPlan(s.plan || "");
    }

    if (visit.consultation?.diagnoses) {
      setDiagnoses(
        visit.consultation.diagnoses.map((d: any) => ({
          icd10Code: d.icd10Code,
          icd10Name: d.icd10Name,
          type: d.type as DiagnosisType,
          notes: d.notes || undefined,
        }))
      );
    } else {
      setDiagnoses([]);
    }

    fetchPrescription(visit.id);

    // Start Consultation Server Action
    startTransition(async () => {
      await startConsultationAction(visit.id);
    });
  };

  const handleAddIcd10 = (item: Icd10Item, type: DiagnosisType) => {
    if (diagnoses.some((d) => d.icd10Code === item.code)) return;

    const newDiagnoses = [
      ...diagnoses,
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
    setAssessment(updated.map((d) => `${d.icd10Code} (${d.icd10Name})`).join(", "));
  };

  const handleSubmitSoap = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedVisit) return;
    setErrorMessage(null);
    setSuccessMessage(null);

    if (diagnoses.length === 0) {
      setErrorMessage("กรุณาระบุรหัสวินิจฉัยโรค ICD-10 อย่างน้อย 1 โรคหลัก");
      return;
    }

    startTransition(async () => {
      const res = await saveSoapAndDiagnosisAction({
        visitId: selectedVisit.id,
        subjective,
        objective,
        assessment,
        plan,
        diagnoses,
      });

      if (res.success) {
        setSuccessMessage("บันทึกผลการตรวจรักษาและส่งต่อห้องยาสำเร็จ!");
        setTimeout(() => {
          setSelectedVisit(null);
          fetchDoctorQueue();
        }, 1200);
      } else {
        setErrorMessage(res.error || "ไม่สามารถบันทึกผลการตรวจรักษาได้");
      }
    });
  };

  const vs = selectedVisit?.vitalSigns?.[0];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-chunjai-600 text-white shadow-md">
              <UserCheck className="h-5 w-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-chunjai-950">
              ห้องตรวจแพทย์ (Doctor Consultation Hub)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            ตรวจรักษา บันทึกเวชระเบียน SOAP Note วินิจฉัยโรคตาม ICD-10 และสั่งยา
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchDoctorQueue()}
          className="text-xs font-semibold"
        >
          รีเฟรชคิวแพทย์
        </Button>
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 md:grid-cols-12">
        {/* Left Column: Doctor Queue Waiting List */}
        <div className="md:col-span-4 space-y-4">
          <Card className="border-chunjai-200">
            <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Users className="h-4 w-4 text-chunjai-600" />
                คิวผู้ป่วยรอตรวจ ({visits.length} คน)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 space-y-1.5 max-h-[70vh] overflow-y-auto">
              {isPending && visits.length === 0 ? (
                <div className="p-8 text-center text-slate-400 space-y-2">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-chunjai-600" />
                  <p className="text-xs">กำลังโหลดคิว...</p>
                </div>
              ) : visits.length === 0 ? (
                <div className="p-8 text-center text-slate-400 space-y-1">
                  <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-400" />
                  <p className="text-xs font-bold text-slate-700">ไม่มีคิวรอตรวจในขณะนี้</p>
                </div>
              ) : (
                visits.map((visit) => {
                  const isSelected = selectedVisit?.id === visit.id;
                  const queueNum = visit.queues?.[0]?.queueNumber || "A";
                  const hasAllergies = visit.patient?.allergies?.length > 0;

                  return (
                    <div
                      key={visit.id}
                      onClick={() => handleSelectVisit(visit)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                        isSelected
                          ? "bg-chunjai-600 text-white border-chunjai-700 shadow-md"
                          : "bg-white text-slate-900 border-slate-200 hover:border-chunjai-300 hover:bg-chunjai-50/50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`font-extrabold font-mono text-sm ${isSelected ? "text-white" : "text-chunjai-700"}`}>
                          {queueNum}
                        </span>
                        <span className={`text-[10px] font-mono ${isSelected ? "text-chunjai-100" : "text-slate-400"}`}>
                          {visit.visitNumber}
                        </span>
                      </div>

                      <p className="font-bold text-sm mt-1">
                        {visit.patient?.firstName} {visit.patient?.lastName}
                      </p>

                      <p className={`text-[11px] truncate mt-0.5 ${isSelected ? "text-chunjai-100" : "text-slate-500"}`}>
                        อาการ: {visit.chiefComplaint || "-"}
                      </p>

                      {hasAllergies && (
                        <div className="mt-2 inline-flex items-center gap-1 rounded bg-rose-500 text-white px-2 py-0.5 text-[10px] font-bold">
                          <ShieldAlert className="h-3 w-3" />
                          แพ้ยา!
                        </div>
                      )}
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
                ระบบจะเปิดแฟ้มประวัติสุขภาพ สัญญาณชีพที่พยาบาลคัดกรอง และฟอร์มสั่งยา
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

                    <div className="flex items-center gap-2">
                      {selectedVisit.patient?.allergies?.length > 0 && (
                        <Badge variant="destructive" className="text-xs font-bold">
                          <ShieldAlert className="mr-1 h-3.5 w-3.5" />
                          แพ้ยา: {selectedVisit.patient.allergies.map((a: any) => a.allergen).join(", ")}
                        </Badge>
                      )}

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
                        <div className="flex flex-wrap gap-1.5">
                          {prescribedItems.map((it: any) => (
                            <Badge key={it.id} variant="secondary" className="text-[10px] bg-white border border-chunjai-200">
                              {it.drug?.genericName || "ยา"} ({it.quantity} {it.drug?.unit || "เม็ด"}) — {it.dosage} {it.frequency}
                            </Badge>
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
                        required
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
                        required
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
    </div>
  );
}
