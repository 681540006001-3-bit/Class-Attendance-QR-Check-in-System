import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { QrCode, BookOpen, RotateCcw, Home, GraduationCap } from 'lucide-react';
import { resetStorageToSeed } from '../../services/storageService';

export const Navbar = () => {
  const location = useLocation();
  const isTeacher = location.pathname.startsWith('/teacher');

  const handleResetDemo = () => {
    if (window.confirm('คุณต้องการรีเซ็ตข้อมูลตัวอย่างทั้งหมด (Demo Data) หรือไม่?')) {
      resetStorageToSeed();
      window.location.reload();
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & System Title */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="p-2 bg-gradient-to-tr from-primary-600 to-primary-500 rounded-xl text-white shadow-md shadow-primary-500/20 group-hover:scale-105 transition-transform">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <span className="text-base font-bold text-slate-800 tracking-tight block">
                QR Attendance Check-in
              </span>
              <span className="text-xs text-primary-600 font-medium hidden sm:block">
                ระบบเช็คชื่อเข้าเรียนด้วย QR Code
              </span>
            </div>
          </Link>

          {/* Quick Navigation Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                location.pathname === '/'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">หน้าแรก</span>
            </Link>

            <Link
              to="/student-checkin"
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                location.pathname === '/student-checkin'
                  ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-300'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>นักศึกษาเช็คชื่อ</span>
            </Link>

            <Link
              to="/teacher"
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isTeacher
                  ? 'bg-primary-600 text-white shadow-sm ring-2 ring-primary-300'
                  : 'bg-primary-50 text-primary-700 hover:bg-primary-100 border border-primary-200'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>ระบบอาจารย์</span>
            </Link>

            {/* Presentation Demo Reset Button */}
            <button
              onClick={handleResetDemo}
              title="รีเซ็ตข้อมูลตัวอย่างกลับเป็นค่าเริ่มต้น"
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors ml-1"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
