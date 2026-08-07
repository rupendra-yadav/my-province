// app/(admin)/reports/unpaid-residents.tsx
// Admin-only entry point for Unpaid Residents — Stack screen with
// back-button header, pushed from Reports Home's Unpaid tile. Body content
// lives in components/reports/UnpaidResidentsScreen.tsx.

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { UnpaidResidentsContent } from '../../../components/reports/UnpaidResidentsScreen';
import { useTheme } from '../../../context/ThemeContext';

export default function AdminUnpaidResidentsScreen() {
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
        <Text style={[typography.h2, { color: colors.text, marginLeft: spacing.md }]}>Unpaid Residents</Text>
      </View>

      <UnpaidResidentsContent onSelectResident={(id) => router.push(`/(admin)/reports/resident/${id}` as any)} />
    </View>
  );
}
