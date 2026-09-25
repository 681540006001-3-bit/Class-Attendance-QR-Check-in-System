import React, { useState, useEffect } from 'react';
import {
  getCourses,
  getStudentsByCourse,
  getSessionsByCourse
} from '../../services/storageService';
import {
  getSessionAttendanceReports,
  getStudentAttendanceReports
} from '../../services/attendanceService';
import { formatThaiDate } from '../../utils/formatters';
import Card from '../../components/common/Card';
import Select from '../../components/common/Select';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import { BarChart3, Users, Calendar, Award, Printer } from 'lucide-react';

export const AttendanceReportPage = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [reportMode, setReportMode] = useState('BY_SESSION'); // 'BY_SESSION' | 'BY_STUDENT'

  const [sessionReports, setSessionReports] = useState([]);
  const [studentReports, setStudentReports] = useState([]);

  useEffect(() => {
    const loadedCourses = getCourses();
    setCourses(loadedCourses);
    if (loadedCourses.length > 0) {
      setSelectedCourseId(loadedCourses[0].id);
    }
  }, []);

  useEffect(() => {
    const loadReports = () => {
      if (selectedCourseId) {
        setSessionReports(getSessionAttendanceReports(selectedCourseId));
        setStudentReports(getStudentAttendanceReports(selectedCourseId));
      }
    };
    loadReports();
    window.addEventListener('storage', loadReports);
    return () => window.removeEventListener('storage', loadReports);
  }, [selectedCourseId]);

  const course = courses.find((c) => c.id === selectedCourseId);

  const courseOptions = courses.map((c) => ({
    value: c.id,
    label: `${c.course_code} - ${c.course_name} (Sec ${c.section})`
  }));

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">รายงานสรุปการเช็คชื่อ (Attendance Reports)</h1>
          <p className="text-sm text-slate-500 mt-1">วิเคราะห์ภาพรวมการเข้าเรียนแยกตามรายคาบเรียนและรายบุคคล</p>
        </div>
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg border border-slate-200 transition-colors shadow-xs"
        >
          <Printer className="w-4 h-4" />
          <span>พิมพ์รายงาน / Export PDF</span>
        </button>
      </div>

      {/* Selectors and Mode Switcher */}
      <Card className="!p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="w-full md:w-1/2">
            <Select
              label="เลือกรายวิชาเพื่อดูรายงาน"
              id="courseSelect"
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              options={courseOptions}
            />
          </div>

          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200 self-start md:self-end">
            <button
              onClick={() => setReportMode('BY_SESSION')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                reportMode === 'BY_SESSION'
                  ? 'bg-white text-primary-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>สรุปแยกตามคาบเรียน</span>
            </button>

            <button
              onClick={() => setReportMode('BY_STUDENT')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                reportMode === 'BY_STUDENT'
                  ? 'bg-white text-primary-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>สรุปรายบุคคล</span>
            </button>
          </div>
        </div>
      </Card>

      {/* Report Summary Content */}
      {!selectedCourseId ? (
        <Card>
          <EmptyState
            icon={BarChart3}
            title="ยังไม่ได้เลือกรายวิชา"
            description="กรุณาเลือกรายวิชาด้านบนเพื่อประมวลผลรายงานสรุป"
          />
        </Card>
      ) : reportMode === 'BY_SESSION' ? (
        /* Report By Session */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-800">
              สรุปการเข้าเรียนแยกตามคาบเรียน ({sessionReports.length} คาบ)
            </h3>
            {course && (
              <span className="text-xs text-slate-500 font-medium">
                {course.course_code} - {course.course_name}
              </span>
            )}
          </div>

          {sessionReports.length === 0 ? (
            <Card>
              <EmptyState
                icon={Calendar}
                title="ไม่พบคาบเรียน"
                description="ยังไม่มีคาบเรียนที่สร้างขึ้นในรายวิชานี้"
              />
            </Card>
          ) : (
            <Card className="!p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-3.5">หัวข้อคาบเรียน</th>
                      <th className="px-6 py-3.5">วันที่เรียน</th>
                      <th className="px-6 py-3.5 text-center">นักศึกษาทั้งหมด</th>
                      <th className="px-6 py-3.5 text-center">มาเรียน (Present)</th>
                      <th className="px-6 py-3.5 text-center">มาสาย (Late)</th>
                      <th className="px-6 py-3.5 text-center">ขาดเรียน (Absent)</th>
                      <th className="px-6 py-3.5 text-right">อัตราการเข้าเรียน</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sessionReports.map((report) => (
                      <tr key={report.sessionId} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4 font-semibold text-slate-800">
                          <div>{report.sessionTitle}</div>
                          <span className="font-mono text-xs text-slate-400 font-normal">
                            Code: {report.sessionCode}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-600 font-medium">
                          {formatThaiDate(report.sessionDate)}
                        </td>
                        <td className="px-6 py-4 text-center font-bold text-slate-700">
                          {report.totalStudents} คน
                        </td>
                        <td className="px-6 py-4 text-center font-bold text-emerald-600">
                          {report.presentCount}
                        </td>
                        <td className="px-6 py-4 text-center font-bold text-amber-600">
                          {report.lateCount}
                        </td>
                        <td className="px-6 py-4 text-center font-bold text-rose-600">
                          {report.absentCount}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            <span
                              className={`text-xs font-extrabold px-2.5 py-1 rounded-full ${
                                report.attendanceRate >= 80
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : report.attendanceRate >= 50
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {report.attendanceRate}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      ) : (
        /* Report By Student */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-800">
              สรุปการเข้าเรียนรายบุคคล ({studentReports.length} คน)
            </h3>
            {course && (
              <span className="text-xs text-slate-500 font-medium">
                {course.course_code} - {course.course_name}
              </span>
            )}
          </div>

          {studentReports.length === 0 ? (
            <Card>
              <EmptyState
                icon={Users}
                title="ไม่พบรายชื่อนักศึกษา"
                description="ยังไม่มีนักศึกษาลงทะเบียนในรายวิชานี้"
              />
            </Card>
          ) : (
            <Card className="!p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-3.5">รหัสนักศึกษา</th>
                      <th className="px-6 py-3.5">ชื่อ-นามสกุล</th>
                      <th className="px-6 py-3.5 text-center">จำนวนคาบทั้งหมด</th>
                      <th className="px-6 py-3.5 text-center">มาเรียน</th>
                      <th className="px-6 py-3.5 text-center">มาสาย</th>
                      <th className="px-6 py-3.5 text-center">ขาดเรียน</th>
                      <th className="px-6 py-3.5 text-right">เปอร์เซ็นต์เข้าเรียน</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {studentReports.map((report) => (
                      <tr key={report.studentDbId} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-slate-800">
                          {report.studentId}
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-800">
                          {report.fullName}
                        </td>
                        <td className="px-6 py-4 text-center font-medium text-slate-700">
                          {report.totalSessions} คาบ
                        </td>
                        <td className="px-6 py-4 text-center font-bold text-emerald-600">
                          {report.presentCount}
                        </td>
                        <td className="px-6 py-4 text-center font-bold text-amber-600">
                          {report.lateCount}
                        </td>
                        <td className="px-6 py-4 text-center font-bold text-rose-600">
                          {report.absentCount}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span
                            className={`text-xs font-extrabold px-2.5 py-1 rounded-full ${
                              report.attendanceRate >= 80
                                ? 'bg-emerald-100 text-emerald-800'
                                : report.attendanceRate >= 50
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {report.attendanceRate}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default AttendanceReportPage;
