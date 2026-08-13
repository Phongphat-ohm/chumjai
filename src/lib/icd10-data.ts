export interface Icd10Item {
  code: string;
  nameEn: string;
  nameTh: string;
  category: string;
}

export const COMMON_ICD10_LIST: Icd10Item[] = [
  // Respiratory
  { code: "J00", nameEn: "Acute nasopharyngitis [common cold]", nameTh: "ไข้หวัดใหญ่ / หวัดธรรมดา", category: "ระบบทางเดินหายใจ" },
  { code: "J02.9", nameEn: "Acute pharyngitis, unspecified", nameTh: "คออักเสบเฉียบพลัน", category: "ระบบทางเดินหายใจ" },
  { code: "J03.9", nameEn: "Acute tonsillitis, unspecified", nameTh: "ทอนซิลอักเสบเฉียบพลัน", category: "ระบบทางเดินหายใจ" },
  { code: "J20.9", nameEn: "Acute bronchitis, unspecified", nameTh: "หลอดลมอักเสบเฉียบพลัน", category: "ระบบทางเดินหายใจ" },
  { code: "J45.9", nameEn: "Asthma, unspecified", nameTh: "หอบหืด", category: "ระบบทางเดินหายใจ" },

  // Metabolic & Endocrine
  { code: "E11.9", nameEn: "Type 2 diabetes mellitus without complications", nameTh: "โรคเบาหวาน ชนิดที่ 2", category: "ต่อมไร้ท่อและเมแทบอลิซึม" },
  { code: "E78.5", nameEn: "Hyperlipidemia, unspecified", nameTh: "ภาวะไขมันในเลือดสูง", category: "ต่อมไร้ท่อและเมแทบอลิซึม" },
  { code: "E66.9", nameEn: "Obesity, unspecified", nameTh: "โรคอ้วน", category: "ต่อมไร้ท่อและเมแทบอลิซึม" },

  // Cardiovascular
  { code: "I10", nameEn: "Essential (primary) hypertension", nameTh: "โรคความดันโลหิตสูง", category: "ระบบหมุนเวียนโลหิต" },
  { code: "I20.9", nameEn: "Angina pectoris, unspecified", nameTh: "เจ็บหน้าอกเหตุหลอดเลือดหัวใจ", category: "ระบบหมุนเวียนโลหิต" },

  // Gastrointestinal
  { code: "K30", nameEn: "Functional dyspepsia", nameTh: "โรคกระเพาะอาหาร / ท้องอืดแท่น", category: "ระบบทางเดินอาหาร" },
  { code: "K21.9", nameEn: "Gastro-esophageal reflux disease without esophagitis", nameTh: "โรคกรดไหลย้อน (GERD)", category: "ระบบทางเดินอาหาร" },
  { code: "A09.9", nameEn: "Gastroenteritis and colitis of unspecified origin", nameTh: "อุจจาระร่วง / ลำไส้อักเสบเฉียบพลัน", category: "ระบบทางเดินอาหาร" },

  // Musculoskeletal & Pain
  { code: "M54.5", nameEn: "Low back pain", nameTh: "ปวดหลังส่วนล่าง", category: "กล้ามเนื้อและกระดูก" },
  { code: "M79.1", nameEn: "Myalgia", nameTh: "ปวดกล้ามเนื้อ", category: "กล้ามเนื้อและกระดูก" },
  { code: "M17.9", nameEn: "Osteoarthritis of knee, unspecified", nameTh: "ข้อเข่าเสื่อม", category: "กล้ามเนื้อและกระดูก" },

  // Nervous System & Headaches
  { code: "G44.2", nameEn: "Tension-type headache", nameTh: "ปวดศีรษะจากความเครียด", category: "ระบบประสาท" },
  { code: "G43.9", nameEn: "Migraine, unspecified", nameTh: "โรคไมเกรน", category: "ระบบประสาท" },
  { code: "R42", nameEn: "Dizziness and giddiness", nameTh: "เวียนศีรษะ บ้านหมุน", category: "อาการทั่วไป" },

  // Skin & Allergy
  { code: "L20.9", nameEn: "Atopic dermatitis, unspecified", nameTh: "ผื่นผิวหนังอักเสบภูมิแพ้", category: "ผิวหนัง" },
  { code: "L50.9", nameEn: "Urticaria, unspecified", nameTh: "ลมพิษ", category: "ผิวหนัง" },

  // Infections & General Symptoms
  { code: "R50.9", nameEn: "Fever, unspecified", nameTh: "ไข้ ไม่ระบุสาเหตุ", category: "อาการทั่วไป" },
  { code: "N39.0", nameEn: "Urinary tract infection, site not specified", nameTh: "ทางเดินปัสสาวะอักเสบ (UTI)", category: "ระบบทางเดินปัสสาวะ" },
];

export function searchIcd10Codes(query: string): Icd10Item[] {
  if (!query.trim()) return COMMON_ICD10_LIST.slice(0, 15);
  const q = query.toLowerCase();

  return COMMON_ICD10_LIST.filter(
    (item) =>
      item.code.toLowerCase().includes(q) ||
      item.nameEn.toLowerCase().includes(q) ||
      item.nameTh.toLowerCase().includes(q)
  );
}
