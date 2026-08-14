// components/reports/UnpaidResidentsScreen.tsx
// Shared Unpaid Residents content (Screen 6) — individual-level payment
// data, admin-only in practice. Rendered by:
//   - app/(main)/reports/unpaid-residents.tsx
// That route redirects non-admins away. Shows residents with an
// outstanding balance (partial + unpaid). Red is used only as an accent
// (amounts/icons), not as a page-wide treatment.
//
// Wired to GET /reports/residents (same source as the Resident Payment
// List) — filtered to status !== 'paid' here, since there's no separate
// unpaid-only endpoint. Backend accepts month/year; a MonthSelector
// drives it here.

import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Card, formatINR, MonthSelector } from '../ui';
import { ApiError } from '../../services/api';
import { getReportsResidents, ResidentPaymentRow } from '../../services/endpoints';

function monthsLabel(n?: number) {
  if (!n) return '';
  return n === 1 ? '1 month pending' : `${n} months pending`;
}

function UnpaidCard({ item, onPress }: { item: ResidentPaymentRow; onPress: () => void }) {
  const { colors, radius, spacing, typography } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.lg,
        padding: spacing.lg,
        marginBottom: spacing.md,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <View style={{ flex: 1, marginRight: spacing.md }}>
          <Text style={[typography.tiny, { color: colors.textMuted, letterSpacing: 0.4 }]}>{item.houseCode}</Text>
          <Text style={[typography.bodyMedium, { color: colors.text, marginTop: 2 }]}>{item.name}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={[typography.bodyMedium, { color: colors.danger }]}>{formatINR(item.balance)}</Text>
          <Text style={[typography.tiny, { color: colors.textMuted, marginTop: 2 }]}>{monthsLabel(item.monthsPending)}</Text>
        </View>
      </View>
    </Pressable>
  );
}

export function UnpaidResidentsContent({
  onSelectResident,
}: {
  onSelectResident: (unitId: number) => void;
}) {
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
    () => ({
      unpaidHouses: unpaidOnly.length,
      totalPending: unpaidOnly.reduce((sum, r) => sum + r.balance, 0),
    }),
    [unpaidOnly]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return unpaidOnly;
    return unpaidOnly.filter((r) => r.name.toLowerCase().includes(q) || r.houseCode.toLowerCase().includes(q));
  }, [unpaidOnly, query]);

  return (
    <View style={{ flex: 1 }}>
      <View style={{ paddingHorizontal: spacing.xl }}>
        <View style={{ marginBottom: spacing.md }}>
          <MonthSelector month={month} year={year} onChange={(m, y) => { setMonth(m); setYear(y); }} />
        </View>

        <View style={{ flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md }}>
          <Card style={{ flex: 1 }}>
            <Ionicons name="home-outline" size={18} color={colors.text} />
            <Text style={[typography.h1, { color: colors.text, marginTop: spacing.sm }]}>{summary.unpaidHouses}</Text>
            <Text style={[typography.caption, { color: colors.textMuted, marginTop: 2 }]}>Unpaid Houses</Text>
          </Card>
          <Card style={{ flex: 1 }}>
            <Ionicons name="alert-circle-outline" size={18} color={colors.danger} />
            <Text style={[typography.h1, { color: colors.danger, marginTop: spacing.sm }]}>
              {formatINR(summary.totalPending)}
            </Text>
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
          renderItem={({ item }) => <UnpaidCard item={item} onPress={() => onSelectResident(item.unitId)} />}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingTop: spacing.xxl }}>
              <Ionicons name="checkmark-done-outline" size={26} color={colors.textMuted} />
              <Text style={[typography.body, { color: colors.textMuted, marginTop: spacing.md }]}>
                No residents match this search
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}
