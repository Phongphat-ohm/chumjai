"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Error:", error);
  }, [error]);

  return (
    <html lang="th">
      <body className="bg-slate-50 min-h-screen flex items-center justify-center p-6 text-slate-800">
        <div className="flex flex-col items-center justify-center p-8 max-w-md text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold mb-2">ระบบขัดข้อง</h2>
          <p className="text-slate-500 text-sm mb-6">
            เกิดข้อผิดพลาดระดับระบบ กรุณารีเฟรชหน้าเว็บหรือลองใหม่อีกครั้ง
          </p>
          <button
            onClick={() => reset()}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-xl transition-all shadow-sm cursor-pointer"
          >
            <RefreshCcw className="w-4 h-4" />
            ลองใหม่อีกครั้ง
          </button>
        </div>
      </body>
    </html>
  );
}
