# ระบบเช็คชื่อเข้าเรียนด้วย QR Code สำหรับรายวิชา
## (Class Attendance QR Check-in System)

> **University Mini Project / SRS-based Web Application Prototype**
> พัฒนาด้วย React.js 18, Vite, Tailwind CSS และ LocalStorage

---

## 📌 1. Project Overview (ภาพรวมโครงการ)

**ระบบเช็คชื่อเข้าเรียนด้วย QR Code สำหรับรายวิชา** เป็นเว็บแอปพลิเคชันต้นแบบ (Prototype) ที่ช่วยให้อาจารย์ผู้สอนบริหารจัดการรายวิชา รายชื่อนักศึกษา คาบเรียน สร้างรหัส Session และเปิดแสดง QR Code บนหน้าจอ เพื่อให้นักศึกษาสแกนหรือกรอกรหัสเพื่อเช็คชื่อเข้าเรียนผ่านสมาร์ตโฟนได้อย่างสะดวก รวดเร็ว แม่นยำ และป้องกันการเช็คชื่อซ้ำ

แอปพลิเคชันนี้ทำงานเป็น Single-Page Application (SPA) บน Frontend ทั้งหมด โดยใช้ **LocalStorage** ในการจัดเก็บข้อมูล มีโครงสร้างที่เข้าใจง่าย เหมาะสำหรับการนำเสนอในโปรเจกต์รายวิชามหาวิทยาลัย (2-week mini project)

---

## ⚡ 2. Core Features (ฟังก์ชันการทำงานหลัก)

### 👨‍🏫 สำหรับอาจารย์ (Teacher Portal)
1. **แผงควบคุม (Dashboard)**: แสดงสรุปจำนวนรายวิชา นักศึกษา คาบเรียน สถิติการเข้าเรียน (มาเรียน/มาสาย/ขาดเรียน) และกิจกรรมล่าสุด
2. **จัดการรายวิชา (Course Management)**: เพิ่ม แก้ไข ลบ และค้นหารายวิชา (รหัสวิชา, ชื่อวิชา, กลุ่มเรียน, ภาคการศึกษา)
3. **จัดการนักศึกษา (Student Management)**: กรองตามรายวิชา เพิ่ม แก้ไข ลบ และค้นหารายชื่อนักศึกษาในรายวิชา
4. **จัดการคาบเรียน & QR Code (Session Management)**:
   - สร้างคาบเรียน พร้อมสร้างรหัส Session สุ่ม 8 หลักอัตโนมัติ (เช่น `SE333-8F2K`)
   - กำหนดเกณฑ์เวลามาสาย (Late Cutoff Minutes)
   - สลับสถานะเปิด/ปิดรับเช็คชื่อ (Open / Closed / Cancelled)
5. **หน้าจอแสดง QR Code (QR Display Page)**:
   - แสดง QR Code ที่สร้างจาก URL ปัจจุบันแบบไดนามิก (`window.location.origin`)
   - แสดงรหัส Session ขนาดใหญ่สำหรับนักศึกษาที่กรอกด้วยตนเอง
   - แสดงสถิติการเช็คชื่อแบบ Real-time ซิงค์ข้อมูลข้าม Tab อัตโนมัติ
   - รองรับการโหมดขยายเต็มหน้าจอ (Fullscreen) สำหรับเปิดบนโปรเจกเตอร์
6. **รายการเช็คชื่อ (Attendance List)**:
   - แสดงรายชื่อนักศึกษาทุกคนที่ลงทะเบียนในวิชานั้น (Source of Truth)
   - นักศึกษาที่ยังไม่ได้เช็คชื่อจะถูกแสดงสถานะ **"ขาดเรียน (Absent)"** โดยอัตโนมัติ
   - อาจารย์สามารถปรับเปลี่ยนสถานะ (Present / Late / Absent) และใส่หมายเหตุย้อนหลังได้
7. **รายงานสรุป (Attendance Reports)**:
   - รายงานสรุปตามคาบเรียน (Session Summary)
   - รายงานสรุปรายบุคคล (Student Summary) แสดงเปอร์เซ็นต์การเข้าเรียน
   - รองรับการสั่งพิมพ์ / Export เป็น PDF

### 🎓 สำหรับนักศึกษา (Student Check-in Portal)
1. **สแกน QR Code**: สแกนแล้วเปิดหน้าเช็คชื่อพร้อมเติมรหัส Session ให้อัตโนมัติผ่าน Query Parameter (`?session=CODE`)
2. **กรอกรหัส Session**: รองรับการพิมพ์รหัส 8 หลักด้วยตนเอง
3. **ตรวจสอบความถูกต้อง (Validation)**:
   - ตรวจสอบรหัส Session ว่ามีจริงและอยู่ในสถานะ `Open`
   - ตรวจสอบรหัสนักศึกษาว่าลงทะเบียนในรายวิชานี้จริงหรือไม่
   - **ป้องกันการเช็คชื่อซ้ำ**: หากเช็คชื่อในคาบนั้นไปแล้ว ระบบจะไม่ยอมให้เช็คชื่อซ้ำ
