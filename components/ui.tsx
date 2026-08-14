// components/ui.tsx
// Shared building blocks for the Nivas direction. Depth = hairline borders,
// not shadows. Motion = calm crossfades, not springs or bounces.
// Keep screens thin — compose these instead of writing raw styling per screen.

import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import type { PaymentPeriod, PaymentStatus } from '../context/PaymentsContext';
import { useTheme } from '../context/ThemeContext';

// ---------- formatINR: shared currency formatting, negative = credit ----------
export function formatINR(amount: number) {
  const sign = amount < 0 ? '-' : '';
  return `${sign}₹${Math.abs(amount).toLocaleString('en-IN', { minimumFractionDigits: 0 })}`;
}

// ---------- FadeIn: quiet entrance, no vertical bounce — a slight rise only ----------
export function FadeSlideIn({
  children,
  delay = 0,
  distance = 8,
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  distance?: number;
  style?: ViewStyle;
}) {
  const { motion } = useTheme();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(distance)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: motion.slow,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: motion.slow,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[{ opacity, transform: [{ translateY }] }, style]}>
      {children}
    </Animated.View>
  );
}

// ---------- SoftPulse: subtle opacity breathing, used sparingly (pending/waiting state) ----------
export function SoftPulse({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.55, duration: 1100, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 1100, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return <Animated.View style={[{ opacity }, style]}>{children}</Animated.View>;
}

// ---------- PrimaryButton: flat ink, no gradient — restraint is the statement ----------
export function PrimaryButton({
  label,
  onPress,
  icon,
  loading = false,
  disabled = false,
  style,
}: {
  label: string;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}) {
  const { colors, radius, spacing, typography, motion } = useTheme();
  const opacity = useRef(new Animated.Value(1)).current;

  const pressIn = () =>
    Animated.timing(opacity, { toValue: 0.7, duration: motion.fast, useNativeDriver: true }).start();
  const pressOut = () =>
    Animated.timing(opacity, { toValue: 1, duration: motion.fast, useNativeDriver: true }).start();

  const isDisabled = disabled || loading;

  return (
    <Animated.View style={[{ opacity: isDisabled ? 0.4 : opacity }, style]}>
      <Pressable onPress={onPress} onPressIn={pressIn} onPressOut={pressOut} disabled={isDisabled}>
        <View
          style={[
            styles.buttonBase,
            {
              backgroundColor: colors.primary,
              borderRadius: radius.md,
              paddingVertical: spacing.md + 3,
            },
          ]}
        >
          {loading ? (
            <ActivityIndicator color={colors.onPrimary} />
          ) : (
            <>
              {icon && (
                <Ionicons
                  name={icon}
                  size={17}
                  color={colors.onPrimary}
                  style={{ marginRight: spacing.sm }}
                />
              )}
              <Text style={[typography.bodyMedium, { color: colors.onPrimary, letterSpacing: 0.2 }]}>
                {label}
              </Text>
            </>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

// ---------- GhostButton: hairline outline, no fill ----------
export function GhostButton({
  label,
  onPress,
  icon,
  style,
}: {
  label: string;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: ViewStyle;
}) {
  const { colors, radius, spacing, typography } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.buttonBase,
        {
          borderRadius: radius.md,
          paddingVertical: spacing.md + 2,
          borderWidth: 1,
          borderColor: colors.borderStrong,
          backgroundColor: 'transparent',
        },
        style,
      ]}
    >
      {icon && (
        <Ionicons name={icon} size={16} color={colors.text} style={{ marginRight: spacing.sm }} />
      )}
      <Text style={[typography.bodyMedium, { color: colors.text }]}>{label}</Text>
    </Pressable>
  );
}

// ---------- Card: hairline border, near-zero shadow ----------
export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  const { colors, radius, spacing } = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderRadius: radius.lg,
          borderWidth: 1,
          borderColor: colors.border,
          padding: spacing.lg,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

// ---------- IconBadge: monochrome outline icon on a hairline circle — no color-coded tones ----------
export function IconBadge({
  name,
  size = 44,
  emphasis = false,
}: {
  name: keyof typeof Ionicons.glyphMap;
  size?: number;
  emphasis?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 1,
        borderColor: emphasis ? colors.accent : colors.border,
        backgroundColor: emphasis ? colors.accentMuted : colors.background,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Ionicons name={name} size={size * 0.42} color={emphasis ? colors.accent : colors.text} />
    </View>
  );
}

// ---------- ScreenHeading ----------
export function ScreenHeading({
  title,
  subtitle,
  style,
}: {
  title: string;
  subtitle?: string;
  style?: ViewStyle;
}) {
  const { colors, typography, spacing } = useTheme();
  return (
    <View style={[{ marginBottom: spacing.lg }, style]}>
      <Text style={[typography.h1, { color: colors.text }]}>{title}</Text>
      {subtitle && (
        <Text style={[typography.body, { color: colors.textMuted, marginTop: spacing.xs }]}>
          {subtitle}
        </Text>
      )}
    </View>
  );
}

// ---------- StatusChip: small muted status indicator — the one place color earns its keep ----------
export function StatusChip({ status }: { status: 'pending' | 'approved' | 'rejected' }) {
  const { colors, radius, spacing, typography } = useTheme();
  const map = {
    pending: { bg: colors.warningBg, fg: colors.warning, label: 'Pending' },
    approved: { bg: colors.successBg, fg: colors.success, label: 'Approved' },
    rejected: { bg: colors.dangerBg, fg: colors.danger, label: 'Rejected' },
  }[status];

  return (
    <View
      style={{
        alignSelf: 'flex-start',
        backgroundColor: map.bg,
        borderRadius: radius.sm,
        paddingHorizontal: spacing.sm + 2,
        paddingVertical: 3,
      }}
    >
      <Text style={[typography.tiny, { color: map.fg, letterSpacing: 0.4 }]}>
        {map.label.toUpperCase()}
      </Text>
    </View>
  );
}

// ---------- PaymentStatusChip: same visual language as StatusChip, payment states ----------
export function PaymentStatusChip({ status }: { status: 'paid' | 'pending' | 'not_paid' }) {
  const { colors, radius, spacing, typography } = useTheme();
  const map = {
    paid: { bg: colors.successBg, fg: colors.success, label: 'Paid' },
    pending: { bg: colors.warningBg, fg: colors.warning, label: 'Pending' },
    not_paid: { bg: colors.dangerBg, fg: colors.danger, label: 'Not paid' },
  }[status];

  return (
    <View
      style={{
        alignSelf: 'flex-start',
        backgroundColor: map.bg,
        borderRadius: radius.sm,
        paddingHorizontal: spacing.sm + 2,
        paddingVertical: 3,
      }}
    >
      <Text style={[typography.tiny, { color: map.fg, letterSpacing: 0.4 }]}>
        {map.label.toUpperCase()}
      </Text>
    </View>
  );
}

// ---------- PaymentHistoryRow: paid-only entry — month, paid date, paid amount ----------
export function PaymentHistoryRow({
  item,
  showType = false,
  isLast = false,
}: {
  item: PaymentPeriod;
  showType?: boolean; // prefix with "Maintenance ·" / "Membership ·" — dashboard mixes both, payment screen doesn't need to
  isLast?: boolean;
}) {
  const { colors, spacing, typography } = useTheme();
  const feeLabel = item.type === 'maintenance' ? 'Maintenance' : 'Membership';
  const paidDate = item.paidDate
    ? new Date(item.paidDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : '';

  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        borderBottomWidth: isLast ? 1 : 0,
        borderBottomColor: colors.border,
      }}
    >
      <View>
        <Text style={[typography.bodyMedium, { color: colors.text }]}>
          {showType ? `${feeLabel} · ${item.label}` : item.label}
        </Text>
        <Text style={[typography.tiny, { color: colors.textMuted, marginTop: 2 }]}>Paid on {paidDate}</Text>
      </View>
      <Text style={[typography.bodyMedium, { color: colors.text }]}>{formatINR(item.paid)}</Text>
    </View>
  );
}

