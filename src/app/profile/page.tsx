"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  User,
  Key,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Save,
  Lock,
  Mail,
  Phone,
  UserCheck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  getMyProfileAction,
  updateMyProfileAction,
  changeMyPasswordAction,
} from "@/server/actions/user-profile";

export default function PersonalProfilePage() {
  const [isPending, startTransition] = useTransition();

  const [profile, setProfile] = useState<any | null>(null);

  // Form Profile State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Form Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const fetchProfile = () => {
    startTransition(async () => {
      const res = await getMyProfileAction();
      if (res.success && res.data) {
        setProfile(res.data);
        setFullName(res.data.fullName || "");
        setEmail(res.data.email || "");
        setPhoneNumber(res.data.phoneNumber || "");
      }
    });
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess(null);
    setProfileError(null);

    startTransition(async () => {
      const res = await updateMyProfileAction({
        fullName,
        email,
        phoneNumber,
      });

      if (res.success) {
        setProfileSuccess("อัปเดตข้อมูลส่วนตัวสำเร็จ!");
        fetchProfile();
        setTimeout(() => setProfileSuccess(null), 4000);
      } else {
        setProfileError(res.error || "ไม่สามารถอัปเดตข้อมูลได้");
      }
    });
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccess(null);
    setPasswordError(null);

    startTransition(async () => {
      const res = await changeMyPasswordAction({
        currentPassword,
        newPassword,
        confirmPassword,
      });

      if (res.success) {
        setPasswordSuccess("เปลี่ยนรหัสผ่านส่วนตัวสำเร็จ!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setPasswordSuccess(null), 4000);
      } else {
        setPasswordError(res.error || "ไม่สามารถเปลี่ยนรหัสผ่านได้");
      }
    });
  };

  const getRoleBadge = (r: string) => {
    switch (r) {
      case "ADMIN":
        return <Badge variant="destructive">ผู้ดูแลระบบ (ADMIN)</Badge>;
      case "DOCTOR":
        return <Badge variant="default">แพทย์ (DOCTOR)</Badge>;
      case "NURSE":
        return <Badge variant="secondary">พยาบาล (NURSE)</Badge>;
      case "PHARMACIST":
        return <Badge variant="success">เภสัชกร (PHARMACIST)</Badge>;
      default:
        return <Badge variant="outline">เจ้าหน้าที่ (RECEPTIONIST)</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      {/* Header Banner */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-chunjai-600 text-white shadow-md">
          <User className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-chunjai-950">
            ตั้งค่าข้อมูลส่วนตัว (Personal Profile & Password)
          </h1>
          <p className="text-xs text-slate-500">
            แก้ไขข้อมูลส่วนบุคคล ชื่อ-นามสกุล เบอร์โทรศัพท์ และเปลี่ยนรหัสผ่านเข้าใช้งานระบบด้วยตนเอง
          </p>
        </div>
      </div>

      {isPending && !profile ? (
        <div className="p-20 text-center text-slate-400 space-y-2">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-chunjai-600" />
          <p className="text-xs font-medium">กำลังโหลดข้อมูลส่วนตัว...</p>
        </div>
      ) : profile ? (
        <div className="grid gap-6 md:grid-cols-3">
          {/* User Profile Card Overview */}
          <Card className="md:col-span-1 border-chunjai-200">
            <CardHeader className="text-center pb-3">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-chunjai-100 text-chunjai-700 font-bold text-2xl mb-2">
                {profile.fullName?.charAt(0) || "U"}
              </div>
              <CardTitle className="text-base font-bold text-slate-900">
                {profile.fullName}
              </CardTitle>
              <CardDescription className="text-xs font-mono">
                @{profile.username}
              </CardDescription>
              <div className="mt-2 flex justify-center">{getRoleBadge(profile.role)}</div>
            </CardHeader>

            <CardContent className="space-y-3 text-xs border-t border-slate-100 pt-4">
              <div className="flex justify-between items-center text-slate-600">
                <span>วันที่เริ่มใช้งาน:</span>
                <span className="font-mono text-slate-900">
                  {new Date(profile.createdAt).toLocaleDateString("th-TH")}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>เข้าใช้งานล่าสุด:</span>
                <span className="font-mono text-slate-900">
                  {profile.lastLoginAt
                    ? new Date(profile.lastLoginAt).toLocaleTimeString("th-TH", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "วันนี้"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Settings Forms Column */}
          <div className="md:col-span-2 space-y-6">
            {/* Form 1: Edit Profile */}
            <Card>
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-base font-bold text-chunjai-950 flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-chunjai-600" />
                  ข้อมูลส่วนตัวบุคลากร (Personal Information)
                </CardTitle>
                <CardDescription className="text-xs">
                  อัปเดตชื่อ-นามสกุล อีเมล และเบอร์โทรศัพท์ติดต่อ
                </CardDescription>
              </CardHeader>

              <CardContent className="p-6">
                <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
                  {profileSuccess && (
                    <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-emerald-800 font-bold">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                      <span>{profileSuccess}</span>
                    </div>
                  )}

                  {profileError && (
                    <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-rose-800">
                      <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                      <span>{profileError}</span>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 block">
                      ชื่อผู้ใช้งาน (Username)
                    </label>
                    <input
                      type="text"
                      disabled
                      value={profile.username}
                      className="h-10 w-full rounded-lg border border-slate-200 bg-slate-100 px-3 text-xs text-slate-500 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 block">
                      ชื่อ-นามสกุลบุคลากร <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="เช่น พญ. ใจดี มีสุข..."
                      className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:border-chunjai-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700 block flex items-center gap-1">
                        <Mail className="h-3.5 w-3.5 text-chunjai-600" /> อีเมลติดต่อ
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="doctor@chunjai.com"
                        className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:border-chunjai-500 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700 block flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5 text-chunjai-600" /> เบอร์โทรศัพท์
                      </label>
                      <input
                        type="text"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="081-234-5678"
                        className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:border-chunjai-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button
                      type="submit"
                      disabled={isPending}
                      className="bg-chunjai-600 hover:bg-chunjai-700 text-white font-semibold text-xs"
                    >
                      <Save className="mr-1.5 h-4 w-4" />
                      บันทึกการเปลี่ยนแปลง
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Form 2: Self Password Change */}
            <Card>
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-base font-bold text-chunjai-950 flex items-center gap-2">
                  <Key className="h-5 w-5 text-chunjai-600" />
                  เปลี่ยนรหัสผ่านส่วนตัว (Change Password)
                </CardTitle>
                <CardDescription className="text-xs">
                  เปลี่ยนรหัสผ่านสำหรับเข้าใช้งานระบบด้วยตนเอง
                </CardDescription>
              </CardHeader>

              <CardContent className="p-6">
                <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
                  {passwordSuccess && (
                    <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-emerald-800 font-bold">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                      <span>{passwordSuccess}</span>
                    </div>
                  )}

                  {passwordError && (
                    <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-rose-800">
                      <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                      <span>{passwordError}</span>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 block">
                      รหัสผ่านปัจจุบัน <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:border-chunjai-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700 block">
                        รหัสผ่านใหม่ <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="ความยาวอย่างน้อย 6 ตัวอักษร"
                        className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:border-chunjai-500 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700 block">
                        ยืนยันรหัสผ่านใหม่ <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="พิมพ์รหัสผ่านใหม่อีกครั้ง"
                        className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:border-chunjai-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button
                      type="submit"
                      disabled={isPending}
                      className="bg-chunjai-600 hover:bg-chunjai-700 text-white font-semibold text-xs"
                    >
                      <Lock className="mr-1.5 h-4 w-4" />
                      ยืนยันเปลี่ยนรหัสผ่าน
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : null}
    </div>
  );
}
