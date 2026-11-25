import { readClaimsStore, writeClaimsStore } from './claimsService.js';
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
  const pickupStation = claim.custodyLocation || 'Central Security Hub Room 102';
  const expiryDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const pickupPass = {
    code: `PASS-${claim.referenceNo.replace(/[^0-9]/g, '') || Math.floor(100 + Math.random() * 900)}`,
    pin,
    station: pickupStation,
    expiry: `Valid until ${formatShortDate(expiryDate)} (5:00 PM)`,
    notes: 'Present this digital pass or PIN at the assigned counter / locker to retrieve your item.',
  };

  const updatedClaim = {
    ...claim,
    currentStage: 5,
    status: 'Ready for Retrieval',
    statusBadge: 'bg-blue-50 text-blue-700 border-blue-200',
    assignedOfficer: adminName,
    hasStudentReply: false,
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
