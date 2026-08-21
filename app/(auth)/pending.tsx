// app/(auth)/pending.tsx
import { Ionicons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import { Pressable, Text, View } from 'react-native';
import { Card, FadeSlideIn } from '../../components/ui';
import { useTheme } from '../../context/ThemeContext';

const STEPS = [
  { label: 'Details submitted', desc: 'Your request has been received.', done: true },
  {
    label: 'Awaiting admin review',
    desc: 'Your request is under review by the committee.',
    active: true,
  },
  { label: 'Approved & ready', desc: "You'll be notified once it's approved.", done: false },
];

export default function PendingScreen() {
  const { colors, spacing, typography, radius } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingHorizontal: spacing.xl, paddingTop: spacing.xxl }}>
      <FadeSlideIn style={{ alignItems: 'center', marginBottom: spacing.lg }}>
        <LottieView
          source={require('../../assets/lottie/finding-documents.json')}
          autoPlay
          loop
          style={{ width: 220, height: 132 }}
        />
        <Text style={[typography.h1, { color: colors.text, textAlign: 'center', marginTop: spacing.sm }]}>
          Your request is with{'\n'}the committee
        </Text>
        <Text style={[typography.body, { color: colors.textMuted, marginTop: spacing.sm, textAlign: 'center' }]}>
          Admins usually respond within 24 hours.{'\n'}We'll notify you the moment there's an update.
        </Text>
      </FadeSlideIn>

      <FadeSlideIn delay={120}>
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          {STEPS.map((step, i) => (
            <View
              key={step.label}
              style={{
                flexDirection: 'row',
                paddingHorizontal: spacing.lg,
                paddingVertical: spacing.lg,
                backgroundColor: step.active ? colors.warningBg : 'transparent',
              }}
            >
              <View style={{ alignItems: 'center', marginRight: spacing.md }}>
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: radius.pill,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: step.done
                      ? colors.success
                      : step.active
                      ? colors.warning
                      : colors.border,
                  }}
                >
                  <Ionicons
                    name={step.done ? 'checkmark' : step.active ? 'ellipsis-horizontal' : 'ellipse-outline'}
                    size={16}
                    color={step.done || step.active ? '#fff' : colors.textMuted}
                  />
                </View>
                {i < STEPS.length - 1 && (
                  <View
                    style={{
                      width: 2,
                      flex: 1,
                      marginTop: spacing.xs,
                      backgroundColor: colors.border,
                    }}
                  />
                )}
              </View>

              <View style={{ flex: 1 }}>
                <Text style={[typography.bodyMedium, { color: colors.text }]}>{step.label}</Text>
                <Text
                  style={[
                    typography.caption,
                    { color: step.active ? colors.warning : colors.textMuted, marginTop: 2 },
                  ]}
                >
                  {step.desc}
                </Text>
                {step.active && (
                  <View
                    style={{
                      alignSelf: 'flex-start',
                      backgroundColor: colors.warningBg,
                      borderRadius: radius.pill,
                      paddingHorizontal: spacing.sm,
                      paddingVertical: 4,
                      marginTop: spacing.sm,
                    }}
                  >
                    <Text style={[typography.caption, { color: colors.warning }]}>Current step</Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </Card>
      </FadeSlideIn>

      <View style={{ flex: 1 }} />

      <FadeSlideIn delay={200} style={{ marginBottom: spacing.lg }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.dangerBg ?? '#FCEAE4',
            borderRadius: radius.lg,
            padding: spacing.lg,
          }}
        >
          <Ionicons name="shield-checkmark-outline" size={22} color={colors.warning} />
          <Text style={[typography.bodyMedium, { color: colors.text, marginLeft: spacing.md, flex: 1 }]}>
            You will be able to access the app after approval.
          </Text>
        </View>
      </FadeSlideIn>

      <Pressable
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: spacing.xl,
        }}
      >
        <Ionicons name="headset-outline" size={18} color={colors.textMuted} />
        <Text style={[typography.body, { color: colors.textMuted, marginLeft: spacing.xs }]}>
          Need help?{' '}
        </Text>
        <Text style={[typography.bodyMedium, { color: colors.warning }]}>Contact support</Text>
        <Ionicons name="chevron-forward" size={16} color={colors.warning} style={{ marginLeft: 2 }} />
      </Pressable>
    </View>
  );
}