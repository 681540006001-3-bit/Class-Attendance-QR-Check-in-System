import React, { useState, useEffect } from 'react';
import {
  getCourses,
  getStudents,
  getStudentsByCourse,
  addStudent,
  updateStudent,
  deleteStudent
} from '../../services/storageService';
import { generateId } from '../../utils/codeGenerator';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Modal from '../../components/common/Modal';
import ConfirmModal from '../../components/common/ConfirmModal';
import EmptyState from '../../components/common/EmptyState';
import { Users, UserPlus, Search, Edit3, Trash2, Mail, Filter } from 'lucide-react';

export const StudentManagementPage = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [deletingStudentId, setDeletingStudentId] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    student_id: '',
    full_name: '',
    email: '',
    course_id: ''
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
    loadStudents();
    const handleStorage = () => {
      setCourses(getCourses());
      loadStudents();
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [selectedCourseId]);

  const loadStudents = () => {
    if (selectedCourseId) {
      setStudents(getStudentsByCourse(selectedCourseId));
    } else {
      setStudents(getStudents());
    }
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (formErrors[id]) {
      setFormErrors((prev) => ({ ...prev, [id]: null }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.student_id.trim()) errors.student_id = 'กรุณากรอกรหัสนักศึกษา';
    if (!formData.full_name.trim()) errors.full_name = 'กรุณากรอกชื่อ-นามสกุล';
    if (!formData.course_id) errors.course_id = 'กรุณาเลือกรายวิชา';

    // Duplicate Student ID check within same course
    const existing = getStudentsByCourse(formData.course_id);
    const isDuplicate = existing.some(
      (s) => s.student_id.trim() === formData.student_id.trim() && s.id !== editingStudent?.id
    );
    if (isDuplicate) {
      errors.student_id = 'รหัสนักศึกษานี้มีอยู่ในรายวิชานี้แล้ว';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenAddModal = () => {
    setEditingStudent(null);
    setFormData({
      student_id: '',
      full_name: '',
      email: '',
      course_id: selectedCourseId || (courses[0]?.id || '')
    });
    setFormErrors({});
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (student) => {
    setEditingStudent(student);
    setFormData({
      student_id: student.student_id,
      full_name: student.full_name,
      email: student.email || '',
      course_id: student.course_id
    });
    setFormErrors({});
    setIsAddModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (editingStudent) {
      updateStudent(editingStudent.id, formData);
    } else {
      addStudent({
        id: generateId('std'),
        ...formData
      });
    }

    if (formData.course_id !== selectedCourseId) {
      setSelectedCourseId(formData.course_id);
    } else {
      loadStudents();
    }
    setIsAddModalOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (deletingStudentId) {
      deleteStudent(deletingStudentId);
      loadStudents();
      setDeletingStudentId(null);
    }
  };

  const filteredStudents = students.filter(
    (s) =>
      s.student_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const courseOptions = courses.map((c) => ({
    value: c.id,
    label: `${c.course_code} - ${c.course_name} (Sec ${c.section})`
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">จัดการนักศึกษา (Students)</h1>
          <p className="text-sm text-slate-500 mt-1">เพิ่ม แก้ไข หรือลบรายชื่อนักศึกษาในแต่ละรายวิชา</p>
        </div>
        <Button variant="primary" icon={UserPlus} onClick={handleOpenAddModal} disabled={courses.length === 0}>
          เพิ่มนักศึกษาใหม่
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="!p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <Select
              label="เลือกรายวิชา"
              id="courseFilter"
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              options={courseOptions}
              placeholder="-- แสดงรายวิชาทั้งหมด --"
            />
          </div>
          <div className="md:col-span-2">
            <Input
              label="ค้นหานักศึกษา"
              id="search"
              placeholder="ค้นหาด้วย รหัสนักศึกษา หรือ ชื่อ-นามสกุล..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={Search}
            />
          </div>
        </div>
      </Card>

      {/* Student List Table */}
      {courses.length === 0 ? (
        <Card>
          <EmptyState
            icon={Users}
            title="ยังไม่มีรายวิชาในระบบ"
            description="กรุณาสร้างรายวิชาก่อนเพิ่มรายชื่อนักศึกษา"
          />
        </Card>
      ) : filteredStudents.length === 0 ? (
        <Card>
          <EmptyState
            icon={Users}
            title="ไม่พบนักศึกษา"
            description={
              searchTerm
                ? `ไม่พบนาย/นางสาว ที่ตรงกับคำค้นหา "${searchTerm}"`
                : 'ยังไม่มีนักศึกษาลงทะเบียนในรายวิชานี้'
            }
            actionLabel="เพิ่มนักศึกษาใหม่"
            onAction={handleOpenAddModal}
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
                  <th className="px-6 py-3.5">อีเมล (ถ้ามี)</th>
                  <th className="px-6 py-3.5">รายวิชา</th>
                  <th className="px-6 py-3.5 text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((student, idx) => {
                  const course = courses.find((c) => c.id === student.course_id);

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 text-xs font-medium text-slate-400">{idx + 1}</td>
                      <td className="px-6 py-4 font-mono font-bold text-slate-800">{student.student_id}</td>
                      <td className="px-6 py-4 font-semibold text-slate-800">{student.full_name}</td>
                      <td className="px-6 py-4 text-xs text-slate-500">
                        {student.email ? (
                          <span className="inline-flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            {student.email}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs">
                        <span className="px-2 py-1 rounded bg-slate-100 font-medium text-slate-700">
                          {course ? course.course_code : '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEditModal(student)}
                            className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                            title="แก้ไขข้อมูลนักศึกษา"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingStudentId(student.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="ลบนอกรายวิชา"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Add / Edit Student Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={editingStudent ? 'แก้ไขข้อมูลนักศึกษา' : 'เพิ่มนักศึกษาใหม่'}
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
            label="รหัสนักศึกษา (Student ID)"
            id="student_id"
            placeholder="เช่น 65011001"
            value={formData.student_id}
            onChange={handleInputChange}
            error={formErrors.student_id}
            required
          />

          <Input
            label="ชื่อ-นามสกุล (Full Name)"
            id="full_name"
            placeholder="เช่น นายสมศักดิ์ เรียนดี"
            value={formData.full_name}
            onChange={handleInputChange}
            error={formErrors.full_name}
            required
          />

          <Input
            label="อีเมล (Email - ไม่บังคับ)"
            id="email"
            type="email"
            placeholder="เช่น somsak@univ.ac.th"
            value={formData.email}
            onChange={handleInputChange}
          />

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
              ยกเลิก
            </Button>
            <Button type="submit" variant="primary">
              {editingStudent ? 'บันทึกการแก้ไข' : 'เพิ่มนักศึกษา'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingStudentId}
        onClose={() => setDeletingStudentId(null)}
        onConfirm={handleDeleteConfirm}
        title="ยืนยันการลบนักศึกษา"
        message="คุณแน่ใจหรือไม่ว่าต้องการลบรายชื่อนักศึกษานี้ออกจากรายวิชา?"
        confirmText="ลบนักศึกษา"
      />
    </div>
  );
};

export default StudentManagementPage;
