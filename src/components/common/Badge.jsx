import React from 'react';

export const Badge = ({ variant = 'default', children, className = '' }) => {
  const variants = {
    // Attendance Statuses
    Present: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
    Late: 'bg-amber-100 text-amber-800 border border-amber-200',
    Absent: 'bg-rose-100 text-rose-800 border border-rose-200',
    
    // Session Statuses
    Open: 'bg-emerald-500 text-white font-medium shadow-sm animate-pulse',
    Closed: 'bg-slate-500 text-white font-medium',
    Cancelled: 'bg-rose-500 text-white font-medium',

    // Generic UI
    primary: 'bg-primary-100 text-primary-800 border border-primary-200',
    secondary: 'bg-slate-100 text-slate-700 border border-slate-200',
    default: 'bg-slate-100 text-slate-800',
  };

  const selectedVariant = variants[variant] || variants.default;

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${selectedVariant} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
