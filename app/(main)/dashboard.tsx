import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ActivityIndicator, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { FadeSlideIn, formatINR } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { usePayments } from '../../context/PaymentsContext';
import { useTheme } from '../../context/ThemeContext';
import { usePullToRefresh } from '../../hooks/usePullToRefresh';

type Period = { status: string; due: number };

function sumDueByStatus(periods: Period[], paid: boolean) {
  return periods
    .filter((p) => (paid ? p.status === 'paid' : p.status !== 'paid'))
    .reduce((sum, p) => sum + p.due, 0);
}

type IconName = keyof typeof Ionicons.glyphMap;


const ACCENTS = {
  orange: { line: '#E08A4B', bg: '#FBEEE3', fg: '#C1682A' },
  green: { line: '#4CAF7D', bg: '#E7F5EE', fg: '#2E8A5B' },
  blue: { line: '#4B84D8', bg: '#E8F0FC', fg: '#2E63B0' },
  purple: { line: '#8A6FD8', bg: '#EFEAFB', fg: '#6B4FBE' },
  pink: { line: '#D8628A', bg: '#FBEAF0', fg: '#B84368' },
  teal: { line: '#3FAFA0', bg: '#E5F5F2', fg: '#268577' },
  red: { line: '#D8574B', bg: '#FBEBE9', fg: '#B93A2D' },
};
type AccentKey = keyof typeof ACCENTS;

function StatCard({
  label,
  value,
  icon,
  accent,
  highlight = false,
}: {
  label: string;
  value: number;
  icon: IconName;
  accent: AccentKey;
  highlight?: boolean;
}) {
  const { colors, spacing, typography } = useTheme();
  const a = ACCENTS[accent];

  return (
    <View
      style={{
        flexBasis: '48%',
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: spacing.lg,
        overflow: 'hidden',
        borderWidth: highlight ? 1.5 : 1,
        borderColor: highlight ? a.line : colors.border,
        borderLeftWidth: 4,
        borderLeftColor: a.line,
      }}
    >
      <Ionicons
        name={icon}
        size={72}
        color={a.line}
        style={{ position: 'absolute', right: -14, bottom: -14, opacity: 0.08 }}
      />

      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 10,
          backgroundColor: a.bg,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: spacing.sm,
        }}
      >
        <Ionicons name={icon} size={16} color={a.fg} />
      </View>
      <Text style={[typography.caption, { color: colors.textMuted }]}>{label}</Text>
      <Text style={[typography.h2, { color: highlight ? a.fg : colors.text, marginTop: spacing.sm }]}>
        {formatINR(value)}
      </Text>
    </View>
  );
}

export default function DashboardScreen() {
  const { colors, radius, spacing, typography } = useTheme();
  const { session } = useAuth();
  const payments = usePayments();
  const router = useRouter();
  const { isRefreshing, onRefresh } = usePullToRefresh(payments.refresh);


  const maintenanceDue = sumDueByStatus(payments.maintenance, false);   // payable
  const maintenancePaid = sumDueByStatus(payments.maintenance, true);   // paid

  const donationsDue = sumDueByStatus(payments.membership, false);
  const donationsPaid = sumDueByStatus(payments.membership, true);

  const totalDue = maintenanceDue + donationsDue;
  const totalPaid = maintenancePaid + donationsPaid;
  const balance = totalDue; // unpaid periods' due — already excludes paid ones

  const isAdmin = session?.isAdmin;
  const initial = (session?.user?.name?.trim()?.[0] ?? '?').toUpperCase();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingTop: spacing.xxxl, paddingBottom: spacing.xxxl + 90 }}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.textMuted} />
        }
      >
        <FadeSlideIn
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: spacing.lg,
          }}
        >
          <View>
            <Text style={[typography.h1, { color: colors.text }]}>Dashboard</Text>
            <Text style={[typography.caption, { color: colors.textMuted }]}>
              {session?.user?.name ?? ''}
              {isAdmin ? ' (admin)' : ''}
            </Text>
          </View>

          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: ACCENTS.orange.bg,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: ACCENTS.orange.fg, fontSize: 18, fontWeight: '600' }}>{initial}</Text>
          </View>
        </FadeSlideIn>

        {isAdmin && (
          <FadeSlideIn delay={160}>
            <TouchableOpacity
              onPress={() => router.push('/(admin)/requests')}
              activeOpacity={0.8}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colors.surface,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: colors.border,
                borderLeftWidth: 4,
                borderLeftColor: colors.accent,
                paddingVertical: spacing.md,
                paddingHorizontal: spacing.lg,
                marginBottom: spacing.lg,
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: radius.md,
                  backgroundColor: colors.accentMuted,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="shield-checkmark-outline" size={20} color={colors.accent} />
              </View>

              <View style={{ flex: 1, marginLeft: spacing.md }}>
                <Text style={[typography.bodyMedium, { color: colors.text }]}>Admin console</Text>
                <Text style={[typography.caption, { color: colors.textMuted, marginTop: 2 }]}>
                  Manage requests and residents
                </Text>
              </View>

              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </FadeSlideIn>
        )}

        {payments.isLoading && payments.maintenance.length === 0 ? (
          <View style={{ paddingVertical: spacing.xxxl, alignItems: 'center' }}>
            <ActivityIndicator color={colors.textMuted} />
          </View>
        ) : (
          <FadeSlideIn
            delay={100}
            style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginBottom: spacing.md }}
          >
            <StatCard label="Total payable" value={totalDue} icon="wallet-outline" accent="orange" />
            <StatCard label="Total paid" value={totalPaid} icon="checkmark-circle-outline" accent="green" />
            <StatCard label="Maintenance payable" value={maintenanceDue} icon="home-outline" accent="blue" />
            <StatCard label="Maintenance paid" value={maintenancePaid} icon="construct-outline" accent="purple" />
            <StatCard label="Membership payable" value={donationsDue} icon="card-outline" accent="pink" />
            <StatCard label="Membership paid" value={donationsPaid} icon="people-outline" accent="teal" />
            <StatCard label="Balance" value={balance} icon="alert-circle-outline" accent="red" highlight />
            <StatCard label="Donations paid" value={0} icon="gift-outline" accent="purple" /> </FadeSlideIn>
        )}
      </ScrollView>
    </View>
  );
}