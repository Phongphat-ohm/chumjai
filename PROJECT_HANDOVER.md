# 🏥 คู่มือส่งมอบระบบ ชุมใจ (Chunjai — Community Clinic & Smart Health Tracking System)

ยินดีต้อนรับสู่เอกสารสรุปส่งมอบโปรเจกต์ **ชุมใจ (Chunjai)** ระบบบริหารจัดการคลินิกชุมชนและติดตามสุขภาพอัจฉริยะแบบครบวงจร (Full-Stack Smart Clinic Management Platform) พัฒนาขึ้นตามข้อกำหนดใน **Chunjai Blueprint (PROMPT.md)** สมบูรณ์ 100% ทั้ง 24 ขั้นตอน และได้รับการขยายระบบบริหารจัดการผู้ใช้งานและข้อมูลคลินิกเพิ่มเติม

---

## 🛠️ 1. เทคโนโลยีที่ใช้ในระบบ (Technology Stack)

| ส่วนประกอบ | เทคโนโลยีที่เลือกใช้ | รายละเอียดการใช้งาน |
|---|---|---|
| **Frontend & Framework** | **Next.js 14 (App Router)** | React 18, Server Components & Client Components |
| **Language** | **TypeScript** | Strict Type Safety ทั้งใน Schema, Actions, Component Props |
| **Database & ORM** | **PostgreSQL + Prisma ORM** | Relational Database มี Indexing และ Prepared Statements 100% |
| **Styling & Design** | **Tailwind CSS + Vanilla CSS** | Design Tokens โทน White + Blue, Glassmorphism, Responsive |
| **Icons & UI Utilities** | **Lucide Icons + shadcn/ui** | UI Component primitives ที่ผ่านการขัดเกลา |
| **Validation** | **Zod Schema** | Type-safe runtime validation สำหรับ Server Actions และฟอร์ม |
| **Security & Auth** | **JWT Cookie + RBAC Guard** | ควบคุมสิทธิ์ Least Privilege (`ADMIN`, `DOCTOR`, `NURSE`, `PHARMACIST`, `RECEPTIONIST`) |

---

## 🗺️ 2. แผนผังเส้นทางบริการในระบบ (System Routes Matrix - 25 Routes)

| Route Path | ชื่อหน้าจอภาษาไทย | สิทธิ์การเข้าถึง (RBAC) |
|---|---|---|
| `/` | แดชบอร์ดภาพรวมระบบ | ทุกผู้ใช้งานที่ล็อกอิน |
| `/login` | เข้าสู่ระบบ | สาธารณะ |
| `/profile` | **ตั้งค่าข้อมูลส่วนตัว & เปลี่ยนรหัสผ่าน** | **ทุกผู้ใช้งานที่ล็อกอิน** |
| `/users` | **จัดการข้อมูลผู้ใช้งาน & บุคลากร** | **ADMIN Only** |
| `/registration` | ลงทะเบียนผู้ป่วย & เปิด Visit | RECEPTIONIST, NURSE, ADMIN |
| `/queue` | ศูนย์บริการคิว | ทุกบทบาท |
| `/queue/display` | จอมอนิเตอร์แสดงคิวสาธารณะ | สาธารณะ (สำหรับ TV Display) |
| `/triage` | จุดคัดกรองสัญญาณชีพ | NURSE, DOCTOR, ADMIN |
| `/doctor` | ห้องตรวจรักษาแพทย์ | DOCTOR, ADMIN |
| `/pharmacy` | ห้องจ่ายยา & พิมพ์ฉลากยา | PHARMACIST, ADMIN |
| `/inventory` | คลังยา & สต็อก FEFO | PHARMACIST, ADMIN |
| `/appointment` | นัดหมาย & พิมพ์ใบนัด | ทุกบทบาท |
| `/patient` | ดรรชนีรายชื่อผู้ป่วย | ทุกบทบาท |
| `/patient/[id]` | ประวัติผู้ป่วยรวมศูนย์ & NCD Profile | ทุกบทบาท |
| `/health` | ติดตามสถิติ NCD ระยะยาว | DOCTOR, NURSE, ADMIN |
| `/vaccination` | งานวัคซีน & พิมพ์การ์ดวัคซีน | NURSE, DOCTOR, ADMIN |
| `/lab` | งานชันสูตร & พิมพ์ผลแล็บ | DOCTOR, NURSE, ADMIN |
| `/referral` | ส่งต่อผู้ป่วย & พิมพ์หนังสือส่งตัว | DOCTOR, ADMIN |
| `/notifications` | ศูนย์การแจ้งเตือนระบบ | ทุกบทบาท |
| `/reports` | รายงาน & วิเคราะห์สถิติคลินิก | ทุกบทบาท |
| `/security` | ศูนย์ความปลอดภัยระบบ | **ADMIN Only** |
| `/settings` | **ตั้งค่าโปรไฟล์คลินิก (ชื่อ, ที่อยู่, อีเมล, ใบอนุญาต, ผู้อำนวยการ)** | **ADMIN Only** |
| `/audit-log` | บันทึกประวัติการใช้งาน (Audit Logs) | **ADMIN Only** |

---

## 🔒 3. นโยบายความปลอดภัยและการคุ้มครองข้อมูล (Security & PDPA Governance)

1. **Least Privilege & Role-Based Access Control (RBAC)**: ทุก Server Action ถูกคุ้มครองด้วย `requireAuth()`, `requireRole()`, หรือ `requirePermission()`
2. **PDPA Data Masking**: เซ็นเซอร์เลขบัตรประชาชน 13 หลัก (เช่น `1-1004-XXXXX-12-3`) และเบอร์โทรศัพท์ในหน้าบันทึกประวัติ Audit Logs
3. **SQL Injection Protection**: ใช้ Prisma ORM Parameterized Prepared Statements 100%
4. **Rate Limiting**: จำกัดการล็อกอินผิดพลาดไม่เกิน 5 ครั้ง ต่อ 15 นาที
5. **Audit Trail**: บันทึกกิจกรรมสำคัญ (`CREATE`, `UPDATE`, `DELETE`, `DISPENSE`, `SECURITY_AUDIT`, `USER_CREATED`, `USER_UPDATED`, `USER_PROFILE_UPDATED`, `USER_PASSWORD_CHANGED`) ถาวรในตาราง `AuditLog`

---

## 💻 4. คู่มือการรันและใช้งานโปรเจกต์ (Getting Started Instructions)

### การตั้งค่าไฟล์ `.env`
```env
DATABASE_URL="postgres://phongphat:Ohm%40331040@45.83.207.107:65432/chumjai-dev"
JWT_SECRET="chunjai-super-secret-jwt-key-2026"
NODE_ENV="production"
```

### คำสั่งรันโปรเจกต์ (Development & Production)
```bash
# 1. ติดตั้ง Dependencies
npm install

# 2. ตรวจสอบ Type Safety
npx tsc --noEmit

# 3. สร้าง Production Bundle
npm run build

# 4. รันระบบสำหรับ Production
npm run start
```

---
*จัดทำเอกสารและส่งมอบโครงการ ชุมใจ (Chunjai) สมบูรณ์เรียบร้อยแล้ว*
