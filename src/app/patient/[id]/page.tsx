"use client";

import React, { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  User,
  ArrowLeft,
  ShieldAlert,
  Plus,
  Eye,
  EyeOff,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  Activity,
  Clock,
  HeartPulse,
  CheckCircle2,
  FileText,
  Loader2,
  Lock,
  Unlock,
  KeyRound,
  ChevronRight,
  Stethoscope,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { maskNationalId, maskPhoneNumber } from "@/lib/masking";
import { getPatientDetailAction } from "@/server/actions/patient";
import { AddAllergyDialog } from "@/components/patients/AddAllergyDialog";
import { VerifyPatientIdentityModal } from "@/components/patients/VerifyPatientIdentityModal";
import { VisitDetailModal } from "@/components/patients/VisitDetailModal";

export default function PatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;

  const [isPending, startTransition] = useTransition();
  const [patient, setPatient] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // PDPA Identity Verification & Sensitive Data State
  const [isVerified, setIsVerified] = useState(false);
  const [showSensitiveData, setShowSensitiveData] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<"TOGGLE_PDPA" | "VIEW_VISIT">("TOGGLE_PDPA");

  // Visit Detail Viewer Modal State
  const [selectedVisitForDetail, setSelectedVisitForDetail] = useState<any | null>(null);
  const [isVisitDetailModalOpen, setIsVisitDetailModalOpen] = useState(false);

  const [isAllergyDialogOpen, setIsAllergyDialogOpen] = useState(false);

  const fetchDetail = () => {
    startTransition(async () => {
      const res = await getPatientDetailAction(patientId);
      if (res.success && res.data) {
        setPatient(res.data);
      } else {
        setErrorMessage(res.error || "ไม่สามารถดึงข้อมูลโปรไฟล์ผู้ป่วยได้");
      }
    });
  };

  useEffect(() => {
    if (patientId) {
      fetchDetail();
    }
  }, [patientId]);

  const handleToggleSensitiveData = () => {
    if (showSensitiveData) {
      // Hide sensitive data
      setShowSensitiveData(false);
    } else {
      // Need verification if not yet verified
      if (isVerified) {
        setShowSensitiveData(true);
      } else {
        setPendingAction("TOGGLE_PDPA");
        setIsVerifyModalOpen(true);
      }
    }
  };

  const handleOpenVisitDetail = (visit: any) => {
    setSelectedVisitForDetail(visit);
    if (isVerified) {
      setIsVisitDetailModalOpen(true);
    } else {
      setPendingAction("VIEW_VISIT");
      setIsVerifyModalOpen(true);
    }
  };

  const handleVerificationSuccess = () => {
    setIsVerified(true);
    if (pendingAction === "TOGGLE_PDPA") {
      setShowSensitiveData(true);
    } else if (pendingAction === "VIEW_VISIT") {
      setShowSensitiveData(true);
      setIsVisitDetailModalOpen(true);
    }
  };

  if (isPending && !patient) {
    return (
      <div className="flex h-96 items-center justify-center space-y-2 text-slate-400">
        <Loader2 className="h-8 w-8 animate-spin text-chunjai-600" />
        <p className="text-xs font-medium ml-2">กำลังโหลดโปรไฟล์ผู้ป่วย...</p>
      </div>
    );
  }

  if (errorMessage || !patient) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 bg-white rounded-xl border border-slate-200 text-center space-y-4">
        <ShieldAlert className="mx-auto h-10 w-10 text-rose-500" />
        <h2 className="text-lg font-bold text-slate-900">เกิดข้อผิดพลาด</h2>
        <p className="text-xs text-slate-500">{errorMessage || "ไม่พบผู้ป่วยที่ระบุ"}</p>
        <Link href="/patient">
          <Button variant="outline" className="text-xs">
            <ArrowLeft className="mr-2 h-4 w-4" />
            กลับไปหน้าทะเบียนผู้ป่วย
          </Button>
        </Link>
      </div>
    );
  }

  const hasAllergies = patient.allergies && patient.allergies.length > 0;
  const birthYear = new Date(patient.dateOfBirth).getFullYear();
  const ageYears = new Date().getFullYear() - birthYear;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Navigation & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/patient">
            <Button variant="outline" size="icon" className="h-9 w-9">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-chunjai-950">
                {patient.firstName} {patient.lastName}
              </h1>
              <Badge variant="default" className="bg-chunjai-600 text-white font-mono text-xs">
                HN: {patient.hn}
              </Badge>
              {isVerified ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                  <Unlock className="h-3 w-3" />
                  ยืนยันสิทธิ์ PDPA แล้ว
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                  <Lock className="h-3 w-3" />
                  คุ้มครองข้อมูล PDPA
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              โปรไฟล์ผู้ป่วยและประวัติสุขภาพชุมชน
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleSensitiveData}
            className={`text-xs font-semibold ${
              showSensitiveData
                ? "border-emerald-300 text-emerald-700 bg-emerald-50/50"
                : "border-amber-300 text-amber-800 bg-amber-50/50 hover:bg-amber-100"
            }`}
            title="ยืนยันด้วย 4 ตัวท้ายบัตรประชาชนเพื่อปลดล็อกข้อมูลเต็ม"
          >
            {showSensitiveData ? (
              <>
                <EyeOff className="mr-1.5 h-3.5 w-3.5 text-emerald-600" />
                ซ่อนข้อมูล PDPA
              </>
            ) : (
              <>
                <KeyRound className="mr-1.5 h-3.5 w-3.5 text-amber-600" />
                ปลดล็อกข้อมูลเต็ม (4 ตัวท้าย ปชช.)
              </>
            )}
          </Button>

          <Button
            onClick={() => setIsAllergyDialogOpen(true)}
            variant="destructive"
            size="sm"
            className="text-xs font-semibold"
          >
            <Plus className="mr-1 h-3.5 w-3.5" />
            เพิ่มประวัติแพ้ยา
          </Button>
        </div>
      </div>

      {/* High Warning Banner if Allergic */}
      {hasAllergies && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 shadow-sm flex items-start gap-3">
          <ShieldAlert className="h-6 w-6 text-rose-600 shrink-0 mt-0.5 animate-bounce" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-rose-950">
              คำเตือนการแพ้ยา / แพ้อาหาร (Drug Allergies Alert)
            </h3>
            <div className="flex flex-wrap gap-2 pt-1">
              {patient.allergies.map((allergy: any) => (
                <span
                  key={allergy.id}
                  className="inline-flex items-center rounded-md bg-rose-600 text-white px-2.5 py-1 text-xs font-bold shadow-xs"
                >
                  ⚠️ {allergy.allergen} ({allergy.reaction || "ไม่ระบุอาการ"})
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Profile Info & Medical History */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column: Personal Data Card */}
        <Card className="md:col-span-1 border-slate-200">
          <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-bold text-chunjai-950 flex items-center gap-2">
              <User className="h-5 w-5 text-chunjai-600" />
              ข้อมูลส่วนบุคคล
            </CardTitle>
            {!showSensitiveData && (
              <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-mono">
                Masked
              </span>
            )}
          </CardHeader>
          <CardContent className="p-4 space-y-3 text-xs">
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500 font-medium">เลขบัตรประชาชน:</span>
              <span className="font-mono font-bold text-slate-900">
                {showSensitiveData
                  ? patient.nationalId || "-"
                  : maskNationalId(patient.nationalId)}
              </span>
            </div>

            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500 font-medium">เพศ / อายุ:</span>
              <span className="font-semibold text-slate-800">
                {patient.gender === "MALE" ? "ชาย" : "หญิง"} ({ageYears} ปี)
              </span>
            </div>

            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500 font-medium">หมู่เลือด:</span>
              <Badge variant="secondary" className="font-bold">
                {patient.bloodType || "-"}
              </Badge>
            </div>

            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500 font-medium">เบอร์โทรศัพท์:</span>
              <span className="font-mono font-semibold text-slate-800">
                {showSensitiveData
                  ? patient.phoneNumber || "-"
                  : maskPhoneNumber(patient.phoneNumber)}
              </span>
            </div>

            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500 font-medium">สิทธิการรักษา:</span>
              <Badge variant="outline" className="text-[10px]">
                {patient.rightsType}
              </Badge>
            </div>

            <div className="space-y-1 pt-1">
              <span className="text-slate-500 font-medium block">ที่อยู่:</span>
              <p className="text-slate-700 bg-slate-50 p-2.5 rounded-lg leading-relaxed border border-slate-100">
                {patient.address || "ไม่ระบุที่อยู่"}
              </p>
            </div>

            <div className="space-y-1 pt-1 border-t border-slate-100">
              <span className="text-slate-500 font-medium block">ผู้ติดต่อฉุกเฉิน:</span>
              <p className="text-slate-700 font-semibold">
                {patient.emergencyContact || "-"} ({patient.emergencyPhone || "-"})
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Medical History & Visits */}
        <div className="md:col-span-2 space-y-6">
          {/* Chronic Diseases & Conditions */}
          <Card className="border-slate-200">
            <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-bold text-chunjai-950 flex items-center gap-2">
                <Activity className="h-5 w-5 text-chunjai-600" />
                โรคประจำตัว (Chronic Conditions)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {patient.conditions && patient.conditions.length > 0 ? (
                <div className="space-y-2">
                  {patient.conditions.map((cond: any) => (
                    <div
                      key={cond.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/60 text-xs"
                    >
                      <div className="space-y-0.5">
                        <p className="font-semibold text-slate-900">{cond.condition}</p>
                        {cond.icd10Code && (
                          <span className="text-[10px] font-mono text-chunjai-600">
                            ICD-10: {cond.icd10Code}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 text-center py-4">
                  ไม่มีประวัติโรคประจำตัวในระบบ
                </p>
              )}
            </CardContent>
          </Card>

          {/* Recent Visit History with PDPA Unlock */}
          <Card className="border-slate-200">
            <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-chunjai-950 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-chunjai-600" />
                  ประวัติการรับบริการและการตรวจรักษา (Visit Records)
                </CardTitle>
                <CardDescription className="text-xs">
                  คลิกที่รายการ Visit เพื่อดูผลการตรวจ สัญญาณชีพ บันทึก SOAP Note และรายการยา
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="p-4">
              {patient.visits && patient.visits.length > 0 ? (
                <div className="space-y-3">
                  {patient.visits.map((visit: any) => {
                    const vs = visit.vitalSigns?.[0];
                    const hasPrescription = visit.prescription?.items?.length > 0;
                    const hasLabs = visit.labOrders?.length > 0;

                    return (
                      <div
                        key={visit.id}
                        onClick={() => handleOpenVisitDetail(visit)}
                        className="p-4 rounded-xl border border-slate-200 bg-white hover:border-chunjai-300 hover:bg-chunjai-50/40 cursor-pointer transition-all shadow-2xs space-y-2 group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-chunjai-700 font-mono text-sm">
                              {visit.visitNumber}
                            </span>
                            <Badge variant="outline" className="text-[10px]">
                              สถานะ: {visit.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-400 group-hover:text-chunjai-600 transition-colors">
                            <span className="text-[11px] font-mono">
                              {new Date(visit.createdAt).toLocaleDateString("th-TH")}{" "}
                              {new Date(visit.createdAt).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })} น.
                            </span>
                            <ChevronRight className="h-4 w-4" />
                          </div>
                        </div>

                        <p className="text-xs text-slate-700">
                          <strong>อาการสำคัญ:</strong> {visit.chiefComplaint || "ไม่ระบุ"}
                        </p>

                        {/* Quick tags */}
                        <div className="flex flex-wrap gap-2 pt-1 text-[11px]">
                          {vs && (
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono">
                              BP: {vs.systolicBp && vs.diastolicBp ? `${vs.systolicBp}/${vs.diastolicBp}` : "-"} mmHg · BMI: {vs.bmi || "-"}
                            </span>
                          )}
                          {hasPrescription && (
                            <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-medium">
                              💊 มีรายการสั่งยา ({visit.prescription.items.length})
                            </span>
                          )}
                          {hasLabs && (
                            <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-medium">
                              🧪 มีรายการตรวจแล็บ ({visit.labOrders.length})
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-slate-400 text-center py-6">
                  ยังไม่มีประวัติการรับบริการในคลินิก
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Allergy Modal Dialog */}
      <AddAllergyDialog
        isOpen={isAllergyDialogOpen}
        patientId={patient.id}
        patientName={`${patient.firstName} ${patient.lastName}`}
        onClose={() => setIsAllergyDialogOpen(false)}
        onSuccess={() => fetchDetail()}
      />

      {/* PDPA 4-Digit Identity Verification Modal */}
      <VerifyPatientIdentityModal
        isOpen={isVerifyModalOpen}
        patientId={patient.id}
        patientName={`${patient.firstName} ${patient.lastName}`}
        hn={patient.hn}
        onClose={() => setIsVerifyModalOpen(false)}
        onVerified={handleVerificationSuccess}
        title="ยืนยันตัวตนเพื่อเข้าถึงข้อมูลเวชระเบียนและข้อมูลส่วนบุคคล"
        description="กรุณาระบุเลข 4 ตัวท้ายของบัตรประจำตัวประชาชนผู้ป่วยเพื่อยืนยันสิทธิ์ในการเปิดดูเวชระเบียนเต็มรูปแบบ"
      />

      {/* Clinical Visit Full Detail Modal */}
      <VisitDetailModal
        isOpen={isVisitDetailModalOpen}
        visit={selectedVisitForDetail}
        patientName={`${patient.firstName} ${patient.lastName}`}
        hn={patient.hn}
        onClose={() => {
          setIsVisitDetailModalOpen(false);
          setSelectedVisitForDetail(null);
        }}
      />
    </div>
  );
}
