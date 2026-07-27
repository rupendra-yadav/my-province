// app/(auth)/phone.tsx
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Text, TextInput, View } from 'react-native';
import { FadeSlideIn, IconBadge, PrimaryButton, ScreenHeading } from '../../components/ui';
import { useTheme } from '../../context/ThemeContext';
import { ApiError } from '../../lib/api';
import { sendOtp } from '../../lib/endpoints';

export default function PhoneScreen() {
  const { colors, spacing, radius, typography } = useTheme();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleContinue = async () => {
    if (phone.length !== 10) {
      setError('Enter a valid 10-digit mobile number');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await sendOtp(phone);
      router.push({ pathname: '/(auth)/otp', params: { phone } });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not send OTP. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={{ flex: 1, paddingHorizontal: spacing.xl, paddingTop: spacing.xxxl }}>
        <FadeSlideIn>
          <IconBadge name="call-outline" size={52} />
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
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: colors.surface,
              borderRadius: radius.md,
              borderWidth: 1,
              borderColor: error ? colors.danger : colors.border,
              paddingHorizontal: spacing.lg,
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
          </View>
          {!!error && (
            <Text style={[typography.caption, { color: colors.danger, marginTop: spacing.xs }]}>
              {error}
            </Text>
          )}
        </FadeSlideIn>

        <View style={{ flex: 1 }} />

        <FadeSlideIn delay={160} style={{ marginBottom: spacing.xxl }}>
          <PrimaryButton label="Send OTP" icon="arrow-forward" loading={submitting} onPress={handleContinue} />
        </FadeSlideIn>
      </View>
    </KeyboardAvoidingView>
  );
}
