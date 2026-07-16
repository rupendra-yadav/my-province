// app/(auth)/otp.tsx
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, Pressable, Animated } from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { FadeSlideIn, PrimaryButton, ScreenHeading, IconBadge } from '../../components/ui';

const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;

export default function OtpScreen() {
  const { colors, spacing, radius, typography } = useTheme();
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [seconds, setSeconds] = useState(RESEND_SECONDS);
  const inputs = useRef<Array<TextInput | null>>([]);
  const boxScales = useRef(digits.map(() => new Animated.Value(1))).current;

  useEffect(() => {
    if (seconds === 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  const bounceBox = (index: number) => {
    Animated.sequence([
      Animated.spring(boxScales[index], { toValue: 1.12, useNativeDriver: true, speed: 50 }),
      Animated.spring(boxScales[index], { toValue: 1, useNativeDriver: true, speed: 50 }),
    ]).start();
  };

  const handleChange = (text: string, index: number) => {
    const clean = text.replace(/[^0-9]/g, '');
    const next = [...digits];
    next[index] = clean.slice(-1);
    setDigits(next);
    if (clean) {
      bounceBox(index);
      if (index < OTP_LENGTH - 1) inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const isComplete = digits.every((d) => d !== '');

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingHorizontal: spacing.xl, paddingTop: spacing.xxxl }}>
      <FadeSlideIn>
        <IconBadge name="chatbubble-ellipses" size={56} tone="accent" />
        <ScreenHeading
          title="Enter the code"
          subtitle="We've sent a 6-digit code to +91 XXXXX XXXXX"
          style={{ marginTop: spacing.lg }}
        />
      </FadeSlideIn>

      <FadeSlideIn delay={100}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          {digits.map((digit, i) => (
            <Animated.View key={i} style={{ transform: [{ scale: boxScales[i] }] }}>
              <TextInput
                ref={(el) => (inputs.current[i] = el)}
                value={digit}
                onChangeText={(t) => handleChange(t, i)}
                onKeyPress={(e) => handleKeyPress(e, i)}
                keyboardType="number-pad"
                maxLength={1}
                style={{
                  width: 46,
                  height: 56,
                  borderRadius: radius.md,
                  borderWidth: 1.5,
                  borderColor: digit ? colors.primary : colors.border,
                  backgroundColor: colors.surface,
                  textAlign: 'center',
                  fontSize: 22,
                  fontWeight: '700',
                  color: colors.text,
                }}
              />
            </Animated.View>
          ))}
        </View>

        <Pressable
          disabled={seconds > 0}
          onPress={() => setSeconds(RESEND_SECONDS)}
          style={{ marginTop: spacing.lg, alignSelf: 'center' }}
        >
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
          onPress={() => router.push('/(auth)/register')}
        />
      </FadeSlideIn>
    </View>
  );
}
