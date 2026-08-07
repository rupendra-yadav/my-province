// components/reports/CollectionSummaryScreen.tsx
// Shared Collection Summary content (Screen 2) — society-level aggregates
// only, no individual resident/payment data. Rendered by the single
// Reports route tree: app/(main)/reports/collection-summary.tsx.
//
// DUMMY UI ONLY: all data below is hardcoded for layout/visual review.
// No API calls yet — will be wired to a real reports endpoint once the
// backend aggregation strategy is settled. Kept in one clearly marked
// block below so swapping in real data later is a single-place edit.

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Card, FadeSlideIn, formatINR } from '../ui';
import { useTheme } from '../../context/ThemeContext';

// ---------------------------------------------------------------------------
// DUMMY DATA — replace with real API response later.
// ---------------------------------------------------------------------------
const MOCK_SUMMARY = {
  periodLabel: '01 Mar 2026 – 31 Mar 2026',

  totalCollection: 3411403,
  totalDue: 3970344,
  pendingAmount: 558941,
  collectionPct: 85.9,

  totalHouses: 392,
  collectionRate: 85.9,
  avgCollectionPerHouse: 8715,

  trend: [
    { label: 'Sep', valueLakh: 2.8 },
    { label: 'Oct', valueLakh: 3.1 },
    { label: 'Nov', valueLakh: 3.6 },
    { label: 'Dec', valueLakh: 4.2 },
    { label: 'Jan', valueLakh: 4.9 },
    { label: 'Feb', valueLakh: 4.1 },
    { label: 'Mar', valueLakh: 4.7 },
  ],

  houseTypePerformance: [
    { key: 'CC', label: 'CC Houses', pct: 95, collected: 1180430, pending: 62500 },
    { key: 'DD', label: 'DD Houses', pct: 88, collected: 840210, pending: 114300 },
    { key: 'PP', label: 'PP Houses', pct: 82, collected: 672330, pending: 146670 },
  ],
};
// ---------------------------------------------------------------------------

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
  item: (typeof MOCK_SUMMARY.houseTypePerformance)[number];
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
  const { colors, spacing, radius, typography } = useTheme();
  const s = MOCK_SUMMARY;

  return (
    <>
      <FadeSlideIn>
        <Pressable
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radius.md,
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.md,
            backgroundColor: colors.surface,
            marginBottom: spacing.lg,
          }}
        >
          <Ionicons name="calendar-outline" size={17} color={colors.textMuted} />
          <Text style={[typography.body, { color: colors.text, marginLeft: spacing.sm, flex: 1 }]}>
            {s.periodLabel}
          </Text>
          <Ionicons name="chevron-down" size={16} color={colors.textMuted} />
        </Pressable>
      </FadeSlideIn>

      {/* Hero */}
      <FadeSlideIn delay={40}>
        <Card>
          <Text style={[typography.caption, { color: colors.textMuted }]}>Total Collection</Text>
          <Text style={[typography.display, { color: colors.text, marginTop: spacing.xs }]}>
            {formatINR(s.totalCollection)}
          </Text>
          <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>
            {s.collectionPct}% collected
          </Text>
          <View style={{ marginTop: spacing.md }}>
            <ProgressBar pct={s.collectionPct} color={colors.success} />
          </View>
          <Text style={[typography.caption, { color: colors.danger, marginTop: spacing.md }]}>
            {formatINR(s.pendingAmount)} pending
          </Text>
        </Card>
      </FadeSlideIn>

      {/* Stat grid */}
      <FadeSlideIn delay={80} style={{ marginTop: spacing.lg }}>
        <StatGrid
          rows={[
            [
              { label: 'Total Houses', value: String(s.totalHouses) },
              { label: 'Total Due', value: formatINR(s.totalDue) },
            ],
            [
              { label: 'Collected', value: formatINR(s.totalCollection) },
              { label: 'Pending', value: formatINR(s.pendingAmount) },
            ],
            [
              { label: 'Collection Rate', value: `${s.collectionRate}%` },
              { label: 'Avg / House', value: formatINR(s.avgCollectionPerHouse) },
            ],
          ]}
        />
      </FadeSlideIn>

      {/* Trend */}
      <FadeSlideIn delay={120} style={{ marginTop: spacing.xl }}>
        <Card>
          <Text style={[typography.h2, { color: colors.text }]}>Collection Trend</Text>
          <Text style={[typography.tiny, { color: colors.textMuted, marginTop: 2 }]}>Amount in Lakhs (₹)</Text>
          <TrendBarChart data={s.trend} />
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
          {s.houseTypePerformance.map((item, i) => (
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
