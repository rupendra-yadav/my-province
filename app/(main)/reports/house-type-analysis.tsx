// app/(main)/reports/house-type-analysis.tsx
// Both tabs reuse the block/houseType breakdowns already fetched by
// ReportsContext — switching tabs just picks the other array, no new
// network call.
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { Card, FadeSlideIn, formatINR, IconBadge, MonthRangeSelector, SegmentedTabs } from '../../../components/ui';
import { ScreenHeader } from '../../../components/reports/shared';
import { useReports } from '../../../context/ReportsContext';
import { useTheme } from '../../../context/ThemeContext';
import type { HouseTypeBreakdown } from '../../../services/endpoints';

type TabKey = 'houseType' | 'block';

const TAB_ICON: Record<TabKey, 'home-outline' | 'business-outline'> = {
  houseType: 'home-outline',
  block: 'business-outline',
};

function BreakdownCard({ item, icon }: { item: HouseTypeBreakdown; icon: 'home-outline' | 'business-outline' }) {
  const { colors, spacing, typography } = useTheme();
  const pctColor = item.pct >= 90 ? colors.success : item.pct >= 80 ? colors.warning : colors.danger;

  return (
    <Card style={{ marginBottom: spacing.md }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <IconBadge name={icon} size={38} />
        <Text style={[typography.bodyMedium, { color: colors.text, marginLeft: spacing.sm, flex: 1 }]}>{item.label}</Text>
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

export default function HouseTypeAnalysisScreen() {
  const { colors, spacing, typography } = useTheme();
  const { range, setRange, blockBreakdown, houseTypeBreakdown, isLoading, error, refresh } = useReports();
  const [tab, setTab] = useState<TabKey>('houseType');
  const rows = tab === 'houseType' ? houseTypeBreakdown : blockBreakdown;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="House Type Analysis" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingBottom: spacing.xxxl + 90 }}>
        <FadeSlideIn style={{ marginBottom: spacing.md }}>
          <MonthRangeSelector value={range} onChange={setRange} />
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
            <Pressable onPress={refresh} style={{ marginTop: spacing.md }}>
              <Text style={[typography.caption, { color: colors.accent }]}>Retry</Text>
            </Pressable>
          </View>
        ) : (
          <FadeSlideIn delay={40}>
            {rows.map((item) => (
              <BreakdownCard key={item.key} item={item} icon={TAB_ICON[tab]} />
            ))}
          </FadeSlideIn>
        )}
      </ScrollView>
    </View>
  );
}
