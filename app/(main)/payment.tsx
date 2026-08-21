import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { CheckoutOutcome, EasebuzzCheckout } from '../../components/payments/EasebuzzCheckout';
import { FadeSlideIn, SegmentedTabs, formatINR } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { PaymentPeriod, usePayments } from '../../context/PaymentsContext';
import { useTheme } from '../../context/ThemeContext';
import { usePullToRefresh } from '../../hooks/usePullToRefresh';
import { ApiError } from '../../services/api';

function currentPeriodKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

const ACCENTS = {
  orange: { line: '#E08A4B', bg: '#FBEEE3', fg: '#C1682A' },
  green: { line: '#4CAF7D', bg: '#E7F5EE', fg: '#2E8A5B' },
  blue: { line: '#4B84D8', bg: '#E8F0FC', fg: '#2E63B0' },
  purple: { line: '#8A6FD8', bg: '#EFEAFB', fg: '#6B4FBE' },
  pink: { line: '#D8628A', bg: '#FBEAF0', fg: '#B84368' },
  teal: { line: '#3FAFA0', bg: '#E5F5F2', fg: '#268577' },
  red: { line: '#D8574B', bg: '#FBEBE9', fg: '#B93A2D' },
};
const SUCCESS = ACCENTS.green;

function MonthCard({
  item,
  isPayable,
  submitting,
  onPay,
}: {
  item: PaymentPeriod;
  isPayable: boolean;
  submitting: boolean;
  onPay: () => void;
}) {
  const { colors, radius, spacing, typography } = useTheme();
  const [showComingSoon, setShowComingSoon] = useState(false);
  const isPaid = item.status === 'paid';
  const locked = !isPaid && !isPayable;
  const balance = item.due + item.fine - item.paid;
  const overdue = item.period < currentPeriodKey();

  const badge = isPaid
    ? { label: 'Paid', bg: SUCCESS.bg, text: SUCCESS.fg }
    : isPayable
      ? overdue
        ? { label: 'Overdue', bg: ACCENTS.red.bg, text: ACCENTS.red.fg }
        : { label: 'Due', bg: ACCENTS.orange.bg, text: ACCENTS.orange.fg }
      : { label: 'Pending', bg: ACCENTS.purple.bg, text: ACCENTS.purple.fg };

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderWidth: isPayable ? 1.5 : 1,
        borderColor: isPaid
          ? SUCCESS.line
          : isPayable
            ? overdue
              ? ACCENTS.red.line
              : ACCENTS.orange.line
            : colors.border,
        borderRadius: radius.lg,
        padding: spacing.lg,
        marginBottom: spacing.md,
        opacity: locked ? 0.55 : 1,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
        <Text style={[typography.bodyMedium, { color: colors.text }]}>{item.label}</Text>
        <View style={{ backgroundColor: badge.bg, borderRadius: radius.md, paddingHorizontal: spacing.sm, paddingVertical: 3 }}>
          <Text style={[typography.tiny, { color: badge.text, fontWeight: '500' as const }]}>{badge.label}</Text>
        </View>
      </View>

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingTop: spacing.sm,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          marginBottom: spacing.md,
        }}
      >
        <View>
          <Text style={[typography.tiny, { color: colors.textMuted }]}>Due</Text>
          <Text style={[typography.caption, { color: colors.text }]}>{formatINR(item.due)}</Text>
        </View>
        <View>
          <Text style={[typography.tiny, { color: colors.textMuted }]}>Paid</Text>
          <Text style={[typography.caption, { color: colors.text }]}>{formatINR(item.paid)}</Text>
        </View>
        <View>
          <Text style={[typography.tiny, { color: colors.textMuted }]}>Fine</Text>
          <Text style={[typography.caption, { color: colors.text }]}>{formatINR(item.fine)}</Text>
        </View>
        <View>
          <Text style={[typography.tiny, { color: colors.textMuted }]}>Balance</Text>
          <Text style={[typography.caption, { color: colors.text }]}>{formatINR(Math.max(0, balance))}</Text>
        </View>
      </View>

      {isPaid ? (
        <View style={{ backgroundColor: SUCCESS.bg, borderRadius: radius.md, padding: spacing.sm, borderWidth: 1, borderColor: SUCCESS.line }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="checkmark-circle-outline" size={14} color={SUCCESS.fg} />
            <Text style={[typography.caption, { color: SUCCESS.fg, marginLeft: 6, fontWeight: '500' as const }]}>
              Payment completed
            </Text>
          </View>
          <Text style={[typography.tiny, { color: SUCCESS.fg, marginTop: 2 }]}>
            Paid {formatINR(item.paid)}
            {item.paidDate ? ` on ${new Date(item.paidDate).toLocaleDateString()}` : ''}
          </Text>
        </View>
      ) : isPayable ? (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: overdue ? ACCENTS.red.fg : ACCENTS.orange.fg,
            borderRadius: radius.md,
            paddingVertical: spacing.sm,
            opacity: submitting ? 0.6 : 1,
          }}
          //TODO: fix this
          // onTouchEnd={submitting ? undefined : onPay}
          onTouchEnd={submitting ? undefined : () => setShowComingSoon(true)}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Ionicons name="card-outline" size={16} color="#fff" />
              <Text style={[typography.caption, { color: '#fff', marginLeft: 8, fontWeight: '500' as const }]}>
                Pay {formatINR(balance)} for {item.label}
              </Text>
            </>
          )}
        </View>
      ) : (
        <View style={{ backgroundColor: ACCENTS.purple.bg, borderRadius: radius.md, paddingVertical: spacing.sm, alignItems: 'center' }}>
          <Text style={[typography.tiny, { color: ACCENTS.purple.fg }]}>Pay earlier dues first</Text>
        </View>
      )}

      <Modal visible={showComingSoon} transparent animationType="fade" onRequestClose={() => setShowComingSoon(false)}>
        <Pressable
          onPress={() => setShowComingSoon(false)}
          style={{ flex: 1, backgroundColor: '#0006', alignItems: 'center', justifyContent: 'center', padding: spacing.xl }}
        >
          <Pressable
            onPress={() => { }}
            style={{ backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.xl, width: '100%', alignItems: 'center' }}
          >
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: radius.pill,
                backgroundColor: ACCENTS.blue.bg,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: spacing.md,
              }}
            >
              <Ionicons name="time-outline" size={28} color={ACCENTS.blue.fg} />
            </View>
            <Text style={[typography.bodyMedium, { color: colors.text, textAlign: 'center' }]}>
              Online payments coming soon
            </Text>
            <Text style={[typography.caption, { color: colors.textMuted, textAlign: 'center', marginTop: spacing.sm }]}>
              Please contact your society admin to make this payment for now.
            </Text>
            <View
              style={{
                backgroundColor: ACCENTS.blue.fg,
                borderRadius: radius.md,
                paddingVertical: spacing.sm,
                paddingHorizontal: spacing.xl,
                marginTop: spacing.lg,
              }}
              onTouchEnd={() => setShowComingSoon(false)}
            >
              <Text style={[typography.caption, { color: '#fff', fontWeight: '500' as const }]}>Got it</Text>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

