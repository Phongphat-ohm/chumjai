import { PrismaClient } from "../src/generated/client";

const prisma = new PrismaClient();

async function main() {
  console.log("📦 Seeding initial drug batches for FEFO stock deduction...");

  const drugs = await prisma.drug.findMany();

  if (drugs.length === 0) {
    console.log("⚠️ No drugs found in database. Run seed-drugs.ts first.");
    return;
  }

  // Clear existing batches for clean seed
  await prisma.drugBatch.deleteMany();

  for (const drug of drugs) {
    const batch1Lot = `LOT-${drug.code}-2026A`;
    const batch2Lot = `LOT-${drug.code}-2026B`;

    // Expire soon (e.g. 3 months)
    const expDate1 = new Date();
    expDate1.setMonth(expDate1.getMonth() + 3);

    // Expire later (e.g. 12 months)
    const expDate2 = new Date();
    expDate2.setMonth(expDate2.getMonth() + 12);

    await prisma.drugBatch.create({
      data: {
        drugId: drug.id,
        lotNumber: batch1Lot,
        quantity: 300,
        expiredAt: expDate1,
      },
    });

    await prisma.drugBatch.create({
      data: {
        drugId: drug.id,
        lotNumber: batch2Lot,
        quantity: 500,
        expiredAt: expDate2,
      },
    });

    // Update total drug stock to match batches
    await prisma.drug.update({
      where: { id: drug.id },
      data: { totalStock: 800 },
    });
  }

  console.log("✅ Initial drug batches seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding drug batches:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
