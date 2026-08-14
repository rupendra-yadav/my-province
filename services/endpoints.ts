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
 
export interface InitiatePaymentResult {
  txnid: string;
  accessKey: string;
  payUrl: string;
}
 
// POST /payments/:id/pay — starts an Easebuzz transaction, does not wait
// for it to complete.
export const initiatePayment = (id: string) =>
  api.post<InitiatePaymentResult>(`/payments/${id}/pay`);
 
// GET /payments/:id/status — used right after the checkout WebView closes,
// in case the webhook hasn't landed yet.
export const getPaymentStatus = (id: string) =>
  api.get<PaymentPeriodDto>(`/payments/${id}/status`);
 

// ---- Session validation -----------------------------------------------

// ---- Session bundle (shared shape across verify-otp / validate / refresh) --

export interface SessionBundle {
  isAdmin: boolean;
  isRegistered: boolean;
  requestStatus: 'pending' | 'approved' | 'rejected' | null;
  user: { id: string; name: string; email: string; phone: string; societyId: number } | null;
}

export interface RefreshResult extends SessionBundle {
  tokens: { accessToken: string; refreshToken: string | null };
}

// Confirm this path matches your auth.routes.ts — controller function is
// validateToken, route may be registered as GET /auth/validate or
// POST /auth/validate-token depending on what you wired up.
export const validateToken = () => api.get<SessionBundle>('/auth/validate');

export const refreshAccessToken = (refreshToken: string) =>
  api.post<RefreshResult>('/auth/refresh', { refreshToken }, { auth: false });

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

// ---- Reports ------------------------------------------------------------
// Maps to reports.controller.ts: getSummaryStats, getCollectionSummary,
// getHouseTypeAnalysis, getResidentPaymentList. societyId is resolved
// server-side from the auth token, so no societyId param is sent here.

// Shared range shape for Screens 1, 2, 3, 7. Omitting all four fields on
// a request defaults server-side to the current calendar year: January
// through the current month.
export interface MonthRange {
  fromMonth: number;
  fromYear: number;
  toMonth: number;
  toYear: number;
}

export interface ReportsSummary {
  totalDue: number;
  totalCollected: number;
  totalPending: number;
  collectionRate: number;
  totalResidents: number;
  chargesByStatus: { paid: number; pending: number; partial: number; overdue: number };
}

export const getReportsSummary = (params?: Partial<MonthRange>) =>
  api.get<ReportsSummary>('/reports/summary', params);

export interface TrendPoint {
  label: string;
  valueLakh: number;
}

export interface HouseTypeBreakdown {
  key: string;
  label: string;
  pct: number;
  collected: number;
  pending: number;
  totalHouses: number;
  paid: number;
  partial: number;
  unpaid: number;
}

export interface CollectionSummary {
  totalCollection: number;
  totalDue: number;
  pendingAmount: number;
  collectionPct: number;
  totalHouses: number;
  collectionRate: number;
  avgCollectionPerHouse: number;
  trend: TrendPoint[];
  houseTypePerformance: HouseTypeBreakdown[];
}

export const getReportsCollectionSummary = (params?: Partial<MonthRange>) =>
  api.get<CollectionSummary>('/reports/collection-summary', params);

export const getReportsHouseTypeAnalysis = (params: { groupBy: 'houseType' | 'block' } & Partial<MonthRange>) =>
  api.get<HouseTypeBreakdown[]>('/reports/house-type-analysis', params);

export interface ResidentPaymentRow {
  id: string;
  unitId: number;
  houseCode: string;
  block: string;
  unit: string;
  houseType: string;
  name: string;
  status: 'paid' | 'partial' | 'unpaid';
  monthlyDue: number;
  paidThisPeriod: number;
  balance: number;
  paidDate?: string;
  monthsPending?: number;
}

export const getReportsResidents = (params?: { month?: number; year?: number }) =>
  api.get<ResidentPaymentRow[]>('/reports/residents', params);

// ---- Screen 5: single resident (admin-only) ------------------------------
// Keyed by unitId (stable across months) rather than a charge id, since a
// charge is one period's record — see reports.service.ts notes.

export interface ResidentDetail {
  unitId: number;
  houseCode: string;
  block: string;
  unit: string;
  houseType: string;
  name: string;
}

export const getResidentDetail = (unitId: number) =>
  api.get<ResidentDetail>(`/reports/residents/${unitId}`);

export interface ResidentHistoryEntry {
  id: string;
  period: string;
  label: string;
  due: number;
  paid: number;
  fine: number;
  balance: number;
  status: 'paid' | 'partial' | 'unpaid';
  paidDate?: string;
}

export const getResidentHistory = (unitId: number, monthsBack?: number) =>
  api.get<ResidentHistoryEntry[]>(`/reports/residents/${unitId}/history`, { monthsBack });

// ---- Screen 7: collection trend (shared) ---------------------------------

export interface CollectionTrendPoint {
  label: string;
  month: number;
  year: number;
  collected: number;
  pending: number;
  collectedLakh: number;
  pendingLakh: number;
}

export const getReportsCollectionTrend = (params?: Partial<MonthRange>) =>
  api.get<CollectionTrendPoint[]>('/reports/collection-trend', params);