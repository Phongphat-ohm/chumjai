# 🚀 คู่มือการ Deploy และขึ้น Production Host ระบบ "ชุมใจ" (Chunjai)

เอกสารนี้รวบรวมคำสั่งและ Script อัตโนมัติสำหรับการ **Install, Prisma Generate, Migrate/Push, Build และ Run** ระบบชุมใจ เพื่อขึ้น Host จริงอย่างมั่นใจและปลอดภัย

---

## 📁 สรุปไฟล์และ Script ที่เตรียมไว้ให้

| ไฟล์ / Script | หน้าที่และการทำงาน |
|---|---|
| [`./deploy.sh`](file:///workspaces/chumjai/deploy.sh) หรือ [`./scripts/deploy.sh`](file:///workspaces/chumjai/scripts/deploy.sh) | **Script หลักสำหรับการเตรียมระบบ**: ติดตั้ง Dependencies, สร้าง Prisma Client, ทำ Database Migration/Push, และ Build Next.js |
| [`./start.sh`](file:///workspaces/chumjai/start.sh) หรือ [`./scripts/start.sh`](file:///workspaces/chumjai/scripts/start.sh) | **Script สตาร์ท Production Server**: ตรวจสอบความพร้อมและรัน `next start` บน Port ที่กำหนด |
| [`ecosystem.config.js`](file:///workspaces/chumjai/ecosystem.config.js) | คอนฟิกสำหรับ **PM2 Process Manager** (สำหรับรัน Background บน Linux VPS) |
| [`Dockerfile`](file:///workspaces/chumjai/Dockerfile) & [`docker-compose.yml`](file:///workspaces/chumjai/docker-compose.yml) | คอนฟิกสำหรับขึ้น Host ด้วย **Docker / Container** |
| [`package.json`](file:///workspaces/chumjai/package.json) | เพิ่มคำสั่งลัด npm scripts สำหรับงานบำรุงรักษาและจัดการฐานข้อมูล |

---

## ⚙️ 1. การเตรียมสภาพแวดล้อม (Environment Variables)

ก่อนรัน Script ให้แน่ใจว่าได้ตั้งค่าไฟล์ `.env` ใน Root Directory เรียบร้อยแล้ว:

```bash
cp .env.example .env
nano .env # หรือแก้ไขผ่าน Editor
```

ตัวอย่างค่าใน `.env`:
```env
# ฐานข้อมูล PostgreSQL
DATABASE_URL="postgresql://username:password@host:port/database_name"

# คีย์ความปลอดภัยสำหรับ Session & JWT
AUTH_SECRET="your-strong-random-secret-key-32-chars-minimum"

# Environment Mode
NODE_ENV="production"
PORT=3000
```

---

## 🛠️ 2. วิธีขึ้น Host (เลือกวิธีที่ตรงกับสถาปัตยกรรมของคุณ)

### วิธีที่ 1: Deploy บน Linux VPS โดยตรง (แนะนำ: Ubuntu / Debian + PM2)

#### ขั้นตอนที่ 1: รัน Deploy Script (อัตโนมัติทุกขั้นตอน)
```bash
# ให้สิทธิ์รัน Script (ทำครั้งแรกครั้งเดียว)
chmod +x deploy.sh start.sh scripts/*.sh

# รัน Script ติดตั้ง, Generate, Migrate, Build
./deploy.sh
```

> **Option เสริมสำหรับการ Seed ข้อมูล:**
> - `./deploy.sh --seed` : รัน Seed ข้อมูลสิทธิ์และผู้ใช้เริ่มต้นหลัง Migrate
> - `./deploy.sh --clean` : ลบ `node_modules` และ `.next` เก่าแล้ว Build ใหม่ทั้งหมด

#### ขั้นตอนที่ 2: รัน Production ด้วย PM2 (ให้ระบบทำงานเบื้องหลัง 24/7)
```bash
# ติดตั้ง PM2 หากยังไม่มี
npm install -g pm2

# สตาร์ทระบบผ่านไฟล์ ecosystem.config.js
pm2 start ecosystem.config.js

# บันทึกสถานะ PM2 ให้เปิดอัตโนมัติเมื่อ Server Restart
pm2 save
pm2 startup
```

**คำสั่ง PM2 ที่ใช้บ่อย:**
- ดูสถานะ: `pm2 status`
- ดู Log การทำงาน: `pm2 logs chumjai-clinic`
- รีสตาร์ทระบบ: `pm2 restart chumjai-clinic`
- หยุดการทำงาน: `pm2 stop chumjai-clinic`

---

### วิธีที่ 2: Deploy ด้วย Docker / Docker Compose (Coolify, CapRover, VPS)

ระบบได้เตรียม **Multi-Stage Dockerfile** และ **docker-compose.yml** ที่มีการรัน Prisma Generate + Migration อัตโนมัติไว้ให้แล้ว

```bash
# 1. รันระบบผ่าน Docker Compose
docker compose up -d --build

# 2. ดูสถานะและ Log ของ Container
docker compose logs -f app

# 3. สั่งหยุดการทำงาน
docker compose down
```

---

### วิธีที่ 3: รันแบบ Standalone ด้วย Bash Script
```bash
# สตาร์ทบนพอร์ตเริ่มต้น (Port 3000)
./start.sh

# หรือกำหนด Port ตามต้องการ
PORT=8080 ./start.sh
```

---

## 🗄️ 3. สรุปคำสั่ง NPM Scripts สำหรับ Prisma & Database

| คำสั่ง | รายละเอียด |
|---|---|
| `npm run deploy:build` | ติดตั้ง Dependencies + Prisma Generate + DB Push + Build |
| `npm run prisma:generate` | สร้าง Prisma Client ไปที่ `src/generated/client` |
| `npm run prisma:migrate` | นำ Migration Files ไป Apply บน Database Production (`prisma migrate deploy`) |
| `npm run prisma:push` | ซิงค์ Schema Prisma เข้ากับ Database ทันที (`prisma db push`) |
| `npm run db:seed` | นำเข้าข้อมูลระบบเริ่มต้น (สิทธิ์, บทบาท, ข้อมูลตั้งต้น) |
| `npm run db:seed:drugs` | นำเข้าข้อมูลคลังยาและเวชภัณฑ์มาตรฐาน |
| `npm run db:seed:batches` | นำเข้าข้อมูล Batch ล็อตยาตัวอย่าง |
| `npm run db:seed:audit` | นำเข้าข้อมูลจำลอง Audit Log |
| `npm run prisma:studio` | เปิด GUI สำหรับจัดการข้อมูลในตารางผ่าน Web Browser |

---

## 🔍 4. ลำดับขั้นตอนที่ Script `deploy.sh` ดำเนินการอัตโนมัติ

```mermaid
flowchart TD
    A[เริ่มรัน ./deploy.sh] --> B[1. ตรวจสอบ Node.js & ไฟล์ .env]
    B --> C[2. ติดตั้ง Dependencies ด้วย npm ci]
    C --> D[3. npx prisma generate -> สร้าง Client ไปยัง src/generated/client]
    D --> E{ตรวจพบ prisma/migrations หรือไม่?}
    E -- มี migrations --> F[4. รัน npx prisma migrate deploy]
    E -- ไม่มี migrations --> G[4. รัน npx prisma db push ซิงค์ schema ตรง]
    F --> H{มี Flag --seed หรือไม่?}
    G --> H
    H -- มี --seed --> I[รัน npm run db:seed]
    H -- ไม่มี --> J[5. Build Next.js Production ด้วย npm run build]
    I --> J
    J --> K[🎉 พร้อมรัน Production ด้วย ./start.sh หรือ PM2]
```

---

## 🛡️ 5. Checklist ก่อนขึ้น Production จริง

- [x] **Node.js**: เวอร์ชัน 18.x หรือ 20.x ขึ้นไป
- [ ] **Database Connection**: ตรวจสอบว่า IP/Port และสิทธิ์ผู้ใช้ PostgreSQL เชื่อมต่อได้จริงจาก Host
- [ ] **AUTH_SECRET**: เปลี่ยนเป็นสตริงสุ่มที่มีความปลอดภัยสูง ไม่ซ้ำกับตัวอย่าง
- [ ] **Reverse Proxy / SSL**: แนะนำให้ครอบด้วย Nginx หรือ Cloudflare เพื่อใช้งาน HTTPS (Port 443) และทำ Rate Limiting
- [ ] **Backup Schedule**: ตั้ง Cron Job สำหรับ Backup ฐานข้อมูล PostgreSQL เป็นประจำ
