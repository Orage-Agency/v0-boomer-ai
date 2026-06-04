import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { colors, fontSize, fontWeight, spacing } from '@/theme/theme';

type Props = {
  visible: boolean;
  title?: string;
  subtitle?: string;
  /** Fired after the celebration finishes (after fade-out completes). */
  onDone?: () => void;
};

/**
 * Pure-reanimated success "checkmark" celebration. No Lottie dependency.
 * Big green check pops in with a spring, the wording fades up after, the
 * whole card fades out ~1500ms later.
 */
export function SuccessCelebration({ visible, title = 'You are Pro!', subtitle, onDone }: Props) {
  const cardOpacity = useSharedValue(0);
  const checkScale = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const textTranslate = useSharedValue(12);

  useEffect(() => {
    if (!visible) return;
    // Card fades in immediately.
    cardOpacity.value = withTiming(1, { duration: 180, easing: Easing.out(Easing.cubic) });
    // Check pops with a satisfying spring overshoot.
    checkScale.value = withSequence(
      withTiming(0, { duration: 0 }),
      withSpring(1, { mass: 0.6, damping: 8, stiffness: 220 }),
    );
    // Text fades and slides in after the check lands.
    textOpacity.value = withDelay(220, withTiming(1, { duration: 240 }));
    textTranslate.value = withDelay(220, withTiming(0, { duration: 240, easing: Easing.out(Easing.cubic) }));
    // Fade everything out after the user has had a moment to read it.
    cardOpacity.value = withDelay(
      1700,
      withTiming(0, { duration: 260 }, (finished) => {
        if (finished && onDone) runOnJS(onDone)();
      }),
    );
  }, [visible, cardOpacity, checkScale, textOpacity, textTranslate, onDone]);

  const cardStyle = useAnimatedStyle(() => ({ opacity: cardOpacity.value }));
  const checkStyle = useAnimatedStyle(() => ({ transform: [{ scale: checkScale.value }] }));
  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslate.value }],
  }));

  if (!visible) return null;

  return (
    <Animated.View style={[styles.overlay, cardStyle]} pointerEvents="none">
      <View style={styles.card}>
        <Animated.View style={[styles.checkBubble, checkStyle]}>
          <Text style={styles.checkMark}>✓</Text>
        </Animated.View>
        <Animated.View style={textStyle}>
          <Text style={styles.title}>{title}</Text>
          {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
    minWidth: 240,
    maxWidth: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 10,
  },
  checkBubble: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: {
    fontSize: 56,
    lineHeight: 60,
    color: '#fff',
    fontWeight: fontWeight.black,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.black,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 4,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
