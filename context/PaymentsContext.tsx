// context/PaymentsContext.tsx
// Same seam pattern as RequestsContext: screens only ever call
// refresh()/pay()/confirmPayment() and read the derived shapes below.
//
// pay() now starts an Easebuzz transaction (POST /payments/:id/pay) and
// returns { payUrl } for the screen to open in a WebView — it does NOT
// wait for the payment to finish, since that now happens asynchronously
// via a webhook while the resident is looking at Easebuzz's checkout page.
//
// confirmPayment() is called by the screen once the WebView closes. The
// webhook is the actual source of truth and can land a moment after the
// WebView redirect fires, so this polls GET /payments/:id/status a few
// times before giving the local state one final refresh either way.

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ApiError } from '../services/api';
import { getPaymentStatus, initiatePayment, InitiatePaymentResult, listPayments } from '../services/endpoints';
// Note: getPaymentStatus() returns PaymentPeriodDto from services/endpoints.ts,
// not the PaymentPeriod defined below — the two are structurally identical
// (same fields/types) so no explicit cast is needed, but they're kept as
// separate named types to avoid a circular import (endpoints.ts must not
// import from this file, since this file already imports from endpoints.ts).
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
  /** Starts a gateway transaction for this charge. Does not wait for it to complete. */
  pay: (id: string) => Promise<InitiatePaymentResult>;
  /** Call after the checkout WebView closes with a success/failure result. */
  confirmPayment: (id: string) => Promise<void>;
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

const CONFIRM_POLL_ATTEMPTS = 4;
const CONFIRM_POLL_DELAY_MS = 1500;

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
        return initiatePayment(id);
      },
      confirmPayment: async (id) => {
        for (let attempt = 0; attempt < CONFIRM_POLL_ATTEMPTS; attempt++) {
          try {
            const latest = await getPaymentStatus(id);
            if (latest.status === 'paid') break;
          } catch {
            // transient — just retry on the next loop iteration
          }
          if (attempt < CONFIRM_POLL_ATTEMPTS - 1) {
            await new Promise((r) => setTimeout(r, CONFIRM_POLL_DELAY_MS));
          }
        }
        // Refresh local lists either way — even a still-pending status is
        // worth reflecting (e.g. resident cancelled partway through).
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