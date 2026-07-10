import React, { useCallback, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { BrandHeader } from '@/components/BrandHeader';
import { Button } from '@/components/Button';
import { useProfile } from '@/context/ProfileContext';
import { useEntitlement } from '@/context/EntitlementContext';
import { avatarApi } from '@/api';
import { colors, fontSize, fontWeight, radius, spacing } from '@/theme/theme';

/**
 * Profile tab. Mirrors the web `profile-view.tsx`: level progress toward the
 * next tier, lifetime stars, streak, lessons completed, badges, and account
 * actions (reset onboarding, sign out, delete account) wired to ProfileContext.
 */

function getLevelProgress(stars: number) {
  if (stars >= 1400) {
    return { current: 'Expert', next: null, inLevel: stars, needed: 0, pct: 100 };
  }
  if (stars >= 600) {
    return { current: 'Advanced', next: 'Expert', inLevel: stars - 600, needed: 800, pct: ((stars - 600) / 800) * 100 };
  }
  if (stars >= 200) {
    return { current: 'Intermediate', next: 'Advanced', inLevel: stars - 200, needed: 400, pct: ((stars - 200) / 400) * 100 };
  }
  return { current: 'Basic', next: 'Intermediate', inLevel: stars, needed: 200, pct: (stars / 200) * 100 };
}

export default function ProfileScreen() {
  const router = useRouter();
  const { profile, updateProfile, resetOnboarding, deleteAccount } = useProfile();
  const { entitled } = useEntitlement();
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const progress = getLevelProgress(profile.stars);
  const displayName = profile.name || profile.userName || 'Friend';

  const pickAvatar = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Enable photo library access in Settings to set a profile picture.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    setUploadingAvatar(true);
    try {
      const deviceId = profile.deviceId ?? 'unknown';
      const url = await avatarApi.uploadAvatar(asset.uri, deviceId);
      await updateProfile({ avatarSrc: url });
    } catch (err) {
      Alert.alert('Upload failed', 'Could not save your profile picture. Try again.');
    } finally {
      setUploadingAvatar(false);
    }
  }, [profile.deviceId, updateProfile]);

  const takePhoto = useCallback(async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Enable camera access in Settings to take a profile picture.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    setUploadingAvatar(true);
    try {
      const deviceId = profile.deviceId ?? 'unknown';
      const url = await avatarApi.uploadAvatar(asset.uri, deviceId);
      await updateProfile({ avatarSrc: url });
    } catch {
      Alert.alert('Upload failed', 'Could not save your profile picture. Try again.');
    } finally {
      setUploadingAvatar(false);
    }
  }, [profile.deviceId, updateProfile]);

  const confirmReset = useCallback(() => {
    Alert.alert('Restart Onboarding?', 'This will take you back through the setup quiz.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Restart',
        onPress: () => {
          void resetOnboarding();
          router.replace('/');
        },
      },
    ]);
  }, [resetOnboarding, router]);

  const confirmDelete = useCallback(() => {
    Alert.alert(
      'Delete My Data?',
      'This permanently removes your profile and progress from this device. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            void deleteAccount();
            router.replace('/');
          },
        },
      ],
    );
  }, [deleteAccount, router]);

  return (
    <Screen centered edges={['top']}>
      <BrandHeader title="Your Profile" />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.identity}>
          <Pressable
            onPress={() =>
              Alert.alert('Profile Photo', 'Choose a source', [
                { text: 'Photo Library', onPress: () => void pickAvatar() },
                { text: 'Camera', onPress: () => void takePhoto() },
                { text: 'Cancel', style: 'cancel' },
              ])
            }
            style={styles.avatarWrapper}
          >
            {profile.avatarSrc ? (
              <Image source={{ uri: profile.avatarSrc }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{displayName.charAt(0).toUpperCase()}</Text>
              </View>
            )}
            <View style={styles.avatarBadge}>
              <Text style={styles.avatarBadgeText}>{uploadingAvatar ? '…' : '📷'}</Text>
            </View>
          </Pressable>
          <Text style={styles.name}>{displayName}</Text>
          <View style={styles.pillRow}>
            {entitled && (
              <View style={styles.proBadge}>
                <Text style={styles.proBadgeText}>⭐ PRO</Text>
              </View>
            )}
            <View style={styles.levelPill}>
              <Text style={styles.levelText}>🏆 {progress.current}</Text>
            </View>
          </View>
        </View>

        {/* Level progress */}
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>Progress</Text>
            <Text style={styles.cardValue}>
              {progress.next ? `${progress.inLevel} / ${progress.needed}` : 'Maxed out!'}
            </Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${Math.min(progress.pct, 100)}%` }]} />
          </View>
          {progress.next ? (
            <Text style={styles.cardHint}>
              {Math.max(progress.needed - progress.inLevel, 0)} more stars to {progress.next}
            </Text>
          ) : (
            <Text style={styles.cardHint}>You've reached the highest level. 🌟</Text>
          )}
        </View>

        {/* Stats grid */}
        <View style={styles.statsRow}>
          <Stat label="Stars" value={`⭐ ${profile.stars}`} />
          <Stat label="Streak" value={`🔥 ${profile.streak}`} />
          <Stat label="Lessons" value={`📚 ${profile.lessonsCompleted?.length ?? 0}`} />
        </View>

        {/* Badges */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Badges</Text>
          {profile.badges && profile.badges.length > 0 ? (
            <View style={styles.badges}>
              {profile.badges.map((b) => (
                <View key={b} style={styles.badge}>
                  <Text style={styles.badgeText}>🎖️ {b}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.cardHint}>Complete lessons and chats to earn badges.</Text>
          )}
        </View>

        {/* Account actions */}
        <View style={styles.actions}>
          <Button title="Restart Onboarding" onPress={confirmReset} variant="secondary" />
          <Button title="Delete My Data" onPress={confirmDelete} variant="danger" />
        </View>
      </ScrollView>
    </Screen>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: { fontSize: fontSize.lg, fontWeight: fontWeight.black, color: colors.textPrimary },
  scroll: { padding: spacing.lg, gap: spacing.lg },
  identity: { alignItems: 'center', gap: spacing.sm },
  avatarWrapper: { position: 'relative', width: 88, height: 88 },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: { width: 88, height: 88, borderRadius: 44 },
  avatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarBadgeText: { fontSize: 13 },
  avatarText: { fontSize: fontSize.display, fontWeight: fontWeight.black, color: colors.textOnDark },
  name: { fontSize: fontSize.xl, fontWeight: fontWeight.black, color: colors.textPrimary },
  email: { fontSize: fontSize.sm, color: colors.textSecondary },
  pillRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.xs },
  proBadge: {
    backgroundColor: '#F2C740', // gold = Pro
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  proBadgeText: { fontSize: fontSize.sm, fontWeight: fontWeight.black, color: '#1A1A1A', letterSpacing: 0.5 },
  levelPill: {
    backgroundColor: colors.amberSoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  levelText: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.textPrimary },
  card: {
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardLabel: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.textPrimary },
  cardValue: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.textSecondary },
  cardHint: { fontSize: fontSize.sm, color: colors.textSecondary },
  progressTrack: {
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  progressFill: { height: 12, borderRadius: 6, backgroundColor: colors.primary },
  statsRow: { flexDirection: 'row', gap: spacing.md },
  stat: {
    flex: 1,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    gap: spacing.xs,
  },
  statValue: { fontSize: fontSize.lg, fontWeight: fontWeight.black, color: colors.textPrimary },
  statLabel: { fontSize: fontSize.xs, color: colors.textSecondary },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  badge: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  badgeText: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.primaryDark },
  actions: { gap: spacing.md, marginTop: spacing.sm },
});
