import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ActivityIndicator, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { FadeSlideIn, formatINR } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { usePayments } from '../../context/PaymentsContext';
import { useTheme } from '../../context/ThemeContext';

type Period = { status: string; due: number; paid: number; fine: number };
type IconName = keyof typeof Ionicons.glyphMap;

function sumDue(periods: Period[]) {
  return periods.reduce((sum, p) => sum + p.due + p.fine, 0);
}
function sumPaid(periods: Period[]) {
  return periods.reduce((sum, p) => sum + p.paid, 0);
}

function StatCard({
  label,
  value,
  icon,
  emphasis = 'default',
}: {
  label: string;
  value: number;
  icon: IconName;
  emphasis?: 'default' | 'strong' | 'accent';
}) {
  const { colors, radius, spacing, typography } = useTheme();

  const bg = emphasis === 'strong' ? colors.text : colors.surface;
  const border = emphasis === 'accent' ? colors.danger : colors.border;
  const labelColor = emphasis === 'strong' ? colors.background : colors.textMuted;
  const valueColor =
    emphasis === 'strong' ? colors.background : emphasis === 'accent' ? colors.danger : colors.text;
  const iconBg =
    emphasis === 'strong'
      ? 'rgba(255,255,255,0.12)'
      : emphasis === 'accent'
      ? colors.danger
      : colors.primaryMuted;
  const iconColor = emphasis === 'strong' ? colors.background : emphasis === 'accent' ? colors.background : colors.danger;

  return (
    <View
      style={{
        flexBasis: '48%',
        backgroundColor: bg,
        borderWidth: emphasis === 'strong' ? 0 : 1,
        borderColor: border,
        borderRadius: radius.lg,
        padding: spacing.lg,
      }}
    >
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: radius.md,
          backgroundColor: iconBg,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: spacing.sm,
        }}
      >
        <Ionicons name={icon} size={16} color={iconColor} />
      </View>
      <Text style={[typography.caption, { color: labelColor }]}>{label}</Text>
      <Text style={[typography.h2, { color: valueColor, marginTop: spacing.sm }]}>{formatINR(value)}</Text>
    </View>
  );
}

export default function DashboardScreen() {
  const { colors, radius, spacing, typography } = useTheme();
  const { session } = useAuth();
  const payments = usePayments();
  const router = useRouter();

  const maintenanceDue = sumDue(payments.maintenance);
  const maintenancePaid = sumPaid(payments.maintenance);
  const donationsDue = sumDue(payments.membership);
  const donationsPaid = sumPaid(payments.membership);

  const totalDue = maintenanceDue + donationsDue;
  const totalPaid = maintenancePaid + donationsPaid;
  const balance = Math.max(0, totalDue - totalPaid);

  const isAdmin = session?.isAdmin;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingTop: spacing.xxxl, paddingBottom: spacing.xxxl + 90 }}
        refreshControl={
          <RefreshControl refreshing={payments.isLoading} onRefresh={payments.refresh} tintColor={colors.textMuted} />
        }
      >
        <FadeSlideIn
          style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg }}
        >
          
          <View>
            <Text style={[typography.h1, { color: colors.text, marginTop: 2 }]}>Dashboard</Text>
            <Text style={[typography.caption, { color: colors.textMuted }]}>{session?.user?.name ?? ''}</Text>
          </View>
        </FadeSlideIn>


        {isAdmin && (
          <FadeSlideIn delay={160}>
            <TouchableOpacity
              onPress={() => router.push('/(admin)/dashboard')}
              activeOpacity={0.8}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colors.text,
                borderRadius: 16,
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
                  backgroundColor: 'rgba(255,255,255,0.12)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="shield-checkmark-outline" size={20} color={colors.background} />
              </View>

            <View style={{ flex: 1, marginLeft: spacing.md }}>
              <Text style={[typography.bodyMedium, { color: colors.background }]}>Admin console</Text>
              <Text style={[typography.caption, { color: 'rgba(255,255,255,0.65)', marginTop: 2 }]}>
                Manage requests and residents
              </Text>
            </View>

            <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.65)" />
          </TouchableOpacity>
        </FadeSlideIn>)}

        {payments.isLoading && payments.maintenance.length === 0 ? (
          <View style={{ paddingVertical: spacing.xxxl, alignItems: 'center' }}>
            <ActivityIndicator color={colors.textMuted} />
          </View>
        ) : (
          <FadeSlideIn
            delay={100}
            style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginBottom: spacing.md }}
          >
            <StatCard label="Total payable" value={totalDue} icon="wallet-outline" />
            <StatCard label="Total paid" value={totalPaid} icon="checkmark-circle-outline" />
            <StatCard label="Maintenance payable" value={maintenanceDue} icon="home-outline" />
            <StatCard label="Maintenance paid" value={maintenancePaid} icon="construct-outline" />
            <StatCard label="Membership payable" value={donationsDue} icon="heart-outline" />
            <StatCard label="Membership paid" value={donationsPaid} icon="heart-outline" />
            <StatCard label="Balance" value={balance} icon="alert-circle-outline" emphasis="accent" />
            <StatCard label="Donations paid" value={donationsPaid} icon="heart-outline" />
          </FadeSlideIn>
        )}
      </ScrollView>
    </View>
  );
}