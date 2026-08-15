# 🏥 ชุมใจ (Chunjai) — Community Clinic & Smart Health Tracking System

[![Next.js 14](https://img.shields.io/badge/Next.js-14.2.15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-6.19-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-336791?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

**ชุมใจ (Chunjai)** คือระบบบริหารจัดการคลินิกชุมชน โรงพยาบาลส่งเสริมสุขภาพตำบล (รพ.สต.) และศูนย์บริการสาธารณสุขแบบครบวงจร (Full-Stack Smart Community Clinic Management System) พัฒนาด้วยสถาปัตยกรรม **Next.js 14 App Router, Server Actions, Prisma ORM, PostgreSQL** และระบบเรียกคิวข้ามเครื่องแบบ Real-time ด้วย **Server-Sent Events (SSE)** พร้อมเสียงสังเคราะห์ภาษาไทย (Thai Speech Synthesis)

---

## 🌟 ฟีเจอร์หลักของระบบ (Core Features)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           🏥 ระบบบริหารคลินิกชุมใจ                      │
└───────┬─────────────────┬─────────────────┬─────────────────┬───────────┘
        │                 │                 │                 │
   📋 เวชระเบียน     🩺 จุดคัดกรอง     👨‍⚕️ ห้องตรวจแพทย์    💊 ห้องยา & คลัง
   - ค้นหา HN/ชื่อ    - สัญญาณชีพ & BMI   - บันทึก SOAP Note - ตัดสต็อก FEFO
   - ตรวจสอบสิทธิ     - คัดกรอง 5 ระดับ  - ICD-10 วินิจฉัย   - พิมพ์ฉลากยาไทย
   - ออกคิวบริการ     - ส่งต่อห้องตรวจ   - สั่งยา & สั่งแล็บ - กรองคิวยาวันนี้
```

### 1. 📋 งานเวชระเบียนและลงทะเบียนผู้ป่วย (Patient & Visit Registration)
* ค้นหาประวัติผู้ป่วยรวดเร็วด้วย **ชื่อ, นามสกุล, เลขบัตรประชาชน (13 หลัก), หมายเลข HN หรือเบอร์โทรศัพท์**
* ระบบสร้างหมายเลขประจำตัวผู้ป่วย (HN) อัตโนมัติในรูปแบบ `HN-YYYY-XXXXX`
* บันทึกประวัติสุขภาพ โรคประจำตัว ยาที่ใช้ประจำ และ **ระบบแจ้งเตือนการแพ้ยาเด่นชัด (High-Alert Allergy Banner)**
* รองรับสิทธิการรักษาพยาบาลทุกประเภท: บัตรทอง 30 บาท (UC), ประกันสังคม, ข้าราชการ/จ่ายตรง, ชำระเงินเอง

### 2. 🩺 จุดคัดกรองและวัดสัญญาณชีพ (Triage & Vital Signs Hub)
* คัดกรองระดับความเร่งด่วนตามมาตรฐาน 5 ระดับ (Resuscitation, Emergency, Urgent, Semi-Urgent, Non-Urgent)
* บันทึกสัญญาณชีพ (BP, HR, RR, Temp, SpO2), ระดับความปวด (Pain Score 0-10) และคำนวณดัชนีมวลกาย (BMI) อัตโนมัติ
* ส่งต่อผู้ป่วยเข้าคิวห้องตรวจแพทย์ที่ประจำการในแต่ละห้องได้ทันที

### 3. 👨‍⚕️ ห้องตรวจและบันทึกการรักษา (Doctor Consultation & SOAP Notes)
* หน้าจอตรวจรักษาสำหรับแพทย์แบบรวมศูนย์ (Single-screen Doctor Workspace)
* บันทึกเวชระเบียนรูปแบบ **SOAP Note (Subjective, Objective, Assessment, Plan)**
* ค้นหาและบันทึกรหัสโรคมาตรฐานสากล **ICD-10** (Primary, Secondary, Complication)
* สั่งจ่ายยา (CPOE) พร้อมตรวจสอบประวัติการแพ้ยาของผู้ป่วยอัตโนมัติ
* สั่งตรวจทางห้องปฏิบัติการ (Lab Orders), บันทึกนัดหมายล่วงหน้า และออกใบส่งต่อผู้ป่วย (Referrals)

### 4. 💊 ห้องยา จ่ายยา และคลังยาอัจฉริยะ (Pharmacy & Smart Inventory)
* กรองและแสดงผลเฉพาะ **คิวใบสั่งยาประจำวันนี้** เพื่อความแม่นยำและเป็นระเบียบ
* ระบบตัดสต็อกยาอัตโนมัติตามหลัก **FEFO (First-Expired, First-Out)** ป้องกันยาหมดอายุค้างคลัง
* **พิมพ์ฉลากยาภาษาไทย (Thai Drug Label)** พร้อมวิธีรับประทาน ข้อควรระวัง และคำเตือน
* ระบบแจ้งเตือนสต็อกยาใกล้หมด (Low Stock Alert) และประวัติความเคลื่อนไหวทางคลังยา

### 5. 📢 ศูนย์คิวและจอแสดงผลสาธารณะ (Smart Queue Hub & Public TV Display)
* **Real-time Streaming ข้ามเครื่อง (Multi-Device SSE):** หน้าจอทีวีสาธารณะ (`/queue/display`) อัปเดตและส่งเสียงเรียกคิวทันทีภายใน <50ms โดยไม่ต้องติดตั้งซอฟต์แวร์เพิ่ม
* **เสียงเรียกคิวภาษาไทยมาตรฐาน (Hospital Audio & Thai TTS):**
  * เสียงสัญญาณ Chime (ดิ่ง-ด่อง) กังวานนำก่อนขานหมายเลข
  * ขานหมายเลขทีละหลักอย่างชัดเจน เว้นวรรคเป็นธรรมชาติ
  * เลือกปรับหางเสียงได้ (**ครับ** / **ค่ะ** / ไม่มี) และคำนำหน้า (**ขอเชิญหมายเลข** / **เชิญหมายเลข** / **ขอเชิญคิว**)
  * ระบบป้องกันเสียงเล่นวนลูปซ้ำซ้อน (Audio Deduplication Protection)
* เลือกห้องบริการปลายทาง (Target Station Routing) เช่น ส่งเข้าห้องตรวจแพทย์ 1, 2 หรือห้องยา

### 6. 🏢 ผังตารางเวรและการจัดการห้องตรวจ (Duty Schedules & Service Stations)
* ผังไทม์ไลน์ตารางเวลา 07:00 - 21:00 น. แบบ Hourly Box Cells พร้อมเส้นเวลา Real-time Indicator
* คลิกดูตารางเวรประจำห้องตรวจได้โดยตรง พร้อมระบบแก้ไขและลบห้องบริการ
* ระบบดึงแพทย์/เจ้าหน้าที่ผู้ปฏิบัติงานประจำห้องเข้าสู่คิวอัตโนมัติตามช่วงเวลาจริง (Auto-Shift Sync)

### 7. 🛡️ ความปลอดภัยและการควบคุมสิทธิ์ (Security, RBAC & Audit Log)
* ระบบพิสูจน์ตัวตนด้วย **JWT (JSON Web Token)** และ HTTP-Only Secure Cookies
* การกำหนดสิทธิ์ตามบทบาทและหน้าที่ (Role-Based Access Control & Principle of Least Privilege)
* สิทธิ์ของระบบครอบคลุม 33 รายการ (Permissions)
* บันทึกประวัติการกระทำสำคัญของระบบทั้งหมดลงใน **Audit Log** (ใคร ทำอะไร เมื่อไหร่ สำเร็จหรือไม่)

---

## 💻 เทคโนโลยีที่ใช้ (Tech Stack)

| ส่วนของระบบ | เทคโนโลยี |
| :--- | :--- |
| **Framework** | [Next.js 14.2.15 (App Router)](https://nextjs.org/) |
| **Language** | [TypeScript 5.x](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS 3.4](https://tailwindcss.com/) + CSS Variables + Radix UI |
| **Database & ORM** | [PostgreSQL 15+](https://www.postgresql.org/) + [Prisma ORM 6.19](https://www.prisma.io/) |
| **Real-time Sync** | Server-Sent Events (SSE) + BroadcastChannel API + LocalStorage Sync |
| **Audio Engine** | Web Audio API (Synthesizer Chime) + Web Speech Synthesis API |
| **Security & Auth** | `jose` (JWT) + `bcryptjs` (Password Hashing) |
| **Icons & UI** | `lucide-react`, `clsx`, `tailwind-merge` |

---

## 📁 โครงสร้างโปรเจกต์ (Project Structure)

```text
chumjai/
├── prisma/
│   ├── migrations/               # ประวัติการจัดการโครงสร้างฐานข้อมูล (SQL Migrations)
│   ├── schema.prisma             # นิยามโครงสร้างตาราง Enums และความสัมพันธ์ใน DB
│   ├── seed.ts                   # สคริปต์สร้างสิทธิ์, คิว, การตั้งค่า และบัญชี Admin
│   ├── seed-drugs.ts             # สคริปต์ลงรายการยามาตรฐาน
│   ├── seed-batches.ts           # สคริปต์ล็อตยาสำหรับทดสอบ FEFO
│   └── deploy.js                 # สคริปต์ Migration & Seed อัตโนมัติสำหรับ Production
├── src/
│   ├── app/                      # Next.js App Router (หน้าการทำงานแต่ละแผนก)
│   │   ├── api/queue/stream/     # SSE Real-time Queue Streaming Endpoint
│   │   ├── doctor/               # ห้องตรวจแพทย์ และ SOAP Notes
│   │   ├── pharmacy/             # ห้องยาและจ่ายยา (คิวยาวันนี้)
│   │   ├── queue/                # ศูนย์จัดการคิว
│   │   │   └── display/          # จอแสดงผลคิวสำหรับ Smart TV
│   │   ├── registration/         # จุดลงทะเบียนผู้ป่วย
│   │   ├── triage/               # จุดคัดกรองและวัดสัญญาณชีพ
│   │   ├── settings/
│   │   │   ├── schedules/        # ผังจัดการตารางเวรปฏิบัติหน้าที่
│   │   │   └── stations/         # จัดการห้องตรวจและช่องบริการ
│   │   └── users/                # จัดการผู้ใช้งานและสิทธิ์
│   ├── components/               # React Components แยกตามหมวดหมู่
│   ├── lib/
│   │   ├── audio/                # ระบบเสียงเรียกคิวภาษาไทย (TTS & Chime Engine)
│   │   └── auth.ts               # ระบบยืนยันตัวตนและการตรวจสอบสิทธิ์
│   └── server/
│       ├── actions/              # Next.js Server Actions (Business Logic)
│       └── events/               # Event Emitter สำหรับ Real-time Stream
└── package.json
```

---

## 🚀 การติดตั้งและรันในเครื่อง (Local Development)

### 1. ความต้องการของระบบ (Prerequisites)
* Node.js เวอร์ชัน **18.17.0 ขึ้นไป** (แนะนำ Node.js 20 หรือ 22 LTS)
* ฐานข้อมูล **PostgreSQL** (เปิดเครื่องหรือใช้งานผ่าน Supabase / Neon / Docker)

### 2. โคลนโปรเจกต์และติดตั้ง Dependencies
```bash
git clone https://github.com/Phongphat-ohm/chumjai.git
cd chumjai
npm install
```

### 3. ตั้งค่า Environment Variables (`.env`)
คัดลอกไฟล์ `.env.example` เป็น `.env` และกำหนดค่าการเชื่อมต่อ:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/chumjai?schema=public"
AUTH_SECRET="your-super-secret-jwt-key-change-in-production"
NODE_ENV="development"
```

### 4. สร้างโครงสร้างฐานข้อมูลและลงข้อมูลเริ่มต้น (Migrate & Seed)
```bash
# รัน Migration สร้างตารางใน PostgreSQL
npx prisma migrate deploy

# สร้าง Prisma Client
npx prisma generate

# ลงข้อมูลสิทธิ์และบัญชีผู้ดูแลระบบ (Admin)
npm run db:seed

# (ตัวเลือกเสริม) ลงข้อมูลคลังยาและล็อตยาตัวอย่าง
npm run db:seed:drugs
npm run db:seed:batches
```

### 5. รันโปรเจกต์ในโหมด Development
```bash
npm run dev
```
เปิดเบราว์เซอร์ไปที่: `http://localhost:3000`

---

## 🌐 การนำขึ้น Production (Deployment Guide)

### การ Deploy บน Coolify / Docker / Railway / Render

กำหนดคำสั่งในหน้าการตั้งค่า Build & Deployment:

* **Install Command:**
  ```bash
  npm install
  ```
* **Build Command:**
  ```bash
  npm run db:deploy && npm run build
  ```
  *(คำสั่ง `npm run db:deploy` จะทำการตรวจสอบ Rollback สถานะที่ค้าง และสั่ง Migrate ตารางใน Database ให้อัตโนมัติ โดยไม่ทำการ Seed ทับข้อมูลเดิม)*
* **Start Command:**
  ```bash
  npm run start
  ```

### Environment Variables ที่ต้องระบุบนเซิร์ฟเวอร์:
* `DATABASE_URL` = `postgresql://<user>:<password>@<host>:<port>/<dbname>?schema=public`
* `AUTH_SECRET` = `<รหัสผ่านลับความยาวอย่างน้อย 32-64 ตัวอักษร>`
* `NODE_ENV` = `production`

---

## 👤 บัญชีผู้ใช้งานเริ่มต้น (Default Credentials)

หลังจากรันคำสั่ง Seed ระบบจะมีบัญชี **ผู้ดูแลระบบ (Master Admin)** เริ่มต้น:

| บทบาท | Username | Email | รหัสผ่านเริ่มต้น |
| :--- | :--- | :--- | :--- |
| 👑 **ผู้ดูแลระบบ (Admin)** | `admin` | `admin@chumjai.com` | `Password123!` |

> ⚠️ **ข้อแนะนำด้านความปลอดภัย:** เมื่อเข้าสู่ระบบครั้งแรกในสภาพแวดล้อมจริง กรุณาเปลี่ยนรหัสผ่านและสร้างบัญชีเจ้าหน้าที่รายบุคคลทันทีที่เมนู **จัดการผู้ใช้งาน (`/users`)**

---

## 📄 ใบอนุญาต (License)

พัฒนาขึ้นสำหรับระบบบริการสุขภาพชุมชนและคลินิกปฐมภูมิ (Open for community clinic management).
