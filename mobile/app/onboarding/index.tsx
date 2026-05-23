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

/**
 * Onboarding wizard — FULLY IMPLEMENTED.
 * Steps mirror the web app exactly:
 *   1. Avatar + name  2. Age range  3. 3-question quiz  4. Learning level
 * Scoring + recommended-level logic copied from app/page.tsx + quiz.tsx.
 */

type Step = 'avatar' | 'age' | 'quiz' | 'level';

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

const QUIZ = [
  {
    question: "How familiar are you with 'AI'?",
    answers: [
      { text: "Never heard of it.", value: 1 },
      { text: "Heard of it, don't know what it is.", value: 2 },
      { text: 'I have a basic idea.', value: 3 },
      { text: 'I understand it well.', value: 4 },
    ],
  },
  {
    question: 'Have you used a voice assistant?',
    answers: [
      { text: 'Never.', value: 1 },
      { text: 'A few times.', value: 2 },
      { text: 'Yes, regularly.', value: 3 },
      { text: 'I use it daily.', value: 4 },
    ],
  },
  {
    question: 'How comfortable are you with new tech?',
    answers: [
      { text: 'Not comfortable at all.', value: 1 },
      { text: 'A bit nervous, but willing.', value: 2 },
      { text: 'Comfortable with guidance.', value: 3 },
      { text: 'Excited to learn!', value: 4 },
    ],
  },
];

const LEVELS = [
  { name: 'Absolute Beginner', emoji: '👶', desc: "Brand new to tech. We'll start from the very beginning." },
  { name: 'Beginner', emoji: '✨', desc: 'Start from the basics. No prior AI experience needed.' },
  { name: 'Intermediate', emoji: '⚡', desc: "You've tried tech and want practical workflows." },
  { name: 'Advanced', emoji: '🧠', desc: 'Dive deep into capabilities and customization.' },
];

function recommendFromScore(score: number): string {
  if (score > 7) return 'Advanced';
  if (score > 5) return 'Intermediate';
  if (score > 3) return 'Beginner';
  return 'Absolute Beginner';
}

export default function Onboarding() {
  const router = useRouter();
  const { updateProfile, setView } = useProfile();

  const [step, setStep] = useState<Step>('avatar');
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [quizIndex, setQuizIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [recommended, setRecommended] = useState('Beginner');
  const [selectedLevel, setSelectedLevel] = useState('Beginner');

  const stepNumber = { avatar: 1, age: 2, quiz: 3, level: 4 }[step];

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

  const completeAge = (age: string) => {
    updateProfile({ age, aiLevel: 0 });
    setStep('quiz');
  };

  const answerQuiz = (value: number) => {
    const newScore = score + value;
    if (quizIndex < QUIZ.length - 1) {
      setScore(newScore);
      setQuizIndex(quizIndex + 1);
    } else {
      const rec = recommendFromScore(newScore);
      setRecommended(rec);
      setSelectedLevel(rec);
      updateProfile({ aiLevel: newScore, level: rec });
      setStep('level');
    }
  };

  const completeLevel = () => {
    // Matches web: seed 5 stars + "Getting Started" badge, enter app.
    updateProfile({ level: selectedLevel, stars: 5, badges: ['Getting Started'] });
    setView('app');
    router.replace('/(tabs)');
  };

  return (
    <Screen centered>
      <Stepper current={stepNumber} total={4} />
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
            <Text style={styles.bigTitle}>Your age range?</Text>
            <Text style={styles.subtitle}>This helps tailor tips and font sizes.</Text>
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
          </View>
        )}

        {step === 'quiz' && (
          <View style={styles.section}>
            <Text style={styles.bigTitle}>{QUIZ[quizIndex].question}</Text>
            <View style={styles.optionList}>
              {QUIZ[quizIndex].answers.map((a) => (
                <Pressable
                  key={a.text}
                  onPress={() => answerQuiz(a.value)}
                  style={styles.optionRow}
                  accessibilityRole="button"
                  accessibilityLabel={a.text}
                >
                  <Text style={styles.optionTextLeft}>{a.text}</Text>
                </Pressable>
              ))}
            </View>
            <Text style={styles.progress}>
              Question {quizIndex + 1} of {QUIZ.length}
            </Text>
          </View>
        )}

        {step === 'level' && (
          <View style={styles.section}>
            <Text style={styles.bigTitle}>Choose Your Learning Level</Text>
            <Text style={styles.subtitle}>
              We recommend <Text style={styles.bold}>{recommended}</Text>
            </Text>
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
                  >
                    <Text style={styles.levelEmoji}>{lvl.emoji}</Text>
                    <View style={styles.flex}>
                      <Text style={styles.levelName}>
                        {lvl.name}
                        {recommended === lvl.name ? '  ⭐' : ''}
                      </Text>
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
    <View style={styles.stepper}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[styles.stepDot, i < current ? styles.stepDotActive : undefined]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: spacing.xl },
  section: { gap: spacing.lg },
  stepper: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
  stepDot: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
  },
  stepDotActive: { backgroundColor: colors.primary },
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
  progress: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textAlign: 'center',
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
  levelCardActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  levelEmoji: { fontSize: 28 },
  levelName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  levelDesc: { fontSize: fontSize.xs, color: colors.textSecondary, lineHeight: 18 },
});
