import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { X, ShieldCheck, AlertTriangle, CheckCircle2 } from '../dashboard/icons';
import ItemImageUpload from '../dashboard/ItemImageUpload';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { getClaims, hasExistingClaim, submitClaim } from '../../services/claimsService';

const MAX_PROOF_PHOTO_CHARS = 2 * 1024 * 1024;

export default function ClaimSubmissionModal({ isOpen, onClose, item, onSuccess }) {
  const queryClient = useQueryClient();
  const { user } = useCurrentUser();
  const claimantId = user?.studentId || user?.id;

  const [proofDescription, setProofDescription] = useState('');
  const [privateDetails, setPrivateDetails] = useState('');
  const [proofPhoto, setProofPhoto] = useState(null);
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [errors, setErrors] = useState({});

  const { data: existingClaims = [] } = useQuery({
    queryKey: ['claims', claimantId],
    queryFn: () => getClaims(claimantId),
    enabled: isOpen && Boolean(claimantId),
  });

  const isDuplicate = Boolean(
    isOpen &&
      item &&
      claimantId &&
      hasExistingClaim(existingClaims, item.id, item.title, claimantId)
  );

  const mutation = useMutation({
    mutationFn: submitClaim,
    onSuccess: (newClaim) => {
      queryClient.invalidateQueries({ queryKey: ['claims'] });
      if (onSuccess) onSuccess(newClaim);
      onClose();
    },
    onError: (err) => {
      setErrors((prev) => ({
        ...prev,
        form: err?.message || 'Unable to submit claim. Please try again.',
      }));
    },
  });

  useEffect(() => {
    if (!isOpen) {
      setProofDescription('');
      setPrivateDetails('');
      setProofPhoto(null);
      setConsentAccepted(false);
      setErrors({});
      mutation.reset();
      return;
    }

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !mutation.isPending) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !item || typeof document === 'undefined') return null;

  const handlePhotoChange = (dataUrl) => {
    if (dataUrl && dataUrl.length > MAX_PROOF_PHOTO_CHARS) {
      setErrors((prev) => ({
        ...prev,
        proofPhoto: 'Selected image exceeds the 2MB limit. Please choose a smaller photo.',
      }));
      return;
    }
    setErrors((prev) => ({ ...prev, proofPhoto: '' }));
    setProofPhoto(dataUrl);
  };

  const validate = () => {
    const nextErrors = {};
    if (!proofDescription.trim() || proofDescription.trim().length < 10) {
      nextErrors.proofDescription =
        'Please describe how you can prove ownership (at least 10 characters).';
    }
    if (!privateDetails.trim() || privateDetails.trim().length < 5) {
      nextErrors.privateDetails =
        'Provide private identifying details such as serial number, unique marks, or contents.';
    }
    if (!consentAccepted) {
      nextErrors.consentAccepted =
        'You must confirm ownership and accuracy before submitting.';
    }
    if (errors.proofPhoto) {
      nextErrors.proofPhoto = errors.proofPhoto;
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isDuplicate || mutation.isPending) return;
    if (!validate()) return;

    mutation.mutate({
      item,
      user,
      proofDescription,
      privateDetails,
      proofPhoto,
      consentAccepted,
    });
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-xs overflow-y-auto"
      onClick={() => {
        if (!mutation.isPending) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="claim-submission-title"
    >
      <div
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <div>
              <h3 id="claim-submission-title" className="text-base font-bold text-slate-900">
                Submit Ownership Claim
              </h3>
              <p className="text-xs text-slate-500">
                Your verification details remain strictly private to you and campus administrators.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              if (!mutation.isPending) onClose();
            }}
            disabled={mutation.isPending}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-lg transition cursor-pointer disabled:opacity-50"
            aria-label="Close claim form"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs" noValidate>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Claiming Found Item
              </span>
              <p className="text-sm font-bold text-slate-900 mt-0.5">{item.title}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {item.category} &bull; Found at {item.location}
              </p>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-[10px] font-semibold text-slate-400 block">Custody Facility</span>
              <span className="text-xs font-bold text-blue-700">{item.custody}</span>
            </div>
          </div>

          {isDuplicate && (
            <div
              role="alert"
              className="flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900"
            >
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Duplicate Claim Blocked</p>
                <p className="text-[11px] mt-0.5 leading-relaxed">
                  You have already submitted a claim for <strong>{item.title}</strong> under Student ID{' '}
                  <strong>{claimantId}</strong>. Check your status in <strong>My Claims &amp; Tracking</strong>.
                </p>
              </div>
            </div>
          )}

          {errors.form && (
            <div
              role="alert"
              className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800"
            >
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <p className="text-[11px] font-medium">{errors.form}</p>
            </div>
          )}

          <div>
            <label htmlFor="claim-proof-desc" className="block font-bold text-slate-800 mb-1.5">
              Proof-of-Ownership Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="claim-proof-desc"
              rows={3}
              disabled={isDuplicate || mutation.isPending}
              value={proofDescription}
              onChange={(e) => {
                setProofDescription(e.target.value);
                if (errors.proofDescription) setErrors((p) => ({ ...p, proofDescription: '' }));
              }}
              placeholder="Explain where and when you lost it, how you use it, or any purchase/registration context..."
              className={`w-full px-3.5 py-2.5 rounded-xl border bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition disabled:bg-slate-100 ${
                errors.proofDescription
                  ? 'border-red-400 focus:ring-red-500/20'
                  : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/20'
              }`}
              aria-invalid={Boolean(errors.proofDescription)}
            />
            {errors.proofDescription && (
              <p className="text-[11px] text-red-600 font-medium mt-1">{errors.proofDescription}</p>
            )}
          </div>

          <div>
            <label htmlFor="claim-private-details" className="block font-bold text-slate-800 mb-1.5">
              Private Identifying Details (Serial #, Marks, Contents){' '}
              <span className="text-red-500">*</span>
            </label>
            <textarea
              id="claim-private-details"
              rows={3}
              disabled={isDuplicate || mutation.isPending}
              value={privateDetails}
              onChange={(e) => {
                setPrivateDetails(e.target.value);
                if (errors.privateDetails) setErrors((p) => ({ ...p, privateDetails: '' }));
              }}
              placeholder="Provide details withheld from the public listing (e.g., serial number, lock screen wallpaper, stickers, scratches, or items inside)..."
              className={`w-full px-3.5 py-2.5 rounded-xl border bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition disabled:bg-slate-100 ${
                errors.privateDetails
                  ? 'border-red-400 focus:ring-red-500/20'
                  : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/20'
              }`}
              aria-invalid={Boolean(errors.privateDetails)}
            />
            {errors.privateDetails && (
              <p className="text-[11px] text-red-600 font-medium mt-1">{errors.privateDetails}</p>
            )}
          </div>

          <div>
            <ItemImageUpload
              value={proofPhoto}
              onChange={handlePhotoChange}
              label="Optional Proof Photo (Receipt, Old Photo, or Packaging)"
            />
            {errors.proofPhoto && (
              <p className="text-[11px] text-red-600 font-medium mt-1">{errors.proofPhoto}</p>
            )}
          </div>

          <div className="pt-1">
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={consentAccepted}
                disabled={isDuplicate || mutation.isPending}
                onChange={(e) => {
                  setConsentAccepted(e.target.checked);
                  if (errors.consentAccepted) setErrors((p) => ({ ...p, consentAccepted: '' }));
                }}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-[11px] text-slate-600 leading-relaxed">
                I certify under university policy that I am the rightful owner of this item and that the private identifying details provided are accurate. I understand false claims may result in disciplinary review.
              </span>
            </label>
            {errors.consentAccepted && (
              <p className="text-[11px] text-red-600 font-medium mt-1">{errors.consentAccepted}</p>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={mutation.isPending}
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold transition cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isDuplicate || mutation.isPending}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{mutation.isPending ? 'Submitting Claim...' : 'Submit Claim'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
