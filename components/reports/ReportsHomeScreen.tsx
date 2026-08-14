// components/reports/ReportsHomeScreen.tsx
// Shared Reports Home content (Screen 1). Rendered by the single Reports
// route: app/(main)/reports/index.tsx — the same route for both admins and
// residents. Society-level aggregates are always shown; the individual-
// level drill-down tiles (Fully Paid / Partial / Unpaid) are only wired up
// by the route when session.isAdmin is true (see onViewFullyPaid etc.
// below), so this component itself stays role-agnostic.
//
// Wired to GET /reports/summary and GET /reports/collection-summary, both
// defaulting to the current calendar year — January through the current
// month — via a MonthRangeSelector.
//
// Block / House Type filters are real, but applied LOCALLY: they reuse
// GET /reports/house-type-analysis (already fetched, grouped both ways)
// rather than a new backend param. Picking one resets the other, since
// the breakdown endpoint only groups by one dimension at a time — a true
// two-dimensional filter (a specific block AND a specific house type at
// once) would need new backend work. When a filter is active, the
// Collection Trend chart is hidden rather than shown misleadingly
// unfiltered — there's no per-block/per-type trend data to filter it
// with locally.
//
// "Fully Paid / Partial / Unpaid" counts come from chargesByStatus (or
// the matching breakdown row's paid/partial/unpaid), which count CHARGES
// not houses — closest available proxy until the backend exposes a
// per-house rollup. partialPaidDue/unpaidDue aren't split out by the
// backend, so they're estimated by dividing pendingAmount proportionally
// across the two buckets' charge counts — flagged below, replace once a
// real split exists.

import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { Card, FadeSlideIn, formatINR, MonthRangeSelector, MonthRangeValue, PrimaryButton, SelectChip } from '../ui';
import { useTheme } from '../../context/ThemeContext';
import { ApiError } from '../../services/api';
import {
  CollectionSummary,
  getReportsCollectionSummary,
  getReportsHouseTypeAnalysis,
  getReportsSummary,
  HouseTypeBreakdown,
  ReportsSummary,
  TrendPoint,
} from '../../services/endpoints';
import { useReportsCycleRange } from '../../hooks/useReportsCycleRange';

type FilterDimension = 'block' | 'houseType';

interface ReportRow {
  totalCollection: number;
  totalDue: number;
  pendingAmount: number;
  collectionPct: number;
  vsLastMonthPct: number | null;
  totalHouses: number;
  fullyPaid: number;
  fullyPaidPct: number;
  partialPaid: number;
  partialPaidDue: number;
  unpaid: number;
  unpaidDue: number;
  trend: TrendPoint[] | null; // null when a block/house-type filter is active — can't be locally filtered
}

function buildReportRow(params: {
  summary: ReportsSummary;
  collection: CollectionSummary;
  activeRow: HouseTypeBreakdown | null; // the matching block/houseType breakdown row, if a filter is active
}): ReportRow {
  const { summary, collection, activeRow } = params;

  if (activeRow) {
    const due = activeRow.collected + activeRow.pending;
    const splitBase = activeRow.partial + activeRow.unpaid || 1;
    return {
      totalCollection: activeRow.collected,
      totalDue: due,
      pendingAmount: activeRow.pending,
      collectionPct: activeRow.pct,
      vsLastMonthPct: null,
      totalHouses: activeRow.totalHouses,
      fullyPaid: activeRow.paid,
      fullyPaidPct: activeRow.totalHouses > 0 ? Math.round((activeRow.paid / activeRow.totalHouses) * 100) : 0,
      partialPaid: activeRow.partial,
      partialPaidDue: Math.round((activeRow.pending * activeRow.partial) / splitBase),
      unpaid: activeRow.unpaid,
      unpaidDue: Math.round((activeRow.pending * activeRow.unpaid) / splitBase),
      trend: null,
    };
  }

  const { paid, partial, pending, overdue } = summary.chargesByStatus;
  const unpaid = pending + overdue;
  const splitBase = partial + unpaid || 1;
  const trend = collection.trend;

  return {
    totalCollection: collection.totalCollection,
    totalDue: collection.totalDue,
    pendingAmount: collection.pendingAmount,
    collectionPct: collection.collectionPct,
    vsLastMonthPct: null, // computed separately once trend has at least 2 points — see below
    totalHouses: collection.totalHouses,
    fullyPaid: paid,
    fullyPaidPct: collection.totalHouses > 0 ? Math.round((paid / collection.totalHouses) * 100) : 0,
    partialPaid: partial,
    partialPaidDue: Math.round((collection.pendingAmount * partial) / splitBase),
    unpaid,
    unpaidDue: Math.round((collection.pendingAmount * unpaid) / splitBase),
    trend,
  };
}

function vsLastMonthFromTrend(trend: TrendPoint[] | null): number | null {
  if (!trend || trend.length < 2) return null;
  const last = trend[trend.length - 1];
  const prev = trend[trend.length - 2];
  if (prev.valueLakh <= 0) return null;
  return Number((((last.valueLakh - prev.valueLakh) / prev.valueLakh) * 100).toFixed(1));
}

