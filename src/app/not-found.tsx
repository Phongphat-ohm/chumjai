import Link from "next/link";
import { AlertCircle, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h2 className="text-2xl font-bold text-slate-800 mb-2">404 - ไม่พบหน้าที่ค้นหา</h2>
      <p className="text-slate-500 max-w-md mb-6 text-sm">
        หน้าที่คุณกำลังเข้าชมอาจถูกย้าย ลบ หรือไม่มีอยู่ในระบบคลินิกชุมชน
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-xl transition-all shadow-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        กลับสู่หน้าหลัก
      </Link>
    </div>
  );
}
