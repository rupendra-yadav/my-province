// components/reports/ResidentPaymentListScreen.tsx
// Shared Resident Payment List content (Screen 4) — individual-level
// resident/payment data, admin-only in practice. Rendered by:
//   - app/(main)/reports/resident-payment-list.tsx
// That route redirects non-admins away; Reports Home also only wires the
// tiles that link here when session.isAdmin is true.
//
// DUMMY UI ONLY: data comes from components/reports/mockResidents.ts.
// No API calls yet — will be wired to a real resident/payment listing
// endpoint later; this component only reads the shared mock list.

import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { formatINR } from '../ui';
import { MOCK_RESIDENTS, ResidentPaymentRecord, ResidentPaymentStatus } from './mockResidents';

export type ResidentListFilter = 'all' | 'paid' | 'partial' | 'unpaid';

const PERIOD_LABEL = '01 Mar 2026 – 31 Mar 2026';

function StatusBadge({ status }: { status: ResidentPaymentStatus }) {
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

function ResidentCard({ item, onPress }: { item: ResidentPaymentRecord; onPress: () => void }) {
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
  onSelectResident: (id: string) => void;
}) {
  const { colors, spacing, radius, typography } = useTheme();
  const [filter, setFilter] = useState<ResidentListFilter>(initialFilter);
  const [query, setQuery] = useState('');

  const counts = useMemo(
    () => ({
      all: MOCK_RESIDENTS.length,
      paid: MOCK_RESIDENTS.filter((r) => r.status === 'paid').length,
      partial: MOCK_RESIDENTS.filter((r) => r.status === 'partial').length,
      unpaid: MOCK_RESIDENTS.filter((r) => r.status === 'unpaid').length,
    }),
    []
  );

  const filtered = useMemo(() => {
    return MOCK_RESIDENTS.filter((r) => (filter === 'all' ? true : r.status === filter)).filter((r) => {
      const q = query.trim().toLowerCase();
      if (!q) return true;
      return r.name.toLowerCase().includes(q) || r.houseCode.toLowerCase().includes(q);
    });
  }, [filter, query]);

  return (
    <View style={{ flex: 1 }}>
      <View style={{ paddingHorizontal: spacing.xl }}>
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
            {PERIOD_LABEL}
          </Text>
          <Ionicons name="chevron-down" size={16} color={colors.textMuted} />
        </Pressable>

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

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingBottom: spacing.xxxl }}
        renderItem={({ item }) => <ResidentCard item={item} onPress={() => onSelectResident(item.id)} />}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingTop: spacing.xxl }}>
            <Ionicons name="search-outline" size={26} color={colors.textMuted} />
            <Text style={[typography.body, { color: colors.textMuted, marginTop: spacing.md }]}>
              No residents match this search
            </Text>
          </View>
        }
      />
    </View>
  );
}
