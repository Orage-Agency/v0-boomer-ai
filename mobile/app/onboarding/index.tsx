import React, { useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Button } from '@/components/Button';
import { useProfile } from '@/context/ProfileContext';
import { colors, fontSize, fontWeight, radius, spacing } from '@/theme/theme';

/** The mobile onboarding mirrors the web flow with platform-native controls. */

type Step = 'avatar' | 'age' | 'level';

const AVATARS = [
  {
    name: 'Angela',
    userTitle: 'Ms. Amis',
    image:
      'https://storage.googleapis.com/msgsndr/651kIrlKk834C2FEl66i/media/68cc6833d74f6bc1c662a144.jpeg',
  },
  {
    name: 'Dave',
    userTitle: 'Dave',
    image:
      'https://storage.googleapis.com/msgsndr/651kIrlKk834C2FEl66i/media/68cc69bd09fa3e4671b9618e.jpeg',
  },
];

const AGE_RANGES = ['50-59', '60-69', '70-79', '80+'];

const LEVELS = [
  { name: 'Beginner', desc: 'I am new to AI and want practical examples.' },
  { name: 'Intermediate', desc: 'I know a few basics and want to do more.' },
  { name: 'Advanced', desc: 'I use AI regularly and want to explore further.' },
];

function normalizeLevel(level: string | null | undefined): string {
  if (level === 'Intermediate' || level === 'Advanced') return level;
  return 'Beginner';
}

export default function Onboarding() {
  const router = useRouter();
  const { profile, updateProfile, setView } = useProfile();

  const [step, setStep] = useState<Step>('avatar');
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState('Beginner');

  const stepNumber = { avatar: 1, age: 2, level: 3 }[step];

  const completeAvatar = () => {
    const avatar = AVATARS.find((a) => a.name === selectedAvatar);
    if (!avatar || !name.trim()) return;
    updateProfile({
      persona: avatar.name,
      userTitle: avatar.userTitle,
      avatarSrc: avatar.image,
      userName: name.trim(),
      name: name.trim(),
    });
    setStep('age');
  };

  const completeAge = (age: string | null) => {
    updateProfile({ age, aiLevel: 0 });
    setSelectedLevel(normalizeLevel(profile.level));
    setStep('level');
  };

  const skipOnboarding = () => {
    updateProfile({ aiLevel: 0, level: normalizeLevel(profile.level) });
    setView('app');
    router.replace('/(tabs)');
  };

  const completeLevel = () => {
    updateProfile({ level: selectedLevel, aiLevel: 0 });
    setView('app');
    router.replace('/(tabs)');
  };

  return (
    <Screen centered>
      <View style={styles.progressHeader}>
        <Stepper current={stepNumber} total={3} />
        <Pressable
          onPress={skipOnboarding}
          style={styles.skipButton}
          accessibilityRole="button"
          accessibilityLabel="Skip for now"
        >
          <Text style={styles.skipText}>Skip for now</Text>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {step === 'avatar' && (
          <View style={styles.section}>
            <Text style={styles.bigTitle}>Choose Your Friendly Guide</Text>
            <Text style={styles.subtitle}>Pick a companion for your AI adventure!</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="words"
              accessibilityLabel="Your name"
            />
            <View style={styles.avatarRow}>
              {AVATARS.map((a) => {
                const active = selectedAvatar === a.name;
                return (
                  <Pressable
                    key={a.name}
                    onPress={() => setSelectedAvatar(a.name)}
                    style={[styles.avatarCard, active && styles.avatarCardActive]}
                    accessibilityRole="button"
                    accessibilityLabel={`Choose ${a.name}`}
                  >
                    <Image source={{ uri: a.image }} style={styles.avatarImg} />
                    <Text style={styles.avatarName}>{a.name}</Text>
                  </Pressable>
                );
              })}
            </View>
            <Button
              title="Let's Get Started!"
              onPress={completeAvatar}
              disabled={!selectedAvatar || !name.trim()}
            />
          </View>
        )}

        {step === 'age' && (
          <View style={styles.section}>
            <Text style={styles.bigTitle}>Would you like to share your age range?</Text>
            <Text style={styles.subtitle}>This is optional. You can change it later.</Text>
            <View style={styles.optionList}>
              {AGE_RANGES.map((age) => (
                <Pressable
                  key={age}
                  onPress={() => completeAge(age)}
                  style={styles.optionRow}
                  accessibilityRole="button"
                  accessibilityLabel={`Age ${age}`}
                >
                  <Text style={styles.optionText}>{age}</Text>
                </Pressable>
              ))}
            </View>
            <Button title="Prefer not to say" onPress={() => completeAge(null)} variant="secondary" />
          </View>
        )}

        {step === 'level' && (
          <View style={styles.section}>
            <Text style={styles.bigTitle}>How would you like to begin?</Text>
            <Text style={styles.subtitle}>Choose a starting point. You can change it whenever you like.</Text>
            <View style={styles.optionList}>
              {LEVELS.map((lvl) => {
                const active = selectedLevel === lvl.name;
                return (
                  <Pressable
                    key={lvl.name}
                    onPress={() => setSelectedLevel(lvl.name)}
                    style={[styles.levelCard, active && styles.levelCardActive]}
                    accessibilityRole="button"
                    accessibilityLabel={lvl.name}
                    accessibilityState={{ selected: active }}
                  >
                    <View style={styles.flex}>
                      <Text style={styles.levelName}>{lvl.name}</Text>
                      <Text style={styles.levelDesc}>{lvl.desc}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
            <Button title="Continue" onPress={completeLevel} />
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

function Stepper({ current, total }: { current: number; total: number }) {
  return (
    <View style={styles.progress}>
      <Text style={styles.progressText}>Step {current} of {total}</Text>
      <View
        style={styles.progressTrack}
        accessibilityRole="progressbar"
        accessibilityLabel={`Onboarding step ${current} of ${total}`}
        accessibilityValue={{ min: 1, max: total, now: current }}
      >
        <View style={[styles.progressFill, { width: `${(current / total) * 100}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: spacing.xl },
  section: { gap: spacing.lg },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
  progress: { flex: 1, gap: spacing.xs },
  progressText: { fontSize: fontSize.sm, color: colors.textSecondary, fontWeight: fontWeight.semibold },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.ink,
  },
  skipButton: {
    minHeight: 44,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipText: { fontSize: fontSize.sm, color: colors.textPrimary, fontWeight: fontWeight.semibold, textDecorationLine: 'underline' },
  bigTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.black,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  bold: { fontWeight: fontWeight.bold, color: colors.textPrimary },
  input: {
    minHeight: 56,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    fontSize: fontSize.md,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  avatarRow: { flexDirection: 'row', gap: spacing.md },
  avatarCard: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    gap: spacing.sm,
  },
  avatarCardActive: { borderColor: colors.primary },
  avatarImg: { width: 80, height: 80, borderRadius: 40 },
  avatarName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  optionList: { gap: spacing.md },
  optionRow: {
    minHeight: 56,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  optionText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  optionTextLeft: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    width: '100%',
  },
  levelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  levelCardActive: { borderColor: colors.ink, backgroundColor: colors.surfaceSubtle },
  levelName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  levelDesc: { fontSize: fontSize.xs, color: colors.textSecondary, lineHeight: 18 },
});