function ProgressBar({ pct }: { pct: number }) {
  const { colors, radius } = useTheme();
  const clamped = Math.max(0, Math.min(100, pct));
  return (
    <View
      style={{
        height: 8,
        borderRadius: radius.pill,
        backgroundColor: colors.border,
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          width: `${clamped}%`,
          height: '100%',
          borderRadius: radius.pill,
          backgroundColor: colors.success,
        }}
      />
    </View>
  );
}

function QuickSummaryCard({
  icon,
  label,
  value,
  sublabel,
  tone = 'neutral',
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  sublabel: string;
  tone?: 'neutral' | 'success' | 'warning' | 'danger';
  onPress?: () => void;
}) {
  const { colors, spacing, typography } = useTheme();
  const toneColor = {
    neutral: colors.text,
    success: colors.success,
    warning: colors.warning,
    danger: colors.danger,
  }[tone];

  const content = (
    <Card style={{ flex: 1, padding: spacing.md }}>
      <Ionicons name={icon} size={18} color={toneColor} />
      <Text style={[typography.h2, { color: colors.text, marginTop: spacing.sm }]}>{value}</Text>
      <Text style={[typography.caption, { color: colors.textMuted, marginTop: 2 }]}>{label}</Text>
      <Text style={[typography.tiny, { color: toneColor, marginTop: 3 }]}>{sublabel}</Text>
    </Card>
  );

  if (!onPress) return content;
  return <Pressable style={{ flex: 1 }} onPress={onPress}>{content}</Pressable>;
}

