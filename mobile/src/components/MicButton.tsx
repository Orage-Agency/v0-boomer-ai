import React, { useEffect } from 'react';
import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { colors, radius } from '@/theme/theme';
import type { VoiceInputState } from '@/hooks/useVoiceInput';

/**
 * Microphone button for voice-to-text, sized to match the other 48px input-bar
 * controls. Three faces:
 *   idle         → 🎤 on a muted background
 *   recording    → ⏹ on red with a gentle pulse (unmissable "I'm listening")
 *   transcribing → spinner (disabled)
 */
export function MicButton({
  state,
  onPress,
  disabled = false,
  size = 48,
}: {
  state: VoiceInputState;
  onPress: () => void;
  disabled?: boolean;
  size?: number;
}) {
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (state === 'recording') {
      pulse.value = withRepeat(
        withSequence(
          withTiming(1.12, { duration: 450 }),
          withTiming(1.0, { duration: 450 }),
        ),
        -1,
      );
    } else {
      cancelAnimation(pulse);
      pulse.value = withTiming(1, { duration: 150 });
    }
  }, [state, pulse]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const recording = state === 'recording';
  const transcribing = state === 'transcribing';

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={onPress}
        disabled={disabled || transcribing}
        style={[
          styles.btn,
          { minHeight: size, minWidth: size },
          recording && styles.recording,
          (disabled || transcribing) && styles.disabled,
        ]}
        accessibilityRole="button"
        accessibilityLabel={
          recording
            ? 'Stop recording and use what you said'
            : transcribing
              ? 'Understanding your words'
              : 'Speak instead of typing'
        }
        hitSlop={4}
      >
        {transcribing ? (
          <ActivityIndicator color={colors.textSecondary} />
        ) : (
          <Ionicons
            name={recording ? 'stop' : 'mic'}
            size={22}
            color={recording ? '#991B1B' : colors.textSecondary}
          />
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recording: { backgroundColor: '#FCA5A5' },
  disabled: { opacity: 0.4 },
});
