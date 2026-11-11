import React from 'react';

/**
 * Found-item card used by the "Recently Found" preview on the home page
 * and the full Browse Found Items catalog. Visual design is unchanged
 * from the original inline implementation — only extracted for reuse.
 */
export default function ItemCard({ item }) {
  return (
    <div
      className="bg-white/95 backdrop-blur-sm rounded-2xl border border-slate-200 p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between h-full"
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-4">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
            {item.category}
          </span>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${item.statusColor}`}>
            {item.status}
          </span>
        </div>

        <div className="w-full h-44 sm:h-48 rounded-xl bg-slate-100 border border-slate-200 mb-4 overflow-hidden flex flex-col items-center justify-center relative">
          <div className="flex flex-col items-center justify-center text-slate-400 gap-1.5 select-none">
            <svg className="w-9 h-9 text-slate-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">No photo provided</span>
          </div>
          <img
            src=""
            alt={item.title}
            className="absolute inset-0 w-full h-full object-cover hidden"
            onError={(e) => { e.currentTarget.classList.add('hidden'); }}
            onLoad={(e) => { e.currentTarget.classList.remove('hidden'); }}
          />
        </div>

        <div>
          <h3 className="text-base font-bold text-[#0f172a]">
            {item.title}
          </h3>
          <p className="mt-1 text-sm text-slate-600 leading-relaxed">
            {item.description}
          </p>
        </div>

        <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
          <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
          <span>Private serial # &amp; marks withheld</span>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 space-y-1.5">
          <div className="flex justify-between">
            <span className="text-slate-400">Found:</span>
            <span className="font-medium text-slate-700">{item.foundTime}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Location:</span>
            <span className="font-medium text-slate-700">{item.location}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Custody:</span>
            <span className={`font-medium ${item.custodyColor}`}>{item.custody}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2">
        <button type="button" className="flex-1 py-2 px-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition text-center">
          View Details
        </button>
        {item.buttonType === 'claim' ? (
          <button type="button" className="flex-1 py-2 px-3 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition text-center">
            Claim Item
          </button>
        ) : (
          <button type="button" disabled className="flex-1 py-2 px-3 text-xs font-semibold text-slate-400 bg-slate-50 rounded-lg cursor-not-allowed text-center border border-slate-200">
            Case Closed
          </button>
        )}
      </div>
    </div>
  );
}
