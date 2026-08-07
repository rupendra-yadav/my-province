// components/reports/PaymentDetailsScreen.tsx
// Shared Payment Details content (Screen 5) — single resident's payment
// history, admin-only in practice. Rendered by:
//   - app/(main)/reports/resident/[id].tsx
// That route redirects non-admins away. Reuses TransactionHistoryCard from
// components/ui.tsx (same component the resident-facing payment screen
// would use) so the history rows match the rest of the app rather than
// introducing a new list style.
//
// DUMMY UI ONLY: data comes from components/reports/mockResidents.ts.

import React from 'react';
import { Text, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Card, FadeSlideIn, formatINR, GhostButton, IconBadge, TransactionHistoryCard } from '../ui';
import { getResidentById, ResidentPaymentStatus } from './mockResidents';

function StatusBadge({ status }: { status: ResidentPaymentStatus }) {
  const { colors, radius, spacing, typography } = useTheme();
  const map = {
    paid: { bg: colors.successBg, fg: colors.success, label: 'Paid' },
    partial: { bg: colors.warningBg, fg: colors.warning, label: 'Partial' },
    unpaid: { bg: colors.dangerBg, fg: colors.danger, label: 'Unpaid' },
  }[status];
  return (
    <View style={{ backgroundColor: map.bg, borderRadius: radius.sm, paddingHorizontal: spacing.sm + 2, paddingVertical: 3 }}>
      <Text style={[typography.tiny, { color: map.fg, letterSpacing: 0.4 }]}>{map.label.toUpperCase()}</Text>
    </View>
  );
}

function SummaryTile({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  const { colors, typography } = useTheme();
  return (
    <View style={{ flex: 1 }}>
      <Text style={[typography.tiny, { color: colors.textMuted, marginBottom: 4 }]}>{label}</Text>
      <Text style={[typography.bodyMedium, { color: valueColor ?? colors.text }]}>{value}</Text>
    </View>
  );
}

export function PaymentDetailsContent({ id, onDownloadStatement }: { id: string; onDownloadStatement?: () => void }) {
  const { colors, spacing, typography } = useTheme();
  const resident = getResidentById(id);

  if (!resident) {
    return (
      <View style={{ alignItems: 'center', paddingTop: spacing.xxxl }}>
        <Text style={[typography.body, { color: colors.textMuted }]}>Resident not found.</Text>
      </View>
    );
  }

  return (
    <>
      <FadeSlideIn>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg }}>
          <IconBadge name="home-outline" size={52} />
          <View style={{ marginLeft: spacing.md, flex: 1 }}>
            <Text style={[typography.tiny, { color: colors.textMuted, letterSpacing: 0.4 }]}>{resident.houseCode}</Text>
            <Text style={[typography.h1, { color: colors.text, marginTop: 2 }]}>{resident.name}</Text>
            <Text style={[typography.caption, { color: colors.textMuted, marginTop: 2 }]}>
              Block {resident.block} • House {resident.unit}
            </Text>
          </View>
          <StatusBadge status={resident.status} />
        </View>
      </FadeSlideIn>

      <FadeSlideIn delay={40} style={{ marginBottom: spacing.xl }}>
        <Card style={{ flexDirection: 'row' }}>
          <SummaryTile label="Monthly Due" value={formatINR(resident.monthlyDue)} />
          <SummaryTile label="Paid" value={formatINR(resident.paidThisPeriod)} />
          <SummaryTile
            label="Balance"
            value={formatINR(resident.balance)}
            valueColor={resident.balance > 0 ? colors.danger : colors.success}
          />
        </Card>
      </FadeSlideIn>

      <FadeSlideIn delay={80}>
        <Text style={[typography.h2, { color: colors.text, marginBottom: spacing.sm }]}>Payment History</Text>
        {resident.history.map((item) => (
          <TransactionHistoryCard key={item.id} item={item} />
        ))}
      </FadeSlideIn>

      <FadeSlideIn delay={120} style={{ marginTop: spacing.md }}>
        <GhostButton label="Download Statement" icon="download-outline" onPress={() => onDownloadStatement?.()} />
      </FadeSlideIn>
    </>
  );
}
