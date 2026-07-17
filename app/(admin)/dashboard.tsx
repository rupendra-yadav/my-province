// app/(admin)/dashboard.tsx
import React, { useMemo, useState } from 'react';
import { View, Text, FlatList, TextInput, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { useRequests, ResidentRequest } from '../../context/RequestsContext';
import { FadeSlideIn, StatusChip, SegmentedTabs } from '../../components/ui';

type Filter = 'all' | 'pending' | 'approved' | 'rejected';

function timeAgo(iso: string) {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
}

function RequestCard({ item, onPress }: { item: ResidentRequest; onPress: () => void }) {
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
          <Text style={[typography.bodyMedium, { color: colors.text }]}>{item.name}</Text>
          <Text style={[typography.caption, { color: colors.textMuted, marginTop: 3 }]}>
            {item.society} · {item.block} · {item.flat}
          </Text>
        </View>
        <StatusChip status={item.status} />
      </View>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginTop: spacing.md,
          paddingTop: spacing.md,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        }}
      >
        <Ionicons name={item.residentType === 'Owner' ? 'key-outline' : 'people-outline'} size={14} color={colors.textMuted} />
        <Text style={[typography.tiny, { color: colors.textMuted, marginLeft: 5 }]}>{item.residentType}</Text>
        <Text style={[typography.tiny, { color: colors.textMuted, marginHorizontal: 6 }]}>·</Text>
        <Ionicons name="time-outline" size={14} color={colors.textMuted} />
        <Text style={[typography.tiny, { color: colors.textMuted, marginLeft: 5 }]}>{timeAgo(item.submittedAt)}</Text>
        <View style={{ flex: 1 }} />
        <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
      </View>
    </Pressable>
  );
}

export default function AdminDashboard() {
  const { colors, spacing, radius, typography } = useTheme();
  const { requests } = useRequests();
  const [filter, setFilter] = useState<Filter>('pending');
  const [query, setQuery] = useState('');

  const counts = useMemo(
    () => ({
      all: requests.length,
      pending: requests.filter((r) => r.status === 'pending').length,
      approved: requests.filter((r) => r.status === 'approved').length,
      rejected: requests.filter((r) => r.status === 'rejected').length,
    }),
    [requests]
  );

  const filtered = useMemo(() => {
    return requests
      .filter((r) => (filter === 'all' ? true : r.status === filter))
      .filter((r) => {
        const q = query.trim().toLowerCase();
        if (!q) return true;
        return (
          r.name.toLowerCase().includes(q) ||
          r.society.toLowerCase().includes(q) ||
          r.flat.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  }, [requests, filter, query]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ paddingHorizontal: spacing.xl, paddingTop: spacing.xxxl }}>
        <FadeSlideIn>
          <Text style={[typography.h1, { color: colors.text }]}>Requests</Text>
          <Text style={[typography.body, { color: colors.textMuted, marginTop: spacing.xs }]}>
            {counts.pending} awaiting your review
          </Text>
        </FadeSlideIn>

        <FadeSlideIn delay={80} style={{ marginTop: spacing.lg }}>
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
              placeholder="Search by name, society, or flat"
              placeholderTextColor={colors.textMuted}
              style={[
                typography.body,
                { flex: 1, color: colors.text, paddingVertical: spacing.md, paddingLeft: spacing.sm },
              ]}
            />
          </View>

          <SegmentedTabs
            value={filter}
            onChange={setFilter}
            options={[
              { key: 'pending', label: 'Pending', count: counts.pending },
              { key: 'approved', label: 'Approved', count: counts.approved },
              { key: 'rejected', label: 'Rejected', count: counts.rejected },
              { key: 'all', label: 'All', count: counts.all },
            ]}
          />
        </FadeSlideIn>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.xxxl }}
        renderItem={({ item, index }) => (
          <FadeSlideIn delay={Math.min(index, 6) * 30}>
            <RequestCard item={item} onPress={() => router.push(`/(admin)/request/${item.id}`)} />
          </FadeSlideIn>
        )}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingTop: spacing.xxxl }}>
            <Ionicons name="checkmark-done-outline" size={28} color={colors.textMuted} />
            <Text style={[typography.body, { color: colors.textMuted, marginTop: spacing.md }]}>
              Nothing here right now
            </Text>
          </View>
        }
      />
    </View>
  );
}
