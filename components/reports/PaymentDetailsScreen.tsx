// components/reports/PaymentDetailsScreen.tsx
// Shared Payment Details content (Screen 5) — single resident's payment
// history, admin-only in practice. Rendered by:
//   - app/(main)/reports/resident/[id].tsx
// That route redirects non-admins away. Reuses TransactionHistoryCard from
// components/ui.tsx (same component the resident-facing payment screen
// would use) so the history rows match the rest of the app rather than
// introducing a new list style.
//
// Wired to GET /reports/residents/:unitId (static info) and
// GET /reports/residents/:unitId/history (real trailing-12-month history,
// most recent first). Keyed by unitId — not a charge id — since a charge
// is one period's record and can't look up other months for the same
// house. The header's status/due/paid/balance come from history[0] (the
// most recent period); there's no separate "current period" call.

import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Card, FadeSlideIn, formatINR, GhostButton, IconBadge, TransactionHistoryCard } from '../ui';
import { ApiError } from '../../services/api';
import {
  getResidentDetail,
  getResidentHistory,
  ResidentDetail,
  ResidentHistoryEntry,
} from '../../services/endpoints';
import type { PaymentPeriod, PaymentStatus } from '../../context/PaymentsContext';

const STATUS_MAP: Record<ResidentHistoryEntry['status'], PaymentStatus> = {
  paid: 'paid',
  partial: 'pending',
  unpaid: 'not_paid',
};

function toPaymentPeriod(h: ResidentHistoryEntry): PaymentPeriod {
  return {
    id: h.id,
    type: 'maintenance',
    period: h.period,
    label: h.label,
    due: h.due,
    paid: h.paid,
    fine: h.fine,
    balance: h.balance,
    status: STATUS_MAP[h.status],
    paidDate: h.paidDate,
  };
}

function StatusBadge({ status }: { status: ResidentHistoryEntry['status'] }) {
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

export function PaymentDetailsContent({
  unitId,
  onDownloadStatement,
}: {
  unitId: number;
  onDownloadStatement?: () => void;
}) {
  const { colors, spacing, typography } = useTheme();
  const [detail, setDetail] = useState<ResidentDetail | null>(null);
  const [history, setHistory] = useState<ResidentHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [detailResult, historyResult] = await Promise.all([
          getResidentDetail(unitId),
          getResidentHistory(unitId),
        ]);
        if (!cancelled) {
          setDetail(detailResult);
          setHistory(historyResult);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof ApiError ? err.message : 'Could not load resident.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [unitId]);

  if (isLoading) {
    return (
      <View style={{ alignItems: 'center', paddingTop: spacing.xxxl }}>
        <ActivityIndicator color={colors.textMuted} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ alignItems: 'center', paddingTop: spacing.xxxl }}>
        <Text style={[typography.body, { color: colors.danger }]}>{error}</Text>
      </View>
    );
  }

  if (!detail) {
    return (
      <View style={{ alignItems: 'center', paddingTop: spacing.xxxl }}>
        <Text style={[typography.body, { color: colors.textMuted }]}>Resident not found.</Text>
      </View>
    );
  }

  const latest = history[0] ?? null;

  return (
    <>
      <FadeSlideIn>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg }}>
          <IconBadge name="home-outline" size={52} />
          <View style={{ marginLeft: spacing.md, flex: 1 }}>
            <Text style={[typography.tiny, { color: colors.textMuted, letterSpacing: 0.4 }]}>{detail.houseCode}</Text>
            <Text style={[typography.h1, { color: colors.text, marginTop: 2 }]}>{detail.name}</Text>
            <Text style={[typography.caption, { color: colors.textMuted, marginTop: 2 }]}>
              Block {detail.block} • House {detail.unit}
            </Text>
          </View>
          {latest && <StatusBadge status={latest.status} />}
        </View>
      </FadeSlideIn>

      {latest && (
        <FadeSlideIn delay={40} style={{ marginBottom: spacing.xl }}>
          <Card style={{ flexDirection: 'row' }}>
            <SummaryTile label="Monthly Due" value={formatINR(latest.due)} />
            <SummaryTile label="Paid" value={formatINR(latest.paid)} />
            <SummaryTile
              label="Balance"
              value={formatINR(latest.balance)}
              valueColor={latest.balance > 0 ? colors.danger : colors.success}
            />
          </Card>
        </FadeSlideIn>
      )}

      <FadeSlideIn delay={80}>
        <Text style={[typography.h2, { color: colors.text, marginBottom: spacing.sm }]}>Payment History</Text>
        {history.length === 0 ? (
          <Text style={[typography.body, { color: colors.textMuted }]}>No charges recorded yet.</Text>
        ) : (
          history.map((item) => <TransactionHistoryCard key={item.id} item={toPaymentPeriod(item)} />)
        )}
      </FadeSlideIn>

      <FadeSlideIn delay={120} style={{ marginTop: spacing.md }}>
        <GhostButton label="Download Statement" icon="download-outline" onPress={() => onDownloadStatement?.()} />
      </FadeSlideIn>
    </>
  );
}
