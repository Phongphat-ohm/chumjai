# 🤖 AGENT.md — คู่มือและข้อกำหนดสำหรับ AI ในโปรเจกต์ ชุมใจ (Chunjai)

> **คำชี้แจงสำหรับ AI Assistant / Agent:**
> โปรดอ่านและปฏิบัติตามคำแนะนำ สถาปัตยกรรม และ **กฎเหล็กภาคบังคับ (Mandatory Rules)** ในเอกสารนี้อย่างเคร่งครัดทุกครั้งที่ทำงานในโปรเจกต์นี้

---

## 📌 1. ภาพรวมโปรเจกต์ (Project Overview)

**ชุมใจ (Chunjai)** คือระบบบริหารจัดการคลินิกชุมชนและเวชระเบียนอิเล็กทรอนิกส์อัจฉริยะ (Community Clinic & Smart Health Tracking System) ที่ครอบคลุมการทำงานตั้งแต่การลงทะเบียนผู้ป่วย, คัดกรองสัญญาณชีพ, ห้องตรวจแพทย์ (SOAP Note & ICD-10), ห้องปฏิบัติการแล็บ/ชันสูตร, ห้องจ่ายยา, ระบบใบนัดหมาย, ระบบคลังยาและเวชภัณฑ์, หนังสือส่งตัวผู้ป่วย, และระบบความปลอดภัย Audit Log

---

## 🛠️ 2. เทคโนโลยีที่ใช้ในระบบ (Tech Stack)

| ส่วนประกอบ | เทคโนโลยี | รายละเอียดสำคัญ |
| :--- | :--- | :--- |
| **Framework** | Next.js 14 (App Router) | React Server Components & Server Actions |
| **Package Manager** | `bun` & `npm` | ใช้รัน Script และติดตั้ง Dependencies |
| **ORM** | **Prisma 7 (Release 7.9.1)** | ใช้ `@prisma/adapter-pg` ร่วมกับ `prisma.config.ts` |
| **Database** | PostgreSQL | ฐานข้อมูลหลักของระบบ |
| **Styling** | Tailwind CSS & Lucide Icons | Responsive Design & Medical UI Tokens |
| **Thai Typography** | **Google Font: Sarabun (TH Sarabun)** | ฟอนต์สารบรรณมาตรฐานกระทรวงสาธารณสุข (`font-sarabun`) |
| **PDF Generation** | `jspdf` + `html2canvas` | สร้างไฟล์ PDF ความละเอียดสูง 2.5x - 3x พร้อม Auto Print Dialog |
| **Validation** | Zod | ตรวจสอบ Data Type และ Schema ทั้ง Client และ Server |

---

## 📁 3. โครงสร้างโฟลเดอร์หลัก (Project Structure)

```text
src/
├── app/                              # Next.js App Router (หน้าจอการทำงานทั้งหมด)
│   ├── appointment/                  # ระบบนัดหมายผู้ป่วย & ใบนัด
│   ├── audit-log/                    # ระบบประวัติการเข้าใช้งานและความปลอดภัย
│   ├── doctor/                       # ห้องตรวจแพทย์ (SOAP Note, ICD-10, สั่งแล็บ, สั่งยา)
│   ├── health/                       # บันทึกสุขภาพและประวัติการรักษา
│   ├── inventory/                    # คลังยาและเวชภัณฑ์
│   ├── lab/                          # ศูนย์ปฏิบัติการแล็บ/ชันสูตร (รับออเดอร์, บันทึกผลแล็บ)
│   ├── login/                        # หน้าเข้าสู่ระบบ & Authentication
│   ├── patient/                      # ทะเบียนประวัติผู้ป่วย & ข้อมูลเวชระเบียน
│   ├── pharmacy/                     # ห้องจ่ายยา & ฉลากยามาตรฐาน GPP
│   ├── queue/                        # ระบบจัดการคิวและหน้าจอแสดงคิวผู้ป่วย
│   ├── referral/                     # หนังสือส่งตัวผู้ป่วย (Referral Letters)
│   ├── registration/                 # จุดลงทะเบียนผู้ป่วย & เปิด Visit
│   ├── reports/                      # รายงานสถิติและข้อมูลคลินิก
│   ├── settings/                     # ตั้งค่าคลินิกและเทมเพลตเอกสาร
│   └── triage/                       # จุดคัดกรอง สัญญาณชีพ และประเมินความเร่งด่วน
│
├── components/
│   ├── documents/                    # เอกสารทางการแพทย์มาตรฐาน
│   │   ├── DocumentHeader.tsx        # หัวกระดาษ & ท้ายเอกสารดึงข้อมูลจาก DB อัตโนมัติ
│   │   └── templates/                # 📂 แหล่งเก็บไฟล์เทมเพลตเอกสารแยกเฉพาะ (Modular)
│   │       ├── ReferralLetterTemplate.tsx   # 📄 เทมเพลต: หนังสือส่งตัวผู้ป่วย (A4)
│   │       ├── DrugLabelTemplate.tsx        # 💊 เทมเพลต: ฉลากยาภาษาไทย
│   │       ├── LabReportTemplate.tsx        # 🧪 เทมเพลต: ใบรายงานผลแล็บทางการ (A4)
│   │       └── AppointmentSlipTemplate.tsx  # 📅 เทมเพลต: ใบนัดหมายผู้ป่วย
│   ├── doctor/                       # Component ห้องตรวจ (ICD-10 Dialog, Prescription Modal)
│   ├── lab/                          # Component ห้องแล็บ (CreateLabOrder, RecordResult, ReportModal)
│   ├── pharmacy/                     # Component ห้องยา (DispenseModal, DrugLabelModal)
│   └── ui/                           # Base UI Components (Button, Card, Badge, Dialog ฯลฯ)
│
├── lib/
│   ├── pdf/
│   │   └── printPdfHelper.ts         # Utility กลางแปลง DOM/HTML เป็น PDF Blob & Auto-Print
│   ├── prisma.ts                     # Prisma 7 Database Client Instance
│   └── permissions.ts                # Default Role Permissions Mapping (RBAC)
│
├── server/
│   ├── actions/                      # Server Actions สำหรับ CRUD และ Logic ฐานข้อมูล
│   └── permissions/guard.ts          # Authentication & RBAC Guard (`requirePermission`, `requireAuth`)
│
├── generated/client/                 # Prisma Generated Client Output
└── prisma/schema.prisma              # Database Schema Definitions
```

