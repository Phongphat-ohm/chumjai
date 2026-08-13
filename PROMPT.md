# 🏥 PROJECT: ชุมใจ (Chunjai)
## Community Clinic & Smart Health Tracking System

สร้าง Web Application สำหรับบริหารจัดการคลินิกชุมชนและติดตามสุขภาพผู้ป่วย
โดยใช้ชื่อโปรแกรมอย่างเป็นทางการว่า

ชุมใจ (Chunjai)

ชื่อเต็ม:
ชุมใจ — ระบบจัดการคลินิกชุมชนและติดตามสุขภาพอัจฉริยะ

English:
Chunjai — Community Clinic & Smart Health Tracking System

---

# 1. PROJECT CONCEPT

"ชุมใจ (Chunjai)" เป็นระบบบริหารจัดการคลินิกขนาดเล็ก
สถานบริการสุขภาพชุมชน หรือศูนย์สุขภาพชุมชน

ระบบต้องครอบคลุม Workflow ตั้งแต่

ผู้ป่วย
→ ลงทะเบียน
→ คัดกรอง
→ เข้าคิว
→ พบแพทย์
→ บันทึกการรักษา
→ สั่งยา
→ ห้องยา
→ จ่ายยา
→ นัดหมาย
→ ติดตามสุขภาพ

เป้าหมายของระบบ:

- ใช้งานง่าย
- รวดเร็ว
- ทันสมัย
- เหมาะกับชุมชน
- รองรับเจ้าหน้าที่ที่ไม่เชี่ยวชาญด้าน IT
- มีระบบ Security สูง
- ปกป้องข้อมูลส่วนบุคคล
- ปกป้องข้อมูลสุขภาพ
- ตรวจสอบการเข้าถึงข้อมูลย้อนหลังได้
- สามารถขยายระบบในอนาคตได้

---

# 2. IMPORTANT ARCHITECTURE

ระบบต้องเป็น

NEXT.JS FULL STACK APPLICATION

เพียงโปรเจกต์เดียว

ห้ามสร้าง Backend Server แยก

ห้ามใช้:

- Express
- Fastify
- NestJS
- Backend Project แยก
- Frontend Project แยก
- Firebase
- Firestore

ให้ Next.js ทำหน้าที่ทั้ง Frontend และ Backend

Architecture:

Browser
   ↓
Next.js
   ↓
Server Components
Server Actions
Route Handlers
   ↓
Authentication
   ↓
Authorization
   ↓
Validation
   ↓
Business Logic
   ↓
Prisma
   ↓
PostgreSQL

---

# 3. TECHNOLOGY STACK

ใช้:

## Frontend

- Next.js
- App Router
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Lucide React

## Backend

- Next.js Server Components
- Server Actions
- Route Handlers
- Server-side Business Logic

## Database

- PostgreSQL
- Prisma ORM

## Validation

- Zod
- React Hook Form

## Charts

- Recharts

## Other

- QR Code
- PDF Generator
- Date utilities

Authentication สามารถใช้ Auth.js
หรือ Authentication Solution ที่เหมาะสมกับ
Next.js + Prisma + PostgreSQL

---

# 4. DATABASE

ใช้ PostgreSQL เป็น Database หลัก

ใช้ Prisma ORM

ห้ามให้ Browser ติดต่อ PostgreSQL โดยตรง

ห้ามใช้ Prisma ใน Client Component

Prisma ต้องทำงานเฉพาะ Server-side

สร้าง Prisma Singleton เช่น:

src/lib/prisma.ts

---

# 5. ENVIRONMENT

ใช้ Environment Variables

ตัวอย่าง:

DATABASE_URL="postgresql://user:password@localhost:5432/chunjai"
AUTH_SECRET="change-me"

สร้าง:

.env.example

ห้าม Hard-code:

- Password
- Database URL
- Secret
- Token
- API Key

---

# 6. BRANDING

ชื่อโปรแกรม:

ชุมใจ

English:

Chunjai

ทุกหน้าหลักของระบบควรแสดงชื่อ:

ชุมใจ

และสามารถแสดง Subtitle:

Community Clinic & Smart Health Tracking

Browser Title เช่น:

ชุมใจ | ระบบจัดการคลินิกชุมชน