// ---------- TransactionHistoryCard: full detail — status badge + due/paid/fine/balance grid ----------
// Used on the payment screen's full history (all statuses). PaymentHistoryRow
// above stays as the compact paid-only row for the dashboard recap.
export function TransactionHistoryCard({
  item,
  showType = false,
}: {
  item: PaymentPeriod;
  showType?: boolean; // prefix with "Maintenance ·" / "Membership ·"
}) {
  const { colors, radius, spacing, typography } = useTheme();
  const feeLabel = item.type === 'maintenance' ? 'Maintenance' : 'Membership';

  const statusMap: Record<PaymentStatus, { label: string; fg: string; bg: string }> = {
    paid: { label: 'Paid', fg: colors.success, bg: colors.successBg },
    pending: { label: 'Pending', fg: colors.warning, bg: colors.warningBg },
    not_paid: { label: 'Not paid', fg: colors.danger, bg: colors.dangerBg },
  };
  const status = statusMap[item.status];
  const balanceColor = item.balance > 0 ? colors.danger : colors.success;

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        padding: spacing.md,
        marginBottom: spacing.sm,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: spacing.md,
        }}
      >
        <Text style={[typography.body, { color: colors.text }]}>
          {showType ? `${feeLabel} · ${item.label}` : item.label}
        </Text>
        <View
          style={{
            backgroundColor: status.bg,
            borderRadius: radius.pill,
            paddingVertical: 3,
            paddingHorizontal: spacing.sm,
          }}
        >
          <Text style={[typography.tiny, { color: status.fg }]}>{status.label}</Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row' }}>
        <View style={{ flex: 1 }}>
          <Text style={[typography.tiny, { color: colors.textMuted, marginBottom: 2 }]}>Due</Text>
          <Text style={[typography.caption, { color: colors.text }]}>{formatINR(item.due)}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[typography.tiny, { color: colors.textMuted, marginBottom: 2 }]}>Paid</Text>
          <Text style={[typography.caption, { color: colors.text }]}>{formatINR(item.paid)}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[typography.tiny, { color: colors.textMuted, marginBottom: 2 }]}>Fine</Text>
          <Text style={[typography.caption, { color: colors.text }]}>{formatINR(item.fine)}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[typography.tiny, { color: colors.textMuted, marginBottom: 2 }]}>Balance</Text>
          <Text style={[typography.caption, { color: balanceColor }]}>{formatINR(item.balance)}</Text>
        </View>
      </View>
    </View>
  );
}

