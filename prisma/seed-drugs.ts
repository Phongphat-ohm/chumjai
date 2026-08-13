import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("💊 Seeding initial clinic drug inventory...");

  const drugsData = [
    {
      code: "PARA500",
      genericName: "Paracetamol",
      tradeName: "Tylenol / Sara",
      strength: "500 mg",
      unit: "เม็ด",
      description: "ยาบรรเทาปวด ลดไข้",
      minStockLevel: 200,
      totalStock: 1000,
    },
    {
      code: "AMOX500",
      genericName: "Amoxicillin",
      tradeName: "Amoxil",
      strength: "500 mg",
      unit: "เม็ด",
      description: "ยาปฏิชีวนะฆ่าเชื้อแบคทีเรีย",
      minStockLevel: 100,
      totalStock: 500,
    },
    {
      code: "OMEP20",
      genericName: "Omeprazole",
      tradeName: "Miracid",
      strength: "20 mg",
      unit: "เม็ด",
      description: "ยาลดการหลั่งกรดในกระเพาะอาหาร",
      minStockLevel: 100,
      totalStock: 400,
    },
    {
      code: "CETI10",
      genericName: "Cetirizine",
      tradeName: "Zyrtec",
      strength: "10 mg",
      unit: "เม็ด",
      description: "ยาแก้แพ้ ลดน้ำมูก แก้คัน",
      minStockLevel: 150,
      totalStock: 600,
    },
    {
      code: "AMLO5",
      genericName: "Amlodipine",
      tradeName: "Norvasc",
      strength: "5 mg",
      unit: "เม็ด",
      description: "ยาลดความดันโลหิตสูง",
      minStockLevel: 200,
      totalStock: 800,
    },
    {
      code: "METF500",
      genericName: "Metformin",
      tradeName: "Glucophage",
      strength: "500 mg",
      unit: "เม็ด",
      description: "ยารักษาโรคเบาหวาน",
      minStockLevel: 200,
      totalStock: 800,
    },
    {
      code: "ORS",
      genericName: "Oral Rehydration Salts",
      tradeName: "ผงเกลือแร่ ORS",
      strength: "ซอง",
      unit: "ซอง",
      description: "ผงเกลือแร่ทดแทนน้ำและเกลือแร่กรณีท้องร่วง",
      minStockLevel: 100,
      totalStock: 300,
    },
    {
      code: "CPM4",
      genericName: "Chlorpheniramine",
      tradeName: "CPM",
      strength: "4 mg",
      unit: "เม็ด",
      description: "ยาแก้แพ้ ลดน้ำมูก ทำให้ง่วงซึม",
      minStockLevel: 200,
      totalStock: 1000,
    },
    {
      code: "SALB-INH",
      genericName: "Salbutamol Inhaler",
      tradeName: "Ventolin Evohaler",
      strength: "100 mcg/dose",
      unit: "ขวดพ่น",
      description: "ยาพ่นขยายหลอดลมบรรเทาอาการหอบหืด",
      minStockLevel: 20,
      totalStock: 80,
    },
  ];

  for (const drug of drugsData) {
    await prisma.drug.upsert({
      where: { code: drug.code },
      update: {
        genericName: drug.genericName,
        tradeName: drug.tradeName,
        strength: drug.strength,
        unit: drug.unit,
        description: drug.description,
        totalStock: drug.totalStock,
      },
      create: drug,
    });
  }

  console.log("✅ Initial drug inventory seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding drugs:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
