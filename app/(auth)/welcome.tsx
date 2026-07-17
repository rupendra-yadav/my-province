// app/(auth)/welcome.tsx
import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { FadeSlideIn, PrimaryButton } from '../../components/ui';

const { height } = Dimensions.get('window');

const FEATURES: { icon: keyof typeof Ionicons.glyphMap; label: string }[] = [
  { icon: 'shield-checkmark-outline', label: 'Secure visitor approvals' },
  { icon: 'notifications-outline', label: 'Instant notices & alerts' },
  { icon: 'card-outline', label: 'Simple maintenance payments' },
];

export default function WelcomeScreen() {
  const { colors, spacing, typography, radius } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Flat ink panel — no gradient. The restraint is the brand statement. */}
      <View style={[styles.hero, { height: height * 0.46, backgroundColor: colors.primary }]}>
        <FadeSlideIn delay={60} style={styles.heroContent}>
          <View
            style={[
              styles.logoCircle,
              { borderColor: 'rgba(250,248,245,0.25)', borderRadius: radius.pill },
            ]}
          >
            <Ionicons name="home-outline" size={32} color={colors.onPrimary} />
          </View>
          <Text style={[typography.display, { color: colors.onPrimary, marginTop: spacing.lg }]}>
            मेरा परिसर
          </Text>
          <Text style={[typography.body, { color: 'rgba(250,248,245,0.65)', marginTop: spacing.xs }]}>
            Mera Parisar — your society, quietly managed
          </Text>
        </FadeSlideIn>
      </View>

      <View style={{ flex: 1, paddingHorizontal: spacing.xl, paddingTop: spacing.xl }}>
        <FadeSlideIn delay={180}>
          {FEATURES.map((f) => (
            <View key={f.label} style={[styles.featureRow, { marginBottom: spacing.lg }]}>
              <View
                style={[
                  styles.featureIcon,
                  { borderColor: colors.border, borderRadius: radius.md },
                ]}
              >
                <Ionicons name={f.icon} size={18} color={colors.text} />
              </View>
              <Text style={[typography.bodyMedium, { color: colors.text, marginLeft: spacing.md }]}>
                {f.label}
              </Text>
            </View>
          ))}
        </FadeSlideIn>

        <View style={{ flex: 1 }} />

        <FadeSlideIn delay={280} style={{ marginBottom: spacing.xxl }}>
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroContent: { alignItems: 'center' },
  logoCircle: {
    width: 72,
    height: 72,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureRow: { flexDirection: 'row', alignItems: 'center' },
  featureIcon: {
    width: 38,
    height: 38,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
