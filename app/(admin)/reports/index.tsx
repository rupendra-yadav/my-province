// app/(admin)/reports/index.tsx
// Admin entry point for Reports Home — Stack screen with back-button header,
// consistent with the rest of the (admin) group (see request/[id].tsx).
// Body content is shared with the resident tab route — see
// components/reports/ReportsHomeScreen.tsx for the actual screen content
// and the dummy-data note.

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { REPORTS_SOCIETY_NAME, ReportsHomeContent } from '../../../components/reports/ReportsHomeScreen';
import { useTheme } from '../../../context/ThemeContext';

export default function AdminReportsHomeScreen() {
  const { colors, spacing, typography } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: spacing.xl,
          paddingTop: spacing.xxxl,
          paddingBottom: spacing.md,
        }}
      >
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <View style={{ flex: 1, marginLeft: spacing.md }}>
          <Text style={[typography.h2, { color: colors.text }]}>Reports</Text>
          <Pressable style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
            <Text style={[typography.caption, { color: colors.textMuted }]}>{REPORTS_SOCIETY_NAME}</Text>
            <Ionicons name="chevron-down" size={14} color={colors.textMuted} style={{ marginLeft: 4 }} />
          </Pressable>
        </View>
        <Pressable hitSlop={12}>
          <Ionicons name="notifications-outline" size={21} color={colors.text} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingBottom: spacing.xxxl }}>
        <ReportsHomeContent
          onViewReport={() => router.push('/(admin)/reports/collection-summary' as any)}
          onViewTrendDetails={() => router.push('/(admin)/reports/collection-trend' as any)}
          onViewFullyPaid={() => router.push('/(admin)/reports/resident-payment-list?filter=paid' as any)}
          onViewPartial={() => router.push('/(admin)/reports/resident-payment-list?filter=partial' as any)}
          onViewUnpaid={() => router.push('/(admin)/reports/unpaid-residents' as any)}
        />
      </ScrollView>
    </View>
  );
}
