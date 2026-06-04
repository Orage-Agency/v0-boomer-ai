import React, { useEffect } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { colors, radius } from '@/theme/theme';

type Props = {
  width?: number | `${number}%`;
  height?: number;
  style?: StyleProp<ViewStyle>;
  rounded?: number;
};

/**
 * Pulse skeleton — opacity oscillates 0.4 → 0.85 → 0.4. Lightweight: no
 * gradient or mask, works on every device.
 */
export function Skeleton({ width = '100%', height = 16, rounded, style }: Props) {
  const pulse = useSharedValue(0.45);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(0.85, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
    return () => cancelAnimation(pulse);
  }, [pulse]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: pulse.value }));

  return (
    <Animated.View
      style={[
        styles.base,
        { width, height, borderRadius: rounded ?? radius.sm },
        animatedStyle,
        style,
      ]}
    />
  );
}

/** Three dots that bob in sequence — used for "AI is thinking" indicator. */
export function TypingDots({ color = colors.textMuted }: { color?: string }) {
  const a = useSharedValue(0.3);
  const b = useSharedValue(0.3);
  const c = useSharedValue(0.3);

  useEffect(() => {
    const cfg = (delay: number) =>
      withRepeat(
        withTiming(1, { duration: 500, easing: Easing.inOut(Easing.ease) }),
        -1,
        true,
      );
    a.value = cfg(0);
    setTimeout(() => {
      b.value = cfg(150);
    }, 150);
    setTimeout(() => {
      c.value = cfg(300);
    }, 300);
    return () => {
      cancelAnimation(a);
      cancelAnimation(b);
      cancelAnimation(c);
    };
  }, [a, b, c]);

  const sa = useAnimatedStyle(() => ({ opacity: a.value }));
  const sb = useAnimatedStyle(() => ({ opacity: b.value }));
  const sc = useAnimatedStyle(() => ({ opacity: c.value }));

  return (
    <View style={styles.dotRow} accessibilityLabel="Boomer AI is thinking">
      <Animated.View style={[styles.dot, { backgroundColor: color }, sa]} />
      <Animated.View style={[styles.dot, { backgroundColor: color }, sb]} />
      <Animated.View style={[styles.dot, { backgroundColor: color }, sc]} />
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.surfaceMuted,
  },
  dotRow: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    paddingVertical: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
