// components/reports/ResidentPaymentListScreen.tsx
// Shared Resident Payment List content (Screen 4) — individual-level
// resident/payment data, admin-only in practice. Rendered by:
//   - app/(main)/reports/resident-payment-list.tsx
// That route redirects non-admins away; Reports Home also only wires the
// tiles that link here when session.isAdmin is true.
//
// Wired to GET /reports/residents. Backend accepts month/year (defaults
// to current month server-side); a MonthSelector drives it here.

import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { formatINR, MonthSelector } from '../ui';
import { ApiError } from '../../services/api';
import { getReportsResidents, ResidentPaymentRow } from '../../services/endpoints';

export type ResidentListFilter = 'all' | 'paid' | 'partial' | 'unpaid';

function StatusBadge({ status }: { status: ResidentPaymentRow['status'] }) {
  const { colors, radius, spacing, typography } = useTheme();
  const map = {
    paid: { bg: colors.successBg, fg: colors.success, label: 'Paid' },
    partial: { bg: colors.warningBg, fg: colors.warning, label: 'Partial' },
    unpaid: { bg: colors.dangerBg, fg: colors.danger, label: 'Unpaid' },
  }[status];
  return (
    <View
      style={{
        backgroundColor: map.bg,
        borderRadius: radius.sm,
        paddingHorizontal: spacing.sm + 2,
        paddingVertical: 3,
      }}
    >
      <Text style={[typography.tiny, { color: map.fg, letterSpacing: 0.4 }]}>{map.label.toUpperCase()}</Text>
    </View>
  );
}

function ResidentCard({ item, onPress }: { item: ResidentPaymentRow; onPress: () => void }) {
  const { colors, radius, spacing, typography } = useTheme();
  const paidDateLabel = item.paidDate
    ? new Date(item.paidDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : null;

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
        <StatusBadge status={item.status} />
      </View>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: spacing.md,
          paddingTop: spacing.md,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        }}
      >
        <Text style={[typography.caption, { color: colors.textMuted }]}>
          Due {formatINR(item.monthlyDue)} / month
        </Text>
        <Text style={[typography.caption, { color: item.status === 'paid' ? colors.textMuted : colors.danger }]}>
          {item.status === 'paid' ? `Paid on ${paidDateLabel}` : `${formatINR(item.balance)} pending`}
        </Text>
      </View>
    </Pressable>
  );
}

export function ResidentPaymentListContent({
  initialFilter = 'all',
  onSelectResident,
}: {
  initialFilter?: ResidentListFilter;
  onSelectResident: (unitId: number) => void;
}) {
  const { colors, spacing, radius, typography } = useTheme();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [filter, setFilter] = useState<ResidentListFilter>(initialFilter);
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
    return residents.filter((r) => (filter === 'all' ? true : r.status === filter)).filter((r) => {
      const q = query.trim().toLowerCase();
      if (!q) return true;
      return r.name.toLowerCase().includes(q) || r.houseCode.toLowerCase().includes(q);
    });
  }, [residents, filter, query]);

  return (
    <View style={{ flex: 1 }}>
      <View style={{ paddingHorizontal: spacing.xl }}>
        <View style={{ marginBottom: spacing.md }}>
          <MonthSelector month={month} year={year} onChange={(m, y) => { setMonth(m); setYear(y); }} />
        </View>

        <View
          style={{
            flexDirection: 'row',
            backgroundColor: colors.primaryMuted,
            borderRadius: radius.lg,
            padding: 4,
            marginBottom: spacing.md,
          }}
        >
          {(
            [
              { key: 'all', label: 'All', count: counts.all },
              { key: 'paid', label: 'Paid', count: counts.paid },
              { key: 'partial', label: 'Partial', count: counts.partial },
              { key: 'unpaid', label: 'Unpaid', count: counts.unpaid },
            ] as { key: ResidentListFilter; label: string; count: number }[]
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
          renderItem={({ item }) => <ResidentCard item={item} onPress={() => onSelectResident(item.unitId)} />}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingTop: spacing.xxl }}>
              <Ionicons name="search-outline" size={26} color={colors.textMuted} />
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
