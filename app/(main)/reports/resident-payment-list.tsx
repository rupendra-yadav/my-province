// app/(main)/reports/resident-payment-list.tsx
// Single Reports module now lives entirely under the (main) tab — this
// screen (individual resident/payment data) is admin-only in practice:
// Reports Home only surfaces the tiles that link here when session.isAdmin
// is true, and the guard below redirects a non-admin who reaches the URL
// directly. Accepts an optional ?filter= param so Reports Home's Fully
// Paid / Partial Paid tiles can deep-link straight into a filtered view.
// Body content lives in components/reports/ResidentPaymentListScreen.tsx.

import { Ionicons } from '@expo/vector-icons';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { ResidentListFilter, ResidentPaymentListContent } from '../../../components/reports/ResidentPaymentListScreen';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';

export default function ResidentPaymentListScreen() {
  const { colors, spacing, typography } = useTheme();
  const { session } = useAuth();
  const { filter } = useLocalSearchParams<{ filter?: ResidentListFilter }>();

  if (!session?.isAdmin) {
    return <Redirect href="/(main)/reports" />;
  }

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
        <Text style={[typography.h2, { color: colors.text, marginLeft: spacing.md }]}>Resident Payment List</Text>
      </View>

      <ResidentPaymentListContent
        initialFilter={filter ?? 'all'}
        onSelectResident={(id) => router.push(`/(main)/reports/resident/${id}` as any)}
      />
    </View>
  );
}
