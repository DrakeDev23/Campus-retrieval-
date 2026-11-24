import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function QuickActions({ onOpenReportLost, onOpenReportFound }) {
  const navigate = useNavigate();

  const actions = [
    {
      id: 'lost',
      title: 'Report a Lost Item',
      desc: 'Submit details about a missing belonging on campus.',
      onClick: onOpenReportLost,
      actionText: 'Report Lost',
    },
    {
      id: 'found',
      title: 'Report a Found Item',
      desc: 'Help reunite misplaced items with their rightful owners.',
      onClick: onOpenReportFound,
      actionText: 'Report Found',
    },
    {
      id: 'browse',
      title: 'Browse Campus Items',
      desc: 'Explore officially cataloged lost and found belongings.',
      onClick: () => navigate('/browse-found-items'),
      actionText: 'Browse Catalog',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
      {actions.map((act) => (
        <div
          key={act.id}
          className="bg-white rounded-2xl border border-slate-200/90 p-5 flex flex-col justify-between hover:border-slate-300 transition"
        >
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              {act.title}
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              {act.desc}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={act.onClick}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition cursor-pointer"
            >
              {act.actionText} &rarr;
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
