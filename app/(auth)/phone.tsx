// app/(auth)/phone.tsx
import React, { useRef, useState } from 'react';
import { View, Text, TextInput, Animated, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { FadeSlideIn, PrimaryButton, ScreenHeading, IconBadge } from '../../components/ui';

export default function PhoneScreen() {
  const { colors, spacing, radius, typography } = useTheme();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const shake = useRef(new Animated.Value(0)).current;

  const triggerShake = () => {
    shake.setValue(0);
    Animated.sequence([
      Animated.timing(shake, { toValue: 1, duration: 60, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -1, duration: 60, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 1, duration: 60, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleContinue = () => {
    if (phone.length !== 10) {
      setError('Enter a valid 10-digit mobile number');
      triggerShake();
      return;
    }
    setError('');
    router.push('/(auth)/otp');
  };

  const translateX = shake.interpolate({ inputRange: [-1, 1], outputRange: [-8, 8] });

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={{ flex: 1, paddingHorizontal: spacing.xl, paddingTop: spacing.xxxl }}>
        <FadeSlideIn>
          <IconBadge name="call" size={56} tone="primary" />
          <ScreenHeading
            title="What's your number?"
            subtitle="We'll send a verification code to confirm it's you."
            style={{ marginTop: spacing.lg }}
          />
        </FadeSlideIn>

        <FadeSlideIn delay={100}>
          {/* Locked state field — society app is CG-scoped for now */}
          <Text style={[typography.caption, { color: colors.textMuted, marginBottom: spacing.xs }]}>
            State
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: colors.primaryMuted,
              borderRadius: radius.md,
              paddingHorizontal: spacing.lg,
              paddingVertical: spacing.md,
              marginBottom: spacing.lg,
            }}
          >
            <Ionicons name="location" size={18} color={colors.primary} />
            <Text style={[typography.bodyMedium, { color: colors.primary, marginLeft: spacing.sm }]}>
              Chhattisgarh
            </Text>
            <View style={{ flex: 1 }} />
            <Ionicons name="lock-closed" size={16} color={colors.primary} />
          </View>

          <Text style={[typography.caption, { color: colors.textMuted, marginBottom: spacing.xs }]}>
            Mobile number
          </Text>
          <Animated.View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: colors.surface,
              borderRadius: radius.md,
              borderWidth: 1.5,
              borderColor: error ? colors.danger : colors.border,
              paddingHorizontal: spacing.lg,
              transform: [{ translateX }],
            }}
          >
            <Text style={[typography.bodyMedium, { color: colors.textMuted }]}>+91</Text>
            <TextInput
              value={phone}
              onChangeText={(t) => {
                setPhone(t.replace(/[^0-9]/g, '').slice(0, 10));
                if (error) setError('');
              }}
              keyboardType="number-pad"
              maxLength={10}
              placeholder="98765 43210"
              placeholderTextColor={colors.textMuted}
              style={[
                typography.bodyMedium,
                {
                  flex: 1,
                  color: colors.text,
                  paddingVertical: spacing.md,
                  paddingLeft: spacing.sm,
                },
              ]}
            />
          </Animated.View>
          {!!error && (
            <Text style={[typography.caption, { color: colors.danger, marginTop: spacing.xs }]}>
              {error}
            </Text>
          )}
        </FadeSlideIn>

        <View style={{ flex: 1 }} />

        <FadeSlideIn delay={160} style={{ marginBottom: spacing.xxl }}>
          <PrimaryButton label="Send OTP" icon="arrow-forward" onPress={handleContinue} />
        </FadeSlideIn>
      </View>
    </KeyboardAvoidingView>
  );
}
