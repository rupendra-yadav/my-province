// context/RequestsContext.tsx
// Wired to the real backend now. fetchRequests/approve/reject call the
// actual endpoints; screens (dashboard, detail) are unchanged, per the
// original design of this seam.

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ApiError } from '../services/api';
import { approveRequest, listRequests, rejectRequest, RequestItem } from '../services/endpoints';
import { useAuth } from './AuthContext';

export type ResidentRequest = RequestItem;

type RequestsContextValue = {
  requests: ResidentRequest[];
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
  getById: (id: string) => ResidentRequest | undefined;
  approve: (id: string) => Promise<void>;
  reject: (id: string, reason: string) => Promise<void>;
};

const RequestsContext = createContext<RequestsContextValue | undefined>(undefined);

export function RequestsProvider({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const [requests, setRequests] = useState<ResidentRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const societyId = session?.user?.societyId;

  const fetchAll = useCallback(async () => {
    if (!societyId) return;
    setIsLoading(true);
    setError(null);
    try {
      // "keep it simple" approach: one large page, filter/search stays
      // client-side in the dashboard exactly as it already did.
      const result = await listRequests({ societyId, page: 1, limit: 20 });
      setRequests(result.requests);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load requests.');
    } finally {
      setIsLoading(false);
    }
  }, [societyId]);

  useEffect(() => {
    if (session?.isAdmin && societyId) fetchAll();
  }, [session?.isAdmin, societyId, fetchAll]);

  const value = useMemo<RequestsContextValue>(
    () => ({
      requests,
      isLoading,
      error,
      refresh: fetchAll,
      getById: (id) => requests.find((r) => r.id === id),
      approve: async (id) => {
        await approveRequest(id);
        setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'approved', rejectionReason: undefined } : r)));
      },
      reject: async (id, reason) => {
        await rejectRequest(id, reason);
        setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'rejected', rejectionReason: reason } : r)));
      },
    }),
    [requests, isLoading, error, fetchAll]
  );

  return <RequestsContext.Provider value={value}>{children}</RequestsContext.Provider>;
}

export function useRequests() {
  const ctx = useContext(RequestsContext);
  if (!ctx) throw new Error('useRequests must be used within a RequestsProvider');
  return ctx;
}
