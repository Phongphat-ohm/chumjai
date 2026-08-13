"use client";

import React, { useState, useTransition } from "react";
import { UserPlus, Loader2, AlertCircle, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Gender, RightsType } from "@prisma/client";
import { createPatientAction } from "@/server/actions/patient";

interface PatientFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function PatientFormDialog({ isOpen, onClose, onSuccess }: PatientFormDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [gender, setGender] = useState<Gender>(Gender.MALE);
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [rightsType, setRightsType] = useState<RightsType>(RightsType.UNIVERSAL_COVERAGE);
  const [address, setAddress] = useState("");
  const [bloodType, setBloodType] = useState("O");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const formData = {
      firstName,
      lastName,
      nationalId,
      gender,
      dateOfBirth,
      phoneNumber,
      rightsType,
      address,
      bloodType,
      emergencyContact,
      emergencyPhone,
    };

    startTransition(async () => {
      const res = await createPatientAction(formData);
      if (res.success) {
        setSuccessMessage(`ลงทะเบียนผู้ป่วยสำเร็จ! HN: ${res.data.hn}`);
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 1200);
      } else {
        setErrorMessage(res.error || "ไม่สามารถลงทะเบียนผู้ป่วยได้");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-xl bg-white shadow-2xl border border-chunjai-100 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-chunjai-100 px-6 py-4 bg-chunjai-50/50 rounded-t-xl">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-chunjai-600 text-white">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-chunjai-950">
                ลงทะเบียนผู้ป่วยใหม่
              </h2>
              <p className="text-xs text-slate-500">
                กรอกข้อมูลผู้ป่วยประวัติเบื้องต้นเพื่อออก HN
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* First Name */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">
                ชื่อจริง <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="เช่น สมชาย"
                className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 text-xs text-slate-900 focus:border-chunjai-500 focus:bg-white focus:outline-none"
              />
            </div>

            {/* Last Name */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">
                นามสกุล <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="เช่น ใจดี"
                className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 text-xs text-slate-900 focus:border-chunjai-500 focus:bg-white focus:outline-none"
              />
            </div>

            {/* National ID */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">
                เลขบัตรประชาชน (13 หลัก)
              </label>
              <input
                type="text"
                maxLength={13}
                value={nationalId}
                onChange={(e) => setNationalId(e.target.value.replace(/\D/g, ""))}
                placeholder="1234567890123"
                className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 text-xs text-slate-900 focus:border-chunjai-500 focus:bg-white focus:outline-none"
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">
                เบอร์โทรศัพท์ <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="0812345678"
                className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 text-xs text-slate-900 focus:border-chunjai-500 focus:bg-white focus:outline-none"
              />
            </div>

            {/* Gender */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">
                เพศ <span className="text-rose-500">*</span>
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as Gender)}
                className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 text-xs text-slate-900 focus:border-chunjai-500 focus:bg-white focus:outline-none"
              >
                <option value={Gender.MALE}>ชาย (Male)</option>
                <option value={Gender.FEMALE}>หญิง (Female)</option>
                <option value={Gender.OTHER}>อื่นๆ (Other)</option>
              </select>
            </div>

            {/* Date of Birth */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">
                วันเกิด <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 text-xs text-slate-900 focus:border-chunjai-500 focus:bg-white focus:outline-none"
              />
            </div>

            {/* Rights Type */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">
                สิทธิการรักษา <span className="text-rose-500">*</span>
              </label>
              <select
                value={rightsType}
                onChange={(e) => setRightsType(e.target.value as RightsType)}
                className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 text-xs text-slate-900 focus:border-chunjai-500 focus:bg-white focus:outline-none"
              >
                <option value={RightsType.UNIVERSAL_COVERAGE}>สิทธิบัตรทอง (30 บาท)</option>
                <option value={RightsType.SOCIAL_SECURITY}>สิทธิประกันสังคม</option>
                <option value={RightsType.CIVIL_SERVANT}>สิทธิข้าราชการ / จ่ายตรง</option>
                <option value={RightsType.SELF_PAY}>ชำระเงินเอง</option>
                <option value={RightsType.OTHER}>อื่นๆ</option>
              </select>
            </div>

            {/* Blood Type */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">
                หมู่เลือด
              </label>
              <select
                value={bloodType}
                onChange={(e) => setBloodType(e.target.value)}
                className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 text-xs text-slate-900 focus:border-chunjai-500 focus:bg-white focus:outline-none"
              >
                <option value="O">O</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="AB">AB</option>
              </select>
            </div>
          </div>

          {/* Address */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 block">
              ที่อยู่ปัจจุบัน
            </label>
            <textarea
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="บ้านเลขที่ หมู่ ถนน ตำบล อนาคต"
              className="w-full rounded-lg border border-slate-200 bg-slate-50/50 p-2 text-xs text-slate-900 focus:border-chunjai-500 focus:bg-white focus:outline-none"
            />
          </div>

          {/* Emergency Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">
                ผู้ติดต่อฉุกเฉิน
              </label>
              <input
                type="text"
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                placeholder="ชื่อ-นามสกุล ผู้ติดต่อฉุกเฉิน"
                className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 text-xs text-slate-900 focus:border-chunjai-500 focus:bg-white focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">
                เบอร์ผู้ติดต่อฉุกเฉิน
              </label>
              <input
                type="text"
                value={emergencyPhone}
                onChange={(e) => setEmergencyPhone(e.target.value)}
                placeholder="0812345678"
                className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 text-xs text-slate-900 focus:border-chunjai-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Actions */}
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
                  กำลังบันทึก...
                </>
              ) : (
                "ลงทะเบียนผู้ป่วย"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
