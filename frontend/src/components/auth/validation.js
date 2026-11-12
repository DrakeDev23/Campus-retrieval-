// Prototype-only validation. Real rules (allowed university domains, student
// ID format) should be confirmed with the university and enforced server-side.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(value) {
  const v = value.trim();
  if (!v) return 'Enter your email address.';
  if (!EMAIL_RE.test(v)) return 'Enter a valid email address, e.g. yourname@gmail.com.';
  if (!/@gmail\.com$/i.test(v)) return 'Only @gmail.com addresses are allowed.';
  return '';
}

export function validateRequired(value, message) {
  return value.trim() ? '' : message;
}

export function validateStudentId(value) {
  const v = value.trim();
  if (!v) return 'Enter your student ID number.';
  if (!/^\d{6,10}$/.test(v)) return 'Student ID must be 6–10 digits.';
  return '';
}

// Login accepts digits and hyphens (e.g. 2021-12345). Exact format to be
// confirmed with the university; real checks belong on the backend.
export function validateLoginStudentId(value) {
  const v = value.trim();
  if (!v) return 'Enter your Student ID Number.';
  if (!/^[0-9-]+$/.test(v) || !/\d/.test(v)) return 'Student ID can only contain numbers and hyphens.';
  if (v.replace(/-/g, '').length < 6) return 'Student ID looks too short. Check and try again.';
  return '';
}

export function validateLoginPassword(value) {
  return value ? '' : 'Enter your password.';
}

export function validateNewPassword(value) {
  if (!value) return 'Create a password.';
  if (value.length < 8) return 'Use at least 8 characters.';
  if (!/[A-Za-z]/.test(value) || !/\d/.test(value)) return 'Include at least one letter and one number.';
  return '';
}

export function validateConfirmPassword(password, confirm) {
  if (!confirm) return 'Confirm your password.';
  if (password !== confirm) return 'Passwords do not match.';
  return '';
}
