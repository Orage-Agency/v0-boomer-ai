import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, fontSize, fontWeight, spacing } from '@/theme/theme';

/**
 * App-wide header with the BoomerAI speech-bubble logo pinned top-left.
 * Tapping the logo always returns to the Home screen — a constant, familiar
 * "take me back to the start" anchor on every screen.
 *
 * Layout: [logo] [‹ Back?] [title + subtitle]  ……  [right slot]
 */
export function BrandHeader({
  title,
  subtitle,
  onBack,
  right,
}: {
  title?: string;
  subtitle?: string;
  /** Show a back affordance next to the logo (sub-screens). */
  onBack?: () => void;
  /** Right-aligned content (star pills, action buttons…). */
  right?: React.ReactNode;
}) {
  const router = useRouter();

  return (
    <View style={styles.header}>
      <Pressable
        onPress={() => router.push('/(tabs)')}
        style={styles.logoBtn}
        accessibilityRole="button"
        accessibilityLabel="Boomer AI — go to the main page"
        hitSlop={6}
      >
        <Image
          source={require('../../assets/icon.png')}
          style={styles.logo}
          accessibilityIgnoresInvertColors
        />
      </Pressable>

      {onBack && (
        <Pressable
          onPress={onBack}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={6}
        >
          <Ionicons name="chevron-back" size={20} color={colors.primary} />
          <Text style={styles.backText}>Back</Text>
        </Pressable>
      )}

      <View style={styles.titleWrap}>
        {title ? (
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
        ) : null}
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      {right ? <View style={styles.right}>{right}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    minHeight: 56,
  },
  logoBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: { width: 40, height: 40, borderRadius: 8 },
  backBtn: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: spacing.xs,
  },
  backText: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.primary },
  titleWrap: { flex: 1 },
  title: { fontSize: fontSize.lg, fontWeight: fontWeight.black, color: colors.textPrimary },
  subtitle: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 1 },
  right: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});
