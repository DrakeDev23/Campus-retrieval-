import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, AlertTriangle, ShieldCheck, CheckCircle2 } from '../dashboard/icons';

export default function AdminActionModal({
  isOpen,
  onClose,
  actionType,
  claim,
  otherPendingClaims = [],
  onConfirm,
  isPending = false,
}) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setReason('');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen || !claim || typeof document === 'undefined') return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (actionType === 'reject' || actionType === 'request-info') {
      if (!reason.trim()) {
        setError('Please enter a detailed message/reason before proceeding.');
        return;
      }
    }
    onConfirm(reason.trim());
  };

  const titles = {
    advance: 'Advance Claim to Next Verification Stage',
    approve: 'Approve Claim for Item Retrieval',
    reject: 'Reject Ownership Claim',
    'request-info': 'Request Additional Information from Claimant',
  };

  const buttonLabels = {
    advance: 'Advance Stage',
    approve: 'Authorize & Issue Pass',
    reject: 'Confirm Rejection',
    'request-info': 'Send Info Request',
  };

  const buttonColors = {
    advance: 'bg-blue-600 hover:bg-blue-700 text-white',
    approve: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    reject: 'bg-rose-600 hover:bg-rose-700 text-white',
    'request-info': 'bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-bold',
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-xs overflow-y-auto"
      onClick={() => {
        if (!isPending) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <span
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                actionType === 'approve'
                  ? 'bg-emerald-100 text-emerald-700'
                  : actionType === 'reject'
                  ? 'bg-rose-100 text-rose-700'
                  : actionType === 'request-info'
                  ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                  : 'bg-blue-100 text-blue-700'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-bold text-slate-900 leading-snug">
              {titles[actionType] || 'Confirm Administrator Action'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer disabled:opacity-50"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <p className="font-bold text-slate-800">{claim.itemName}</p>
            <p className="text-slate-500 text-[11px]">
              Ref: <strong className="text-slate-700 font-mono">{claim.referenceNo}</strong> &bull; Claimant:{' '}
              <strong className="text-slate-700">{claim.claimantName}</strong> ({claim.claimantId})
            </p>
          </div>

          {actionType === 'approve' && otherPendingClaims.length > 0 && (
            <div
              role="alert"
              className="flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs"
            >
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Multiple Active Claims Detected</p>
                <p className="text-[11px] mt-0.5 leading-relaxed">
                  There are <strong>{otherPendingClaims.length} other pending claim(s)</strong> filed for this item by other students. Approving this claim will allocate the item to <strong>{claim.claimantName}</strong> and update the catalog status to <em>Claimed</em>.
                </p>
              </div>
            </div>
          )}

          {actionType === 'approve' && (
            <p className="text-slate-600 text-xs leading-relaxed">
              This action verifies that all identifiers matched the physical item in custody. The system will advance the claim to <strong>Stage 5 (Approved for Retrieval)</strong>, issue an official 6-digit contactless locker PIN, and notify the student.
            </p>
          )}

          {actionType === 'advance' && (
            <p className="text-slate-600 text-xs leading-relaxed">
              Move this claim from <strong>Stage {claim.currentStage}</strong> ({claim.status}) to <strong>Stage {claim.currentStage + 1}</strong>. This update is timestamped in the audit trail and sent to the student.
            </p>
          )}

          {(actionType === 'reject' || actionType === 'request-info') && (
            <div>
              <label htmlFor="admin-action-reason" className="block font-bold text-slate-800 mb-1.5">
                {actionType === 'reject' ? 'Reason for Rejection *' : 'Information Required from Claimant *'}
              </label>
              <textarea
                id="admin-action-reason"
                rows={3}
                disabled={isPending}
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  if (error) setError('');
                }}
                placeholder={
                  actionType === 'reject'
                    ? 'State clearly why ownership proof failed (e.g. Serial numbers do not match intake records)...'
                    : 'Specify what additional proof is required (e.g. Please provide device serial # or purchase receipt)...'
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              {error && <p className="text-[11px] text-red-600 font-medium mt-1">{error}</p>}
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold transition cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className={`px-4 py-2 rounded-xl font-semibold shadow-xs transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                buttonColors[actionType] || 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isPending ? 'Processing...' : buttonLabels[actionType] || 'Confirm Action'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
