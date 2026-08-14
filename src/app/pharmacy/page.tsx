"use client";

import React, { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import {
  Pill,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldAlert,
  Users,
  Printer,
  Clock,
  UserCheck,
  Stethoscope,
  Plus,
  FileText,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  getPharmacyQueueVisitsAction,
  dispensePrescriptionAction,
} from "@/server/actions/pharmacy";
import { DrugLabelModal } from "@/components/pharmacy/DrugLabelModal";
import { PrescriptionModal } from "@/components/doctor/PrescriptionModal";
import { VisitStatus } from "@/generated/client";
import { useClinicSettings } from "@/hooks/useClinicSettings";

export default function PharmacistDispensingPage() {
  const [isPending, startTransition] = useTransition();
  const { clinicInfo } = useClinicSettings();
  const [visits, setVisits] = useState<any[]>([]);
  const [selectedVisit, setSelectedVisit] = useState<any | null>(null);
  const [isLabelModalOpen, setIsLabelModalOpen] = useState(false);
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchPharmacyQueue = () => {
    startTransition(async () => {
      const res = await getPharmacyQueueVisitsAction();
      if (res.success && res.data) {
        setVisits(res.data);
        if (res.data.length > 0) {
          // Keep current selection if exists, else select first
          if (!selectedVisit) {
            setSelectedVisit(res.data[0]);
          } else {
            const updated = res.data.find((v) => v.id === selectedVisit.id);
            if (updated) setSelectedVisit(updated);
            else setSelectedVisit(res.data[0]);
          }
        }
      }
    });
  };

  useEffect(() => {
    fetchPharmacyQueue();
  }, []);

  const handleDispense = (visit: any) => {
    if (!visit.prescription) {
      setErrorMessage("ไม่พบใบสั่งยาสำหรับผู้ป่วยรายนี้ กรุณากดปุ่มสร้างรายการสั่งยา");
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);

    startTransition(async () => {
      const res = await dispensePrescriptionAction({
        prescriptionId: visit.prescription.id,
        visitId: visit.id,
      });

      if (res.success) {
        setSuccessMessage("ดำเนินการยืนยันจ่ายยา และตัดสต็อกตามหลัก FEFO สำเร็จ!");
        setTimeout(() => {
          fetchPharmacyQueue();
        }, 1200);
      } else {
        setErrorMessage(res.error || "ไม่สามารถดำเนินการจ่ายยาได้");
      }
    });
  };

  const prescription = selectedVisit?.prescription;
  const items = prescription?.items || [];
  const hasAllergies = selectedVisit?.patient?.allergies?.length > 0;
  const isDispensed = selectedVisit?.status === VisitStatus.COMPLETED || prescription?.status === "DISPENSED";
  const soap = selectedVisit?.consultation?.soapNote;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-chunjai-600 text-white shadow-md">
              <Pill className="h-5 w-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-chunjai-950">
              ห้องยาและจ่ายยา (Pharmacist Dispensing Hub)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            ตรวจสอบใบสั่งยา ตัดสต็อกตามหลัก FEFO และพิมพ์ฉลากยาภาษาไทย
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchPharmacyQueue()}
          className="text-xs font-semibold"
        >
          รีเฟรชคิวห้องยา
        </Button>
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 md:grid-cols-12">
        {/* Left Column: Pharmacy Queue List */}
        <div className="md:col-span-4 space-y-4">
          <Card className="border-chunjai-200">
            <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Users className="h-4 w-4 text-chunjai-600" />
                คิวผู้ป่วยรอรับยา ({visits.length} คน)
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
                  <p className="text-xs font-bold text-slate-700">ไม่มีคิวรอรับยาในขณะนี้</p>
                </div>
              ) : (
                visits.map((visit) => {
                  const isSelected = selectedVisit?.id === visit.id;
                  const queueNum = visit.queues?.[0]?.queueNumber || "P";
                  const isDone = visit.status === VisitStatus.COMPLETED;

                  return (
                    <div
                      key={visit.id}
                      onClick={() => {
                        setSelectedVisit(visit);
                        setErrorMessage(null);
                        setSuccessMessage(null);
                      }}
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
                        <Badge
                          variant={isDone ? "success" : "warning"}
                          className="text-[10px]"
                        >
                          {isDone ? "จ่ายยาแล้ว" : "รอรับยา"}
                        </Badge>
                      </div>

                      <p className="font-bold text-sm mt-1">
                        {visit.patient?.firstName} {visit.patient?.lastName}
                      </p>

                      <p className={`text-[11px] font-mono mt-0.5 ${isSelected ? "text-chunjai-100" : "text-slate-500"}`}>
                        HN: {visit.patient?.hn} · Visit: {visit.visitNumber}
                      </p>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Prescription Review & Dispensing Control */}
        <div className="md:col-span-8 space-y-6">
          {!selectedVisit ? (
            <Card className="border-dashed p-12 text-center text-slate-400 space-y-3">
              <Pill className="mx-auto h-12 w-12 text-chunjai-300" />
              <h3 className="text-base font-bold text-slate-700">
                เลือกผู้ป่วยจากคิวทางซ้ายเพื่อทำการตรวจสอบและจ่ายยา
              </h3>
              <p className="text-xs max-w-sm mx-auto">
                ระบบจะแสดงรายการใบสั่งยา ตรวจสอบการแพ้ยา ตัดสต็อกตามหลัก FEFO และพิมพ์ฉลากยาภาษาไทย
              </p>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Patient Info Card */}
              <Card className="border-chunjai-200 bg-chunjai-50/50">
                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-bold text-chunjai-950">
                      {selectedVisit.patient?.firstName} {selectedVisit.patient?.lastName}
                    </h2>
                    <p className="text-xs text-slate-500 font-mono">
                      HN: {selectedVisit.patient?.hn} · สิทธิ: {selectedVisit.patient?.rightsType}
                    </p>
                  </div>

                  {hasAllergies ? (
                    <Badge variant="destructive" className="text-xs font-bold">
                      <ShieldAlert className="mr-1 h-4 w-4" />
                      แพ้ยา: {selectedVisit.patient.allergies.map((a: any) => a.allergen).join(", ")}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs text-slate-500">
                      ไม่มีประวัติแพ้ยา
                    </Badge>
                  )}
                </CardContent>
              </Card>

              {/* SOAP Note & Diagnosis Context Card */}
              {(selectedVisit.consultation?.diagnoses?.length > 0 || soap) && (
                <Card className="border-slate-200 bg-white">
                  <CardHeader className="pb-2 border-b border-slate-100">
                    <CardTitle className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <FileText className="h-4 w-4 text-chunjai-600" />
                      ข้อมูลการตรวจจากแพทย์ (Doctor Consultation Context)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3 text-xs">
                    {/* Diagnosis Badges */}
                    {selectedVisit.consultation?.diagnoses?.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[11px] font-semibold text-slate-500 block">การวินิจฉัย (ICD-10):</span>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedVisit.consultation.diagnoses.map((d: any) => (
                            <Badge key={d.id} variant="secondary" className="text-[10px]">
                              {d.icd10Code} - {d.icd10Name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* SOAP Plan */}
                    {soap?.plan && (
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
                        <span className="font-bold text-chunjai-800 block text-[11px]">
                          แผนการรักษา (SOAP Plan):
                        </span>
                        <p className="whitespace-pre-wrap mt-0.5 font-medium text-xs">
                          {soap.plan}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Prescription Review & FEFO Card */}
              <Card>
                <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-bold text-chunjai-950 flex items-center gap-2">
                      <Pill className="h-5 w-5 text-chunjai-600" />
                      ใบสั่งยาจากแพทย์ (Prescription Review)
                    </CardTitle>
                    <CardDescription className="text-xs">
                      สั่งโดย: {prescription?.doctor?.fullName || "แพทย์ผู้ตรวจ"}
                    </CardDescription>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsPrescriptionModalOpen(true)}
                      className="text-xs font-semibold border-chunjai-300 text-chunjai-800 hover:bg-chunjai-50"
                    >
                      <Plus className="mr-1.5 h-4 w-4 text-chunjai-600" />
                      {items.length === 0 ? "สร้าง/สั่งยาในระบบ" : "แก้ไขใบสั่งยา"}
                    </Button>

                    {items.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsLabelModalOpen(true)}
                        className="text-xs font-semibold border-chunjai-300 text-chunjai-800 hover:bg-chunjai-50"
                      >
                        <Printer className="mr-1.5 h-4 w-4 text-chunjai-600" />
                        พิมพ์ฉลากยา
                      </Button>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="p-6 space-y-6 text-xs">
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

                  {/* Prescribed Items Table or Empty Warning */}
                  {items.length === 0 ? (
                    <div className="p-6 text-center space-y-3 border border-dashed border-amber-300 bg-amber-50/50 rounded-xl">
                      <AlertCircle className="mx-auto h-8 w-8 text-amber-600" />
                      <div>
                        <h4 className="font-bold text-amber-900 text-sm">
                          ไม่พบรายการสั่งยาในระบบคลัง electronic สำหรับ Visit นี้
                        </h4>
                        <p className="text-xs text-amber-800 mt-1">
                          {soap?.plan
                            ? `แผนการรักษาของแพทย์ระบุว่า: "${soap.plan}"`
                            : "แพทย์อาจจะบันทึก SOAP note โดยยังไม่ได้กดเลือกรายการยาจากคลัง"}
                        </p>
                      </div>
                      <Button
                        onClick={() => setIsPrescriptionModalOpen(true)}
                        className="bg-chunjai-600 hover:bg-chunjai-700 text-white font-bold text-xs shadow-sm"
                      >
                        <Plus className="mr-1.5 h-4 w-4" />
                        กดที่นี่เพื่อสร้างรายการสั่งยา (Add Prescription)
                      </Button>
                    </div>
                  ) : (
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
                          <tr>
                            <th className="px-4 py-3">รายการยา (Drug)</th>
                            <th className="px-4 py-3">ขนาดยา (Dose)</th>
                            <th className="px-4 py-3">วิธีใช้ / ความถี่</th>
                            <th className="px-4 py-3 text-center">จำนวน (Qty)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                          {items.map((item: any) => (
                            <tr key={item.id} className="hover:bg-slate-50/80">
                              <td className="px-4 py-3">
                                <span className="font-bold text-slate-900 block">
                                  {item.drug?.genericName} {item.drug?.strength}
                                </span>
                                <span className="text-[11px] text-slate-400">
                                  {item.drug?.tradeName || item.drug?.code}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-slate-700">{item.dosage}</td>
                              <td className="px-4 py-3 text-slate-700">{item.frequency}</td>
                              <td className="px-4 py-3 text-center font-bold font-mono text-chunjai-700 text-sm">
                                {item.quantity} {item.drug?.unit}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Dispense Action Bar */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div className="text-slate-500 text-[11px]">
                      <span className="font-semibold text-emerald-600 block">
                        ✓ ระบบตัดสต็อกอัตโนมัติตามหลัก FEFO (First Expired, First Out)
                      </span>
                    </div>

                    {!isDispensed ? (
                      <Button
                        onClick={() => handleDispense(selectedVisit)}
                        disabled={isPending || items.length === 0}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-10 px-6 shadow-md"
                      >
                        {isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            กำลังตัดสต็อก FEFO...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            ยืนยันการจ่ายยา & ตัดสต็อก FEFO
                          </>
                        )}
                      </Button>
                    ) : (
                      <Badge variant="success" className="text-xs p-2">
                        ✓ จ่ายยาและตัดสต็อกเรียบร้อยแล้ว
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Printable Thai Drug Label Modal */}
      {selectedVisit && (
        <DrugLabelModal
          isOpen={isLabelModalOpen}
          clinicInfo={clinicInfo}
          patient={selectedVisit.patient}
          items={items}
          onClose={() => setIsLabelModalOpen(false)}
        />
      )}

      {/* Prescription Modal (Allows creating or updating prescription items) */}
      {selectedVisit && (
        <PrescriptionModal
          isOpen={isPrescriptionModalOpen}
          visitId={selectedVisit.id}
          patientName={`${selectedVisit.patient?.firstName} ${selectedVisit.patient?.lastName}`}
          allergies={selectedVisit.patient?.allergies}
          onClose={() => setIsPrescriptionModalOpen(false)}
          onSuccess={() => fetchPharmacyQueue()}
        />
      )}
    </div>
  );
}
