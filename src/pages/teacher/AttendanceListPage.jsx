import React, { useState, useEffect } from 'react';
import {
  getCourses,
  getSessionsByCourse,
  getSessionById
} from '../../services/storageService';
import {
  getMergedSessionAttendance,
  updateStudentAttendanceStatus
} from '../../services/attendanceService';
import { formatThaiDateTime } from '../../utils/formatters';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import EmptyState from '../../components/common/EmptyState';
import { ClipboardList, Search, Edit3, Filter, Clock, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';

export const AttendanceListPage = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [sessions, setSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState('');

  const [mergedAttendance, setMergedAttendance] = useState({ session: null, records: [] });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Edit status modal
  const [editingStudent, setEditingStudent] = useState(null);
  const [editStatus, setEditStatus] = useState('Present');
  const [editNote, setEditNote] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    const loadedCourses = getCourses();
    setCourses(loadedCourses);
    if (loadedCourses.length > 0) {
      setSelectedCourseId(loadedCourses[0].id);
    }
  }, []);

  useEffect(() => {
    if (selectedCourseId) {
      const loadedSessions = getSessionsByCourse(selectedCourseId);
      setSessions(loadedSessions);
      if (loadedSessions.length > 0) {
        setSelectedSessionId(loadedSessions[0].id);
      } else {
        setSelectedSessionId('');
        setMergedAttendance({ session: null, records: [] });
      }
    }
  }, [selectedCourseId]);

  useEffect(() => {
    if (selectedSessionId) {
      loadAttendanceData();
    }
    const handleStorage = () => loadAttendanceData();
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [selectedSessionId]);

  const loadAttendanceData = () => {
    if (selectedSessionId) {
      setMergedAttendance(getMergedSessionAttendance(selectedSessionId));
    }
  };

  const handleOpenEditModal = (item) => {
    setEditingStudent(item);
    setEditStatus(item.status || 'Present');
    setEditNote(item.note || '');
    setIsEditModalOpen(true);
  };

  const handleSaveStatusOverride = (e) => {
    e.preventDefault();
    if (editingStudent && selectedSessionId) {
      updateStudentAttendanceStatus({
        sessionId: selectedSessionId,
        studentId: editingStudent.student_id,
        studentName: editingStudent.full_name,
        newStatus: editStatus,
        note: editNote
      });
      loadAttendanceData();
      setIsEditModalOpen(false);
    }
  };

  const records = mergedAttendance.records || [];

  const filteredRecords = records.filter((r) => {
    const matchesSearch =
      r.student_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.full_name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const presentCount = records.filter((r) => r.status === 'Present').length;
  const lateCount = records.filter((r) => r.status === 'Late').length;
  const absentCount = records.filter((r) => r.status === 'Absent').length;

  const courseOptions = courses.map((c) => ({
    value: c.id,
    label: `${c.course_code} - ${c.course_name}`
  }));

  const sessionOptions = sessions.map((s) => ({
    value: s.id,
    label: `${s.session_title} (${s.session_code}) - ${s.session_date}`
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">รายการเช็คชื่อ (Attendance List)</h1>
        <p className="text-sm text-slate-500 mt-1">ตรวจสอบรายชื่อนักศึกษาทุกคนในคาบเรียน สรุปสถานะ และแก้ไขย้อนหลัง</p>
      </div>

      {/* Selectors and Filters */}
      <Card className="!p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Select
            label="1. เลือกรายวิชา"
            id="courseSelect"
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            options={courseOptions}
          />

          <Select
            label="2. เลือกคาบเรียน (Session)"
            id="sessionSelect"
            value={selectedSessionId}
            onChange={(e) => setSelectedSessionId(e.target.value)}
            options={sessionOptions}
            disabled={sessions.length === 0}
            placeholder={sessions.length === 0 ? 'ยังไม่มีคาบเรียน' : 'กรุณาเลือกคาบเรียน'}
          />

          <Select
            label="3. กรองตามสถานะ"
            id="statusFilter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'ALL', label: 'แสดงสถานะทั้งหมด' },
              { value: 'Present', label: 'มาเรียน (Present)' },
              { value: 'Late', label: 'มาสาย (Late)' },
              { value: 'Absent', label: 'ขาดเรียน (Absent)' }
            ]}
          />

          <Input
            label="4. ค้นหานักศึกษา"
            id="search"
            placeholder="ค้นหาด้วยรหัส หรือชื่อ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={Search}
          />
        </div>
      </Card>

      {/* Attendance Summary Stat Badges */}
      {selectedSessionId && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="!p-4 bg-white">
            <span className="text-xs text-slate-500 font-semibold block">นักศึกษาทั้งหมด</span>
            <span className="text-2xl font-bold text-slate-800">{records.length} คน</span>
          </Card>

          <Card className="!p-4 bg-emerald-50/50 border-emerald-200">
            <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> มาเรียน (Present)
            </span>
            <span className="text-2xl font-bold text-emerald-700">{presentCount} คน</span>
          </Card>

          <Card className="!p-4 bg-amber-50/50 border-amber-200">
            <span className="text-xs text-amber-700 font-semibold flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> มาสาย (Late)
            </span>
            <span className="text-2xl font-bold text-amber-700">{lateCount} คน</span>
          </Card>

          <Card className="!p-4 bg-rose-50/50 border-rose-200">
            <span className="text-xs text-rose-700 font-semibold flex items-center gap-1">
              <XCircle className="w-3.5 h-3.5" /> ขาดเรียน (Absent)
            </span>
            <span className="text-2xl font-bold text-rose-700">{absentCount} คน</span>
          </Card>
        </div>
      )}

      {/* Attendance Records Table */}
      {!selectedSessionId ? (
        <Card>
          <EmptyState
            icon={ClipboardList}
            title="ยังไม่ได้เลือกคาบเรียน"
            description="กรุณาเลือกรายวิชาและคาบเรียนเพื่อแสดงรายการเช็คชื่อนักศึกษา"
          />
        </Card>
      ) : filteredRecords.length === 0 ? (
        <Card>
          <EmptyState
            icon={ClipboardList}
            title="ไม่พบรายการเช็คชื่อ"
            description={
              searchTerm || statusFilter !== 'ALL'
                ? 'ไม่พบข้อมูลที่ตรงกับเงื่อนไขการกรอง'
                : 'ยังไม่มีนักศึกษาในรายวิชานี้'
            }
          />
        </Card>
      ) : (
        <Card className="!p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">ลำดับ</th>
                  <th className="px-6 py-3.5">รหัสนักศึกษา</th>
                  <th className="px-6 py-3.5">ชื่อ-นามสกุล</th>
                  <th className="px-6 py-3.5">สถานะ</th>
                  <th className="px-6 py-3.5">เวลาเช็คชื่อ</th>
                  <th className="px-6 py-3.5">ช่องทาง</th>
                  <th className="px-6 py-3.5">หมายเหตุ</th>
                  <th className="px-6 py-3.5 text-right">แก้ไขสถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.map((item, idx) => (
                  <tr key={item.student_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 text-xs font-medium text-slate-400">{idx + 1}</td>
                    <td className="px-6 py-4 font-mono font-bold text-slate-800">{item.student_id}</td>
                    <td className="px-6 py-4 font-semibold text-slate-800">{item.full_name}</td>
                    <td className="px-6 py-4">
                      <Badge variant={item.status}>
                        {item.status === 'Present'
                          ? 'มาเรียน'
                          : item.status === 'Late'
                          ? 'มาสาย'
                          : 'ขาดเรียน'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600">
                      {item.checkin_time ? formatThaiDateTime(item.checkin_time) : '-'}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {item.checkin_method || '-'}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 italic max-w-xs truncate">
                      {item.note || '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        size="sm"
                        variant="secondary"
                        icon={Edit3}
                        onClick={() => handleOpenEditModal(item)}
                      >
                        แก้ไข
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Edit Status Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`ปรับเปลี่ยนสถานะการเข้าเรียน: ${editingStudent?.full_name || ''}`}
      >
        <form onSubmit={handleSaveStatusOverride} className="space-y-4">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
            <p className="text-slate-600">
              รหัสนักศึกษา: <strong className="font-mono text-slate-900">{editingStudent?.student_id}</strong>
            </p>
            <p className="text-slate-600">
              ชื่อ-นามสกุล: <strong className="text-slate-900">{editingStudent?.full_name}</strong>
            </p>
          </div>

          <Select
            label="เลือกสถานะการเข้าเรียนใหม่"
            id="editStatus"
            value={editStatus}
            onChange={(e) => setEditStatus(e.target.value)}
            options={[
              { value: 'Present', label: 'มาเรียน (Present)' },
              { value: 'Late', label: 'มาสาย (Late)' },
              { value: 'Absent', label: 'ขาดเรียน (Absent)' }
            ]}
          />

          <Input
            label="หมายเหตุเพิ่มเติม (ถ้ามี)"
            id="editNote"
            placeholder="เช่น ลากิจ, ยื่นใบลาป่วย, ปรับโดยอาจารย์"
            value={editNote}
            onChange={(e) => setEditNote(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsEditModalOpen(false)}>
              ยกเลิก
            </Button>
            <Button type="submit" variant="primary">
              บันทึกการแก้ไขสถานะ
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AttendanceListPage;
