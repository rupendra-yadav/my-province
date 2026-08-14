// app/(main)/reports/index.tsx
// The single Reports entry point — one screen for both roles. Admins and
// residents share this tab; individual-level drill-downs (Fully Paid /
// Partial / Unpaid tiles → resident lists / details) are only wired when
// session.isAdmin is true, so residents see the same aggregate-only view
// as before but there is no separate admin route tree anymore. Body
// content in components/reports/ReportsHomeScreen.tsx. Lives inside a
// nested Stack (see ./_layout.tsx) so it can push into every Reports
// screen without leaving the tab bar context.

import { router } from 'expo-router';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { ReportsHomeContent } from '../../../components/reports/ReportsHomeScreen';
import { FadeSlideIn } from '../../../components/ui';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';

export default function ReportsTabScreen() {
  const { colors, spacing, typography } = useTheme();
  const { session } = useAuth();
  const isAdmin = !!session?.isAdmin;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: spacing.xl,
          paddingTop: spacing.xxxl,
          paddingBottom: spacing.xxxl + 90, // clears the floating tab bar
        }}
      >
        <FadeSlideIn style={{ marginBottom: spacing.lg }}>
          <Text style={[typography.h1, { color: colors.text }]}>Reports</Text>
          <Text style={[typography.caption, { color: colors.textMuted, marginTop: 2 }]}>
            {session?.user?.society ?? ''}
          </Text>
        </FadeSlideIn>

        <ReportsHomeContent
          onViewReport={() => router.push('/(main)/reports/collection-summary' as any)}
          onViewTrendDetails={() => router.push('/(main)/reports/collection-trend' as any)}
          onViewFullyPaid={isAdmin ? () => router.push('/(main)/reports/resident-payment-list?filter=paid' as any) : undefined}
          onViewPartial={isAdmin ? () => router.push('/(main)/reports/resident-payment-list?filter=partial' as any) : undefined}
          onViewUnpaid={isAdmin ? () => router.push('/(main)/reports/unpaid-residents' as any) : undefined}
        />
      </ScrollView>
    </View>
  );
}
