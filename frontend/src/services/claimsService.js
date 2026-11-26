import { INITIAL_CLAIMS_LIST } from '../components/dashboard/mockData.js';

// TODO(backend): validate passCode server-side only, never trust the client
// TODO(backend): store only hashes of passCode and PIN
// TODO(backend): rate limiting in FastAPI

const CLAIMS_STORAGE_KEY = 'itemfinder_claims_v1';
const ARTIFICIAL_DELAY_MS = 350;

let inMemoryClaimsFallback = null;

function delay(ms = ARTIFICIAL_DELAY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generate a cryptographically random, URL-safe passCode (24 characters).
 * Uses crypto.getRandomValues with a pseudo-random fallback.
 * Never stores or encodes the plain PIN.
 */
export function generatePassCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  let result = '';
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const bytes = new Uint8Array(24);
    window.crypto.getRandomValues(bytes);
    for (let i = 0; i < bytes.length; i++) {
      result += chars[bytes[i] % chars.length];
    }
    return result;
  }
  for (let i = 0; i < 24; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

export function formatShortDate(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateTime(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  const dateStr = formatShortDate(d);
  const timeStr = d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${dateStr} • ${timeStr}`;
}

/**
 * Single source of truth formatter for validity window from passExpiresAt ISO string.
 */
export function formatValidityWindow(isoExpiryString) {
  if (!isoExpiryString) return 'Valid for 7 days';
  try {
    const d = new Date(isoExpiryString);
    if (isNaN(d.getTime())) return 'Valid for 7 days';
    const datePart = formatShortDate(d);
    const timePart = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    return `Valid until ${datePart} (${timePart})`;
  } catch {
    return 'Valid for 7 days';
  }
}

/**
 * Runs migration on claim objects to guarantee Stage 5 claims have passCode and passExpiresAt,
 * without wiping existing local storage data.
 */
function migrateClaims(claims) {
  if (!Array.isArray(claims)) return claims;
  let hasChanges = false;

  const migrated = claims.map((claim) => {
    let updated = claim;

    if (claim.currentStage === 5) {
      let passCode = claim.passCode;
      let passExpiresAt = claim.passExpiresAt;

      if (!passCode) {
        passCode = generatePassCode();
        hasChanges = true;
      }

      if (!passExpiresAt) {
        // Default validity: 7 days from now
        passExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
        hasChanges = true;
      }

      const passUsedAt = claim.passUsedAt ?? null;
      const pickupPass = {
        ...(claim.pickupPass || {}),
        passCode,
        expiresAt: passExpiresAt,
        expiry: formatValidityWindow(passExpiresAt),
      };

      updated = {
        ...claim,
        passCode,
        passExpiresAt,
        passUsedAt,
        pickupPass,
      };
    } else if (claim.currentStage === 6 && claim.passUsedAt === undefined) {
      updated = {
        ...claim,
        passUsedAt: claim.retrievalReceipt?.releasedAt || new Date().toISOString(),
      };
      hasChanges = true;
    }

    return updated;
  });

  return { migrated, hasChanges };
}

export function readClaimsStore() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(CLAIMS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const { migrated, hasChanges } = migrateClaims(parsed);
          inMemoryClaimsFallback = migrated;
          if (hasChanges) {
            writeClaimsStore(migrated);
          }
          return migrated;
        }
      }
    }
  } catch {
  }

  if (inMemoryClaimsFallback) {
    return inMemoryClaimsFallback;
  }

  const seeded = INITIAL_CLAIMS_LIST.map((claim) => ({
    ...claim,
    claimantId: claim.claimantId || '2024-08912',
    studentId: claim.studentId || claim.claimantId || '2024-08912',
    claimantName: claim.claimantName || 'Jane G. Doe',
    hasStudentReply: Boolean(claim.hasStudentReply),
  }));

  const { migrated } = migrateClaims(seeded);
  inMemoryClaimsFallback = migrated;
  writeClaimsStore(migrated);
  return migrated;
}

export function writeClaimsStore(claims) {
  inMemoryClaimsFallback = claims;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(CLAIMS_STORAGE_KEY, JSON.stringify(claims));
    }
  } catch {
  }
}

function generateClaimId(existingClaims) {
  const year = new Date().getFullYear();
  const existingIds = new Set(existingClaims.map((c) => c.id));
  let candidate;
  let attempts = 0;
  do {
    const num = Math.floor(1000 + Math.random() * 9000);
    candidate = `CLM-${year}-${num}`;
    attempts += 1;
  } while (existingIds.has(candidate) && attempts < 50);
  return candidate;
}

export async function getClaims(claimantId) {
  await delay(200);
  const all = readClaimsStore();
  if (!claimantId) return [];
  return all.filter((c) => (c.studentId && c.studentId === claimantId) || (c.claimantId && c.claimantId === claimantId));
}

export function hasExistingClaim(claims, itemId, itemTitle, claimantId) {
  if (!Array.isArray(claims) || !claimantId) return false;
  return claims.some((claim) => {
    const sameStudent = !claim.claimantId || claim.claimantId === claimantId;
    const sameItem =
      (itemId && claim.itemId && claim.itemId === itemId) ||
      (itemTitle && claim.itemName?.toLowerCase() === itemTitle.toLowerCase());
    return sameStudent && sameItem;
  });
}

export async function submitClaim({
  item,
  user,
  proofDescription,
  privateDetails,
  proofPhoto = null,
  consentAccepted,
}) {
  await delay(450);

  const currentClaims = readClaimsStore();
  const claimantId = user?.studentId || user?.id;

  if (!claimantId) {
    throw new Error('You must be signed in to submit a claim.');
  }

  if (hasExistingClaim(currentClaims, item.id, item.title, claimantId)) {
    throw new Error('You have already submitted a claim for this item.');
  }

  const now = new Date();
  const claimId = generateClaimId(currentClaims);

  const newClaim = {
    id: claimId,
    referenceNo: claimId,
    itemId: item.id,
    itemName: item.title,
    category: item.category,
    claimantId,
    studentId: user?.studentId || claimantId,
    claimantName: user.fullName,
    claimantEmail: user.email,
    dateSubmitted: formatShortDate(now),
    currentStage: 1,
    status: 'Claim Submitted',
    statusBadge: 'bg-blue-50 text-blue-700 border-blue-200',
    hasStudentReply: false,
    custodyLocation: item.custody || 'Campus Security Hub',
    submittedProof: proofDescription.trim(),
    privateDetails: privateDetails.trim(),
    proofPhoto: proofPhoto || null,
    consentAccepted: Boolean(consentAccepted),
    assignedOfficer: 'Pending Assignment',
    timeline: [
      {
        date: formatDateTime(now),
        stage: 1,
        title: 'Claim Submitted',
        desc: `Claim submitted by ${user.fullName} (${claimantId}). Awaiting initial desk review.`,
        actorId: claimantId,
      },
    ],
  };

  const updated = [newClaim, ...currentClaims];
  writeClaimsStore(updated);
  return newClaim;
}

/**
 * Loads a claim only through the owner-filtered claims query and verifies owner comparison.
 * TODO(backend): validate passCode server-side only, never trust the client
 */
export async function getClaimForStudent(claimId, user) {
  await delay(200);
  if (!claimId || !user) return null;
  const studentId = user.studentId || user.id;
  const claims = await getClaims(studentId);
  const claim = claims.find((c) => c.id === claimId || c.referenceNo === claimId);
  if (!claim) return null;
  const isOwner =
    (claim.studentId && claim.studentId === studentId) ||
    (claim.claimantId && claim.claimantId === studentId) ||
    (user.studentId && claim.studentId === user.studentId);
  if (!isOwner) return null;
  return claim;
}

