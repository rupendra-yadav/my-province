// context/PaymentsContext.tsx
// Same seam pattern as RequestsContext: screens (dashboard, payment) only
// ever call refresh()/pay() and read the derived shapes below. Wired to
// GET /payments and POST /payments/:id/pay — the latter currently always
// rejects with PAYMENT_NOT_IMPLEMENTED until the gateway is integrated,
// which pay() surfaces as a normal ApiError for the screen to display.

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ApiError } from '../services/api';
import { listPayments, payPeriod } from '../services/endpoints';
import { useAuth } from './AuthContext';

export type FeeType = 'maintenance' | 'membership';
export type PaymentStatus = 'paid' | 'pending' | 'not_paid';

export interface PaymentPeriod {
  id: string;
  type: FeeType;
  period: string; // '2026-08'
  label: string; // 'Aug 2026'
  due: number;
  paid: number;
  fine: number; // admin-set manually — editing UI is a later phase; displayed only here
  balance: number; // due + fine - paid. Can go negative (overpayment/credit).
  status: PaymentStatus;
  paidDate?: string; // ISO — only set once status === 'paid'
}

export interface PaymentSummary {
  totalDue: number;
  totalPaid: number;
  balance: number;
}

type PaymentsContextValue = {
  maintenance: PaymentPeriod[];
  membership: PaymentPeriod[];
  maintenanceSummary: PaymentSummary;
  membershipSummary: PaymentSummary;
  history: PaymentPeriod[]; // combined, paid-only, most recent first
  nextDue: PaymentPeriod | null; // the period shown in "Pay balance" / "Paying for"
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
  getById: (id: string) => PaymentPeriod | undefined;
  pay: (id: string) => Promise<void>;
};

const PaymentsContext = createContext<PaymentsContextValue | undefined>(undefined);

function summarize(periods: PaymentPeriod[]): PaymentSummary {
  return periods.reduce(
    (acc, p) => ({
      totalDue: acc.totalDue + p.due + p.fine,
      totalPaid: acc.totalPaid + p.paid,
      balance: acc.balance + p.balance,
    }),
    { totalDue: 0, totalPaid: 0, balance: 0 }
  );
}

export function PaymentsProvider({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const [maintenance, setMaintenance] = useState<PaymentPeriod[]>([]);
  const [membership, setMembership] = useState<PaymentPeriod[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userId = session?.user?.id;

 const fetchAll = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await listPayments();
      setMaintenance(result.maintenance);
      setMembership(result.membership);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load payments.');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) fetchAll();
  }, [userId, fetchAll]);

  const value = useMemo<PaymentsContextValue>(() => {
    const all = [...maintenance, ...membership];
    const history = all
      .filter((p) => p.status === 'paid')
      .sort((a, b) => new Date(b.paidDate ?? 0).getTime() - new Date(a.paidDate ?? 0).getTime());

    const nextDue =
      all
        .filter((p) => p.status !== 'paid')
        .sort((a, b) => a.period.localeCompare(b.period))[0] ?? null;

    return {
      maintenance,
      membership,
      maintenanceSummary: summarize(maintenance),
      membershipSummary: summarize(membership),
      history,
      nextDue,
      isLoading,
      error,
      refresh: fetchAll,
      getById: (id) => all.find((p) => p.id === id),
      pay: async (id) => {
        await payPeriod(id);
        // On success (once the gateway is wired in), refetch rather than
        // guessing the new paid/fine/status locally.
        await fetchAll();
      },
    };
  }, [maintenance, membership, isLoading, error, fetchAll]);

  return <PaymentsContext.Provider value={value}>{children}</PaymentsContext.Provider>;
}

export function usePayments() {
  const ctx = useContext(PaymentsContext);
  if (!ctx) throw new Error('usePayments must be used within a PaymentsProvider');
  return ctx;
}