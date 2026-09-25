import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  getCourses,
  getSessions,
  getSessionsByCourse,
  addSession,
  updateSession,
  deleteSession,
  getStudentsByCourse
} from '../../services/storageService';
import { getMergedSessionAttendance } from '../../services/attendanceService';
import { generateSessionCode, generateId } from '../../utils/codeGenerator';
import { formatThaiDate, getTodayLocalDate } from '../../utils/formatters';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import ConfirmModal from '../../components/common/ConfirmModal';
import EmptyState from '../../components/common/EmptyState';
import {
  CalendarCheck,
  Plus,
  QrCode,
  Edit3,
  Trash2,
  Clock,
  RefreshCw,
  Power,
  ExternalLink
} from 'lucide-react';

export const SessionManagementPage = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [sessions, setSessions] = useState([]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [deletingSessionId, setDeletingSessionId] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    course_id: '',
    session_title: '',
    session_code: '',
    session_date: getTodayLocalDate(),
    start_time: '08:00',
    end_time: '10:00',
    late_after_minutes: 15,
    status: 'Open'
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    const loadedCourses = getCourses();
    setCourses(loadedCourses);
    if (loadedCourses.length > 0 && !selectedCourseId) {
      setSelectedCourseId(loadedCourses[0].id);
    }
  }, []);

  useEffect(() => {
    loadSessions();
    const handleStorage = () => loadSessions();
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [selectedCourseId]);

  const loadSessions = () => {
    if (selectedCourseId) {
      setSessions(getSessionsByCourse(selectedCourseId));
    } else {
      setSessions(getSessions());
    }
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (formErrors[id]) {
      setFormErrors((prev) => ({ ...prev, [id]: null }));
    }
  };

  const handleRegenerateCode = () => {
    const course = courses.find((c) => c.id === formData.course_id);
    const newCode = generateSessionCode(course?.course_code || 'ATT');
    setFormData((prev) => ({ ...prev, session_code: newCode }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.course_id) errors.course_id = 'กรุณาเลือกรายวิชา';
    if (!formData.session_title.trim()) errors.session_title = 'กรุณากรอกหัวข้อคาบเรียน';
    if (!formData.session_code.trim()) errors.session_code = 'กรุณากรอกหรือสร้างรหัส Session';
    if (!formData.session_date) errors.session_date = 'กรุณาเลือกวันที่';
    if (!formData.start_time) errors.start_time = 'กรุณากรอกเวลาเริ่มต้น';
    if (!formData.end_time) errors.end_time = 'กรุณากรอกเวลาสิ้นสุด';

    if (formData.start_time && formData.end_time && formData.start_time >= formData.end_time) {
      errors.start_time = 'เวลาเริ่มต้นต้องมาก่อนเวลาสิ้นสุด';
    }

    // Unique Session Code Validation
    const cleanCode = formData.session_code.trim().toUpperCase();
    const allSessions = getSessions();
    const isDuplicateCode = allSessions.some(
      (s) => s.session_code.toUpperCase() === cleanCode && s.id !== editingSession?.id
    );
    if (isDuplicateCode) {
      errors.session_code = `รหัส Session "${cleanCode}" มีอยู่ในระบบแล้ว กรุณากดสร้างใหม่หรือเปลี่ยนรหัส`;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenAddModal = () => {
    const loadedCourses = getCourses();
    const courseId = selectedCourseId || (loadedCourses[0]?.id || '');
    const course = loadedCourses.find((c) => c.id === courseId);
    setEditingSession(null);
    setFormData({
      course_id: courseId,
      session_title: `สัปดาห์ที่ ${sessions.length + 1} - `,
      session_code: generateSessionCode(course?.course_code || 'ATT'),
      session_date: getTodayLocalDate(),
      start_time: '08:00',
      end_time: '10:00',
      late_after_minutes: 15,
      status: 'Open'
    });
    setFormErrors({});
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (session) => {
    setEditingSession(session);
    setFormData({
      course_id: session.course_id,
      session_title: session.session_title,
      session_code: session.session_code,
      session_date: session.session_date,
      start_time: session.start_time,
      end_time: session.end_time,
      late_after_minutes: session.late_after_minutes,
      status: session.status
    });
    setFormErrors({});
    setIsAddModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (editingSession) {
      updateSession(editingSession.id, {
        ...formData,
        late_after_minutes: Number(formData.late_after_minutes)
      });
    } else {
      addSession({
        id: generateId('session'),
        ...formData,
        late_after_minutes: Number(formData.late_after_minutes)
      });
    }

    loadSessions();
    setIsAddModalOpen(false);
  };

  const handleStatusToggle = (session, newStatus) => {
    updateSession(session.id, { status: newStatus });
    loadSessions();
  };

  const handleDeleteConfirm = () => {
    if (deletingSessionId) {
      deleteSession(deletingSessionId);
      loadSessions();
      setDeletingSessionId(null);
    }
  };

  const courseOptions = courses.map((c) => ({
    value: c.id,
    label: `${c.course_code} - ${c.course_name} (Sec ${c.section})`
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">คาบเรียน & QR Code (Sessions)</h1>
          <p className="text-sm text-slate-500 mt-1">สร้างคาบเรียน กำหนดเกณฑ์เวลามาสาย และเปิดแสดง QR Code</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={handleOpenAddModal} disabled={courses.length === 0}>
          สร้างคาบเรียนใหม่
        </Button>
      </div>

      {/* Course Filter */}
      <Card className="!p-4">
        <Select
          label="เลือกรายวิชาเพื่อจัดการคาบเรียน"
          id="courseFilter"
          value={selectedCourseId}
          onChange={(e) => setSelectedCourseId(e.target.value)}
          options={courseOptions}
          placeholder="-- แสดงคาบเรียนทั้งหมด --"
        />
      </Card>

      {/* Session Cards List */}
      {courses.length === 0 ? (
        <Card>
          <EmptyState
            icon={CalendarCheck}
            title="ยังไม่มีรายวิชาในระบบ"
            description="กรุณาสร้างรายวิชาก่อนสร้างคาบเรียน"
          />
        </Card>
      ) : sessions.length === 0 ? (
        <Card>
          <EmptyState
            icon={CalendarCheck}
            title="ไม่พบคาบเรียน"
            description="ยังไม่มีคาบเรียนในรายวิชานี้ คลิกปุ่มสร้างคาบเรียนเพื่อเริ่มต้น"
            actionLabel="สร้างคาบเรียนใหม่"
            onAction={handleOpenAddModal}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map((session) => {
            const course = courses.find((c) => c.id === session.course_id);
            const { records } = getMergedSessionAttendance(session.id);

            const presentCount = records.filter((r) => r.status === 'Present').length;
            const lateCount = records.filter((r) => r.status === 'Late').length;
            const absentCount = records.filter((r) => r.status === 'Absent').length;
            const totalStudents = records.length;

            return (
              <Card
                key={session.id}
                className="flex flex-col justify-between hover:border-primary-300 transition-colors"
                title={
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant={session.status}>{session.status}</Badge>
                    <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {session.session_code}
                    </span>
                  </div>
                }
              >
                <div className="space-y-4">
                  <div>
                    <h4 className="text-base font-bold text-slate-800 leading-snug">{session.session_title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {course ? `${course.course_code} - ${course.course_name}` : ''}
                    </p>
                  </div>

                  {/* Time & Date Details */}
                  <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>วันที่: <strong>{formatThaiDate(session.session_date)}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>เวลา: <strong>{session.start_time} - {session.end_time} น.</strong></span>
                    </div>
                    <div className="flex items-center gap-2 text-amber-700">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      <span>สายหลังเวลาเริ่มต้น: <strong>{session.late_after_minutes} นาที</strong></span>
                    </div>
                  </div>

                  {/* Quick Attendance Stats */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                    <div className="bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                      <span className="block font-bold text-emerald-700 text-sm">{presentCount}</span>
                      <span className="text-emerald-600 text-[10px]">มาเรียน</span>
                    </div>
                    <div className="bg-amber-50 p-2 rounded-lg border border-amber-100">
                      <span className="block font-bold text-amber-700 text-sm">{lateCount}</span>
                      <span className="text-amber-600 text-[10px]">มาสาย</span>
                    </div>
                    <div className="bg-rose-50 p-2 rounded-lg border border-rose-100">
                      <span className="block font-bold text-rose-700 text-sm">{absentCount}</span>
                      <span className="text-rose-600 text-[10px]">ขาดเรียน</span>
                    </div>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="pt-4 mt-4 border-t border-slate-100 space-y-2">
                  <Link to={`/teacher/qr/${session.id}`} className="block">
                    <Button variant="primary" size="sm" icon={QrCode} className="w-full">
                      เปิดหน้าจอ QR Code
                    </Button>
                  </Link>

                  <div className="flex items-center justify-between gap-1 pt-1">
                    {/* Status Toggles */}
                    <div className="flex items-center gap-1">
                      {session.status !== 'Open' && (
                        <button
                          onClick={() => handleStatusToggle(session, 'Open')}
                          className="px-2 py-1 text-xs font-semibold rounded bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors"
                        >
                          เปิดเช็คชื่อ
                        </button>
                      )}
                      {session.status !== 'Closed' && (
                        <button
                          onClick={() => handleStatusToggle(session, 'Closed')}
                          className="px-2 py-1 text-xs font-semibold rounded bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                        >
                          ปิดเช็คชื่อ
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditModal(session)}
                        className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="แก้ไขคาบเรียน"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingSessionId(session.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="ลบคาบเรียน"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add / Edit Session Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={editingSession ? 'แก้ไขคาบเรียน' : 'สร้างคาบเรียนใหม่'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="รายวิชา (Course)"
            id="course_id"
            value={formData.course_id}
            onChange={handleInputChange}
            options={courseOptions}
            error={formErrors.course_id}
            required
          />

          <Input
            label="หัวข้อคาบเรียน / สัปดาห์ที่"
            id="session_title"
            placeholder="เช่น สัปดาห์ที่ 1 - Introduction"
            value={formData.session_title}
            onChange={handleInputChange}
            error={formErrors.session_title}
            required
          />

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">
              รหัส Session (Session Code) <span className="text-rose-500">*</span>
            </label>
            <div className="flex gap-2">
              <input
                id="session_code"
                value={formData.session_code}
                onChange={handleInputChange}
                className="block w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm font-mono font-bold text-slate-900 bg-slate-50 uppercase"
                required
              />
              <Button variant="secondary" type="button" icon={RefreshCw} onClick={handleRegenerateCode}>
                สร้างใหม่
              </Button>
            </div>
            {formErrors.session_code && <p className="text-xs text-rose-600 font-medium">{formErrors.session_code}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Input
                label="วันที่เรียน"
                id="session_date"
                type="date"
                value={formData.session_date}
                onChange={handleInputChange}
                error={formErrors.session_date}
                required
              />
            </div>
            <div>
              <Input
                label="เวลาเริ่ม"
                id="start_time"
                type="time"
                value={formData.start_time}
                onChange={handleInputChange}
                error={formErrors.start_time}
                required
              />
            </div>
            <div>
              <Input
                label="เวลาสิ้นสุด"
                id="end_time"
                type="time"
                value={formData.end_time}
                onChange={handleInputChange}
                error={formErrors.end_time}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="ถือว่ามาสายเมื่อเกิน (นาที)"
              id="late_after_minutes"
              type="number"
              min="0"
              max="120"
              placeholder="15"
              value={formData.late_after_minutes}
              onChange={handleInputChange}
              helperText="เช่น 15 นาทีหลังจากเวลาเริ่มเรียน"
            />

            <Select
              label="สถานะ คาบเรียน"
              id="status"
              value={formData.status}
              onChange={handleInputChange}
              options={[
                { value: 'Open', label: 'Open (เปิดรับเช็คชื่อ)' },
                { value: 'Closed', label: 'Closed (ปิดรับเช็คชื่อ)' },
                { value: 'Cancelled', label: 'Cancelled (ยกเลิกคาบเรียน)' }
              ]}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
              ยกเลิก
            </Button>
            <Button type="submit" variant="primary">
              {editingSession ? 'บันทึกการแก้ไข' : 'สร้างคาบเรียน'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingSessionId}
        onClose={() => setDeletingSessionId(null)}
        onConfirm={handleDeleteConfirm}
        title="ยืนยันการลบคาบเรียน"
        message="การลบคาบเรียนจะลบประวัติการเช็คชื่อทั้งหมดในคาบเรียนนี้ด้วย คุณแน่ใจหรือไม่?"
        confirmText="ลบคาบเรียน"
      />
    </div>
  );
};

export default SessionManagementPage;
