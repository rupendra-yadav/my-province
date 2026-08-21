// context/ExpensesContext.tsx
// Same seam pattern as PaymentsContext/RequestsContext: expenses.tsx only
// ever calls refresh() and reads `expenses` — if the backend contract
// changes later (server-side date-range filtering, create/edit/delete),
// only fetchAll()'s body needs to change, the screen stays untouched.

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ApiError } from '../services/api';
import { ExpenseRecordDto, listExpenses } from '../services/endpoints';
import { useAuth } from './AuthContext';

// Re-exported under the name the screen/components already use.
export type ExpenseRecord = ExpenseRecordDto;

type ExpensesContextValue = {
  expenses: ExpenseRecord[];
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
};

const ExpensesContext = createContext<ExpensesContextValue | undefined>(undefined);

export function ExpensesProvider({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userId = session?.user?.id;

  const fetchAll = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await listExpenses();
      console.log('fetchAll', result);
      setExpenses(result.expenses);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load expenses.');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) fetchAll();
  }, [userId, fetchAll]);

  const value = useMemo<ExpensesContextValue>(
    () => ({ expenses, isLoading, error, refresh: fetchAll }),
    [expenses, isLoading, error, fetchAll]
  );

  return <ExpensesContext.Provider value={value}>{children}</ExpensesContext.Provider>;
}

export function useExpenses() {
  const ctx = useContext(ExpensesContext);
  if (!ctx) throw new Error('useExpenses must be used within an ExpensesProvider');
  return ctx;
}
