import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { initStorage } from './services/storageService';

// Layouts
import TeacherLayout from './layouts/TeacherLayout';
import StudentLayout from './layouts/StudentLayout';

// Pages
import HomePage from './pages/HomePage';
import TeacherDashboardPage from './pages/teacher/TeacherDashboardPage';
import CourseManagementPage from './pages/teacher/CourseManagementPage';
import StudentManagementPage from './pages/teacher/StudentManagementPage';
import SessionManagementPage from './pages/teacher/SessionManagementPage';
import QRDisplayPage from './pages/teacher/QRDisplayPage';
import AttendanceListPage from './pages/teacher/AttendanceListPage';
import AttendanceReportPage from './pages/teacher/AttendanceReportPage';
import StudentCheckinPage from './pages/student/StudentCheckinPage';

export function App() {
  useEffect(() => {
    // Automatically seed storage if empty
    initStorage();
  }, []);

  return (
    <Routes>
      {/* Home Route */}
      <Route path="/" element={<HomePage />} />

      {/* Student Check-in Route */}
      <Route element={<StudentLayout />}>
        <Route path="/student-checkin" element={<StudentCheckinPage />} />
      </Route>

      {/* Teacher Dedicated QR Display Route */}
      <Route path="/teacher/qr/:sessionId" element={<QRDisplayPage />} />

      {/* Teacher Portal Routes */}
      <Route path="/teacher" element={<TeacherLayout />}>
        <Route index element={<TeacherDashboardPage />} />
        <Route path="courses" element={<CourseManagementPage />} />
        <Route path="students" element={<StudentManagementPage />} />
        <Route path="sessions" element={<SessionManagementPage />} />
        <Route path="attendance" element={<AttendanceListPage />} />
        <Route path="reports" element={<AttendanceReportPage />} />
      </Route>

      {/* Fallback to Home */}
      <Route path="*" element={<HomePage />} />
    </Routes>
  );
}

export default App;
