// components/ui.tsx
// Shared building blocks for the Nivas direction. Depth = hairline borders,
// not shadows. Motion = calm crossfades, not springs or bounces.
// Keep screens thin — compose these instead of writing raw styling per screen.

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  ActivityIndicator,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

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
  const { colors, radius, spacing, typography } = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: spacing.sm }}>
      {options.map((opt) => {
        const active = opt.key === value;
        return (
          <Pressable
            key={opt.key}
            onPress={() => onChange(opt.key)}
            style={{
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.sm,
              borderRadius: radius.pill,
              borderWidth: 1,
              borderColor: active ? colors.primary : colors.border,
              backgroundColor: active ? colors.primary : 'transparent',
            }}
          >
            <Text
              style={[
                typography.caption,
                { color: active ? colors.onPrimary : colors.textMuted },
              ]}
            >
              {opt.label}
              {opt.count !== undefined ? `  ${opt.count}` : ''}
            </Text>
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
