// components/ui.tsx
// Shared building blocks. Keep screens thin — compose these instead of
// writing raw <View>/<Text> styling per screen.

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';

// ---------- FadeSlideIn: wraps any screen content for an entrance animation ----------
export function FadeSlideIn({
  children,
  delay = 0,
  distance = 16,
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  distance?: number;
  style?: ViewStyle;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(distance)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 420,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 420,
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

// ---------- Pulse: gentle looping scale pulse, used on the pending/waiting screen ----------
export function Pulse({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.08, duration: 900, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return <Animated.View style={[{ transform: [{ scale }] }, style]}>{children}</Animated.View>;
}

// ---------- PrimaryButton: gradient CTA with press-scale feedback ----------
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
  const { colors, radius, spacing, typography, gradients, shadow } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () =>
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 40 }).start();
  const pressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 40 }).start();

  const isDisabled = disabled || loading;

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <Pressable
        onPress={onPress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        disabled={isDisabled}
        style={{ opacity: isDisabled ? 0.6 : 1 }}
      >
        <LinearGradient
          colors={gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.buttonBase,
            {
              borderRadius: radius.md,
              paddingVertical: spacing.md + 2,
              ...shadow('md', colors.primary),
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
                  size={19}
                  color={colors.onPrimary}
                  style={{ marginRight: spacing.sm }}
                />
              )}
              <Text style={[typography.bodyMedium, { color: colors.onPrimary }]}>{label}</Text>
            </>
          )}
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

// ---------- GhostButton: low-emphasis secondary action ----------
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
          paddingVertical: spacing.md,
          backgroundColor: colors.primaryMuted,
        },
        style,
      ]}
    >
      {icon && (
        <Ionicons name={icon} size={18} color={colors.primary} style={{ marginRight: spacing.sm }} />
      )}
      <Text style={[typography.bodyMedium, { color: colors.primary }]}>{label}</Text>
    </Pressable>
  );
}

// ---------- Card: elevated surface container ----------
export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  const { colors, radius, spacing, shadow } = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderRadius: radius.lg,
          padding: spacing.lg,
          ...shadow('sm'),
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

// ---------- IconBadge: circular icon chip, used throughout for visual anchors ----------
export function IconBadge({
  name,
  size = 44,
  tone = 'primary',
}: {
  name: keyof typeof Ionicons.glyphMap;
  size?: number;
  tone?: 'primary' | 'accent' | 'success' | 'danger' | 'warning';
}) {
  const { colors, radius } = useTheme();
  const toneMap = {
    primary: { bg: colors.primaryMuted, fg: colors.primary },
    accent: { bg: colors.accentMuted, fg: colors.accent },
    success: { bg: colors.successBg, fg: colors.success },
    danger: { bg: colors.dangerBg, fg: colors.danger },
    warning: { bg: colors.warningBg, fg: colors.warning },
  }[tone];

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: radius.pill,
        backgroundColor: toneMap.bg,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Ionicons name={name} size={size * 0.5} color={toneMap.fg} />
    </View>
  );
}

// ---------- ScreenHeading: consistent title + subtitle block ----------
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

const styles = StyleSheet.create({
  buttonBase: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
});
