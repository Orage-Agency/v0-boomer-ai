import React, { useCallback } from 'react';
import { Pressable, type PressableProps, type ViewStyle, type StyleProp } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

const AnimatedPressableBase = Animated.createAnimatedComponent(Pressable);

type Props = Omit<PressableProps, 'style'> & {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Scale on press (default 0.95). */
  pressedScale?: number;
};

/**
 * Pressable with a reanimated spring scale on press-in / press-out.
 * Falls back to no-op visuals if reduce-motion is on (handled by reanimated).
 */
export function AnimatedPressable({
  children,
  style,
  pressedScale = 0.95,
  onPressIn,
  onPressOut,
  ...rest
}: Props) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(
    (e: Parameters<NonNullable<PressableProps['onPressIn']>>[0]) => {
      scale.value = withSpring(pressedScale, { mass: 0.4, damping: 14, stiffness: 320 });
      onPressIn?.(e);
    },
    [onPressIn, pressedScale, scale],
  );

  const handlePressOut = useCallback(
    (e: Parameters<NonNullable<PressableProps['onPressOut']>>[0]) => {
      scale.value = withSpring(1, { mass: 0.4, damping: 12, stiffness: 280 });
      onPressOut?.(e);
    },
    [onPressOut, scale],
  );

  return (
    <AnimatedPressableBase
      {...rest}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[animatedStyle, style]}
    >
      {children}
    </AnimatedPressableBase>
  );
}
