import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, AlertTriangle, X } from '../dashboard/icons';

export default function Toast({ toast, onDismiss }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, 4500);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  if (!toast || typeof document === 'undefined') return null;

  const isError = toast.type === 'error';

  return createPortal(
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-5 right-5 z-[120] max-w-sm w-full px-4 sm:px-0 pointer-events-none"
    >
      <div
        className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-xl border backdrop-blur-sm transition-all ${
          isError
            ? 'bg-red-50/95 border-red-200 text-red-900'
            : 'bg-emerald-50/95 border-emerald-200 text-emerald-950'
        }`}
      >
        <span
          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
            isError ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'
          }`}
        >
          {isError ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold">{toast.title}</p>
          {toast.message && (
            <p className="text-[11px] opacity-90 mt-0.5 leading-relaxed">{toast.message}</p>
          )}
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="p-1 rounded-lg opacity-60 hover:opacity-100 transition cursor-pointer"
          aria-label="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>,
    document.body
  );
}
