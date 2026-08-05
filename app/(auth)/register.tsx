// app/(auth)/register.tsx
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Card, FadeSlideIn, PrimaryButton, ScreenHeading } from '../../components/ui';
import { useTheme } from '../../context/ThemeContext';
import { ApiError } from '../../services/api';
import {
  listBlocks,
  listCitiesByDistrict,
  listDistricts,
  listProperties,
  listSocieties,
  registerUser,
} from '../../services/endpoints';

function Dropdown({
  label,
  value,
  placeholder,
  options,
  disabled,
  loading,
  onSelect,
}: {
  label: string;
  value: string;
  placeholder: string;
  options: string[];
  disabled?: boolean;
  loading?: boolean;
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
        disabled={disabled || loading}
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
        {loading ? (
          <ActivityIndicator size="small" color={colors.textMuted} />
        ) : (
          <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
        )}
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
              <Text style={[typography.bodyMedium, { color: active ? colors.primary : colors.textMuted }]}>
                {option}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function LabeledInput({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  keyboardType?: 'default' | 'email-address';
}) {
  const { colors, spacing, typography } = useTheme();
  return (
    <>
      <Text style={[typography.caption, { color: colors.textMuted, marginBottom: spacing.xs }]}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        keyboardType={keyboardType ?? 'default'}
        autoCapitalize={keyboardType === 'email-address' ? 'none' : 'words'}
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
    </>
  );
}

// Simple {id,label} pair used across every cascading level below.
type Option = { id: string | number; label: string };

export default function RegisterScreen() {
  const { colors, spacing, typography } = useTheme();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const [districts, setDistricts] = useState<string[]>([]);
  const [district, setDistrict] = useState('');

  const [cities, setCities] = useState<Option[]>([]);
  const [city, setCity] = useState<Option | null>(null);

  const [societies, setSocieties] = useState<Option[]>([]);
  const [society, setSociety] = useState<Option | null>(null);

  const [blocks, setBlocks] = useState<Option[]>([]);
  const [block, setBlock] = useState<Option | null>(null);

  const [properties, setProperties] = useState<Option[]>([]);
  const [flat, setFlat] = useState<Option | null>(null);

  const [residentType, setResidentType] = useState<'Owner' | 'Tenant'>('Owner');

  const [loadingLevel, setLoadingLevel] = useState<'' | 'cities' | 'societies' | 'blocks' | 'properties'>('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Districts load once on mount.
  useEffect(() => {
    listDistricts()
      .then((res) => setDistricts(res.districts))
      .catch(() => setError('Could not load districts. Pull to retry.'));
  }, []);

  const selectDistrict = async (value: string) => {
    setDistrict(value);
    setCity(null);
    setSociety(null);
    setBlock(null);
    setFlat(null);
    setSocieties([]);
    setBlocks([]);
    setProperties([]);
    setLoadingLevel('cities');
    try {
      const res = await listCitiesByDistrict(value);
      setCities(res.cities.map((c) => ({ id: c.id, label: c.name })));
    } catch {
      setError('Could not load cities for this district.');
    } finally {
      setLoadingLevel('');
    }
  };

  const selectCity = async (label: string) => {
    const selected = cities.find((c) => c.label === label) ?? null;
    setCity(selected);
    setSociety(null);
    setBlock(null);
    setFlat(null);
    setBlocks([]);
    setProperties([]);
    if (!selected) return;
    setLoadingLevel('societies');
    try {
      const res = await listSocieties(String(selected.id));
      setSocieties(res.societies.map((s) => ({ id: s.id, label: s.name })));
    } catch {
      setError('Could not load societies for this city.');
    } finally {
      setLoadingLevel('');
    }
  };

  const selectSociety = async (label: string) => {
    const selected = societies.find((s) => s.label === label) ?? null;
    setSociety(selected);
    setBlock(null);
    setFlat(null);
    setProperties([]);
    if (!selected) return;
    setLoadingLevel('blocks');
    try {
      const res = await listBlocks(Number(selected.id));
      setBlocks(res.blocks.map((b) => ({ id: b.id, label: b.buildingName })));
    } catch {
      setError('Could not load blocks for this society.');
    } finally {
      setLoadingLevel('');
    }
  };

  const selectBlock = async (label: string) => {
    const selected = blocks.find((b) => b.label === label) ?? null;
    setBlock(selected);
    setFlat(null);
    if (!selected || !society) return;
    setLoadingLevel('properties');
    try {
      const res = await listProperties(Number(society.id), Number(selected.id));
      // Only vacant flats are selectable — the backend would reject an
      // occupied one anyway, so filter here for a cleaner picking experience.
      setProperties(
        res.properties.filter((p) => p.status === 'vacant').map((p) => ({ id: p.id, label: p.unitNumber }))
      );
    } catch {
      setError('Could not load flats for this block.');
    } finally {
      setLoadingLevel('');
    }
  };

  const canSubmit =
    name.trim().length > 1 &&
    /\S+@\S+\.\S+/.test(email) &&
    district &&
    city &&
    society &&
    block &&
    flat &&
    !submitting;

  const handleSubmit = async () => {
    if (!canSubmit || !society || !flat) return;
    setSubmitting(true);
    setError('');
    try {
      await registerUser({
        name: name.trim(),
        email: email.trim(),
        societyId: Number(society.id),
        unitId: Number(flat.id),
        memberType: residentType === 'Owner' ? 'owner' : 'tenant',
        city: city?.label,
      });
      router.replace('/(auth)/pending');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not submit registration. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

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
          <LabeledInput label="Full name" value={name} onChangeText={setName} placeholder="Enter full name" />
          <LabeledInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="example@email.com"
            keyboardType="email-address"
          />

          <Dropdown
            label="District"
            value={district}
            placeholder="Select district"
            options={districts}
            onSelect={selectDistrict}
          />
          <Dropdown
            label="City"
            value={city?.label ?? ''}
            placeholder={district ? 'Select city' : 'Select district first'}
            options={cities.map((c) => c.label)}
            disabled={!district}
            loading={loadingLevel === 'cities'}
            onSelect={selectCity}
          />
          <Dropdown
            label="Society"
            value={society?.label ?? ''}
            placeholder={city ? 'Select society' : 'Select city first'}
            options={societies.map((s) => s.label)}
            disabled={!city}
            loading={loadingLevel === 'societies'}
            onSelect={selectSociety}
          />
          <Dropdown
            label="Block / Tower"
            value={block?.label ?? ''}
            placeholder={society ? 'Select block' : 'Select society first'}
            options={blocks.map((b) => b.label)}
            disabled={!society}
            loading={loadingLevel === 'blocks'}
            onSelect={selectBlock}
          />
          <Dropdown
            label="Flat number"
            value={flat?.label ?? ''}
            placeholder={block ? 'Select flat' : 'Select block first'}
            options={properties.map((p) => p.label)}
            disabled={!block}
            loading={loadingLevel === 'properties'}
            onSelect={(label) => setFlat(properties.find((p) => p.label === label) ?? null)}
          />

          <OwnerTenantToggle value={residentType} onChange={setResidentType} />
        </Card>
      </FadeSlideIn>

      {!!error && (
        <FadeSlideIn>
          <Text style={[typography.caption, { color: colors.danger, marginTop: spacing.md, textAlign: 'center' }]}>
            {error}
          </Text>
        </FadeSlideIn>
      )}

      <FadeSlideIn delay={140} style={{ marginTop: spacing.xl }}>
        <PrimaryButton
          label="Submit for approval"
          icon="paper-plane"
          disabled={!canSubmit}
          loading={submitting}
          onPress={handleSubmit}
        />
      </FadeSlideIn>
    </ScrollView>
  );
}
