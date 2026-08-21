// components/forms/fields.tsx
// Small shared form primitives for admin "Add ___" screens (Add Payment,
// Add Expense). Kept minimal and dependency-free — no date-picker or
// select library installed, so SelectField/DateField use a lightweight
// bottom-sheet Modal instead.

import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, Pressable, Modal, FlatList, ActivityIndicator, KeyboardTypeOptions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

// ---------- Label ----------

function FieldLabel({ label, required }: { label: string; required?: boolean }) {
  const { colors, typography, spacing } = useTheme();
  return (
    <Text style={[typography.caption, { color: colors.text, marginBottom: spacing.xs }]}>
      {label}
      {required && <Text style={{ color: colors.danger }}> *</Text>}
    </Text>
  );
}

function fieldBoxStyle(colors: any, radius: any, spacing: any) {
  return {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
  };
}

// ---------- TextField ----------

export function TextField({
  label,
  required,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  multiline,
  style,
}: {
  label: string;
  required?: boolean;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  multiline?: boolean;
  style?: any;
}) {
  const { colors, radius, spacing, typography } = useTheme();
  return (
    <View style={[{ marginBottom: spacing.lg }, style]}>
      <FieldLabel label={label} required={required} />
      <View style={fieldBoxStyle(colors, radius, spacing)}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          keyboardType={keyboardType}
          multiline={multiline}
          style={[
            typography.body,
            {
              color: colors.text,
              paddingVertical: multiline ? spacing.md : spacing.md,
              minHeight: multiline ? 90 : undefined,
              textAlignVertical: multiline ? 'top' : 'center',
            },
          ]}
        />
      </View>
    </View>
  );
}

// ---------- SelectField ----------

export interface SelectOption {
  label: string;
  value: string;
}

export function SelectField({
  label,
  required,
  value,
  placeholder = 'Select',
  options,
  onSelect,
  style,
}: {
  label: string;
  required?: boolean;
  value: string;
  placeholder?: string;
  options: SelectOption[];
  onSelect: (opt: SelectOption) => void;
  style?: any;
}) {
  const { colors, radius, spacing, typography } = useTheme();
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <View style={[{ marginBottom: spacing.lg }, style]}>
      <FieldLabel label={label} required={required} />
      <Pressable
        onPress={() => setOpen(true)}
        style={[fieldBoxStyle(colors, radius, spacing), { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md }]}
      >
        <Text style={[typography.body, { flex: 1, color: selected ? colors.text : colors.textMuted }]}>
          {selected ? selected.label : placeholder}
        </Text>
        <Ionicons name="chevron-down" size={16} color={colors.textMuted} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={{ flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' }} onPress={() => setOpen(false)}>
          <Pressable
            style={{
              backgroundColor: colors.surfaceElevated,
              borderTopLeftRadius: radius.xl,
              borderTopRightRadius: radius.xl,
              paddingTop: spacing.lg,
              paddingBottom: spacing.xxl,
              maxHeight: '65%',
            }}
          >
            <Text style={[typography.h2, { color: colors.text, paddingHorizontal: spacing.xl, marginBottom: spacing.sm }]}>{label}</Text>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
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
                    paddingHorizontal: spacing.xl,
                    paddingVertical: spacing.md,
                  }}
                >
                  <Text style={[typography.body, { color: colors.text }]}>{item.label}</Text>
                  {item.value === value && <Ionicons name="checkmark" size={18} color={colors.accent} />}
                </Pressable>
              )}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

// ---------- DateField ----------
// No calendar library installed — a lightweight modal with a DD-MM-YYYY
// text entry, defaulting to today. `value`/`onChange` use ISO 'YYYY-MM-DD'.

function toDDMMYYYY(iso: string) {
  const [y, m, d] = iso.split('-');
  return d && m && y ? `${d}-${m}-${y}` : iso;
}

function toISO(ddmmyyyy: string): string | null {
  const match = ddmmyyyy.trim().match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (!match) return null;
  const [, d, m, y] = match;
  const date = new Date(Number(y), Number(m) - 1, Number(d));
  if (date.getFullYear() !== Number(y) || date.getMonth() !== Number(m) - 1 || date.getDate() !== Number(d)) return null;
  return `${y}-${m}-${d}`;
}

