// app/(auth)/welcome.tsx
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { FadeSlideIn, PrimaryButton } from '../../components/ui';
import { useTheme } from '../../context/ThemeContext';

const { height } = Dimensions.get('window');

const FEATURES: { icon: keyof typeof Ionicons.glyphMap; label: string }[] = [
  { icon: 'shield-checkmark', label: 'Secure visitor approvals' },
  { icon: 'notifications', label: 'Instant notices & alerts' },
  { icon: 'card', label: 'Simple maintenance payments' },
];

export default function WelcomeScreen() {
  const { colors, spacing, typography, radius, gradients } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient
        colors={gradients.dusk}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.hero, { height: height * 0.52 }]}
      >
        <FadeSlideIn delay={80} style={styles.heroContent}>
          <View
            style={[
              styles.logoCircle,
              { backgroundColor: 'rgba(255,255,255,0.14)', borderRadius: radius.pill },
            ]}
          >
            <Ionicons name="home" size={40} color={colors.textInverted} />
          </View>
          <Text style={[typography.display, { color: '#FFFFFF', marginTop: spacing.lg }]}>
            मेरा परिसर
          </Text>
          <Text
            style={[
              typography.body,
              { color: 'rgba(255,255,255,0.75)', marginTop: spacing.xs },
            ]}
          >
            Mera Parisar — your society, in your pocket
          </Text>
        </FadeSlideIn>
      </LinearGradient>

      <View style={{ flex: 1, paddingHorizontal: spacing.xl, paddingTop: spacing.xl }}>
        <FadeSlideIn delay={220}>
          {FEATURES.map((f, i) => (
            <View key={f.label} style={[styles.featureRow, { marginBottom: spacing.lg }]}>
              <View
                style={[
                  styles.featureIcon,
                  { backgroundColor: colors.primaryMuted, borderRadius: radius.md },
                ]}
              >
                <Ionicons name={f.icon} size={20} color={colors.primary} />
              </View>
              <Text style={[typography.bodyMedium, { color: colors.text, marginLeft: spacing.md }]}>
                {f.label}
              </Text>
            </View>
          ))}
        </FadeSlideIn>

        <View style={{ flex: 1 }} />

        <FadeSlideIn delay={340} style={{ marginBottom: spacing.xxl }}>
          <PrimaryButton
            label="Get Started"
            icon="arrow-forward"
            onPress={() => router.push('/(auth)/phone')}
          />
          <Text
            style={[
              typography.caption,
              { color: colors.textMuted, textAlign: 'center', marginTop: spacing.md },
            ]}
          >
            Built for residents & committees of Chhattisgarh
          </Text>
        </FadeSlideIn>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroContent: { alignItems: 'center' },
  logoCircle: {
    width: 84,
    height: 84,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureRow: { flexDirection: 'row', alignItems: 'center' },
  featureIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
