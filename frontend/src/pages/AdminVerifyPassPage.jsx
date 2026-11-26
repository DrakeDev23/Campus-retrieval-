import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query';
import Sidebar from '../components/dashboard/Sidebar';
import Header from '../components/dashboard/Header';
import Toast from '../components/common/Toast';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { verifyPass, confirmHandover } from '../services/adminService';
import { getUnreadCounts } from '../services/messagesService';
import { getNotifications } from '../services/notificationsService';
import {
  ShieldCheck,
  PackageCheck,
  AlertTriangle,
  CheckCircle2,
  QrCode,
  Key,
  Clock,
  ChevronRight,
  ArrowRight,
  RotateCw,
} from '../components/dashboard/icons';

// TODO(backend): validate passCode server-side only, never trust the client
// TODO(backend): rate limiting in FastAPI
// TODO(backend): store only hashes of passCode and PIN

const LOCKOUT_STORAGE_KEY = 'itemfinder_pass_lockout_v1';
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 30 * 1000; // 30 seconds

function getLockoutState() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(LOCKOUT_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          return {
            failedCount: Number(parsed.failedCount) || 0,
            lockoutUntil: Number(parsed.lockoutUntil) || 0,
          };
        }
      }
    }
  } catch {
  }
  return { failedCount: 0, lockoutUntil: 0 };
}

function setLockoutState(failedCount, lockoutUntil) {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(
        LOCKOUT_STORAGE_KEY,
        JSON.stringify({ failedCount, lockoutUntil })
      );
    }
  } catch {
  }
}

