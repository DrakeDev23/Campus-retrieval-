import { INITIAL_CLAIMS_LIST } from '../components/dashboard/mockData.js';

const CLAIMS_STORAGE_KEY = 'itemfinder_claims_v1';
const ARTIFICIAL_DELAY_MS = 350;

let inMemoryClaimsFallback = null;

function delay(ms = ARTIFICIAL_DELAY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function readClaimsStore() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(CLAIMS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          inMemoryClaimsFallback = parsed;
          return parsed;
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
  inMemoryClaimsFallback = seeded;
  writeClaimsStore(seeded);
  return seeded;
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
