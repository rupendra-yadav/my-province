// app/(main)/reports/house-type-analysis.tsx
// Resident entry point for House Type / Block Analysis. Pushed inside the
// nested Stack (see ./_layout.tsx) so the bottom tab bar stays in place.
// Body content shared with the admin route — see
// components/reports/HouseTypeAnalysisScreen.tsx.

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { HouseTypeAnalysisContent } from '../../../components/reports/HouseTypeAnalysisScreen';
import { useTheme } from '../../../context/ThemeContext';

export default function ResidentHouseTypeAnalysisScreen() {
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
        <Text style={[typography.h2, { color: colors.text, marginLeft: spacing.md }]}>House Type Analysis</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingBottom: spacing.xxxl + 90 }}>
        <HouseTypeAnalysisContent />
      </ScrollView>
    </View>
  );
}
