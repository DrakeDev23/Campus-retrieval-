import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  MapPin,
  Calendar,
  ChevronRight,
  PackageCheck,
  Search,
  ExternalLink,
} from './icons';
import { CLAIM_STAGES } from './mockData';
import ClaimMessagesThread from './ClaimMessagesThread';

export default function ClaimsTrackingView({ claims = [], unreadCounts }) {
  const [searchParams] = useSearchParams();
  const claimIdFromUrl = searchParams.get('claimId');
  const [selectedClaimId, setSelectedClaimId] = useState(() => claimIdFromUrl || claims[0]?.id || '');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedPin, setCopiedPin] = useState(false);

  useEffect(() => {
    if (claimIdFromUrl && claims.some((c) => c.id === claimIdFromUrl)) {
      setSelectedClaimId(claimIdFromUrl);
    } else if ((!selectedClaimId || !claims.some((c) => c.id === selectedClaimId)) && claims[0]?.id) {
      setSelectedClaimId(claims[0].id);
    }
  }, [claimIdFromUrl, claims]);

  const filteredClaims = claims.filter((c) => {
    const matchesSearch =
      c.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.referenceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterStatus === 'all') return true;
    if (filterStatus === 'in-progress') return c.currentStage < 5;
    if (filterStatus === 'ready') return c.currentStage === 5;
    if (filterStatus === 'retrieved') return c.currentStage === 6;
    return true;
  });

  const selectedClaim = claims.find((c) => c.id === selectedClaimId) || filteredClaims[0] || claims[0];

  const handleCopyPin = (pin) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(pin);
      setCopiedPin(true);
      setTimeout(() => setCopiedPin(false), 2000);
    }
  };

  const currentStageIndex = selectedClaim?.currentStage || 1;
  const progressPercent = Math.round(((currentStageIndex - 1) / (CLAIM_STAGES.length - 1)) * 100);

  const totalCount = claims.length;
  const inProgressCount = claims.filter((c) => c.currentStage < 5).length;
  const readyCount = claims.filter((c) => c.currentStage === 5).length;
  const retrievedCount = claims.filter((c) => c.currentStage === 6).length;

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Official Institutional Claims Portal</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              My Claims & Retrieval Tracking
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Comprehensive claim lifecycle management, timestamped security verification logs, digital locker pickup PINs, and finalized retrieval receipts.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center min-w-[85px]">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Total Claims</span>
              <span className="text-lg font-extrabold text-slate-900">{totalCount}</span>
            </div>
            <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl text-center min-w-[85px]">
              <span className="text-[10px] font-semibold text-amber-700 uppercase tracking-wider block">In Review</span>
              <span className="text-lg font-extrabold text-amber-900">{inProgressCount}</span>
            </div>
            <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl text-center min-w-[85px]">
              <span className="text-[10px] font-semibold text-blue-700 uppercase tracking-wider block">Ready Pickup</span>
              <span className="text-lg font-extrabold text-blue-900">{readyCount}</span>
            </div>
            <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl text-center min-w-[85px]">
              <span className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider block">Retrieved</span>
              <span className="text-lg font-extrabold text-emerald-900">{retrievedCount}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mt-6 pt-5 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                filterStatus === 'all'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              All Claims ({totalCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('in-progress')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                filterStatus === 'in-progress'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              In Verification ({inProgressCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('ready')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                filterStatus === 'ready'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              Ready for Pickup ({readyCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('retrieved')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                filterStatus === 'retrieved'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              Retrieved & Reunited ({retrievedCount})
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search claims or ref ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Select Claim Record ({filteredClaims.length})
            </h2>
            <span className="text-[11px] text-slate-400">Click to inspect</span>
          </div>

          {filteredClaims.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
              No claims match your search or filter.
            </div>
          ) : (
            filteredClaims.map((claim) => {
              const isSelected = claim.id === selectedClaim?.id;
              return (
                <div
                  key={claim.id}
                  onClick={() => setSelectedClaimId(claim.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer text-left ${
                    isSelected
                      ? 'bg-white border-blue-500 ring-2 ring-blue-500/10 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60 shadow-2xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[11px] font-mono font-bold text-slate-500">
                      {claim.referenceNo}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {unreadCounts?.byClaim?.[claim.id] > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white animate-pulse" title="Unread messages">
                          {unreadCounts.byClaim[claim.id]} new
                        </span>
                      )}
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${claim.statusBadge}`}>
                        {claim.status}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-1">
                    {claim.itemName}
                  </h3>

                  <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-500">
                    <span>{claim.category}</span>
                    <span>&bull;</span>
                    <span>{claim.dateSubmitted}</span>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${
                        claim.currentStage === 6
                          ? 'bg-emerald-500'
                          : claim.currentStage === 5
                          ? 'bg-blue-600'
                          : 'bg-amber-500'
                      }`} />
                      Stage {claim.currentStage} of 6
                    </span>
                    <span className="text-blue-600 font-semibold text-[11px] inline-flex items-center gap-0.5">
                      View Dossier <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {selectedClaim && (
          <div className="lg:col-span-7 space-y-5">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
                      {selectedClaim.referenceNo}
                    </span>
                    <span className="text-xs text-slate-400">&bull;</span>
                    <span className="text-xs font-medium text-slate-500">{selectedClaim.category}</span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                    {selectedClaim.itemName}
                  </h2>
                </div>
                <div className="self-start sm:self-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${selectedClaim.statusBadge}`}>
                    {selectedClaim.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-5 p-4 rounded-xl bg-slate-50/80 border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-400 font-medium block">Custody Location</span>
                  <span className="font-bold text-slate-800 mt-0.5 block">{selectedClaim.custodyLocation}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Date Submitted</span>
                  <span className="font-semibold text-slate-800 mt-0.5 block">{selectedClaim.dateSubmitted}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Assigned Officer</span>
                  <span className="font-semibold text-slate-800 mt-0.5 block">{selectedClaim.assignedOfficer}</span>
                </div>
              </div>

              <div className="pt-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
                  <span>Lifecycle: Stage {currentStageIndex} of {CLAIM_STAGES.length}</span>
                  <span className="text-blue-700 font-bold">{progressPercent}% Completed</span>
                </div>

                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden mb-5">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      currentStageIndex === 6
                        ? 'bg-emerald-600'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600'
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                  {CLAIM_STAGES.map((st) => {
                    const isPast = st.step < currentStageIndex;
                    const isCurrent = st.step === currentStageIndex;

                    return (
                      <div
                        key={st.step}
                        className={`p-2 rounded-xl border text-left text-[11px] transition ${
                          isCurrent
                            ? 'border-amber-300 bg-amber-50/70 shadow-2xs'
                            : isPast
                            ? 'border-blue-100 bg-blue-50/40'
                            : 'border-slate-100 bg-slate-50/40 text-slate-400'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0 ${
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
                            <span className="text-[9px] font-extrabold text-amber-700 uppercase">
                              Active
                            </span>
                          )}
                        </div>
                        <p className={`font-bold leading-tight line-clamp-1 ${isCurrent ? 'text-amber-900' : isPast ? 'text-slate-800' : 'text-slate-400'}`}>
                          {st.label}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {selectedClaim.status === 'Rejected' && (
              <div className="p-5 sm:p-6 rounded-2xl bg-rose-50 border border-rose-200 shadow-2xs">
                <div className="flex items-center gap-2.5 mb-2">
                  <span className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center font-bold">
                    <AlertTriangle className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-rose-950">
                      Claim Not Approved
                    </h3>
                    <p className="text-[11px] text-rose-700">
                      Reviewed on {selectedClaim.rejectionDate || 'Recently'}
                    </p>
                  </div>
                </div>
                <div className="mt-3 p-3.5 bg-white rounded-xl border border-rose-100 text-xs">
                  <span className="text-[11px] font-bold text-rose-900 block mb-1">Administrative Explanation:</span>
                  <p className="text-rose-800 leading-relaxed">
                    {selectedClaim.rejectionReason || 'The submitted proof did not match security intake verification records.'}
                  </p>
                </div>
              </div>
            )}

            {selectedClaim.status === 'Needs More Info' && (
              <div className="p-5 sm:p-6 rounded-2xl bg-amber-50 border border-amber-200 shadow-2xs">
                <div className="flex items-center gap-2.5 mb-2">
                  <span className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold">
                    <Clock className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-amber-950">
                      Additional Information Requested
                    </h3>
                    <p className="text-[11px] text-amber-700">
                      Officer request sent on {selectedClaim.requestInfoDate || 'Recently'}
                    </p>
                  </div>
                </div>
                <div className="mt-3 p-3.5 bg-white rounded-xl border border-amber-100 text-xs">
                  <span className="text-[11px] font-bold text-amber-900 block mb-1">Officer Message:</span>
                  <p className="text-amber-800 leading-relaxed">
                    {selectedClaim.requestInfoMessage || 'Please provide further identifying details to proceed with verification.'}
                  </p>
                </div>
              </div>
            )}

            {selectedClaim.currentStage === 5 && selectedClaim.pickupPass && (
              <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 text-white shadow-lg border border-blue-800/50">
                <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center justify-center font-bold">
                      <ShieldCheck className="w-4 h-4" />
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-white tracking-wide uppercase">
                        Digital Retrieval Pass & Locker PIN
                      </h3>
                      <p className="text-[11px] text-blue-200">Authorized by Campus Security</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    Active Pass
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-[11px] font-medium text-blue-200 block">Pickup Location</span>
                    <span className="text-xs font-bold text-white mt-0.5 block">{selectedClaim.pickupPass.station}</span>
                    <span className="text-[10px] text-blue-300 mt-2 block">{selectedClaim.pickupPass.expiry}</span>
                  </div>

                  <div className="p-4 rounded-xl bg-white/10 border border-white/20 text-center flex flex-col items-center justify-center">
                    <span className="text-[10px] font-semibold text-blue-200 uppercase tracking-widest block mb-1">
                      Counter / Locker PIN
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl sm:text-3xl font-mono font-extrabold tracking-widest text-amber-300">
                        {selectedClaim.pickupPass.pin}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyPin(selectedClaim.pickupPass.pin)}
                        className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[10px] font-semibold transition cursor-pointer"
                        title="Copy PIN"
                      >
                        {copiedPin ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <span className="text-[10px] text-white/60 font-mono mt-1">Pass ID: {selectedClaim.pickupPass.code}</span>
                  </div>
                </div>

                <p className="mt-3 text-[11px] text-blue-200/90 leading-relaxed bg-white/5 p-3 rounded-xl border border-white/10">
                  {selectedClaim.pickupPass.notes}
                </p>
              </div>
            )}

            {selectedClaim.currentStage === 6 && selectedClaim.retrievalReceipt && (
              <div className="p-5 sm:p-6 rounded-2xl bg-emerald-50/80 border border-emerald-200 shadow-2xs">
                <div className="flex items-center gap-2.5 mb-3">
                  <span className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                    <PackageCheck className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-emerald-950">
                      Official Handover Receipt & Case Resolution
                    </h3>
                    <p className="text-[11px] text-emerald-800">Item successfully returned to verified student owner</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-xs">
                  <div className="p-3 bg-white rounded-xl border border-emerald-100">
                    <span className="text-slate-400 font-medium block text-[11px]">Handover Timestamp</span>
                    <span className="font-bold text-slate-800 mt-0.5 block">{selectedClaim.retrievalReceipt.releasedAt}</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-emerald-100">
                    <span className="text-slate-400 font-medium block text-[11px]">Releasing Officer</span>
                    <span className="font-bold text-slate-800 mt-0.5 block">{selectedClaim.retrievalReceipt.releasedBy}</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-emerald-100">
                    <span className="text-slate-400 font-medium block text-[11px]">Student Confirmation</span>
                    <span className="font-bold text-slate-800 mt-0.5 block">{selectedClaim.retrievalReceipt.signedBy}</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-emerald-100">
                    <span className="text-slate-400 font-medium block text-[11px]">Official Receipt #</span>
                    <span className="font-mono font-bold text-emerald-700 mt-0.5 block">{selectedClaim.retrievalReceipt.receiptNo}</span>
                  </div>
                </div>
              </div>
            )}

            <ClaimMessagesThread claimId={selectedClaim.id} claim={selectedClaim} />

            <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                Official Verification Audit Trail
              </h3>

              <div className="space-y-4">
                {selectedClaim.timeline?.map((event, idx) => (
                  <div key={idx} className="flex items-start gap-3 relative">
                    <div className="flex flex-col items-center">
                      <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0 shadow-2xs">
                        ✓
                      </span>
                      {idx < selectedClaim.timeline.length - 1 && (
                        <div className="w-0.5 h-7 bg-blue-200 mt-1" />
                      )}
                    </div>
                    <div className="flex-1 pt-0.5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span className="text-xs font-bold text-slate-900">
                          {event.title}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {event.date}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                        {event.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Submitted Ownership Proof & Evidence
              </h3>
              <div className="text-xs text-slate-700 bg-slate-50 border border-slate-200/80 p-3.5 rounded-xl leading-relaxed space-y-2">
                <p>
                  <span className="font-semibold text-slate-900">Ownership Description: </span>
                  {selectedClaim.submittedProof}
                </p>
                {selectedClaim.privateDetails && (
                  <p className="pt-2 border-t border-slate-200/70">
                    <span className="font-semibold text-slate-900">Private Identifying Details: </span>
                    {selectedClaim.privateDetails}
                  </p>
                )}
              </div>
              {selectedClaim.proofPhoto && (
                <div className="w-full max-w-xs rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                  <img
                    src={selectedClaim.proofPhoto}
                    alt={`Proof for ${selectedClaim.itemName}`}
                    className="w-full h-40 object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 text-xs text-slate-600">
        <h4 className="font-bold text-slate-900 mb-1">
          CampusRetrieval Policy & Integrity Protocol
        </h4>
        <p className="text-slate-500 leading-relaxed text-[11px]">
          All claims filed through the student portal are subject to administrative cross-referencing against physical intake logs, CCTV timestamps, and student ID verification. Completed retrievals generate an immutable audit receipt to prevent fraudulent pickup.
        </p>
      </div>
    </div>
  );
}
