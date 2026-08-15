import { PrismaClient, UserRole } from "../src/generated/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting Chunjai database seed...");

  // Generate bcrypt hash for default demo accounts password: "Password123!"
  const defaultPasswordHash = await bcrypt.hash("Password123!", 12);

  // 1. Seed Permissions (based on Section 13 of PROMPT.md)
  const permissionsData = [
    { code: "PATIENT_VIEW", name: "ดูข้อมูลผู้ป่วย", category: "PATIENT" },
    { code: "PATIENT_CREATE", name: "สร้างผู้ป่วยใหม่", category: "PATIENT" },
    { code: "PATIENT_UPDATE", name: "แก้ไขข้อมูลผู้ป่วย", category: "PATIENT" },
    { code: "PATIENT_HEALTH_VIEW", name: "ดูประวัติสุขภาพผู้ป่วย", category: "PATIENT" },
    { code: "PATIENT_HEALTH_UPDATE", name: "แก้ไขประวัติสุขภาพผู้ป่วย", category: "PATIENT" },
    { code: "VISIT_VIEW", name: "ดูข้อมูลการรับบริการ (Visit)", category: "VISIT" },
    { code: "VISIT_CREATE", name: "ลงทะเบียน Visit", category: "VISIT" },
    { code: "VISIT_UPDATE", name: "อัปเดต Visit", category: "VISIT" },
    { code: "TRIAGE_VIEW", name: "ดูข้อมูลคัดกรอง", category: "TRIAGE" },
    { code: "TRIAGE_CREATE", name: "บันทึกข้อมูลคัดกรอง", category: "TRIAGE" },
    { code: "TRIAGE_UPDATE", name: "แก้ไขข้อมูลคัดกรอง", category: "TRIAGE" },
    { code: "CONSULTATION_VIEW", name: "ดูข้อมูลการตรวจรักษา", category: "DOCTOR" },
    { code: "CONSULTATION_CREATE", name: "บันทึกการตรวจรักษา", category: "DOCTOR" },
    { code: "CONSULTATION_UPDATE", name: "แก้ไขข้อมูลการตรวจรักษา", category: "DOCTOR" },
    { code: "SOAP_VIEW", name: "ดู SOAP Note", category: "DOCTOR" },
    { code: "SOAP_CREATE", name: "บันทึก SOAP Note", category: "DOCTOR" },
    { code: "SOAP_UPDATE", name: "แก้ไข SOAP Note", category: "DOCTOR" },
    { code: "DIAGNOSIS_VIEW", name: "ดูผลการวินิจฉัย (ICD-10)", category: "DOCTOR" },
    { code: "DIAGNOSIS_CREATE", name: "บันทึกผลการวินิจฉัย", category: "DOCTOR" },
    { code: "PRESCRIPTION_VIEW", name: "ดูใบสั่งยา", category: "PHARMACY" },
    { code: "PRESCRIPTION_CREATE", name: "สร้างใบสั่งยา", category: "PHARMACY" },
    { code: "PRESCRIPTION_UPDATE", name: "แก้ไขใบสั่งยา", category: "PHARMACY" },
    { code: "DRUG_VIEW", name: "ดูรายการคลังยา", category: "INVENTORY" },
    { code: "DRUG_CREATE", name: "เพิ่มรายการยาใหม่", category: "INVENTORY" },
    { code: "DRUG_UPDATE", name: "แก้ไขรายการยา", category: "INVENTORY" },
    { code: "INVENTORY_VIEW", name: "ดูคลังยาและ Batch", category: "INVENTORY" },
    { code: "INVENTORY_UPDATE", name: "ปรับปรุงสต็อกยา", category: "INVENTORY" },
    { code: "DISPENSE_MEDICATION", name: "จ่ายยาให้ผู้ป่วย", category: "PHARMACY" },
    { code: "APPOINTMENT_VIEW", name: "ดูรายการนัดหมาย", category: "APPOINTMENT" },
    { code: "APPOINTMENT_CREATE", name: "สร้างนัดหมาย", category: "APPOINTMENT" },
    { code: "APPOINTMENT_UPDATE", name: "แก้ไขนัดหมาย", category: "APPOINTMENT" },
    { code: "REPORT_VIEW", name: "เข้าถึงรายงานและสถิติ", category: "REPORT" },
    { code: "AUDIT_LOG_VIEW", name: "ดู Audit Log ระบบ", category: "ADMIN" },
  ];

  console.log("🔑 Seeding permissions...");
  for (const p of permissionsData) {
    await prisma.permission.upsert({
      where: { code: p.code },
      update: { name: p.name, category: p.category },
      create: p,
    });
  }

  // 2. Seed Queue Types
  const queueTypesData = [
    { code: "REG", name: "คิวจุดลงทะเบียน", prefix: "R" },
    { code: "TRIAGE", name: "คิวคัดกรองและวัดสัญญาณชีพ", prefix: "T" },
    { code: "DOC", name: "คิวตรวจรักษาแพทย์", prefix: "A" },
    { code: "PHARM", name: "คิวห้องยา", prefix: "P" },
    { code: "VAC", name: "คิวฉีดวัคซีน", prefix: "V" },
  ];

  console.log("📋 Seeding queue types...");
  for (const q of queueTypesData) {
    await prisma.queueType.upsert({
      where: { code: q.code },
      update: { name: q.name, prefix: q.prefix },
      create: q,
    });
  }

  // 3. Seed Clinic Settings
  const settingsData = [
    { key: "CLINIC_NAME", value: "ชุมใจ คลินิกสุขภาพชุมชน" },
    { key: "CLINIC_NAME_EN", value: "Chunjai Community Clinic" },
    { key: "CLINIC_SUBTITLE", value: "Community Clinic & Smart Health Tracking" },
    { key: "OPENING_HOURS", value: "จันทร์ - ศุกร์: 08:30 - 16:30 น." },
    { key: "CONTACT_PHONE", value: "02-123-4567" },
  ];

  console.log("⚙️ Seeding clinic settings...");
  for (const s of settingsData) {
    await prisma.clinicSetting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    });
  }

  // 4. Seed Master Admin Account ONLY
  const adminUser = {
    username: "admin",
    fullName: "ผู้ดูแลระบบ ชุมใจ",
    role: UserRole.ADMIN,
    email: "admin@chumjai.com",
    passwordHash: defaultPasswordHash,
  };

  console.log("👑 Seeding Master Admin account...");
  await prisma.user.upsert({
    where: { username: adminUser.username },
    update: {
      fullName: adminUser.fullName,
      role: adminUser.role,
      email: adminUser.email,
      passwordHash: adminUser.passwordHash,
      isActive: true,
    },
    create: adminUser,
  });

  // 5. Seed Default Service Stations if none exist
  const defaultStations = [
    { code: "TRIAGE-01", name: "จุดซักประวัติ 1", stationNumber: 1, type: "TRIAGE" as const },
    { code: "DOC-01", name: "ห้องตรวจแพทย์ 1", stationNumber: 1, type: "DOCTOR" as const },
    { code: "DOC-02", name: "ห้องตรวจแพทย์ 2", stationNumber: 2, type: "DOCTOR" as const },
    { code: "PHARM-01", name: "ห้องจ่ายยา 1", stationNumber: 1, type: "PHARMACY" as const },
    { code: "CASH-01", name: "จุดการเงิน 1", stationNumber: 1, type: "CASHIER" as const },
    { code: "LAB-01", name: "ห้องแล็บ 1", stationNumber: 1, type: "LAB" as const },
  ];

  console.log("🏢 Seeding default service stations...");
  for (const st of defaultStations) {
    await prisma.serviceStation.upsert({
      where: { code: st.code },
      update: { name: st.name, stationNumber: st.stationNumber, type: st.type },
      create: st,
    });
  }

  console.log("✅ Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
