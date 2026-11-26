import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { QRCodeCanvas } from 'qrcode.react';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { getClaimForStudent, formatValidityWindow } from '../services/claimsService';
import {
  ShieldCheck,
  PackageCheck,
  AlertTriangle,
  Printer,
  Download,
  ArrowRight,
  ChevronRight,
  MapPin,
  Calendar,
  CheckCircle2,
} from '../components/dashboard/icons';

// TODO(backend): validate passCode server-side only, never trust the client
// TODO(backend): rate limiting in FastAPI
// TODO(backend): store only hashes of passCode and PIN

export default function RetrievalPassPage() {
  const { claimId } = useParams();
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useCurrentUser();

  // Redirect admins to /admin
  useEffect(() => {
    if (!authLoading && user?.role === 'admin') {
      navigate('/admin', { replace: true });
    }
  }, [user, authLoading, navigate]);

  // Load claim only through owner-filtered claims query
  const {
    data: claim,
    isLoading: claimLoading,
    isError,
  } = useQuery({
    queryKey: ['claimPass', claimId, user?.studentId || user?.id],
    queryFn: () => getClaimForStudent(claimId, user),
    enabled: Boolean(claimId && user && user.role !== 'admin'),
  });

  const handleDownloadQr = () => {
    if (!claim) return;
    const canvas = document.getElementById(`printable-qr-canvas-${claim.id}`);
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `${claim.referenceNo || claim.id}-retrieval-qr.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handlePrint = () => {
    window.print();
  };

  if (authLoading || claimLoading) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-6 text-slate-500">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-semibold uppercase tracking-wider">Loading Retrieval Pass...</p>
      </div>
    );
  }

  // Generic "Pass not available" for missing, not-owned, or non-approved (Stage < 5) claims
  const isMissingOrRestricted = !claim || isError || claim.currentStage < 5;

  if (isMissingOrRestricted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">Pass Not Available</h1>
          <p className="text-xs text-slate-600 leading-relaxed mb-6">
            A retrieval pass could not be loaded for this claim. This pass may not exist, belongs to another student account, or has not yet been approved by Campus Security.
          </p>
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition"
          >
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    );
  }

  // After handover: pass page shows "Pass already used" with no QR
  const isAlreadyUsed = Boolean(claim.passUsedAt || claim.currentStage === 6);

  if (isAlreadyUsed) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-4">
            <PackageCheck className="w-7 h-7" />
          </div>
          <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase tracking-wide">
            Pass Already Used
          </span>
          <h1 className="text-xl font-bold text-slate-900 mt-3 mb-2">
            Item Successfully Retrieved
          </h1>
          <p className="text-xs text-slate-600 leading-relaxed mb-6">
            This digital retrieval pass was already redeemed and verified by security custody staff. For institutional security, the QR pass and PIN are permanently deactivated.
          </p>

          {claim.retrievalReceipt && (
            <div className="text-left bg-slate-50 rounded-xl p-4 border border-slate-200 mb-6 text-xs space-y-2">
              <div className="flex justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Receipt Ref:</span>
                <span className="font-mono font-bold text-slate-900">{claim.retrievalReceipt.receiptNo}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Released At:</span>
                <span className="font-semibold text-slate-800">{claim.retrievalReceipt.releasedAt}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Releasing Officer:</span>
                <span className="font-semibold text-slate-800">{claim.retrievalReceipt.releasedBy}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Recipient:</span>
                <span className="font-semibold text-slate-800">{claim.retrievalReceipt.signedBy}</span>
              </div>
            </div>
          )}

          <Link
            to={`/dashboard?tab=claims-tracking&claimId=${claim.id}`}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition"
          >
            <span>Back to My Claims</span>
          </Link>
        </div>
      </div>
    );
  }

  // Check validity
  const isExpired = claim.passExpiresAt
    ? new Date(claim.passExpiresAt).getTime() < Date.now()
    : false;

  const qrPayload = JSON.stringify({
    claimId: claim.id,
    itemId: claim.itemId || '',
    passCode: claim.passCode || '',
  });

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6 lg:px-8 font-sans antialiased text-slate-800 print:bg-white print:p-0">
      <style>{`
        @media print {
          body {
            background-color: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
          .printable-card {
            box-shadow: none !important;
            border: 2px solid #0f172a !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 1.5rem !important;
            border-radius: 0.5rem !important;
            page-break-inside: avoid;
          }
        }
      `}</style>

      {/* Top navigation actions (Hidden when printed) */}
      <div className="max-w-2xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-3 no-print">
        <Link
          to={`/dashboard?tab=claims-tracking&claimId=${claim.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
        >
          <span>&larr; Back to Claims Dashboard</span>
        </Link>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleDownloadQr}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs cursor-pointer"
            title="Download QR code as PNG image"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span>Download QR</span>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
            title="Print retrieval pass"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Pass</span>
          </button>
        </div>
      </div>

      {/* The Printable Pass Document Card */}
      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-200/90 overflow-hidden printable-card">
        {/* Header Header Banner */}
        <div className="bg-slate-900 text-white p-6 sm:p-7 border-b border-slate-800">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-400/30 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-blue-300">
                  Campus Security Services &bull; Property Custody Division
                </p>
                <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-white mt-0.5">
                  Official Item Retrieval Pass
                </h1>
              </div>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-[11px] font-extrabold tracking-wide uppercase ${
                isExpired
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-400/30'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
              }`}
            >
              {isExpired ? 'Expired' : 'Verified & Active'}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Item & Student Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-6 border-b border-slate-100">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Claimed Item
              </span>
              <p className="text-base font-extrabold text-slate-900">{claim.itemName}</p>
              <p className="text-xs text-slate-500 font-medium">
                Category: <strong className="text-slate-700">{claim.category || 'General'}</strong>
              </p>
              <p className="text-xs text-slate-500 font-mono">
                Claim Reference: <strong className="text-blue-700">{claim.referenceNo || claim.id}</strong>
              </p>
            </div>

            <div className="space-y-1 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Verified Student Claimant
              </span>
              <p className="text-sm font-bold text-slate-900">
                {claim.claimantName || user?.fullName || 'Verified Student'}
              </p>
              <p className="text-xs text-slate-600 font-mono">
                Student ID: <strong>{claim.claimantId || claim.studentId || user?.studentId}</strong>
              </p>
              <p className="text-[11px] text-slate-500">
                Submitted on {claim.dateSubmitted}
              </p>
            </div>
          </div>

          {/* QR Code and PIN Presentation Block */}
          {isExpired ? (
            <div className="p-6 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 text-center">
              <AlertTriangle className="w-8 h-8 text-amber-600 mx-auto mb-2" />
              <h2 className="text-sm font-bold uppercase tracking-wide">Pass Validity Expired</h2>
              <p className="text-xs text-amber-800 mt-1 max-w-md mx-auto">
                This retrieval pass expired on {formatValidityWindow(claim.passExpiresAt)}. Please visit Central Security Desk Room 102 with your school ID to request verification extension.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center bg-gradient-to-br from-slate-50 to-blue-50/40 p-6 rounded-2xl border border-slate-200">
              {/* QR Section with White Quiet-Zone Margin */}
              <div className="flex flex-col items-center justify-center text-center">
                <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-200">
                  <QRCodeCanvas
                    id={`printable-qr-canvas-${claim.id}`}
                    value={qrPayload}
                    size={170}
                    level="H"
                    marginSize={4}
                    bgColor="#ffffff"
                    fgColor="#0f172a"
                  />
                </div>
                <span className="text-[10px] font-mono font-medium text-slate-500 mt-2">
                  Scan at Security Intake Scanner
                </span>
              </div>

              {/* PIN and Station Section */}
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Manual Fallback 6-Digit PIN
                  </span>
                  <div className="text-3xl font-mono font-extrabold tracking-widest text-blue-900">
                    {claim.pickupPass?.pin || '---'}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-0.5 block font-mono">
                    Pass Ref: {claim.pickupPass?.code || claim.referenceNo}
                  </span>
                </div>

                <div className="text-xs space-y-1.5">
                  <div>
                    <span className="text-slate-400 font-medium block text-[11px]">Pickup Station:</span>
                    <span className="font-bold text-slate-900">
                      {claim.pickupPass?.station || claim.custodyLocation}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium block text-[11px]">Validity Window:</span>
                    <span className="font-semibold text-emerald-700">
                      {formatValidityWindow(claim.passExpiresAt || claim.pickupPass?.expiresAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Mandatory Instructions */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-300 text-amber-950 text-xs">
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                !
              </span>
              <div>
                <p className="font-bold text-sm text-amber-900">
                  Mandatory Handover Requirement: Bring a valid school ID
                </p>
                <p className="text-xs text-amber-900/90 mt-1 leading-relaxed">
                  Before physical item release, the releasing officer must inspect your original university student ID card matching the name and identification number printed on this pass. Unverified claimants will not receive custody of items.
                </p>
              </div>
            </div>
          </div>

          {/* Footer Metadata */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between text-[10px] text-slate-400 gap-2">
            <span>Institutional Lost &amp; Found Retrieval System &bull; Campus Security</span>
            <span>Generated on {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
