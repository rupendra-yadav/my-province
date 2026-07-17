// constants/admins.ts
// Dummy admin registry. When the backend is wired, this check moves server-side —
// POST /verify-otp should return { role: 'admin' | 'resident' } and this file goes away.

export const ADMIN_PHONES = ['9876543210', '9988776655'];

export function isAdminPhone(phone: string) {
  return ADMIN_PHONES.includes(phone);
}
