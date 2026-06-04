import React, { useCallback } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Button } from '@/components/Button';
import { useProfile } from '@/context/ProfileContext';
import { setPendingPrompt } from '@/screens/pendingPrompt';
import { LESSONS } from '@/data/content';
import { colors, fontSize, fontWeight, gradients, radius, spacing } from '@/theme/theme';
import { LinearGradient } from 'expo-linear-gradient';

/**
 * Lesson detail. Shows the lesson, a button to play the video (opens the MP4 in
 * the device's native player via Linking — avoids a heavy native video
 * dependency in the Expo managed workflow), a "Try in chat" action that hands
 * the suggested prompt to the Chat tab, and a "Mark complete" reward action.
 *
 * TODO(owner): For inline in-app playback, add `expo-video` (SDK 52) and a
 * config plugin, then render <VideoView> here instead of the open-in-player CTA.
 */
export default function LessonDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile, updateProfile } = useProfile();

  const lesson = LESSONS.find((l) => l.id === id);
  const isDone = !!lesson && (profile.lessonsCompleted ?? []).includes(lesson.id);

  const handlePlay = useCallback(() => {
    if (lesson) void Linking.openURL(lesson.url);
  }, [lesson]);

  const handleTryInChat = useCallback(() => {
    if (!lesson) return;
    setPendingPrompt(lesson.prompt);
    router.push('/(tabs)/chat');
  }, [lesson, router]);

  const handleComplete = useCallback(() => {
    if (!lesson || isDone) return;
    updateProfile({
      lessonsCompleted: [...(profile.lessonsCompleted ?? []), lesson.id],
      stars: profile.stars + 10,
      streak: profile.streak + 1,
    });
    router.back();
  }, [lesson, isDone, profile, updateProfile, router]);

  if (!lesson) {
    return (
      <Screen centered edges={['top', 'bottom']}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Lesson not found.</Text>
          <Button title="Go Back" onPress={() => router.back()} variant="secondary" />
        </View>
      </Screen>
    );
  }

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
        <Text style={styles.headerTitle} numberOfLines={1}>
          Lesson
        </Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{lesson.title}</Text>
        <Text style={styles.duration}>🎬 {lesson.duration} video</Text>

        <Pressable
          onPress={handlePlay}
          accessibilityRole="button"
          accessibilityLabel="Play lesson video"
          style={styles.videoWrap}
        >
          <LinearGradient colors={gradients.lessons} style={styles.video}>
            <Text style={styles.playIcon}>▶</Text>
            <Text style={styles.playText}>Watch the Video</Text>
          </LinearGradient>
        </Pressable>

        <View style={styles.tryCard}>
          <Text style={styles.tryTitle}>Try This in Chat!</Text>
          <Text style={styles.tryPrompt}>"{lesson.prompt}"</Text>
          <Button title="Ask AI Now 💬" onPress={handleTryInChat} />
        </View>

        <Button
          title={isDone ? 'Completed ✓' : 'Mark as Complete (+10 ⭐)'}
          onPress={handleComplete}
          disabled={isDone}
          variant={isDone ? 'secondary' : 'primary'}
        />
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
  headerTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.black, color: colors.textPrimary },
  scroll: { padding: spacing.lg, gap: spacing.lg },
  title: { fontSize: fontSize.xl, fontWeight: fontWeight.black, color: colors.textPrimary, lineHeight: 30 },
  duration: { fontSize: fontSize.sm, color: colors.textSecondary },
  videoWrap: { borderRadius: radius.lg, overflow: 'hidden' },
  video: {
    minHeight: 160,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  playIcon: { fontSize: 40, color: colors.textOnDark },
  playText: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.textOnDark },
  tryCard: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  tryTitle: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.primaryDark },
  tryPrompt: {
    fontSize: fontSize.md,
    fontStyle: 'italic',
    color: colors.textPrimary,
    lineHeight: 24,
  },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.lg, padding: spacing.xl },
  notFoundText: { fontSize: fontSize.lg, color: colors.textSecondary },
});
