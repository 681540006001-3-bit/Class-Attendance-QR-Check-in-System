import React, { useState, useEffect } from 'react';
import {
  getCourses,
  addCourse,
  updateCourse,
  deleteCourse,
  getStudentsByCourse,
  getSessionsByCourse
} from '../../services/storageService';
import { generateId } from '../../utils/codeGenerator';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import ConfirmModal from '../../components/common/ConfirmModal';
import EmptyState from '../../components/common/EmptyState';
import { BookOpen, Plus, Search, Edit3, Trash2, Users, CalendarCheck } from 'lucide-react';

export const CourseManagementPage = () => {
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [deletingCourseId, setDeletingCourseId] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    course_code: '',
    course_name: '',
    section: '1',
    semester: '1',
    academic_year: '2026',
    teacher_name: 'ดร.สมชาย ใจดี'
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    loadCourses();
    const handleStorage = () => loadCourses();
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const loadCourses = () => {
    setCourses(getCourses());
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
    if (!formData.course_code.trim()) errors.course_code = 'กรุณากรอกรหัสวิชา';
    if (!formData.course_name.trim()) errors.course_name = 'กรุณากรอกชื่อรายวิชา';
    if (!formData.section.trim()) errors.section = 'กรุณากรอกกลุ่มเรียน (Section)';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenAddModal = () => {
    setEditingCourse(null);
    setFormData({
      course_code: '',
      course_name: '',
      section: '1',
      semester: '1',
      academic_year: '2026',
      teacher_name: 'ดร.สมชาย ใจดี'
    });
    setFormErrors({});
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (course) => {
    setEditingCourse(course);
    setFormData({
      course_code: course.course_code,
      course_name: course.course_name,
      section: course.section,
      semester: course.semester,
      academic_year: course.academic_year,
      teacher_name: course.teacher_name || ''
    });
    setFormErrors({});
    setIsAddModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (editingCourse) {
      updateCourse(editingCourse.id, formData);
    } else {
      addCourse({
        id: generateId('course'),
        ...formData
      });
    }

    loadCourses();
    setIsAddModalOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (deletingCourseId) {
      deleteCourse(deletingCourseId);
      loadCourses();
      setDeletingCourseId(null);
    }
  };

  const filteredCourses = courses.filter(
    (c) =>
      c.course_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.course_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">จัดการรายวิชา (Courses)</h1>
          <p className="text-sm text-slate-500 mt-1">เพิ่ม แก้ไข หรือลบรายวิชาในระบบ</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={handleOpenAddModal}>
          เพิ่มรายวิชาใหม่
        </Button>
      </div>

      {/* Search Bar */}
      <Card className="!p-4">
        <div className="relative">
          <Input
            id="search"
            placeholder="ค้นหารายวิชาด้วย รหัสวิชา หรือ ชื่อวิชา..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={Search}
          />
        </div>
      </Card>

      {/* Course List Grid */}
      {filteredCourses.length === 0 ? (
        <Card>
          <EmptyState
            icon={BookOpen}
            title="ไม่พบรายวิชา"
            description={
              searchTerm
                ? `ไม่พบรายวิชาที่ตรงกับ "${searchTerm}"`
                : 'ยังไม่มีรายวิชาในระบบ คลิกปุ่มเพื่อเพิ่มรายวิชาแรก'
            }
            actionLabel={searchTerm ? 'ล้างคำค้นหา' : 'เพิ่มรายวิชาใหม่'}
            onAction={searchTerm ? () => setSearchTerm('') : handleOpenAddModal}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCourses.map((course) => {
            const studentCount = getStudentsByCourse(course.id).length;
            const sessionCount = getSessionsByCourse(course.id).length;

            return (
              <Card
                key={course.id}
                className="hover:border-primary-300 transition-colors"
                title={
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-primary-100 text-primary-700 text-xs font-bold font-mono">
                      {course.course_code}
                    </span>
                    <span className="text-slate-500 text-xs font-normal">Sec {course.section}</span>
                  </div>
                }
                action={
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditModal(course)}
                      className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      title="แก้ไขรายวิชา"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletingCourseId(course.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="ลบรายวิชา"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                }
              >
                <div className="space-y-4">
                  <div>
                    <h4 className="text-base font-bold text-slate-800 leading-snug">{course.course_name}</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      อาจารย์ผู้สอน: <span className="font-medium text-slate-700">{course.teacher_name || '-'}</span>
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-slate-400" />
                      <span>นักศึกษา: </span>
                      <strong className="text-slate-800 font-bold">{studentCount} คน</strong>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <CalendarCheck className="w-4 h-4 text-slate-400" />
                      <span>คาบเรียน: </span>
                      <strong className="text-slate-800 font-bold">{sessionCount} คาบ</strong>
                    </div>

                    <div className="bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-medium">
                      ภาคเรียน {course.semester}/{course.academic_year}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add / Edit Course Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={editingCourse ? 'แก้ไขข้อมูลรายวิชา' : 'เพิ่มรายวิชาใหม่'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <Input
                label="รหัสวิชา (Course Code)"
                id="course_code"
                placeholder="เช่น EN-013-333"
                value={formData.course_code}
                onChange={handleInputChange}
                error={formErrors.course_code}
                required
              />
            </div>
            <div>
              <Input
                label="กลุ่มเรียน (Section)"
                id="section"
                placeholder="เช่น 1"
                value={formData.section}
                onChange={handleInputChange}
                error={formErrors.section}
                required
              />
            </div>
          </div>

          <Input
            label="ชื่อรายวิชา (Course Name)"
            id="course_name"
            placeholder="เช่น Software Engineering"
            value={formData.course_name}
            onChange={handleInputChange}
            error={formErrors.course_name}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="ภาคการศึกษา (Semester)"
              id="semester"
              placeholder="เช่น 1"
              value={formData.semester}
              onChange={handleInputChange}
            />
            <Input
              label="ปีการศึกษา (Academic Year)"
              id="academic_year"
              placeholder="เช่น 2026"
              value={formData.academic_year}
              onChange={handleInputChange}
            />
          </div>

          <Input
            label="ชื่ออาจารย์ผู้สอน (Teacher Name)"
            id="teacher_name"
            placeholder="เช่น ดร.สมชาย ใจดี"
            value={formData.teacher_name}
            onChange={handleInputChange}
          />

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
              ยกเลิก
            </Button>
            <Button type="submit" variant="primary">
              {editingCourse ? 'บันทึกการแก้ไข' : 'เพิ่มรายวิชา'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingCourseId}
        onClose={() => setDeletingCourseId(null)}
        onConfirm={handleDeleteConfirm}
        title="ยืนยันการลบรายวิชา"
        message="การลบรายวิชาจะทำการลบข้อมูลนักศึกษาในวิชา และคาบเรียนทั้งหมดที่เกี่ยวข้องด้วย คุณแน่ใจหรือไม่?"
        confirmText="ลบรายวิชา"
      />
    </div>
  );
};

export default CourseManagementPage;
