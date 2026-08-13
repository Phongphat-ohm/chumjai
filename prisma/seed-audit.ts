import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Audit Logs for PDPA Demonstration...");

  const adminUser = await prisma.user.findFirst({
    where: { role: "ADMIN" },
  });

  const doctorUser = await prisma.user.findFirst({
    where: { role: "DOCTOR" },
  });

  const nurseUser = await prisma.user.findFirst({
    where: { role: "NURSE" },
  });

  const pharmacistUser = await prisma.user.findFirst({
    where: { role: "PHARMACIST" },
  });

  const patient = await prisma.patient.findFirst();

  const auditData = [
    {
      userId: adminUser?.id || null,
      action: "LOGIN",
      resourceType: "USER",
      resourceId: adminUser?.id || null,
      ipAddress: "127.0.0.1",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      success: true,
    },
    {
      userId: nurseUser?.id || null,
      action: "PATIENT_CREATE",
      resourceType: "PATIENT",
      resourceId: patient?.id || null,
      ipAddress: "127.0.0.1",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      success: true,
    },
    {
      userId: nurseUser?.id || null,
      action: "TRIAGE_RECORDED",
      resourceType: "VISIT",
      resourceId: patient?.id || null,
      ipAddress: "127.0.0.1",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      success: true,
    },
    {
      userId: doctorUser?.id || null,
      action: "SOAP_CREATED",
      resourceType: "CONSULTATION",
      resourceId: patient?.id || null,
      ipAddress: "127.0.0.1",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      success: true,
    },
    {
      userId: doctorUser?.id || null,
      action: "PRESCRIPTION_CREATED",
      resourceType: "PRESCRIPTION",
      resourceId: patient?.id || null,
      ipAddress: "127.0.0.1",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      success: true,
    },
    {
      userId: pharmacistUser?.id || null,
      action: "DRUG_DISPENSED",
      resourceType: "PRESCRIPTION",
      resourceId: patient?.id || null,
      ipAddress: "127.0.0.1",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      success: true,
    },
    {
      userId: adminUser?.id || null,
      action: "STOCK_ADDED",
      resourceType: "DRUG",
      resourceId: null,
      ipAddress: "127.0.0.1",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      success: true,
    },
  ];

  for (const log of auditData) {
    await prisma.auditLog.create({
      data: log,
    });
  }

  console.log("Successfully seeded Audit Logs!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
