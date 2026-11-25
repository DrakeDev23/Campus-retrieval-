import { readClaimsStore, writeClaimsStore } from './claimsService.js';
import { readNotificationsStore, writeNotificationsStore, pushNotification } from './notificationsService.js';

const MESSAGES_STORAGE_KEY = 'itemfinder_claim_messages_v1';
const ARTIFICIAL_DELAY_MS = 200;

let inMemoryMessagesFallback = null;

function delay(ms = ARTIFICIAL_DELAY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function formatShortDate(date = new Date()) {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatDateTime(date = new Date()) {
  const d = formatShortDate(date);
  const t = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${d} • ${t}`;
}

export function ensureParticipant(claim, actingUser) {
  if (!actingUser || !claim) {
    throw new Error('Access denied: Authentication and valid claim record required.');
  }

  if (actingUser.role === 'admin') {
    return true;
  }

  const claimStudentId = claim.studentId || claim.claimantId;
  const userStudentId = actingUser.studentId;

  if (userStudentId && claimStudentId && userStudentId === claimStudentId) {
    return true;
  }

  throw new Error('Access denied: You are not authorized to access or participate in this claim thread.');
}

function createInitialSeedMessages(existingClaims) {
  if (!Array.isArray(existingClaims) || existingClaims.length === 0) {
    return [];
  }

  const existingIds = new Set(existingClaims.map((c) => c.id));
  const seeds = [];

  if (existingIds.has('CLM-2026-0841')) {
    seeds.push(
      {
        id: 'msg-seed-841-1',
        claimId: 'CLM-2026-0841',
        senderId: 'ADMIN-SEC-402',
        senderName: 'Officer R. Santos',
        senderRole: 'admin',
        text: 'Good day Jane. We are reviewing your claim for the Sony WH-1000XM4 Headphones. Could you confirm if there is any visible sticker or engraving on the carry case?',
        timestamp: new Date(Date.now() - 3600000 * 26).toISOString(),
        unread: false,
      },
      {
        id: 'msg-seed-841-2',
        claimId: 'CLM-2026-0841',
        senderId: '2024-08912',
        senderName: 'Jane G. Doe',
        senderRole: 'student',
        text: 'Hello Officer Santos! Yes, the case has an orange carabiner attached to the zipper loop, and inside there is an airplane adapter.',
        timestamp: new Date(Date.now() - 3600000 * 20).toISOString(),
        unread: false,
      },
      {
        id: 'msg-seed-841-3',
        claimId: 'CLM-2026-0841',
        senderId: 'ADMIN-SEC-402',
        senderName: 'Officer R. Santos',
        senderRole: 'admin',
        text: 'Thank you! That matches our physical intake log. Please monitor this claim as we finalize clearance.',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        unread: true,
      }
    );
  }

  if (existingIds.has('CLM-2026-0710')) {
    seeds.push(
      {
        id: 'msg-seed-710-1',
        claimId: 'CLM-2026-0710',
        senderId: '2024-08912',
        senderName: 'Jane G. Doe',
        senderRole: 'student',
        text: 'Good morning, what hours is the Central Security Custody Desk open for pickup with my digital pass PIN?',
        timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
        unread: true,
      }
    );
  }

  return seeds;
}

export function readMessagesStore() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(MESSAGES_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          inMemoryMessagesFallback = parsed;
          return parsed;
        }
      }
    }
  } catch {
  }

  if (inMemoryMessagesFallback) {
    return inMemoryMessagesFallback;
  }

  const existingClaims = readClaimsStore();
  const seeded = createInitialSeedMessages(existingClaims);
  inMemoryMessagesFallback = seeded;
  writeMessagesStore(seeded);
  return seeded;
}

export function writeMessagesStore(messages) {
  inMemoryMessagesFallback = messages;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(messages));
    }
  } catch {
  }
}

export async function getClaimMessages(claimId, actingUser) {
  await delay(100);

  const claims = readClaimsStore();
  const claim = claims.find((c) => c.id === claimId || c.referenceNo === claimId);
  if (!claim) {
    throw new Error('Claim record not found.');
  }

  ensureParticipant(claim, actingUser);

  const allMessages = readMessagesStore();
  return allMessages
    .filter((m) => m.claimId === claim.id)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

export async function sendMessage(claimId, text, actingUser) {
  await delay(150);

  if (typeof text !== 'string') {
    throw new Error('Message content must be a valid text string.');
  }
  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error('Message cannot be empty or only whitespace.');
  }
  if (trimmed.length > 1000) {
    throw new Error('Message exceeds maximum limit of 1000 characters.');
  }

  const claims = readClaimsStore();
  const claimIndex = claims.findIndex((c) => c.id === claimId || c.referenceNo === claimId);
  if (claimIndex === -1) {
    throw new Error('Claim record not found.');
  }
  const claim = claims[claimIndex];

  ensureParticipant(claim, actingUser);

  const senderRole = actingUser.role === 'admin' ? 'admin' : 'student';
  const senderId = actingUser.studentId || actingUser.id || (senderRole === 'admin' ? 'ADMIN-SEC' : 'STUDENT');
  const senderName = actingUser.fullName || (senderRole === 'admin' ? 'Desk Officer' : 'Student');

  const currentMessages = readMessagesStore();

  const newMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    claimId: claim.id,
    senderId,
    senderName,
    senderRole,
    text: trimmed,
    timestamp: new Date().toISOString(),
    unread: true,
  };

  const updatedMessages = [...currentMessages, newMessage];
  writeMessagesStore(updatedMessages);

  const now = new Date();
  const todayDateStr = formatShortDate(now);
  const claimTimeline = [...(claim.timeline || [])];

  let claimUpdated = false;
  const updatedClaim = { ...claim };

  if (senderRole === 'student') {
    updatedClaim.hasStudentReply = true;
    claimUpdated = true;

    const isReplyToInfoRequest =
      claim.status === 'Needs More Info' ||
      claimTimeline.some((t) => t.title?.includes('Additional Details Requested') || t.title?.includes('Information Requested'));

    const studentRepliesCount = currentMessages.filter(
      (m) => m.claimId === claim.id && m.senderRole === 'student'
    ).length;

    const hasStudentAuditToday = claimTimeline.some(
      (t) => t.actorId === senderId && t.date?.startsWith(todayDateStr)
    );

    if (isReplyToInfoRequest && studentRepliesCount === 0) {
      claimTimeline.unshift({
        date: formatDateTime(now),
        stage: claim.currentStage,
        title: 'Claimant Provided Additional Information',
        desc: `Student submitted details via thread: "${trimmed.length > 70 ? trimmed.slice(0, 67) + '...' : trimmed}"`,
        actorId: senderId,
      });
      if (claim.status === 'Needs More Info') {
        updatedClaim.status = 'Under Initial Review';
        updatedClaim.statusBadge = 'bg-blue-50 text-blue-700 border-blue-200';
      }
    } else if (!hasStudentAuditToday) {
      claimTimeline.unshift({
        date: formatDateTime(now),
        stage: claim.currentStage,
        title: 'Student Clarification Message',
        desc: `Student message logged in claim discussion.`,
        actorId: senderId,
      });
    }
  } else {
    updatedClaim.hasStudentReply = false;
    claimUpdated = true;

    const hasAdminAuditToday = claimTimeline.some(
      (t) => t.actorId === senderId && t.date?.startsWith(todayDateStr)
    );

    if (!hasAdminAuditToday) {
      claimTimeline.unshift({
        date: formatDateTime(now),
        stage: claim.currentStage,
        title: 'Officer Clarification Sent',
        desc: `Desk message dispatched to claimant by ${senderName}.`,
        actorId: senderId,
      });
    }
  }

  updatedClaim.timeline = claimTimeline;
  claims[claimIndex] = updatedClaim;
  writeClaimsStore(claims);

  const recipientRole = senderRole === 'admin' ? 'student' : 'admin';
  const recipientId = senderRole === 'admin' ? (claim.studentId || claim.claimantId) : 'admin';
  const deepLink =
    recipientRole === 'admin'
      ? `/admin/claims/${claim.id}`
      : `/dashboard?tab=claims-tracking&claimId=${claim.id}`;

  const currentNotifs = readNotificationsStore();
  const existingNotifIndex = currentNotifs.findIndex(
    (n) =>
      n.unread &&
      n.type === 'message' &&
      n.claimId === claim.id &&
      (n.recipientRole === recipientRole || n.recipientId === recipientId)
  );

  const previewSnippet = trimmed.length > 50 ? `${trimmed.slice(0, 47)}...` : trimmed;

  if (existingNotifIndex !== -1) {
    const existing = currentNotifs[existingNotifIndex];
    const newCount = (existing.messageCount || 1) + 1;
    currentNotifs[existingNotifIndex] = {
      ...existing,
      messageCount: newCount,
      title: `${newCount} New Messages on ${claim.referenceNo}`,
      message: `${senderName}: "${previewSnippet}"`,
      timestamp: 'Just now',
      unread: true,
      deepLink,
      link: deepLink,
    };
    writeNotificationsStore(currentNotifs);
  } else {
    pushNotification({
      title: `New Message on ${claim.referenceNo}`,
      message: `${senderName}: "${previewSnippet}"`,
      type: 'message',
      claimId: claim.id,
      recipientId,
      recipientRole,
      deepLink,
      link: deepLink,
      messageCount: 1,
    });
  }

  return newMessage;
}

export async function markThreadRead(claimId, actingUser) {
  if (!claimId || !actingUser) return { count: 0 };

  const claims = readClaimsStore();
  const claim = claims.find((c) => c.id === claimId || c.referenceNo === claimId);
  if (!claim) return { count: 0 };

  ensureParticipant(claim, actingUser);

  const viewingRole = actingUser.role === 'admin' ? 'admin' : 'student';
  const currentMessages = readMessagesStore();

  let updatedCount = 0;
  const updatedMessages = currentMessages.map((m) => {
    if (m.claimId === claim.id && m.unread && m.senderRole !== viewingRole) {
      updatedCount += 1;
      return { ...m, unread: false };
    }
    return m;
  });

  if (updatedCount > 0) {
    writeMessagesStore(updatedMessages);
  }

  const currentNotifs = readNotificationsStore();
  let notifsUpdated = false;
  const updatedNotifs = currentNotifs.map((n) => {
    if (n.unread && n.type === 'message' && n.claimId === claim.id) {
      if (viewingRole === 'admin' && (n.recipientRole === 'admin' || n.recipientId === 'admin')) {
        notifsUpdated = true;
        return { ...n, unread: false };
      }
      if (viewingRole === 'student' && (n.recipientRole === 'student' || n.recipientId === actingUser.studentId)) {
        notifsUpdated = true;
        return { ...n, unread: false };
      }
    }
    return n;
  });

  if (notifsUpdated) {
    writeNotificationsStore(updatedNotifs);
  }

  return { count: updatedCount };
}

export async function getUnreadCounts(actingUser) {
  if (!actingUser) return { total: 0, byClaim: {} };

  const messages = readMessagesStore();
  const claims = readClaimsStore();

  const byClaim = {};
  let total = 0;

  if (actingUser.role === 'admin') {
    messages.forEach((m) => {
      if (m.unread && m.senderRole === 'student') {
        total += 1;
        byClaim[m.claimId] = (byClaim[m.claimId] || 0) + 1;
      }
    });
  } else {
    const studentId = actingUser.studentId;
    const studentClaimIds = new Set(
      claims
        .filter((c) => (c.studentId && c.studentId === studentId) || (c.claimantId && c.claimantId === studentId))
        .map((c) => c.id)
    );

    messages.forEach((m) => {
      if (studentClaimIds.has(m.claimId) && m.unread && m.senderRole === 'admin') {
        total += 1;
        byClaim[m.claimId] = (byClaim[m.claimId] || 0) + 1;
      }
    });
  }

  return { total, byClaim };
}
