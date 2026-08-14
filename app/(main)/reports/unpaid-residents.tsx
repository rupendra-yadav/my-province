// app/(main)/reports/unpaid-residents.tsx
// Single Reports module now lives entirely under the (main) tab — this
// screen (individual resident/payment data) is admin-only in practice:
// Reports Home only surfaces the Unpaid tile that links here when
// session.isAdmin is true, and the guard below redirects a non-admin who
// reaches the URL directly. Body content lives in
// components/reports/UnpaidResidentsScreen.tsx.

import { Ionicons } from '@expo/vector-icons';
import { Redirect, router } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { UnpaidResidentsContent } from '../../../components/reports/UnpaidResidentsScreen';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';

export default function UnpaidResidentsScreen() {
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
        <Text style={[typography.h2, { color: colors.text, marginLeft: spacing.md }]}>Unpaid Residents</Text>
      </View>

      <UnpaidResidentsContent
        onSelectResident={(unitId) => router.push(`/(main)/reports/resident/${unitId}` as any)}
      />
    </View>
  );
}
