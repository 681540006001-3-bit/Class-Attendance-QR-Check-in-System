export const initialCourses = [
  {
    id: "course-001",
    course_code: "EN-013-333",
    course_name: "Software Engineering (วิศวกรรมซอฟต์แวร์)",
    section: "1",
    semester: "1",
    academic_year: "2026",
    teacher_name: "ดร.สมชาย ใจดี",
    created_at: "2026-09-01T08:00:00.000Z"
  },
  {
    id: "course-002",
    course_code: "EN-013-301",
    course_name: "Database Systems (ระบบฐานข้อมูล)",
    section: "2",
    semester: "1",
    academic_year: "2026",
    teacher_name: "ผศ.ดร.วิภาดา มีสุข",
    created_at: "2026-09-01T09:00:00.000Z"
  }
];

export const initialStudents = [
  // Course 001 Students
  {
    id: "std-001",
    student_id: "65011001",
    full_name: "นายสมศักดิ์ เรียนดี",
    email: "somsak.r@univ.ac.th",
    course_id: "course-001",
    created_at: "2026-09-01T08:30:00.000Z"
  },
  {
    id: "std-002",
    student_id: "65011002",
    full_name: "นางสาวกนกวรรณ สุขเสริฐ",
    email: "kanokwan.s@univ.ac.th",
    course_id: "course-001",
    created_at: "2026-09-01T08:35:00.000Z"
  },
  {
    id: "std-003",
    student_id: "65011003",
    full_name: "นายชยพล บุญมี",
    email: "chayapol.b@univ.ac.th",
    course_id: "course-001",
    created_at: "2026-09-01T08:40:00.000Z"
  },
  {
    id: "std-004",
    student_id: "65011004",
    full_name: "นางสาวณิชาภัทร เด่นดวง",
    email: "nichapat.d@univ.ac.th",
    course_id: "course-001",
    created_at: "2026-09-01T08:45:00.000Z"
  },
  {
    id: "std-005",
    student_id: "65011005",
    full_name: "นายธนกฤต มั่นคง",
    email: "thanakrit.m@univ.ac.th",
    course_id: "course-001",
    created_at: "2026-09-01T08:50:00.000Z"
  },
  {
    id: "std-006",
    student_id: "65011006",
    full_name: "นางสาวปิยธิดา วงศ์สว่าง",
    email: "piyathida.w@univ.ac.th",
    course_id: "course-001",
    created_at: "2026-09-01T08:55:00.000Z"
  },

  // Course 002 Students
  {
    id: "std-007",
    student_id: "65022001",
    full_name: "นายพงศธร รัตนอุบล",
    email: "pongsathorn.r@univ.ac.th",
    course_id: "course-002",
    created_at: "2026-09-01T09:10:00.000Z"
  },
  {
    id: "std-008",
    student_id: "65022002",
    full_name: "นางสาวภาวิณี เจริญจิต",
    email: "pawinee.c@univ.ac.th",
    course_id: "course-002",
    created_at: "2026-09-01T09:15:00.000Z"
  },
  {
    id: "std-009",
    student_id: "65022003",
    full_name: "นายวรเมธ คงเจริญ",
    email: "worameth.k@univ.ac.th",
    course_id: "course-002",
    created_at: "2026-09-01T09:20:00.000Z"
  },
  {
    id: "std-010",
    student_id: "65022004",
    full_name: "นางสาวศิริพร บุญเหลือ",
    email: "siriporn.b@univ.ac.th",
    course_id: "course-002",
    created_at: "2026-09-01T09:25:00.000Z"
  }
];

export const initialSessions = [
  {
    id: "session-001",
    course_id: "course-001",
    session_title: "สัปดาห์ที่ 1 - Introduction & Requirements",
    session_code: "SE333-8F2K",
    session_date: "2026-09-24",
    start_time: "08:00",
    end_time: "10:00",
    late_after_minutes: 15,
    status: "Open",
    created_at: "2026-09-24T07:50:00.000Z"
  },
  {
    id: "session-002",
    course_id: "course-001",
    session_title: "สัปดาห์ที่ 2 - System Design & Architecture",
    session_code: "SE333-9A1B",
    session_date: "2026-09-17",
    start_time: "08:00",
    end_time: "10:00",
    late_after_minutes: 15,
    status: "Closed",
    created_at: "2026-09-17T07:50:00.000Z"
  },
  {
    id: "session-003",
    course_id: "course-002",
    session_title: "สัปดาห์ที่ 1 - Entity-Relationship Diagram (ERD)",
    session_code: "DB301-3X7Y",
    session_date: "2026-09-23",
    start_time: "13:00",
    end_time: "15:00",
    late_after_minutes: 15,
    status: "Open",
    created_at: "2026-09-23T12:50:00.000Z"
  }
];

export const initialRecords = [
  // Session 002 (Closed past session) records
  {
    id: "rec-001",
    session_id: "session-002",
    course_id: "course-001",
    student_id: "65011001",
    student_name: "นายสมศักดิ์ เรียนดี",
    checkin_time: "2026-09-17T08:05:12.000Z",
    status: "Present",
    checkin_method: "QR Code",
    note: "",
    created_at: "2026-09-17T08:05:12.000Z"
  },
  {
    id: "rec-002",
    session_id: "session-002",
    course_id: "course-001",
    student_id: "65011002",
    student_name: "นางสาวกนกวรรณ สุขเสริฐ",
    checkin_time: "2026-09-17T08:22:40.000Z",
    status: "Late",
    checkin_method: "Session Code",
    note: "มาสายเนื่องจากรถติด",
    created_at: "2026-09-17T08:22:40.000Z"
  },
  {
    id: "rec-003",
    session_id: "session-002",
    course_id: "course-001",
    student_id: "65011003",
    student_name: "นายชยพล บุญมี",
    checkin_time: "2026-09-17T08:09:15.000Z",
    status: "Present",
    checkin_method: "QR Code",
    note: "",
    created_at: "2026-09-17T08:09:15.000Z"
  },
  {
    id: "rec-004",
    session_id: "session-002",
    course_id: "course-001",
    student_id: "65011004",
    student_name: "นางสาวณิชาภัทร เด่นดวง",
    checkin_time: "2026-09-17T08:02:11.000Z",
    status: "Present",
    checkin_method: "QR Code",
    note: "",
    created_at: "2026-09-17T08:02:11.000Z"
  },

  // Session 001 (Active session today) records
  {
    id: "rec-005",
    session_id: "session-001",
    course_id: "course-001",
    student_id: "65011001",
    student_name: "นายสมศักดิ์ เรียนดี",
    checkin_time: "2026-09-24T08:04:12.000Z",
    status: "Present",
    checkin_method: "QR Code",
    note: "",
    created_at: "2026-09-24T08:04:12.000Z"
  },
  {
    id: "rec-006",
    session_id: "session-001",
    course_id: "course-001",
    student_id: "65011002",
    student_name: "นางสาวกนกวรรณ สุขเสริฐ",
    checkin_time: "2026-09-24T08:18:45.000Z",
    status: "Late",
    checkin_method: "Session Code",
    note: "",
    created_at: "2026-09-24T08:18:45.000Z"
  }
];
