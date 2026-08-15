import React from "react";
import { Loader2 } from "lucide-react";

export default function GlobalLoading() {
  return (
    <div className="flex h-[60vh] w-full flex-col items-center justify-center gap-3 animate-in fade-in duration-150">
      <div className="relative flex items-center justify-center">
        <div className="h-10 w-10 rounded-full border-2 border-chunjai-200 border-t-chunjai-600 animate-spin" />
        <Loader2 className="absolute h-5 w-5 text-chunjai-600 animate-pulse" />
      </div>
      <p className="text-xs font-semibold text-slate-500 animate-pulse">
        กำลังโหลดข้อมูล...
      </p>
    </div>
  );
}
