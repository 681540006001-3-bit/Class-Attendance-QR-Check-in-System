import {
  initStorage,
  getCourses,
  addCourse,
  updateCourse,
  deleteCourse,
  getStudents,
  getStudentsByCourse,
  addStudent,
  updateStudent,
  deleteStudent,
  getSessions,
  getSessionsByCourse,
  addSession,
  updateSession,
  deleteSession,
  getAttendanceRecords
} from '../src/services/storageService.js';

import {
  getMergedSessionAttendance,
  processStudentCheckin,
  updateStudentAttendanceStatus,
  getDashboardStats,
  getSessionAttendanceReports,
  getStudentAttendanceReports
} from '../src/services/attendanceService.js';

import { getTodayLocalDate } from '../src/utils/formatters.js';

// Global localStorage mock for Node.js
class LocalStorageMock {
  constructor() {
    this.store = {};
  }
  clear() {
    this.store = {};
  }
  getItem(key) {
    return this.store[key] || null;
  }
  setItem(key, value) {
    this.store[key] = String(value);
  }
  removeItem(key) {
    delete this.store[key];
  }
}

global.localStorage = new LocalStorageMock();
global.window = {
  dispatchEvent: () => {}
};

console.log("==========================================");
console.log("STARTING AUTOMATED FUNCTIONAL AUDIT TEST");
console.log("==========================================");

let passedCount = 0;
let failedCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✅ [PASS] ${message}`);
    passedCount++;
  } else {
    console.error(`❌ [FAIL] ${message}`);
    failedCount++;
  }
}

// 1. Initialize Storage
initStorage();
assert(getCourses().length > 0, "Initial courses seeded successfully");
assert(getStudents().length > 0, "Initial students seeded successfully");
assert(getSessions().length > 0, "Initial sessions seeded successfully");

// 2. Course CRUD
const testCourse = addCourse({
  id: "test-course-101",
  course_code: "TEST-101",
  course_name: "Software Testing & QA",
  section: "1",
  semester: "1",
  academic_year: "2026",
  teacher_name: "ดร.ทดสอบ ระบบ"
});
assert(getCourses().some(c => c.id === "test-course-101"), "Course TEST-101 created");

updateCourse("test-course-101", { course_name: "Software Testing & QA (Updated)" });
assert(getCourses().find(c => c.id === "test-course-101").course_name.includes("Updated"), "Course TEST-101 updated");

// 3. Student CRUD
const std1 = addStudent({
  id: "test-std-001",
  student_id: "65010001",
  full_name: "นายกิตติศักดิ์ สุขใจ",
  course_id: "test-course-101"
});
const std2 = addStudent({
  id: "test-std-002",
  student_id: "65010002",
  full_name: "นางสาวสุภาพร เด่นดวง",
  course_id: "test-course-101"
});
const std3 = addStudent({
  id: "test-std-003",
  student_id: "65010003",
  full_name: "นายณัฐวุฒิ เรียนดี",
  course_id: "test-course-101"
});

assert(getStudentsByCourse("test-course-101").length === 3, "Added 3 students to TEST-101");

// 4. Session Creation & Unique Code Validation
const now = new Date();
const currentHourStr = String(now.getHours()).padStart(2, '0') + ':00';

const testSession = addSession({
  id: "test-sess-101",
  course_id: "test-course-101",
  session_title: "สัปดาห์ที่ 1 - Unit Testing",
  session_code: "TEST-9X2Y",
  session_date: getTodayLocalDate(),
  start_time: currentHourStr,
  end_time: "23:59",
  late_after_minutes: 120, // 2 hours window -> Present
  status: "Open"
});
assert(getSessionAttendanceReports("test-course-101").length === 1, "Session TEST-9X2Y created");

// 5. Student 1 Check-in (On-time -> Present)
const checkin1 = processStudentCheckin({
  sessionCode: "TEST-9X2Y",
  studentId: "65010001",
  fullName: "นายกิตติศักดิ์ สุขใจ"
});
assert(checkin1.success && checkin1.status === "Present", `Student 1 check-in on-time -> Present (actual: ${checkin1.status})`);

// 6. Student 2 Check-in (Late cutoff test)
// Update session start time to 3 hours ago so checking in now is past cutoff
const pastHourStr = String(Math.max(0, now.getHours() - 3)).padStart(2, '0') + ':00';
updateSession("test-sess-101", { start_time: pastHourStr, late_after_minutes: 15 });

const checkin2 = processStudentCheckin({
  sessionCode: "TEST-9X2Y",
  studentId: "65010002",
  fullName: "นางสาวสุภาพร เด่นดวง"
});
assert(checkin2.success && checkin2.status === "Late", `Student 2 check-in after cutoff -> Late (actual: ${checkin2.status})`);

// 7. Duplicate Check-in Prevention
const duplicateCheck = processStudentCheckin({
  sessionCode: "TEST-9X2Y",
  studentId: "65010001",
  fullName: "นายกิตติศักดิ์ สุขใจ"
});
assert(!duplicateCheck.success && duplicateCheck.error.includes("เรียบร้อยแล้ว"), "Duplicate check-in rejected correctly");

// 8. Unregistered Student Rejection
const unregisteredCheck = processStudentCheckin({
  sessionCode: "TEST-9X2Y",
  studentId: "65099999",
  fullName: "นายแปลก หน้า"
});
assert(!unregisteredCheck.success && unregisteredCheck.error.includes("ไม่พบรหัสนักศึกษา"), "Unregistered student check-in rejected");

// 9. Merged Roster Attendance & Absent Matching
const mergedData = getMergedSessionAttendance("test-sess-101");
const records = mergedData.records;
const recStd1 = records.find(r => r.student_id === "65010001");
const recStd2 = records.find(r => r.student_id === "65010002");
const recStd3 = records.find(r => r.student_id === "65010003");

assert(recStd1.status === "Present", "Merged Roster: Student 1 is Present");
assert(recStd2.status === "Late", "Merged Roster: Student 2 is Late");
assert(recStd3.status === "Absent", "Merged Roster: Student 3 (unrecorded) is Absent");

// 10. Teacher Manual Override (Student 3: Absent -> Present)
updateStudentAttendanceStatus({
  sessionId: "test-sess-101",
  studentId: "65010003",
  studentName: "นายณัฐวุฒิ เรียนดี",
  newStatus: "Present",
  note: "อาจารย์ปรับสถานะเป็นมาเรียน"
});

const updatedMerged = getMergedSessionAttendance("test-sess-101");
const upPresent = updatedMerged.records.filter(r => r.status === "Present").length;
const upLate = updatedMerged.records.filter(r => r.status === "Late").length;
const upAbsent = updatedMerged.records.filter(r => r.status === "Absent").length;

assert(upPresent === 2, `Teacher override: Present count is 2 (actual: ${upPresent})`);
assert(upLate === 1, `Teacher override: Late count is 1 (actual: ${upLate})`);
assert(upAbsent === 0, `Teacher override: Absent count is 0 (actual: ${upAbsent})`);

// 11. Student Cascade Deletion Test
deleteStudent("test-std-001");
assert(getStudentsByCourse("test-course-101").length === 2, "Student std-001 deleted from course");
const recsAfterDelete = getAttendanceRecords().filter(r => r.student_id === "65010001");
assert(recsAfterDelete.length === 0, "Student std-001 attendance records cascade deleted");

// Clean up test course
deleteCourse("test-course-101");
assert(getCourses().find(c => c.id === "test-course-101") === undefined, "Course TEST-101 cleanly deleted");

console.log("==========================================");
console.log(`TEST SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED`);
console.log("==========================================");

if (failedCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
