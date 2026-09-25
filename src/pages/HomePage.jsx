import React from 'react';
import { Link } from 'react-router-dom';
import { QrCode, BookOpen, GraduationCap, ShieldCheck, Clock, CheckCircle2 } from 'lucide-react';
import Navbar from '../components/common/Navbar';
import Button from '../components/common/Button';

export const HomePage = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary-900 via-primary-800 to-slate-900 text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="relative max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-primary-200">
            <QrCode className="w-4 h-4 text-emerald-400" />
            <span>ระบบเช็คชื่อเข้าเรียนด้วย QR Code สำหรับรายวิชา</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            ยกระดับการเช็คชื่อเข้าเรียน <br />
            <span className="bg-gradient-to-r from-emerald-400 via-sky-300 to-primary-200 bg-clip-text text-transparent">
              รวดเร็ว แม่นยำ ป้องกันการเช็คชื่อซ้ำ
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300 font-normal leading-relaxed">
            ระบบบริหารจัดการการเข้าเรียนยุคใหม่ ช่วยให้อาจารย์สร้างรหัสคาบเรียนและ QR Code ได้ในไม่กี่วินาที
            พร้อมให้นักศึกษาสแกนเช็คชื่อผ่านมือถืออย่างง่ายดาย
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link to="/teacher">
              <Button size="lg" variant="primary" icon={BookOpen} className="w-full sm:w-auto text-base py-3 px-8 shadow-lg shadow-primary-500/30">
                เข้าสู่ระบบอาจารย์ (Teacher Portal)
              </Button>
            </Link>

            <Link to="/student-checkin">
              <Button size="lg" variant="success" icon={GraduationCap} className="w-full sm:w-auto text-base py-3 px-8 shadow-lg shadow-emerald-500/30">
                นักศึกษาเช็คชื่อ (Student Check-in)
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Highlights Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-slate-800">จุดเด่นของระบบเช็คชื่อด้วย QR Code</h2>
          <p className="text-sm text-slate-500 mt-1">ออกแบบมาเพื่อให้การจัดการเช็คชื่อในชั้นเรียนเป็นเรื่องง่ายและมีประสิทธิภาพ</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="w-12 h-12 bg-primary-100 rounded-xl text-primary-600 flex items-center justify-center">
              <QrCode className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800">QR Code & Session Code</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              อาจารย์เปิดแสดง QR Code บนหน้าจอ หรือให้นักศึกษากรอกรหัส Session 8 หลักเพื่อเช็คชื่อเข้าเรียนได้ทันที
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl text-emerald-600 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800">คำนวณการมาสายอัตโนมัติ</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              ระบบตรวจสอบเวลาเช็คชื่อจริงเปรียบเทียบกับเกณฑ์เวลามาสาย (Late Cutoff) และบันทึกสถานะ Present / Late โดยอัตโนมัติ
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="w-12 h-12 bg-rose-100 rounded-xl text-rose-600 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800">ป้องกันการเช็คชื่อซ้ำ</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              ระบบตรวจสอบรายชื่อนักศึกษาในรายวิชา และป้องกันไม่ให้นักศึกษาเช็คชื่อซ้ำใน Session เดียวกัน
            </p>
          </div>
        </div>

        {/* Roles Quick Access */}
        <div className="mt-16 bg-gradient-to-r from-slate-900 to-primary-950 text-white rounded-3xl p-8 sm:p-10 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-2xl font-bold">พร้อมสำหรับการนำเสนอและใช้งานในชั้นเรียน!</h3>
            <p className="text-slate-300 text-sm max-w-xl">
              รองรับการทำงานเต็มรูปแบบผ่าน LocalStorage บันทึกข้อมูลวิชา นักศึกษา คาบเรียน และรายงานสรุปการเข้าเรียน
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3 shrink-0">
            <Link to="/teacher/courses">
              <Button variant="outline" className="text-white border-white/30 hover:bg-white/10">
                จัดการรายวิชา
              </Button>
            </Link>
            <Link to="/teacher/sessions">
              <Button variant="primary">
                สร้างคาบเรียนใหม่
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <p>Class Attendance QR Check-in System &copy; 2026 - University Mini Project</p>
      </footer>
    </div>
  );
};

export default HomePage;