// ---------- MonthSelector: prev/next month picker, no external date picker dep ----------
export function MonthSelector({
  month,
  year,
  onChange,
  disableFuture = true,
}: {
  month: number; // 1-12
  year: number;
  onChange: (month: number, year: number) => void;
  disableFuture?: boolean; // hides forward past the current month
}) {
  const { colors, radius, spacing, typography } = useTheme();
  const label = new Date(year, month - 1, 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  const now = new Date();
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1;
  const canGoForward = !disableFuture || !isCurrentMonth;

  const shift = (delta: number) => {
    let m = month + delta;
    let y = year;
    if (m === 0) {
      m = 12;
      y -= 1;
    } else if (m === 13) {
      m = 1;
      y += 1;
    }
    onChange(m, y);
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        backgroundColor: colors.surface,
      }}
    >
      <Pressable onPress={() => shift(-1)} hitSlop={10} style={{ paddingVertical: spacing.md, paddingHorizontal: spacing.md }}>
        <Ionicons name="chevron-back" size={18} color={colors.textMuted} />
      </Pressable>
      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name="calendar-outline" size={16} color={colors.textMuted} />
        <Text style={[typography.body, { color: colors.text, marginLeft: spacing.sm }]}>{label}</Text>
      </View>
      <Pressable
        onPress={() => canGoForward && shift(1)}
        hitSlop={10}
        disabled={!canGoForward}
        style={{ paddingVertical: spacing.md, paddingHorizontal: spacing.md, opacity: canGoForward ? 1 : 0.3 }}
      >
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      </Pressable>
    </View>
  );
}

