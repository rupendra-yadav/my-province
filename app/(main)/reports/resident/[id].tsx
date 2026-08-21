// app/(main)/reports/resident/[id].tsx
// Admin-only in practice — only reachable from Resident Payment List /
// Unpaid Residents, which are themselves admin-gated. Guard below
// redirects a non-admin who reaches the URL directly. Own local fetch,
// unrelated to the range-based ReportsContext.
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { Card, FadeSlideIn, formatINR, GhostButton, IconBadge, TransactionHistoryCard } from '../../../../components/ui';
import { ScreenHeader, StatusBadge } from '../../../../components/reports/shared';
import { useAuth } from '../../../../context/AuthContext';
import { useTheme } from '../../../../context/ThemeContext';
import { ApiError } from '../../../../services/api';
import { getResidentDetail, getResidentHistory, ResidentDetail, ResidentHistoryEntry } from '../../../../services/endpoints';
import type { PaymentPeriod, PaymentStatus } from '../../../../context/PaymentsContext';

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

function SummaryTile({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  const { colors, typography } = useTheme();
  return (
    <View style={{ flex: 1 }}>
      <Text style={[typography.tiny, { color: colors.textMuted, marginBottom: 4 }]}>{label}</Text>
      <Text style={[typography.bodyMedium, { color: valueColor ?? colors.text }]}>{value}</Text>
    </View>
  );
}

export default function PaymentDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, spacing, typography } = useTheme();
  const { session } = useAuth();

  const [detail, setDetail] = useState<ResidentDetail | null>(null);
  const [history, setHistory] = useState<ResidentHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.isAdmin) return;
    let cancelled = false;
    const unitId = Number(id);
    (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [detailResult, historyResult] = await Promise.all([getResidentDetail(unitId), getResidentHistory(unitId)]);
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
  }, [id, session?.isAdmin]);

  if (!session?.isAdmin) {
    return <Redirect href="/(main)/reports" />;
  }

  const latest = history[0] ?? null;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="Payment Details" onBack={() => router.back()} />

      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingBottom: spacing.xxxl }}>
        {isLoading ? (
          <View style={{ alignItems: 'center', paddingTop: spacing.xxxl }}>
            <ActivityIndicator color={colors.textMuted} />
          </View>
        ) : error ? (
          <View style={{ alignItems: 'center', paddingTop: spacing.xxxl }}>
            <Text style={[typography.body, { color: colors.danger }]}>{error}</Text>
          </View>
        ) : !detail ? (
          <View style={{ alignItems: 'center', paddingTop: spacing.xxxl }}>
            <Text style={[typography.body, { color: colors.textMuted }]}>Resident not found.</Text>
          </View>
        ) : (
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
              <GhostButton
                label="Download Statement"
                icon="download-outline"
                onPress={() => {
                  // TODO: wire once statement/PDF generation exists on the backend.
                }}
              />
            </FadeSlideIn>
          </>
        )}
      </ScrollView>
    </View>
  );
}
