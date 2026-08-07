// components/reports/CollectionTrendScreen.tsx
// Shared Collection Trend content (Screen 7) — society-level aggregates
// only, no individual resident/payment data. Rendered by the single
// Reports route tree: app/(main)/reports/collection-trend.tsx.
//
// DUMMY UI ONLY: all data below is hardcoded for layout/visual review.
// No API calls yet. Kept in one clearly marked block below so swapping in
// real data later is a single-place edit.

import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Card, FadeSlideIn, formatINR, SegmentedTabs } from '../ui';

// ---------------------------------------------------------------------------
// DUMMY DATA — replace with real API response later.
// ---------------------------------------------------------------------------
const PERIOD_LABEL = '01 Mar 2026 – 31 Mar 2026';

const MONTHS = [
  { label: 'Sep', collectedLakh: 2.8, collected: 280000, pending: 40000 },
  { label: 'Oct', collectedLakh: 3.1, collected: 310000, pending: 55000 },
  { label: 'Nov', collectedLakh: 3.6, collected: 360000, pending: 48000 },
  { label: 'Dec', collectedLakh: 4.2, collected: 420000, pending: 62000 },
  { label: 'Jan', collectedLakh: 4.9, collected: 490000, pending: 39000 },
  { label: 'Feb', collectedLakh: 4.1, collected: 410000, pending: 70000 },
  { label: 'Mar', collectedLakh: 4.7, collected: 470000, pending: 80000 },
];

const INSIGHTS = ['Highest collection in Jan 2026 (₹4.9L)', 'Consistent growth in last 4 months'];
// ---------------------------------------------------------------------------

type Mode = 'collection' | 'pending';

function TrendChart({ mode, selected, onSelect }: { mode: Mode; selected: number; onSelect: (i: number) => void }) {
  const { colors, spacing, typography, radius } = useTheme();
  const values = MONTHS.map((m) => (mode === 'collection' ? m.collected : m.pending));
  const max = Math.max(...values);
  const chartHeight = 96;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: chartHeight, marginTop: spacing.md }}>
      {MONTHS.map((m, i) => {
        const value = mode === 'collection' ? m.collected : m.pending;
        const isActive = i === selected;
        const barHeight = Math.max(6, (value / max) * chartHeight);
        return (
          <Pressable key={m.label} onPress={() => onSelect(i)} style={{ flex: 1, alignItems: 'center' }}>
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
  );
}

export function CollectionTrendContent() {
  const { colors, spacing, radius, typography } = useTheme();
  const [mode, setMode] = useState<Mode>('collection');
  const [selected, setSelected] = useState(MONTHS.length - 1);

  const current = MONTHS[selected];
  const prev = MONTHS[selected - 1];
  const vsPrevPct = prev ? Math.round(((current.collected - prev.collected) / prev.collected) * 1000) / 10 : null;

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
            {PERIOD_LABEL}
          </Text>
          <Ionicons name="chevron-down" size={16} color={colors.textMuted} />
        </Pressable>
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
          <TrendChart mode={mode} selected={selected} onSelect={setSelected} />
        </Card>
      </FadeSlideIn>

      <FadeSlideIn delay={120} style={{ marginTop: spacing.lg }}>
        <Card>
          <Text style={[typography.h2, { color: colors.text }]}>{current.label} 2026</Text>
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

      <FadeSlideIn delay={160} style={{ marginTop: spacing.lg }}>
        <Text style={[typography.h2, { color: colors.text, marginBottom: spacing.sm }]}>Quick Insights</Text>
        <Card>
          {INSIGHTS.map((line, i) => (
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
    </>
  );
}
