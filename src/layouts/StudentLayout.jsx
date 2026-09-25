import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';

export const StudentLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-100 to-slate-200 flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default StudentLayout;
