// components/reports/HouseTypeAnalysisScreen.tsx
// Shared House Type / Block Analysis content (Screen 3) — society-level
// aggregates only, no individual resident/payment data. Rendered by the
// single Reports route tree: app/(main)/reports/house-type-analysis.tsx.
// Both tabs (By House Type / By Block) reuse the same row component —
// same analytical shape, different grouping key.
//
// Wired to GET /reports/house-type-analysis?groupBy=houseType|block.
// Defaults to the current calendar year: January - current month, via a
// MonthRangeSelector; adjustable to any custom range. `icon` isn't
// part of the API response — it's a fixed choice per tab, applied
// client-side below.

import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { Card, FadeSlideIn, formatINR, IconBadge, MonthRangeSelector, MonthRangeValue, SegmentedTabs } from '../ui';
import { useTheme } from '../../context/ThemeContext';
import { ApiError } from '../../services/api';
import { getReportsHouseTypeAnalysis, HouseTypeBreakdown } from '../../services/endpoints';
import { useReportsCycleRange } from '../../hooks/useReportsCycleRange';

type Breakdown = HouseTypeBreakdown & { icon: keyof typeof Ionicons.glyphMap };

type TabKey = 'houseType' | 'block';

const TAB_ICON: Record<TabKey, keyof typeof Ionicons.glyphMap> = {
  houseType: 'home-outline',
  block: 'business-outline',
};

function BreakdownCard({ item }: { item: Breakdown }) {
  const { colors, spacing, typography, radius } = useTheme();
  const pctColor = item.pct >= 90 ? colors.success : item.pct >= 80 ? colors.warning : colors.danger;

  return (
    <Card style={{ marginBottom: spacing.md }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <IconBadge name={item.icon} size={38} />
        <Text style={[typography.bodyMedium, { color: colors.text, marginLeft: spacing.sm, flex: 1 }]}>
          {item.label}
        </Text>
        <Text style={[typography.h2, { color: pctColor }]}>{item.pct}%</Text>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.md }}>
        <Text style={[typography.caption, { color: colors.textMuted }]}>{formatINR(item.collected)} collected</Text>
        <Text style={[typography.caption, { color: colors.textMuted }]}>{formatINR(item.pending)} pending</Text>
      </View>

      <View
        style={{
          flexDirection: 'row',
          marginTop: spacing.md,
          paddingTop: spacing.md,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text style={[typography.tiny, { color: colors.textMuted, marginBottom: 2 }]}>Total Houses</Text>
          <Text style={[typography.bodyMedium, { color: colors.text }]}>{item.totalHouses}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.success, marginRight: 4 }} />
            <Text style={[typography.tiny, { color: colors.textMuted }]}>Paid</Text>
          </View>
          <Text style={[typography.bodyMedium, { color: colors.text }]}>{item.paid}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.warning, marginRight: 4 }} />
            <Text style={[typography.tiny, { color: colors.textMuted }]}>Partial</Text>
          </View>
          <Text style={[typography.bodyMedium, { color: colors.text }]}>{item.partial}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.danger, marginRight: 4 }} />
            <Text style={[typography.tiny, { color: colors.textMuted }]}>Unpaid</Text>
          </View>
          <Text style={[typography.bodyMedium, { color: colors.text }]}>{item.unpaid}</Text>
        </View>
      </View>
    </Card>
  );
}

export function HouseTypeAnalysisContent() {
  const { colors, spacing, typography } = useTheme();
  const { range, setRange, isLoadingCycle, cycleError } = useReportsCycleRange();
  const [tab, setTab] = useState<TabKey>('houseType');
  const [rows, setRows] = useState<Breakdown[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (groupBy: TabKey, r: MonthRangeValue) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getReportsHouseTypeAnalysis({ groupBy, ...r });
      setRows(result.map((row) => ({ ...row, icon: TAB_ICON[groupBy] })));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load breakdown.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (range) load(tab, range);
  }, [tab, range, load]);

  if (isLoadingCycle) {
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

  return (
    <>
      <FadeSlideIn style={{ marginBottom: spacing.md }}>
        <MonthRangeSelector value={range!} onChange={setRange} />
      </FadeSlideIn>

      <FadeSlideIn style={{ marginBottom: spacing.lg }}>
        <SegmentedTabs
          value={tab}
          onChange={setTab}
          options={[
            { key: 'houseType', label: 'By House Type' },
            { key: 'block', label: 'By Block' },
          ]}
        />
      </FadeSlideIn>

      {isLoading && rows.length === 0 ? (
        <View style={{ paddingVertical: 80, alignItems: 'center' }}>
          <ActivityIndicator color={colors.textMuted} />
        </View>
      ) : error && rows.length === 0 ? (
        <View style={{ paddingVertical: 80, alignItems: 'center' }}>
          <Text style={[typography.body, { color: colors.danger, textAlign: 'center' }]}>{error}</Text>
          <Pressable onPress={() => range && load(tab, range)} style={{ marginTop: spacing.md }}>
            <Text style={[typography.caption, { color: colors.accent }]}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <FadeSlideIn delay={40}>
          {rows.map((item) => (
            <BreakdownCard key={item.key} item={item} />
          ))}
        </FadeSlideIn>
      )}
    </>
  );
}