export function DateField({
  label,
  required,
  value,
  onChange,
  style,
}: {
  label: string;
  required?: boolean;
  value: string; // ISO 'YYYY-MM-DD'
  onChange: (iso: string) => void;
  style?: any;
}) {
  const { colors, radius, spacing, typography } = useTheme();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(toDDMMYYYY(value));
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setDraft(toDDMMYYYY(value));
      setError('');
    }
  }, [open, value]);

  const confirm = () => {
    const iso = toISO(draft);
    if (!iso) {
      setError('Use DD-MM-YYYY');
      return;
    }
    onChange(iso);
    setOpen(false);
  };

  return (
    <View style={[{ marginBottom: spacing.lg }, style]}>
      <FieldLabel label={label} required={required} />
      <Pressable
        onPress={() => setOpen(true)}
        style={[fieldBoxStyle(colors, radius, spacing), { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md }]}
      >
        <Text style={[typography.body, { flex: 1, color: colors.text }]}>{toDDMMYYYY(value)}</Text>
        <Ionicons name="calendar-outline" size={16} color={colors.textMuted} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={{ flex: 1, backgroundColor: colors.overlay, justifyContent: 'center', paddingHorizontal: spacing.xl }} onPress={() => setOpen(false)}>
          <Pressable
            style={{
              backgroundColor: colors.surfaceElevated,
              borderRadius: radius.lg,
              padding: spacing.xl,
            }}
          >
            <Text style={[typography.h2, { color: colors.text, marginBottom: spacing.md }]}>{label}</Text>
            <View style={fieldBoxStyle(colors, radius, spacing)}>
              <TextInput
                value={draft}
                onChangeText={setDraft}
                placeholder="DD-MM-YYYY"
                placeholderTextColor={colors.textMuted}
                keyboardType="number-pad"
                style={[typography.body, { color: colors.text, paddingVertical: spacing.md }]}
                autoFocus
              />
            </View>
            {!!error && <Text style={[typography.caption, { color: colors.danger, marginTop: spacing.xs }]}>{error}</Text>}
            <Pressable
              onPress={confirm}
              style={{ backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: spacing.md, alignItems: 'center', marginTop: spacing.lg }}
            >
              <Text style={[typography.bodyMedium, { color: colors.onPrimary }]}>Done</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

// ---------- ResidentField ----------
// Debounced search-as-you-type over admin-payments.residents.search,
// with results shown inline under the input.

export interface ResidentOption {
  userId: string;
  unitId: number;
  name: string;
  phone: string;
  flat: string;
  block: string;
}

export function ResidentField({
  label = 'Resident / Flat / Society',
  required,
  selected,
  onSelect,
  search,
  style,
}: {
  label?: string;
  required?: boolean;
  selected: ResidentOption | null;
  onSelect: (r: ResidentOption | null) => void;
  search: (query: string) => Promise<ResidentOption[]>;
  style?: any;
}) {
  const { colors, radius, spacing, typography } = useTheme();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ResidentOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!focused) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        setResults(await search(query));
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, focused]);

  const showDropdown = focused && (loading || results.length > 0 || query.length > 0);

  return (
    <View style={[{ marginBottom: spacing.lg, zIndex: 10 }, style]}>
      <FieldLabel label={label} required={required} />
      {selected ? (
        <View
          style={[
            fieldBoxStyle(colors, radius, spacing),
            { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm },
          ]}
        >
          <View style={{ flex: 1 }}>
            <Text style={[typography.bodyMedium, { color: colors.text }]}>{selected.name}</Text>
            <Text style={[typography.caption, { color: colors.textMuted, marginTop: 2 }]}>
              {selected.block} · {selected.flat}
            </Text>
          </View>
          <Pressable
            onPress={() => {
              onSelect(null);
              setQuery('');
            }}
            hitSlop={10}
          >
            <Ionicons name="close-circle" size={20} color={colors.textMuted} />
          </Pressable>
        </View>
      ) : (
        <View>
          <View style={[fieldBoxStyle(colors, radius, spacing), { flexDirection: 'row', alignItems: 'center' }]}>
            <Ionicons name="search-outline" size={16} color={colors.textMuted} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              onFocus={() => setFocused(true)}
              onBlur={() => setTimeout(() => setFocused(false), 150)}
              placeholder="Search by name, flat, or society"
              placeholderTextColor={colors.textMuted}
              style={[typography.body, { flex: 1, color: colors.text, paddingVertical: spacing.md, paddingLeft: spacing.sm }]}
            />
          </View>

          {showDropdown && (
            <View
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: radius.md,
                backgroundColor: colors.surfaceElevated,
                marginTop: spacing.xs,
                overflow: 'hidden',
              }}
            >
              {loading ? (
                <View style={{ padding: spacing.md, alignItems: 'center' }}>
                  <ActivityIndicator color={colors.textMuted} size="small" />
                </View>
              ) : results.length === 0 ? (
                <Text style={[typography.caption, { color: colors.textMuted, padding: spacing.md }]}>
                  No residents found
                </Text>
              ) : (
                results.map((r) => (
                  <Pressable
                    key={r.userId}
                    onPress={() => {
                      onSelect(r);
                      setFocused(false);
                    }}
                    style={{ paddingHorizontal: spacing.md, paddingVertical: spacing.md, borderTopWidth: 1, borderTopColor: colors.border }}
                  >
                    <Text style={[typography.bodyMedium, { color: colors.text }]}>{r.name}</Text>
                    <Text style={[typography.caption, { color: colors.textMuted, marginTop: 2 }]}>
                      {r.block} · {r.flat} {r.phone ? `· ${r.phone}` : ''}
                    </Text>
                  </Pressable>
                ))
              )}
            </View>
          )}
        </View>
      )}
    </View>
  );
}
