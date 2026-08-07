// app/(admin)/reports/collection-trend.tsx
// Admin entry point for Collection Trend Details — Stack screen with
// back-button header, consistent with the rest of the (admin) group. Body
// content is shared with the resident route — see
// components/reports/CollectionTrendScreen.tsx.

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { CollectionTrendContent } from '../../../components/reports/CollectionTrendScreen';
import { useTheme } from '../../../context/ThemeContext';

export default function AdminCollectionTrendScreen() {
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