export default function PaymentScreen() {
  const { colors, spacing, radius, typography } = useTheme();
  const { session } = useAuth();
  const payments = usePayments();
  const { isRefreshing, onRefresh } = usePullToRefresh(payments.refresh);
  const [activeTab, setActiveTab] = useState<'maintenance' | 'membership'>('maintenance');
  const [payingId, setPayingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  // Checkout modal state — set once pay() successfully starts a gateway
  // transaction, cleared once the WebView reports an outcome.
  const [checkout, setCheckout] = useState<{ id: string; payUrl: string } | null>(null);
  const [confirming, setConfirming] = useState(false);



  const activePeriods = activeTab === 'maintenance' ? payments.maintenance : payments.membership;
  const unpaid = activePeriods.filter((p) => p.status !== 'paid');
  const payableId = unpaid.length
    ? unpaid.reduce((oldest, p) => (p.period < oldest.period ? p : oldest)).id
    : null;

  const sorted = useMemo(
    () => [...activePeriods].sort((a, b) => b.period.localeCompare(a.period)),
    [activePeriods]
  );

  const paidCount = activePeriods.filter((p) => p.status === 'paid').length;
  const pendingCount = activePeriods.length - paidCount;
  const totalDue = unpaid.reduce((sum, p) => sum + p.due + p.fine - p.paid, 0);
  const payablePeriod = activePeriods.find((p) => p.id === payableId);

  const u = session?.user;

  const houseNumber = u?.flat ?? '—';
  const ownerName = u?.name ?? '—';
  const houseType = u?.block ?? '—';
  const monthlyDue = payablePeriod?.due ?? sorted[0]?.due ?? 0;

  const handlePay = async (id: string) => {
    setPayingId(id);
    setError('');
    try {
      const { payUrl } = await payments.pay(id);
      setCheckout({ id, payUrl });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Payment could not be started. Please try again.');
    } finally {
      setPayingId(null);
    }
  };

  const handleCheckoutClose = async (outcome: CheckoutOutcome) => {
    const id = checkout?.id;
    setCheckout(null);
    if (!id || outcome === 'cancelled') return;

    setConfirming(true);
    try {
      await payments.confirmPayment(id);
    } finally {
      setConfirming(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ paddingHorizontal: spacing.xl, paddingTop: spacing.xxxl, paddingBottom: spacing.md }}>
        <Text style={[typography.h1, { color: colors.text }]}>Payments</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingBottom: spacing.xxxl + 90 }}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.textMuted} />}
      >
        <FadeSlideIn style={{ marginBottom: spacing.lg }}>
          <SegmentedTabs
            options={[
              { key: 'maintenance', label: 'Maintenance', count: payments.maintenance.length },
              { key: 'membership', label: 'Membership', count: payments.membership.length },
            ]}
            value={activeTab}
            onChange={(k) => setActiveTab(k as 'maintenance' | 'membership')}
          />
        </FadeSlideIn>

        <FadeSlideIn delay={40}>
          <View
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: radius.lg,
              padding: spacing.lg,
              marginBottom: spacing.md,
              flexDirection: 'row',
              flexWrap: 'wrap',
            }}
          >
            <View style={{ width: '50%', marginBottom: spacing.sm }}>
              <Text style={[typography.tiny, { color: colors.textMuted }]}>House number</Text>
              <Text style={[typography.caption, { color: colors.text, fontWeight: '500' as const }]}>{houseNumber}</Text>
            </View>
            <View style={{ width: '50%', marginBottom: spacing.sm }}>
              <Text style={[typography.tiny, { color: colors.textMuted }]}>Owner name</Text>
              <Text style={[typography.caption, { color: colors.text, fontWeight: '500' as const }]}>{ownerName}</Text>
            </View>
            <View style={{ width: '50%' }}>
              <Text style={[typography.tiny, { color: colors.textMuted }]}>House type</Text>
              <Text style={[typography.caption, { color: colors.text, fontWeight: '500' as const }]}>{houseType}</Text>
            </View>
            <View style={{ width: '50%' }}>
              <Text style={[typography.tiny, { color: colors.textMuted }]}>Monthly due</Text>
              <Text style={[typography.caption, { color: colors.text, fontWeight: '500' as const }]}>{formatINR(monthlyDue)}</Text>
            </View>
          </View>
        </FadeSlideIn>

        {pendingCount > 0 && (
          <FadeSlideIn delay={80}>
            <View
              style={{
                backgroundColor: '#B4530920',
                borderWidth: 1,
                borderColor: '#B4530955',
                borderRadius: radius.lg,
                padding: spacing.lg,
                marginBottom: spacing.md,
                flexDirection: 'row',
              }}
            >
              <Ionicons name="warning-outline" size={18} color="#B45309" style={{ marginRight: spacing.sm }} />
              <View style={{ flex: 1 }}>
                <Text style={[typography.caption, { color: '#B45309', fontWeight: '500' as const }]}>
                  Advance payment not available
                </Text>
                <Text style={[typography.tiny, { color: '#B45309', marginTop: 2 }]}>
                  Complete this month's payment to unlock advance payment.
                </Text>
              </View>
            </View>
          </FadeSlideIn>
        )}

        <FadeSlideIn delay={120}>
          <View
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: radius.lg,
              padding: spacing.lg,
              marginBottom: spacing.xl,
            }}
          >
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.sm }}>
              <View style={{ width: '50%', alignItems: 'center', marginBottom: spacing.sm }}>
                <Text style={[typography.h2, { color: colors.text }]}>{activePeriods.length}</Text>
                <Text style={[typography.tiny, { color: colors.textMuted }]}>Total months</Text>
              </View>
              <View style={{ width: '50%', alignItems: 'center', marginBottom: spacing.sm }}>
                <Text style={[typography.h2, { color: colors.success }]}>{paidCount}</Text>
                <Text style={[typography.tiny, { color: colors.textMuted }]}>Paid</Text>
              </View>
              <View style={{ width: '50%', alignItems: 'center' }}>
                <Text style={[typography.h2, { color: colors.danger }]}>{pendingCount}</Text>
                <Text style={[typography.tiny, { color: colors.textMuted }]}>Pending</Text>
              </View>
              <View style={{ width: '50%', alignItems: 'center' }}>
                <Text style={[typography.h2, { color: colors.textMuted }]}>0</Text>
                <Text style={[typography.tiny, { color: colors.textMuted }]}>Available</Text>
              </View>
            </View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingTop: spacing.sm,
                borderTopWidth: 1,
                borderTopColor: colors.border,
              }}
            >
              <Text style={[typography.caption, { color: colors.textMuted }]}>Total due</Text>
              <Text style={[typography.bodyMedium, { color: colors.text }]}>{formatINR(totalDue)}</Text>
            </View>
          </View>
        </FadeSlideIn>

        <FadeSlideIn delay={160}>
          <Text style={[typography.bodyMedium, { color: colors.text, marginBottom: spacing.md }]}>Payment history</Text>
        </FadeSlideIn>

        {!!error && (
          <Text style={[typography.caption, { color: colors.danger, marginBottom: spacing.md }]}>{error}</Text>
        )}

        {confirming && (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md }}>
            <ActivityIndicator size="small" color={colors.accent} />
            <Text style={[typography.tiny, { color: colors.textMuted, marginLeft: spacing.sm }]}>
              Confirming payment...
            </Text>
          </View>
        )}

        {sorted.length === 0 ? (
          <Text style={[typography.body, { color: colors.textMuted, paddingVertical: spacing.lg }]}>
            No {activeTab} charges yet.
          </Text>
        ) : (
          sorted.map((item) => (
            <MonthCard
              key={item.id}
              item={item}
              isPayable={item.id === payableId}
              submitting={payingId === item.id}
              onPay={() => handlePay(item.id)}
            />
          ))
        )}
      </ScrollView>

      <EasebuzzCheckout
        visible={!!checkout}
        payUrl={checkout?.payUrl ?? null}
        onClose={handleCheckoutClose}
      />
    </View>
  );
}