---

# 7. DESIGN SYSTEM

ใช้ shadcn/ui เป็น UI Component หลัก

ใช้:

- Button
- Input
- Textarea
- Select
- Combobox
- Command
- Dialog
- Sheet
- Drawer
- Card
- Table
- Tabs
- Badge
- Alert
- Toast
- Calendar
- Popover
- Dropdown Menu
- Breadcrumb
- Form
- Skeleton
- Tooltip
- Pagination

ใช้ Lucide Icons

ไม่สร้าง Component ที่ซ้ำกับ shadcn/ui โดยไม่จำเป็น

---

# 8. VISUAL DESIGN

Theme หลัก:

WHITE + BLUE

โทนสี:

- White
- Soft Blue
- Light Blue
- Blue
- Dark Blue สำหรับข้อความสำคัญ

ให้ความรู้สึก:

- สะอาด
- ปลอดภัย
- เป็นมิตร
- ทันสมัย
- น่าเชื่อถือ
- Professional

หลีกเลี่ยง:

- Gradient มากเกินไป
- สีจัด
- Animation เยอะ
- UI ซับซ้อน
- Card ซ้อนกันมากเกินไป

หลัก:

Simple > Fancy
Usability > Decoration
Consistency > Creativity

---

# 9. COMMUNITY UX

ระบบถูกออกแบบสำหรับชุมชน

ดังนั้น UX ต้องง่ายมาก

ใช้ภาษาไทยเป็นหลัก

ปุ่มต้องมีข้อความที่เข้าใจง่าย

หลีกเลี่ยง Icon-only Button
เว้นแต่เป็น Action ที่ผู้ใช้เข้าใจได้ชัดเจน

ทุก Form ต้อง:

- อ่านง่าย
- Label ชัด
- Validation ชัด
- Error ชัด
- มี Loading
- มี Success Feedback
- มี Empty State
- มี Confirmation สำหรับ Action สำคัญ

---

# 10. RESPONSIVE

รองรับ:

- Desktop
- Tablet
- Mobile

เจ้าหน้าที่เน้น Desktop / Tablet

Patient Portal ต้องรองรับ Mobile เป็นอย่างดี

Mobile Sidebar ใช้ shadcn Sheet หรือ Drawer

---

# 11. LANGUAGE

UI:

ภาษาไทย

Code:

ภาษาอังกฤษ

Database:

ภาษาอังกฤษ

ตัวอย่าง Menu:

- แดชบอร์ด
- ผู้ป่วย
- ลงทะเบียน
- คิว
- คัดกรอง
- ห้องตรวจ
- ห้องยา
- คลังยา
- นัดหมาย
- สุขภาพ
- รายงาน
- ตั้งค่า

---

# 12. USER ROLES

ระบบต้องรองรับ:

ADMIN
RECEPTIONIST
NURSE
DOCTOR
PHARMACIST
PATIENT

ออกแบบให้เพิ่ม Role ในอนาคตได้

---

# 13. PERMISSION SYSTEM

อย่าใช้ Role เพียงอย่างเดียว

สร้าง Permission System

ตัวอย่าง:

PATIENT_VIEW
PATIENT_CREATE
PATIENT_UPDATE

PATIENT_HEALTH_VIEW
PATIENT_HEALTH_UPDATE

VISIT_VIEW
VISIT_CREATE
VISIT_UPDATE

TRIAGE_VIEW
TRIAGE_CREATE
TRIAGE_UPDATE

CONSULTATION_VIEW
CONSULTATION_CREATE
CONSULTATION_UPDATE

SOAP_VIEW
SOAP_CREATE
SOAP_UPDATE

DIAGNOSIS_VIEW
DIAGNOSIS_CREATE

PRESCRIPTION_VIEW
PRESCRIPTION_CREATE
PRESCRIPTION_UPDATE

DRUG_VIEW
DRUG_CREATE
DRUG_UPDATE

INVENTORY_VIEW
INVENTORY_UPDATE

DISPENSE_MEDICATION

APPOINTMENT_VIEW
APPOINTMENT_CREATE
APPOINTMENT_UPDATE

REPORT_VIEW

AUDIT_LOG_VIEW

---

# 14. SECURITY

