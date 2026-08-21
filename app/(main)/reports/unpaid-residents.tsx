// app/(main)/reports/unpaid-residents.tsx
// Own local fetch (same endpoint as Resident Payment List, filtered
// client-side to status !== 'paid') — single consumer, no context needed.
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { Card, formatINR, MonthSelector } from '../../../components/ui';
import { ResidentRow, ScreenHeader } from '../../../components/reports/shared';
import { useTheme } from '../../../context/ThemeContext';
import { ApiError } from '../../../services/api';
import { getReportsResidents, ResidentPaymentRow } from '../../../services/endpoints';

export default function UnpaidResidentsScreen() {
  const { colors, spacing, radius, typography } = useTheme();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
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

  const unpaidOnly = useMemo(
    () => residents.filter((r) => r.status !== 'paid').sort((a, b) => b.balance - a.balance),
    [residents]
  );

  const summary = useMemo(
    () => ({ unpaidHouses: unpaidOnly.length, totalPending: unpaidOnly.reduce((sum, r) => sum + r.balance, 0) }),
    [unpaidOnly]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return unpaidOnly;
    return unpaidOnly.filter((r) => r.name.toLowerCase().includes(q) || r.houseCode.toLowerCase().includes(q));
  }, [unpaidOnly, query]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="Unpaid Residents" onBack={() => router.back()} />

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

        <View style={{ flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md }}>
          <Card style={{ flex: 1 }}>
            <Ionicons name="home-outline" size={18} color={colors.text} />
            <Text style={[typography.h1, { color: colors.text, marginTop: spacing.sm }]}>{summary.unpaidHouses}</Text>
            <Text style={[typography.caption, { color: colors.textMuted, marginTop: 2 }]}>Unpaid Houses</Text>
          </Card>
          <Card style={{ flex: 1 }}>
            <Ionicons name="alert-circle-outline" size={18} color={colors.danger} />
            <Text style={[typography.h1, { color: colors.danger, marginTop: spacing.sm }]}>{formatINR(summary.totalPending)}</Text>
            <Text style={[typography.caption, { color: colors.textMuted, marginTop: 2 }]}>Total Pending</Text>
          </Card>
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
            <ResidentRow item={item} variant="unpaid" onPress={() => router.push(`/(main)/reports/resident/${item.unitId}` as any)} />
          )}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingTop: spacing.xxl }}>
              <Ionicons name="checkmark-done-outline" size={26} color={colors.textMuted} />
              <Text style={[typography.body, { color: colors.textMuted, marginTop: spacing.md }]}>No residents match this search</Text>
            </View>
          }
        />
      )}
    </View>
  );
}
