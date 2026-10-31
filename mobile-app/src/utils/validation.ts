/**
 * Form validation helpers
 */

export function isValidEmail(email: string): boolean {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function isValidPhone(phone: string): boolean {
  if (!phone) return false;
  return /(84|0[3|5|7|8|9])+([0-9]{8})\b/.test(phone.trim());
}

export function isValidCitizenId(id: string): boolean {
  if (!id) return false;
  return /^[0-9]{9,12}$/.test(id.trim());
}

export default {
  isValidEmail,
  isValidPhone,
  isValidCitizenId,
};