Security ต้องเป็น Core Architecture

ไม่ใช่ Feature ที่ทำทีหลัง

ใช้หลัก:

Privacy by Design
Security by Design
Least Privilege
Defense in Depth
Zero Trust
Auditability

---

# 15. DATA CLASSIFICATION

Public:

- ชื่อคลินิก
- เวลาเปิดทำการ
- บริการ

Internal:

- Settings
- Internal Reports

Confidential:

- ชื่อ
- วันเกิด
- ที่อยู่
- เบอร์โทร
- เลขบัตรประชาชน

Highly Confidential:

- Medical Record
- SOAP
- Diagnosis
- Allergy
- Prescription
- Lab
- Vital Signs
- Vaccination
- Referral

ข้อมูล Highly Confidential ต้องมี Access Control อย่างเข้มงวด

---

# 16. AUTHENTICATION

ต้องมี:

- Login
- Logout
- Session
- Password Hashing
- Password Reset
- Session Expiration
- Session Revocation
- Rate Limiting
- Optional MFA ในอนาคต

ห้ามเก็บ Password แบบ Plain Text

ใช้ Argon2id หรือ bcrypt ตาม Authentication Library ที่เลือก

---

# 17. SESSION SECURITY

Session ต้อง:

- Secure
- HttpOnly
- SameSite
- มี Expiration
- Logout แล้ว Session ใช้งานไม่ได้
- รองรับ Session Revocation

หลีกเลี่ยงการเก็บ Authentication Token สำคัญใน LocalStorage

---

# 18. SERVER-SIDE AUTHORIZATION

ห้ามเชื่อ Role หรือ Permission จาก Client

ทุก Server Action และ Route Handler ต้องตรวจ:

Request
↓
Session
↓
User
↓
Role
↓
Permission
↓
Resource Ownership
↓
Business Rules
↓
Database

---

# 19. LEAST PRIVILEGE

RECEPTIONIST:

เข้าถึงข้อมูลที่จำเป็นสำหรับลงทะเบียนและจัดการคิว

NURSE:

เข้าถึงข้อมูลที่จำเป็นสำหรับ Triage

DOCTOR:

เข้าถึงข้อมูลทางการแพทย์ที่จำเป็น

PHARMACIST:

เข้าถึงข้อมูลที่จำเป็นต่อการจ่ายยา เช่น Allergy และ Prescription

PATIENT:

เข้าถึงเฉพาะข้อมูลของตัวเอง

ADMIN:

จัดการระบบตาม Permission ที่ได้รับ

---

# 20. RESOURCE AUTHORIZATION

ต้องตรวจ Ownership ทุกครั้ง

ตัวอย่าง:

Patient A
→ ห้ามเข้าถึง Patient B

แม้จะ Login แล้วก็ตาม

---

# 21. INPUT VALIDATION

ใช้ Zod

Validate ทุก Mutation

เช่น:

- Patient
- Visit
- Triage
- Prescription
- Appointment
- Inventory
- User
- Settings

ตรวจ:

- Type
- Required
- Length
- Format
- Range
- Enum
- Business Rules

---

# 22. XSS / SQL INJECTION

ป้องกัน XSS

ห้าม Render User Input เป็น HTML โดยตรง

ระวัง:

- SOAP
- Notes
- Comments

ใช้ Prisma Query

หลีกเลี่ยง Raw SQL

หากจำเป็นต้องใช้ Raw SQL
ต้องใช้ Parameterized Query

---

# 23. CSRF

Mutation สำคัญต้องมี CSRF Protection
ตามแนวทางของ Next.js และ Authentication Library

---

# 24. RATE LIMITING

Rate Limit:

- Login
- Password Reset
- QR Verification
- Public Endpoint
- Queue Display
- Sensitive Endpoint

---

# 25. PERSONAL DATA MASKING

ไม่แสดงข้อมูลสำคัญเต็มรูปแบบโดยไม่จำเป็น

ตัวอย่าง:

เลขบัตรประชาชน:

1-2345-*****-**-3

เบอร์โทร:

08X-XXX-1234

---

# 26. LOGGING

ห้าม Log:

- Password
- Token
- Session
- เลขบัตรประชาชนเต็ม
- SOAP
- Diagnosis
- Medical Record
- Prescription Details

