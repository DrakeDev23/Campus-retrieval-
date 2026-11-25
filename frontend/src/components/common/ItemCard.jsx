import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { getClaims, hasExistingClaim } from '../../services/claimsService';
import ClaimSubmissionModal from './ClaimSubmissionModal';
import Toast from './Toast';

export default function ItemCard({ item, onClaim, minimal = true }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useCurrentUser();
  const claimantId = user?.studentId || user?.id;
  const isAdmin = user?.role === 'admin';

  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const { data: claims = [] } = useQuery({
    queryKey: ['claims', claimantId],
    queryFn: () => getClaims(claimantId),
    enabled: Boolean(isAuthenticated && claimantId),
  });

  const alreadyClaimed = Boolean(
    isAuthenticated &&
      claimantId &&
      hasExistingClaim(claims, item.id, item.title, claimantId)
  );

  useEffect(() => {
    if (!detailsModalOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setDetailsModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [detailsModalOpen]);

  useEffect(() => {
    if (detailsModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [detailsModalOpen]);

  const handleClaimClick = () => {
    if (!isAuthenticated) {
      navigate('/login', {
        state: {
          from: location.pathname + location.search,
          claimItem: item.title,
        },
      });
      return;
    }

    if (alreadyClaimed) return;

    if (onClaim) {
      onClaim(item);
    } else {
      setClaimModalOpen(true);
    }
  };
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
          <h3
            onClick={() => setDetailsModalOpen(true)}
            className="text-base font-bold text-[#0f172a] hover:text-blue-600 transition cursor-pointer"
            title="Click to view details"
          >
            {item.title}
          </h3>

          {minimal ? (
            <div className="mt-2.5 flex items-center gap-1.5 text-xs text-slate-500">
              <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              <span className="truncate">{item.location}</span>
              <span className="text-slate-300">&bull;</span>
              <span className="shrink-0">{item.foundTime}</span>
            </div>
          ) : (
            <>
              <p className="mt-1 text-sm text-slate-600 leading-relaxed">
                {item.description}
              </p>

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
            </>
          )}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setDetailsModalOpen(true)}
          className="flex-1 py-2 px-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition text-center cursor-pointer"
        >
          View Details
        </button>
        {isAdmin ? (
          <span className="flex-1 py-2 px-3 text-xs font-semibold text-slate-500 bg-slate-50 rounded-lg text-center border border-slate-200">
            Admin View
          </span>
        ) : item.buttonType === 'claim' ? (
          alreadyClaimed ? (
            <button
              type="button"
              disabled
              className="flex-1 py-2 px-3 text-xs font-semibold text-slate-500 bg-slate-100 rounded-lg cursor-not-allowed text-center border border-slate-200"
            >
              Already Claimed
            </button>
          ) : (
            <button
              type="button"
              onClick={handleClaimClick}
              className="flex-1 py-2 px-3 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition text-center cursor-pointer"
            >
              Claim Item
            </button>
          )
        ) : (
          <button type="button" disabled className="flex-1 py-2 px-3 text-xs font-semibold text-slate-400 bg-slate-50 rounded-lg cursor-not-allowed text-center border border-slate-200">
            Case Closed
          </button>
        )}
      </div>

      {detailsModalOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto"
            onClick={(e) => {
              if (e.target === e.currentTarget) setDetailsModalOpen(false);
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`details-title-${item.title.replace(/\s+/g, '-').toLowerCase()}`}
          >
            <div className="relative bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 my-auto">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
                    {item.category}
                  </span>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${item.statusColor}`}>
                    {item.status}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setDetailsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-lg transition cursor-pointer"
                  aria-label="Close details"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="w-full h-44 sm:h-48 rounded-xl bg-slate-100 border border-slate-200 mb-5 overflow-hidden flex flex-col items-center justify-center relative">
                <div className="flex flex-col items-center justify-center text-slate-400 gap-1.5 select-none">
                  <svg className="w-9 h-9 text-slate-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                  </svg>
                  <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">No photo provided</span>
                </div>
              </div>

              <div className="mb-5">
                <h3
                  id={`details-title-${item.title.replace(/\s+/g, '-').toLowerCase()}`}
                  className="text-xl font-bold text-slate-900"
                >
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-5 space-y-2.5 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
                  <span className="text-slate-500 font-medium flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Date &amp; Time Found:
                  </span>
                  <span className="font-semibold text-slate-800">{item.foundTime}</span>
                </div>

                <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
                  <span className="text-slate-500 font-medium flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                    Found Location:
                  </span>
                  <span className="font-semibold text-slate-800">{item.location}</span>
                </div>

                <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
                  <span className="text-slate-500 font-medium flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                    </svg>
                    Custody Facility:
                  </span>
                  <span className={`font-semibold ${item.custodyColor || 'text-blue-600'}`}>{item.custody}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.386a9.014 9.014 0 003.559-3.559c.486-.827.313-1.908-.386-2.607L9.568 3z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
                    </svg>
                    Category:
                  </span>
                  <span className="font-semibold text-slate-800">{item.category}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-blue-50/60 border border-blue-100 mb-6 text-xs text-blue-900">
                <svg className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
                <span>
                  Personal identifiers, serial numbers, and distinctive markings are withheld for security verification when claiming.
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setDetailsModalOpen(false)}
                  className="flex-1 py-2.5 px-4 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition text-center cursor-pointer"
                >
                  Close
                </button>
                {isAdmin ? (
                  <span className="flex-1 py-2.5 px-4 text-xs font-semibold text-slate-500 bg-slate-100 rounded-xl text-center border border-slate-200">
                    Admin View
                  </span>
                ) : item.buttonType === 'claim' ? (
                  alreadyClaimed ? (
                    <button
                      type="button"
                      disabled
                      className="flex-1 py-2.5 px-4 text-xs font-semibold text-slate-500 bg-slate-100 rounded-xl cursor-not-allowed text-center border border-slate-200"
                    >
                      Already Claimed
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setDetailsModalOpen(false);
                        handleClaimClick();
                      }}
                      className="flex-1 py-2.5 px-4 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition text-center cursor-pointer"
                    >
                      Claim This Item
                    </button>
                  )
                ) : (
                  <button
                    type="button"
                    disabled
                    className="flex-1 py-2.5 px-4 text-xs font-semibold text-slate-400 bg-slate-100 rounded-xl cursor-not-allowed text-center border border-slate-200"
                  >
                    Case Closed
                  </button>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}

      <ClaimSubmissionModal
        isOpen={claimModalOpen}
        onClose={() => setClaimModalOpen(false)}
        item={item}
        onSuccess={(newClaim) => {
          setToast({
            type: 'success',
            title: 'Claim Submitted Successfully',
            message: `${newClaim.referenceNo} for ${newClaim.itemName} is now at Stage 1 (Claim Submitted).`,
          });
        }}
      />

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
