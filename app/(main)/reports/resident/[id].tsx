// app/(main)/reports/resident/[id].tsx
// Single Reports module now lives entirely under the (main) tab — this
// screen (individual resident/payment data) is admin-only in practice:
// only reachable from Resident Payment List / Unpaid Residents, which are
// themselves admin-gated. The guard below redirects a non-admin who
// reaches the URL directly. Body content lives in
// components/reports/PaymentDetailsScreen.tsx.

import { Ionicons } from '@expo/vector-icons';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { PaymentDetailsContent } from '../../../../components/reports/PaymentDetailsScreen';
import { useAuth } from '../../../../context/AuthContext';
import { useTheme } from '../../../../context/ThemeContext';

export default function PaymentDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, spacing, typography } = useTheme();
  const { session } = useAuth();

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
        <Text style={[typography.h2, { color: colors.text, marginLeft: spacing.md }]}>Payment Details</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingBottom: spacing.xxxl }}>
        <PaymentDetailsContent
          id={id}
          onDownloadStatement={() => {
            // TODO: wire once statement/PDF generation exists on the backend.
          }}
        />
      </ScrollView>
    </View>
  );
}
