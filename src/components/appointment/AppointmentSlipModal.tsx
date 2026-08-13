"use client";

import React from "react";
import { Printer, X, HeartPulse, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AppointmentSlipModalProps {
  isOpen: boolean;
  appointment: {
    id: string;
    appointmentDate: string;
    reason?: string;
    notes?: string;
    patient: {
      hn: string;
      firstName: string;
      lastName: string;
      rightsType?: string;
    };
  } | null;
  onClose: () => void;
}

export function AppointmentSlipModal({
  isOpen,
  appointment,
  onClose,
}: AppointmentSlipModalProps) {
  if (!isOpen || !appointment) return null;

  const handlePrint = () => {
    window.print();
  };

  const appDate = new Date(appointment.appointmentDate);
  const dateStr = appDate.toLocaleDateString("th-TH", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const timeStr = appDate.toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-lg rounded-xl bg-white shadow-2xl border border-chunjai-100 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-chunjai-100 px-6 py-4 bg-chunjai-50/60 rounded-t-xl shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-chunjai-600 text-white">
              <Printer className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-chunjai-950">
                ตัวอย่างใบนัดหมายผู้ป่วย (Appointment Slip)
              </h3>
              <p className="text-xs text-slate-500">
                ใบนัดหมายติดตามผลสำหรับมอบให้ผู้ป่วย
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handlePrint}
              className="bg-chunjai-600 hover:bg-chunjai-700 text-white font-bold text-xs"
            >
              <Printer className="mr-1.5 h-4 w-4" />
              พิมพ์ใบนัดหมาย (Print)
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Printable Appointment Slip Card */}
        <div className="p-6 text-xs space-y-4">
          <div className="border-2 border-slate-900 rounded-xl p-6 bg-white space-y-4 shadow-sm print:border-black print:shadow-none">
            {/* Header */}
            <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-chunjai-600 text-white">
                  <HeartPulse className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-950">
                    ใบนัดหมายตรวจรักษา — ชุมใจคลินิก
                  </h2>
                  <p className="text-[10px] text-slate-500">
                    Community Clinic & Smart Health Tracking System
                  </p>
                </div>
              </div>
            </div>

            {/* Patient Line */}
            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200 font-bold">
              <div>
                <span className="text-slate-500 text-[10px] block font-normal">ชื่อผู้ป่วย:</span>
                <span className="text-sm text-slate-950">
                  {appointment.patient.firstName} {appointment.patient.lastName}
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 text-[10px] block font-normal">HN:</span>
                <span className="text-sm font-mono text-chunjai-700">{appointment.patient.hn}</span>
              </div>
            </div>

            {/* Appointment Date & Time */}
            <div className="border-l-4 border-chunjai-600 bg-chunjai-50 p-4 rounded-r-lg space-y-1">
              <span className="text-chunjai-800 text-[11px] font-bold block uppercase tracking-wider">
                กำหนดวันและเวลานัดหมาย
              </span>
              <div className="text-lg font-black text-chunjai-950">{dateStr}</div>
              <div className="text-sm font-extrabold text-chunjai-700 font-mono">
                เวลา {timeStr} น.
              </div>
            </div>

            {/* Reason */}
            <div className="space-y-1">
              <span className="font-bold text-slate-900 block">วัตถุประสงค์การนัดหมาย:</span>
              <p className="text-slate-700 bg-slate-50 p-2.5 rounded border border-slate-200 font-medium">
                {appointment.reason || "ตรวจติดตามอาการทั่วไป"}
              </p>
            </div>

            {/* Notes & Instructions */}
            {appointment.notes && (
              <div className="space-y-1">
                <span className="font-bold text-amber-800 block">คำแนะนำการเตรียมตัวผู้ป่วย:</span>
                <p className="text-amber-900 bg-amber-50 p-2.5 rounded border border-amber-200 font-medium">
                  {appointment.notes}
                </p>
              </div>
            )}

            {/* Footer */}
            <div className="border-t border-slate-200 pt-3 text-[10px] text-slate-500 flex justify-between items-center">
              <span>* กรุณานำใบนัดหมายและบัตรประชาชนมาแสดง ณ จุดลงทะเบียน</span>
              <span className="font-mono">โทร. 02-123-4567</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
