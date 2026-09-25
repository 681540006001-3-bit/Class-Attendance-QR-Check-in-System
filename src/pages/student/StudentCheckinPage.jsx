import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { processStudentCheckin } from '../../services/attendanceService';
import { getSessionByCode, getCourses } from '../../services/storageService';
import { formatThaiDateTime } from '../../utils/formatters';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Badge from '../../components/common/Badge';
import {
  QrCode,
  CheckCircle2,
  AlertTriangle,
  GraduationCap,
  Clock,
  User,
  BookOpen,
  ArrowLeft,
  RotateCcw
} from 'lucide-react';

export const StudentCheckinPage = () => {
  const [searchParams] = useSearchParams();
  const urlSessionCode = searchParams.get('session') || '';

  const [sessionCode, setSessionCode] = useState('');
  const [studentId, setStudentId] = useState('');
  const [fullName, setFullName] = useState('');

  const [sessionPreview, setSessionPreview] = useState(null);
  const [coursePreview, setCoursePreview] = useState(null);

  const [errorMessage, setErrorMessage] = useState('');
  const [successResult, setSuccessResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (urlSessionCode) {
      setSessionCode(urlSessionCode.toUpperCase());
      previewSession(urlSessionCode.toUpperCase());
    }
  }, [urlSessionCode]);

  const previewSession = (code) => {
    if (!code || !code.trim()) {
      setSessionPreview(null);
      setCoursePreview(null);
      return;
    }
    const s = getSessionByCode(code.trim());
    if (s) {
      setSessionPreview(s);
      const courses = getCourses();
      setCoursePreview(courses.find((c) => c.id === s.course_id));
    } else {
      setSessionPreview(null);
      setCoursePreview(null);
    }
  };

  const handleSessionCodeChange = (e) => {
    const val = e.target.value.toUpperCase();
    setSessionCode(val);
    setErrorMessage('');
    previewSession(val);
  };

  const handleSubmitCheckin = (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    setTimeout(() => {
      const result = processStudentCheckin({
        sessionCode,
        studentId,
        fullName,
        checkinMethod: urlSessionCode ? 'QR Code' : 'Session Code'
      });

      setIsLoading(false);

      if (result.success) {
        setSuccessResult(result);
        // Trigger celebratory confetti effect
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch (err) {
          // ignore if canvas confetti unavailable
        }
      } else {
        setErrorMessage(result.error);
      }
    }, 400);
  };

  const handleResetForm = () => {
    setSuccessResult(null);
    setStudentId('');
    setFullName('');
    setErrorMessage('');
  };

  return (
    <div className="w-full max-w-lg mx-auto py-6 px-4">
      {/* Top Header */}
      <div className="text-center space-y-2 mb-6">
        <div className="inline-flex p-3 bg-emerald-100 rounded-2xl text-emerald-600 shadow-sm mb-1">
          <GraduationCap className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          เช็คชื่อเข้าเรียน (Student Check-in)
        </h1>
        <p className="text-xs text-slate-500 max-w-xs mx-auto">
          สแกน QR Code หรือกรอกรหัส Session เพื่อลงชื่อเข้าเรียนในชั้นเรียน
        </p>
      </div>

      {/* Success Result View */}
      {successResult ? (
        <Card className="border-2 border-emerald-500/50 shadow-xl overflow-hidden animate-fade-in">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6 text-center space-y-3">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">เช็คชื่อเข้าเรียนสำเร็จ!</h2>
              <p className="text-emerald-100 text-xs mt-1">{successResult.message}</p>
            </div>
          </div>

          <div className="p-6 space-y-4 text-sm bg-white">
            {/* Status Badge */}
            <div className="flex justify-between items-center py-2 px-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-slate-500 font-medium">สถานะการเข้าเรียน:</span>
              <Badge variant={successResult.status} className="text-sm px-3 py-1 font-bold">
                {successResult.status === 'Present' ? '🟢 มาเรียน (ตรงเวลา)' : '🟡 มาสาย'}
              </Badge>
            </div>

            {/* Student Info */}
            <div className="space-y-2 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2 text-slate-700">
                <User className="w-4 h-4 text-slate-400 shrink-0" />
                <span>รหัสนักศึกษา: <strong className="font-mono text-slate-900">{studentId}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <User className="w-4 h-4 text-slate-400 shrink-0" />
                <span>ชื่อ-นามสกุล: <strong className="text-slate-900">{successResult.studentName}</strong></span>
              </div>
            </div>

            {/* Session Info */}
            <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary-500 shrink-0" />
                <span>หัวข้อ: <strong className="text-slate-800">{successResult.sessionTitle}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                <span>เวลาเช็คชื่อบันทึก: <strong className="text-slate-800">{formatThaiDateTime(successResult.checkinTime)}</strong></span>
              </div>
            </div>

            {/* Reset / Actions */}
            <div className="pt-3 space-y-2">
              <Button variant="secondary" icon={RotateCcw} onClick={handleResetForm} className="w-full">
                เช็คชื่อนักศึกษาคนอื่นในคาบนี้
              </Button>
              <Link to="/" className="block">
                <Button variant="outline" icon={ArrowLeft} className="w-full">
                  กลับสู่หน้าหลัก
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      ) : (
        /* Form View */
        <Card className="shadow-lg border border-slate-200">
          <form onSubmit={handleSubmitCheckin} className="space-y-5">
            {/* Session Code Input */}
            <div className="space-y-1">
              <Input
                label="รหัส Session (Session Code)"
                id="sessionCode"
                placeholder="เช่น SE333-8F2K"
                value={sessionCode}
                onChange={handleSessionCodeChange}
                required
                className="font-mono uppercase font-bold text-center tracking-widest text-lg"
              />

              {/* Session Live Preview Banner */}
              {sessionPreview && coursePreview ? (
                <div className="mt-2 p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 space-y-1 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-800">{coursePreview.course_code} - {coursePreview.course_name}</span>
                    <Badge variant={sessionPreview.status}>{sessionPreview.status}</Badge>
                  </div>
                  <p className="text-slate-600">คาบเรียน: <strong className="text-slate-800">{sessionPreview.session_title}</strong></p>
                  <p className="text-slate-500 text-[11px]">เวลาเรียน: {sessionPreview.start_time} - {sessionPreview.end_time} น. (สายหลัง {sessionPreview.late_after_minutes} นาที)</p>
                </div>
              ) : sessionCode ? (
                <p className="text-xs text-amber-600 mt-1 font-medium">⚠️ ไม่พบรหัส Session นี้ในระบบ กรุณาตรวจสอบอีกครั้ง</p>
              ) : null}
            </div>

            {/* Student Credentials Input */}
            <Input
              label="รหัสนักศึกษา (Student ID)"
              id="studentId"
              placeholder="เช่น 65011001"
              value={studentId}
              onChange={(e) => {
                setStudentId(e.target.value);
                setErrorMessage('');
              }}
              required
              icon={User}
            />

            <Input
              label="ชื่อ-นามสกุล (Full Name)"
              id="fullName"
              placeholder="เช่น นายสมศักดิ์ เรียนดี"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                setErrorMessage('');
              }}
              required
              icon={User}
            />

            {/* Error Message Display */}
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-xs text-rose-800 font-medium animate-shake">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Check-in Submit Button */}
            <Button
              type="submit"
              variant="success"
              size="lg"
              disabled={isLoading || !sessionCode || !studentId || !fullName}
              className="w-full text-base py-3 font-bold shadow-md shadow-emerald-500/20"
            >
              {isLoading ? 'กำลังบันทึกข้อมูล...' : 'เช็คชื่อเข้าเรียน (Submit Check-in)'}
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
};

export default StudentCheckinPage;
