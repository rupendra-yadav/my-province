// app/(main)/reports/collection-trend.tsx
// Resident-facing Collection Trend Details — society-level aggregates
// only, safe alongside Screens 1-3 on this tab. Lives inside the nested
// Stack (see ./_layout.tsx), pushed from Reports Home's "View details"
// link. Body content shared with the admin route via
// components/reports/CollectionTrendScreen.tsx.

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { CollectionTrendContent } from '../../../components/reports/CollectionTrendScreen';
import { useTheme } from '../../../context/ThemeContext';

export default function ReportsTrendScreen() {
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
        <Text style={[typography.h2, { color: colors.text, marginLeft: spacing.md }]}>Collection Trend</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingBottom: spacing.xxxl }}>
        <CollectionTrendContent />
      </ScrollView>
    </View>
  );
}