// ---------- MonthRangeSelector: compact From/To pair, used by Screens 1/2/3/7 ----------
export interface MonthRangeValue {
  fromMonth: number;
  fromYear: number;
  toMonth: number;
  toYear: number;
}

export function MonthRangeSelector({
  value,
  onChange,
  disableFutureTo = true,
}: {
  value: MonthRangeValue;
  onChange: (next: MonthRangeValue) => void;
  disableFutureTo?: boolean; // hides "to" forward past the current month
}) {
  const { colors, radius, spacing, typography } = useTheme();
  const { fromMonth, fromYear, toMonth, toYear } = value;

  const fromLabel = new Date(fromYear, fromMonth - 1, 1).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
  const toLabel = new Date(toYear, toMonth - 1, 1).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });

  const now = new Date();
  const isToCurrentMonth = toYear === now.getFullYear() && toMonth === now.getMonth() + 1;
  const canGoForwardTo = !disableFutureTo || !isToCurrentMonth;

  const shift = (which: 'from' | 'to', delta: number) => {
    let m = which === 'from' ? fromMonth : toMonth;
    let y = which === 'from' ? fromYear : toYear;
    m += delta;
    if (m === 0) {
      m = 12;
      y -= 1;
    } else if (m === 13) {
      m = 1;
      y += 1;
    }

    let next: MonthRangeValue =
      which === 'from' ? { fromMonth: m, fromYear: y, toMonth, toYear } : { fromMonth, fromYear, toMonth: m, toYear: y };

    // Keep from <= to — if a move would cross the other side, drag it along.
    const fromIdx = next.fromYear * 12 + next.fromMonth;
    const toIdx = next.toYear * 12 + next.toMonth;
    if (fromIdx > toIdx) {
      if (which === 'from') {
        next = { ...next, toMonth: next.fromMonth, toYear: next.fromYear };
      } else {
        next = { ...next, fromMonth: next.toMonth, fromYear: next.toYear };
      }
    }
    onChange(next);
  };

  const sideStyle = {
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  };

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <View style={sideStyle}>
        <Pressable onPress={() => shift('from', -1)} hitSlop={10} style={{ padding: spacing.sm }}>
          <Ionicons name="chevron-back" size={16} color={colors.textMuted} />
        </Pressable>
        <Text style={[typography.caption, { color: colors.text, flex: 1, textAlign: 'center' }]}>{fromLabel}</Text>
        <Pressable onPress={() => shift('from', 1)} hitSlop={10} style={{ padding: spacing.sm }}>
          <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
        </Pressable>
      </View>

      <Ionicons name="arrow-forward" size={13} color={colors.textMuted} style={{ marginHorizontal: spacing.xs }} />

      <View style={sideStyle}>
        <Pressable onPress={() => shift('to', -1)} hitSlop={10} style={{ padding: spacing.sm }}>
          <Ionicons name="chevron-back" size={16} color={colors.textMuted} />
        </Pressable>
        <Text style={[typography.caption, { color: colors.text, flex: 1, textAlign: 'center' }]}>{toLabel}</Text>
        <Pressable
          onPress={() => canGoForwardTo && shift('to', 1)}
          hitSlop={10}
          disabled={!canGoForwardTo}
          style={{ padding: spacing.sm, opacity: canGoForwardTo ? 1 : 0.3 }}
        >
          <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
        </Pressable>
      </View>
    </View>
  );
}

// ---------- SelectChip: tap-to-expand single-select dropdown (Screen 1 Block/House Type filters) ----------
export interface SelectChipOption {
  key: string;
  label: string;
}

