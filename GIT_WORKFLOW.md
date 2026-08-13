# Git Workflow สำหรับการพัฒนาและ Deploy ระบบ ชุมใจ (Chunjai)

เอกสารนี้อธิบายคู่มือและขั้นตอนปฏิบัติตามมาตรฐาน **Git Workflow** แบบแยก Branch สำหรับโปรเจกต์ **ชุมใจ (Chunjai)** ตั้งแต่เริ่มต้นพัฒนา Feature ไปจนถึงการรวม Code และ Deploy ขึ้น Production Host

---

## 1. โครงสร้าง Branch ในระบบ (Branch Structure)

โปรเจกต์ใช้ Branch หลัก 2 ระดับ:

```text
main
 │
 │ Production Version (รุ่นพร้อมใช้งานจริงบน Server)
 │
 └── dev
      │
      │ Integration & Testing (รุ่นรวมงานและทดสอบ)
      │
      ├── feature/login
      ├── feature/patient-registration
      ├── feature/doctor-consultation
      ├── feature/reports
      │
      ├── fix/login-error
      └── fix/queue-display-bug
```

### ความหมายและหน้าที่ของแต่ละ Branch:

- **`main`**: บันทึก Code เวอร์ชันที่ผ่านการทดสอบและพร้อมใช้งานจริงบน Production Host เท่านั้น
- **`dev`**: บันทึก Code เวอร์ชันล่าสุดสำหรับรวมงานของทีมและทดสอบการทำงานร่วมกัน
- **`feature/*`**: Branch ย่อยสำหรับการพัฒนาฟีเจอร์ใหม่แต่ละฟังก์ชัน
- **`fix/*`**: Branch ย่อยสำหรับการแก้ไข Bug หรือปรับแต่งปัญหาเฉพาะจุด

### ลำดับขั้นตอน Workflow หลัก (Main Lifecycle):

```text
feature/* (พัฒนาและเขียน Code)
   ↓
dev (รวม Code และทดสอบระบบ)
   ↓
Testing (ตรวจสอบ Type Safety & Production Build)
   ↓
main (รุ่นพร้อมส่งมอบ)
   ↓
Production Host (ใช้งานจริง)
```

---

## 2. ตรวจสอบ Branch ปัจจุบัน (Branch Inspection)

ตรวจสอบรายชื่อ Branch ทั้งหมดในเครื่องและบน Remote:

```bash
git branch -a
```

ตัวอย่างผลลัพธ์:

```text
* dev
  main
  remotes/origin/dev
  remotes/origin/main
```

> [!NOTE]
> เครื่องหมาย `*` ด้านหน้าชื่อ Branch หมายถึง Branch ที่กำลังทำงานอยู่ ณ ปัจจุบัน

ตรวจสอบรายละเอียด Tracking Branch เพิ่มเติม:

```bash
git branch -vv
```

---

## 3. ขั้นตอนการเริ่มทำ Feature ใหม่ (Create New Feature)

ก่อนเริ่มพัฒนาฟีเจอร์ใหม่ทุกครั้ง ให้เริ่มจาก Branch `dev` ที่อัปเดตล่าสุดเสมอ:

```bash
# 1. สลับไปที่ Branch dev
git switch dev

# 2. ดึงข้อมูล Code ล่าสุดจาก Remote Repository
git pull origin dev

# 3. สร้างและสลับไปยัง Feature Branch ใหม่
git switch -c feature/your-feature-name
```

ตัวอย่างการตั้งชื่อ Branch:
- `feature/patient-vitals`
- `feature/prescription-label`
- `feature/user-management`

---

## 4. การ บันทึกงาน (Commit Changes)

เมื่อพัฒนาฟีเจอร์เรียบร้อยแล้ว ให้ทำการบันทึก Change:

```bash
# 1. ตรวจสอบไฟล์ที่มีการแก้ไข
git status

# 2. เพิ่มไฟล์เข้าระบบ Staging
git add .

# 3. บันทึก Commit พร้อมข้อความอธิบายงานที่ชัดเจน
git commit -m "feat: add patient vitals registration form and BMI calculation"
```

---

## 5. การส่ง Code ขึ้น Remote และสร้าง Pull Request (PR)

เมื่อทำ Commit เรียบร้อยแล้ว ให้ Push ขึ้นไปยัง Remote Repository:

```bash
git push -u origin feature/your-feature-name
```

จากนั้นดำเนินการรวม Code เข้าไปยัง Branch `dev`:
1. เปิด GitHub Repository
2. กดสร้าง **Pull Request (PR)** จาก `feature/your-feature-name` -> `dev`
3. ตรวจสอบ Code (Code Review) และทำการ **Merge Pull Request** เข้าสู่ `dev`

---

## 6. การทดสอบและ Deploy ขึ้น Production (`dev` -> `main`)

เมื่อระบบใน `dev` ผ่านการทดสอบเรียบร้อยแล้ว ให้ดำเนินการ Merge เข้าสู่ `main`:

```bash
# 1. สลับไปที่ Branch main
git switch main

# 2. ดึง Code ล่าสุดของ main
git pull origin main

# 3. รวม Code จาก dev เข้าสู่ main
git merge dev

# 4. ตรวจสอบความถูกต้องด้วยคำสั่ง Verification
npx tsc --noEmit
npm run build

# 5. Push ขึ้น Remote main
git push origin main
```

---

## 7. สรุปคำสั่งที่ใช้บ่อย (Git Cheatsheet)

| การทำงาน | คำสั่ง Git |
|---|---|
| สลับ Branch | `git switch <branch-name>` |
| สร้างและสลับ Branch ใหม่ | `git switch -c <branch-name>` |
| ดึง Code ล่าสุด | `git pull origin <branch-name>` |
| ส่ง Code ขึ้น Remote | `git push origin <branch-name>` |
| รวม Code | `git merge <source-branch>` |
| ตรวจสอบสถานะ | `git status` |
