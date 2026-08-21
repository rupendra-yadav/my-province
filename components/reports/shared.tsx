// components/reports/shared.tsx
// Everything reused by 2+ report pages lives here: bar/progress
// primitives, stat grid, status badge, the resident list row (used by
// both Resident Payment List and Unpaid Residents via `variant`), and
// the back-button header every report page starts with.
import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';
import { Card, formatINR } from '../ui';
import { useTheme } from '../../context/ThemeContext';

export function ScreenHeader({ title, onBack }: { title: string; onBack: () => void }) {
  const { colors, spacing, typography } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.xl,
        paddingTop: spacing.xxxl,
        paddingBottom: spacing.md,
      }}
    >
      <Pressable onPress={onBack} hitSlop={12}>
        <Ionicons name="arrow-back" size={22} color={colors.text} />
      </Pressable>
      <Text style={[typography.h2, { color: colors.text, marginLeft: spacing.md }]}>{title}</Text>
    </View>
  );
}

export function ProgressBar({ pct, color }: { pct: number; color?: string }) {
  const { colors, radius } = useTheme();
  const clamped = Math.max(0, Math.min(100, pct));
  return (
    <View style={{ height: 6, borderRadius: radius.pill, backgroundColor: colors.border, overflow: 'hidden' }}>
      <View
        style={{
          width: `${clamped}%`,
          height: '100%',
          borderRadius: radius.pill,
          backgroundColor: color ?? colors.success,
        }}
      />
    </View>
  );
}

export function TrendBarChart({
  data,
  height = 64,
}: {
  data: { label: string; valueLakh: number }[];
  height?: number;
}) {
  const { colors, spacing, typography, radius } = useTheme();
  const max = Math.max(1, ...data.map((d) => d.valueLakh));
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', height, marginTop: spacing.md }}>
      {data.map((d, i) => {
        const isLast = i === data.length - 1;
        const barHeight = Math.max(6, (d.valueLakh / max) * height);
        return (
          <View key={d.label} style={{ flex: 1, alignItems: 'center' }}>
            <View
              style={{
                width: '50%',
                height: barHeight,
                borderRadius: radius.sm,
                backgroundColor: isLast ? colors.accent : colors.primaryMuted,
              }}
            />
            <Text style={[typography.tiny, { color: colors.textMuted, marginTop: spacing.xs }]}>{d.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

export function StatTile({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  const { colors, spacing, typography } = useTheme();
  return (
    <View style={{ flex: 1, paddingVertical: spacing.md }}>
      <Text style={[typography.tiny, { color: colors.textMuted, marginBottom: 4 }]}>{label}</Text>
      <Text style={[typography.bodyMedium, { color: valueColor ?? colors.text }]}>{value}</Text>
    </View>
  );
}

export function StatGrid({
  rows,
}: {
  rows: [{ label: string; value: string }, { label: string; value: string }][];
}) {
  const { colors } = useTheme();
  return (
    <Card style={{ padding: 0, overflow: 'hidden' }}>
      {rows.map((pair, i) => (
        <View
          key={i}
          style={{
            flexDirection: 'row',
            paddingHorizontal: 16,
            borderTopWidth: i === 0 ? 0 : 1,
            borderTopColor: colors.border,
          }}
        >
          <StatTile label={pair[0].label} value={pair[0].value} />
          <View style={{ width: 1, backgroundColor: colors.border }} />
          <View style={{ width: 16 }} />
          <StatTile label={pair[1].label} value={pair[1].value} />
        </View>
      ))}
    </Card>
  );
}

export type PaymentStatusLike = 'paid' | 'partial' | 'unpaid';

export function StatusBadge({ status }: { status: PaymentStatusLike }) {
  const { colors, radius, spacing, typography } = useTheme();
  const map = {
    paid: { bg: colors.successBg, fg: colors.success, label: 'Paid' },
    partial: { bg: colors.warningBg, fg: colors.warning, label: 'Partial' },
    unpaid: { bg: colors.dangerBg, fg: colors.danger, label: 'Unpaid' },
  }[status];
  return (
    <View
      style={{ backgroundColor: map.bg, borderRadius: radius.sm, paddingHorizontal: spacing.sm + 2, paddingVertical: 3 }}
    >
      <Text style={[typography.tiny, { color: map.fg, letterSpacing: 0.4 }]}>{map.label.toUpperCase()}</Text>
    </View>
  );
}

interface ResidentRowItem {
  houseCode: string;
  name: string;
  status: PaymentStatusLike;
  monthlyDue?: number;
  balance: number;
  paidDate?: string;
  monthsPending?: number;
}

// variant="list" -> Resident Payment List row (status badge + due/paid line)
// variant="unpaid" -> Unpaid Residents row (balance + months-pending line)
export function ResidentRow({
  item,
  onPress,
  variant = 'list',
}: {
  item: ResidentRowItem;
  onPress: () => void;
  variant?: 'list' | 'unpaid';
}) {
  const { colors, radius, spacing, typography } = useTheme();
  const paidDateLabel = item.paidDate
    ? new Date(item.paidDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : null;
  const monthsLabel = item.monthsPending
    ? item.monthsPending === 1
      ? '1 month pending'
      : `${item.monthsPending} months pending`
    : '';

  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.lg,
        padding: spacing.lg,
        marginBottom: spacing.md,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <View style={{ flex: 1, marginRight: spacing.md }}>
          <Text style={[typography.tiny, { color: colors.textMuted, letterSpacing: 0.4 }]}>{item.houseCode}</Text>
          <Text style={[typography.bodyMedium, { color: colors.text, marginTop: 2 }]}>{item.name}</Text>
        </View>
        {variant === 'list' ? (
          <StatusBadge status={item.status} />
        ) : (
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={[typography.bodyMedium, { color: colors.danger }]}>{formatINR(item.balance)}</Text>
            <Text style={[typography.tiny, { color: colors.textMuted, marginTop: 2 }]}>{monthsLabel}</Text>
          </View>
        )}
      </View>

      {variant === 'list' && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: spacing.md,
            paddingTop: spacing.md,
            borderTopWidth: 1,
            borderTopColor: colors.border,
          }}
        >
          <Text style={[typography.caption, { color: colors.textMuted }]}>Due {formatINR(item.monthlyDue ?? 0)} / month</Text>
          <Text style={[typography.caption, { color: item.status === 'paid' ? colors.textMuted : colors.danger }]}>
            {item.status === 'paid' ? `Paid on ${paidDateLabel}` : `${formatINR(item.balance)} pending`}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
