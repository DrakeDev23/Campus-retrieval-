import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronRight, X, ExternalLink, ShieldCheck } from './icons';
import { CLAIM_STAGES } from './mockData';

export default function ClaimTracker({ claim }) {
  const [trackingModalOpen, setTrackingModalOpen] = useState(false);

  if (!claim) return null;

  const currentStageIndex = claim.currentStage || 3;
  const progressPercent = Math.round(((currentStageIndex - 1) / (CLAIM_STAGES.length - 1)) * 100);

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 transition hover:shadow-xs">
        {/* Header */}
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

          <div className="flex items-center gap-2.5 self-start sm:self-center">
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${claim.statusBadge}`}>
              {claim.status}
            </span>
            <button
              type="button"
              onClick={() => setTrackingModalOpen(true)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-blue-700 transition shadow-2xs cursor-pointer"
            >
              <span>View Full Tracking</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 6-Stage Progress Indicator */}
        <div className="py-6 border-b border-slate-100">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-3">
            <span>Progress: Stage {currentStageIndex} of {CLAIM_STAGES.length}</span>
            <span className="text-blue-700 font-bold">{progressPercent}% Completed</span>
          </div>

          {/* Continuous Progress Bar */}
          <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden mb-6">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Stepper Display */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            {CLAIM_STAGES.map((st) => {
              const isPast = st.step < currentStageIndex;
              const isCurrent = st.step === currentStageIndex;
              const isFuture = st.step > currentStageIndex;

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

        {/* Action Callout & Admin Instructions */}
        <div className="pt-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Next Action Box */}
          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-900 text-xs">
            <p className="font-bold text-amber-950 text-xs mb-1">Next Action Required:</p>
            <p className="text-amber-900/90 leading-relaxed">
              {claim.nextAction}
            </p>
          </div>

          {/* Administrator Instructions */}
          <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 text-blue-900 text-xs">
            <p className="font-bold text-blue-950 text-xs mb-1">Admin Custody Instructions:</p>
            <p className="text-blue-900/90 leading-relaxed">
              {claim.adminNote}
            </p>
          </div>
        </div>
      </div>

      {/* Full Tracking Modal */}
      {trackingModalOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto"
            onClick={(e) => {
              if (e.target === e.currentTarget) setTrackingModalOpen(false);
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="tracking-modal-title"
          >
            <div className="relative bg-white rounded-2xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 my-auto">
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 id="tracking-modal-title" className="text-lg font-bold text-slate-900">
                    Claim Tracking Details
                  </h3>
                  <p className="text-xs text-slate-500">Ref ID: {claim.referenceNo}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setTrackingModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
                  aria-label="Close tracking view"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Item Summary */}
              <div className="my-5 p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Claimed Item:</span>
                  <span className="font-bold text-slate-900">{claim.itemName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Date Filed:</span>
                  <span className="font-semibold text-slate-800">{claim.dateSubmitted}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Custody Location:</span>
                  <span className="font-semibold text-slate-800">{claim.custodyLocation}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Current Status:</span>
                  <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] border ${claim.statusBadge}`}>
                    {claim.status}
                  </span>
                </div>
              </div>

              {/* Step-by-Step Vertical Audit Timeline */}
              <div className="mb-6">
                <p className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
                  Official Verification Workflow (6 Stages)
                </p>
                <div className="space-y-4">
                  {CLAIM_STAGES.map((st) => {
                    const isDone = st.step < currentStageIndex;
                    const isNow = st.step === currentStageIndex;

                    return (
                      <div key={st.step} className="flex items-start gap-3 relative">
                        <div className="flex flex-col items-center">
                          <span
                            className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center shrink-0 ${
                              isNow
                                ? 'bg-amber-500 text-white shadow-xs animate-pulse ring-4 ring-amber-100'
                                : isDone
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-200 text-slate-500'
                            }`}
                          >
                            {isDone ? '✓' : st.step}
                          </span>
                          {st.step < CLAIM_STAGES.length && (
                            <div className={`w-0.5 h-6 mt-1 ${isDone ? 'bg-blue-600' : 'bg-slate-200'}`} />
                          )}
                        </div>
                        <div className="min-w-0 flex-1 pt-0.5">
                          <div className="flex items-center gap-2">
                            <p className={`text-xs font-bold ${isNow ? 'text-amber-900' : isDone ? 'text-slate-900' : 'text-slate-400'}`}>
                              Stage {st.step}: {st.label}
                            </p>
                            {isNow && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                                Active Step
                              </span>
                            )}
                            {isDone && (
                              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                Completed
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">{st.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Close Button */}
              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setTrackingModalOpen(false)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
                >
                  Close Tracking Window
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
