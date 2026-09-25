import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  getAttendanceRecords,
  getSessions,
  getCourses
} from '../../services/storageService';
import { getDashboardStats } from '../../services/attendanceService';
import { formatThaiDateTime } from '../../utils/formatters';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import {
  BookOpen,
  Users,
  CalendarCheck,
  CheckCircle2,
  AlertCircle,
  XCircle,
  QrCode,
  ArrowRight,
  TrendingUp,
  Clock,
  Plus
} from 'lucide-react';

export const TeacherDashboardPage = () => {
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalSessions: 0,
    totalPresent: 0,
    totalLate: 0,
    totalAbsent: 0
  });

  const [recentRecords, setRecentRecords] = useState([]);
  const [activeSessions, setActiveSessions] = useState([]);

  useEffect(() => {
    loadDashboardData();
    const handleStorage = () => loadDashboardData();
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const loadDashboardData = () => {
    setStats(getDashboardStats());
    
    // Get recent 5 attendance records
    const allRecords = getAttendanceRecords();
    const sorted = [...allRecords].sort(
      (a, b) => new Date(b.checkin_time || b.created_at) - new Date(a.checkin_time || a.created_at)
    );
    setRecentRecords(sorted.slice(0, 5));

    // Get active/open sessions
    const sessions = getSessions();
    setActiveSessions(sessions.filter(s => s.status === 'Open'));
  };

  const grandTotal = stats.totalPresent + stats.totalLate + stats.totalAbsent;
  const overallRate = grandTotal > 0 ? Math.round(((stats.totalPresent + stats.totalLate) / grandTotal) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary-900 via-primary-800 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-primary-200 backdrop-blur-sm">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>ภาพรวมระบบเช็คชื่อด้วย QR Code</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            ยินดีต้อนรับสู่แผงควบคุม (Teacher Dashboard)
          </h1>
          <p className="text-sm text-slate-300 max-w-xl">
            สรุปข้อมูลรายวิชา คาบเรียน สถิติการเช็คชื่อเข้าเรียน และกิจกรรมล่าสุดในระบบ
          </p>
        </div>

        <div className="flex flex-wrap gap-3 shrink-0">
          <Link to="/teacher/sessions">
            <Button variant="primary" icon={QrCode} size="md" className="shadow-lg shadow-primary-500/20">
              สร้างคาบเรียน & QR Code
            </Button>
          </Link>
          <Link to="/teacher/courses">
            <Button variant="secondary" icon={Plus} size="md" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
              เพิ่มรายวิชา
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Courses */}
        <Card className="!p-4 bg-white hover:border-primary-300 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">รายวิชา</span>
            <div className="p-2 bg-primary-50 rounded-lg text-primary-600">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-800">{stats.totalCourses}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">วิชาทั้งหมดในระบบ</span>
        </Card>

        {/* Total Students */}
        <Card className="!p-4 bg-white hover:border-primary-300 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">นักศึกษา</span>
            <div className="p-2 bg-sky-50 rounded-lg text-sky-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-800">{stats.totalStudents}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">ลงทะเบียนทั้งหมด</span>
        </Card>

        {/* Total Sessions */}
        <Card className="!p-4 bg-white hover:border-primary-300 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">คาบเรียน</span>
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-800">{stats.totalSessions}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">สร้างทั้งหมด</span>
        </Card>

        {/* Total Present */}
        <Card className="!p-4 bg-emerald-50/60 border-emerald-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-emerald-800">มาเรียน</span>
            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-800">{stats.totalPresent}</div>
          <span className="text-[11px] text-emerald-600 mt-1 block font-medium">ตรงเวลา (Present)</span>
        </Card>

        {/* Total Late */}
        <Card className="!p-4 bg-amber-50/60 border-amber-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-amber-800">มาสาย</span>
            <div className="p-2 bg-amber-100 rounded-lg text-amber-700">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-amber-800">{stats.totalLate}</div>
          <span className="text-[11px] text-amber-600 mt-1 block font-medium">เกินเวลาสาย (Late)</span>
        </Card>

        {/* Total Absent */}
        <Card className="!p-4 bg-rose-50/60 border-rose-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-rose-800">ขาดเรียน</span>
            <div className="p-2 bg-rose-100 rounded-lg text-rose-700">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-rose-800">{stats.totalAbsent}</div>
          <span className="text-[11px] text-rose-600 mt-1 block font-medium">ไม่เช็คชื่อ (Absent)</span>
        </Card>
      </div>

      {/* Middle Section: Active Sessions & Attendance Overview Visual Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Open Sessions Banner */}
        <Card
          title="คาบเรียนที่กำลังเปิดอยู่ (Active Open Sessions)"
          subtitle="คลิกเพื่อเปิดหน้าจอ QR Code แสดงให้นักศึกษาสแกน"
          className="lg:col-span-2"
        >
          {activeSessions.length === 0 ? (
            <div className="text-center py-6 text-slate-500 text-sm">
              <p>ขณะนี้ไม่มีคาบเรียนที่กำลังเปิดอยู่</p>
              <Link to="/teacher/sessions" className="inline-block mt-2">
                <Button variant="outline" size="sm">
                  ไปที่หน้าจัดการคาบเรียน
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {activeSessions.map((session) => {
                const courses = getCourses();
                const course = courses.find((c) => c.id === session.course_id);

                return (
                  <div
                    key={session.id}
                    className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-100/80 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="Open">OPEN</Badge>
                        <span className="font-mono text-xs font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                          {session.session_code}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-800 text-base mt-1.5">{session.session_title}</h4>
                      <p className="text-xs text-slate-500">{course?.course_code} - {course?.course_name}</p>
                    </div>

                    <Link to={`/teacher/qr/${session.id}`} className="shrink-0">
                      <Button variant="primary" size="sm" icon={QrCode}>
                        เปิด QR Code
                      </Button>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Attendance Percentage Visual Widget */}
        <Card title="ภาพรวมอัตราการเข้าเรียน" subtitle="คิดสัดส่วนจากจำนวนครั้งเช็คชื่อทั้งหมด">
          <div className="space-y-6 pt-2">
            <div className="text-center space-y-1">
              <div className="text-4xl font-extrabold text-primary-700">{overallRate}%</div>
              <p className="text-xs text-slate-500">อัตราการเข้าเรียนเฉลี่ยรวม (Overall Attendance Rate)</p>
            </div>

            {/* Custom Bar Breakdown */}
            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between font-medium">
                  <span className="text-emerald-700">มาเรียน (Present)</span>
                  <span className="font-bold">{stats.totalPresent} ครั้ง</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${grandTotal > 0 ? (stats.totalPresent / grandTotal) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between font-medium">
                  <span className="text-amber-700">มาสาย (Late)</span>
                  <span className="font-bold">{stats.totalLate} ครั้ง</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${grandTotal > 0 ? (stats.totalLate / grandTotal) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between font-medium">
                  <span className="text-rose-700">ขาดเรียน (Absent)</span>
                  <span className="font-bold">{stats.totalAbsent} ครั้ง</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose-500 rounded-full"
                    style={{ width: `${grandTotal > 0 ? (stats.totalAbsent / grandTotal) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Bottom Section: Recent Check-in Activity Stream */}
      <Card
        title="กิจกรรมการเช็คชื่อล่าสุด (Recent Check-in Activity)"
        subtitle="แสดงรายการนักศึกษาที่เพิ่งเช็คชื่อเข้ามาในระบบ"
        action={
          <Link to="/teacher/attendance" className="text-xs text-primary-600 font-semibold hover:underline flex items-center gap-1">
            <span>ดูทั้งหมด</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        }
      >
        {recentRecords.length === 0 ? (
          <p className="text-center py-6 text-sm text-slate-400">ยังไม่มีรายการเช็คชื่อล่าสุด</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentRecords.map((record) => (
              <div key={record.id} className="py-3 flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg text-slate-600 font-mono text-xs font-bold">
                    {record.student_id}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-800 block">{record.student_name}</span>
                    <span className="text-xs text-slate-400">ช่องทาง: {record.checkin_method || 'QR Code'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant={record.status}>
                    {record.status === 'Present' ? 'มาเรียน' : record.status === 'Late' ? 'มาสาย' : 'ขาดเรียน'}
                  </Badge>
                  <span className="text-xs text-slate-500 hidden sm:inline">
                    {formatThaiDateTime(record.checkin_time)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default TeacherDashboardPage;