---

# 27. AUDIT LOG

ต้องมี Audit Log

รองรับ:

LOGIN
LOGOUT

PATIENT_CREATED
PATIENT_UPDATED
PATIENT_VIEWED

MEDICAL_RECORD_VIEWED
MEDICAL_RECORD_UPDATED

SOAP_CREATED
SOAP_UPDATED

PRESCRIPTION_CREATED
PRESCRIPTION_UPDATED

MEDICATION_DISPENSED

INVENTORY_UPDATED

APPOINTMENT_CREATED
APPOINTMENT_CANCELLED

เก็บ:

userId
action
resourceType
resourceId
timestamp
ipAddress
userAgent
success

ไม่เก็บ Medical Data ลง Audit Log โดยไม่จำเป็น

---

# 28. MEDICAL DATA ACCESS AUDIT

ต้องตรวจสอบได้ว่า:

ใคร
เข้าถึงข้อมูลผู้ป่วยคนไหน
เมื่อไหร่
ทำอะไร

---

# 29. DATABASE SECURITY

PostgreSQL Production:

- ไม่เปิด Port สู่ Public โดยไม่จำเป็น
- ใช้ Password แข็งแรง
- จำกัด Network
- ใช้ Application Database User
- ไม่ใช้ PostgreSQL Superuser
- Backup
- Restore Test

---

# 30. BACKUP

ต้องมี:

Daily Backup
Weekly Backup
Monthly Backup

พร้อม:

- Encryption
- Off-site Backup
- Retention
- Restore Test

---

# 31. FILE SECURITY

หากมี Upload:

- Medical PDF
- Lab Result
- Referral
- Certificate
- Patient Documents

ต้อง:

- Validate File Type
- Validate MIME
- จำกัด File Size
- Rename File
- ใช้ Private Storage
- ตรวจ Permission ก่อน Download
- ไม่ใช้ Public URL สำหรับ Sensitive Document

---

# 32. QR SECURITY

QR Code ห้ามใส่ข้อมูลสุขภาพโดยตรง

ใช้ Secure Token

QR
↓
Secure Token
↓
Next.js Server
↓
Validate
↓
Authorization
↓
Data

---

# 33. ERROR HANDLING

Production ห้ามแสดง:

- Stack Trace
- Prisma Error
- SQL Query
- Database URL
- Internal File Path

ให้แสดง:

เกิดข้อผิดพลาด
กรุณาลองใหม่อีกครั้ง

---

# 34. SECURITY HEADERS

พิจารณา:

Content-Security-Policy
X-Content-Type-Options
Referrer-Policy
Permissions-Policy
Strict-Transport-Security

---

# 35. DATABASE MODELS

สร้าง Prisma Models อย่างน้อย:

User
Role
Permission
RolePermission

Patient
PatientAllergy
PatientCondition
PatientMedication

Visit
VitalSign
TriageRecord

Queue
QueueType

Consultation
SoapNote
Diagnosis

Drug
DrugBatch
InventoryTransaction

Prescription
PrescriptionItem
Dispensation

Appointment

Vaccine
Vaccination

LabOrder
LabResult

Referral

Notification

AuditLog

ClinicSetting
SystemSetting

ใช้:

- UUID
- Foreign Keys
- Unique
- Index
- Enum
- CreatedAt
- UpdatedAt
- Soft Delete เมื่อเหมาะสม

---

# 36. PATIENT MANAGEMENT

รองรับ:

- Patient List
- Search
- Filter
- Create
- Edit
- Profile
- Medical History

ข้อมูล:

- HN
- เลขบัตรประชาชน
- ชื่อ
- นามสกุล
- วันเกิด
- เพศ
- เบอร์โทร
- ที่อยู่
- สิทธิการรักษา
- ผู้ติดต่อฉุกเฉิน

---

# 37. MEDICAL HISTORY

รองรับ:

- Allergy
- Chronic Disease
- Medication
- Surgery
- Medical History
- Family History
- Vaccination

---

# 38. REGISTRATION

รองรับ:

- ผู้ป่วยใหม่
- ผู้ป่วยเก่า
- ค้นหา HN
- ค้นหาชื่อ
- ค้นหาเบอร์
- QR

