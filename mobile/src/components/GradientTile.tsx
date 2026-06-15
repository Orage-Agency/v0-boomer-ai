import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fontSize, fontWeight, radius, spacing } from '@/theme/theme';

type Props = {
  title: string;
  subtitle?: string;
  emoji?: string;
  gradient: readonly [string, string];
  onPress: () => void;
  large?: boolean;
};

/**
 * Colorful gradient action tile, matching the web home dashboard's core
 * feature buttons. `large` spans the full row (used for the primary Chat tile).
 */
export function GradientTile({
  title,
  subtitle,
  emoji,
  gradient,
  onPress,
  large,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={({ pressed }) => [
        styles.wrap,
        large ? styles.large : styles.small,
        pressed && styles.pressed,
      ]}
    >
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.gradient, large ? styles.gradientLarge : styles.gradientSmall]}
      >
        <View style={styles.blob} />
        {emoji ? <Text style={styles.emoji}>{emoji}</Text> : null}
        <Text style={[styles.title, large && styles.titleLarge]}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { borderRadius: radius.xl, overflow: 'hidden' },
  large: { width: '100%' },
  small: { flex: 1 },
  pressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
  gradient: {
    padding: spacing.lg,
    borderRadius: radius.xl,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  gradientLarge: { minHeight: 88, alignItems: 'flex-start' },
  gradientSmall: { minHeight: 88, alignItems: 'center' },
  blob: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 90,
    height: 90,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  emoji: { fontSize: 26, marginBottom: 2 },
  title: {
    color: colors.textOnDark,
    fontSize: fontSize.md,
    fontWeight: fontWeight.black,
    textAlign: 'center',
  },
  titleLarge: { fontSize: fontSize.xl, textAlign: 'left' },
  subtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    marginTop: 2,
    textAlign: 'center',
  },
});
