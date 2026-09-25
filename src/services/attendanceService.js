import {
  getSessions,
  getSessionByCode,
  getSessionById,
  getSessionsByCourse,
  getStudentsByCourse,
  getAttendanceRecordsBySession,
  addAttendanceRecord,
  updateAttendanceRecord,
  getCourses
} from './storageService.js';
import { generateId } from '../utils/codeGenerator.js';

/**
 * Returns merged attendance data for a session by matching Course Roster (Source of Truth)
 * against existing Attendance Records. Unrecorded students receive status "Absent".
 */
export const getMergedSessionAttendance = (sessionId) => {
  const session = getSessionById(sessionId);
  if (!session) return { session: null, records: [] };

  const courseStudents = getStudentsByCourse(session.course_id);
  const existingRecords = getAttendanceRecordsBySession(sessionId);

  const mergedList = courseStudents.map((student) => {
    // Match by student_id (case-insensitive & trimmed) or internal ID
    const cleanStudentId = student.student_id.trim().toLowerCase();
    const record = existingRecords.find(
      (r) => r.student_id.trim().toLowerCase() === cleanStudentId || r.student_id === student.id
    );

    if (record) {
      return {
        student_db_id: student.id,
        student_id: student.student_id,
        full_name: student.full_name,
        email: student.email,
        record_id: record.id,
        status: record.status || 'Present',
        checkin_time: record.checkin_time,
        checkin_method: record.checkin_method || 'QR Code',
        note: record.note || '',
        has_record: true
      };
    } else {
      return {
        student_db_id: student.id,
        student_id: student.student_id,
        full_name: student.full_name,
        email: student.email,
        record_id: null,
        status: 'Absent',
        checkin_time: null,
        checkin_method: null,
        note: '',
        has_record: false
      };
    }
  });

  return { session, records: mergedList };
};

/**
 * Core student check-in processing business logic.
 */
export const processStudentCheckin = ({ sessionCode, studentId, fullName, checkinMethod = 'QR Code' }) => {
  // 1. Required field validation
  if (!sessionCode || !sessionCode.trim()) {
    return { success: false, error: 'กรุณากรอกรหัส Session (Session Code is required)' };
  }
  if (!studentId || !studentId.trim()) {
    return { success: false, error: 'กรุณากรอกรหัสนักศึกษา (Student ID is required)' };
  }
  if (!fullName || !fullName.trim()) {
    return { success: false, error: 'กรุณากรอกชื่อ-นามสกุล (Full Name is required)' };
  }

  const cleanSessionCode = sessionCode.trim().toUpperCase();
  const cleanStudentId = studentId.trim();

  // 2. Validate Session Existence
  const session = getSessionByCode(cleanSessionCode);
  if (!session) {
    return { success: false, error: `ไม่พบรหัส Session "${cleanSessionCode}" ในระบบ กรุณาตรวจสอบอีกครั้ง` };
  }

  // 3. Validate Session Status
  if (session.status !== 'Open') {
    const statusMessage = session.status === 'Closed' ? 'ปิดการเช็คชื่อแล้ว' : 'ถูกยกเลิกแล้ว';
    return { success: false, error: `Session "${session.session_title}" ${statusMessage} ไม่สามารถเช็คชื่อได้` };
  }

  // 4. Validate Student Registration in Course Roster (Source of Truth)
  const courseStudents = getStudentsByCourse(session.course_id);
  const registeredStudent = courseStudents.find(
    (s) => s.student_id.trim().toLowerCase() === cleanStudentId.toLowerCase()
  );

  if (!registeredStudent) {
    return {
      success: false,
      error: `ไม่พบรหัสนักศึกษา "${cleanStudentId}" ในรายวิชานี้ กรุณาตรวจสอบรหัสนักศึกษาหรือติดต่ออาจารย์ผู้สอน`
    };
  }

  // 5. Check Duplicate Check-in
  const existingRecords = getAttendanceRecordsBySession(session.id);
  const duplicate = existingRecords.find(
    (r) => r.student_id.trim().toLowerCase() === cleanStudentId.toLowerCase()
  );

  if (duplicate) {
    return {
      success: false,
      error: `นักศึกษา ${registeredStudent.full_name} (${cleanStudentId}) ได้เช็คชื่อใน Session นี้เรียบร้อยแล้ว ไม่สามารถเช็คชื่อซ้ำได้`
    };
  }

  // 6. Determine Present vs Late Status
  // Session Start Time Construction (Timezone safe using local year/month/day)
  let sessionDateParts = (session.session_date || '').split('-').map(Number);
  if (sessionDateParts.length !== 3) {
    const today = new Date();
    sessionDateParts = [today.getFullYear(), today.getMonth() + 1, today.getDate()];
  }
  const [year, month, day] = sessionDateParts;
  const [startHour, startMinute] = (session.start_time || '08:00').split(':').map(Number);
  
  const sessionStart = new Date(year, month - 1, day, startHour, startMinute, 0, 0);
  const lateCutoffTime = new Date(
    sessionStart.getTime() + (Number(session.late_after_minutes) || 15) * 60 * 1000
  );

  const now = new Date();
  let calculatedStatus = 'Present';

  // If check-in occurs after late cutoff time
  if (now > lateCutoffTime) {
    calculatedStatus = 'Late';
  }

  // 7. Create Attendance Record
  const newRecord = {
    id: generateId('rec'),
    session_id: session.id,
    course_id: session.course_id,
    student_id: registeredStudent.student_id,
    student_name: registeredStudent.full_name,
    checkin_time: now.toISOString(),
    status: calculatedStatus,
    checkin_method: checkinMethod,
    note: '',
    created_at: now.toISOString()
  };

  const savedRecord = addAttendanceRecord(newRecord);

  return {
    success: true,
    record: savedRecord,
    status: calculatedStatus,
    studentName: registeredStudent.full_name,
    sessionTitle: session.session_title,
    checkinTime: now.toISOString(),
    message: `เช็คชื่อสำเร็จ! สถานะ: ${calculatedStatus === 'Present' ? 'มาเรียน (ตรงเวลา)' : 'มาสาย'}`
  };
};