สร้าง Visit

---

# 39. VISIT

Patient 1 คนมีหลาย Visit

Status:

REGISTERED
WAITING_TRIAGE
TRIAGED
WAITING_DOCTOR
IN_CONSULTATION
WAITING_PHARMACY
DISPENSED
COMPLETED
CANCELLED

---

# 40. TRIAGE

ข้อมูล:

- Weight
- Height
- BMI
- Temperature
- Blood Pressure
- Pulse
- SpO2
- Respiratory Rate
- Blood Glucose
- Pain Score
- Chief Complaint
- Urgency

BMI ต้องคำนวณฝั่ง Server

---

# 41. QUEUE MANAGEMENT

รองรับ:

- Registration Queue
- Triage Queue
- Doctor Queue
- Pharmacy Queue
- Vaccine Queue

Status:

WAITING
CALLED
SERVING
COMPLETED
SKIPPED
CANCELLED

ต้องป้องกัน Queue Number ซ้ำ

รองรับ Real-time Queue Display

---

# 42. DOCTOR

Doctor Dashboard:

- ผู้ป่วยรอตรวจ
- คิวปัจจุบัน
- นัดหมาย
- ประวัติผู้ป่วย

Patient Chart:

- Profile
- Allergy
- Chronic Disease
- Medication
- Visit History
- Vital Signs
- Lab Result

---

# 43. SOAP

Subjective:

- Chief Complaint
- Present Illness
- Symptoms

Objective:

- Vital Signs
- Physical Examination
- Lab

Assessment:

- Diagnosis
- ICD-10

Plan:

- Treatment
- Medication
- Follow-up
- Advice
- Referral

---

# 44. DIAGNOSIS

รองรับ:

- ICD-10
- Diagnosis Name
- Primary
- Secondary

---

# 45. PRESCRIPTION

Doctor สามารถเลือกยาจากคลัง

ข้อมูล:

- Drug
- Strength
- Dose
- Route
- Frequency
- Duration
- Quantity
- Instruction
- Note

สร้าง Pharmacy Queue เมื่อ Prescription สำเร็จ

---

# 46. PHARMACY

เภสัชกร:

- ดู Queue
- เปิด Prescription
- ตรวจ Allergy
- ตรวจ Stock
- จ่ายยา

Dispensing ต้องใช้ Prisma Transaction

Workflow:

ตรวจ Prescription
↓
ตรวจ Allergy
↓
ตรวจ Stock
↓
ลด Stock
↓
Inventory Transaction
↓
Dispensation
↓
Complete

---

# 47. INVENTORY

รองรับ:

- Drug
- Batch
- Lot
- Expiry
- Stock
- Minimum Stock
- Stock In
- Stock Out
- Adjustment

แจ้งเตือน:

- ยาใกล้หมด
- ยาหมด
- ยาใกล้หมดอายุ
- ยาหมดอายุ

---

# 48. APPOINTMENT

รองรับ:

- Create
- Edit
- Cancel
- Confirm
- Arrive
- Complete
- No Show

ป้องกัน Double Booking

---

# 49. PATIENT PORTAL

ผู้ป่วยสามารถดู:

- Dashboard
- Medical History
- Medication
- Appointment
- Vital Signs
- Health Trends
- Vaccination
- Documents

ต้องเข้าถึงเฉพาะข้อมูลของตัวเอง

---

# 50. HEALTH TRACKING

ใช้ Recharts

แสดงกราฟ:

- Weight
- BMI
- Blood Pressure
- Blood Glucose
- Temperature

ช่วงเวลา:

- 7 วัน
- 30 วัน
- 3 เดือน
- 6 เดือน
- 1 ปี

---

# 51. VACCINATION

รองรับ:

- Vaccine
- Manufacturer
- Lot
- Expiry
- Dose
- Date
- Injection Site
- Vaccinator

---

# 52. LABORATORY

Workflow:

Doctor
↓
Lab Order
↓
Lab Queue
↓
Lab Result
↓
Doctor Review

---

# 53. REFERRAL

รองรับ:

- Referral
- Hospital
- Reason
- Documents
- Status

Status:

PENDING
SENT
ACCEPTED
COMPLETED

---

# 54. NOTIFICATION

