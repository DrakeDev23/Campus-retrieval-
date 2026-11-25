import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { PlusCircle, PackagePlus } from './icons';

export default function WelcomeBanner({
  semester = 'AY 2026–2027 • 1st Semester',
  onOpenReportLost,
  onOpenReportFound,
}) {
  const { user } = useAuth();
  const studentName = user?.firstName || 'Jane';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-2xs">
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

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
        <div className="flex items-center gap-2">
          {onOpenReportLost && (
            <button
              type="button"
              onClick={onOpenReportLost}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-2xs transition cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Report Lost</span>
            </button>
          )}
          {onOpenReportFound && (
            <button
              type="button"
              onClick={onOpenReportFound}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
            >
              <PackagePlus className="w-3.5 h-3.5 text-slate-500" />
              <span>Report Found</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
