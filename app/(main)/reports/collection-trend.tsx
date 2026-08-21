// app/(main)/reports/collection-trend.tsx
// Different endpoint/shape from ReportsContext's data (both collected AND
// pending per month), so this keeps its own local fetch — reuses the
// shared range from context so it stays in sync with the other screens.
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { Card, FadeSlideIn, formatINR, MonthRangeSelector, SegmentedTabs } from '../../../components/ui';
import { ScreenHeader } from '../../../components/reports/shared';
import { useReports } from '../../../context/ReportsContext';
import { useTheme } from '../../../context/ThemeContext';
import { ApiError } from '../../../services/api';
import { CollectionTrendPoint, getReportsCollectionTrend } from '../../../services/endpoints';

type Mode = 'collection' | 'pending';

function buildInsights(months: CollectionTrendPoint[]): string[] {
  if (months.length === 0) return [];
  const insights: string[] = [];

  const highest = months.reduce((a, b) => (b.collected > a.collected ? b : a));
  insights.push(`Highest collection in ${highest.label} ${highest.year} (${formatINR(highest.collected)})`);

  let streak = 1;
  for (let i = months.length - 1; i > 0; i--) {
    if (months[i].collected > months[i - 1].collected) streak++;
    else break;
  }
  if (streak >= 3) insights.push(`Collection has risen for ${streak} months in a row`);

  return insights;
}

function TrendChart({
  mode,
  months,
  selected,
  onSelect,
}: {
  mode: Mode;
  months: CollectionTrendPoint[];
  selected: number;
  onSelect: (i: number) => void;
}) {
  const { colors, spacing, typography, radius } = useTheme();
  const values = months.map((m) => (mode === 'collection' ? m.collected : m.pending));
  const max = Math.max(1, ...values);
  const chartHeight = 96;

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: spacing.md }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: chartHeight }}>
        {months.map((m, i) => {
          const value = mode === 'collection' ? m.collected : m.pending;
          const isActive = i === selected;
          const barHeight = Math.max(6, (value / max) * chartHeight);
          return (
            <Pressable key={`${m.year}-${m.month}`} onPress={() => onSelect(i)} style={{ width: 40, alignItems: 'center' }}>
              <View
                style={{
                  width: '50%',
                  height: barHeight,
                  borderRadius: radius.sm,
                  backgroundColor: isActive ? colors.accent : colors.primaryMuted,
                }}
              />
              <Text
                style={[
                  typography.tiny,
                  { color: isActive ? colors.text : colors.textMuted, marginTop: spacing.xs, fontWeight: isActive ? ('600' as const) : ('500' as const) },
                ]}
              >
                {m.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

export default function CollectionTrendScreen() {
  const { colors, spacing, radius, typography } = useTheme();
  const { range, setRange } = useReports();
  const [mode, setMode] = useState<Mode>('collection');
  const [months, setMonths] = useState<CollectionTrendPoint[]>([]);
  const [selected, setSelected] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (r: typeof range) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getReportsCollectionTrend(r);
      setMonths(result);
      setSelected(result.length - 1);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load trend.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load(range);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range]);

  if (isLoading && months.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <ScreenHeader title="Collection Trend" onBack={() => router.back()} />
        <View style={{ paddingVertical: 80, alignItems: 'center' }}>
          <ActivityIndicator color={colors.textMuted} />
        </View>
      </View>
    );
  }

  if (error && months.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <ScreenHeader title="Collection Trend" onBack={() => router.back()} />
        <View style={{ paddingVertical: 80, alignItems: 'center' }}>
          <Text style={[typography.body, { color: colors.danger, textAlign: 'center' }]}>{error}</Text>
          <Pressable onPress={() => load(range)} style={{ marginTop: spacing.md }}>
            <Text style={[typography.caption, { color: colors.accent }]}>Retry</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const current = months[selected];
  const prev = months[selected - 1];
  const vsPrevPct =
    prev && prev.collected > 0 ? Math.round(((current.collected - prev.collected) / prev.collected) * 1000) / 10 : null;
  const insights = buildInsights(months);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="Collection Trend" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingBottom: spacing.xxxl }}>
        <FadeSlideIn style={{ marginBottom: spacing.md }}>
          <MonthRangeSelector value={range} onChange={setRange} />
        </FadeSlideIn>

        <FadeSlideIn delay={40} style={{ marginBottom: spacing.sm }}>
          <SegmentedTabs
            value={mode}
            onChange={setMode}
            options={[
              { key: 'collection', label: 'Collection' },
              { key: 'pending', label: 'Pending' },
            ]}
          />
        </FadeSlideIn>

        <FadeSlideIn delay={80}>
          <Card>
            <Text style={[typography.tiny, { color: colors.textMuted }]}>Amount in Lakhs (₹)</Text>
            <TrendChart mode={mode} months={months} selected={selected} onSelect={setSelected} />
          </Card>
        </FadeSlideIn>

        <FadeSlideIn delay={120} style={{ marginTop: spacing.lg }}>
          <Card>
            <Text style={[typography.h2, { color: colors.text }]}>
              {current.label} {current.year}
            </Text>
            <View style={{ flexDirection: 'row', marginTop: spacing.md }}>
              <View style={{ flex: 1 }}>
                <Text style={[typography.tiny, { color: colors.textMuted, marginBottom: 4 }]}>Collected</Text>
                <Text style={[typography.h1, { color: colors.text }]}>{formatINR(current.collected)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[typography.tiny, { color: colors.textMuted, marginBottom: 4 }]}>Pending</Text>
                <Text style={[typography.h1, { color: colors.danger }]}>{formatINR(current.pending)}</Text>
              </View>
            </View>
            {vsPrevPct !== null && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  alignSelf: 'flex-start',
                  backgroundColor: vsPrevPct >= 0 ? colors.successBg : colors.dangerBg,
                  borderRadius: radius.sm,
                  paddingHorizontal: spacing.sm,
                  paddingVertical: 3,
                  marginTop: spacing.md,
                }}
              >
                <Ionicons
                  name={vsPrevPct >= 0 ? 'arrow-up' : 'arrow-down'}
                  size={11}
                  color={vsPrevPct >= 0 ? colors.success : colors.danger}
                />
                <Text style={[typography.tiny, { color: vsPrevPct >= 0 ? colors.success : colors.danger, marginLeft: 2 }]}>
                  {Math.abs(vsPrevPct)}% vs {prev.label}
                </Text>
              </View>
            )}
          </Card>
        </FadeSlideIn>

        {insights.length > 0 && (
          <FadeSlideIn delay={160} style={{ marginTop: spacing.lg }}>
            <Text style={[typography.h2, { color: colors.text, marginBottom: spacing.sm }]}>Quick Insights</Text>
            <Card>
              {insights.map((line, i) => (
                <View
                  key={line}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    paddingVertical: spacing.sm,
                    borderTopWidth: i === 0 ? 0 : 1,
                    borderTopColor: colors.border,
                  }}
                >
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.accent, marginTop: 7, marginRight: spacing.sm }} />
                  <Text style={[typography.body, { color: colors.text, flex: 1 }]}>{line}</Text>
                </View>
              ))}
            </Card>
          </FadeSlideIn>
        )}
      </ScrollView>
    </View>
  );
}
