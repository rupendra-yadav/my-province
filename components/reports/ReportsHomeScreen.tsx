// components/reports/ReportsHomeScreen.tsx
// Shared Reports Home content (Screen 1). Rendered by the single Reports
// route: app/(main)/reports/index.tsx — the same route for both admins and
// residents. Society-level aggregates are always shown; the individual-
// level drill-down tiles (Fully Paid / Partial / Unpaid) are only wired up
// by the route when session.isAdmin is true (see onViewFullyPaid etc.
// below), so this component itself stays role-agnostic.
//
// DUMMY UI ONLY: all data below is hardcoded for layout/visual review.
// No API calls yet — will be wired to GET /reports/dashboard (or similar)
// once the backend aggregation endpoints are settled. Kept in one clearly
// marked block below so swapping in real data later is a single-place edit.

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Card, FadeSlideIn, formatINR, PrimaryButton } from '../ui';
import { useTheme } from '../../context/ThemeContext';

// ---------------------------------------------------------------------------
// DUMMY DATA — replace with real API response later. Shape is a best guess
// at what GET /reports/dashboard would return; adjust once backend exists.
// ---------------------------------------------------------------------------
const MOCK_REPORT = {
  societyName: 'Green Valley Residency',
  periodLabel: '01 Mar 2026 – 31 Mar 2026',
  blockFilterLabel: 'All Block',
  houseTypeFilterLabel: 'All House Type',

  totalCollection: 3411403,
  totalDue: 3970344,
  pendingAmount: 558941,
  collectionPct: 85.9,
  vsLastMonthPct: 12.6,

  totalHouses: 392,
  fullyPaid: 341,
  fullyPaidPct: 87,
  partialPaid: 18,
  partialPaidDue: 126000,
  unpaid: 33,
  unpaidDue: 432941,

  trend: [
    { label: 'Sep', valueLakh: 2.8 },
    { label: 'Oct', valueLakh: 3.1 },
    { label: 'Nov', valueLakh: 3.6 },
    { label: 'Dec', valueLakh: 4.2 },
    { label: 'Jan', valueLakh: 4.9 },
    { label: 'Feb', valueLakh: 4.1 },
    { label: 'Mar', valueLakh: 4.7 },
  ],
};
// ---------------------------------------------------------------------------

function FilterChip({
  label,
  value,
  onPress,
}: {
  label: string;
  value: string;
  onPress: () => void;
}) {
  const { colors, radius, spacing, typography } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        paddingVertical: spacing.md - 2,
        paddingHorizontal: spacing.md,
        backgroundColor: colors.surface,
      }}
    >
      <View>
        <Text style={[typography.tiny, { color: colors.textMuted, marginBottom: 2 }]}>{label}</Text>
        <Text style={[typography.bodyMedium, { color: colors.text }]}>{value}</Text>
      </View>
      <Ionicons name="chevron-down" size={16} color={colors.textMuted} />
    </Pressable>
  );
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
  const r = MOCK_REPORT;

  return (
    <>
      {/* Reporting period + filters */}
      <FadeSlideIn>
        <Text style={[typography.caption, { color: colors.textMuted, marginBottom: spacing.sm }]}>
          Reporting Period
        </Text>
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
            marginBottom: spacing.md,
          }}
        >
          <Ionicons name="calendar-outline" size={17} color={colors.textMuted} />
          <Text style={[typography.body, { color: colors.text, marginLeft: spacing.sm, flex: 1 }]}>
            {r.periodLabel}
          </Text>
          <Ionicons name="chevron-down" size={16} color={colors.textMuted} />
        </Pressable>

        <View style={{ flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg }}>
          <FilterChip label="Block" value={r.blockFilterLabel} onPress={() => {}} />
          <FilterChip label="House Type" value={r.houseTypeFilterLabel} onPress={() => {}} />
        </View>

        <PrimaryButton label="View Report" icon="bar-chart-outline" onPress={() => onViewReport?.()} />
      </FadeSlideIn>

      {/* Total collection hero */}
      <FadeSlideIn delay={60} style={{ marginTop: spacing.xl }}>
        <Card>
          <Text style={[typography.caption, { color: colors.textMuted }]}>Total Collection</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs }}>
            <Text style={[typography.display, { color: colors.text }]}>{formatINR(r.totalCollection)}</Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colors.successBg,
                borderRadius: radius.sm,
                paddingHorizontal: spacing.sm,
                paddingVertical: 3,
                marginLeft: spacing.sm,
              }}
            >
              <Ionicons name="arrow-up" size={11} color={colors.success} />
              <Text style={[typography.tiny, { color: colors.success, marginLeft: 2 }]}>{r.vsLastMonthPct}%</Text>
            </View>
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

      {/* Collection trend */}
      <FadeSlideIn delay={140} style={{ marginTop: spacing.xl }}>
        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={[typography.h2, { color: colors.text }]}>Collection Trend</Text>
            <Pressable onPress={() => onViewTrendDetails?.()}>
              <Text style={[typography.caption, { color: colors.accent }]}>View details</Text>
            </Pressable>
          </View>
          <Text style={[typography.tiny, { color: colors.textMuted, marginTop: 2 }]}>Amount in Lakhs (₹)</Text>
          <TrendBarChart data={r.trend} />
        </Card>
      </FadeSlideIn>
    </>
  );
}

export const REPORTS_SOCIETY_NAME = MOCK_REPORT.societyName;
