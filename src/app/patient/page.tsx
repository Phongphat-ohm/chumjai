"use client";

import React, { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  UserPlus,
  Filter,
  Eye,
  EyeOff,
  ShieldCheck,
  ChevronRight,
  ShieldAlert,
  Loader2,
  Calendar,
  Phone,
  CreditCard,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { maskNationalId, maskPhoneNumber } from "@/lib/masking";
import { PatientFormDialog } from "@/components/patients/PatientFormDialog";
import { getPatientsAction } from "@/server/actions/patient";
import { RightsType } from "@/generated/client";

export default function PatientListPage() {
  const [isPending, startTransition] = useTransition();
  const [patients, setPatients] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [rightsFilter, setRightsFilter] = useState<string>("");
  const [showSensitiveData, setShowSensitiveData] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const fetchPatients = (searchQuery: string = search, rights: string = rightsFilter) => {
    startTransition(async () => {
      const res = await getPatientsAction({
        search: searchQuery,
        rightsType: rights || undefined,
        limit: 20,
      });

      if (res.success && res.data) {
        setPatients(res.data.patients);
        setTotal(res.data.total);
      }
    });
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = search.trim();

    // ถ้ามี search query ต้องตรวจสอบว่าเป็น HN หรือเลขบัตรประชาชน 13 หลักเท่านั้น
    if (trimmed) {
      const upperVal = trimmed.toUpperCase();
      const isHN = upperVal.startsWith("HN") && upperVal.replace(/^HN/, "").replace(/[^0-9]/g, "").length >= 1;
      const isNationalId = /^\d{13}$/.test(trimmed.replace(/-/g, ""));
      if (!isHN && !isNationalId) {
        // ไม่ผ่าน validation — ไม่ query
        return;
      }
    }

    fetchPatients(trimmed, rightsFilter);
  };

  const getRightsLabel = (type: RightsType) => {
    switch (type) {
      case RightsType.UNIVERSAL_COVERAGE:
        return "สิทธิบัตรทอง 30 บาท";
      case RightsType.SOCIAL_SECURITY:
        return "ประกันสังคม";
      case RightsType.CIVIL_SERVANT:
        return "จ่ายตรงข้าราชการ";
      case RightsType.SELF_PAY:
        return "ชำระเงินเอง";
      default:
        return "อื่นๆ";
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-chunjai-600 text-white shadow-md">
              <Users className="h-5 w-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-chunjai-950">
              ทะเบียนผู้ป่วย (Patient Directory)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            ค้นหา ตรวจสอบประวัติ และลงทะเบียนผู้ป่วยใหม่ในระบบคลินิกชุมชน
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSensitiveData(!showSensitiveData)}
            className="text-xs"
            title="สลับการแสดงผลข้อมูลส่วนบุคคลตาม PDPA"
          >
            {showSensitiveData ? (
              <>
                <EyeOff className="mr-1.5 h-3.5 w-3.5 text-chunjai-600" />
                ซ่อนข้อมูล PDPA
              </>
            ) : (
              <>
                <Eye className="mr-1.5 h-3.5 w-3.5 text-chunjai-600" />
                แสดงข้อมูลเต็ม
              </>
            )}
          </Button>

          <Button
            onClick={() => setIsFormOpen(true)}
            className="bg-chunjai-600 hover:bg-chunjai-700 text-white font-semibold text-xs shadow-sm"
          >
            <UserPlus className="mr-1.5 h-4 w-4" />
            ลงทะเบียนผู้ป่วยใหม่
          </Button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="พิมพ์ HN (เช่น HN690001) หรือเลขบัตรประชาชน 13 หลัก แล้วกด Enter หรือ 'ค้นหา'"
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/50 pl-9 pr-4 text-xs text-slate-900 focus:border-chunjai-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-chunjai-200"
              />
            </div>

            <div className="w-full sm:w-56">
              <select
                value={rightsFilter}
                onChange={(e) => {
                  setRightsFilter(e.target.value);
                  fetchPatients(search, e.target.value);
                }}
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 text-xs text-slate-900 focus:border-chunjai-500 focus:bg-white focus:outline-none"
              >
                <option value="">ทุกสิทธิการรักษา</option>
                <option value={RightsType.UNIVERSAL_COVERAGE}>สิทธิบัตรทอง (30 บาท)</option>
                <option value={RightsType.SOCIAL_SECURITY}>สิทธิประกันสังคม</option>
                <option value={RightsType.CIVIL_SERVANT}>สิทธิข้าราชการ / จ่ายตรง</option>
                <option value={RightsType.SELF_PAY}>ชำระเงินเอง</option>
              </select>
            </div>

            <Button type="submit" disabled={isPending} className="h-10 bg-chunjai-600 text-white font-medium text-xs px-6">
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "ค้นหา"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Patient Directory Data Table */}
      <Card>
        <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold">
              รายชื่อผู้ป่วยทั้งหมด ({total} รายการ)
            </CardTitle>
            <CardDescription className="text-xs">
              คลิกที่รายชื่อผู้ป่วยเพื่อดูโปรไฟล์และประวัติการรับบริการ
            </CardDescription>
          </div>

          <Badge variant="secondary" className="text-[10px]">
            <ShieldCheck className="mr-1 h-3 w-3 text-chunjai-600" />
            PDPA Masking Protected
          </Badge>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          {isPending && patients.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-chunjai-600" />
              <p className="text-xs font-medium">กำลังโหลดข้อมูลผู้ป่วย...</p>
            </div>
          ) : patients.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <Users className="mx-auto h-10 w-10 text-slate-300" />
              <p className="text-sm font-semibold text-slate-700">ไม่พบข้อมูลผู้ป่วย</p>
              <p className="text-xs">ลองค้นหาด้วยคำค้นอื่น หรือลงทะเบียนผู้ป่วยใหม่ในระบบ</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3">HN</th>
                  <th className="px-6 py-3">ชื่อ - นามสกุล</th>
                  <th className="px-6 py-3">เลขบัตรประชาชน</th>
                  <th className="px-6 py-3">เบอร์โทรศัพท์</th>
                  <th className="px-6 py-3">สิทธิการรักษา</th>
                  <th className="px-6 py-3">การแพ้ยา</th>
                  <th className="px-6 py-3 text-right">ดำเนินการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {patients.map((patient) => {
                  const hasAllergies = patient.allergies && patient.allergies.length > 0;

                  return (
                    <tr
                      key={patient.id}
                      className="hover:bg-chunjai-50/50 transition-colors group cursor-pointer"
                    >
                      <td className="px-6 py-4 font-bold text-chunjai-700">
                        {patient.hn}
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/patient/${patient.id}`}
                          className="font-semibold text-chunjai-950 hover:text-chunjai-600 hover:underline block"
                        >
                          {patient.firstName} {patient.lastName}
                        </Link>
                        <span className="text-[11px] text-slate-400 font-normal">
                          เพศ: {patient.gender === "MALE" ? "ชาย" : "หญิง"}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-slate-600">
                        {showSensitiveData
                          ? patient.nationalId || "-"
                          : maskNationalId(patient.nationalId)}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {showSensitiveData
                          ? patient.phoneNumber
                          : maskPhoneNumber(patient.phoneNumber)}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className="text-[10px] bg-slate-50">
                          {getRightsLabel(patient.rightsType)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        {hasAllergies ? (
                          <Badge variant="destructive" className="text-[10px]">
                            <ShieldAlert className="mr-1 h-3 w-3" />
                            แพ้ยา ({patient.allergies.length})
                          </Badge>
                        ) : (
                          <span className="text-slate-400 text-[11px]">ปฏิเสธการแพ้</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/patient/${patient.id}`}>
                          <Button variant="ghost" size="sm" className="h-8 text-chunjai-700 hover:bg-chunjai-100">
                            ดูโปรไฟล์
                            <ChevronRight className="ml-1 h-3.5 w-3.5" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Patient Creation Modal Dialog */}
      <PatientFormDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={() => fetchPatients()}
      />
    </div>
  );
}
