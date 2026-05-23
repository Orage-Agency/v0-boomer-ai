import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, fontWeight, radius, spacing } from '@/theme/theme';

/** Star count pill shown in the app header (mirrors the web "N Stars" badge). */
export function StarBadge({ stars }: { stars: number }) {
  return (
    <View
      style={styles.wrap}
      accessibilityRole="text"
      accessibilityLabel={`${stars} stars earned`}
    >
      <Text style={styles.star}>⭐</Text>
      <Text style={styles.text}>{stars} Stars</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.amberSoft,
    borderColor: '#FDE68A',
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  star: { fontSize: fontSize.sm },
  text: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
});
