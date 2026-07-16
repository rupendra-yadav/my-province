// app/(auth)/register.tsx
import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Modal,
  FlatList,
  Animated,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { FadeSlideIn, PrimaryButton, ScreenHeading, Card } from '../../components/ui';

// ---- Dummy cascading data — swap for GET /locations once backend is wired ----
const DUMMY_DATA = {
  Raipur: {
    'Shalimar Greens': {
      'Block A': ['A-101', 'A-102', 'A-103'],
      'Block B': ['B-201', 'B-202'],
    },
    'Ashiana Residency': {
      'Tower 1': ['101', '102', '103'],
      'Tower 2': ['201', '202'],
    },
  },
  Bilaspur: {
    'Green Valley Enclave': {
      'Wing C': ['C-1', 'C-2', 'C-3'],
    },
  },
  Durg: {
    'Riverside Apartments': {
      'Block D': ['D-11', 'D-12'],
    },
  },
} as const;

type FieldKey = 'city' | 'society' | 'block' | 'flat';

function Dropdown({
  label,
  value,
  placeholder,
  options,
  disabled,
  onSelect,
}: {
  label: string;
  value: string;
  placeholder: string;
  options: string[];
  disabled?: boolean;
  onSelect: (v: string) => void;
}) {
  const { colors, radius, spacing, typography } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <View style={{ marginBottom: spacing.lg }}>
      <Text style={[typography.caption, { color: colors.textMuted, marginBottom: spacing.xs }]}>
        {label}
      </Text>
      <Pressable
        disabled={disabled}
        onPress={() => setOpen(true)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: disabled ? colors.background : colors.surface,
          borderRadius: radius.md,
          borderWidth: 1.5,
          borderColor: colors.border,
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.md,
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <Text
          style={[
            typography.bodyMedium,
            { flex: 1, color: value ? colors.text : colors.textMuted },
          ]}
        >
          {value || placeholder}
        </Text>
        <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable
          style={{ flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' }}
          onPress={() => setOpen(false)}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{
              backgroundColor: colors.surface,
              borderTopLeftRadius: radius.xl,
              borderTopRightRadius: radius.xl,
              paddingTop: spacing.lg,
              paddingHorizontal: spacing.lg,
              maxHeight: '60%',
            }}
          >
            <View
              style={{
                width: 40,
                height: 4,
                borderRadius: 2,
                backgroundColor: colors.border,
                alignSelf: 'center',
                marginBottom: spacing.lg,
              }}
            />
            <Text style={[typography.h2, { color: colors.text, marginBottom: spacing.md }]}>
              Select {label.toLowerCase()}
            </Text>
            <FlatList
              data={options}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    onSelect(item);
                    setOpen(false);
                  }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingVertical: spacing.md,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                  }}
                >
                  <Text style={[typography.body, { color: colors.text }]}>{item}</Text>
                  {value === item && (
                    <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                  )}
                </Pressable>
              )}
              ListEmptyComponent={
                <Text style={[typography.body, { color: colors.textMuted, paddingVertical: spacing.lg }]}>
                  Nothing to show yet — pick the previous field first.
                </Text>
              }
              style={{ marginBottom: spacing.xl }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function OwnerTenantToggle({
  value,
  onChange,
}: {
  value: 'Owner' | 'Tenant';
  onChange: (v: 'Owner' | 'Tenant') => void;
}) {
  const { colors, radius, spacing, typography } = useTheme();
  const anim = useMemo(() => new Animated.Value(value === 'Owner' ? 0 : 1), []);

  const select = (v: 'Owner' | 'Tenant') => {
    onChange(v);
    Animated.spring(anim, { toValue: v === 'Owner' ? 0 : 1, useNativeDriver: false, speed: 20 }).start();
  };

  const translateX = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

  return (
    <View style={{ marginBottom: spacing.xl }}>
      <Text style={[typography.caption, { color: colors.textMuted, marginBottom: spacing.xs }]}>
        You are a
      </Text>
      <View
        style={{
          flexDirection: 'row',
          backgroundColor: colors.background,
          borderRadius: radius.md,
          padding: 4,
        }}
      >
        {(['Owner', 'Tenant'] as const).map((option) => {
          const active = value === option;
          return (
            <Pressable
              key={option}
              onPress={() => select(option)}
              style={{
                flex: 1,
                paddingVertical: spacing.sm + 2,
                borderRadius: radius.sm,
                alignItems: 'center',
                backgroundColor: active ? colors.surface : 'transparent',
                ...(active
                  ? { shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 2 }
                  : {}),
              }}
            >
              <Text
                style={[
                  typography.bodyMedium,
                  { color: active ? colors.primary : colors.textMuted },
                ]}
              >
                {option}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function RegisterScreen() {
  const { colors, spacing, typography } = useTheme();
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [society, setSociety] = useState('');
  const [block, setBlock] = useState('');
  const [flat, setFlat] = useState('');
  const [residentType, setResidentType] = useState<'Owner' | 'Tenant'>('Owner');

  const cities = Object.keys(DUMMY_DATA);
  const societies = city ? Object.keys((DUMMY_DATA as any)[city]) : [];
  const blocks = city && society ? Object.keys((DUMMY_DATA as any)[city][society]) : [];
  const flats = city && society && block ? (DUMMY_DATA as any)[city][society][block] : [];

  const resetFrom = (field: FieldKey) => {
    if (field === 'city') {
      setSociety('');
      setBlock('');
      setFlat('');
    } else if (field === 'society') {
      setBlock('');
      setFlat('');
    } else if (field === 'block') {
      setFlat('');
    }
  };

  const canSubmit = name.trim().length > 1 && city && society && block && flat;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingTop: spacing.xxxl, paddingBottom: spacing.xxxl }}
      keyboardShouldPersistTaps="handled"
    >
      <FadeSlideIn>
        <ScreenHeading
          title="Tell us about your home"
          subtitle="This helps your society admin verify and approve you faster."
        />
      </FadeSlideIn>

      <FadeSlideIn delay={80}>
        <Card>
          <Text style={[typography.caption, { color: colors.textMuted, marginBottom: spacing.xs }]}>
            Full name
          </Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="e.g. Anita Sharma"
            placeholderTextColor={colors.textMuted}
            style={[
              typography.bodyMedium,
              {
                color: colors.text,
                borderWidth: 1.5,
                borderColor: colors.border,
                borderRadius: 14,
                paddingHorizontal: spacing.lg,
                paddingVertical: spacing.md,
                marginBottom: spacing.lg,
              },
            ]}
          />

          <Dropdown
            label="City"
            value={city}
            placeholder="Select city"
            options={cities}
            onSelect={(v) => {
              setCity(v);
              resetFrom('city');
            }}
          />
          <Dropdown
            label="Society"
            value={society}
            placeholder={city ? 'Select society' : 'Select city first'}
            options={societies}
            disabled={!city}
            onSelect={(v) => {
              setSociety(v);
              resetFrom('society');
            }}
          />
          <Dropdown
            label="Block / Tower"
            value={block}
            placeholder={society ? 'Select block' : 'Select society first'}
            options={blocks}
            disabled={!society}
            onSelect={(v) => {
              setBlock(v);
              resetFrom('block');
            }}
          />
          <Dropdown
            label="Flat number"
            value={flat}
            placeholder={block ? 'Select flat' : 'Select block first'}
            options={flats}
            disabled={!block}
            onSelect={setFlat}
          />

          <OwnerTenantToggle value={residentType} onChange={setResidentType} />
        </Card>
      </FadeSlideIn>

      <FadeSlideIn delay={140} style={{ marginTop: spacing.xl }}>
        <PrimaryButton
          label="Submit for approval"
          icon="paper-plane"
          disabled={!canSubmit}
          onPress={() => router.push('/(auth)/pending')}
        />
      </FadeSlideIn>
    </ScrollView>
  );
}
