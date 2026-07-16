// app/(auth)/pending.tsx
import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { Card, FadeSlideIn, GhostButton, IconBadge, Pulse } from '../../components/ui';

const STEPS = [
  { label: 'Details submitted', done: true },
  { label: 'Awaiting admin review', done: false, active: true },
  { label: 'Approved & ready', done: false },
];

export default function PendingScreen() {
  const { colors, spacing, typography, radius } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingHorizontal: spacing.xl, paddingTop: spacing.xxxl }}>
      <FadeSlideIn style={{ alignItems: 'center', marginBottom: spacing.xxl }}>
        <Pulse>
          <IconBadge name="time" size={84} tone="warning" />
        </Pulse>
        <Text style={[typography.h1, { color: colors.text, marginTop: spacing.xl, textAlign: 'center' }]}>
          Your request is with the committee
        </Text>
        <Text
          style={[
            typography.body,
            { color: colors.textMuted, marginTop: spacing.sm, textAlign: 'center' },
          ]}
        >
          Admins usually respond within 24 hours. We'll notify you the moment there's an update.
        </Text>
      </FadeSlideIn>

      <FadeSlideIn delay={120}>
        <Card>
          {STEPS.map((step, i) => (
            <View
              key={step.label}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: spacing.sm,
              }}
            >
              <View
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: radius.pill,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: step.done
                    ? colors.successBg
                    : step.active
                    ? colors.warningBg
                    : colors.background,
                }}
              >
                <Ionicons
                  name={step.done ? 'checkmark' : step.active ? 'ellipsis-horizontal' : 'ellipse-outline'}
                  size={15}
                  color={step.done ? colors.success : step.active ? colors.warning : colors.textMuted}
                />
              </View>
              <Text
                style={[
                  typography.bodyMedium,
                  {
                    marginLeft: spacing.md,
                    color: step.done || step.active ? colors.text : colors.textMuted,
                  },
                ]}
              >
                {step.label}
              </Text>
            </View>
          ))}
        </Card>
      </FadeSlideIn>

      <View style={{ flex: 1 }} />

      <FadeSlideIn delay={200} style={{ marginBottom: spacing.xxl }}>
        <GhostButton label="Back to home" icon="home" onPress={() => {}} />
      </FadeSlideIn>
    </View>
  );
}
