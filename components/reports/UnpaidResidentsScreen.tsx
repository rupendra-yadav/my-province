// components/reports/UnpaidResidentsScreen.tsx
// Shared Unpaid Residents content (Screen 6) — individual-level payment
// data, admin-only in practice. Rendered by:
//   - app/(main)/reports/unpaid-residents.tsx
// That route redirects non-admins away. Shows residents with an
// outstanding balance (partial + unpaid). Red is used only as an accent
// (amounts/icons), not as a page-wide treatment.
//
// DUMMY UI ONLY: data comes from components/reports/mockResidents.ts.

import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Card, formatINR } from '../ui';
import { MOCK_RESIDENTS, ResidentPaymentRecord, UNPAID_SUMMARY } from './mockResidents';

const PERIOD_LABEL = '01 Mar 2026 – 31 Mar 2026';

function monthsLabel(n?: number) {
  if (!n) return '';
  return n === 1 ? '1 month pending' : `${n} months pending`;
}

function UnpaidCard({ item, onPress }: { item: ResidentPaymentRecord; onPress: () => void }) {
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

export function UnpaidResidentsContent({ onSelectResident }: { onSelectResident: (id: string) => void }) {
  const { colors, spacing, radius, typography } = useTheme();
  const [query, setQuery] = useState('');

  const unpaidOnly = useMemo(
    () => MOCK_RESIDENTS.filter((r) => r.status !== 'paid').sort((a, b) => b.balance - a.balance),
    []
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return unpaidOnly;
    return unpaidOnly.filter((r) => r.name.toLowerCase().includes(q) || r.houseCode.toLowerCase().includes(q));
  }, [unpaidOnly, query]);

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

        <View style={{ flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md }}>
          <Card style={{ flex: 1 }}>
            <Ionicons name="home-outline" size={18} color={colors.text} />
            <Text style={[typography.h1, { color: colors.text, marginTop: spacing.sm }]}>{UNPAID_SUMMARY.unpaidHouses}</Text>
            <Text style={[typography.caption, { color: colors.textMuted, marginTop: 2 }]}>Unpaid Houses</Text>
          </Card>
          <Card style={{ flex: 1 }}>
            <Ionicons name="alert-circle-outline" size={18} color={colors.danger} />
            <Text style={[typography.h1, { color: colors.danger, marginTop: spacing.sm }]}>
              {formatINR(UNPAID_SUMMARY.totalPending)}
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

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingBottom: spacing.xxxl }}
        renderItem={({ item }) => <UnpaidCard item={item} onPress={() => onSelectResident(item.id)} />}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingTop: spacing.xxl }}>
            <Ionicons name="checkmark-done-outline" size={26} color={colors.textMuted} />
            <Text style={[typography.body, { color: colors.textMuted, marginTop: spacing.md }]}>
              No residents match this search
            </Text>
          </View>
        }
      />
    </View>
  );
}
