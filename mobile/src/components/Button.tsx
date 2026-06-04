import React, { useCallback } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { colors, fontSize, fontWeight, layout, radius, spacing } from '@/theme/theme';

const AnimatedPressableBase = Animated.createAnimatedComponent(Pressable);

type Variant = 'primary' | 'secondary' | 'ink' | 'danger';

type Props = {
  title: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityHint?: string;
};

/**
 * Large, high-contrast button sized for older-adult accessibility.
 * Minimum height is `layout.touchTarget` (56pt).
 */
export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled,
  loading,
  style,
  accessibilityHint,
}: Props) {
  const isDisabled = disabled || loading;
  const bg =
    variant === 'primary'
      ? colors.primary
      : variant === 'ink'
        ? colors.ink
        : variant === 'danger'
          ? colors.danger
          : colors.surfaceMuted;
  const fg = variant === 'secondary' ? colors.textPrimary : colors.textOnDark;

  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const onPressIn = useCallback(() => {
    if (isDisabled) return;
    scale.value = withSpring(0.95, { mass: 0.4, damping: 14, stiffness: 320 });
  }, [isDisabled, scale]);

  const onPressOut = useCallback(() => {
    scale.value = withSpring(1, { mass: 0.4, damping: 12, stiffness: 280 });
  }, [scale]);

  return (
    <AnimatedPressableBase
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!isDisabled }}
      accessibilityHint={accessibilityHint}
      style={[
        styles.base,
        { backgroundColor: bg },
        isDisabled && styles.disabled,
        animatedStyle,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <Text style={[styles.label, { color: fg }]}>{title}</Text>
      )}
    </AnimatedPressableBase>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: layout.touchTarget,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: { opacity: 0.4 },
  label: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
});
