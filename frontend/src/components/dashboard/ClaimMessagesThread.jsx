import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getClaimMessages,
  sendMessage,
  markThreadRead,
  ensureParticipant,
} from '../../services/messagesService';
import { useCurrentUser } from '../../hooks/useCurrentUser';

export default function ClaimMessagesThread({ claimId, claim }) {
  const queryClient = useQueryClient();
  const { user } = useCurrentUser();

  const [inputText, setInputText] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);
  const [showNewMessagesBtn, setShowNewMessagesBtn] = useState(false);
  const [liveAnnouncement, setLiveAnnouncement] = useState('');

  const messagesContainerRef = useRef(null);
  const isNearBottomRef = useRef(true);
  const prevMessagesRef = useRef([]);
  const isFirstLoadRef = useRef(true);

  let isAuthorized = false;
  let authError = null;
  try {
    if (claim && user) {
      ensureParticipant(claim, user);
      isAuthorized = true;
    }
  } catch (err) {
    authError = err.message;
  }

  const {
    data: messages = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['messages', claimId],
    queryFn: () => getClaimMessages(claimId, user),
    enabled: Boolean(claimId && user && isAuthorized),
    refetchInterval: () => {
      if (typeof document !== 'undefined' && document.visibilityState !== 'visible') {
        return false;
      }
      return 5000;
    },
    refetchIntervalInBackground: false,
  });

  const triggerMarkRead = async () => {
    if (!claimId || !user || !isAuthorized) return;
    if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return;

    try {
      const res = await markThreadRead(claimId, user);
      if (res && res.count > 0) {
        queryClient.invalidateQueries({ queryKey: ['messages', 'unread'] });
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
      }
    } catch {
    }
  };

  useEffect(() => {
    if (isAuthorized && messages.length > 0) {
      triggerMarkRead();
    }
  }, [claimId, isAuthorized, messages.length]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isAuthorized) {
        triggerMarkRead();
      }
    };

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange);
      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }
  }, [claimId, isAuthorized]);

  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const distanceToBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    const nearBottom = distanceToBottom < 80;
    isNearBottomRef.current = nearBottom;

    if (nearBottom && showNewMessagesBtn) {
      setShowNewMessagesBtn(false);
    }
  };

  const scrollToBottom = (smooth = true) => {
    const container = messagesContainerRef.current;
    if (!container) return;
    container.scrollTo({
      top: container.scrollHeight,
      behavior: smooth ? 'smooth' : 'auto',
    });
    setShowNewMessagesBtn(false);
    isNearBottomRef.current = true;
  };

  useEffect(() => {
    if (!messages || messages.length === 0) return;

    const prevList = prevMessagesRef.current;
    const prevIds = new Set(prevList.map((m) => m.id));
    const newItems = messages.filter((m) => !prevIds.has(m.id));

    if (isFirstLoadRef.current) {
      scrollToBottom(false);
      isFirstLoadRef.current = false;
    } else if (newItems.length > 0) {
      const latest = newItems[newItems.length - 1];
      const isSentByMe =
        (user?.role === 'admin' && latest.senderRole === 'admin') ||
        (user?.role !== 'admin' && latest.senderRole === 'student');

      if (!isSentByMe) {
        setLiveAnnouncement(`New message from ${latest.senderName}: ${latest.text}`);
      }

      if (isNearBottomRef.current || isSentByMe) {
        scrollToBottom(true);
      } else {
        setShowNewMessagesBtn(true);
      }
    }

    prevMessagesRef.current = messages;
  }, [messages, user]);

  const sendMutation = useMutation({
    mutationFn: (text) => sendMessage(claimId, text, user),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', claimId] });
      queryClient.invalidateQueries({ queryKey: ['messages', 'unread'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['claims'] });
      setInputText('');
      setErrorMsg(null);
      scrollToBottom(true);
    },
    onError: (err) => {
      setErrorMsg(err?.message || 'Failed to send message.');
    },
  });

  const handleSend = (e) => {
    if (e) e.preventDefault();
    setErrorMsg(null);

    const trimmed = inputText.trim();
    if (!trimmed) {
      setErrorMsg('Please enter a message.');
      return;
    }
    if (trimmed.length > 1000) {
      setErrorMsg('Message cannot exceed 1000 characters.');
      return;
    }

    sendMutation.mutate(trimmed);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const charCount = inputText.trim().length;
  const isOverLimit = charCount > 1000;

  if (authError || !isAuthorized) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
          <p className="font-bold">Thread Restricted</p>
          <p className="mt-0.5 text-amber-800">
            {authError || 'Only authorized case administrators or the verified claimant student can access this communication thread.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col">
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {liveAnnouncement}
      </div>

      <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between gap-3 bg-slate-50/70">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-sm font-bold text-slate-900">
              Claim Discussion &amp; Verification Clarifications
            </h3>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Direct institutional channel between Student Claimant and Security Desk Officer.
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[11px] text-slate-600 font-mono">
          <span>Ref:</span>
          <span className="font-bold text-slate-900">{claim?.referenceNo || claimId}</span>
        </div>
      </div>

      <div className="relative flex-1">
        <div
          ref={messagesContainerRef}
          onScroll={handleScroll}
          className="h-80 sm:h-96 overflow-y-auto p-4 sm:p-5 space-y-3.5 bg-slate-50/40"
        >
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center space-y-2 text-slate-400">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs">Loading case discussion...</span>
            </div>
          ) : isError ? (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs text-center">
              Failed to load messages: {error?.message}
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
                💬
              </div>
              <p className="text-xs font-semibold text-slate-700">No messages in this case thread yet.</p>
              <p className="text-[11px] text-slate-400 max-w-xs mt-1">
                Use this channel to clarify proof, provide serial details, or coordinate counter pickup.
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMine =
                (user?.role === 'admin' && msg.senderRole === 'admin') ||
                (user?.role !== 'admin' && msg.senderRole === 'student');

              const isDeskOfficer = msg.senderRole === 'admin';

              const formattedTime = new Date(msg.timestamp).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              });
              const formattedDate = new Date(msg.timestamp).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              });

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} max-w-full`}
                >
                  <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px] text-slate-400">
                    <span className="font-semibold text-slate-700">{msg.senderName}</span>
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider ${
                      isDeskOfficer
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-blue-100 text-blue-800 border border-blue-200'
                    }`}>
                      {isDeskOfficer ? 'Desk Officer' : 'Student'}
                    </span>
                    <span>&bull;</span>
                    <span className="font-mono text-[10px]">{formattedDate} {formattedTime}</span>
                  </div>

                  <div
                    className={`p-3.5 rounded-2xl text-xs leading-relaxed max-w-xl break-words shadow-2xs ${
                      isMine
                        ? 'bg-blue-600 text-white rounded-tr-xs'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-tl-xs'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>

                  {msg.unread && (
                    <span className="text-[10px] font-medium text-amber-600 mt-0.5 px-1">
                      {isMine ? 'Pending recipient review' : '• New'}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>

        {showNewMessagesBtn && (
          <button
            type="button"
            onClick={() => scrollToBottom(true)}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-full shadow-md flex items-center gap-1.5 transition cursor-pointer animate-bounce"
          >
            <span>↓ New messages</span>
          </button>
        )}
      </div>

      <form onSubmit={handleSend} className="p-3 sm:p-4 border-t border-slate-200 bg-white space-y-2">
        {errorMsg && (
          <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between">
            <span>{errorMsg}</span>
            <button
              type="button"
              onClick={() => setErrorMsg(null)}
              className="font-bold text-rose-900 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        <div className="relative">
          <textarea
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              if (errorMsg) setErrorMsg(null);
            }}
            onKeyDown={handleKeyDown}
            placeholder={
              user?.role === 'admin'
                ? 'Send inquiry or instructions to claimant (Press Enter to send, Shift+Enter for new line)...'
                : 'Reply to desk officer or provide additional identifying details (Press Enter to send)...'
            }
            rows={3}
            disabled={sendMutation.isPending}
            className={`w-full p-3 text-xs bg-slate-50 border rounded-xl resize-none focus:outline-none focus:bg-white transition ${
              isOverLimit
                ? 'border-rose-400 focus:ring-2 focus:ring-rose-500/20'
                : 'border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500'
            }`}
          />
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className={`text-[11px] font-mono ${isOverLimit ? 'text-rose-600 font-bold' : 'text-slate-400'}`}>
            {charCount} / 1000 characters
          </span>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400 hidden sm:inline">
              Press <strong>Enter ↵</strong> to send
            </span>
            <button
              type="submit"
              disabled={sendMutation.isPending || !inputText.trim() || isOverLimit}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-2xs transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              {sendMutation.isPending ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <span>Send Message</span>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
