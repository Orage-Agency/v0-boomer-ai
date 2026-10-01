import React, { useCallback, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Button } from '@/components/Button';
import { useProfile } from '@/context/ProfileContext';
import { useAuth } from '@/context/AuthContext';
import { colors, fontSize, fontWeight, radius, spacing } from '@/theme/theme';

const ASSISTANTS = [
  { name: 'Assistant woman', image: '/assistants/assistant_woman.png', source: require('../../assets/assistants/assistant_woman.png') },
  { name: 'Assistant man', image: '/assistants/assistant_man.png', source: require('../../assets/assistants/assistant_man.png') },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { profile, updateProfile, resetOnboarding, deleteAccount } = useProfile();
  const { user, signOut } = useAuth();
  const displayName = profile.name || profile.userName || 'User';
  const completedLessons = profile.lessonsCompleted?.length ?? 0;
  const [editorVisible, setEditorVisible] = useState(false);
  const [draftName, setDraftName] = useState(displayName);
  const [draftAssistant, setDraftAssistant] = useState(profile.assistantSrc ?? ASSISTANTS[0].image);

  const openEditor = useCallback(() => {
    setDraftName(displayName);
    setDraftAssistant(profile.assistantSrc ?? ASSISTANTS[0].image);
    setEditorVisible(true);
  }, [displayName, profile]);

  const saveCustomization = useCallback(() => {
    updateProfile({
      name: draftName.trim() || displayName,
      userName: draftName.trim() || displayName,
      persona: null,
      userTitle: null,
      avatarSrc: null,
      avatarBackground: 'white',
      assistantSrc: draftAssistant,
      assistantBackground: 'white',
    });
    setEditorVisible(false);
  }, [displayName, draftName, draftAssistant, updateProfile]);

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
          <Text style={styles.name}>{displayName}</Text>
          <Pressable
            onPress={editorVisible ? () => setEditorVisible(false) : openEditor}
            style={styles.customizeButton}
            accessibilityRole="button"
            accessibilityState={{ expanded: editorVisible }}
          >
            <Text style={styles.customizeButtonText}>{editorVisible ? 'Close personalization' : 'Personalize profile'}</Text>
          </Pressable>
        </View>

        {editorVisible && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Personalize your profile</Text>
            <Text style={styles.cardHint}>Change your name or choose an assistant picture.</Text>
            <Text style={styles.editorLabel}>Your name</Text>
            <TextInput
              style={styles.nameInput}
              value={draftName}
              onChangeText={setDraftName}
              placeholder="Your name"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="words"
              accessibilityLabel="Your name"
            />
            <Text style={styles.editorLabel}>Assistant picture</Text>
            <View style={styles.assistantChoices}>
              {ASSISTANTS.map((assistant) => {
                const selected = draftAssistant === assistant.image;
                return (
                  <Pressable
                    key={assistant.image}
                    onPress={() => setDraftAssistant(assistant.image)}
                    style={[styles.assistantChoice, selected && styles.choiceSelected]}
                    accessibilityRole="button"
                    accessibilityLabel={`Choose ${assistant.name}`}
                    accessibilityState={{ selected }}
                  >
                    <View style={styles.choiceImageBg}>
                      <Image source={assistant.source} style={styles.choiceImage} />
                    </View>
                    <Text style={styles.choiceName}>{assistant.name}</Text>
                  </Pressable>
                );
              })}
            </View>
            <Button title="Save profile" onPress={saveCustomization} />
          </View>
        )}

        <View style={styles.accountCard}>
          <Text style={styles.cardTitle}>Your account</Text>
          {user && !user.id.startsWith('bypass:') ? (
            <>
              <Text style={styles.cardHint}>Signed in as {user.email}. Your account can keep progress across devices.</Text>
              <Button title="Sign out" onPress={() => void signOut()} variant="secondary" />
            </>
          ) : (
            <>
              <Text style={styles.cardHint}>Create an account or sign in to keep your learning progress across devices.</Text>
              <Button title="Sign in or create account" onPress={() => router.push('/login')} />
            </>
          )}
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
  customizeButton: { minHeight: 44, justifyContent: 'center', paddingHorizontal: spacing.md },
  customizeButtonText: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.primary, textDecorationLine: 'underline' },
  name: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.textPrimary },
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.md },
  accountCard: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.md },
  cardTitle: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.textPrimary },
  cardHint: { fontSize: fontSize.sm, lineHeight: 23, color: colors.textSecondary },
  editorLabel: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.textPrimary, marginTop: spacing.sm },
  nameInput: { minHeight: 52, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md, fontSize: fontSize.md, color: colors.textPrimary },
  assistantChoices: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  assistantChoice: { minWidth: 112, alignItems: 'center', padding: spacing.xs, borderWidth: 1, borderColor: 'transparent', borderRadius: radius.md },
  choiceSelected: { borderColor: colors.ink },
  choiceImageBg: { width: 64, height: 64, borderRadius: 32, overflow: 'hidden', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: colors.border },
  choiceImage: { width: '100%', height: '100%' },
  choiceName: { marginTop: spacing.xs, textAlign: 'center', fontSize: fontSize.xs, color: colors.textPrimary },
  rows: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, overflow: 'hidden' },
  row: { minHeight: 52, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  rowLabel: { flex: 1, fontSize: fontSize.sm, color: colors.textSecondary },
  rowValue: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.textPrimary, textAlign: 'right' },
  actions: { gap: spacing.md, marginTop: spacing.sm },
});