รองรับ:

- In-App Notification
- Appointment Reminder
- Queue Notification
- Stock Alert

ออกแบบให้สามารถเพิ่ม LINE / Email / Push Notification ในอนาคต

---

# 55. REPORT

สร้าง:

- Patient Report
- Visit Report
- Diagnosis Report
- Drug Report
- Inventory Report
- Appointment Report

---

# 56. PDF

รองรับ:

- Prescription
- Medical Summary
- Appointment
- Referral
- Medical Documents

---

# 57. ADMIN DASHBOARD

แสดง:

- ผู้ป่วยวันนี้
- ผู้ป่วยใหม่
- Visit วันนี้
- รอตรวจ
- รอรับยา
- ยาใกล้หมด
- ยาใกล้หมดอายุ

---

# 58. TRANSACTION

Critical Operation ต้องใช้ Database Transaction

ตัวอย่าง:

Prescription
→ Create Prescription
→ Create Items

Dispensing
→ Check Stock
→ Update Stock
→ Create Inventory Transaction
→ Create Dispensation
→ Update Prescription

---

# 59. CONCURRENCY

ป้องกัน:

- Queue Number ซ้ำ
- Stock ติดลบ
- Double Booking
- Concurrent Update

ใช้ PostgreSQL Constraint / Transaction / Lock ตามความเหมาะสม

---

# 60. FOLDER STRUCTURE

ใช้โครงสร้างประมาณ:

src/
├── app/
│   ├── (auth)/
│   ├── (dashboard)/
│   ├── patient/
│   ├── doctor/
│   ├── pharmacy/
│   ├── admin/
│   └── api/
│
├── components/
│   ├── ui/
│   ├── layout/
│   └── shared/
│
├── features/
│   ├── patients/
│   ├── visits/
│   ├── triage/
│   ├── queue/
│   ├── doctor/
│   ├── pharmacy/
│   ├── inventory/
│   ├── appointments/
│   └── health/
│
├── lib/
│   ├── prisma.ts
│   ├── auth.ts
│   └── utils.ts
│
├── server/
│   ├── actions/
│   ├── services/
│   └── permissions/
│
├── schemas/
├── types/
└── config/

สามารถปรับโครงสร้างได้หากมีเหตุผลทาง Architecture
แต่ต้องรักษา Separation of Concerns

---

# 61. DEVELOPMENT METHOD

สำคัญมาก:

ห้ามสร้างระบบทั้งหมดในครั้งเดียว

ต้องทำงานแบบ STEP-BY-STEP

ทุก Step ต้องทำตาม:

STEP 1 — INSPECT

ตรวจ Project ปัจจุบันก่อน

อ่าน:

- package.json
- Prisma
- Existing Components
- Routes
- Config
- Environment

ห้ามสร้างของซ้ำ

---

STEP 2 — ANALYZE

อธิบาย:

- สิ่งที่ต้องทำ
- เหตุผล
- Dependencies
- ผลกระทบ

---

STEP 3 — PLAN

ระบุ:

- Files ที่สร้าง
- Files ที่แก้
- Database Changes
- Components
- Server Actions
- Business Logic
- Security

---

STEP 4 — IMPLEMENT

เขียน Code จริง

---

STEP 5 — VALIDATE

ตรวจ:

- TypeScript
- ESLint
- Prisma
- Migration
- Database
- Build
- Runtime

---

STEP 6 — SECURITY REVIEW

ตรวจ:

- Authentication
- Authorization
- Permission
- Input Validation
- Resource Access
- Audit Log

---

STEP 7 — UI REVIEW

ตรวจ:

- Responsive
- Accessibility
- Loading
- Empty State
- Error State
- Mobile

---

STEP 8 — STOP

เมื่อ Step เสร็จแล้ว:

หยุดทันที

ห้ามเริ่ม Step ถัดไป

ต้องรอคำสั่งจากผู้ใช้

---

# 62. DEVELOPMENT STEPS

STEP 01
Project Foundation

STEP 02
Database Foundation

STEP 03
Authentication

STEP 04
Authorization

STEP 05
Patient Management

STEP 06
Registration & Visit

STEP 07
Queue Management

STEP 08
Triage

STEP 09
Doctor

STEP 10
Prescription

