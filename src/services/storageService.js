import { initialCourses, initialStudents, initialSessions, initialRecords } from '../data/initialSeedData.js';

const KEYS = {
  COURSES: 'qr_attendance_courses',
  STUDENTS: 'qr_attendance_students',
  SESSIONS: 'qr_attendance_sessions',
  RECORDS: 'qr_attendance_records',
};

/**
 * Initializes LocalStorage with seed data if keys are empty.
 */
export const initStorage = () => {
  if (!localStorage.getItem(KEYS.COURSES)) {
    localStorage.setItem(KEYS.COURSES, JSON.stringify(initialCourses));
  }
  if (!localStorage.getItem(KEYS.STUDENTS)) {
    localStorage.setItem(KEYS.STUDENTS, JSON.stringify(initialStudents));
  }
  if (!localStorage.getItem(KEYS.SESSIONS)) {
    localStorage.setItem(KEYS.SESSIONS, JSON.stringify(initialSessions));
  }
  if (!localStorage.getItem(KEYS.RECORDS)) {
    localStorage.setItem(KEYS.RECORDS, JSON.stringify(initialRecords));
  }
};

/**
 * Reset storage back to initial seed state (Useful for testing & demo presentation).
 */
export const resetStorageToSeed = () => {
  localStorage.setItem(KEYS.COURSES, JSON.stringify(initialCourses));
  localStorage.setItem(KEYS.STUDENTS, JSON.stringify(initialStudents));
  localStorage.setItem(KEYS.SESSIONS, JSON.stringify(initialSessions));
  localStorage.setItem(KEYS.RECORDS, JSON.stringify(initialRecords));
  window.dispatchEvent(new Event('storage'));
};

// ==========================================
// COURSE CRUD
// ==========================================
export const getCourses = () => {
  initStorage();
  try {
    return JSON.parse(localStorage.getItem(KEYS.COURSES)) || [];
  } catch (e) {
    console.error("Error reading courses from LocalStorage", e);
    return [];
  }
};

export const saveCourses = (courses) => {
  localStorage.setItem(KEYS.COURSES, JSON.stringify(courses));
  window.dispatchEvent(new Event('storage'));
};

export const addCourse = (course) => {
  const courses = getCourses();
  const newCourse = {
    ...course,
    created_at: new Date().toISOString()
  };
  courses.unshift(newCourse);
  saveCourses(courses);
  return newCourse;
};

export const updateCourse = (id, updatedData) => {
  const courses = getCourses();
  const index = courses.findIndex(c => c.id === id);
  if (index !== -1) {
    courses[index] = { ...courses[index], ...updatedData };
    saveCourses(courses);
    return courses[index];
  }
  return null;
};

export const deleteCourse = (id) => {
  const courses = getCourses().filter(c => c.id !== id);
  saveCourses(courses);

  // Also cascade delete related students, sessions, records
  const students = getStudents().filter(s => s.course_id !== id);
  saveStudents(students);

  const sessions = getSessions();
  const sessionIdsToDelete = sessions.filter(s => s.course_id === id).map(s => s.id);
  saveSessions(sessions.filter(s => s.course_id !== id));

  const records = getAttendanceRecords().filter(r => r.course_id !== id && !sessionIdsToDelete.includes(r.session_id));
  saveAttendanceRecords(records);
};

// ==========================================
// STUDENT CRUD
// ==========================================
export const getStudents = () => {
  initStorage();
  try {
    return JSON.parse(localStorage.getItem(KEYS.STUDENTS)) || [];
  } catch (e) {
    console.error("Error reading students from LocalStorage", e);
    return [];
  }
};

export const getStudentsByCourse = (courseId) => {
  return getStudents().filter(s => s.course_id === courseId);
};

export const saveStudents = (students) => {
  localStorage.setItem(KEYS.STUDENTS, JSON.stringify(students));
  window.dispatchEvent(new Event('storage'));
};

export const addStudent = (student) => {
  const students = getStudents();
  const newStudent = {
    ...student,
    created_at: new Date().toISOString()
  };
  students.unshift(newStudent);
  saveStudents(students);
  return newStudent;
};

export const updateStudent = (id, updatedData) => {
  const students = getStudents();
  const index = students.findIndex(s => s.id === id);
  if (index !== -1) {
    students[index] = { ...students[index], ...updatedData };
    saveStudents(students);
    return students[index];
  }
  return null;
};

export const deleteStudent = (id) => {
  const allStudents = getStudents();
  const targetStudent = allStudents.find(s => s.id === id);
  const remainingStudents = allStudents.filter(s => s.id !== id);
  saveStudents(remainingStudents);

  // Cascade delete attendance records for this student by student_id or internal id
  if (targetStudent) {
    const remainingRecords = getAttendanceRecords().filter(
      r => r.student_id.trim().toLowerCase() !== targetStudent.student_id.trim().toLowerCase() && r.student_id !== id
    );
    saveAttendanceRecords(remainingRecords);
  }
};

