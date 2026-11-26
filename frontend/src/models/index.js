/**
 * @file Data models and JSDoc type definitions for Campus Retrieval.
 * 
 * TODO(backend): validate passCode server-side only, never trust the client.
 * TODO(backend): store only hashes of passCode and PIN (e.g. Argon2 or bcrypt).
 * TODO(backend): rate limiting in FastAPI on all verification and claim endpoints.
 */

/**
 * @typedef {Object} PickupPass
 * @property {string} code - The human-readable pass identifier (e.g. PASS-0589).
 * @property {string} pin - 6-digit locker or counter PIN (e.g. 123-456).
 * @property {string} station - Custody / retrieval station location.
 * @property {string} expiry - User-facing formatted validity description.
 * @property {string} [notes] - Instructions or notes for retrieval.
 * @property {string} [passCode] - Secure URL-safe token stored on the pass.
 * @property {string} [expiresAt] - ISO timestamp string when pass expires.
 */

/**
 * @typedef {Object} RetrievalReceipt
 * @property {string} receiptNo - Official release receipt reference number.
 * @property {string} releasedAt - Formatted timestamp of handover.
 * @property {string} releasedBy - Name and identifier of security officer releasing item.
 * @property {string} signedBy - Name and student ID confirmation of recipient.
 * @property {boolean} [schoolIdVerified] - Affirmation that physical student school ID was verified.
 */

/**
 * @typedef {Object} ClaimTimelineEntry
 * @property {string} date - Formatted date of event.
 * @property {number} stage - Verification stage number (1-6).
 * @property {string} title - Short title of timeline step.
 * @property {string} desc - Detailed description.
 * @property {string} [actorId] - User or admin identifier responsible.
 */

/**
 * @typedef {Object} Claim
 * @property {string} id - Unique claim identifier (e.g. CLM-2026-0589).
 * @property {string} itemName - Name of claimed found item.
 * @property {string} [category] - Category of item.
 * @property {string} referenceNo - Human-readable reference number.
 * @property {string} dateSubmitted - Formatted submission date.
 * @property {number} currentStage - Current lifecycle stage (1: Filed, 2: Review, 3: Verification, 4: Approval, 5: Ready for Retrieval, 6: Retrieved).
 * @property {string} status - Human-readable status label.
 * @property {string} statusBadge - CSS utility classes for status badge.
 * @property {string} [custodyLocation] - Location where item is held in custody.
 * @property {string} [submittedProof] - Claimant's proof of ownership details.
 * @property {string} [claimantName] - Claimant's full name.
 * @property {string} [claimantId] - Claimant's student identification number.
 * @property {string} [studentId] - Student ID of claimant.
 * @property {string} [assignedOfficer] - Security officer assigned to claim.
 * @property {string} [itemId] - Associated found item ID in catalog.
 * @property {PickupPass} [pickupPass] - Digital retrieval pass details.
 * @property {RetrievalReceipt} [retrievalReceipt] - Official handover receipt upon release.
 * @property {ClaimTimelineEntry[]} [timeline] - Chronological lifecycle log.
 * @property {string|null} [passCode] - Cryptographically random URL-safe token generated upon approval for QR verification.
 * @property {string|null} [passExpiresAt] - ISO timestamp string defining the exact validity window cutoff. Single source of truth.
 * @property {string|null} [passUsedAt] - ISO timestamp string when the pass was consumed upon item handover. Null if unused.
 */

export {};
