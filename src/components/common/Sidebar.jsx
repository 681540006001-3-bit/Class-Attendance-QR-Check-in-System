import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  CalendarCheck,
  ClipboardList,
  BarChart3
} from 'lucide-react';

export const Sidebar = () => {
  const navItems = [
    {
      to: '/teacher',
      end: true,
      label: 'แผงควบคุม (Dashboard)',
      icon: LayoutDashboard
    },
    {
      to: '/teacher/courses',
      label: 'จัดการรายวิชา (Courses)',
      icon: BookOpen
    },
    {
      to: '/teacher/students',
      label: 'จัดการนักศึกษา (Students)',
      icon: Users
    },
    {
      to: '/teacher/sessions',
      label: 'คาบเรียน & QR Code (Sessions)',
      icon: CalendarCheck
    },
    {
      to: '/teacher/attendance',
      label: 'รายการเช็คชื่อ (Attendance List)',
      icon: ClipboardList
    },
    {
      to: '/teacher/reports',
      label: 'รายงานสรุป (Reports)',
      icon: BarChart3
    }
  ];

  return (
    <aside className="w-full md:w-64 bg-white border-r border-slate-200/80 shrink-0 min-h-[calc(100vh-4rem)] p-4">
      <div className="mb-4 px-3 py-2 bg-slate-50 rounded-xl border border-slate-100">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">
          อาจารย์ผู้สอน
        </span>
        <span className="text-sm font-semibold text-slate-800 block">
          ระบบจัดการการเช็คชื่อ
        </span>
      </div>

      <nav className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 font-semibold shadow-2xs border-l-4 border-primary-600'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
