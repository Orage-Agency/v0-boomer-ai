import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ResizeMode, Video, AVPlaybackStatus } from 'expo-av';
import { Screen } from '@/components/Screen';
import { BrandHeader } from '@/components/BrandHeader';
import { Button } from '@/components/Button';
import { useProfile } from '@/context/ProfileContext';
import { setPendingPrompt } from '@/screens/pendingPrompt';
import { LESSONS } from '@/data/content';
import { colors, fontSize, fontWeight, radius, spacing } from '@/theme/theme';

/**
 * Lesson detail. Plays the lesson MP4 inline with expo-av's <Video> (native
 * AVPlayer on iOS), instead of opening Safari. Includes "Try in chat" and
 * "Mark complete" actions for streak/star rewards.
 */
export default function LessonDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile, updateProfile } = useProfile();
  const videoRef = useRef<Video>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);

  const lesson = LESSONS.find((l) => l.id === id);
  const isDone = !!lesson && (profile.lessonsCompleted ?? []).includes(lesson.id);

  const handleStatus = useCallback((status: AVPlaybackStatus) => {
    if (!status.isLoaded) {
      if (status.error) {
        setVideoError('Could not load the video. Tap to retry.');
      }
      return;
    }
    if (!videoReady) setVideoReady(true);
  }, [videoReady]);

  const handleRetry = useCallback(async () => {
    setVideoError(null);
    setVideoReady(false);
    try {
      await videoRef.current?.unloadAsync();
      if (lesson) {
        await videoRef.current?.loadAsync({ uri: lesson.url }, {}, false);
      }
    } catch {
      setVideoError('Could not load the video. Tap to retry.');
    }
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
      <BrandHeader title="Lesson" onBack={() => router.back()} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{lesson.title}</Text>
        <Text style={styles.duration}>🎬 {lesson.duration} video</Text>

        <View style={styles.videoWrap} accessibilityLabel="Lesson video">
          <Video
            ref={videoRef}
            source={{ uri: lesson.url }}
            style={styles.video}
            useNativeControls
            resizeMode={ResizeMode.CONTAIN}
            onPlaybackStatusUpdate={handleStatus}
            shouldPlay={false}
          />
          {!videoReady && !videoError && (
            <View style={styles.videoOverlay} pointerEvents="none">
              <ActivityIndicator color={colors.textOnDark} size="large" />
            </View>
          )}
          {videoError && (
            <Pressable
              onPress={handleRetry}
              style={styles.videoOverlay}
              accessibilityRole="button"
              accessibilityLabel="Retry loading video"
            >
              <Text style={styles.videoError}>{videoError}</Text>
            </Pressable>
          )}
        </View>

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
  videoWrap: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: '#000',
    aspectRatio: 16 / 9,
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  videoError: {
    color: colors.textOnDark,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    paddingHorizontal: spacing.lg,
    textAlign: 'center',
  },
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