function TrendBarChart({ data }: { data: { label: string; valueLakh: number }[] }) {
  const { colors, spacing, typography, radius } = useTheme();
  const max = Math.max(...data.map((d) => d.valueLakh));
  const chartHeight = 64;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: chartHeight, marginTop: spacing.md }}>
      {data.map((d, i) => {
        const isLast = i === data.length - 1;
        const barHeight = Math.max(6, (d.valueLakh / max) * chartHeight);
        return (
          <View key={d.label} style={{ flex: 1, alignItems: 'center' }}>
            <View
              style={{
                width: '55%',
                height: barHeight,
                borderRadius: radius.sm,
                backgroundColor: isLast ? colors.accent : colors.primaryMuted,
              }}
            />
            <Text style={[typography.tiny, { color: colors.textMuted, marginTop: spacing.xs }]}>{d.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

export function ReportsHomeContent({
  onViewReport,
  onViewTrendDetails,
  onViewFullyPaid,
  onViewPartial,
  onViewUnpaid,
}: {
  onViewReport?: () => void;
  onViewTrendDetails?: () => void;
  // Individual-level drill-downs — only wired by the admin route wrapper.
  // Left undefined on the resident tab so these tiles are non-interactive
  // there (see the file-level note above).
  onViewFullyPaid?: () => void;
  onViewPartial?: () => void;
  onViewUnpaid?: () => void;
}) {
  const { colors, spacing, radius, typography } = useTheme();
  const { range, setRange, isLoadingCycle, cycleError } = useReportsCycleRange();

  const [blockFilter, setBlockFilter] = useState('all');
  const [houseTypeFilter, setHouseTypeFilter] = useState('all');

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
      setError(err instanceof ApiError ? err.message : 'Could not load report.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (range) load(range);
  }, [range, load]);

  const selectFilter = (dimension: FilterDimension, key: string) => {
    if (dimension === 'block') {
      setBlockFilter(key);
      setHouseTypeFilter('all');
    } else {
      setHouseTypeFilter(key);
      setBlockFilter('all');
    }
  };

  if (isLoadingCycle || (isLoading && !summary)) {
    return (
      <View style={{ paddingVertical: spacing.xxxl, alignItems: 'center' }}>
        <ActivityIndicator color={colors.textMuted} />
      </View>
    );
  }

  if (cycleError && !range) {
    return (
      <View style={{ paddingVertical: spacing.xxxl, alignItems: 'center' }}>
        <Text style={[typography.body, { color: colors.danger, textAlign: 'center' }]}>{cycleError}</Text>
      </View>
    );
  }

  if (error && !summary) {
    return (
      <View style={{ paddingVertical: spacing.xxxl, alignItems: 'center' }}>
        <Text style={[typography.body, { color: colors.danger, textAlign: 'center' }]}>{error}</Text>
        <Pressable onPress={() => range && load(range)} style={{ marginTop: spacing.md }}>
          <Text style={[typography.caption, { color: colors.accent }]}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  const activeRow =
    blockFilter !== 'all'
      ? blockBreakdown.find((b) => b.key === blockFilter) ?? null
      : houseTypeFilter !== 'all'
      ? houseTypeBreakdown.find((h) => h.key === houseTypeFilter) ?? null
      : null;

  const r = buildReportRow({ summary: summary!, collection: collection!, activeRow });
  const vsLastMonthPct = vsLastMonthFromTrend(r.trend);

  return (
    <>
      {/* Reporting period + filters */}
      <FadeSlideIn>
        <Text style={[typography.caption, { color: colors.textMuted, marginBottom: spacing.sm }]}>
          Reporting Period
        </Text>
        <View style={{ marginBottom: spacing.md }}>
          <MonthRangeSelector value={range!} onChange={setRange} />
        </View>

        <View style={{ flexDirection: 'row', gap: spacing.md, marginBottom: 4 }}>
          <Text style={[typography.tiny, { color: colors.textMuted, flex: 1 }]}>Block</Text>
          <Text style={[typography.tiny, { color: colors.textMuted, flex: 1 }]}>House type</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg }}>
          <SelectChip
            icon="business-outline"
            value={blockFilter}
            options={blockBreakdown.map((b) => ({ key: b.key, label: b.label }))}
            onChange={(key) => selectFilter('block', key)}
          />
          <SelectChip
            icon="home-outline"
            value={houseTypeFilter}
            options={houseTypeBreakdown.map((h) => ({ key: h.key, label: h.label }))}
            onChange={(key) => selectFilter('houseType', key)}
          />
        </View>

        <PrimaryButton label="View Report" icon="bar-chart-outline" onPress={() => onViewReport?.()} />
      </FadeSlideIn>

      {/* Total collection hero */}
      <FadeSlideIn delay={60} style={{ marginTop: spacing.xl }}>
        <Card>
          <Text style={[typography.caption, { color: colors.textMuted }]}>Total Collection</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs }}>
            <Text style={[typography.display, { color: colors.text }]}>{formatINR(r.totalCollection)}</Text>
            {vsLastMonthPct !== null && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: vsLastMonthPct >= 0 ? colors.successBg : colors.dangerBg,
                  borderRadius: radius.sm,
                  paddingHorizontal: spacing.sm,
                  paddingVertical: 3,
                  marginLeft: spacing.sm,
                }}
              >
                <Ionicons
                  name={vsLastMonthPct >= 0 ? 'arrow-up' : 'arrow-down'}
                  size={11}
                  color={vsLastMonthPct >= 0 ? colors.success : colors.danger}
                />
                <Text
                  style={[
                    typography.tiny,
                    { color: vsLastMonthPct >= 0 ? colors.success : colors.danger, marginLeft: 2 },
                  ]}
                >
                  {Math.abs(vsLastMonthPct)}%
                </Text>
              </View>
            )}
          </View>
          <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>
            {r.collectionPct}% of {formatINR(r.totalDue)} collected
          </Text>

          <View style={{ marginTop: spacing.md }}>
            <ProgressBar pct={r.collectionPct} />
          </View>

          <Text style={[typography.caption, { color: colors.danger, marginTop: spacing.md }]}>
            {formatINR(r.pendingAmount)} pending
          </Text>
        </Card>
      </FadeSlideIn>

      {/* Quick summary — aggregate counts only, no resident names */}
      <FadeSlideIn delay={100} style={{ marginTop: spacing.xl }}>
        <Text style={[typography.h2, { color: colors.text, marginBottom: spacing.sm }]}>Quick Summary</Text>

        <View style={{ flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md }}>
          <QuickSummaryCard
            icon="home-outline"
            label="Total Houses"
            value={String(r.totalHouses)}
            sublabel="Active units"
          />
          <QuickSummaryCard
            icon="checkmark-circle-outline"
            label="Fully Paid"
            value={String(r.fullyPaid)}
            sublabel={`${r.fullyPaidPct}% houses`}
            tone="success"
            onPress={onViewFullyPaid}
          />
        </View>
        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          <QuickSummaryCard
            icon="time-outline"
            label="Partial Paid"
            value={String(r.partialPaid)}
            sublabel={`${formatINR(r.partialPaidDue)} due`}
            tone="warning"
            onPress={onViewPartial}
          />
          <QuickSummaryCard
            icon="alert-circle-outline"
            label="Unpaid"
            value={String(r.unpaid)}
            sublabel={`${formatINR(r.unpaidDue)} due`}
            tone="danger"
            onPress={onViewUnpaid}
          />
        </View>
      </FadeSlideIn>

      {/* Collection trend — hidden when a block/house-type filter is
          active, since there's no per-block/per-type trend to filter it
          with locally (see file-level note). */}
      <FadeSlideIn delay={140} style={{ marginTop: spacing.xl }}>
        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={[typography.h2, { color: colors.text }]}>Collection Trend</Text>
            {r.trend && (
              <Pressable onPress={() => onViewTrendDetails?.()}>
                <Text style={[typography.caption, { color: colors.accent }]}>View details</Text>
              </Pressable>
            )}
          </View>
          {r.trend ? (
            <>
              <Text style={[typography.tiny, { color: colors.textMuted, marginTop: 2 }]}>Amount in Lakhs (₹)</Text>
              <TrendBarChart data={r.trend} />
            </>
          ) : (
            <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.sm }]}>
              Not available for a filtered view — clear the Block / House Type filter to see the trend.
            </Text>
          )}
        </Card>
      </FadeSlideIn>
    </>
  );
}
