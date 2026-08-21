// context/ReportsContext.tsx
// Single source of report data for the range-based screens (Home,
// Collection Summary, House Type Analysis) — replaces the deleted
// useReportsCycleRange hook and each screen's own useEffect/useState
// fetch. Fetched once per range change; house-type-analysis reuses the
// block/houseType breakdowns already loaded here instead of re-fetching.
// Collection Trend and the resident-list screens use different
// endpoints/granularity and keep their own local fetch in-page.
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import type { MonthRangeValue } from '../components/ui';
import { ApiError } from '../services/api';
import {
  CollectionSummary,
  getReportsCollectionSummary,
  getReportsHouseTypeAnalysis,
  getReportsSummary,
  HouseTypeBreakdown,
  ReportsSummary,
} from '../services/endpoints';

function defaultRange(): MonthRangeValue {
  const now = new Date();
  return { fromMonth: 1, fromYear: now.getFullYear(), toMonth: now.getMonth() + 1, toYear: now.getFullYear() };
}

interface ReportsContextValue {
  range: MonthRangeValue;
  setRange: (r: MonthRangeValue) => void;
  summary: ReportsSummary | null;
  collection: CollectionSummary | null;
  blockBreakdown: HouseTypeBreakdown[];
  houseTypeBreakdown: HouseTypeBreakdown[];
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

const ReportsContext = createContext<ReportsContextValue | null>(null);

export function ReportsProvider({ children }: { children: ReactNode }) {
  const [range, setRange] = useState<MonthRangeValue>(defaultRange());
  const [summary, setSummary] = useState<ReportsSummary | null>(null);
  const [collection, setCollection] = useState<CollectionSummary | null>(null);
  const [blockBreakdown, setBlockBreakdown] = useState<HouseTypeBreakdown[]>([]);
  const [houseTypeBreakdown, setHouseTypeBreakdown] = useState<HouseTypeBreakdown[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (r: MonthRangeValue) => {
    setIsLoading(true);
    setError(null);
    try {
      const [summaryRes, collectionRes, blockRes, houseTypeRes] = await Promise.all([
        getReportsSummary(r),
        getReportsCollectionSummary(r),
        getReportsHouseTypeAnalysis({ groupBy: 'block', ...r }),
        getReportsHouseTypeAnalysis({ groupBy: 'houseType', ...r }),
      ]);
      setSummary(summaryRes);
      setCollection(collectionRes);
      setBlockBreakdown(blockRes);
      setHouseTypeBreakdown(houseTypeRes);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load reports.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load(range);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range]);

  return (
    <ReportsContext.Provider
      value={{
        range,
        setRange,
        summary,
        collection,
        blockBreakdown,
        houseTypeBreakdown,
        isLoading,
        error,
        refresh: () => load(range),
      }}
    >
      {children}
    </ReportsContext.Provider>
  );
}

export function useReports() {
  const ctx = useContext(ReportsContext);
  if (!ctx) throw new Error('useReports must be used within a ReportsProvider');
  return ctx;
}
