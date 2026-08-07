// app/(main)/profile.tsx
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Card, FadeSlideIn, GhostButton, IconBadge } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  const { colors, spacing, typography } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm + 2 }}>
      <Ionicons name={icon} size={16} color={colors.textMuted} style={{ width: 22 }} />
      <Text style={[typography.caption, { color: colors.textMuted, flex: 1 }]}>{label}</Text>
      <Text style={[typography.bodyMedium, { color: colors.text }]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function SectionLabel({ children }: { children: string }) {
  const { colors, spacing, typography } = useTheme();
  return (
    <Text style={[typography.caption, { color: colors.textMuted, marginBottom: spacing.sm, marginTop: spacing.lg }]}>
      {children}
    </Text>
  );
}

export default function ProfileScreen() {
  const { colors, spacing, typography } = useTheme();
  const { session, logout } = useAuth() as any;
  const isAdmin = !!session?.isAdmin;
  const user = session?.user;

  // NOTE: verifyOtp's response type (lib/endpoints.ts VerifyOtpResult) only
  // returns { id, name, email, phone, societyId } on user. Society/block/
  // flat/city/address/pincode/memberType all come from RegisterUserInput at
  // registration time but aren't echoed back on session — casting to `any`
  // as a placeholder until the backend includes them on the user object or
  // exposes a GET /me with the full profile.
  const u = user as any;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ paddingHorizontal: spacing.xl, paddingTop: spacing.xxxl, paddingBottom: spacing.md }}>
        <Text style={[typography.h2, { color: colors.text }]}>Profile</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingBottom: spacing.xxxl + 80 }}>
        <FadeSlideIn>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg }}>
            <IconBadge name="person-outline" size={52} />
            <View style={{ marginLeft: spacing.md, flex: 1 }}>
              <Text style={[typography.h1, { color: colors.text }]}>{u?.name ?? '—'}</Text>
              <Text style={[typography.caption, { color: colors.textMuted, marginTop: 2 }]}>
                {u?.phone ? `+91 ${u.phone}` : ''}
              </Text>
            </View>
          </View>
        </FadeSlideIn>

          {isAdmin && (
          <FadeSlideIn delay={160} style={{ marginTop: spacing.lg }}>
            <Pressable onPress={() => router.push('/(admin)/requests' as any)}>
              <Card style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="shield-checkmark-outline" size={19} color={colors.accent} style={{ marginRight: spacing.md }} />
                <Text style={[typography.bodyMedium, { color: colors.text, flex: 1 }]}>Admin console</Text>
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              </Card>
            </Pressable>
          </FadeSlideIn>
        )}

        <SectionLabel>Contact</SectionLabel>
        <FadeSlideIn delay={40}>
          <Card>
            <InfoRow icon="mail-outline" label="Email" value={u?.email ?? '—'} />
            <InfoRow icon="call-outline" label="Phone" value={u?.phone ? `+91 ${u.phone}` : '—'} />
            <InfoRow icon="shield-outline" label="Role" value={isAdmin ? 'Admin' : 'Resident'} />
          </Card>
        </FadeSlideIn>

        <SectionLabel>Residence</SectionLabel>
        <FadeSlideIn delay={80}>
          <Card>
            <InfoRow icon="business-outline" label="Society" value={u?.society ?? u?.societyName ?? '—'} />
            <InfoRow icon="layers-outline" label="Block / Tower" value={u?.block ?? u?.buildingName ?? '—'} />
            <InfoRow icon="home-outline" label="Flat" value={u?.flat ?? u?.unitNumber ?? '—'} />
            <InfoRow icon="key-outline" label="Resident type" value={u?.memberType ?? u?.residentType ?? '—'} />
          </Card>
        </FadeSlideIn>

        <SectionLabel>Address</SectionLabel>
        <FadeSlideIn delay={120}>
          <Card>
            <InfoRow icon="location-outline" label="City" value={u?.city ?? '—'} />
            <InfoRow icon="map-outline" label="Pincode" value={u?.pincode ?? '—'} />
            <InfoRow icon="navigate-outline" label="Address" value={u?.address ?? '—'} />
          </Card>
        </FadeSlideIn>

      

        <FadeSlideIn delay={200} style={{ marginTop: spacing.lg }}>
          <GhostButton
            label="Log out"
            icon="log-out-outline"
            onPress={async () => {
              await logout?.();
              router.replace('/(auth)/phone' as any);
            }}
            style={{ borderColor: colors.danger, backgroundColor: colors.dangerBg }}
          />
        </FadeSlideIn>
      </ScrollView>
    </View>
  );
}