export default function AdminVerifyPassPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useCurrentUser();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMode, setActiveMode] = useState('qr'); // 'qr' | 'manual'

  // Input states
  const [qrText, setQrText] = useState('');
  const [manualClaimId, setManualClaimId] = useState('');
  const [manualPin, setManualPin] = useState('');

  // Lockout states
  const [lockoutUntil, setLockoutUntil] = useState(() => getLockoutState().lockoutUntil);
  const [remainingLockoutSeconds, setRemainingLockoutSeconds] = useState(0);

  // Result and Handover states
  const [verifyResult, setVerifyResult] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [schoolIdVerified, setSchoolIdVerified] = useState(false);
  const [toast, setToast] = useState(null);
  const [liveAnnouncement, setLiveAnnouncement] = useState('');

  const resultContainerRef = useRef(null);

  // Header notifications queries
  const { data: messageUnreadCounts } = useQuery({
    queryKey: ['messages', 'unread', user?.role],
    queryFn: () => getUnreadCounts(user),
    refetchInterval: 10000,
    enabled: Boolean(user?.role === 'admin'),
  });

  const { data: adminNotifs = [] } = useQuery({
    queryKey: ['notifications', 'admin'],
    queryFn: () => getNotifications(user),
    enabled: Boolean(user?.role === 'admin'),
  });

  // Lockout countdown timer
  useEffect(() => {
    const updateCountdown = () => {
      const now = Date.now();
      if (lockoutUntil > now) {
        setRemainingLockoutSeconds(Math.ceil((lockoutUntil - now) / 1000));
      } else {
        setRemainingLockoutSeconds(0);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [lockoutUntil]);

  const isLocked = remainingLockoutSeconds > 0;

  // Record a failed attempt
  const handleFailedAttempt = () => {
    const current = getLockoutState();
    const newCount = current.failedCount + 1;
    let newLockoutUntil = current.lockoutUntil;

    if (newCount >= MAX_FAILED_ATTEMPTS) {
      // TODO(backend): rate limiting in FastAPI
      newLockoutUntil = Date.now() + LOCKOUT_DURATION_MS;
      setLockoutUntil(newLockoutUntil);
      setToast({
        type: 'error',
        title: 'Too Many Failed Attempts',
        message: 'Security lockout activated for 30 seconds.',
      });
    }

    setLockoutState(newCount, newLockoutUntil);
  };

  // Reset lockout on success
  const handleSuccessReset = () => {
    setLockoutState(0, 0);
    setLockoutUntil(0);
    setRemainingLockoutSeconds(0);
  };

  // Handle Verify Pass submit
  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    if (isLocked || isVerifying) return;

    setVerifyResult(null);
    setSchoolIdVerified(false);

    let payload;
    if (activeMode === 'qr') {
      const trimmed = qrText.trim();
      if (!trimmed) {
        setToast({ type: 'error', title: 'Input Required', message: 'Please paste or type the QR code payload.' });
        return;
      }
      if (trimmed.length > 500) {
        setToast({ type: 'error', title: 'Payload Too Long', message: 'Input cannot exceed 500 characters.' });
        return;
      }

      // Try/catch JSON parse & shape validation
      try {
        const parsed = JSON.parse(trimmed);
        if (!parsed || typeof parsed !== 'object' || !parsed.claimId || !parsed.passCode) {
          setVerifyResult({
            valid: false,
            result: 'Invalid',
            message: 'QR code payload format is invalid. Required fields: claimId and passCode.',
          });
          handleFailedAttempt();
          return;
        }
        payload = {
          claimId: String(parsed.claimId).trim(),
          itemId: parsed.itemId ? String(parsed.itemId).trim() : '',
          passCode: String(parsed.passCode).trim(),
        };
      } catch {
        setVerifyResult({
          valid: false,
          result: 'Invalid',
          message: 'Malformed QR payload. Expected valid JSON string.',
        });
        handleFailedAttempt();
        return;
      }
    } else {
      // Manual entry: always Claim ID + 6-digit PIN
      const cleanClaimId = manualClaimId.trim();
      const cleanPin = manualPin.trim();

      if (!cleanClaimId || !cleanPin) {
        setToast({
          type: 'error',
          title: 'Credentials Required',
          message: 'Manual entry requires both Claim ID and 6-digit PIN. A PIN alone is never accepted.',
        });
        return;
      }

      payload = {
        claimId: cleanClaimId,
        pin: cleanPin,
        isManual: true,
      };
    }

    setIsVerifying(true);
    try {
      const res = await verifyPass(payload, user);
      setVerifyResult(res);

      if (res.valid) {
        handleSuccessReset();
        setLiveAnnouncement(`Pass verified successfully for ${res.claim?.itemName}. Ready for ID check.`);
        setToast({
          type: 'success',
          title: 'Pass Verified',
          message: `Claim ${res.claim?.referenceNo} verified successfully. Inspect student ID before release.`,
        });
      } else {
        handleFailedAttempt();
        setLiveAnnouncement(`Verification failed: ${res.result}. ${res.message}`);
      }
    } catch (err) {
      handleFailedAttempt();
      setVerifyResult({
        valid: false,
        result: 'Invalid',
        message: err?.message || 'Verification failed unexpectedly.',
      });
      setToast({ type: 'error', title: 'Verification Error', message: err?.message });
    } finally {
      setIsVerifying(false);
      setTimeout(() => {
        resultContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    }
  };

  // Handover mutation
  const handoverMutation = useMutation({
    mutationFn: async () => {
      if (!verifyResult?.claim?.id) throw new Error('No verified claim selected.');
      return confirmHandover(verifyResult.claim.id, user, {
        schoolIdVerified: true,
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['claims'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['foundItems'] });
      queryClient.invalidateQueries({ queryKey: ['adminFoundItems'] });

      setVerifyResult((prev) => ({
        ...prev,
        result: 'Handover Completed',
        claim: data.claim,
        receipt: data.receipt,
        message: 'Item has been successfully released and digital receipt recorded.',
      }));

      setToast({
        type: 'success',
        title: 'Handover Confirmed',
        message: `Item custody updated to Returned. Receipt #${data.receipt?.receiptNo} issued.`,
      });
      setLiveAnnouncement('Handover confirmed successfully. Official receipt issued.');
    },
    onError: (err) => {
      setToast({
        type: 'error',
        title: 'Handover Failed',
        message: err?.message || 'Could not complete handover.',
      });
    },
  });

  // Fast demo helpers for quick testing
  const loadDemoActive = () => {
    setActiveMode('qr');
    setQrText(
      JSON.stringify({
        claimId: 'CLM-2026-0710',
        itemId: 'ITM-204',
        passCode: 'pass_710_token_xK89sL23_secure',
      })
    );
  };

  const loadDemoExpired = () => {
    setActiveMode('qr');
    setQrText(
      JSON.stringify({
        claimId: 'CLM-2026-0620',
        itemId: 'ITM-105',
        passCode: 'pass_620_expired_token_test',
      })
    );
  };

  const loadDemoManual = () => {
    setActiveMode('manual');
    setManualClaimId('CLM-2026-0710');
    setManualPin('582-914');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex font-sans antialiased">
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((v) => !v)}
        onOpen={() => setSidebarOpen(true)}
        onClose={() => setSidebarOpen(false)}
        activeTab="admin-verify-pass"
        mode="admin"
        profile={user}
        unreadCount={adminNotifs.filter((n) => n.unread).length}
        messageUnreadCount={messageUnreadCounts?.totalUnread || 0}
      />

      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          sidebarOpen ? 'lg:pl-72' : 'lg:pl-20'
        }`}
      >
        <Header
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          activeTab="admin-verify-pass"
          profile={user}
          notifications={adminNotifs}
          mode="admin"
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl w-full mx-auto space-y-6">
          {/* Header Title Banner */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="w-12 h-12 rounded-xl bg-yellow-100 text-yellow-950 border border-yellow-300 flex items-center justify-center shrink-0">
                <QrCode className="w-6 h-6 text-yellow-700" />
              </span>
              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  Scan &amp; Verify Retrieval Pass
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Validate student QR tokens or manual fallback PINs prior to physical item release.
                </p>
              </div>
            </div>

            {/* Quick Demo Preloads */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={loadDemoActive}
                className="px-2.5 py-1.5 rounded-lg bg-yellow-100 hover:bg-yellow-200 text-yellow-950 border border-yellow-300 text-[11px] font-bold transition cursor-pointer shadow-2xs"
                title="Fill active QR pass demo"
              >
                Demo Active QR
              </button>
              <button
                type="button"
                onClick={loadDemoManual}
                className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-[11px] font-semibold transition cursor-pointer"
                title="Fill manual PIN demo"
              >
                Demo PIN (582-914)
              </button>
              <button
                type="button"
                onClick={loadDemoExpired}
                className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition cursor-pointer border border-slate-200"
                title="Fill expired pass demo"
              >
                Demo Expired
              </button>
            </div>
          </div>

          {/* Rate-limit lockout alert */}
          {isLocked && (
            <div
              role="alert"
              className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-900 text-xs flex items-center gap-3 shadow-sm animate-pulse"
            >
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              <div>
                <p className="font-bold">Form Temporarily Locked</p>
                <p className="text-[11px] mt-0.5 text-rose-800">
                  Too many consecutive failed pass attempts ({MAX_FAILED_ATTEMPTS}/{MAX_FAILED_ATTEMPTS}). For campus security, verification is locked for{' '}
                  <strong className="font-mono text-rose-950 font-bold">{remainingLockoutSeconds}</strong> seconds.
                </p>
              </div>
            </div>
          )}

          {/* Verification Input Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            {/* Mode Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-50/70 p-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setActiveMode('qr');
                  setVerifyResult(null);
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeMode === 'qr'
                    ? 'bg-yellow-400 text-slate-950 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <QrCode className="w-4 h-4" />
                <span>QR Code Text / Scanner Payload</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveMode('manual');
                  setVerifyResult(null);
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeMode === 'manual'
                    ? 'bg-yellow-400 text-slate-950 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Key className="w-4 h-4" />
                <span>Manual Entry (Claim ID + 6-digit PIN)</span>
              </button>
            </div>

            {/* Input Form */}
            <form onSubmit={handleVerify} className="p-6 space-y-4">
              {activeMode === 'qr' ? (
                <div>
                  <label htmlFor="qr-payload-input" className="block text-xs font-bold text-slate-700 mb-1.5">
                    QR Code JSON Payload:
                  </label>
                  <textarea
                    id="qr-payload-input"
                    rows={3}
                    maxLength={500}
                    value={qrText}
                    onChange={(e) => setQrText(e.target.value)}
                    disabled={isLocked || isVerifying}
                    placeholder='{"claimId":"CLM-2026-0710","itemId":"...","passCode":"..."}'
                    className="w-full p-3 font-mono text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400/30 focus:border-yellow-500 disabled:opacity-50"
                  />
                  <div className="flex justify-between items-center mt-1 text-[11px] text-slate-400">
                    <span>Paste output from external USB barcode / 2D scanner or mobile camera.</span>
                    <span className="font-mono">{qrText.length}/500</span>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="manual-claim-id" className="block text-xs font-bold text-slate-700 mb-1.5">
                      Claim ID / Reference Number:
                    </label>
                    <input
                      id="manual-claim-id"
                      type="text"
                      maxLength={50}
                      value={manualClaimId}
                      onChange={(e) => setManualClaimId(e.target.value)}
                      disabled={isLocked || isVerifying}
                      placeholder="e.g. CLM-2026-0710"
                      className="w-full p-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400/30 focus:border-yellow-500 font-mono disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label htmlFor="manual-pin-input" className="block text-xs font-bold text-slate-700 mb-1.5">
                      6-Digit Counter / Locker PIN:
                    </label>
                    <input
                      id="manual-pin-input"
                      type="text"
                      maxLength={10}
                      value={manualPin}
                      onChange={(e) => setManualPin(e.target.value)}
                      disabled={isLocked || isVerifying}
                      placeholder="e.g. 582-914"
                      className="w-full p-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400/30 focus:border-yellow-500 font-mono font-bold tracking-wider disabled:opacity-50"
                    />
                  </div>
                  <p className="sm:col-span-2 text-[11px] text-slate-500">
                    * Policy: Both Claim ID and 6-digit PIN are required for manual verification. A PIN alone is never accepted.
                  </p>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isLocked || isVerifying}
                  className="px-5 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-slate-950 text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isVerifying ? (
                    <>
                      <RotateCw className="w-4 h-4 animate-spin text-slate-950" />
                      <span>Verifying Pass...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 text-slate-950" />
                      <span>Verify Pass</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Result Presentation Section */}
          <div
            ref={resultContainerRef}
            aria-live="polite"
            role="status"
            className="space-y-4"
          >
            {verifyResult && (
              <div
                className={`p-6 rounded-2xl border shadow-md transition-all ${
                  verifyResult.valid
                    ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
                    : verifyResult.result === 'Expired'
                    ? 'bg-amber-50/90 border-amber-300 text-amber-950'
                    : verifyResult.result === 'Already used'
                    ? 'bg-purple-50/90 border-purple-300 text-purple-950'
                    : verifyResult.result === 'Wrong status'
                    ? 'bg-amber-50/90 border-amber-300 text-amber-950'
                    : 'bg-rose-50/90 border-rose-300 text-rose-950'
                }`}
              >
                {/* Status Badge & Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-black/10">
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shrink-0 ${
                        verifyResult.valid
                          ? 'bg-emerald-600'
                          : verifyResult.result === 'Expired'
                          ? 'bg-amber-600'
                          : verifyResult.result === 'Already used'
                          ? 'bg-purple-600'
                          : verifyResult.result === 'Wrong status'
                          ? 'bg-amber-600'
                          : 'bg-rose-600'
                      }`}
                    >
                      {verifyResult.valid ? (
                        <CheckCircle2 className="w-6 h-6" />
                      ) : (
                        <AlertTriangle className="w-6 h-6" />
                      )}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                            verifyResult.valid
                              ? 'bg-emerald-200 text-emerald-900'
                              : verifyResult.result === 'Expired'
                              ? 'bg-amber-200 text-amber-900'
                              : verifyResult.result === 'Already used'
                              ? 'bg-purple-200 text-purple-900'
                              : verifyResult.result === 'Wrong status'
                              ? 'bg-amber-200 text-amber-900'
                              : 'bg-rose-200 text-rose-900'
                          }`}
                        >
                          Status: {verifyResult.result}
                        </span>
                      </div>
                      <h2 className="text-base font-bold mt-1">
                        {verifyResult.valid
                          ? 'Valid Retrieval Pass &mdash; Authorized for Handover'
                          : verifyResult.message}
                      </h2>
                    </div>
                  </div>

                  {verifyResult.claim?.referenceNo && (
                    <span className="font-mono text-xs font-bold px-3 py-1 bg-white/70 rounded-lg border border-black/10">
                      {verifyResult.claim.referenceNo}
                    </span>
                  )}
                </div>

                {/* When Valid: Show Claim Summary & Handover Authorization */}
                {verifyResult.valid && verifyResult.claim && (
                  <div className="pt-5 space-y-5">
                    {/* Summary Details Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                      <div className="p-3.5 bg-white/80 rounded-xl border border-emerald-200/80">
                        <span className="text-slate-400 font-medium block text-[11px]">Item Title</span>
                        <span className="font-bold text-slate-900 mt-0.5 block text-sm">
                          {verifyResult.claim.itemName}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {verifyResult.claim.category || 'General'}
                        </span>
                      </div>

                      <div className="p-3.5 bg-white/80 rounded-xl border border-emerald-200/80">
                        <span className="text-slate-400 font-medium block text-[11px]">Claimant Student</span>
                        <span className="font-bold text-slate-900 mt-0.5 block text-sm">
                          {verifyResult.claim.claimantName || 'Student'}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          ID: {verifyResult.claim.claimantId || verifyResult.claim.studentId}
                        </span>
                      </div>

                      <div className="p-3.5 bg-white/80 rounded-xl border border-emerald-200/80">
                        <span className="text-slate-400 font-medium block text-[11px]">Custody Station</span>
                        <span className="font-bold text-slate-900 mt-0.5 block">
                          {verifyResult.claim.pickupPass?.station || verifyResult.claim.custodyLocation}
                        </span>
                        <span className="text-[10px] text-slate-500">Room / Locker Counter</span>
                      </div>

                      <div className="p-3.5 bg-white/80 rounded-xl border border-emerald-200/80">
                        <span className="text-slate-400 font-medium block text-[11px]">Validity Window</span>
                        <span className="font-bold text-emerald-800 mt-0.5 block">
                          {verifyResult.claim.pickupPass?.expiry || 'Active Window'}
                        </span>
                        <span className="text-[10px] text-slate-500">Security Clearance</span>
                      </div>
                    </div>

                    {/* Ownership Proof Record */}
                    {verifyResult.claim.submittedProof && (
                      <div className="p-3.5 bg-white/80 rounded-xl border border-emerald-200/80 text-xs">
                        <span className="text-slate-400 font-medium block text-[11px] mb-1">
                          Intake Verification Notes &bull; Submitted Ownership Proof:
                        </span>
                        <p className="text-slate-800 leading-relaxed font-medium">
                          {verifyResult.claim.submittedProof}
                        </p>
                      </div>
                    )}

                    {/* Mandatory Physical School ID Verification Banner */}
                    <div className="p-4 rounded-xl bg-yellow-50 border border-yellow-300 text-yellow-950 text-xs space-y-3">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-yellow-700 shrink-0" />
                        <h3 className="font-bold uppercase tracking-wider text-yellow-900">
                          Mandatory Security Inspection Checklist
                        </h3>
                      </div>
                      <p className="text-xs text-yellow-950 leading-relaxed">
                        Per institutional custody protocol, you must physically inspect the student's original university ID card. Verify that the photo and student number match <strong>{verifyResult.claim.claimantName} ({verifyResult.claim.claimantId || verifyResult.claim.studentId})</strong> before releasing the property.
                      </p>

                      <label className="flex items-start gap-3 p-3 rounded-lg bg-white border border-yellow-300 cursor-pointer hover:bg-yellow-50/50 transition select-none">
                        <input
                          type="checkbox"
                          checked={schoolIdVerified}
                          onChange={(e) => setSchoolIdVerified(e.target.checked)}
                          className="mt-0.5 w-4 h-4 text-yellow-600 rounded border-slate-300 focus:ring-yellow-500 cursor-pointer"
                        />
                        <span className="text-xs font-bold text-slate-900">
                          I confirm that I have physically inspected the student's original university ID card, and the credentials match the claimant profile.
                        </span>
                      </label>
                    </div>

                    {/* Confirm Handover Button */}
                    <div className="flex justify-end pt-2">
                      <button
                        type="button"
                        onClick={() => handoverMutation.mutate()}
                        disabled={!schoolIdVerified || handoverMutation.isPending}
                        className="px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {handoverMutation.isPending ? (
                          <>
                            <RotateCw className="w-4 h-4 animate-spin" />
                            <span>Processing Handover...</span>
                          </>
                        ) : (
                          <>
                            <PackageCheck className="w-4 h-4" />
                            <span>Confirm Handover &amp; Release Item</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Handover Completed State (Receipt Display) */}
                {verifyResult.result === 'Handover Completed' && verifyResult.receipt && (
                  <div className="pt-4 space-y-4 text-xs">
                    <div className="p-4 bg-white rounded-xl border border-emerald-300 text-slate-800 space-y-2">
                      <h4 className="font-bold text-emerald-950 text-sm">
                        Official Item Release Receipt Generated
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                        <div>
                          <span className="text-slate-400">Receipt Number:</span>{' '}
                          <strong className="font-mono text-slate-900">{verifyResult.receipt.receiptNo}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400">Released At:</span>{' '}
                          <strong className="text-slate-900">{verifyResult.receipt.releasedAt}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400">Releasing Officer:</span>{' '}
                          <strong className="text-slate-900">{verifyResult.receipt.releasedBy}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400">Student Recipient:</span>{' '}
                          <strong className="text-slate-900">{verifyResult.receipt.signedBy}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
