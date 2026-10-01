import React, { useCallback } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Button } from '@/components/Button';
import { useProfile } from '@/context/ProfileContext';
import { colors, fontSize, fontWeight, radius, spacing } from '@/theme/theme';

export default function ProfileScreen() {
  const router = useRouter();
  const { profile, resetOnboarding, deleteAccount } = useProfile();
  const displayName = profile.name || profile.userName || 'User';
  const completedLessons = profile.lessonsCompleted?.length ?? 0;

  const confirmReset = useCallback(() => {
    Alert.alert('Start over?', 'This will return you to onboarding and reset the profile and progress on this device.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Start over',
        onPress: () => {
          void resetOnboarding();
          router.replace('/');
        },
      },
    ]);
  }, [resetOnboarding, router]);

  const confirmDelete = useCallback(() => {
    Alert.alert('Delete your data?', 'This permanently removes your profile and progress from this device. This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete my data',
        style: 'destructive',
        onPress: () => {
          void deleteAccount();
          router.replace('/');
        },
      },
    ]);
  }, [deleteAccount, router]);

  return (
    <Screen centered edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.identity}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{displayName.charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={styles.name}>{displayName}</Text>
          <Text style={styles.title}>Your Profile</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Your learning</Text>
          <Text style={styles.cardHint}>
            {completedLessons === 0
              ? 'Your completed lessons will appear here as you learn.'
              : `${completedLessons} ${completedLessons === 1 ? 'lesson' : 'lessons'} completed.`}
          </Text>
          <View style={styles.rows}>
            <ProfileRow label="Starting point" value={profile.level || 'Beginner'} />
            <ProfileRow label="Companion" value={profile.persona || 'Not set'} />
            <ProfileRow label="Age range" value={profile.age || 'Not shared'} />
            <ProfileRow label="Lessons completed" value={String(completedLessons)} last />
          </View>
        </View>

        <View style={styles.actions}>
          <Button title="Start over" onPress={confirmReset} variant="secondary" />
          <Button title="Delete my data" onPress={confirmDelete} variant="danger" />
        </View>
      </ScrollView>
    </Screen>
  );
}

function ProfileRow({ label, value, last = false }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.row, !last && styles.rowBorder]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.xl, gap: spacing.xl },
  identity: { alignItems: 'center', gap: spacing.xs },
  avatar: { width: 76, height: 76, borderRadius: 38, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  avatarText: { fontSize: fontSize.xxl, fontWeight: fontWeight.bold, color: colors.textOnDark },
  name: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.textPrimary },
  title: { fontSize: fontSize.md, color: colors.textSecondary },
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.md },
  cardTitle: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.textPrimary },
  cardHint: { fontSize: fontSize.sm, lineHeight: 23, color: colors.textSecondary },
  rows: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, overflow: 'hidden' },
  row: { minHeight: 52, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  rowLabel: { flex: 1, fontSize: fontSize.sm, color: colors.textSecondary },
  rowValue: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.textPrimary, textAlign: 'right' },
  actions: { gap: spacing.md, marginTop: spacing.sm },
});
