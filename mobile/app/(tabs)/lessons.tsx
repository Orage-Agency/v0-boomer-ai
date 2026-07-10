import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { BrandHeader } from '@/components/BrandHeader';
import { Skeleton } from '@/components/Skeleton';
import { AnimatedPressable } from '@/components/AnimatedPressable';
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

  // Show animated skeletons for a beat on first render so the list feels
  // alive and the user gets immediate motion feedback. Lesson content is
  // static, so this is purely a perceived-performance polish.
  const [hydrating, setHydrating] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setHydrating(false), 350);
    return () => clearTimeout(t);
  }, []);

  return (
    <Screen centered edges={['top']}>
      <BrandHeader
        title="Video Lessons"
        subtitle="Real people, real help!"
        right={
          <View style={styles.stats}>
            <View style={styles.statPill}>
              <Text style={styles.statText}>🔥 {profile.streak}</Text>
            </View>
            <View style={[styles.statPill, styles.starPill]}>
              <Text style={styles.statText}>⭐ {profile.stars}</Text>
            </View>
          </View>
        }
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {profile.stars < 100 && (
          <Animated.View entering={FadeInDown.duration(260)} style={styles.encourage}>
            <Text style={styles.encourageText}>
              🎯 You're doing great! Complete lessons to earn stars. 🌟
            </Text>
          </Animated.View>
        )}

        {hydrating
          ? Array.from({ length: 4 }).map((_, i) => <LessonSkeleton key={i} />)
          : LESSONS.map((lesson, index) => {
              const isDone = completed.includes(lesson.id);
              const locked = !entitled && index >= FREE_FEATURES.FREE_LESSON_COUNT;
              const onPress = locked
                ? () => router.push('/paywall?reason=lessons')
                : () => router.push(`/lesson/${lesson.id}`);
              return (
                <Animated.View
                  key={lesson.id}
                  entering={FadeInDown.duration(280).delay(Math.min(index * 40, 280))}
                >
                  <AnimatedPressable
                    onPress={onPress}
                    pressedScale={0.97}
                    style={[styles.card, locked && styles.cardLocked]}
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
                  </AnimatedPressable>
                </Animated.View>
              );
            })}
      </ScrollView>
    </Screen>
  );
}

function LessonSkeleton() {
  return (
    <Animated.View entering={FadeIn.duration(160)} style={styles.skeletonCard}>
      <Skeleton width={48} height={48} rounded={24} />
      <View style={styles.skeletonBody}>
        <Skeleton width={80} height={12} />
        <Skeleton width={'85%'} height={18} style={{ marginTop: 8 }} />
      </View>
    </Animated.View>
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
  cardLocked: { opacity: 0.7 },
  skeletonCard: {
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
  skeletonBody: { flex: 1 },
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
