"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  Users,
  UserPlus,
  Search,
  Key,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock,
  Mail,
  Phone,
  UserCheck,
  Edit3,
  UserX,
  RefreshCw,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserRole } from "@/generated/client";
import {
  getUsersAction,
  createUserAction,
  updateUserAction,
  resetUserPasswordAction,
  toggleUserActiveAction,
} from "@/server/actions/user-management";

export default function UserManagementPage() {
  const [isPending, startTransition] = useTransition();

  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "ALL">("ALL");
  const [accessDenied, setAccessDenied] = useState(false);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<any | null>(null);
  const [resetUser, setResetUser] = useState<any | null>(null);

  // Alert message
  const [alertMessage, setAlertMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form Create State
  const [cUsername, setCUsername] = useState("");
  const [cPassword, setCPassword] = useState("");
  const [cFullName, setCFullName] = useState("");
  const [cRole, setCRole] = useState<UserRole>("RECEPTIONIST");
  const [cEmail, setCEmail] = useState("");
  const [cPhone, setCPhone] = useState("");

  // Form Edit State
  const [eFullName, setEFullName] = useState("");
  const [eRole, setERole] = useState<UserRole>("RECEPTIONIST");
  const [eEmail, setEEmail] = useState("");
  const [ePhone, setEPhone] = useState("");

  // Form Reset Password State
  const [rNewPassword, setRNewPassword] = useState("");

  const fetchUsers = (q = search, r = roleFilter) => {
    startTransition(async () => {
      const res = await getUsersAction({ search: q, role: r });
      if (res.success && res.data) {
        setUsers(res.data);
      } else if (res.error?.includes("ไม่มีสิทธิ์")) {
        setAccessDenied(true);
      }
    });
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers(search, roleFilter);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAlertMessage(null);

    startTransition(async () => {
      const res = await createUserAction({
        username: cUsername,
        password: cPassword,
        fullName: cFullName,
        role: cRole,
        email: cEmail,
        phoneNumber: cPhone,
      });

      if (res.success) {
        setAlertMessage({ type: "success", text: `สร้างบัญชีผู้ใช้ @${cUsername} สำเร็จ!` });
        setIsCreateOpen(false);
        setCUsername("");
        setCPassword("");
        setCFullName("");
        setCEmail("");
        setCPhone("");
        fetchUsers();
      } else {
        setAlertMessage({ type: "error", text: res.error || "ไม่สามารถสร้างผู้ใช้ได้" });
      }
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;
    setAlertMessage(null);

    startTransition(async () => {
      const res = await updateUserAction({
        userId: editUser.id,
        fullName: eFullName,
        role: eRole,
        email: eEmail,
        phoneNumber: ePhone,
      });

      if (res.success) {
        setAlertMessage({ type: "success", text: `อัปเดตข้อมูลผู้ใช้ @${editUser.username} สำเร็จ!` });
        setEditUser(null);
        fetchUsers();
      } else {
        setAlertMessage({ type: "error", text: res.error || "ไม่สามารถอัปเดตผู้ใช้ได้" });
      }
    });
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetUser) return;
    setAlertMessage(null);

    startTransition(async () => {
      const res = await resetUserPasswordAction({
        userId: resetUser.id,
        newPassword: rNewPassword,
      });

      if (res.success) {
        setAlertMessage({ type: "success", text: `รีเซ็ตรหัสผ่านของผู้ใช้ @${resetUser.username} สำเร็จ!` });
        setResetUser(null);
        setRNewPassword("");
      } else {
        setAlertMessage({ type: "error", text: res.error || "ไม่สามารถรีเซ็ตรหัสผ่านได้" });
      }
    });
  };

  const handleToggleActive = (user: any) => {
    startTransition(async () => {
      const res = await toggleUserActiveAction(user.id);
      if (res.success) {
        setAlertMessage({
          type: "success",
          text: `เปลี่ยนสถานะบัญชี @${user.username} เป็น ${!user.isActive ? "เปิดใช้งาน" : "ระงับใช้งาน"} แล้ว`,
        });
        fetchUsers();
      }
    });
  };

  const getRoleBadge = (r: UserRole) => {
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
          หน้าการบริหารจัดการผู้ใช้งานสงวนสิทธิ์เฉพาะผู้ดูแลระบบ (ADMIN) เท่านั้น
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-chunjai-600 text-white shadow-md">
              <Users className="h-5 w-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-chunjai-950">
              จัดการข้อมูลผู้ใช้งานและบุคลากร (User Management)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            สร้างบัญชีบุคลากรใหม่ กำหนดบทบาทสิทธิ์การใช้งาน (RBAC) และรีเซ็ตรหัสผ่าน
          </p>
        </div>

        <Button
          onClick={() => setIsCreateOpen(true)}
          className="bg-chunjai-600 hover:bg-chunjai-700 text-white font-bold text-xs shadow-sm"
        >
          <UserPlus className="mr-1.5 h-4 w-4" />
          สร้างบัญชีผู้ใช้งานใหม่
        </Button>
      </div>

      {alertMessage && (
        <div
          className={`flex items-center gap-2 rounded-lg border p-3 text-xs font-bold ${
            alertMessage.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-rose-200 bg-rose-50 text-rose-800"
          }`}
        >
          {alertMessage.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
          )}
          <span>{alertMessage.text}</span>
        </div>
      )}

      {/* Filter Tabs & Search */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Search Input */}
            <form onSubmit={handleSearch} className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ค้นหาชื่อผู้ใช้, ชื่อ-นามสกุล..."
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/50 pl-9 pr-3 text-xs focus:border-chunjai-500 focus:bg-white focus:outline-none"
              />
            </form>

            {/* Role Filter Tabs */}
            <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
              <button
                onClick={() => setRoleFilter("ALL")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  roleFilter === "ALL"
                    ? "bg-chunjai-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                ทั้งหมด
              </button>
              <button
                onClick={() => setRoleFilter("DOCTOR")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  roleFilter === "DOCTOR"
                    ? "bg-chunjai-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                แพทย์
              </button>
              <button
                onClick={() => setRoleFilter("NURSE")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  roleFilter === "NURSE"
                    ? "bg-chunjai-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                พยาบาล
              </button>
              <button
                onClick={() => setRoleFilter("PHARMACIST")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  roleFilter === "PHARMACIST"
                    ? "bg-chunjai-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                เภสัชกร
              </button>
              <button
                onClick={() => setRoleFilter("RECEPTIONIST")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  roleFilter === "RECEPTIONIST"
                    ? "bg-chunjai-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                เจ้าหน้าที่
              </button>
              <button
                onClick={() => setRoleFilter("ADMIN")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  roleFilter === "ADMIN"
                    ? "bg-chunjai-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                Admin
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users List Table */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          {isPending && users.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-chunjai-600" />
              <p className="text-xs font-medium">กำลังโหลดรายชื่อผู้ใช้งาน...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center text-slate-400">ไม่พบบัญชีผู้ใช้งานตามเงื่อนไขที่เลือก</div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3">ชื่อผู้ใช้ / บทบาท</th>
                  <th className="px-6 py-3">ชื่อ-นามสกุล บุคลากร</th>
                  <th className="px-6 py-3">ข้อมูลติดต่อ</th>
                  <th className="px-6 py-3">สถานะบัญชี</th>
                  <th className="px-6 py-3 text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 space-y-1">
                      <span className="font-bold text-slate-900 block font-mono text-sm">
                        @{u.username}
                      </span>
                      <div>{getRoleBadge(u.role)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-900 block text-sm">
                        {u.fullName}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        สร้างเมื่อ {new Date(u.createdAt).toLocaleDateString("th-TH")}
                      </span>
                    </td>
                    <td className="px-6 py-4 space-y-0.5 text-slate-600 text-xs">
                      {u.email && <div className="flex items-center gap-1"><Mail className="h-3 w-3 text-slate-400" /> {u.email}</div>}
                      {u.phoneNumber && <div className="flex items-center gap-1"><Phone className="h-3 w-3 text-slate-400" /> {u.phoneNumber}</div>}
                      {!u.email && !u.phoneNumber && <span className="text-slate-400 font-italic">-</span>}
                    </td>
                    <td className="px-6 py-4">
                      {u.isActive ? (
                        <Badge variant="success" className="text-[10px]">เปิดใช้งาน</Badge>
                      ) : (
                        <Badge variant="destructive" className="text-[10px]">ระงับการใช้งาน</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditUser(u);
                          setEFullName(u.fullName);
                          setERole(u.role);
                          setEEmail(u.email || "");
                          setEPhone(u.phoneNumber || "");
                        }}
                        className="h-8 text-xs text-slate-700"
                      >
                        <Edit3 className="mr-1 h-3.5 w-3.5 text-chunjai-600" />
                        แก้ไข
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setResetUser(u)}
                        className="h-8 text-xs text-amber-700 border-amber-200 hover:bg-amber-50"
                      >
                        <Key className="mr-1 h-3.5 w-3.5" />
                        รีเซ็ตรหัสผ่าน
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleToggleActive(u)}
                        className={`h-8 text-xs ${u.isActive ? "text-rose-600 hover:bg-rose-50" : "text-emerald-600 hover:bg-emerald-50"}`}
                      >
                        {u.isActive ? "ระงับ" : "เปิดใช้งาน"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Modal: Create User */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-xl bg-white shadow-2xl border border-chunjai-100">
            <div className="flex items-center justify-between border-b border-chunjai-100 px-6 py-4 bg-chunjai-50/60 rounded-t-xl">
              <div className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-chunjai-600" />
                <h3 className="text-base font-bold text-chunjai-950">สร้างบัญชีผู้ใช้งานใหม่</h3>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsCreateOpen(false)} className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">
                    ชื่อผู้ใช้งาน (Username) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={cUsername}
                    onChange={(e) => setCUsername(e.target.value)}
                    placeholder="doctor_somchai"
                    className="h-10 w-full rounded-lg border border-slate-200 px-3 text-xs text-slate-900 focus:border-chunjai-500 focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">
                    รหัสผ่าน <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={cPassword}
                    onChange={(e) => setCPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-10 w-full rounded-lg border border-slate-200 px-3 text-xs text-slate-900 focus:border-chunjai-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">
                  ชื่อ-นามสกุล บุคลากร <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={cFullName}
                  onChange={(e) => setCFullName(e.target.value)}
                  placeholder="เช่น นพ. สมชาย ใจดี"
                  className="h-10 w-full rounded-lg border border-slate-200 px-3 text-xs text-slate-900 focus:border-chunjai-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">
                  บทบาทหน้าที่ (User Role) <span className="text-rose-500">*</span>
                </label>
                <select
                  value={cRole}
                  onChange={(e) => setCRole(e.target.value as UserRole)}
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:border-chunjai-500 focus:outline-none"
                >
                  <option value="DOCTOR">แพทย์ (DOCTOR)</option>
                  <option value="NURSE">พยาบาล (NURSE)</option>
                  <option value="PHARMACIST">เภสัชกร (PHARMACIST)</option>
                  <option value="RECEPTIONIST">เจ้าหน้าที่ลงทะเบียน (RECEPTIONIST)</option>
                  <option value="ADMIN">ผู้ดูแลระบบ (ADMIN)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">อีเมลติดต่อ</label>
                  <input
                    type="email"
                    value={cEmail}
                    onChange={(e) => setCEmail(e.target.value)}
                    placeholder="doctor@chunjai.com"
                    className="h-10 w-full rounded-lg border border-slate-200 px-3 text-xs focus:border-chunjai-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">เบอร์โทรศัพท์</label>
                  <input
                    type="text"
                    value={cPhone}
                    onChange={(e) => setCPhone(e.target.value)}
                    placeholder="081-234-5678"
                    className="h-10 w-full rounded-lg border border-slate-200 px-3 text-xs focus:border-chunjai-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                  ยกเลิก
                </Button>
                <Button type="submit" disabled={isPending} className="bg-chunjai-600 hover:bg-chunjai-700 text-white font-semibold">
                  ยืนยันสร้างบัญชี
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit User */}
      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-xl bg-white shadow-2xl border border-chunjai-100">
            <div className="flex items-center justify-between border-b border-chunjai-100 px-6 py-4 bg-chunjai-50/60 rounded-t-xl">
              <div className="flex items-center gap-2">
                <Edit3 className="h-5 w-5 text-chunjai-600" />
                <h3 className="text-base font-bold text-chunjai-950">แก้ไขข้อมูลผู้ใช้ @{editUser.username}</h3>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setEditUser(null)} className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">
                  ชื่อ-นามสกุล บุคลากร <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={eFullName}
                  onChange={(e) => setEFullName(e.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-200 px-3 text-xs text-slate-900 focus:border-chunjai-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">
                  บทบาทหน้าที่ (User Role) <span className="text-rose-500">*</span>
                </label>
                <select
                  value={eRole}
                  onChange={(e) => setERole(e.target.value as UserRole)}
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:border-chunjai-500 focus:outline-none"
                >
                  <option value="DOCTOR">แพทย์ (DOCTOR)</option>
                  <option value="NURSE">พยาบาล (NURSE)</option>
                  <option value="PHARMACIST">เภสัชกร (PHARMACIST)</option>
                  <option value="RECEPTIONIST">เจ้าหน้าที่ลงทะเบียน (RECEPTIONIST)</option>
                  <option value="ADMIN">ผู้ดูแลระบบ (ADMIN)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">อีเมลติดต่อ</label>
                  <input
                    type="email"
                    value={eEmail}
                    onChange={(e) => setEEmail(e.target.value)}
                    className="h-10 w-full rounded-lg border border-slate-200 px-3 text-xs focus:border-chunjai-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">เบอร์โทรศัพท์</label>
                  <input
                    type="text"
                    value={ePhone}
                    onChange={(e) => setEPhone(e.target.value)}
                    className="h-10 w-full rounded-lg border border-slate-200 px-3 text-xs focus:border-chunjai-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={() => setEditUser(null)}>
                  ยกเลิก
                </Button>
                <Button type="submit" disabled={isPending} className="bg-chunjai-600 hover:bg-chunjai-700 text-white font-semibold">
                  บันทึกการปรับปรุง
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Reset Password */}
      {resetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-xl bg-white shadow-2xl border border-chunjai-100">
            <div className="flex items-center justify-between border-b border-chunjai-100 px-6 py-4 bg-chunjai-50/60 rounded-t-xl">
              <div className="flex items-center gap-2">
                <Key className="h-5 w-5 text-amber-600" />
                <h3 className="text-base font-bold text-chunjai-950">รีเซ็ตรหัสผ่าน @{resetUser.username}</h3>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setResetUser(null)} className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleResetSubmit} className="p-6 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">
                  กำหนดรหัสผ่านใหม่ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={rNewPassword}
                  onChange={(e) => setRNewPassword(e.target.value)}
                  placeholder="ความยาวอย่างน้อย 6 ตัวอักษร"
                  className="h-10 w-full rounded-lg border border-slate-200 px-3 text-xs text-slate-900 focus:border-chunjai-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={() => setResetUser(null)}>
                  ยกเลิก
                </Button>
                <Button type="submit" disabled={isPending} className="bg-amber-600 hover:bg-amber-700 text-white font-semibold">
                  ยืนยันรีเซ็ตรหัสผ่าน
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
