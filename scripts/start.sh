#!/usr/bin/env bash

# ==============================================================================
# 🏥 Chunjai (ชุมใจ) — Production Start Script
# ==============================================================================
# Script นี้ใช้สำหรับเริ่มต้นการทำงานของระบบในโหมด Production
# 
# การใช้งาน:
#   chmod +x ./scripts/start.sh
#   ./scripts/start.sh
# 
# กำหนด Port เองได้:
#   PORT=8080 ./scripts/start.sh
# ==============================================================================

set -e

# กำหนดสี
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m'

# กำหนดค่าเริ่มต้น
export PORT="${PORT:-3000}"
export NODE_ENV="production"

echo -e "${CYAN}==============================================================================${NC}"
echo -e "${CYAN}🚀 กำลังสตาร์ทระบบ Chunjai (Production Mode)...${NC}"
echo -e "${CYAN}==============================================================================${NC}"

# ตรวจสอบ .next directory ว่า build หรือยัง
if [ ! -d ".next" ]; then
    echo -e "${RED}❌ ไม่พบโฟลเดอร์ .next! กรุณารัน build ก่อนใช้งาน:${NC}"
    echo -e "   คำสั่ง: ${YELLOW}./scripts/deploy.sh${NC} หรือ ${YELLOW}npm run build${NC}"
    exit 1
fi

# ตรวจสอบไฟล์ .env
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  คำเตือน: ไม่พบไฟล์ .env ระบบอาจใช้ตัวแปรจาก Environment ของเครื่องแม่ข่าย${NC}"
fi

echo -e "${GREEN}✓ โหมดการทำงาน (NODE_ENV):${NC} $NODE_ENV"
echo -e "${GREEN}✓ พอร์ตที่ให้บริการ (PORT):${NC}    $PORT"
echo -e "${BLUE}📡 เข้าใช้งานระบบได้ที่:${NC}        http://localhost:$PORT"
echo -e "${CYAN}==============================================================================${NC}\n"

# ดักจับสัญญาณการปิด (Ctrl+C / SIGTERM) เพื่อปิดระบบอย่างปลอดภัย
trap 'echo -e "\n${YELLOW}🛑 ได้รับสัญญาณหยุด กำลังปิดบริการ Chunjai อย่างปลอดภัย...${NC}"; exit 0' SIGINT SIGTERM

# เริ่มต้น Next.js Server
npx next start -p "$PORT"
