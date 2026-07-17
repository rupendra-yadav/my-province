// context/RequestsContext.tsx
// Dummy in-memory store for resident registration requests, shared between
// the admin dashboard and detail screen. When wiring the real backend:
//   - replace INITIAL_REQUESTS with a GET /admin/requests fetch on mount
//   - replace approve()/reject() bodies with POST /admin/requests/:id/approve|reject
// The shape of ResidentRequest and the hook's return type can stay the same.

import React, { createContext, useContext, useMemo, useState } from 'react';

export type ResidentRequest = {
  id: string;
  name: string;
  phone: string;
  city: string;
  society: string;
  block: string;
  flat: string;
  residentType: 'Owner' | 'Tenant';
  submittedAt: string; // ISO date
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
};

const INITIAL_REQUESTS: ResidentRequest[] = [
  { id: '1', name: 'Anita Sharma', phone: '9876543210', city: 'Raipur', society: 'Shalimar Greens', block: 'Block A', flat: 'A-101', residentType: 'Owner', submittedAt: '2026-07-15', status: 'pending' },
  { id: '2', name: 'Ravi Verma', phone: '9123456780', city: 'Raipur', society: 'Shalimar Greens', block: 'Block B', flat: 'B-201', residentType: 'Tenant', submittedAt: '2026-07-15', status: 'pending' },
  { id: '3', name: 'Priya Nair', phone: '9988776655', city: 'Raipur', society: 'Ashiana Residency', block: 'Tower 1', flat: '102', residentType: 'Owner', submittedAt: '2026-07-14', status: 'approved' },
  { id: '4', name: 'Sanjay Deshmukh', phone: '9012345678', city: 'Bilaspur', society: 'Green Valley Enclave', block: 'Wing C', flat: 'C-2', residentType: 'Owner', submittedAt: '2026-07-14', status: 'pending' },
  { id: '5', name: 'Meera Iyer', phone: '9765432109', city: 'Durg', society: 'Riverside Apartments', block: 'Block D', flat: 'D-11', residentType: 'Tenant', submittedAt: '2026-07-13', status: 'rejected', rejectionReason: 'Flat already has a registered resident' },
  { id: '6', name: 'Karan Mehta', phone: '9345678901', city: 'Raipur', society: 'Ashiana Residency', block: 'Tower 2', flat: '201', residentType: 'Owner', submittedAt: '2026-07-13', status: 'pending' },
  { id: '7', name: 'Sunita Rao', phone: '9456123789', city: 'Raipur', society: 'Shalimar Greens', block: 'Block A', flat: 'A-102', residentType: 'Tenant', submittedAt: '2026-07-12', status: 'approved' },
  { id: '8', name: 'Vikram Singh', phone: '9234567810', city: 'Bilaspur', society: 'Green Valley Enclave', block: 'Wing C', flat: 'C-1', residentType: 'Owner', submittedAt: '2026-07-11', status: 'pending' },
];

type RequestsContextValue = {
  requests: ResidentRequest[];
  getById: (id: string) => ResidentRequest | undefined;
  approve: (id: string) => void;
  reject: (id: string, reason: string) => void;
};

const RequestsContext = createContext<RequestsContextValue | undefined>(undefined);

export function RequestsProvider({ children }: { children: React.ReactNode }) {
  const [requests, setRequests] = useState<ResidentRequest[]>(INITIAL_REQUESTS);

  const value = useMemo<RequestsContextValue>(
    () => ({
      requests,
      getById: (id) => requests.find((r) => r.id === id),
      approve: (id) =>
        setRequests((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: 'approved', rejectionReason: undefined } : r))
        ),
      reject: (id, reason) =>
        setRequests((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: 'rejected', rejectionReason: reason } : r))
        ),
    }),
    [requests]
  );

  return <RequestsContext.Provider value={value}>{children}</RequestsContext.Provider>;
}

export function useRequests() {
  const ctx = useContext(RequestsContext);
  if (!ctx) throw new Error('useRequests must be used within a RequestsProvider');
  return ctx;
}
