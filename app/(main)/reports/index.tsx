// app/(main)/reports/index.tsx
// Reports Home. Single route for both roles — drill-down tiles (Fully
// Paid / Partial / Unpaid) only navigate when session.isAdmin. Data comes
// from ReportsContext (see ../../../context/ReportsContext.tsx); no local
// fetch here anymore.
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { ProgressBar, TrendBarChart } from '../../../components/reports/shared';
import { Card, FadeSlideIn, formatINR, MonthRangeSelector, PrimaryButton, SelectChip } from '../../../components/ui';
import { useAuth } from '../../../context/AuthContext';
import { useReports } from '../../../context/ReportsContext';
import { useTheme } from '../../../context/ThemeContext';
import type { CollectionSummary, HouseTypeBreakdown, ReportsSummary, TrendPoint } from '../../../services/endpoints';

type FilterDimension = 'block' | 'houseType';

interface ReportRow {
  totalCollection: number;
  totalDue: number;
  pendingAmount: number;
  collectionPct: number;
  totalHouses: number;
  fullyPaid: number;
  fullyPaidPct: number;
  partialPaid: number;
  partialPaidDue: number;
  unpaid: number;
  unpaidDue: number;
  trend: TrendPoint[] | null; // null when a block/house-type filter is active
}

function buildReportRow(
  summary: ReportsSummary,
  collection: CollectionSummary,
  activeRow: HouseTypeBreakdown | null
): ReportRow {
  if (activeRow) {
    const due = activeRow.collected + activeRow.pending;
    const splitBase = activeRow.partial + activeRow.unpaid || 1;
    return {
      totalCollection: activeRow.collected,
      totalDue: due,
      pendingAmount: activeRow.pending,
      collectionPct: activeRow.pct,
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

  return {
    totalCollection: collection.totalCollection,
    totalDue: collection.totalDue,
    pendingAmount: collection.pendingAmount,
    collectionPct: collection.collectionPct,
    totalHouses: collection.totalHouses,
    fullyPaid: paid,
    fullyPaidPct: collection.totalHouses > 0 ? Math.round((paid / collection.totalHouses) * 100) : 0,
    partialPaid: partial,
    partialPaidDue: Math.round((collection.pendingAmount * partial) / splitBase),
    unpaid,
    unpaidDue: Math.round((collection.pendingAmount * unpaid) / splitBase),
    trend: collection.trend,
  };
}

function vsLastMonthFromTrend(trend: TrendPoint[] | null): number | null {
  if (!trend || trend.length < 2) return null;
  const last = trend[trend.length - 1];
  const prev = trend[trend.length - 2];
  if (prev.valueLakh <= 0) return null;
  return Number((((last.valueLakh - prev.valueLakh) / prev.valueLakh) * 100).toFixed(1));
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
  const toneColor = { neutral: colors.text, success: colors.success, warning: colors.warning, danger: colors.danger }[tone];
  const content = (
    <Card style={{ flex: 1, padding: spacing.md }}>
      <Ionicons name={icon} size={18} color={toneColor} />
      <Text style={[typography.h2, { color: colors.text, marginTop: spacing.sm }]}>{value}</Text>
      <Text style={[typography.caption, { color: colors.textMuted, marginTop: 2 }]}>{label}</Text>
      <Text style={[typography.tiny, { color: toneColor, marginTop: 3 }]}>{sublabel}</Text>
    </Card>
  );
  if (!onPress) return content;
  return (
    <Pressable style={{ flex: 1 }} onPress={onPress}>
      {content}
    </Pressable>
  );
}

export default function ReportsTabScreen() {
  const { colors, radius, spacing, typography } = useTheme();
  const { session } = useAuth();
  const isAdmin = !!session?.isAdmin;
  const { range, setRange, summary, collection, blockBreakdown, houseTypeBreakdown, isLoading, error, refresh } =
    useReports();

  const [blockFilter, setBlockFilter] = useState('all');
  const [houseTypeFilter, setHouseTypeFilter] = useState('all');

  const selectFilter = (dimension: FilterDimension, key: string) => {
    if (dimension === 'block') {
      setBlockFilter(key);
      setHouseTypeFilter('all');
    } else {
      setHouseTypeFilter(key);
      setBlockFilter('all');
    }
  };

  const activeRow =
    blockFilter !== 'all'
      ? blockBreakdown.find((b) => b.key === blockFilter) ?? null
      : houseTypeFilter !== 'all'
      ? houseTypeBreakdown.find((h) => h.key === houseTypeFilter) ?? null
      : null;

  const r = summary && collection ? buildReportRow(summary, collection, activeRow) : null;
  const vsLastMonthPct = r ? vsLastMonthFromTrend(r.trend) : null;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingTop: spacing.xxxl, paddingBottom: spacing.xxxl + 90 }}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refresh} tintColor={colors.textMuted} />}
      >
        <FadeSlideIn style={{ marginBottom: spacing.lg }}>
          <Text style={[typography.h1, { color: colors.text }]}>Reports</Text>
          <Text style={[typography.caption, { color: colors.textMuted, marginTop: 2 }]}>{session?.user?.society ?? ''}</Text>
        </FadeSlideIn>

        {isLoading && !r ? (
          <View style={{ paddingVertical: spacing.xxxl, alignItems: 'center' }}>
            <ActivityIndicator color={colors.textMuted} />
          </View>
        ) : error && !r ? (
          <View style={{ paddingVertical: spacing.xxxl, alignItems: 'center' }}>
            <Text style={[typography.body, { color: colors.danger, textAlign: 'center' }]}>{error}</Text>
            <Pressable onPress={refresh} style={{ marginTop: spacing.md }}>
              <Text style={[typography.caption, { color: colors.accent }]}>Retry</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <FadeSlideIn>
              <Text style={[typography.caption, { color: colors.textMuted, marginBottom: spacing.sm }]}>Reporting Period</Text>
              <View style={{ marginBottom: spacing.md }}>
                <MonthRangeSelector value={range} onChange={setRange} />
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

              <PrimaryButton
                label="View Report"
                icon="bar-chart-outline"
                onPress={() => router.push('/(main)/reports/collection-summary' as any)}
              />
            </FadeSlideIn>

            <FadeSlideIn delay={60} style={{ marginTop: spacing.xl }}>
              <Card>
                <Text style={[typography.caption, { color: colors.textMuted }]}>Total Collection</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs }}>
                  <Text style={[typography.display, { color: colors.text }]}>{formatINR(r!.totalCollection)}</Text>
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
                      <Text style={[typography.tiny, { color: vsLastMonthPct >= 0 ? colors.success : colors.danger, marginLeft: 2 }]}>
                        {Math.abs(vsLastMonthPct)}%
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>
                  {r!.collectionPct}% of {formatINR(r!.totalDue)} collected
                </Text>
                <View style={{ marginTop: spacing.md }}>
                  <ProgressBar pct={r!.collectionPct} />
                </View>
                <Text style={[typography.caption, { color: colors.danger, marginTop: spacing.md }]}>{formatINR(r!.pendingAmount)} pending</Text>
              </Card>
            </FadeSlideIn>

            <FadeSlideIn delay={100} style={{ marginTop: spacing.xl }}>
              <Text style={[typography.h2, { color: colors.text, marginBottom: spacing.sm }]}>Quick Summary</Text>
              <View style={{ flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md }}>
                <QuickSummaryCard icon="home-outline" label="Total Houses" value={String(r!.totalHouses)} sublabel="Active units" />
                <QuickSummaryCard
                  icon="checkmark-circle-outline"
                  label="Fully Paid"
                  value={String(r!.fullyPaid)}
                  sublabel={`${r!.fullyPaidPct}% houses`}
                  tone="success"
                  onPress={ () => router.push('/(main)/reports/resident-payment-list?filter=paid' as any)}
                />
              </View>
              <View style={{ flexDirection: 'row', gap: spacing.md }}>
                <QuickSummaryCard
                  icon="time-outline"
                  label="Partial Paid"
                  value={String(r!.partialPaid)}
                  sublabel={`${formatINR(r!.partialPaidDue)} due`}
                  tone="warning"
                  onPress={ () => router.push('/(main)/reports/resident-payment-list?filter=partial' as any)}
                />
                <QuickSummaryCard
                  icon="alert-circle-outline"
                  label="Unpaid"
                  value={String(r!.unpaid)}
                  sublabel={`${formatINR(r!.unpaidDue)} due`}
                  tone="danger"
                  onPress={ () => router.push('/(main)/reports/unpaid-residents' as any)}
                />
              </View>
            </FadeSlideIn>

            <FadeSlideIn delay={140} style={{ marginTop: spacing.xl }}>
              <Card>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={[typography.h2, { color: colors.text }]}>Collection Trend</Text>
                  {r!.trend && (
                    <Pressable onPress={() => router.push('/(main)/reports/collection-trend' as any)}>
                      <Text style={[typography.caption, { color: colors.accent }]}>View details</Text>
                    </Pressable>
                  )}
                </View>
                {r!.trend ? (
                  <>
                    <Text style={[typography.tiny, { color: colors.textMuted, marginTop: 2 }]}>Amount in Lakhs (₹)</Text>
                    <TrendBarChart data={r!.trend} />
                  </>
                ) : (
                  <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.sm }]}>
                    Not available for a filtered view — clear the Block / House Type filter to see the trend.
                  </Text>
                )}
              </Card>
            </FadeSlideIn>
          </>
        )}
      </ScrollView>
    </View>
  );
}
