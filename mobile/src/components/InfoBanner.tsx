import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, fontWeight, radius, spacing } from '@/theme/theme';

type Tone = 'info' | 'warn' | 'danger';

/** Small inline banner for status / configuration messages. */
export function InfoBanner({
  title,
  message,
  tone = 'info',
}: {
  title?: string;
  message: string;
  tone?: Tone;
}) {
  const bg =
    tone === 'danger'
      ? colors.dangerSoft
      : tone === 'warn'
        ? colors.amberSoft
        : colors.primarySoft;
  const fg =
    tone === 'danger'
      ? colors.danger
      : tone === 'warn'
        ? '#92400E'
        : colors.primaryDark;
  return (
    <View style={[styles.wrap, { backgroundColor: bg }]}>
      {title ? <Text style={[styles.title, { color: fg }]}>{title}</Text> : null}
      <Text style={[styles.message, { color: fg }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radius.md,
    padding: spacing.md,
    gap: 2,
  },
  title: { fontSize: fontSize.sm, fontWeight: fontWeight.bold },
  message: { fontSize: fontSize.xs, fontWeight: fontWeight.medium, lineHeight: 20 },
});
