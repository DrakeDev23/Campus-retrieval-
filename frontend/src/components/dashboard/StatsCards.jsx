import React from 'react';

export default function StatsCards({ stats, onSelectCard }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
        {stats.map((stat) => (
          <button
            key={stat.id}
            type="button"
            onClick={() => onSelectCard && onSelectCard(stat.id)}
            className="w-full text-left p-5 sm:p-6 hover:bg-slate-50/70 transition group focus:outline-none cursor-pointer"
          >
            <p className="text-xs font-semibold text-slate-500 mb-1 group-hover:text-blue-600 transition-colors">
              {stat.title}
            </p>
            <p className="text-3xl font-bold text-slate-900 tracking-tight mb-2 group-hover:text-blue-600 transition-colors">
              {stat.value}
            </p>
            <p className="text-xs font-medium text-slate-700">
              {stat.highlight}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {stat.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
