import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { useProfile } from '@/context/ProfileContext';
import { useEntitlement } from '@/context/EntitlementContext';
import { LESSONS } from '@/data/content';
import { FREE_FEATURES } from '@/lib/freeTier';
import { colors, fontSize, fontWeight, radius, spacing } from '@/theme/theme';

/**
 * Lessons (Learn) tab — list view.
 * Mirrors the web `lessons-tab.tsx`: a list of video lessons with completion
 * state, a streak/stars header, and an encouragement banner. Tapping a lesson
 * opens the detail route `/lesson/[id]`.
 */
export default function LessonsScreen() {
  const router = useRouter();
  const { profile } = useProfile();
  const { entitled } = useEntitlement();
  const completed = profile.lessonsCompleted ?? [];

  return (
    <Screen centered edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Video Lessons</Text>
          <Text style={styles.subtitle}>Real people, real help!</Text>
        </View>
        <View style={styles.stats}>
          <View style={styles.statPill}>
            <Text style={styles.statText}>🔥 {profile.streak}</Text>
          </View>
          <View style={[styles.statPill, styles.starPill]}>
            <Text style={styles.statText}>⭐ {profile.stars}</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {profile.stars < 100 && (
          <View style={styles.encourage}>
            <Text style={styles.encourageText}>
              🎯 You're doing great! Complete lessons to earn stars. 🌟
            </Text>
          </View>
        )}

        {LESSONS.map((lesson, index) => {
          const isDone = completed.includes(lesson.id);
          const locked = !entitled && index >= FREE_FEATURES.FREE_LESSON_COUNT;
          const onPress = locked
            ? () => router.push('/paywall?reason=lessons')
            : () => router.push(`/lesson/${lesson.id}`);
          return (
            <Pressable
              key={lesson.id}
              onPress={onPress}
              style={({ pressed }) => [
                styles.card,
                pressed && styles.cardPressed,
                locked && styles.cardLocked,
              ]}
              accessibilityRole="button"
              accessibilityLabel={
                locked
                  ? `Lesson ${index + 1}: ${lesson.title}, locked. Upgrade to Pro to unlock.`
                  : `Lesson ${index + 1}: ${lesson.title}${isDone ? ', completed' : ''}`
              }
            >
              <View
                style={[
                  styles.icon,
                  locked
                    ? styles.iconLocked
                    : isDone
                      ? styles.iconDone
                      : styles.iconTodo,
                ]}
              >
                <Text style={styles.iconEmoji}>
                  {locked ? '🔒' : isDone ? '✓' : '▶'}
                </Text>
              </View>
              <View style={styles.cardBody}>
                <View style={styles.cardMeta}>
                  <Text style={styles.lessonNum}>Lesson {index + 1}</Text>
                  <Text style={styles.duration}>· {lesson.duration}</Text>
                  {!locked && isDone && <Text style={styles.doneTag}>✓ Done</Text>}
                  {locked && <Text style={styles.proTag}>PRO</Text>}
                </View>
                <Text style={styles.lessonTitle}>{lesson.title}</Text>
              </View>
              <Text style={styles.chevron}>{locked ? '🔒' : '›'}</Text>
            </Pressable>
          );
        })}
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
  title: { fontSize: fontSize.lg, fontWeight: fontWeight.black, color: colors.textPrimary },
  subtitle: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  stats: { flexDirection: 'row', gap: spacing.sm },
  statPill: {
    backgroundColor: colors.amberSoft,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  starPill: { backgroundColor: colors.amberSoft },
  statText: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.textPrimary },
  scroll: { padding: spacing.lg, gap: spacing.md },
  encourage: {
    backgroundColor: colors.amberSoft,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  encourageText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: '#92400E',
    textAlign: 'center',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    minHeight: 80,
  },
  cardPressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
  cardLocked: { opacity: 0.7 },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconTodo: { backgroundColor: colors.primary },
  iconDone: { backgroundColor: colors.green },
  iconLocked: { backgroundColor: colors.textMuted },
  iconEmoji: { fontSize: 20, color: colors.textOnDark, fontWeight: fontWeight.bold },
  cardBody: { flex: 1, gap: 2 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  lessonNum: { fontSize: fontSize.xs, fontWeight: fontWeight.bold, color: colors.textSecondary },
  duration: { fontSize: fontSize.xs, color: colors.textMuted },
  doneTag: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.green,
    marginLeft: spacing.xs,
  },
  proTag: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.black,
    color: colors.primary,
    marginLeft: spacing.xs,
    letterSpacing: 0.5,
  },
  lessonTitle: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.textPrimary, lineHeight: 22 },
  chevron: { fontSize: 28, color: colors.textMuted },
});
