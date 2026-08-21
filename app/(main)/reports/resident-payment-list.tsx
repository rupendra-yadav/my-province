// app/(main)/reports/resident-payment-list.tsx
// Own local fetch (month/year, not the range used by Home/Summary/House
// Type) — single consumer, so no context needed here.
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { MonthSelector } from '../../../components/ui';
import { ResidentRow, ScreenHeader } from '../../../components/reports/shared';
import { useTheme } from '../../../context/ThemeContext';
import { ApiError } from '../../../services/api';
import { getReportsResidents, ResidentPaymentRow } from '../../../services/endpoints';

type Filter = 'all' | 'paid' | 'partial' | 'unpaid';

export default function ResidentPaymentListScreen() {
  const { colors, spacing, radius, typography } = useTheme();
  const { filter: initialFilter } = useLocalSearchParams<{ filter?: Filter }>();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [filter, setFilter] = useState<Filter>(initialFilter ?? 'all');
  const [query, setQuery] = useState('');
  const [residents, setResidents] = useState<ResidentPaymentRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setResidents(await getReportsResidents({ month, year }));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load residents.');
    } finally {
      setIsLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    load();
  }, [load]);

  const counts = useMemo(
    () => ({
      all: residents.length,
      paid: residents.filter((r) => r.status === 'paid').length,
      partial: residents.filter((r) => r.status === 'partial').length,
      unpaid: residents.filter((r) => r.status === 'unpaid').length,
    }),
    [residents]
  );

  const filtered = useMemo(() => {
    return residents
      .filter((r) => (filter === 'all' ? true : r.status === filter))
      .filter((r) => {
        const q = query.trim().toLowerCase();
        if (!q) return true;
        return r.name.toLowerCase().includes(q) || r.houseCode.toLowerCase().includes(q);
      });
  }, [residents, filter, query]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="Resident Payment List" onBack={() => router.back()} />

      <View style={{ paddingHorizontal: spacing.xl }}>
        <View style={{ marginBottom: spacing.md }}>
          <MonthSelector
            month={month}
            year={year}
            onChange={(m, y) => {
              setMonth(m);
              setYear(y);
            }}
          />
        </View>

        <View style={{ flexDirection: 'row', backgroundColor: colors.primaryMuted, borderRadius: radius.lg, padding: 4, marginBottom: spacing.md }}>
          {(
            [
              { key: 'all', label: 'All', count: counts.all },
              { key: 'paid', label: 'Paid', count: counts.paid },
              { key: 'partial', label: 'Partial', count: counts.partial },
              { key: 'unpaid', label: 'Unpaid', count: counts.unpaid },
            ] as { key: Filter; label: string; count: number }[]
          ).map((opt) => {
            const active = opt.key === filter;
            return (
              <Pressable
                key={opt.key}
                onPress={() => setFilter(opt.key)}
                style={{
                  flex: 1,
                  alignItems: 'center',
                  paddingVertical: spacing.sm,
                  borderRadius: radius.md,
                  backgroundColor: active ? colors.surface : 'transparent',
                  borderWidth: active ? 1 : 0,
                  borderColor: colors.border,
                }}
              >
                <Text
                  style={[
                    typography.caption,
                    { color: active ? colors.text : colors.textMuted, fontWeight: active ? ('500' as const) : ('400' as const) },
                  ]}
                >
                  {opt.label} ({opt.count})
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radius.md,
            paddingHorizontal: spacing.md,
            marginBottom: spacing.md,
          }}
        >
          <Ionicons name="search-outline" size={17} color={colors.textMuted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search by name, flat no. or owner"
            placeholderTextColor={colors.textMuted}
            style={[typography.body, { flex: 1, color: colors.text, paddingVertical: spacing.md, paddingLeft: spacing.sm }]}
          />
        </View>
      </View>

      {isLoading && residents.length === 0 ? (
        <View style={{ paddingTop: spacing.xxl, alignItems: 'center' }}>
          <ActivityIndicator color={colors.textMuted} />
        </View>
      ) : error && residents.length === 0 ? (
        <View style={{ paddingTop: spacing.xxl, alignItems: 'center', paddingHorizontal: spacing.xl }}>
          <Text style={[typography.body, { color: colors.danger, textAlign: 'center' }]}>{error}</Text>
          <Pressable onPress={load} style={{ marginTop: spacing.md }}>
            <Text style={[typography.caption, { color: colors.accent }]}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingBottom: spacing.xxxl }}
          renderItem={({ item }) => (
            <ResidentRow item={item} variant="list" onPress={() => router.push(`/(main)/reports/resident/${item.unitId}` as any)} />
          )}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingTop: spacing.xxl }}>
              <Ionicons name="search-outline" size={26} color={colors.textMuted} />
              <Text style={[typography.body, { color: colors.textMuted, marginTop: spacing.md }]}>No residents match this search</Text>
            </View>
          }
        />
      )}
    </View>
  );
}
