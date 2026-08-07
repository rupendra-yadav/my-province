// app/(admin)/reports/resident/[id].tsx
// Admin-only entry point for Payment Details — Stack screen with
// back-button header, pushed from Resident Payment List or Unpaid
// Residents. Body content lives in
// components/reports/PaymentDetailsScreen.tsx.

import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { PaymentDetailsContent } from '../../../../components/reports/PaymentDetailsScreen';
import { useTheme } from '../../../../context/ThemeContext';

export default function AdminPaymentDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
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
