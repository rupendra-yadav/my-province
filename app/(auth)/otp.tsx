// app/(auth)/otp.tsx
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { verifyOtp, sendOtp } from '../../lib/endpoints';
import { ApiError } from '../../lib/api';
import { FadeSlideIn, PrimaryButton, ScreenHeading, IconBadge } from '../../components/ui';

const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;

export default function OtpScreen() {
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const { colors, spacing, radius, typography } = useTheme();
  const { login } = useAuth();
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [seconds, setSeconds] = useState(RESEND_SECONDS);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const inputs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    if (seconds === 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  const handleChange = (text: string, index: number) => {
    const clean = text.replace(/[^0-9]/g, '');
    const next = [...digits];
    next[index] = clean.slice(-1);
    setDigits(next);
    if (error) setError('');
    if (clean && index < OTP_LENGTH - 1) inputs.current[index + 1]?.focus();
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleResend = async () => {
    if (!phone || seconds > 0) return;
    setSeconds(RESEND_SECONDS);
    try {
      await sendOtp(phone);
    } catch (err) {
      // Resend failing silently is acceptable here — the countdown
      // still resets, and Verify will surface any real problem.
    }
  };

  const handleVerify = async () => {
    if (!phone) return;
    setSubmitting(true);
    setError('');
    try {
      const result = await verifyOtp(phone, digits.join(''));
      await login(result);

      if (result.isAdmin) {
        router.replace('/(admin)/dashboard');
      } else if (!result.isRegistered) {
        // Covers both "never registered" and "previously rejected" —
        // both resubmit through the same registration screen.
        router.push('/(auth)/register');
      } else if (result.requestStatus === 'pending') {
        router.replace('/(auth)/pending');
      } else {
        // approved resident — no resident home screen built yet
        router.replace('/(auth)/pending');
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const isComplete = digits.every((d) => d !== '');

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingHorizontal: spacing.xl, paddingTop: spacing.xxxl }}>
      <FadeSlideIn>
        <IconBadge name="chatbubble-ellipses-outline" size={52} emphasis />
        <ScreenHeading
          title="Enter the code"
          subtitle={`We've sent a 6-digit code to +91 ${phone ?? ''}`}
          style={{ marginTop: spacing.lg }}
        />
      </FadeSlideIn>

      <FadeSlideIn delay={100}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          {digits.map((digit, i) => (
            <TextInput
              key={i}
              ref={(el) => {
                inputs.current[i] = el;
              }}
              value={digit}
              onChangeText={(t) => handleChange(t, i)}
              onKeyPress={(e) => handleKeyPress(e, i)}
              keyboardType="number-pad"
              maxLength={1}
              style={{
                width: 46,
                height: 56,
                borderRadius: radius.md,
                borderWidth: 1,
                borderColor: error ? colors.danger : digit ? colors.primary : colors.border,
                backgroundColor: colors.surface,
                textAlign: 'center',
                fontSize: 20,
                fontWeight: '600',
                color: colors.text,
              }}
            />
          ))}
        </View>

        {!!error && (
          <Text style={[typography.caption, { color: colors.danger, marginTop: spacing.sm, textAlign: 'center' }]}>
            {error}
          </Text>
        )}

        <Pressable disabled={seconds > 0} onPress={handleResend} style={{ marginTop: spacing.lg, alignSelf: 'center' }}>
          <Text style={[typography.caption, { color: seconds > 0 ? colors.textMuted : colors.primary }]}>
            {seconds > 0 ? `Resend code in 0:${seconds.toString().padStart(2, '0')}` : 'Resend code'}
          </Text>
        </Pressable>
      </FadeSlideIn>

      <View style={{ flex: 1 }} />

      <FadeSlideIn delay={160} style={{ marginBottom: spacing.xxl }}>
        <PrimaryButton
          label="Verify"
          icon="checkmark"
          disabled={!isComplete}
          loading={submitting}
          onPress={handleVerify}
        />
      </FadeSlideIn>
    </View>
  );
}
