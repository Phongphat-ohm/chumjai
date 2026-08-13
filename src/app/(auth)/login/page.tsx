"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  HeartPulse,
  Lock,
  User,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Activity,
  CheckCircle2,
  Sparkles,
  Stethoscope,
  Pill,
  Clock,
  FileText,
  BarChart3,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { loginAction } from "@/server/actions/auth";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    const formData = new FormData();
    formData.append("username", username);
    formData.append("password", password);

    startTransition(async () => {
      const result = await loginAction(null, formData);
      if (result.success) {
        router.push("/");
        router.refresh();
      } else {
        setErrorMessage(result.error || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
      }
    });
  };

  const systemFeatures = [
    {
      title: "ระบบคิว & คัดกรองสัญญาณชีพ",
      desc: "จัดลำดับคิวอัตโนมัติ 4 ประเภท พร้อมบันทึก Vitals & BMI ประเมินระดับความรุนแรง",
      icon: Stethoscope,
    },
    {
      title: "ห้องตรวจแพทย์ SOAP & ICD-10",
      desc: "บันทึกประวัติการตรวจ สั่งยา สั่งแล็บ และลงรหัสวินิจฉัยโรคตามมาตรฐานสากล",
      icon: Activity,
    },
    {
      title: "ห้องจ่ายยา & พิมพ์ฉลากยาภาษาไทย",
      desc: "จัดยา ตัดสต็อกคลังยา FEFO และพิมพ์ฉลากยาปิดซองตามมาตรฐานกระทรวงสาธารณสุข",
      icon: Pill,
    },
    {
      title: "ติดตามสุขภาพ NCD & วิเคราะห์สถิติ",
      desc: "ติดตามความดันและระดับน้ำตาลระยะยาว พร้อมรายงานสรุป 10 อันดับโรคที่พบมากที่สุด",
      icon: BarChart3,
    },
  ];

  return (
    <div className="flex min-h-screen w-full bg-slate-50">
      {/* Left Side: System Information Showcase Banner (Visible on LG screens) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-chunjai-950 via-chunjai-900 to-chunjai-700 p-12 text-white flex-col justify-between">
        {/* Background Decorative Blur Orbs */}
        <div className="absolute top-10 left-10 h-72 w-72 rounded-full bg-chunjai-500/20 blur-3xl" />
        <div className="absolute bottom-10 right-10 h-96 w-96 rounded-full bg-sky-400/20 blur-3xl" />

        {/* Top Branding Section */}
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-xl">
              <HeartPulse className="h-7 w-7 animate-pulse text-sky-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-extrabold tracking-tight">ชุมใจ</span>
                <span className="text-sm font-semibold text-sky-300">(Chunjai)</span>
              </div>
              <p className="text-xs text-chunjai-200">
                Community Clinic & Smart Health Tracking System
              </p>
            </div>
          </div>

          <Badge className="bg-white/15 text-white hover:bg-white/25 border-white/20 backdrop-blur font-semibold px-3 py-1 text-xs">
            <Sparkles className="mr-1.5 h-3.5 w-3.5 text-amber-300" />
            ระบบบริหารจัดการคลินิกชุมชนและติดตามสุขภาพอัจฉริยะ
          </Badge>
        </div>

        {/* Middle Feature Highlights List */}
        <div className="relative z-10 my-8 space-y-4">
          <h2 className="text-lg font-bold text-sky-100 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-sky-400" />
            จุดเด่นและฟังก์ชันการทำงานหลักของระบบ
          </h2>

          <div className="grid grid-cols-1 gap-3.5">
            {systemFeatures.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="flex items-start gap-3.5 p-3.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 transition-all hover:bg-white/15"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-500/20 text-sky-300 border border-sky-400/30">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                      {feat.title}
                    </h3>
                    <p className="text-[11px] text-chunjai-100 leading-relaxed">
                      {feat.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Security Compliance Badge */}
        <div className="relative z-10 pt-4 border-t border-white/15 flex items-center justify-between text-xs text-chunjai-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>คุ้มครองข้อมูลตามมาตรฐาน PDPA & RBAC 100%</span>
          </div>
          <span className="font-mono text-[11px] text-sky-300">v1.0 Production</span>
        </div>
      </div>

      {/* Right Side: Clean Production Login Form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-6 sm:p-12 bg-slate-50">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile Header Logo (Visible on Mobile/Tablet) */}
          <div className="text-center space-y-2 lg:hidden">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-chunjai-600 text-white shadow-lg shadow-chunjai-500/25 mb-1">
              <HeartPulse className="h-7 w-7 animate-pulse text-white" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-chunjai-950">
              ชุมใจ (Chunjai)
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              ระบบจัดการคลินิกชุมชนและติดตามสุขภาพอัจฉริยะ
            </p>
          </div>

          {/* Login Card */}
          <Card className="shadow-xl border-chunjai-100 bg-white">
            <CardHeader className="space-y-1 text-center pb-4 border-b border-slate-100">
              <CardTitle className="text-lg font-bold text-chunjai-950">
                เข้าสู่ระบบงาน (Login)
              </CardTitle>
              <CardDescription className="text-xs">
                กรุณากรอกชื่อผู้ใช้งานและรหัสผ่านเพื่อเข้าใช้งานระบบคลินิก
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent className="p-6 sm:p-8 space-y-5">
                {/* Error Alert */}
                {errorMessage && (
                  <div className="flex items-center gap-2.5 rounded-lg border border-rose-200 bg-rose-50 p-3.5 text-xs font-medium text-rose-700">
                    <AlertCircle className="h-4.5 w-4.5 shrink-0 text-rose-600" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Username Field */}
                <div className="space-y-2">
                  <label
                    htmlFor="username"
                    className="text-xs font-semibold text-slate-700 block tracking-wide"
                  >
                    ชื่อผู้ใช้งาน (Username) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
                    <input
                      id="username"
                      name="username"
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="กรอกชื่อผู้ใช้งาน..."
                      className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-10 pr-4 py-2.5 text-sm font-medium text-slate-900 transition-all focus:border-chunjai-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-chunjai-100"
                      disabled={isPending}
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="text-xs font-semibold text-slate-700 block tracking-wide"
                  >
                    รหัสผ่าน (Password) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-10 pr-4 py-2.5 text-sm font-medium text-slate-900 transition-all focus:border-chunjai-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-chunjai-100"
                      disabled={isPending}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isPending}
                  className="w-full h-11 font-bold text-sm bg-chunjai-600 hover:bg-chunjai-700 text-white shadow-md shadow-chunjai-500/20 transition-all rounded-xl mt-3"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4.5 w-4.5 animate-spin" />
                      กำลังเข้าสู่ระบบ...
                    </>
                  ) : (
                    "เข้าสู่ระบบ"
                  )}
                </Button>
              </CardContent>
            </form>
          </Card>

          {/* Footer Copyright */}
          <div className="text-center space-y-1 text-xs text-slate-400">
            <p>Chunjai — Community Clinic & Smart Health Tracking System</p>
            <p>© 2026 สงวนลิขสิทธิ์ตามกฎหมาย</p>
          </div>
        </div>
      </div>
    </div>
  );
}
