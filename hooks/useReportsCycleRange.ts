// hooks/useReportsCycleRange.ts
// Shared by Screens 1, 2, 3, 7 — each has its own MonthRangeSelector.
// Defaults to the current calendar year: January through the current
// month. Computed locally — no network call needed, unlike the
// short-lived cycle-anchor design this replaced.
import { useState } from 'react';
import type { MonthRangeValue } from '../components/ui';

function defaultRange(): MonthRangeValue {
  const now = new Date();
  return {
    fromMonth: 1,
    fromYear: now.getFullYear(),
    toMonth: now.getMonth() + 1,
    toYear: now.getFullYear(),
  };
}

export function useReportsCycleRange() {
  const [range, setRange] = useState<MonthRangeValue>(defaultRange());
  // Kept in the return shape so the 4 screens using this hook don't need
  // to change — always false/null now that the default is computed
  // locally instead of fetched.
  return { range, setRange, isLoadingCycle: false, cycleError: null as string | null };
}