export function SelectChip({
  icon,
  value,
  options,
  onChange,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: string; // selected option key, 'all' means no filter
  options: SelectChipOption[]; // should NOT include the "All" option — added automatically
  onChange: (key: string) => void;
}) {
  const { colors, radius, spacing, typography } = useTheme();
  const [open, setOpen] = useState(false);

  const allOptions: SelectChipOption[] = [{ key: 'all', label: 'All' }, ...options];
  const selected = allOptions.find((o) => o.key === value) ?? allOptions[0];

  return (
    <View style={{ flex: 1 }}>
      <Pressable
        onPress={() => setOpen((o) => !o)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: open ? colors.accent : colors.border,
          borderRadius: radius.md,
          backgroundColor: colors.surface,
          paddingVertical: spacing.sm + 2,
          paddingHorizontal: spacing.sm,
        }}
      >
        <Ionicons name={icon} size={14} color={colors.textMuted} />
        <Text style={[typography.caption, { color: colors.text, marginLeft: spacing.xs, flex: 1 }]} numberOfLines={1}>
          {selected.label}
        </Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={14} color={colors.textMuted} />
      </Pressable>

      {open && (
        <View
          style={{
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radius.md,
            backgroundColor: colors.surface,
            marginTop: 4,
            maxHeight: 200,
            overflow: 'hidden',
          }}
        >
          {allOptions.map((opt) => (
            <Pressable
              key={opt.key}
              onPress={() => {
                onChange(opt.key);
                setOpen(false);
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: spacing.sm + 2,
                paddingHorizontal: spacing.md,
                borderTopWidth: opt.key === allOptions[0].key ? 0 : 1,
                borderTopColor: colors.border,
              }}
            >
              <Text style={[typography.caption, { color: colors.text }]}>{opt.label}</Text>
              {opt.key === value && <Ionicons name="checkmark" size={15} color={colors.accent} />}
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

// ---------- SegmentedTabs: quiet filter row with counts ----------
export function SegmentedTabs<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { key: T; label: string; count?: number }[];
  value: T;
  onChange: (v: T) => void;
}) {
  const { colors, radius, spacing, typography, isDark } = useTheme();

  const trackBg = isDark ? 'rgba(255,255,255,0.08)' : colors.primaryMuted;
  const activeBg = isDark ? 'rgba(255,255,255,0.14)' : colors.surface;
  const activeBorder = isDark ? 'rgba(255,255,255,0.16)' : colors.border;
  const badgeActiveBg = isDark ? colors.accent : colors.accent;
  const badgeInactiveBg = isDark ? 'rgba(255,255,255,0.12)' : colors.border;
  const badgeInactiveText = isDark ? colors.textMuted : colors.textMuted;

  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: trackBg,
        borderRadius: radius.lg,
        padding: 4,
      }}
    >
      {options.map((opt) => {
        const active = opt.key === value;
        return (
          <Pressable
            key={opt.key}
            onPress={() => onChange(opt.key)}
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: spacing.sm,
              borderRadius: radius.md,
              backgroundColor: active ? activeBg : 'transparent',
              borderWidth: active ? 1 : 0,
              borderColor: activeBorder,
            }}
          >
            <Text
              style={[
                typography.caption,
                { color: active ? colors.text : colors.textMuted, fontWeight: active ? ('500' as const) : ('400' as const) },
              ]}
            >
              {opt.label}
            </Text>
            {opt.count !== undefined && (
              <View
                style={{
                  marginLeft: 6,
                  minWidth: 18,
                  height: 18,
                  paddingHorizontal: 5,
                  borderRadius: 9,
                  backgroundColor: active ? badgeActiveBg : badgeInactiveBg,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text
                  style={[
                    typography.tiny,
                    { color: active ? colors.onPrimary : badgeInactiveText, fontWeight: '500' as const, fontSize: 11 },
                  ]}
                >
                  {opt.count}
                </Text>
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  buttonBase: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
});