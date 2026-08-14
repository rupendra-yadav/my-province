// components/reports/CollectionSummaryScreen.tsx
// Shared Collection Summary content (Screen 2) — society-level aggregates
// only, no individual resident/payment data. Rendered by the single
// Reports route tree: app/(main)/reports/collection-summary.tsx.
//
// Wired to GET /reports/collection-summary. Defaults to the current
// calendar year: January - current month, via a MonthRangeSelector;
// adjustable to any custom range.

import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { Card, FadeSlideIn, formatINR, MonthRangeSelector, MonthRangeValue } from '../ui';
import { useTheme } from '../../context/ThemeContext';
import { ApiError } from '../../services/api';
import { CollectionSummary, getReportsCollectionSummary } from '../../services/endpoints';
import { useReportsCycleRange } from '../../hooks/useReportsCycleRange';

function StatTile({ label, value }: { label: string; value: string }) {
  const { colors, spacing, typography } = useTheme();
  return (
    <View style={{ flex: 1, paddingVertical: spacing.md }}>
      <Text style={[typography.tiny, { color: colors.textMuted, marginBottom: 4 }]}>{label}</Text>
      <Text style={[typography.bodyMedium, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

function StatGrid({
  rows,
}: {
  rows: [{ label: string; value: string }, { label: string; value: string }][];
}) {
  const { colors } = useTheme();
  return (
    <Card style={{ padding: 0, overflow: 'hidden' }}>
      {rows.map((pair, i) => (
        <View
          key={i}
          style={{
            flexDirection: 'row',
            paddingHorizontal: 16,
            borderTopWidth: i === 0 ? 0 : 1,
            borderTopColor: colors.border,
          }}
        >
          <StatTile label={pair[0].label} value={pair[0].value} />
          <View style={{ width: 1, backgroundColor: colors.border }} />
          <View style={{ width: 16 }} />
          <StatTile label={pair[1].label} value={pair[1].value} />
        </View>
      ))}
    </Card>
  );
}

function TrendBarChart({ data }: { data: { label: string; valueLakh: number }[] }) {
  const { colors, spacing, typography, radius } = useTheme();
  const max = Math.max(...data.map((d) => d.valueLakh));
  const chartHeight = 72;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: chartHeight, marginTop: spacing.md }}>
      {data.map((d, i) => {
        const isLast = i === data.length - 1;
        const barHeight = Math.max(6, (d.valueLakh / max) * chartHeight);
        return (
          <View key={d.label} style={{ flex: 1, alignItems: 'center' }}>
            <View
              style={{
                width: '45%',
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

function ProgressBar({ pct, color }: { pct: number; color: string }) {
  const { colors, radius } = useTheme();
  const clamped = Math.max(0, Math.min(100, pct));
  return (
    <View style={{ height: 6, borderRadius: radius.pill, backgroundColor: colors.border, overflow: 'hidden' }}>
      <View style={{ width: `${clamped}%`, height: '100%', borderRadius: radius.pill, backgroundColor: color }} />
    </View>
  );
}

function HouseTypeRow({
  item,
  onPress,
}: {
  item: { key: string; label: string; pct: number; collected: number; pending: number };
  onPress?: () => void;
}) {
  const { colors, spacing, typography } = useTheme();
  const pctColor = item.pct >= 90 ? colors.success : item.pct >= 80 ? colors.warning : colors.danger;

  return (
    <Pressable onPress={onPress} style={{ paddingVertical: spacing.md }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs }}>
        <Text style={[typography.bodyMedium, { color: colors.text }]}>{item.label}</Text>
        <Text style={[typography.bodyMedium, { color: pctColor }]}>{item.pct}%</Text>
      </View>
      <ProgressBar pct={item.pct} color={pctColor} />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xs }}>
        <Text style={[typography.tiny, { color: colors.textMuted }]}>
          {formatINR(item.collected)} collected
        </Text>
        <Text style={[typography.tiny, { color: colors.textMuted }]}>{formatINR(item.pending)} pending</Text>
      </View>
    </Pressable>
  );
}

export function CollectionSummaryContent({
  onViewHouseTypeAnalysis,
}: {
  onViewHouseTypeAnalysis?: () => void;
}) {
  const { colors, spacing, typography } = useTheme();
  const { range, setRange, isLoadingCycle, cycleError } = useReportsCycleRange();
  const [s, setS] = useState<CollectionSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (r: MonthRangeValue) => {
    setIsLoading(true);
    setError(null);
    try {
      setS(await getReportsCollectionSummary(r));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load summary.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (range) load(range);
  }, [range, load]);

  if (isLoadingCycle || (isLoading && !s)) {
    return (
      <View style={{ paddingVertical: 80, alignItems: 'center' }}>
        <ActivityIndicator color={colors.textMuted} />
      </View>
    );
  }

  if (cycleError && !range) {
    return (
      <View style={{ paddingVertical: 80, alignItems: 'center' }}>
        <Text style={[typography.body, { color: colors.danger, textAlign: 'center' }]}>{cycleError}</Text>
      </View>
    );
  }

  if (error && !s) {
    return (
      <View style={{ paddingVertical: 80, alignItems: 'center' }}>
        <Text style={[typography.body, { color: colors.danger, textAlign: 'center' }]}>{error}</Text>
        <Pressable onPress={() => range && load(range)} style={{ marginTop: spacing.md }}>
          <Text style={[typography.caption, { color: colors.accent }]}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  const data = s!;

  return (
    <>
      <FadeSlideIn style={{ marginBottom: spacing.lg }}>
        <MonthRangeSelector value={range!} onChange={setRange} />
      </FadeSlideIn>

      {/* Hero */}
      <FadeSlideIn delay={40}>
        <Card>
          <Text style={[typography.caption, { color: colors.textMuted }]}>Total Collection</Text>
          <Text style={[typography.display, { color: colors.text, marginTop: spacing.xs }]}>
            {formatINR(data.totalCollection)}
          </Text>
          <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>
            {data.collectionPct}% collected
          </Text>
          <View style={{ marginTop: spacing.md }}>
            <ProgressBar pct={data.collectionPct} color={colors.success} />
          </View>
          <Text style={[typography.caption, { color: colors.danger, marginTop: spacing.md }]}>
            {formatINR(data.pendingAmount)} pending
          </Text>
        </Card>
      </FadeSlideIn>

      {/* Stat grid */}
      <FadeSlideIn delay={80} style={{ marginTop: spacing.lg }}>
        <StatGrid
          rows={[
            [
              { label: 'Total Houses', value: String(data.totalHouses) },
              { label: 'Total Due', value: formatINR(data.totalDue) },
            ],
            [
              { label: 'Collected', value: formatINR(data.totalCollection) },
              { label: 'Pending', value: formatINR(data.pendingAmount) },
            ],
            [
              { label: 'Collection Rate', value: `${data.collectionRate}%` },
              { label: 'Avg / House', value: formatINR(data.avgCollectionPerHouse) },
            ],
          ]}
        />
      </FadeSlideIn>

      {/* Trend */}
      <FadeSlideIn delay={120} style={{ marginTop: spacing.xl }}>
        <Card>
          <Text style={[typography.h2, { color: colors.text }]}>Collection Trend</Text>
          <Text style={[typography.tiny, { color: colors.textMuted, marginTop: 2 }]}>Amount in Lakhs (₹)</Text>
          <TrendBarChart data={data.trend} />
        </Card>
      </FadeSlideIn>

      {/* House type performance */}
      <FadeSlideIn delay={160} style={{ marginTop: spacing.xl }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: spacing.sm,
          }}
        >
          <Text style={[typography.h2, { color: colors.text }]}>House Type Performance</Text>
          <Pressable onPress={() => onViewHouseTypeAnalysis?.()}>
            <Text style={[typography.caption, { color: colors.accent }]}>View all</Text>
          </Pressable>
        </View>
        <Card style={{ padding: 0 }}>
          {data.houseTypePerformance.map((item, i) => (
            <View
              key={item.key}
              style={{
                paddingHorizontal: spacing.md,
                borderTopWidth: i === 0 ? 0 : 1,
                borderTopColor: colors.border,
              }}
            >
              <HouseTypeRow item={item} onPress={() => onViewHouseTypeAnalysis?.()} />
            </View>
          ))}
        </Card>
      </FadeSlideIn>
    </>
  );
}
