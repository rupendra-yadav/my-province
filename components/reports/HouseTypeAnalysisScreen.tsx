// components/reports/HouseTypeAnalysisScreen.tsx
// Shared House Type / Block Analysis content (Screen 3) — society-level
// aggregates only, no individual resident/payment data. Rendered by the
// single Reports route tree: app/(main)/reports/house-type-analysis.tsx.
// Both tabs (By House Type / By Block) reuse the same row component —
// same analytical shape, different grouping key.
//
// DUMMY UI ONLY: all data below is hardcoded for layout/visual review.
// No API calls yet. Kept in one clearly marked block below so swapping in
// real data later is a single-place edit.

import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { Card, FadeSlideIn, formatINR, IconBadge, SegmentedTabs } from '../ui';
import { useTheme } from '../../context/ThemeContext';

// ---------------------------------------------------------------------------
// DUMMY DATA — replace with real API response later.
// ---------------------------------------------------------------------------
type Breakdown = {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  pct: number;
  collected: number;
  pending: number;
  totalHouses: number;
  paid: number;
  partial: number;
  unpaid: number;
};

const BY_HOUSE_TYPE: Breakdown[] = [
  { key: 'CC', label: 'CC Houses', icon: 'home-outline', pct: 95, collected: 1180430, pending: 62500, totalHouses: 150, paid: 135, partial: 8, unpaid: 7 },
  { key: 'DD', label: 'DD Houses', icon: 'home-outline', pct: 88, collected: 840210, pending: 114300, totalHouses: 90, paid: 62, partial: 12, unpaid: 16 },
  { key: 'PP', label: 'PP Houses', icon: 'home-outline', pct: 82, collected: 672330, pending: 146670, totalHouses: 95, paid: 58, partial: 10, unpaid: 27 },
  { key: 'RR', label: 'RR Houses', icon: 'home-outline', pct: 78, collected: 431210, pending: 121790, totalHouses: 38, paid: 22, partial: 6, unpaid: 10 },
  { key: 'TT', label: 'TT Houses', icon: 'home-outline', pct: 72, collected: 287223, pending: 112777, totalHouses: 19, paid: 10, partial: 2, unpaid: 7 },
];

const BY_BLOCK: Breakdown[] = [
  { key: 'A', label: 'Block A', icon: 'business-outline', pct: 91, collected: 940320, pending: 92100, totalHouses: 110, paid: 98, partial: 6, unpaid: 6 },
  { key: 'B', label: 'Block B', icon: 'business-outline', pct: 86, collected: 812440, pending: 131200, totalHouses: 98, paid: 80, partial: 9, unpaid: 9 },
  { key: 'C', label: 'Block C', icon: 'business-outline', pct: 79, collected: 658100, pending: 175430, totalHouses: 104, paid: 71, partial: 13, unpaid: 20 },
  { key: 'D', label: 'Block D', icon: 'business-outline', pct: 84, collected: 1000543, pending: 160211, totalHouses: 80, paid: 63, partial: 9, unpaid: 8 },
];
// ---------------------------------------------------------------------------

type TabKey = 'houseType' | 'block';

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
  const { spacing } = useTheme();
  const [tab, setTab] = useState<TabKey>('houseType');
  const data = tab === 'houseType' ? BY_HOUSE_TYPE : BY_BLOCK;

  return (
    <>
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

      <FadeSlideIn delay={40}>
        {data.map((item) => (
          <BreakdownCard key={item.key} item={item} />
        ))}
      </FadeSlideIn>
    </>
  );
}
