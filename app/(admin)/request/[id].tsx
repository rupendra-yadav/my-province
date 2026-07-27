// app/(admin)/request/[id].tsx
import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, Pressable, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../../context/ThemeContext';
import { useRequests } from '../../../context/RequestsContext';
import { Card, FadeSlideIn, PrimaryButton, GhostButton, StatusChip, IconBadge } from '../../../components/ui';

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
      <Text style={[typography.bodyMedium, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

export default function RequestDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, spacing, radius, typography } = useTheme();
  const { getById, approve, reject } = useRequests();
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState('');

  const request = getById(id);

  if (!request) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={[typography.body, { color: colors.textMuted }]}>Request not found.</Text>
      </View>
    );
  }

  const handleApprove = async () => {
    setSubmitting(true);
    setActionError('');
    try {
      await approve(request.id);
      router.back();
    } catch (err) {
      setActionError('Could not approve this request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!reason.trim()) return;
    setSubmitting(true);
    setActionError('');
    try {
      await reject(request.id, reason.trim());
      setRejecting(false);
      router.back();
    } catch (err) {
      setActionError('Could not reject this request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: spacing.xl,
          paddingTop: spacing.xxxl,
          paddingBottom: spacing.md,
        }}
      >
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={[typography.h2, { color: colors.text, marginLeft: spacing.md }]}>
          Registration request
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingBottom: spacing.xxxl }}
        keyboardShouldPersistTaps="handled"
      >
        <FadeSlideIn>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg }}>
            <IconBadge name="person-outline" size={52} />
            <View style={{ marginLeft: spacing.md, flex: 1 }}>
              <Text style={[typography.h1, { color: colors.text }]}>{request.name}</Text>
              <Text style={[typography.caption, { color: colors.textMuted, marginTop: 2 }]}>
                +91 {request.phone}
              </Text>
            </View>
            <StatusChip status={request.status} />
          </View>
        </FadeSlideIn>

        <FadeSlideIn delay={60}>
          <Card style={{ marginBottom: spacing.lg }}>
            <InfoRow icon="location-outline" label="City" value={request.city} />
            <InfoRow icon="business-outline" label="Society" value={request.society} />
            <InfoRow icon="layers-outline" label="Block / Tower" value={request.block} />
            <InfoRow icon="home-outline" label="Flat" value={request.flat} />
            <InfoRow icon="key-outline" label="Resident type" value={request.residentType} />
            <InfoRow
              icon="calendar-outline"
              label="Submitted"
              value={new Date(request.submittedAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            />
          </Card>
        </FadeSlideIn>

        {request.status === 'rejected' && request.rejectionReason && (
          <FadeSlideIn delay={100}>
            <Card style={{ marginBottom: spacing.lg, borderColor: colors.dangerBg }}>
              <Text style={[typography.caption, { color: colors.textMuted, marginBottom: spacing.xs }]}>
                Rejection reason
              </Text>
              <Text style={[typography.body, { color: colors.text }]}>{request.rejectionReason}</Text>
            </Card>
          </FadeSlideIn>
        )}

        {!!actionError && (
          <FadeSlideIn>
            <Text style={[typography.caption, { color: colors.danger, marginBottom: spacing.md }]}>
              {actionError}
            </Text>
          </FadeSlideIn>
        )}

        {request.status === 'pending' && (
          <FadeSlideIn delay={120} style={{ flexDirection: 'row', gap: spacing.md }}>
            <GhostButton label="Reject" icon="close" onPress={() => !submitting && setRejecting(true)} style={{ flex: 1 }} />
            <PrimaryButton label="Approve" icon="checkmark" loading={submitting} onPress={handleApprove} style={{ flex: 1 }} />
          </FadeSlideIn>
        )}
      </ScrollView>

      <Modal visible={rejecting} transparent animationType="fade" onRequestClose={() => setRejecting(false)}>
        <Pressable
          style={{ flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' }}
          onPress={() => setRejecting(false)}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{
              backgroundColor: colors.surface,
              borderTopLeftRadius: radius.xl,
              borderTopRightRadius: radius.xl,
              padding: spacing.xl,
            }}
          >
            <Text style={[typography.h2, { color: colors.text, marginBottom: spacing.xs }]}>
              Reason for rejection
            </Text>
            <Text style={[typography.caption, { color: colors.textMuted, marginBottom: spacing.md }]}>
              This will be shown to {request.name}.
            </Text>
            <TextInput
              value={reason}
              onChangeText={setReason}
              placeholder="e.g. Flat already has a registered resident"
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={3}
              style={[
                typography.body,
                {
                  color: colors.text,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: radius.md,
                  padding: spacing.md,
                  minHeight: 88,
                  textAlignVertical: 'top',
                  marginBottom: spacing.lg,
                },
              ]}
            />
            <View style={{ flexDirection: 'row', gap: spacing.md }}>
              <GhostButton label="Cancel" onPress={() => setRejecting(false)} style={{ flex: 1 }} />
              <PrimaryButton
                label="Confirm reject"
                disabled={!reason.trim()}
                loading={submitting}
                onPress={handleReject}
                style={{ flex: 1 }}
              />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
