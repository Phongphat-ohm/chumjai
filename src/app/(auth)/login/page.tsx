"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { HeartPulse, Lock, User, AlertCircle, Loader2, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
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

  const fillDemoAccount = (demoUsername: string) => {
    setUsername(demoUsername);
    setPassword("Password123!");
    setErrorMessage(null);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 sm:p-6 lg:p-8">
      {/* Subtle Blue Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-chunjai-200/40 blur-3xl -z-10" />

      <div className="w-full max-w-md space-y-6">
        {/* Logo & Header Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-chunjai-600 text-white shadow-lg shadow-chunjai-500/25 mb-2">
            <HeartPulse className="h-8 w-8 animate-pulse" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-chunjai-950 sm:text-3xl">
            ชุมใจ (Chunjai)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            ระบบจัดการคลินิกชุมชนและติดตามสุขภาพอัจฉริยะ
          </p>
        </div>

        {/* Login Card */}
        <Card className="shadow-lg border-chunjai-100 bg-white">
          <CardHeader className="space-y-1 text-center pb-4 border-b border-slate-100">
            <CardTitle className="text-lg font-bold text-chunjai-900">
              เข้าสู่ระบบงาน (Login)
            </CardTitle>
            <CardDescription className="text-xs">
              กรุณากรอกชื่อผู้ใช้งานและรหัสผ่านเพื่อเข้าสู่ระบบ
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 pt-6">
              {/* Error Alert */}
              {errorMessage && (
                <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Username Field */}
              <div className="space-y-1.5">
                <label
                  htmlFor="username"
                  className="text-xs font-semibold text-slate-700 block"
                >
                  ชื่อผู้ใช้งาน (Username)
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="เช่น admin, doctor1, nurse1"
                    className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/50 pl-9 pr-3 text-sm text-slate-900 transition-all focus:border-chunjai-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-chunjai-200"
                    disabled={isPending}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <label
                  htmlFor="password"
                  className="text-xs font-semibold text-slate-700 block"
                >
                  รหัสผ่าน (Password)
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/50 pl-9 pr-3 text-sm text-slate-900 transition-all focus:border-chunjai-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-chunjai-200"
                    disabled={isPending}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isPending}
                className="w-full h-10 font-semibold bg-chunjai-600 hover:bg-chunjai-700 text-white shadow-sm"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    กำลังเข้าสู่ระบบ...
                  </>
                ) : (
                  "เข้าสู่ระบบ"
                )}
              </Button>
            </CardContent>
          </form>

          {/* Quick Demo Selection Footer */}
          <CardFooter className="flex flex-col space-y-3 pt-4 border-t border-slate-100 bg-chunjai-50/50 rounded-b-xl">
            <div className="flex items-center justify-between w-full">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                เลือกบัญชีทดสอบ (Demo Accounts)
              </span>
              <Badge variant="secondary" className="text-[10px]">
                <ShieldCheck className="mr-1 h-3 w-3 text-chunjai-600" />
                Dev Mode
              </Badge>
            </div>
            <div className="flex flex-wrap gap-1.5 w-full">
              <button
                type="button"
                onClick={() => fillDemoAccount("admin")}
                className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-chunjai-100 hover:text-chunjai-900 transition-colors"
              >
                ผู้ดูแลระบบ (admin)
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount("doctor1")}
                className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-chunjai-100 hover:text-chunjai-900 transition-colors"
              >
                แพทย์ (doctor1)
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount("nurse1")}
                className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-chunjai-100 hover:text-chunjai-900 transition-colors"
              >
                พยาบาล (nurse1)
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount("reception1")}
                className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-chunjai-100 hover:text-chunjai-900 transition-colors"
              >
                จุดลงทะเบียน (reception1)
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount("pharmacy1")}
                className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-chunjai-100 hover:text-chunjai-900 transition-colors"
              >
                เภสัชกร (pharmacy1)
              </button>
            </div>
          </CardFooter>
        </Card>

        {/* Footer Credit */}
        <p className="text-center text-xs text-slate-400">
          Chunjai — Community Clinic & Smart Health Tracking System © 2026
        </p>
      </div>
    </div>
  );
}
