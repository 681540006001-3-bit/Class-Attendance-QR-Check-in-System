import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import {
  getSessionById,
  getCourses,
  updateSession,
  getSessionTimer,
  saveSessionTimer
} from '../../services/storageService';
import { getMergedSessionAttendance } from '../../services/attendanceService';
import { formatThaiDate } from '../../utils/formatters';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import {
  ArrowLeft,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  Clock,
  Users,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ExternalLink,
  Power,
  Play,
  Pause,
  RotateCcw,
  Timer
} from 'lucide-react';

export const QRDisplayPage = () => {
  const { sessionId } = useParams();
  const [session, setSession] = useState(null);
  const [course, setCourse] = useState(null);
  const [attendanceData, setAttendanceData] = useState({ session: null, records: [] });
  const [isCopied, setIsCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Countdown Timer State
  const [timerSeconds, setTimerSeconds] = useState(300); // 5 minutes default
  const [timerInitial, setTimerInitial] = useState(300);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [autoCloseOnExpire, setAutoCloseOnExpire] = useState(false);

  // Sync timer state with LocalStorage for session
  const loadTimerData = () => {
    if (!sessionId) return;
    const timerData = getSessionTimer(sessionId);
    if (timerData) {
      const initial = timerData.initialSeconds || 300;
      setTimerInitial(initial);
      setAutoCloseOnExpire(!!timerData.autoCloseOnExpire);

      if (timerData.isRunning && timerData.startTime) {
        const elapsed = Math.floor((Date.now() - timerData.startTime) / 1000);
        const remaining = Math.max(0, (timerData.remainingOnStart || initial) - elapsed);
        setTimerSeconds(remaining);
        setIsTimerRunning(remaining > 0);
        if (remaining === 0 && timerData.autoCloseOnExpire && session?.status === 'Open') {
          updateSession(session.id, { status: 'Closed' });
          loadData();
        }
      } else {
        setTimerSeconds(timerData.remainingSeconds !== undefined ? timerData.remainingSeconds : initial);
        setIsTimerRunning(false);
      }
    }
  };

  useEffect(() => {
    loadData();
    loadTimerData();

    // Listen for live updates from other tabs (e.g. student check-in)
    const handleStorageChange = () => {
      loadData();
      loadTimerData();
    };
    window.addEventListener('storage', handleStorageChange);
    const timer = setInterval(() => {
      loadData();
      loadTimerData();
    }, 1000); // 1s sync interval for timer accuracy across navigation

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(timer);
    };
  }, [sessionId]);

  const formatTimerText = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleSetTimerPreset = (mins) => {
    const totalSecs = mins * 60;
    setTimerInitial(totalSecs);
    setTimerSeconds(totalSecs);
    setIsTimerRunning(false);

    saveSessionTimer(sessionId, {
      isRunning: false,
      remainingSeconds: totalSecs,
      initialSeconds: totalSecs,
      autoCloseOnExpire
    });
  };

  const handleStartPauseTimer = () => {
    if (timerSeconds <= 0) return;
    const willRun = !isTimerRunning;
    setIsTimerRunning(willRun);

    if (willRun) {
      saveSessionTimer(sessionId, {
        isRunning: true,
        startTime: Date.now(),
        remainingOnStart: timerSeconds,
        initialSeconds: timerInitial,
        autoCloseOnExpire
      });
    } else {
      saveSessionTimer(sessionId, {
        isRunning: false,
        remainingSeconds: timerSeconds,
        initialSeconds: timerInitial,
        autoCloseOnExpire
      });
    }
  };

  const handleResetTimer = () => {
    setIsTimerRunning(false);
    setTimerSeconds(timerInitial);

    saveSessionTimer(sessionId, {
      isRunning: false,
      remainingSeconds: timerInitial,
      initialSeconds: timerInitial,
      autoCloseOnExpire
    });
  };

  const handleToggleAutoClose = (checked) => {
    setAutoCloseOnExpire(checked);
    const existing = getSessionTimer(sessionId) || {};
    saveSessionTimer(sessionId, {
      ...existing,
      autoCloseOnExpire: checked,
      initialSeconds: timerInitial,
      remainingSeconds: timerSeconds
    });
  };

  const loadData = () => {
    const s = getSessionById(sessionId);
    if (s) {
      setSession(s);
      const courses = getCourses();
      setCourse(courses.find((c) => c.id === s.course_id));
      setAttendanceData(getMergedSessionAttendance(sessionId));
    }
  };

  const handleToggleStatus = (newStatus) => {
    if (session) {
      updateSession(session.id, { status: newStatus });
      loadData();
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  if (!session || !course) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-4">
          <p className="text-slate-600 font-medium">ไม่พบข้อมูลคาบเรียนนี้ในระบบ</p>
          <Link to="/teacher/sessions">
            <Button variant="primary" icon={ArrowLeft}>
              กลับไปยังรายการคาบเรียน
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Dynamic QR Code Construction using window.location.origin
  const qrUrl = `${window.location.origin}/student-checkin?session=${encodeURIComponent(session.session_code)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(qrUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const records = attendanceData.records || [];
  const presentCount = records.filter((r) => r.status === 'Present').length;
  const lateCount = records.filter((r) => r.status === 'Late').length;
  const absentCount = records.filter((r) => r.status === 'Absent').length;
  const totalStudents = records.length;
  const attendanceRate = totalStudents > 0 ? Math.round(((presentCount + lateCount) / totalStudents) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      {/* Top Header Controls */}
      <header className="px-6 py-4 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between">
        <Link
          to="/teacher/sessions"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>กลับไปยังรายการคาบเรียน</span>
        </Link>

        <div className="flex items-center gap-3">
          {session.status === 'Open' ? (
            <Button
              size="sm"
              variant="danger"
              icon={Power}
              onClick={() => handleToggleStatus('Closed')}
            >
              ปิดรับเช็คชื่อ (Close)
            </Button>
          ) : (
            <Button
              size="sm"
              variant="success"
              icon={Power}
              onClick={() => handleToggleStatus('Open')}
            >
              เปิดรับเช็คชื่อ (Open)
            </Button>
          )}

          <button
            onClick={toggleFullscreen}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors"
            title="ขยายเต็มจอ"
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Main Display Grid */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-8 flex flex-col lg:flex-row items-center justify-center gap-8">
        {/* Left Side: QR Code & Code Card */}
        <div className="w-full lg:w-1/2 flex flex-col items-center justify-center">
          <div className="bg-white text-slate-900 rounded-3xl p-8 shadow-2xl border border-slate-200 flex flex-col items-center text-center w-full max-w-md">
            {/* Status Header */}
            <div className="mb-4">
              <Badge variant={session.status} className="text-sm px-4 py-1.5 shadow-sm">
                {session.status === 'Open' ? '🟢 กำลังเปิดรับเช็คชื่อ' : '🔴 ปิดรับเช็คชื่อแล้ว'}
              </Badge>
            </div>

            {/* QR Code Canvas */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-inner mb-6 relative group">
              <QRCodeSVG
                value={qrUrl}
                size={240}
                level="H"
                includeMargin={true}
                className="w-full h-auto max-w-[240px]"
              />
            </div>

            {/* Big Session Code Fallback */}
            <div className="w-full space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                หรือกรอกรหัส Session (Manual Code)
              </span>
              <div className="bg-slate-900 text-amber-400 font-mono font-extrabold text-3xl tracking-widest py-3 px-6 rounded-xl border border-slate-800 shadow-lg select-all">
                {session.session_code}
              </div>
            </div>

            {/* Direct Link & Copy */}
            <div className="mt-4 pt-4 border-t border-slate-100 w-full flex items-center justify-between text-xs text-slate-500">
              <a
                href={qrUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-primary-600 font-medium hover:underline truncate max-w-[240px]"
              >
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{qrUrl}</span>
              </a>
              <button
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors font-medium shrink-0"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{isCopied ? 'คัดลอกแล้ว' : 'คัดลอกลิงก์'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Countdown Timer & Course Details & Live Attendance Counter */}
        <div className="w-full lg:w-1/2 space-y-6">
          {/* Interactive Countdown Timer Widget (Top Position) */}
          <div className="w-full p-5 bg-slate-800/90 backdrop-blur-md rounded-2xl border border-slate-700 text-center space-y-3.5 shadow-xl">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold flex items-center gap-1.5 text-slate-200">
                <Timer className="w-4 h-4 text-amber-400" />
                <span>นับเวลาถอยหลังเปิดสแกน QR</span>
              </span>
              {timerSeconds === 0 ? (
                <span className="text-rose-400 font-bold animate-pulse">⏰ หมดเวลา!</span>
              ) : isTimerRunning ? (
                <span className="text-emerald-400 font-semibold animate-pulse">🟢 กำลังนับถอยหลัง...</span>
              ) : (
                <span className="text-slate-400">⏸️ หยุดชั่วคราว</span>
              )}
            </div>

            {/* Big Digital Clock Display */}
            <div className={`font-mono text-4xl sm:text-5xl font-extrabold tracking-widest py-3 rounded-xl border transition-all ${
              timerSeconds === 0
                ? 'bg-rose-950/80 text-rose-400 border-rose-800'
                : timerSeconds <= 60
                ? 'bg-amber-950/80 text-amber-300 border-amber-700 animate-pulse'
                : 'bg-slate-950 text-emerald-400 border-slate-800 shadow-inner'
            }`}>
              {formatTimerText(timerSeconds)}
            </div>

            {/* Quick Timer Presets */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
              {[3, 5, 10, 15].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => handleSetTimerPreset(mins)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                    timerInitial === mins * 60 && !isTimerRunning
                      ? 'bg-primary-600 text-white shadow-sm ring-2 ring-primary-400'
                      : 'bg-slate-900/80 text-slate-300 hover:bg-slate-700 border border-slate-700'
                  }`}
                >
                  {mins} นาที
                </button>
              ))}
            </div>

            {/* Controls: Start/Pause & Reset */}
            <div className="flex items-center justify-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleStartPauseTimer}
                disabled={timerSeconds === 0}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-md ${
                  isTimerRunning
                    ? 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                } disabled:opacity-50`}
              >
                {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isTimerRunning ? 'หยุดชั่วคราว (Pause)' : 'เริ่มนับถอยหลัง (Start)'}</span>
              </button>

              <button
                type="button"
                onClick={handleResetTimer}
                className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>รีเซ็ต</span>
              </button>
            </div>

            {/* Auto Close Toggle */}
            <label className="flex items-center justify-center gap-2 text-xs text-slate-400 pt-1 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoCloseOnExpire}
                onChange={(e) => handleToggleAutoClose(e.target.checked)}
                className="rounded border-slate-700 text-primary-600 focus:ring-primary-500 w-3.5 h-3.5"
              />
              <span>ปิดรับเช็คชื่ออัตโนมัติเมื่อหมดเวลา (Auto-close)</span>
            </label>
          </div>

          {/* Course & Session Info */}
          <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-6 border border-slate-700 space-y-3 shadow-xl">
            <div className="inline-block px-3 py-1 bg-primary-950/80 text-primary-300 font-mono font-bold text-xs rounded-md border border-primary-800">
              {course.course_code} - Sec {course.section}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
              {course.course_name}
            </h1>
            <h2 className="text-lg font-medium text-emerald-400">
              {session.session_title}
            </h2>

            <div className="flex flex-wrap gap-4 pt-3 text-xs text-slate-300 border-t border-slate-700/60">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>วันที่: <strong className="text-white">{formatThaiDate(session.session_date)}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>เวลา: <strong className="text-white">{session.start_time} - {session.end_time} น.</strong></span>
              </div>
              <div className="flex items-center gap-1.5 text-amber-300">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>ถือว่าสายเมื่อเกิน <strong className="text-white">{session.late_after_minutes} นาที</strong></span>
              </div>
            </div>
          </div>

          {/* Live Check-in Statistics Cards */}
          <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-6 border border-slate-700 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-primary-400" />
                <span>สรุปการเช็คชื่อแบบเรียลไทม์</span>
              </h3>
              <span className="text-xs text-slate-400">
                นักศึกษาทั้งหมด: <strong className="text-white">{totalStudents}</strong> คน
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-emerald-950/40 border border-emerald-800/60 p-4 rounded-xl text-center space-y-1">
                <div className="flex items-center justify-center text-emerald-400 gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-xs font-semibold">มาเรียน (Present)</span>
                </div>
                <div className="text-3xl font-extrabold text-emerald-400">{presentCount}</div>
              </div>

              <div className="bg-amber-950/40 border border-amber-800/60 p-4 rounded-xl text-center space-y-1">
                <div className="flex items-center justify-center text-amber-400 gap-1">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-xs font-semibold">มาสาย (Late)</span>
                </div>
                <div className="text-3xl font-extrabold text-amber-400">{lateCount}</div>
              </div>

              <div className="bg-rose-950/40 border border-rose-800/60 p-4 rounded-xl text-center space-y-1">
                <div className="flex items-center justify-center text-rose-400 gap-1">
                  <XCircle className="w-4 h-4" />
                  <span className="text-xs font-semibold">ขาดเรียน (Absent)</span>
                </div>
                <div className="text-3xl font-extrabold text-rose-400">{absentCount}</div>
              </div>
            </div>

            {/* Attendance Progress Bar */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs text-slate-300 font-medium">
                <span>อัตราการเข้าเรียน (Attendance Rate)</span>
                <span className="font-bold text-primary-300">{attendanceRate}%</span>
              </div>
              <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-700">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-primary-500 rounded-full transition-all duration-500"
                  style={{ width: `${attendanceRate}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default QRDisplayPage;
