#!/usr/bin/env bash

# ==============================================================================
# 🏥 Chunjai (ชุมใจ) — Production Deployment & Build Script
# ==============================================================================
# Script นี้ใช้สำหรับเตรียมพร้อมระบบก่อนขึ้น Host (Install -> Generate -> Migrate -> Build)
# 
# การใช้งาน:
#   chmod +x ./scripts/deploy.sh
#   ./scripts/deploy.sh
# 
# ตัวเลือกเสริม:
#   ./scripts/deploy.sh --seed          # รัน Seed ข้อมูลเริ่มต้นหลัง Migrate
#   ./scripts/deploy.sh --clean         # ลบ node_modules และ .next ก่อนทำใหม่ทั้งหมด
# ==============================================================================

set -e # หยุดการทำงานทันทีหากมีคำสั่งใดเกิด error

# กำหนดสีสำหรับ Output Terminal
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# ตัวแปรสถานะ
RUN_SEED=false
CLEAN_BUILD=false

# ตรวจสอบ Parameter
for arg in "$@"; do
  case $arg in
    --seed)
      RUN_SEED=true
      shift
      ;;
    --clean)
      CLEAN_BUILD=true
      shift
      ;;
  esac
done

echo -e "${CYAN}==============================================================================${NC}"
echo -e "${CYAN}🚀 เริ่มต้นกระบวนการ Deploy ระบบ Chumjai สำหรับ Production Host${NC}"
echo -e "${CYAN}==============================================================================${NC}"

# ------------------------------------------------------------------------------
# 1. ตรวจสอบสภาพแวดล้อม (Environment Check)
# ------------------------------------------------------------------------------
echo -e "\n${BLUE}[1/5] 🔍 ตรวจสอบสภาพแวดล้อมและไฟล์คอนฟิก...${NC}"

# ตรวจสอบ Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ ไม่พบ Node.js ในระบบ! กรุณาติดตั้ง Node.js (แนะนำ Node v18 ขึ้นไป)${NC}"
    exit 1
fi

NODE_VERSION=$(node -v)
echo -e "${GREEN}✓ Node.js Version:${NC} $NODE_VERSION"

# ตรวจสอบไฟล์ .env
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  ไม่พบไฟล์ .env ใน Root Directory!${NC}"
    if [ -f ".env.example" ]; then
        echo -e "${YELLOW}ℹ️  กำลังคัดลอก .env.example เป็น .env ให้โดยอัตโนมัติ...${NC}"
        cp .env.example .env
        echo -e "${RED}⚠️  กรุณาเปิดไฟล์ .env และแก้ไข DATABASE_URL / AUTH_SECRET ให้ถูกต้องก่อนรันจริง!${NC}"
    else
        echo -e "${RED}❌ ไม่พบทั้ง .env และ .env.example กรุณาสร้างไฟล์ .env ก่อนดำเนินการต่อ${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✓ พบไฟล์ .env เรียบร้อยแล้ว${NC}"
fi

# ล้างไฟล์เก่าถ้ามี --clean flag
if [ "$CLEAN_BUILD" = true ]; then
    echo -e "${YELLOW}🧹 กำลังลบ node_modules และ .next (Clean mode)...${NC}"
    rm -rf node_modules .next
    echo -e "${GREEN}✓ ลบไฟล์เก่าเรียบร้อย${NC}"
fi

# ------------------------------------------------------------------------------
# 2. ติดตั้ง Dependencies (Install Packages)
# ------------------------------------------------------------------------------
echo -e "\n${BLUE}[2/5] 📦 ติดตั้ง Dependencies (npm ci / install)...${NC}"
if [ -f "package-lock.json" ]; then
    echo -e "ใช้คำสั่ง: ${CYAN}npm ci${NC}"
    npm ci
else
    echo -e "ใช้คำสั่ง: ${CYAN}npm install${NC}"
    npm install
fi
echo -e "${GREEN}✓ ติดตั้ง Dependencies สำเร็จ${NC}"

# ------------------------------------------------------------------------------
# 3. สร้าง Prisma Client (Prisma Generate)
# ------------------------------------------------------------------------------
echo -e "\n${BLUE}[3/5] ⚡ สร้าง Prisma Client (Prisma Generate)...${NC}"
npx prisma generate
echo -e "${GREEN}✓ Prisma Client ถูกสร้างไปยัง src/generated/client เรียบร้อย${NC}"

# ------------------------------------------------------------------------------
# 4. อัปเดตโครงสร้างฐานข้อมูล (Prisma Migrate / DB Push)
# ------------------------------------------------------------------------------
echo -e "\n${BLUE}[4/5] 🗄️  อัปเดต Schema ไปยัง Database (Prisma Migrate / Push)...${NC}"

# ลองรัน prisma migrate deploy ก่อน (สำหรับ Production ที่มี Migration files)
# หากไม่มี Migration files ให้รัน prisma db push แทน
if [ -d "prisma/migrations" ] && [ "$(ls -A prisma/migrations 2>/dev/null)" ]; then
    echo -e "ตรวจพบโฟลเดอร์ migrations กำลังรัน: ${CYAN}npx prisma migrate deploy${NC}"
    npx prisma migrate deploy
else
    echo -e "ไม่พบ migration history กำลังซิงค์ Schema ด้วย: ${CYAN}npx prisma db push${NC}"
    npx prisma db push --skip-generate
fi
echo -e "${GREEN}✓ อัปเดต Database Schema สำเร็จ${NC}"

# รัน Database Seed ถ้าเปิด flag --seed ไว้
if [ "$RUN_SEED" = true ]; then
    echo -e "\n${YELLOW}🌱 กำลังรัน Database Seed (ข้อมูลตั้งต้น & สิทธิ์ระบบ)...${NC}"
    npm run db:seed
    echo -e "${GREEN}✓ Seed ข้อมูลฐานข้อมูลสำเร็จ${NC}"
fi

# ------------------------------------------------------------------------------
# 5. Build Next.js Production
# ------------------------------------------------------------------------------
echo -e "\n${BLUE}[5/5] 🏗️  ทำการ Build Next.js สำหรับ Production...${NC}"
npm run build
echo -e "${GREEN}✓ Next.js Build สำเร็จพร้อมขึ้น Host${NC}"

# ------------------------------------------------------------------------------
# สรุปและคำแนะนำในการรัน
# ------------------------------------------------------------------------------
echo -e "\n${CYAN}==============================================================================${NC}"
echo -e "${GREEN}🎉 เตรียมระบบเสร็จสมบูรณ์ 100%! พร้อมสำหรับการรัน Production${NC}"
echo -e "${CYAN}==============================================================================${NC}"
echo -e "\nคุณสามารถสั่งรันระบบได้ด้วยวิธีดังต่อไปนี้:"
echo -e "1) ${YELLOW}รันด้วย Script เริ่มต้น:${NC}       ./scripts/start.sh"
echo -e "2) ${YELLOW}รันด้วยคำสั่ง npm:${NC}           npm run start"
echo -e "3) ${YELLOW}รันผ่าน PM2 (แนะนำบน VPS):${NC}    pm2 start ecosystem.config.js"
echo -e "4) ${YELLOW}รันผ่าน Docker:${NC}              docker compose up -d"
echo -e "${CYAN}==============================================================================${NC}\n"
