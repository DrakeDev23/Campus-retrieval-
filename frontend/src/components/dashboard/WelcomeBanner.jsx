import React from 'react';
import { useAuth } from '../../context/AuthContext';

export default function WelcomeBanner({ semester = 'AY 2026–2027 • 1st Semester' }) {
  const { user } = useAuth();
  const studentName = user?.firstName || 'Jane';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div className="inline-block px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600 text-xs font-medium mb-2">
          {semester}
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Welcome back, {studentName}!
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-xl">
          Report lost belongings, submit found item reports, and track your active verification claims.
        </p>
      </div>

      <div className="text-xs text-slate-500 border-t sm:border-t-0 sm:border-l border-slate-100 pt-3 sm:pt-0 sm:pl-6 shrink-0">
        <p className="font-semibold text-slate-800">Campus Retrieval Desk</p>
        <p className="text-slate-400 text-[11px] mt-0.5">Student Center Room 104 • Mon–Fri 8AM–5PM</p>
      </div>
    </div>
  );
}