4. **คำนวณสถานะอัตโนมัติ**:
   - หากเช็คชื่อภายในเวลาที่กำหนด $\rightarrow$ **มาเรียน (Present)**
   - หากเช็คชื่อเกินเวลาสายที่ตั้งไว้ $\rightarrow$ **มาสาย (Late)**
5. **หน้าจอแจ้งผลสำเร็จ**: แสดงเวลาที่เช็คชื่อจริง พร้อมเอฟเฟกต์พลุกระดาษ (Confetti)

---

## 🛠️ 3. Tech Stack (เทคโนโลยีที่ใช้)

- **Frontend Framework**: React.js 18 (Vite)
- **Language**: JavaScript (ES6+)
- **Styling**: Tailwind CSS v4 + Responsive Design
- **Icons**: `lucide-react`
- **QR Code Rendering**: `qrcode.react` (SVG Format)
- **Data Persistence**: Browser `localStorage` Layer
- **Client Routing**: `react-router-dom` v6
- **Animations**: `canvas-confetti`

---

## 📂 4. Project Structure (โครงสร้างโปรเจกต์)

```
Class Attendance QR Check-in System/
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Navbar.jsx          # แถบนำทางด้านบน & ปุ่มรีเซ็ต Demo Data
│   │   │   ├── Sidebar.jsx         # เมนูด้านข้างสำหรับอาจารย์
│   │   │   ├── Card.jsx            # การ์ดแสดงผล
│   │   │   ├── Modal.jsx           # ป๊อปอัปฟอร์ม
│   │   │   ├── ConfirmModal.jsx    # ป๊อปอัปยืนยันการลบ
│   │   │   ├── Button.jsx          # ปุ่มกดสไตล์สม่ำเสมอ
│   │   │   ├── Input.jsx           # ช่องกรอกข้อมูล
│   │   │   ├── Select.jsx          # ตัวเลือก Dropdown
│   │   │   ├── Badge.jsx           # ป้ายสถานะ Present / Late / Absent
│   │   │   └── EmptyState.jsx      # แสดงเมื่อไม่มีข้อมูล
│   ├── data/
│   │   └── initialSeedData.js      # ข้อมูลตัวอย่างเริ่มต้นภาษาไทย
│   ├── layouts/
│   │   ├── TeacherLayout.jsx       # Layout ฝั่งอาจารย์
│   │   └── StudentLayout.jsx       # Layout ฝั่งนักศึกษา
│   ├── pages/
│   │   ├── HomePage.jsx            # หน้าแรกแนะนำระบบ
│   │   ├── student/
│   │   │   └── StudentCheckinPage.jsx # หน้าเช็คชื่อนักศึกษา
│   │   └── teacher/
│   │       ├── TeacherDashboardPage.jsx  # แผงควบคุมสถิติ
│   │       ├── CourseManagementPage.jsx  # จัดการรายวิชา
│   │       ├── StudentManagementPage.jsx # จัดการนักศึกษา
│   │       ├── SessionManagementPage.jsx # จัดการคาบเรียน
│   │       ├── QRDisplayPage.jsx         # หน้าจอแสดง QR Code แบบขยาย
│   │       ├── AttendanceListPage.jsx    # ตารางเช็คชื่อ & ปรับสถานะ
│   │       └── AttendanceReportPage.jsx  # รายงานสรุปเข้าเรียน
│   ├── services/
│   │   ├── storageService.js       # CRUD จัดการ LocalStorage
│   │   └── attendanceService.js    # Logic ตรวจสอบการเช็คชื่อ & คำนวณสถานะ
│   ├── utils/
│   │   ├── codeGenerator.js        # สุ่มรหัส Session
│   │   └── formatters.js           # แปลงวันที่/เวลาภาษาไทย
│   ├── App.jsx                     # เส้นทาง Routing ทั้งหมด
│   ├── main.jsx                    # จุดเริ่มต้นแอปพลิเคชัน
│   └── index.css                   # Tailwind CSS & Styles Global
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

---

## 💾 5. Data Model & LocalStorage Schema

ระบบใช้ LocalStorage 4 Collections ดังนี้:

### 1) Courses (`qr_attendance_courses`)
```json
{
  "id": "course-001",
  "course_code": "EN-013-333",
  "course_name": "Software Engineering (วิศวกรรมซอฟต์แวร์)",
  "section": "1",
  "semester": "1",
  "academic_year": "2026",
  "teacher_name": "ดร.สมชาย ใจดี",
  "created_at": "2026-09-01T08:00:00.000Z"
}
```

### 2) Students (`qr_attendance_students`)
```json
{
  "id": "std-001",
  "student_id": "65011001",
  "full_name": "นายสมศักดิ์ เรียนดี",
  "email": "somsak.r@univ.ac.th",
  "course_id": "course-001",
  "created_at": "2026-09-01T08:30:00.000Z"
}
```

### 3) Attendance Sessions (`qr_attendance_sessions`)
```json
{
  "id": "session-001",
  "course_id": "course-001",
  "session_title": "สัปดาห์ที่ 1 - Introduction & Requirements",
  "session_code": "SE333-8F2K",
  "session_date": "2026-09-24",
  "start_time": "08:00",
  "end_time": "10:00",
  "late_after_minutes": 15,
  "status": "Open",
  "created_at": "2026-09-24T07:50:00.000Z"
}
```

### 4) Attendance Records (`qr_attendance_records`)
```json
{
  "id": "rec-001",
  "session_id": "session-001",
  "course_id": "course-001",
  "student_id": "65011001",
  "student_name": "นายสมศักดิ์ เรียนดี",
  "checkin_time": "2026-09-24T08:04:12.000Z",
  "status": "Present",
  "checkin_method": "QR Code",
  "note": "",
  "created_at": "2026-09-24T08:04:12.000Z"
}
```

---

## 📱 6. QR Code Check-in Workflow

1. เมื่ออาจารย์สร้างคาบเรียน ระบบจะสร้างรหัส Session สุ่ม เช่น `SE333-8F2K`
2. บนหน้า **QR Display Page** ระบบจะสร้าง URL แบบไดนามิกผ่าน:
   ```javascript
   const qrUrl = `${window.location.origin}/student-checkin?session=${encodeURIComponent(session.session_code)}`;
   ```
   *ทำให้ใช้งานได้ทั้งในเครื่อง Localhost และเมื่อนำขึ้น Vercel โดยไม่ต้องแก้โค้ด*
3. เมื่อสแกนด้วยกล้องมือถือ ลิงก์จะเปิดหน้า `/student-checkin?session=SE333-8F2K`
4. หน้าเช็คชื่ออ่านค่ารหัส `session` จาก Query Parameter แล้วเติมช่องรหัส Session ให้อัตโนมัติ

---

## 🛡️ 7. Business Validation & Duplicate Prevention

เมื่อนักศึกษากดปุ่ม "เช็คชื่อเข้าเรียน":
1. **Validate Session**: ตรวจสอบว่ามี Session รหัสนี้ในระบบหรือไม่
2. **Validate Open Status**: ตรวจสอบว่าคาบเรียนยังคงเปิดอยู่ (`status === 'Open'`) หรือไม่
3. **Validate Course Registration**: ดึงรายชื่อนักศึกษาในวิชานั้น (Source of Truth) และตรวจสอบว่ารหัสนักศึกษานี้ลงทะเบียนไว้หรือไม่
4. **Prevent Duplicate Check-in**: ค้นหาใน `qr_attendance_records` หากพบว่ารหัสนักศึกษานี้เช็คชื่อใน `session_id` นี้ไปแล้ว จะปฏิเสธการเช็คชื่อซ้ำทันที
5. **Determine Status (Present / Late / Absent)**:
   - `Late Cutoff Time` = `session.start_time` + `session.late_after_minutes`
   - หากเวลาปัจจุบัน $\le$ `Late Cutoff Time` $\rightarrow$ **มาเรียน (Present)**
   - หากเวลาปัจจุบัน $>$ `Late Cutoff Time` $\rightarrow$ **มาสาย (Late)**
   - หากนักศึกษายังไม่ได้เช็คชื่อในคาบเรียน $\rightarrow$ **ขาดเรียน (Absent)** (คำนวณเปรียบเทียบจาก Course Roster อัตโนมัติ)

---

## 📷 8. Screenshots (ภาพหน้าจอระบบ)

### 1) Teacher Dashboard & Portal Overview
![Teacher Dashboard](https://raw.githubusercontent.com/placeholder/dashboard.png)
*แผงควบคุมอาจารย์ แสดงสรุปสถิติจำนวนรายวิชา นักศึกษา คาบเรียน อัตราการเข้าเรียน และกิจกรรมเช็คชื่อล่าสุดแบบ Real-time*

### 2) QR Code Display Screen for Projectors
![QR Code Display](https://raw.githubusercontent.com/placeholder/qr-display.png)
*หน้าจอแสดง QR Code แบบไดนามิก พร้อมรหัส Session 8 หลัก สถิตินักศึกษาเช็คชื่อสดข้ามเบราว์เซอร์ และปุ่ม Fullscreen*

### 3) Student Responsive Check-in Portal
![Student Check-in](https://raw.githubusercontent.com/placeholder/student-checkin.png)
*หน้าเช็คชื่อสำหรับนักศึกษาบนมือถือ ป้อนรหัส Session อัตโนมัติจากการสแกน QR พร้อมแจ้งผล Present / Late และพลุกระดาษ*

### 4) Attendance Roster & Manual Status Override
![Attendance Roster](https://raw.githubusercontent.com/placeholder/attendance-list.png)
*ตารางเช็คชื่อแสดงรายชื่อนักศึกษาครบทุกคนในวิชา จับคู่สถานะ Absent อัตโนมัติ และปุ่มแก้ไขปรับสถานะ/ใส่หมายเหตุย้อนหลัง*

---

## 🎯 9. Sample Data & Presentation Scenario

ระบบมาพร้อมข้อมูลตัวอย่างเริ่มต้น (Initial Seed Data):
- **2 รายวิชา**: Software Engineering (EN-013-333) และ Database Systems (EN-013-301)
- **10 นักศึกษา**: รายชื่อและรหัสนักศึกษาไทยสมจริง (`65011001` - `65011006` และ `65022001` - `65022004`)
- **3 คาบเรียน**: คาบเปิดใช้งานปัจจุบัน 2 คาบ และคาบย้อนหลัง 1 คาบ
- **ประวัติการเช็คชื่อ**: ครบทั้ง 3 สถานะ (**Present**, **Late**, **Absent**)

### 🧪 ขั้นตอนการทดสอบนำเสนอ (Presentation Demo Scenario):
1. เข้าไปที่ **"จัดการนักศึกษา"** เลือกวิชา SE333 สังเกตว่ามีนักศึกษา 6 คน
2. เข้าไปที่ **"คาบเรียน & QR Code"** กดสร้างคาบเรียนใหม่ "สัปดาห์ที่ 3 - Software Testing"
3. กด **"เปิดหน้าจอ QR Code"** สังเกตว่านักศึกษาทั้ง 6 คน ถูกแสดงสถานะ **ขาดเรียน (Absent)** 0%
4. เปิดอีกแท็บไปที่หน้า **"นักศึกษาเช็คชื่อ"**:
   - เช็คชื่อคนที่ 1 (`65011001` - นายสมศักดิ์) $\rightarrow$ ขึ้นสถานะ **มาเรียน (Present)**
   - เช็คชื่อคนที่ 2 (`65011002` - นางสาวกนกวรรณ) $\rightarrow$ ขึ้นสถานะ **มาเรียน (Present)**
   - ลองเช็คชื่อคนที่ 1 ซ้ำ $\rightarrow$ ระบบแจ้งเตือนว่าเช็คชื่อไปแล้ว
5. สลับกลับมาดูแท็บอาจารย์ หน้าตารางเช็คชื่อจะอัปเดตทันที:
   - นายสมศักดิ์: มาเรียน
   - นางสาวกนกวรรณ: มาเรียน
   - นักศึกษาคนที่ 3-6: **ขาดเรียน (Absent)** (จับคู่จากรายชื่อในวิชาอัตโนมัติ)
6. อาจารย์กดแก้ไขสถานะของคนที่ 3 จาก ขาดเรียน เป็น **มาสาย** ย้อนหลังได้ทันที

---

## 🚀 10. Installation & Running Locally (การติดตั้งและใช้งาน)

### Prerequisites
- Node.js (v18.x หรือใหม่กว่า)
- npm หรือ yarn

### Steps
1. **แตกไฟล์ / Clone โปรเจกต์**:
   ```bash
   cd "Class Attendance QR Check-in System"
   ```
2. **ติดตั้ง Dependencies**:
   ```bash
   npm install
   ```
3. **รัน Development Server**:
   ```bash
   npm run dev
   ```
4. **เปิดเบราว์เซอร์เข้าใช้งาน**:
   - URL: `http://localhost:5173`

---

## ☁️ 11. Deployment Instructions (Vercel)

โปรเจกต์นี้พร้อมสำหรับการ Deploy ขึ้น **Vercel** ทันที:
1. Push โค้ดขึ้น GitHub Repository
2. เข้าเว็บไซต์ [Vercel](https://vercel.com) แล้วกด **Add New Project**
3. เลือกรีโพซิโทรี `Class Attendance QR Check-in System`
4. ปล่อยค่า Build Settings เป็น Default (Vite)
5. กด **Deploy**

---

## 🤖 12. AI Tools Used During Development

- **Google Antigravity AI Assistant**: Lead Software Engineer & System Analyst สำหรับออกแบบสถาปัตยกรรมข้อมูล, เขียนโค้ด React, พัฒนา UI/UX, และทดสอบระบบตามข้อกำหนด SRS
