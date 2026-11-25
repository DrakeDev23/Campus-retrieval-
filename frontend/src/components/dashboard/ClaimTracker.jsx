import React from 'react';
import { ChevronRight } from './icons';
import { CLAIM_STAGES } from './mockData';

export default function ClaimTracker({ claim, onViewAllClaims }) {
  if (!claim) return null;

  const currentStageIndex = claim.currentStage || 3;
  const progressPercent = Math.round(((currentStageIndex - 1) / (CLAIM_STAGES.length - 1)) * 100);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 transition hover:shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Active Claim Tracker
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            {claim.itemName}
          </h2>
          <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Ref: {claim.referenceNo}</span>
            <span>&bull;</span>
            <span>Submitted {claim.dateSubmitted}</span>
            <span>&bull;</span>
            <span className="text-slate-600 font-medium">
              {claim.custodyLocation}
            </span>
          </div>
        </div>

        {onViewAllClaims && (
          <button
            type="button"
            onClick={onViewAllClaims}
            className="self-start sm:self-center inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-blue-700 transition shadow-2xs cursor-pointer"
          >
            <span>View All Claims & Passes</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="pt-6">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-3">
          <span>Progress: Stage {currentStageIndex} of {CLAIM_STAGES.length}</span>
          <span className="text-blue-700 font-bold">{progressPercent}% Completed</span>
        </div>

        <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden mb-6">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {CLAIM_STAGES.map((st) => {
            const isPast = st.step < currentStageIndex;
            const isCurrent = st.step === currentStageIndex;

            return (
              <div
                key={st.step}
                className={`flex flex-col p-2.5 rounded-xl border text-left transition ${
                  isCurrent
                    ? 'border-amber-300 bg-amber-50/70 shadow-2xs'
                    : isPast
                    ? 'border-blue-100 bg-blue-50/40'
                    : 'border-slate-100 bg-slate-50/40 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`w-6 h-6 rounded-full text-[11px] font-bold flex items-center justify-center shrink-0 ${
                      isCurrent
                        ? 'bg-amber-500 text-white shadow-2xs animate-pulse'
                        : isPast
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {isPast ? '✓' : st.step}
                  </span>
                  {isCurrent && (
                    <span className="text-[10px] font-extrabold text-amber-700 uppercase tracking-wider">
                      Current
                    </span>
                  )}
                </div>
                <p className={`text-xs font-bold leading-tight ${isCurrent ? 'text-amber-900' : isPast ? 'text-slate-800' : 'text-slate-400'}`}>
                  {st.label}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                  {st.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
