// app/(main)/reports/collection-summary.tsx
// Data comes from ReportsContext — collection already includes trend and
// houseTypePerformance, so no separate fetch is needed here.
import { router } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { Card, FadeSlideIn, formatINR, MonthRangeSelector } from '../../../components/ui';
import { ProgressBar, ScreenHeader, StatGrid, TrendBarChart } from '../../../components/reports/shared';
import { useReports } from '../../../context/ReportsContext';
import { useTheme } from '../../../context/ThemeContext';

function HouseTypeRow({
  item,
  onPress,
}: {
  item: { key: string; label: string; pct: number; collected: number; pending: number };
  onPress: () => void;
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
        <Text style={[typography.tiny, { color: colors.textMuted }]}>{formatINR(item.collected)} collected</Text>
        <Text style={[typography.tiny, { color: colors.textMuted }]}>{formatINR(item.pending)} pending</Text>
      </View>
    </Pressable>
  );
}

export default function CollectionSummaryScreen() {
  const { colors, spacing, typography } = useTheme();
  const { range, setRange, collection, isLoading, error, refresh } = useReports();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="Collection Summary" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingBottom: spacing.xxxl + 90 }}>
        {isLoading && !collection ? (
          <View style={{ paddingVertical: 80, alignItems: 'center' }}>
            <ActivityIndicator color={colors.textMuted} />
          </View>
        ) : error && !collection ? (
          <View style={{ paddingVertical: 80, alignItems: 'center' }}>
            <Text style={[typography.body, { color: colors.danger, textAlign: 'center' }]}>{error}</Text>
            <Pressable onPress={refresh} style={{ marginTop: spacing.md }}>
              <Text style={[typography.caption, { color: colors.accent }]}>Retry</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <FadeSlideIn style={{ marginBottom: spacing.lg }}>
              <MonthRangeSelector value={range} onChange={setRange} />
            </FadeSlideIn>

            <FadeSlideIn delay={40}>
              <Card>
                <Text style={[typography.caption, { color: colors.textMuted }]}>Total Collection</Text>
                <Text style={[typography.display, { color: colors.text, marginTop: spacing.xs }]}>
                  {formatINR(collection!.totalCollection)}
                </Text>
                <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>
                  {collection!.collectionPct}% collected
                </Text>
                <View style={{ marginTop: spacing.md }}>
                  <ProgressBar pct={collection!.collectionPct} color={colors.success} />
                </View>
                <Text style={[typography.caption, { color: colors.danger, marginTop: spacing.md }]}>
                  {formatINR(collection!.pendingAmount)} pending
                </Text>
              </Card>
            </FadeSlideIn>

            <FadeSlideIn delay={80} style={{ marginTop: spacing.lg }}>
              <StatGrid
                rows={[
                  [
                    { label: 'Total Houses', value: String(collection!.totalHouses) },
                    { label: 'Total Due', value: formatINR(collection!.totalDue) },
                  ],
                  [
                    { label: 'Collected', value: formatINR(collection!.totalCollection) },
                    { label: 'Pending', value: formatINR(collection!.pendingAmount) },
                  ],
                  [
                    { label: 'Collection Rate', value: `${collection!.collectionRate}%` },
                    { label: 'Avg / House', value: formatINR(collection!.avgCollectionPerHouse) },
                  ],
                ]}
              />
            </FadeSlideIn>

            <FadeSlideIn delay={120} style={{ marginTop: spacing.xl }}>
              <Card>
                <Text style={[typography.h2, { color: colors.text }]}>Collection Trend</Text>
                <Text style={[typography.tiny, { color: colors.textMuted, marginTop: 2 }]}>Amount in Lakhs (₹)</Text>
                <TrendBarChart data={collection!.trend} height={72} />
              </Card>
            </FadeSlideIn>

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
                <Pressable onPress={() => router.push('/(main)/reports/house-type-analysis' as any)}>
                  <Text style={[typography.caption, { color: colors.accent }]}>View all</Text>
                </Pressable>
              </View>
              <Card style={{ padding: 0 }}>
                {collection!.houseTypePerformance.map((item, i) => (
                  <View
                    key={item.key}
                    style={{ paddingHorizontal: spacing.md, borderTopWidth: i === 0 ? 0 : 1, borderTopColor: colors.border }}
                  >
                    <HouseTypeRow item={item} onPress={() => router.push('/(main)/reports/house-type-analysis' as any)} />
                  </View>
                ))}
              </Card>
            </FadeSlideIn>
          </>
        )}
      </ScrollView>
    </View>
  );
}
