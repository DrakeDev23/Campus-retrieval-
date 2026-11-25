import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  X,
  PackageCheck,
  ChevronRight,
} from '../components/dashboard/icons';
import Sidebar from '../components/dashboard/Sidebar';
import Header from '../components/dashboard/Header';
import AdminActionModal from '../components/admin/AdminActionModal';
import Toast from '../components/common/Toast';
import { useCurrentUser } from '../hooks/useCurrentUser';
import {
  getClaimById,
  getAllClaims,
  getAdminItemDetails,
  advanceClaimStage,
  approveClaim,
  rejectClaim,
  requestMoreInfo,
  getOtherPendingClaims,
} from '../services/adminService';
import { CLAIM_STAGES } from '../components/dashboard/mockData';
import ClaimMessagesThread from '../components/dashboard/ClaimMessagesThread';
import { getUnreadCounts } from '../services/messagesService';

export default function AdminClaimReviewPage() {
  const { claimId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useCurrentUser();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [modalAction, setModalAction] = useState(null);
  const [toast, setToast] = useState(null);

  const { data: messageUnreadCounts } = useQuery({
    queryKey: ['messages', 'unread', user?.role],
    queryFn: () => getUnreadCounts(user),
    refetchInterval: 10000,
    enabled: Boolean(user?.role === 'admin'),
  });

  const { data: claim, isLoading: claimLoading } = useQuery({
    queryKey: ['claim', claimId],
    queryFn: () => getClaimById(claimId, user),
    enabled: Boolean(claimId && user?.role === 'admin'),
  });

  const { data: allClaims = [] } = useQuery({
    queryKey: ['claims', 'admin'],
    queryFn: () => getAllClaims(user),
    enabled: Boolean(user?.role === 'admin'),
  });

  const { data: itemDetails, isLoading: itemLoading } = useQuery({
    queryKey: ['adminItemDetails', claim?.itemId, claim?.itemName],
    queryFn: () => getAdminItemDetails(claim?.itemId, claim?.itemName, user),
    enabled: Boolean(claim && user?.role === 'admin'),
  });

  const otherPendingClaims = claim
    ? getOtherPendingClaims(allClaims, claim.itemId, claim.itemName, claim.id)
    : [];

  const handleActionSuccess = (msg) => {
    queryClient.invalidateQueries({ queryKey: ['claims'] });
    queryClient.invalidateQueries({ queryKey: ['claim', claimId] });
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
    queryClient.invalidateQueries({ queryKey: ['adminFoundItems'] });
    queryClient.invalidateQueries({ queryKey: ['publicFoundItems'] });
    setToast({
      type: 'success',
      title: 'Action Processed Successfully',
      message: msg,
    });
    setModalAction(null);
  };

  const advanceMutation = useMutation({
    mutationFn: () => advanceClaimStage(claim.id, user),
    onSuccess: (updated) => handleActionSuccess(`Claim ${updated.referenceNo} advanced to Stage ${updated.currentStage}: ${updated.status}.`),
    onError: (err) => setToast({ type: 'error', title: 'Action Failed', message: err?.message }),
  });

  const approveMutation = useMutation({
    mutationFn: () => approveClaim(claim.id, user),
    onSuccess: (updated) => handleActionSuccess(`Claim ${updated.referenceNo} APPROVED for retrieval. Locker PIN ${updated.pickupPass?.pin} issued.`),
    onError: (err) => setToast({ type: 'error', title: 'Approval Failed', message: err?.message }),
  });

  const rejectMutation = useMutation({
    mutationFn: (reason) => rejectClaim(claim.id, reason, user),
    onSuccess: (updated) => handleActionSuccess(`Claim ${updated.referenceNo} was marked as Rejected.`),
    onError: (err) => setToast({ type: 'error', title: 'Rejection Failed', message: err?.message }),
  });

  const requestInfoMutation = useMutation({
    mutationFn: (msg) => requestMoreInfo(claim.id, msg, user),
    onSuccess: (updated) => handleActionSuccess(`Information request dispatched to ${claim.claimantName}.`),
    onError: (err) => setToast({ type: 'error', title: 'Request Failed', message: err?.message }),
  });

  const isActionPending =
    advanceMutation.isPending || approveMutation.isPending || rejectMutation.isPending || requestInfoMutation.isPending;

  const handleModalConfirm = (textPayload) => {
    if (modalAction === 'advance') advanceMutation.mutate();
    if (modalAction === 'approve') approveMutation.mutate();
    if (modalAction === 'reject') rejectMutation.mutate(textPayload);
    if (modalAction === 'request-info') requestInfoMutation.mutate(textPayload);
  };

  const isRejected = claim?.status === 'Rejected';
  const isNeedsInfo = claim?.status === 'Needs More Info';
  const isRetrieved = claim?.currentStage === 6;
  const isApproved = claim?.currentStage === 5;

  const canAdvance = !isRejected && !isNeedsInfo && !isRetrieved && !isApproved && (claim?.currentStage || 1) < 4;
  const canApprove = !isRejected && (claim?.currentStage || 1) >= 1 && (claim?.currentStage || 1) <= 4;
  const canReject = !isRetrieved && !isRejected;
  const canRequestInfo = !isRetrieved && !isApproved;

  const currentStageIndex = claim?.currentStage || 1;
  const progressPercent = Math.round(((currentStageIndex - 1) / (CLAIM_STAGES.length - 1)) * 100);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onOpen={() => setSidebarOpen(true)}
        onClose={() => setSidebarOpen(false)}
        activeTab="admin-claims"
        onSelectTab={() => navigate('/admin')}
        profile={{
          fullName: user?.fullName || 'Officer R. Santos',
          studentId: user?.studentId || 'ADMIN-SEC-402',
          badge: 'Security Desk Administrator',
        }}
        messageUnreadCount={messageUnreadCounts?.total || 0}
        mode="admin"
      />

      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          sidebarOpen ? 'lg:pl-72' : 'lg:pl-20'
        }`}
      >
        <Header
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          semester="Admin Security Hub • Terminal #01"
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          <div>
            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition cursor-pointer"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              <span>Back to All Claims</span>
            </button>
          </div>

          {claimLoading && (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-500 font-semibold">Retrieving claim dossier and vault records...</p>
            </div>
          )}

          {!claimLoading && !claim && (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h2 className="text-base font-bold text-slate-900">Claim Not Found</h2>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No active or historical claim matching ID <strong>{claimId}</strong> was found in the database.
              </p>
              <button
                type="button"
                onClick={() => navigate('/admin')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold transition"
              >
                <span>Return to Claims List</span>
              </button>
            </div>
          )}

          {claim && (
            <div className="space-y-6">
              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="font-mono text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200">
                        {claim.referenceNo}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${claim.statusBadge}`}>
                        {claim.status}
                      </span>
                    </div>
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                      {claim.itemName}
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">
                      Submitted on <strong className="text-slate-700">{claim.dateSubmitted}</strong> &bull; Held at{' '}
                      <strong className="text-slate-700">{claim.custodyLocation}</strong>
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {canAdvance && (
                      <button
                        type="button"
                        onClick={() => setModalAction('advance')}
                        disabled={isActionPending}
                        className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-2xs transition cursor-pointer disabled:opacity-50"
                      >
                        Advance to Stage {claim.currentStage + 1}
                      </button>
                    )}

                    {canApprove && (
                      <button
                        type="button"
                        onClick={() => setModalAction('approve')}
                        disabled={isActionPending}
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-2xs transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Approve for Retrieval</span>
                      </button>
                    )}

                    {canRequestInfo && (
                      <button
                        type="button"
                        onClick={() => setModalAction('request-info')}
                        disabled={isActionPending}
                        className="px-3.5 py-2 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-semibold transition cursor-pointer disabled:opacity-50"
                      >
                        Request More Info
                      </button>
                    )}

                    {canReject && (
                      <button
                        type="button"
                        onClick={() => setModalAction('reject')}
                        disabled={isActionPending}
                        className="px-3.5 py-2 rounded-xl border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-semibold transition cursor-pointer disabled:opacity-50"
                      >
                        Reject Claim
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-5 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                    <span className="text-slate-400 font-medium block">Claimant Student</span>
                    <span className="font-bold text-slate-900 mt-0.5 block">{claim.claimantName || 'Jane G. Doe'}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                    <span className="text-slate-400 font-medium block">Student ID Number</span>
                    <span className="font-mono font-bold text-slate-900 mt-0.5 block">{claim.claimantId}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                    <span className="text-slate-400 font-medium block">Assigned Officer</span>
                    <span className="font-semibold text-slate-800 mt-0.5 block">{claim.assignedOfficer || 'Officer R. Santos'}</span>
                  </div>
                </div>

                <div className="pt-6">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
                    <span>Lifecycle: Stage {currentStageIndex} of {CLAIM_STAGES.length}</span>
                    <span className="text-amber-700 font-bold">{progressPercent}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden mb-4">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isRejected ? 'bg-rose-600' : isNeedsInfo ? 'bg-amber-500' : 'bg-gradient-to-r from-amber-500 to-emerald-600'
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {otherPendingClaims.length > 0 && (
                <div
                  role="alert"
                  className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 flex items-start gap-3 text-xs shadow-2xs"
                >
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Attention: {otherPendingClaims.length} other claim(s) filed for this item.</p>
                    <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                      Verify proof carefully before authorizing handover. Multiple claimants have submitted claims for "{claim.itemName}".
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                <div className="bg-white rounded-2xl border border-blue-200 p-5 sm:p-6 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-blue-100">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-blue-600" />
                      <h3 className="text-sm font-bold text-slate-900">
                        1. Claimant's Submitted Private Proof
                      </h3>
                    </div>
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                      Private to Claimant &amp; Admin
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Ownership Description Provided
                    </span>
                    <p className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-100 text-xs text-slate-800 leading-relaxed font-medium">
                      {claim.submittedProof || 'No general description provided.'}
                    </p>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Private Identifying Marks (Serial #, Passcode, Contents)
                    </span>
                    <p className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 leading-relaxed font-mono font-semibold">
                      {claim.privateDetails || 'No private identifying marks submitted.'}
                    </p>
                  </div>

                  {claim.proofPhoto && (
                    <div>
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                        Uploaded Proof Photo
                      </span>
                      <div className="w-full max-w-sm rounded-xl overflow-hidden border border-slate-200 bg-slate-900">
                        <img
                          src={claim.proofPhoto}
                          alt="Submitted Proof"
                          className="w-full h-48 object-cover"
                        />
                      </div>
                    </div>
                  )}

                  {claim.consentAccepted && (
                    <div className="flex items-center gap-2 text-[11px] text-emerald-800 font-semibold bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Claimant signed legal ownership certification</span>
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-2xl border border-amber-300 p-5 sm:p-6 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-amber-100">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-amber-500" />
                      <h3 className="text-sm font-bold text-slate-900">
                        2. Item Vault Record (Hidden Identifiers)
                      </h3>
                    </div>
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-300">
                      Admin Vault Only
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Intake Vault Identifying Marks (Withheld from Public)
                    </span>
                    <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 font-mono font-semibold leading-relaxed">
                      {itemDetails?.hiddenIdentifiers || 'No hidden identifiers logged in vault record.'}
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Physical Custody Location &amp; Intake Details
                    </span>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Custody Facility:</span>
                        <span className="font-bold text-slate-800">{itemDetails?.custody || claim.custodyLocation}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Found Location:</span>
                        <span className="font-semibold text-slate-800">{itemDetails?.location || 'Campus Center'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Intake Timestamp:</span>
                        <span className="font-semibold text-slate-800">{itemDetails?.foundTime || 'Recorded'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                    <p className="font-bold text-slate-800 text-[11px] mb-1">Verification Standard:</p>
                    <p className="text-[11px] leading-relaxed text-slate-500">
                      Compare the serial numbers, hardware MAC addresses, engravings, and custom hallmarks on both sides. Once verified, click <strong>"Approve for Retrieval"</strong> to issue the pickup pass and 6-digit locker PIN.
                    </p>
                  </div>
                </div>
              </div>

              {claim.currentStage === 5 && claim.pickupPass && (
                <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950 to-slate-900 text-white border border-indigo-800 shadow-md">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                      Active Retrieval Pass &amp; Locker PIN
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                      Issued to Student
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="text-xs text-slate-300">Pickup Counter: <strong>{claim.pickupPass.station}</strong></p>
                      <p className="text-xs text-slate-400 mt-0.5">{claim.pickupPass.expiry}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">6-Digit PIN</span>
                      <span className="text-2xl font-mono font-extrabold text-amber-300">{claim.pickupPass.pin}</span>
                    </div>
                  </div>
                </div>
              )}

              <ClaimMessagesThread claimId={claim.id} claim={claim} />

              <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                  Official Verification Audit Trail
                </h3>
                <div className="space-y-3.5">
                  {(claim.timeline || []).map((t, idx) => (
                    <div key={idx} className="flex items-start gap-3 relative">
                      <div className="flex flex-col items-center">
                        <span className="w-6 h-6 rounded-full bg-amber-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                          ✓
                        </span>
                        {idx < (claim.timeline.length - 1) && <div className="w-0.5 h-6 bg-slate-200 mt-1" />}
                      </div>
                      <div className="flex-1 min-w-0 pt-0.5 text-xs">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <p className="font-bold text-slate-900">{t.title}</p>
                          <span className="text-[11px] text-slate-400 font-mono">{t.date}</span>
                        </div>
                        <p className="text-slate-600 mt-0.5 leading-relaxed">{t.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <AdminActionModal
            isOpen={Boolean(modalAction)}
            onClose={() => setModalAction(null)}
            actionType={modalAction}
            claim={claim}
            otherPendingClaims={otherPendingClaims}
            onConfirm={handleModalConfirm}
            isPending={isActionPending}
          />

          <Toast toast={toast} onDismiss={() => setToast(null)} />
        </main>
      </div>
    </div>
  );
}
