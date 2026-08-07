// app/(main)/reports/collection-summary.tsx
// Resident entry point for Collection Summary. Pushed from Reports Home
// inside the nested Stack (see ./_layout.tsx) so the bottom tab bar stays
// in place. Body content shared with the admin route — see
// components/reports/CollectionSummaryScreen.tsx.

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { CollectionSummaryContent } from '../../../components/reports/CollectionSummaryScreen';
import { useTheme } from '../../../context/ThemeContext';

export default function ResidentCollectionSummaryScreen() {
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
        <Text style={[typography.h2, { color: colors.text, marginLeft: spacing.md }]}>Collection Summary</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingBottom: spacing.xxxl + 90 }}>
        <CollectionSummaryContent
          onViewHouseTypeAnalysis={() => router.push('/(main)/reports/house-type-analysis' as any)}
        />
      </ScrollView>
    </View>
  );
}
