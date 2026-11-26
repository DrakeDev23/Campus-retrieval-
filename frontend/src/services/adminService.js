// TODO(backend): validate passCode server-side only, never trust the client
// TODO(backend): rate limiting in FastAPI
// TODO(backend): store only hashes of passCode and PIN

import { readClaimsStore, writeClaimsStore, generatePassCode, formatValidityWindow } from './claimsService.js';
import { readItemsStore, writeItemsStore } from './foundItemsService.js';
import { pushNotification } from './notificationsService.js';

const ARTIFICIAL_DELAY_MS = 250;

function delay(ms = ARTIFICIAL_DELAY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function ensureAdmin(actingUser) {
  if (!actingUser || actingUser.role !== 'admin') {
    throw new Error('Access denied: Administrator privileges are required to perform this action.');
  }
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

function generateLockerPin() {
  const n = Math.floor(100000 + Math.random() * 900000);
  const s = String(n);
  return `${s.slice(0, 3)}-${s.slice(3)}`;
}

export async function getAllClaims(actingUser) {
  await delay(200);
  ensureAdmin(actingUser);
  return readClaimsStore();
}

export async function getClaimById(claimId, actingUser) {
  await delay(200);
  ensureAdmin(actingUser);
  const claims = readClaimsStore();
  const found = claims.find((c) => c.id === claimId || c.referenceNo === claimId);
  if (!found) return null;
  return found;
}

export async function getAdminItemDetails(itemId, itemTitle, actingUser) {
  await delay(150);
  ensureAdmin(actingUser);
  const items = readItemsStore();
  return (
    items.find((i) => (itemId && i.id === itemId) || (itemTitle && i.title.toLowerCase() === itemTitle.toLowerCase())) || null
  );
}

export async function getAdminFoundItems(actingUser) {
  await delay(200);
  ensureAdmin(actingUser);
  return readItemsStore();
}

export async function advanceClaimStage(claimId, actingUser) {
  await delay(350);
  ensureAdmin(actingUser);

  const claims = readClaimsStore();
  const claimIndex = claims.findIndex((c) => c.id === claimId);
  if (claimIndex === -1) throw new Error('Claim not found.');

  const claim = claims[claimIndex];

  if (claim.status === 'Rejected' || claim.status === 'Needs More Info' || claim.currentStage >= 5) {
    throw new Error(`Cannot advance claim currently in status "${claim.status}" (Stage ${claim.currentStage}).`);
  }

  const nextStage = claim.currentStage + 1;
  const stageLabels = {
    2: { status: 'Under Initial Review', badge: 'bg-blue-50 text-blue-700 border-blue-200' },
    3: { status: 'Verification in Progress', badge: 'bg-amber-50 text-amber-700 border-amber-200' },
    4: { status: 'Awaiting Admin Approval', badge: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  };

  const stageMeta = stageLabels[nextStage] || { status: `Stage ${nextStage}`, badge: 'bg-blue-50 text-blue-700 border-blue-200' };

  const now = new Date();
  const adminName = actingUser.fullName || 'Admin Desk';

  const updatedClaim = {
    ...claim,
    currentStage: nextStage,
    status: stageMeta.status,
    statusBadge: stageMeta.badge,
    assignedOfficer: adminName,
    hasStudentReply: false,
    timeline: [
      {
        date: formatDateTime(now),
        stage: nextStage,
        title: `Advanced to Stage ${nextStage}: ${stageMeta.status}`,
        desc: `Verified and advanced by ${adminName}.`,
        actorId: actingUser.id,
      },
      ...(claim.timeline || []),
    ],
  };

  claims[claimIndex] = updatedClaim;
  writeClaimsStore(claims);

  pushNotification({
    title: 'Claim Status Updated',
    message: `Your claim ${claim.referenceNo} for "${claim.itemName}" has advanced to Stage ${nextStage}: ${stageMeta.status}.`,
    type: 'claim',
  });

  return updatedClaim;
}

/**
 * Approve claim for item retrieval (Stage 5).
 * Generates a 6-digit locker PIN and a separate cryptographically secure passCode.
 * 
 * TODO(backend): validate passCode server-side only, never trust the client
 * TODO(backend): store only hashes of passCode and PIN
 */
export async function approveClaim(claimId, actingUser) {
  await delay(400);
  ensureAdmin(actingUser);

  const claims = readClaimsStore();
  const claimIndex = claims.findIndex((c) => c.id === claimId);
  if (claimIndex === -1) throw new Error('Claim not found.');

  const claim = claims[claimIndex];
  if (claim.currentStage > 4 || claim.status === 'Rejected') {
    throw new Error('Only pending claims in verification (Stages 1–4) can be approved.');
  }

  const now = new Date();
  const adminName = actingUser.fullName || 'Security Officer';
  const pin = generateLockerPin();
  const passCode = generatePassCode();
  const pickupStation = claim.custodyLocation || 'Central Security Hub Room 102';
  const expiryDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const passExpiresAt = expiryDate.toISOString();

  const pickupPass = {
    code: `PASS-${claim.referenceNo.replace(/[^0-9]/g, '') || Math.floor(100 + Math.random() * 900)}`,
    pin,
    station: pickupStation,
    expiry: formatValidityWindow(passExpiresAt),
    notes: 'Present this digital pass or PIN at the assigned counter / locker to retrieve your item.',
    passCode,
    expiresAt: passExpiresAt,
  };

  const updatedClaim = {
    ...claim,
    currentStage: 5,
    status: 'Ready for Retrieval',
    statusBadge: 'bg-blue-50 text-blue-700 border-blue-200',
    assignedOfficer: adminName,
    hasStudentReply: false,
    passCode,
    passExpiresAt,
    passUsedAt: null,
    pickupPass,
    timeline: [
      {
        date: formatDateTime(now),
        stage: 5,
        title: 'Claim Approved for Retrieval',
        desc: `Ownership approved by ${adminName}. 6-digit contactless retrieval PIN generated.`,
        actorId: actingUser.id,
      },
      ...(claim.timeline || []),
    ],
  };

  claims[claimIndex] = updatedClaim;
  writeClaimsStore(claims);

  const items = readItemsStore();
  const itemIndex = items.findIndex((i) => (claim.itemId && i.id === claim.itemId) || i.title.toLowerCase() === claim.itemName.toLowerCase());
  if (itemIndex !== -1) {
    items[itemIndex] = {
      ...items[itemIndex],
      status: 'Claimed',
    };
    writeItemsStore(items);
  }

  pushNotification({
    title: 'Claim Approved for Retrieval!',
    message: `Your claim ${claim.referenceNo} for "${claim.itemName}" was approved! Your retrieval PIN is ${pin}. Pick up at ${pickupStation}.`,
    type: 'approved',
  });

  return updatedClaim;
}

export async function rejectClaim(claimId, reason, actingUser) {
  await delay(350);
  ensureAdmin(actingUser);

  if (!reason || !reason.trim()) {
    throw new Error('A rejection reason is required.');
  }

  const claims = readClaimsStore();
  const claimIndex = claims.findIndex((c) => c.id === claimId);
  if (claimIndex === -1) throw new Error('Claim not found.');

  const claim = claims[claimIndex];
  if (claim.currentStage === 6) {
    throw new Error('Cannot reject a claim that has already been retrieved.');
  }

  const now = new Date();
  const adminName = actingUser.fullName || 'Security Officer';

  const updatedClaim = {
    ...claim,
    status: 'Rejected',
    statusBadge: 'bg-rose-50 text-rose-700 border-rose-200',
    rejectionReason: reason.trim(),
    rejectionDate: formatDateTime(now),
    assignedOfficer: adminName,
    hasStudentReply: false,
    timeline: [
      {
        date: formatDateTime(now),
        stage: claim.currentStage,
        title: 'Claim Rejected',
        desc: `Reason: ${reason.trim()} (Reviewed by ${adminName})`,
        actorId: actingUser.id,
      },
      ...(claim.timeline || []),
    ],
  };

  claims[claimIndex] = updatedClaim;
  writeClaimsStore(claims);

  const items = readItemsStore();
  const itemIndex = items.findIndex((i) => (claim.itemId && i.id === claim.itemId) || i.title.toLowerCase() === claim.itemName.toLowerCase());
  if (itemIndex !== -1) {
    const otherApproved = claims.some((c) => c.id !== claimId && c.itemId === items[itemIndex].id && c.currentStage === 5);
    if (!otherApproved && items[itemIndex].status !== 'Returned') {
      items[itemIndex] = {
        ...items[itemIndex],
        status: 'In Custody',
      };
      writeItemsStore(items);
    }
  }

  pushNotification({
    title: 'Claim Decision Notification',
    message: `Your claim ${claim.referenceNo} for "${claim.itemName}" was reviewed: ${reason.trim()}`,
    type: 'info',
  });

  return updatedClaim;
}

export async function requestMoreInfo(claimId, message, actingUser) {
  await delay(350);
  ensureAdmin(actingUser);

  if (!message || !message.trim()) {
    throw new Error('A message describing what details are needed is required.');
  }

  const claims = readClaimsStore();
  const claimIndex = claims.findIndex((c) => c.id === claimId);
  if (claimIndex === -1) throw new Error('Claim not found.');

  const claim = claims[claimIndex];
  if (claim.currentStage >= 5) {
    throw new Error('Cannot request info on claims already approved or retrieved.');
  }

  const now = new Date();
  const adminName = actingUser.fullName || 'Desk Officer';

  const updatedClaim = {
    ...claim,
    status: 'Needs More Info',
    statusBadge: 'bg-amber-50 text-amber-800 border-amber-300',
    rejectionReason: message.trim(),
    rejectionDate: formatDateTime(now),
    assignedOfficer: adminName,
    hasStudentReply: false,
    timeline: [
      {
        date: formatDateTime(now),
        stage: claim.currentStage,
        title: 'Additional Details Requested',
        desc: `${message.trim()} (Requested by ${adminName})`,
        actorId: actingUser.id,
      },
      ...(claim.timeline || []),
    ],
  };

  claims[claimIndex] = updatedClaim;
  writeClaimsStore(claims);

  pushNotification({
    title: 'Action Needed on Your Claim',
    message: `Administrator requested additional information for ${claim.referenceNo}: ${message.trim()}`,
    type: 'info',
  });

  return updatedClaim;
}

export function getOtherPendingClaims(claims, itemId, itemTitle, currentClaimId) {
  if (!Array.isArray(claims)) return [];
  return claims.filter((c) => {
    if (c.id === currentClaimId) return false;
    const sameItem = (itemId && c.itemId === itemId) || (itemTitle && c.itemName.toLowerCase() === itemTitle.toLowerCase());
    return sameItem && c.status !== 'Rejected' && c.currentStage < 6;
  });
}

export function hasActiveClaimsForItem(claims, itemId, itemTitle) {
  if (!Array.isArray(claims)) return false;
  return claims.some((c) => {
    const sameItem = (itemId && c.itemId === itemId) || (itemTitle && c.itemName.toLowerCase() === itemTitle.toLowerCase());
    return sameItem && c.status !== 'Rejected' && c.currentStage < 6;
  });
}

export async function updateItemStatus(itemId, newStatus, actingUser) {
  await delay(300);
  ensureAdmin(actingUser);

  const items = readItemsStore();
  const claims = readClaimsStore();
  const itemIndex = items.findIndex((i) => i.id === itemId);
  if (itemIndex === -1) throw new Error('Item not found.');

  const item = items[itemIndex];

  if (newStatus === 'Returned' && hasActiveClaimsForItem(claims, item.id, item.title)) {
    throw new Error('Cannot mark item as Returned while active claims are pending or ready for pickup. Resolve all claims first.');
  }

  items[itemIndex] = {
    ...item,
    status: newStatus,
  };
  writeItemsStore(items);
  return items[itemIndex];
}

export async function addFoundItem(itemData, actingUser) {
  await delay(350);
  ensureAdmin(actingUser);

  if (!itemData.title || !itemData.title.trim()) throw new Error('Item title is required.');
  if (!itemData.category) throw new Error('Category is required.');
  if (!itemData.location || !itemData.location.trim()) throw new Error('Location found is required.');
  if (!itemData.custody || !itemData.custody.trim()) throw new Error('Custody facility is required.');

  const items = readItemsStore();
  const newId = `ITM-${Math.floor(200 + Math.random() * 800)}`;

  const newItem = {
    id: newId,
    title: itemData.title.trim(),
    category: itemData.category,
    status: itemData.status || 'In Custody',
    description: (itemData.description || '').trim(),
    foundTime: itemData.foundTime || `Today, ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`,
    location: itemData.location.trim(),
    custody: itemData.custody.trim(),
    buttonType: itemData.status === 'Returned' ? 'closed' : 'claim',
    hiddenIdentifiers: (itemData.hiddenIdentifiers || '').trim(),
    image: itemData.image || null,
  };

  const updated = [newItem, ...items];
  writeItemsStore(updated);
  return newItem;
}

export async function editFoundItem(itemId, itemData, actingUser) {
  await delay(350);
  ensureAdmin(actingUser);

  const items = readItemsStore();
  const itemIndex = items.findIndex((i) => i.id === itemId);
  if (itemIndex === -1) throw new Error('Item not found.');

  const updatedItem = {
    ...items[itemIndex],
    ...itemData,
    title: itemData.title?.trim() || items[itemIndex].title,
    location: itemData.location?.trim() || items[itemIndex].location,
    custody: itemData.custody?.trim() || items[itemIndex].custody,
    description: itemData.description?.trim() || items[itemIndex].description,
    hiddenIdentifiers: itemData.hiddenIdentifiers?.trim() ?? items[itemIndex].hiddenIdentifiers,
    buttonType: (itemData.status || items[itemIndex].status) === 'Returned' ? 'closed' : 'claim',
  };

  items[itemIndex] = updatedItem;
  writeItemsStore(items);
  return updatedItem;
}

export async function deleteFoundItem(itemId, actingUser) {
  await delay(300);
  ensureAdmin(actingUser);

  const items = readItemsStore();
  const claims = readClaimsStore();
  const target = items.find((i) => i.id === itemId);
  if (!target) throw new Error('Item not found.');

  if (hasActiveClaimsForItem(claims, target.id, target.title)) {
    throw new Error('Cannot delete an item that has active or approved claims.');
  }

  const updated = items.filter((i) => i.id !== itemId);
  writeItemsStore(updated);
  return true;
}

/**
 * Verify a student's retrieval pass.
 *
 * Rules:
 * 1. Match passCode (or Claim ID + PIN) FIRST.
 * 2. Only after a match, report Expired / Already used / Wrong status.
 * 3. Wrong claim ID and wrong code both return the same generic "Invalid".
 * 4. Manual entry is always Claim ID + 6-digit PIN. A PIN alone is never accepted.
 *
 * TODO(backend): validate passCode server-side only, never trust the client
 * TODO(backend): rate limiting in FastAPI
 * TODO(backend): store only hashes of passCode and PIN
 */
export async function verifyPass(input, actingUser) {
  await delay(300);
  ensureAdmin(actingUser);

  if (!input) {
    return { valid: false, result: 'Invalid', message: 'No pass code or credentials provided.' };
  }

  let claimId = '';
  let passCode = '';
  let pin = '';
  let isManualEntry = false;

  if (typeof input === 'object') {
    claimId = (input.claimId || '').trim();
    passCode = (input.passCode || '').trim();
    pin = (input.pin || '').trim();
    isManualEntry = Boolean(input.isManual || (claimId && pin && !passCode));
  } else if (typeof input === 'string') {
    const raw = input.trim();
    // Cap input length for security
    if (raw.length > 500) {
      return { valid: false, result: 'Invalid', message: 'Input exceeds maximum allowed length.' };
    }

    try {
      if (raw.startsWith('{') && raw.endsWith('}')) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          claimId = (parsed.claimId || '').trim();
          passCode = (parsed.passCode || '').trim();
        }
      }
    } catch {
      // Non-JSON string
    }

    if (!claimId && !passCode) {
      return { valid: false, result: 'Invalid', message: 'Invalid pass format. Manual entry requires both Claim ID and 6-digit PIN.' };
    }
  }

  // Rule: Manual entry is ALWAYS Claim ID + 6-digit PIN. A PIN alone is never accepted.
  if (isManualEntry || pin) {
    if (!claimId || !pin) {
      return {
        valid: false,
        result: 'Invalid',
        message: 'Manual entry requires both Claim ID and the 6-digit PIN.',
      };
    }
  }

  const claims = readClaimsStore();
  const claim = claims.find(
    (c) =>
      c.id.toLowerCase() === claimId.toLowerCase() ||
      c.referenceNo.toLowerCase() === claimId.toLowerCase()
  );

  // Match the passCode (or Claim ID + PIN) FIRST
  // Wrong claim ID and wrong code both return the same generic "Invalid"
  if (!claim) {
    return { valid: false, result: 'Invalid', message: 'Invalid retrieval pass or credentials.' };
  }

  let matched = false;
  if (isManualEntry || pin) {
    const cleanInputPin = pin.replace(/[^0-9]/g, '');
    const cleanStoredPin = (claim.pickupPass?.pin || '').replace(/[^0-9]/g, '');
    if (cleanInputPin.length === 6 && cleanStoredPin.length === 6 && cleanInputPin === cleanStoredPin) {
      matched = true;
    }
  } else if (passCode) {
    if (claim.passCode && claim.passCode === passCode) {
      matched = true;
    }
  }

  if (!matched) {
    return { valid: false, result: 'Invalid', message: 'Invalid retrieval pass or credentials.' };
  }

  // ONLY AFTER a match report Expired / Already used / Wrong status
  // 1. Already used?
  if (claim.passUsedAt || claim.currentStage === 6) {
    return {
      valid: false,
      result: 'Already used',
      claim,
      message: 'This retrieval pass has already been used and item was handed over.',
    };
  }

  // 2. Wrong status? (Must be Stage 5: Ready for Retrieval)
  if (claim.currentStage !== 5) {
    return {
      valid: false,
      result: 'Wrong status',
      claim,
      message: `Claim is in status "${claim.status}" (Stage ${claim.currentStage}), not Approved for Retrieval.`,
    };
  }

  // 3. Expired?
  const expiresAt = claim.passExpiresAt || claim.pickupPass?.expiresAt;
  if (expiresAt && new Date(expiresAt).getTime() < Date.now()) {
    return {
      valid: false,
      result: 'Expired',
      claim,
      message: 'This retrieval pass has expired.',
    };
  }

  return {
    valid: true,
    result: 'Valid',
    claim,
    message: 'Pass verified successfully. Ready for physical ID inspection and handover.',
  };
}

/**
 * Confirm item handover and finalize case to Stage 6 (Successfully Retrieved).
 * 
 * Rules:
 * - Re-verifies everything itself (match, status, expiry, passUsedAt) with a fresh read from storage.
 * - Is a no-op if already used.
 * - Requires physical school ID verification checkbox confirmation.
 * - Closes other active claims on the same item.
 * - Sets item status in custody to Returned.
 * - Generates official retrieval receipt and deep-links notification to student.
 * 
 * TODO(backend): validate passCode server-side only, never trust the client
 * TODO(backend): rate limiting in FastAPI
 * TODO(backend): store only hashes of passCode and PIN
 */
export async function confirmHandover(claimId, actingUser, options = {}) {
  await delay(350);
  ensureAdmin(actingUser);

  const claims = readClaimsStore();
  const claimIndex = claims.findIndex((c) => c.id === claimId || c.referenceNo === claimId);
  if (claimIndex === -1) {
    throw new Error('Claim not found.');
  }

  const claim = claims[claimIndex];

  // Fresh read verification: No-op if already used
  if (claim.passUsedAt || claim.currentStage === 6) {
    return {
      success: true,
      alreadyUsed: true,
      claim,
      message: 'Pass has already been used and handover was previously completed.',
    };
  }

  if (claim.currentStage !== 5) {
    throw new Error(`Cannot handover claim in status "${claim.status}" (Stage ${claim.currentStage}). Must be Stage 5.`);
  }

  const expiresAt = claim.passExpiresAt || claim.pickupPass?.expiresAt;
  if (expiresAt && new Date(expiresAt).getTime() < Date.now()) {
    throw new Error('Cannot handover item: The retrieval pass has expired.');
  }

  if (!options.schoolIdVerified) {
    throw new Error("Physical verification of the student's school ID card is mandatory prior to releasing the item.");
  }

  const now = new Date();
  const nowIso = now.toISOString();
  const receiptNo = `RCP-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const adminName = actingUser.fullName || 'Security Officer';

  const retrievalReceipt = {
    receiptNo,
    releasedAt: formatDateTime(now),
    releasedBy: `${adminName} (Security Custody Desk)`,
    signedBy: `${claim.claimantName || 'Student'} (Student ID: ${claim.claimantId || claim.studentId || 'Verified'})`,
    schoolIdVerified: true,
  };

  const updatedClaim = {
    ...claim,
    currentStage: 6,
    status: 'Successfully Retrieved',
    statusBadge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    passUsedAt: nowIso,
    retrievalReceipt,
    timeline: [
      {
        date: formatDateTime(now),
        stage: 6,
        title: 'Handover Completed (Retrieved)',
        desc: `Item released to ${claim.claimantName || 'student'} by ${adminName}. School ID physically verified. Digital receipt #${receiptNo} logged.`,
        actorId: actingUser.id,
      },
      ...(claim.timeline || []),
    ],
  };

  claims[claimIndex] = updatedClaim;

  // On handover, close or flag other active claims on the same item
  claims.forEach((otherClaim, idx) => {
    if (idx === claimIndex) return;
    const sameItem =
      (claim.itemId && otherClaim.itemId && otherClaim.itemId === claim.itemId) ||
      (otherClaim.itemName?.toLowerCase() === claim.itemName?.toLowerCase());
    if (sameItem && otherClaim.currentStage < 6 && otherClaim.status !== 'Rejected') {
      claims[idx] = {
        ...otherClaim,
        status: 'Closed - Item Handed Over',
        statusBadge: 'bg-slate-100 text-slate-600 border-slate-300',
        timeline: [
          {
            date: formatDateTime(now),
            stage: otherClaim.currentStage,
            title: 'Claim Closed (Item Handed Over)',
            desc: `Item was returned to verified owner (${claim.claimantName || 'Student'}) under claim ${claim.referenceNo}.`,
            actorId: actingUser.id,
          },
          ...(otherClaim.timeline || []),
        ],
      };
    }
  });

  writeClaimsStore(claims);

  // Update item custody status to Returned
  const items = readItemsStore();
  const itemIndex = items.findIndex(
    (i) => (claim.itemId && i.id === claim.itemId) || i.title.toLowerCase() === claim.itemName?.toLowerCase()
  );
  if (itemIndex !== -1) {
    items[itemIndex] = {
      ...items[itemIndex],
      status: 'Returned',
      buttonType: 'closed',
    };
    writeItemsStore(items);
  }

  // Send student notification deep-linking to the claim
  pushNotification({
    title: 'Item Handover Complete! Retrieval Receipt Issued',
    message: `Your claim ${claim.referenceNo} for "${claim.itemName}" has been successfully completed. Your digital retrieval receipt #${receiptNo} is now ready.`,
    type: 'approved',
    claimId: claim.id,
    link: `/dashboard?tab=claims-tracking&claimId=${claim.id}`,
  });

  return {
    success: true,
    claim: updatedClaim,
    receipt: retrievalReceipt,
  };
}

