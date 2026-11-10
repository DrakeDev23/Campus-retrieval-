import React from 'react';

export default function StatsSection() {
  const stats = [
    {
      badge: 'Reunited',
      value: '1,840+',
      title: 'Recovered & Returned',
      description: 'Misplaced items returned safely to verified students & staff.',
    },
    {
      badge: 'Success',
      value: '98.4%',
      title: 'Retrieval Success Rate',
      description: 'Claims resolved through multi-point ownership validation.',
    },
    {
      badge: 'Intake',
      value: '< 24 Hours',
      title: 'Avg. Custody Intake',
      description: 'Average time from turn-in to public verified portal listing.',
    },
    {
      badge: 'Access',
      value: '14 Lockers',
      title: 'Campus Drop-off Lockers',
      description: '24/7 smart retrieval lockers across university campus halls.',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <div
          key={stat.badge}
          className="bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition duration-200"
        >
          <div className="mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-md">
              {stat.badge}
            </span>
          </div>
          <div className="text-3xl font-extrabold text-[#0f172a] tracking-tight">
            {stat.value}
          </div>
          <div className="mt-1 text-sm font-semibold text-slate-700">
            {stat.title}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {stat.description}
          </p>
        </div>
      ))}
    </div>
  );
}