// ==========================================
// SESSION CRUD
// ==========================================
export const getSessions = () => {
  initStorage();
  try {
    return JSON.parse(localStorage.getItem(KEYS.SESSIONS)) || [];
  } catch (e) {
    console.error("Error reading sessions from LocalStorage", e);
    return [];
  }
};

export const getSessionsByCourse = (courseId) => {
  return getSessions().filter(s => s.course_id === courseId);
};

export const getSessionById = (sessionId) => {
  return getSessions().find(s => s.id === sessionId);
};

export const getSessionByCode = (sessionCode) => {
  if (!sessionCode) return null;
  const cleanCode = sessionCode.trim().toUpperCase();
  return getSessions().find(s => s.session_code.toUpperCase() === cleanCode);
};

export const saveSessions = (sessions) => {
  localStorage.setItem(KEYS.SESSIONS, JSON.stringify(sessions));
  window.dispatchEvent(new Event('storage'));
};

export const addSession = (session) => {
  const sessions = getSessions();
  const newSession = {
    ...session,
    created_at: new Date().toISOString()
  };
  sessions.unshift(newSession);
  saveSessions(sessions);
  return newSession;
};

export const updateSession = (id, updatedData) => {
  const sessions = getSessions();
  const index = sessions.findIndex(s => s.id === id);
  if (index !== -1) {
    sessions[index] = { ...sessions[index], ...updatedData };
    saveSessions(sessions);
    return sessions[index];
  }
  return null;
};

export const deleteSession = (id) => {
  const sessions = getSessions().filter(s => s.id !== id);
  saveSessions(sessions);

  // Cascade delete records for this session
  const records = getAttendanceRecords().filter(r => r.session_id !== id);
  saveAttendanceRecords(records);
};

// ==========================================
// ATTENDANCE RECORD CRUD
// ==========================================
export const getAttendanceRecords = () => {
  initStorage();
  try {
    return JSON.parse(localStorage.getItem(KEYS.RECORDS)) || [];
  } catch (e) {
    console.error("Error reading attendance records from LocalStorage", e);
    return [];
  }
};

export const getAttendanceRecordsBySession = (sessionId) => {
  return getAttendanceRecords().filter(r => r.session_id === sessionId);
};

export const saveAttendanceRecords = (records) => {
  localStorage.setItem(KEYS.RECORDS, JSON.stringify(records));
  window.dispatchEvent(new Event('storage'));
};

export const addAttendanceRecord = (record) => {
  const records = getAttendanceRecords();
  const newRecord = {
    ...record,
    created_at: new Date().toISOString()
  };
  records.unshift(newRecord);
  saveAttendanceRecords(records);
  return newRecord;
};

export const updateAttendanceRecord = (id, updatedData) => {
  const records = getAttendanceRecords();
  const index = records.findIndex(r => r.id === id);
  if (index !== -1) {
    records[index] = { ...records[index], ...updatedData };
    saveAttendanceRecords(records);
    return records[index];
  }
  return null;
};

export const deleteAttendanceRecord = (id) => {
  const records = getAttendanceRecords().filter(r => r.id !== id);
  saveAttendanceRecords(records);
};

// ==========================================
// SESSION COUNTDOWN TIMER PERSISTENCE
// ==========================================
export const getSessionTimer = (sessionId) => {
  try {
    const data = localStorage.getItem(`qr_attendance_timer_${sessionId}`);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    return null;
  }
};

export const saveSessionTimer = (sessionId, timerData) => {
  try {
    localStorage.setItem(`qr_attendance_timer_${sessionId}`, JSON.stringify(timerData));
    window.dispatchEvent(new Event('storage'));
  } catch (e) {
    console.error("Error saving session timer state", e);
  }
};

export const clearSessionTimer = (sessionId) => {
  try {
    localStorage.removeItem(`qr_attendance_timer_${sessionId}`);
    window.dispatchEvent(new Event('storage'));
  } catch (e) {
    console.error("Error clearing session timer state", e);
  }
};

export const processGlobalExpiredTimers = () => {
  try {
    const sessions = getSessions();
    let updated = false;
    sessions.forEach(s => {
      if (s.status === 'Open') {
        const timerData = getSessionTimer(s.id);
        if (timerData && timerData.isRunning && timerData.autoCloseOnExpire) {
          const elapsed = Math.floor((Date.now() - timerData.startTime) / 1000);
          const remaining = Math.max(0, timerData.remainingOnStart - elapsed);
          if (remaining === 0) {
            s.status = 'Closed';
            updated = true;
            saveSessionTimer(s.id, { ...timerData, isRunning: false, remainingSeconds: 0 });
          }
        }
      }
    });
    if (updated) {
      saveSessions(sessions);
    }
  } catch (e) {
    console.error("Error processing global timers", e);
  }
};