STEP 11
Pharmacy

STEP 12
Inventory

STEP 13
Appointment

STEP 14
Patient Portal

STEP 15
Health Tracking

STEP 16
Vaccination

STEP 17
Laboratory

STEP 18
Referral

STEP 19
Notification

STEP 20
Reports

STEP 21
Audit & Security

STEP 22
UI/UX Polish

STEP 23
Performance

STEP 24
Production

---

# 63. STEP 01 — PROJECT FOUNDATION

เริ่มต้นเฉพาะ STEP 01

ตรวจสอบ Project ปัจจุบันก่อน

จากนั้น:

1. ตรวจ package.json
2. ตรวจ Next.js
3. ตรวจ TypeScript
4. ตรวจ Tailwind
5. ตรวจ shadcn/ui
6. ตรวจ Prisma
7. ตรวจ PostgreSQL Configuration
8. ติดตั้งเฉพาะ Dependency ที่จำเป็น
9. สร้าง Prisma Configuration
10. สร้าง Prisma Singleton
11. สร้าง Folder Structure
12. สร้าง Global Theme
13. สร้าง Branding ของ "ชุมใจ (Chunjai)"
14. สร้าง Layout
15. สร้าง Sidebar
16. สร้าง Header
17. สร้าง Dashboard Placeholder
18. ใช้ White + Blue Theme
19. ใช้ shadcn/ui
20. ตรวจ TypeScript
21. ตรวจ ESLint
22. ตรวจ Production Build

---

# 64. STEP 01 ห้ามทำ

ใน STEP 01 ห้ามสร้าง:

- Patient Management
- Doctor
- Pharmacy
- Queue
- Triage
- Prescription
- Inventory
- Appointment
- Patient Portal
- Medical Record

ทำเฉพาะ Project Foundation

---

# 65. REPORT หลังจบแต่ละ STEP

เมื่อจบ Step ให้รายงาน:

## Completed

สิ่งที่ทำสำเร็จ

## Files Created

ไฟล์ที่สร้าง

## Files Modified

ไฟล์ที่แก้

## Dependencies

Dependency ที่เพิ่ม

## Database

Database / Migration ที่เปลี่ยน

## Security

Security ที่เพิ่ม

## Testing

ผลการตรวจ:

- TypeScript
- ESLint
- Build
- Runtime

## Issues

ปัญหาที่พบ

## Next Step

บอกเพียงว่า Step ถัดไปคืออะไร

จากนั้น:

# STOP

ห้ามทำ Step ถัดไปเอง

ต้องรอคำสั่งจากผู้ใช้

---

# 66. IMPORTANT RULES

1. อย่าสร้าง Backend Server แยก
2. ใช้ Next.js Full Stack
3. ใช้ Prisma
4. ใช้ PostgreSQL
5. ใช้ shadcn/ui
6. ใช้ Tailwind CSS
7. ใช้ TypeScript
8. ใช้ Server Component เป็น Default
9. ใช้ Client Component เมื่อจำเป็น
10. ใช้ Server Action สำหรับ Mutation ที่เหมาะสม
11. ตรวจ Authorization ฝั่ง Server เสมอ
12. Validate Input ทุก Mutation
13. ใช้ Transaction กับ Critical Operation
14. ไม่เก็บ Secret ใน Source Code
15. ไม่ Log Sensitive Data
16. ทุกข้อมูลสุขภาพต้องมี Access Control
17. ทุก Feature ต้องคำนึงถึง Security
18. อย่าสร้าง Feature ที่ไม่ได้อยู่ใน Current Step
19. อย่าทำ Step ถัดไปโดยไม่ได้รับคำสั่ง
20. หากไม่แน่ใจ ให้ตรวจ Existing Code ก่อนสร้างใหม่

---

# 🚀 START

เริ่มทำงานที่:

STEP 01 — PROJECT FOUNDATION

เท่านั้น

ก่อนแก้ไข Code ให้ตรวจสอบ Project ปัจจุบันก่อน

จากนั้น Implement STEP 01

เมื่อเสร็จแล้วให้รายงานผลตามรูปแบบที่กำหนด

และ STOP

รอคำสั่งจากผู้ใช้ก่อนเริ่ม STEP 02