---

## 🚨 4. กฎเหล็กภาคบังคับสำหรับ AI (Mandatory Rules for AI)

### ⚠️ กฎข้อที่ 1: ต้องรัน Test & Build ทุกครั้งหลังแก้ไขโค้ด (Mandatory Verification)
> **หลังจากการแก้ไขโค้ดทุกครั้ง (Without Exception)** AI จะต้องรันคำสั่ง Typecheck และทดสอบ Build เพื่อรับประกันว่าไม่มี Error ใดๆ ก่อนส่งมอบงานให้ผู้ใช้:
> ```bash
> # 1. ตรวจสอบ Type Safety
> npx tsc --noEmit
> 
> # 2. ตรวจสอบ Production Build
> bun run build   # หรือ npm run build
> ```
> หากพบ Type Error หรือ Build Error **ต้องแก้ไขให้เสร็จสมบูรณ์จนผ่าน 100% เสมอ**

---

### ⚠️ กฎข้อที่ 2: มาตรฐานการ Import Prisma 7
โปรเจกต์นี้ใช้ **Prisma 7.9.1** แบบ Adapter:
- ✅ **ต้อง Import Client จาก**: `import { prisma } from "@/lib/prisma";`
- ✅ **ต้อง Import Types & Enums จาก**: `import { ... } from "@/generated/client";`
- ❌ **ห้าม** Import จาก `@prisma/client` โดยตรงโดยเด็ดขาด

---

### ⚠️ กฎข้อที่ 3: ความปลอดภัยและการตรวจสอบสิทธิ์ (RBAC & Audit Logs)
- ทุก Server Action จะต้องผ่านการตรวจสอบ Session และสิทธิ์ด้วย `requireAuth()` หรือ `requirePermission("<PERMISSION_CODE>")` จาก `@/server/permissions/guard`
- เมื่อมีการกระทำสำคัญ (Create, Update, Delete, Dispense, Save SOAP, Create Lab ฯลฯ) **ต้องบันทึก Audit Log ลงในตาราง `auditLog` เสมอ**

---

### ⚠️ กฎข้อที่ 4: การสร้าง Unique Sequential Identifiers (HN, VisitNumber, QueueNumber)
- ❌ **ห้าม** ใช้เพียง `count()` + 1 ในการสร้างรหัสที่มี Unique Constraint (เช่น `visitNumber`, `hn`, `queueNumber`) เพราะจะเกิดข้อผิดพลาดชนกันในฐานข้อมูล
- ✅ **ต้อง** ใช้การดึงจาก Record ล่าสุดของวันนั้น (เช่น `findFirst({ where: { startsWith: prefix }, orderBy: { ...: "desc" } })`) แล้วนำตัวเลขมาบวก 1 (`+1`) เสมอ

---

### ⚠️ กฎข้อที่ 5: การปรับปรุงเอกสารพิมพ์และ PDF
- ไฟล์เทมเพลตเอกสารแยกเก็บอยู่ที่ `src/components/documents/templates/`
- ต้องใช้ฟอนต์ **`font-sarabun`** (TH Sarabun) เสมอ
- เอกสารขนาด A4 ต้องกำหนดความกว้างมาตรฐาน (เช่น `width: "794px"`, Padding `40px`) และห้ามบีบอัดคอลัมน์ เพื่อให้การ Export ด้วย `printPdfHelper.ts` มีสัดส่วนที่ถูกต้องและคมชัดระดับ 100%

---

## 🚀 5. คำสั่งที่ใช้งานบ่อย (Common Commands)

```bash
# Start Development Server
bun run dev

# Generate Prisma Client (Prisma 7)
bun run prisma generate   # หรือ npx prisma generate

# Typecheck
npx tsc --noEmit

# Production Build
bun run build
```