/**
 * Allows Teacher to manually update a student's attendance status (Present / Late / Absent).
 */
export const updateStudentAttendanceStatus = ({ sessionId, studentId, studentName, newStatus, note = '' }) => {
  const session = getSessionById(sessionId);
  if (!session) return null;

  const existingRecords = getAttendanceRecordsBySession(sessionId);
  const cleanId = studentId.trim().toLowerCase();
  const existingRecord = existingRecords.find((r) => r.student_id.trim().toLowerCase() === cleanId);

  if (existingRecord) {
    return updateAttendanceRecord(existingRecord.id, {
      status: newStatus,
      note: note,
      updated_at: new Date().toISOString()
    });
  } else {
    // If student was implicitly Absent, create an explicit record
    const newRecord = {
      id: generateId('rec'),
      session_id: sessionId,
      course_id: session.course_id,
      student_id: studentId,
      student_name: studentName,
      checkin_time: new Date().toISOString(),
      status: newStatus,
      checkin_method: 'Manual Teacher Override',
      note: note,
      created_at: new Date().toISOString()
    };
    return addAttendanceRecord(newRecord);
  }
};

/**
 * Calculates Dashboard Global Statistics.
 */
export const getDashboardStats = () => {
  const courses = getCourses();
  const allSessions = getSessions();
  
  // Aggregate stats across all sessions using course roster as source of truth
  let totalStudentsCount = 0;
  let totalPresentCount = 0;
  let totalLateCount = 0;
  let totalAbsentCount = 0;

  // Total unique students across all courses
  courses.forEach(c => {
    const students = getStudentsByCourse(c.id);
    totalStudentsCount += students.length;
  });

  allSessions.forEach(session => {
    const { records } = getMergedSessionAttendance(session.id);
    records.forEach(r => {
      if (r.status === 'Present') totalPresentCount++;
      else if (r.status === 'Late') totalLateCount++;
      else totalAbsentCount++;
    });
  });

  return {
    totalCourses: courses.length,
    totalStudents: totalStudentsCount,
    totalSessions: allSessions.length,
    totalPresent: totalPresentCount,
    totalLate: totalLateCount,
    totalAbsent: totalAbsentCount
  };
};

/**
 * Calculates Summary Report per Session for a given course.
 */
export const getSessionAttendanceReports = (courseId) => {
  const sessions = getSessionsByCourse(courseId);
  const courseStudents = getStudentsByCourse(courseId);
  const totalCourseStudents = courseStudents.length;

  return sessions.map((session) => {
    const { records } = getMergedSessionAttendance(session.id);
    const present = records.filter(r => r.status === 'Present').length;
    const late = records.filter(r => r.status === 'Late').length;
    const absent = records.filter(r => r.status === 'Absent').length;
    const totalCount = totalCourseStudents || records.length;
    const attendancePercentage = totalCount > 0 ? Math.round(((present + late) / totalCount) * 100) : 0;

    return {
      sessionId: session.id,
      sessionTitle: session.session_title,
      sessionCode: session.session_code,
      sessionDate: session.session_date,
      status: session.status,
      totalStudents: totalCount,
      presentCount: present,
      lateCount: late,
      absentCount: absent,
      attendanceRate: attendancePercentage
    };
  });
};

/**
 * Calculates Summary Report per Student for a given course.
 */
export const getStudentAttendanceReports = (courseId) => {
  const courseStudents = getStudentsByCourse(courseId);
  const sessions = getSessionsByCourse(courseId);
  const totalSessions = sessions.length;

  return courseStudents.map((student) => {
    let presentCount = 0;
    let lateCount = 0;
    let absentCount = 0;

    sessions.forEach((session) => {
      const { records } = getMergedSessionAttendance(session.id);
      const studentRec = records.find(r => r.student_id === student.student_id);
      if (studentRec) {
        if (studentRec.status === 'Present') presentCount++;
        else if (studentRec.status === 'Late') lateCount++;
        else absentCount++;
      } else {
        absentCount++;
      }
    });

    const attendedCount = presentCount + lateCount;
    const attendancePercentage = totalSessions > 0 ? Math.round((attendedCount / totalSessions) * 100) : 0;

    return {
      studentDbId: student.id,
      studentId: student.student_id,
      fullName: student.full_name,
      email: student.email,
      totalSessions,
      presentCount,
      lateCount,
      absentCount,
      attendanceRate: attendancePercentage
    };
  });
};
