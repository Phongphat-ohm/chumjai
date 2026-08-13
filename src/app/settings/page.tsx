"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  Settings,
  Building2,
  Phone,
  MapPin,
  Clock,
  ShieldCheck,
  Package,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Lock,
  Save,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getClinicSettingsAction, updateClinicSettingsAction } from "@/server/actions/settings";

export default function ClinicSettingsPage() {
  const [isPending, startTransition] = useTransition();

  const [clinicName, setClinicName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [licenseNo, setLicenseNo] = useState("");
  const [taxId, setTaxId] = useState("");
  const [directorName, setDirectorName] = useState("");
  const [openingHours, setOpeningHours] = useState("");
  const [minStockThreshold, setMinStockThreshold] = useState<number>(10);
  const [expiryWarningDays, setExpiryWarningDays] = useState<number>(90);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);

  const fetchSettings = () => {
    startTransition(async () => {
      const res = await getClinicSettingsAction();
      if (res.success && res.data) {
        setClinicName(res.data.CLINIC_NAME || "");
        setAddress(res.data.CLINIC_ADDRESS || "");
        setPhone(res.data.CLINIC_PHONE || "");
        setEmail(res.data.CLINIC_EMAIL || "");
        setLicenseNo(res.data.CLINIC_LICENSE || "");
        setTaxId(res.data.CLINIC_TAX_ID || "");
        setDirectorName(res.data.CLINIC_DIRECTOR || "");
        setOpeningHours(res.data.OPENING_HOURS || "");
        setMinStockThreshold(parseInt(res.data.MIN_STOCK_THRESHOLD || "10", 10));
        setExpiryWarningDays(parseInt(res.data.EXPIRY_WARNING_DAYS || "90", 10));
      } else if (res.error?.includes("ไม่มีสิทธิ์")) {
        setAccessDenied(true);
      }
    });
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    startTransition(async () => {
      const res = await updateClinicSettingsAction({
        clinicName,
        address,
        phone,
        email,
        licenseNo,
        taxId,
        directorName,
        openingHours,
        minStockThreshold,
        expiryWarningDays,
      });

      if (res.success) {
        setSuccessMessage("บันทึกการตั้งค่าคลินิกเรียบร้อยแล้ว!");
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      } else {
        if (res.error?.includes("ไม่มีสิทธิ์")) {
          setAccessDenied(true);
        } else {
          setErrorMessage(res.error || "ไม่สามารถบันทึกการตั้งค่าได้");
        }
      }
    });
  };

  if (accessDenied) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-600">
          <Lock className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">
          การเข้าถึงถูกปฏิเสธ (Access Denied)
        </h2>
        <p className="text-xs text-slate-500">
          หน้าการตั้งค่าคลินิกและระบบสงวนสิทธิ์เฉพาะผู้ดูแลระบบ (ADMIN) เท่านั้น
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div>
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-chunjai-600 text-white shadow-md">
            <Settings className="h-5 w-5" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-chunjai-950">
            ตั้งค่าคลินิกและระบบ (Clinic & System Settings)
          </h1>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          จัดการข้อมูลสถานพยาบาล หัวกระดาษฉลากยา/ใบนัด และการตั้งค่าคลังยา
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {errorMessage && (
          <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700 font-semibold">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Section 1: General Clinic Information */}
        <Card>
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-base font-bold text-chunjai-950 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-chunjai-600" />
              ข้อมูลสถานพยาบาล (Clinic Profile)
            </CardTitle>
            <CardDescription className="text-xs">
              ข้อมูลนี้จะนำไปแสดงบนหัวกระดาษใบนัดหมาย และฉลากยาภาษาไทย
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">
                ชื่อสถานพยาบาล / คลินิก <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={clinicName}
                onChange={(e) => setClinicName(e.target.value)}
                placeholder="เช่น ชุมใจคลินิกเวชกรรม..."
                className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-chunjai-900 focus:border-chunjai-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">
                ที่อยู่สถานพยาบาล <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={2}
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="เลขที่ ถนน แขวง/ตำบล เขต/อำเภอ..."
                className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs text-slate-900 focus:border-chunjai-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">
                  เบอร์โทรศัพท์ติดต่อ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="02-123-4567"
                  className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:border-chunjai-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">
                  อีเมลติดต่อคลินิก
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@chunjai-clinic.com"
                  className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:border-chunjai-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">
                  เลขที่ใบอนุญาตประกอบกิจการ
                </label>
                <input
                  type="text"
                  value={licenseNo}
                  onChange={(e) => setLicenseNo(e.target.value)}
                  placeholder="เช่น 10101004567"
                  className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs font-mono text-slate-900 focus:border-chunjai-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">
                  เลขผู้เสียภาษี / Tax ID
                </label>
                <input
                  type="text"
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value)}
                  placeholder="เช่น 0105566778899"
                  className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs font-mono text-slate-900 focus:border-chunjai-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">
                ชื่อแพทย์ผู้ถือใบอนุญาต / ผู้อำนวยการคลินิก
              </label>
              <input
                type="text"
                value={directorName}
                onChange={(e) => setDirectorName(e.target.value)}
                placeholder="เช่น นพ. ชุมใจ รักษาดี (ว. 45678)"
                className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:border-chunjai-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">
                เวลาทำการ
              </label>
              <input
                type="text"
                value={openingHours}
                onChange={(e) => setOpeningHours(e.target.value)}
                placeholder="จันทร์ - ศุกร์: 08:00 - 20:00 น."
                className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:border-chunjai-500 focus:outline-none"
              />
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Inventory Rules & Warnings */}
        <Card>
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-base font-bold text-chunjai-950 flex items-center gap-2">
              <Package className="h-5 w-5 text-chunjai-600" />
              เกณฑ์การแจ้งเตือนคลังยา (Inventory Alerts)
            </CardTitle>
            <CardDescription className="text-xs">
              กำหนดเกณฑ์เตือนสต็อกต่ำและวันหมดอายุเริ่มต้น
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">
                  ระดับสต็อกขั้นต่ำเริ่มต้น (Min Stock Threshold)
                </label>
                <input
                  type="number"
                  min={1}
                  value={minStockThreshold}
                  onChange={(e) => setMinStockThreshold(parseInt(e.target.value, 10) || 10)}
                  className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-chunjai-700 focus:border-chunjai-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">
                  จำนวนวันเตือนยาใกล้หมดอายุ (Expiry Alert Days)
                </label>
                <input
                  type="number"
                  min={1}
                  value={expiryWarningDays}
                  onChange={(e) => setExpiryWarningDays(parseInt(e.target.value, 10) || 90)}
                  className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-chunjai-700 focus:border-chunjai-500 focus:outline-none"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Bar */}
        <div className="flex items-center justify-end gap-3">
          <Button
            type="submit"
            disabled={isPending}
            className="bg-chunjai-600 hover:bg-chunjai-700 text-white font-bold text-xs h-10 px-8 shadow-md"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                กำลังบันทึก...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                บันทึกการตั้งค่า
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
