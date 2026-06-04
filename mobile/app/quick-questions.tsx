import React, { useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { setPendingPrompt } from '@/screens/pendingPrompt';
import { QUICK_QUESTIONS } from '@/data/content';
import { colors, fontSize, fontWeight, radius, spacing } from '@/theme/theme';

/**
 * Quick Questions feed. Mirrors the web `quick-questions.tsx` content (50
 * common senior-friendly questions). The web version floats animated bubbles;
 * on native we use a clean, high-contrast tappable list — far more usable for
 * older adults than moving targets. Tapping a question sends it to the Chat tab.
 */
export default function QuickQuestionsScreen() {
  const router = useRouter();

  const ask = useCallback(
    (question: string) => {
      setPendingPrompt(question);
      router.push('/(tabs)/chat');
    },
    [router],
  );

  return (
    <Screen centered edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Text style={styles.backText}>‹ Back</Text>
        </Pressable>
        <Text style={styles.title}>Quick Questions</Text>
        <View style={styles.backBtn} />
      </View>

      <Text style={styles.subtitle}>Tap a question to ask the AI</Text>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {QUICK_QUESTIONS.map((q) => (
          <Pressable
            key={q}
            onPress={() => ask(q)}
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            accessibilityRole="button"
            accessibilityLabel={q}
          >
            <Text style={styles.bubble}>💬</Text>
            <Text style={styles.question}>{q}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: { minWidth: 64, minHeight: 44, justifyContent: 'center' },
  backText: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.primary },
  title: { fontSize: fontSize.lg, fontWeight: fontWeight.black, color: colors.textPrimary },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  scroll: { padding: spacing.lg, gap: spacing.md },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    minHeight: 64,
  },
  cardPressed: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
  bubble: { fontSize: 22 },
  question: { flex: 1, fontSize: fontSize.md, fontWeight: fontWeight.medium, color: colors.textPrimary, lineHeight: 24 },
});
