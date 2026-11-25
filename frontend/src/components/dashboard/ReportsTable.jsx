import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, ExternalLink, ShieldCheck, FileText, Sparkles, ImageIcon, Eye } from './icons';

export default function ReportsTable({ reports, onOpenReportLost, onViewAllReports }) {
  const [selectedReport, setSelectedReport] = useState(null);

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 transition hover:shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                My Active Lost Reports
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              Recent Lost Belonging Submissions
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onOpenReportLost}
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-2xs transition cursor-pointer"
            >
              + File Report
            </button>
            {onViewAllReports && (
              <button
                type="button"
                onClick={onViewAllReports}
                className="text-xs font-semibold text-blue-700 hover:text-blue-800 transition cursor-pointer"
              >
                View All Reports ({reports.length})
              </button>
            )}
          </div>
        </div>

        <div className="mt-4 divide-y divide-slate-100">
          {reports.map((rep) => (
            <div
              key={rep.id}
              className="py-4 first:pt-1 last:pb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
            >
              <div className="flex items-start gap-3.5 min-w-0 flex-1">
                {rep.image ? (
                  <div
                    onClick={() => setSelectedReport(rep)}
                    className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 shadow-2xs cursor-pointer group/img"
                  >
                    <img
                      src={rep.image}
                      alt={rep.itemName}
                      className="w-full h-full object-cover group-hover/img:scale-105 transition duration-200"
                    />
                    <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover/img:opacity-100 transition flex items-center justify-center">
                      <Eye className="w-4 h-4 text-white" />
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => setSelectedReport(rep)}
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col items-center justify-center text-slate-400 shrink-0 cursor-pointer"
                  >
                    <ImageIcon className="w-5 h-5 text-slate-300" />
                    <span className="text-[9px] text-slate-400 font-medium mt-0.5">No photo</span>
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3
                      onClick={() => setSelectedReport(rep)}
                      className="text-sm font-bold text-slate-900 truncate hover:text-blue-600 transition cursor-pointer"
                    >
                      {rep.itemName}
                    </h3>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                      {rep.category}
                    </span>
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${rep.statusColor}`}>
                      {rep.status}
                    </span>
                    {rep.hasMatch && (
                      <span className="inline-block text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-300">
                        Potential Match Found
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="font-semibold text-slate-700">Ref: {rep.id}</span>
                    <span>&bull;</span>
                    <span>{rep.locationLost}</span>
                    <span>&bull;</span>
                    <span>{rep.dateLost}</span>
                  </div>

                  {rep.hasMatch && (
                    <p className="mt-2 text-xs text-amber-900/90 font-medium bg-amber-50/70 border border-amber-200/80 rounded-lg p-2 max-w-xl">
                      <strong className="font-semibold text-amber-950">Intake Match:</strong> {rep.matchedItemTitle}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                <button
                  type="button"
                  onClick={() => setSelectedReport(rep)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition shadow-2xs cursor-pointer"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedReport &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto"
            onClick={(e) => {
              if (e.target === e.currentTarget) setSelectedReport(null);
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="report-modal-title"
          >
            <div className="relative bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 my-auto">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                    <FileText className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 id="report-modal-title" className="text-base font-bold text-slate-900">
                      Report Details
                    </h3>
                    <p className="text-xs text-slate-500">ID: {selectedReport.id}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedReport(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                  aria-label="Close report details"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="my-5 space-y-3.5 text-xs">
                {selectedReport.image && (
                  <div className="w-full h-44 sm:h-48 rounded-xl overflow-hidden bg-slate-900 border border-slate-200 relative shadow-2xs group">
                    <img
                      src={selectedReport.image}
                      alt={selectedReport.itemName}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-2.5 left-2.5 text-[10px] font-semibold bg-slate-900/80 text-white px-2.5 py-1 rounded-md backdrop-blur-xs">
                      Attached Item Photo
                    </span>
                  </div>
                )}

                <div>
                  <span className="text-slate-400 font-medium">Item Name</span>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">{selectedReport.itemName}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div>
                    <span className="text-slate-400 font-medium">Category</span>
                    <p className="font-semibold text-slate-800">{selectedReport.category}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Status</span>
                    <p className="font-semibold text-slate-800">{selectedReport.status}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Location Lost</span>
                    <p className="font-semibold text-slate-800">{selectedReport.locationLost}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Date Lost</span>
                    <p className="font-semibold text-slate-800">{selectedReport.dateLost}</p>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 font-medium">Detailed Description</span>
                  <p className="mt-1 text-slate-700 leading-relaxed bg-slate-50/70 border border-slate-100 p-3 rounded-xl">
                    {selectedReport.description}
                  </p>
                </div>

                {selectedReport.hasMatch && (
                  <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
                    <p className="font-bold text-xs flex items-center gap-1.5 text-amber-950 mb-1">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      Potential Match in System
                    </p>
                    <p className="text-xs text-amber-900/90 leading-relaxed">
                      {selectedReport.matchedItemTitle}
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedReport(null)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
