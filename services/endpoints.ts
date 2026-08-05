import { api } from './api';

// ---- Auth ----------------------------------------------------------

export interface VerifyOtpResult {
  isAdmin: boolean;
  isRegistered: boolean;
  requestStatus: 'pending' | 'approved' | 'rejected' | null;
  user: { id: string; name: string; email: string; phone: string; societyId: number } | null;
  tokens: { accessToken: string; refreshToken: string | null } | null;
}

export const sendOtp = (phone: string) =>
  api.post<{ expiresInMinutes: number }>('/auth/send-otp', { phone }, { auth: false });

export const verifyOtp = (phone: string, otp: string) =>
  api.post<VerifyOtpResult>('/auth/verify-otp', { phone, otp }, { auth: false });

// ---- Registration ---------------------------------------------------

export interface RegisterUserInput {
  name: string;
  email: string;
  societyId: number;
  unitId: number;
  memberType: 'owner' | 'tenant';
  city?: string;
  pincode?: string;
  address?: string;
}

export const registerUser = (input: RegisterUserInput) =>
  api.post<{ id: string; name: string; email: string; approvedStatus: string }>('/register/user', input);

// ---- Locations (District -> City cascade) ---------------------------

export const listDistricts = () => api.get<{ districts: string[] }>('/locations/districts');

export const listCitiesByDistrict = (district: string) =>
  api.get<{ cities: { id: string; name: string }[] }>(`/locations/districts/${encodeURIComponent(district)}/cities`);

// ---- Societies (City -> Society -> Block -> Property cascade) -------

export const listSocieties = (cityId?: string) =>
  api.get<{ societies: { id: number; name: string; city: number | null; state: string }[] }>('/societies', {
    cityId,
  });

export const listBlocks = (societyId: number) =>
  api.get<{ blocks: { id: number; buildingName: string; buildingType: string; totalUnits: number }[] }>(
    `/societies/${societyId}/blocks`
  );

export const listProperties = (societyId: number, blockId: number) =>
  api.get<{ properties: { id: number; unitNumber: string; status: string; memberType: string }[] }>(
    `/societies/${societyId}/blocks/${blockId}/properties`
  );

// ---- Requests (admin) ------------------------------------------------

export interface RequestListParams {
  societyId: number;
  status?: 'pending' | 'approved' | 'rejected';
  search?: string;
  page?: number;
  limit?: number;
}

export interface RequestItem {
  id: string;
  name: string;
  phone: string;
  city: string;
  society: string;
  block: string;
  flat: string;
  residentType: 'Owner' | 'Tenant';
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
}

export const listRequests = (params: RequestListParams) =>
  api.get<{ requests: RequestItem[]; pagination: { page: number; limit: number; total: number; totalPages: number } }>(
    '/requests',
    {
      societyId: params.societyId,
      status: params.status,
      search: params.search,
      page: params.page,
      limit: params.limit,
    }
  );

export const getRequestDetail = (id: string) => api.get<RequestItem>(`/requests/${id}`);

export const approveRequest = (id: string) => api.patch<{ id: string; approvedStatus: string }>(`/requests/${id}/approve`);

export const rejectRequest = (id: string, reason: string) =>
  api.patch<{ id: string; approvedStatus: string }>(`/requests/${id}/reject`, { reason });

// ---- Payments ---------------------------------------------------------

export interface PaymentPeriodDto {
  id: string;
  type: 'maintenance' | 'membership';
  period: string;
  label: string;
  due: number;
  paid: number;
  fine: number;
  balance: number;
  status: 'paid' | 'pending' | 'not_paid';
  paidDate?: string;
}

export const listPayments = () =>
  api.get<{ maintenance: PaymentPeriodDto[]; membership: PaymentPeriodDto[] }>('/payments');

export const payPeriod = (id: string) => api.post<never>(`/payments/${id}/pay`);

// ---- Session validation -----------------------------------------------

export interface ValidateTokenResult {
  valid: boolean;
  user?: { id: string; name: string; email: string; phone: string; societyId: number };
  isAdmin?: boolean;
}

// lib/endpoints.ts

export const validateToken = () =>
  api.get<ValidateTokenResult>('/auth/validate');
export interface RefreshTokenResult {
  accessToken: string;
  refreshToken: string | null;
  user?: { id: string; name: string; email: string; phone: string; societyId: number };
  isAdmin?: boolean;
}

export const refreshAccessToken = (refreshToken: string) =>
  api.post<RefreshTokenResult>('/auth/refresh', { refreshToken }, { auth: false });

// ---- Full profile (separate from login payload) ------------------------

export interface MeResult {
  id: string;
  name: string;
  email: string;
  phone: string;
  isAdmin: boolean;
  memberType: 'owner' | 'tenant' | 'family_member' | null;
  city: string | null;
  pincode: string | null;
  address: string | null;
  society: { id: number; name: string } | null;
  block: { id: number; buildingName: string } | null;
  flat: { id: number; unitNumber: string } | null;
}

export const getMe = () => api.get<MeResult>('/auth/me');

export const logout = () => api.post<never>('/auth/logout');