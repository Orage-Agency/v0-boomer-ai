import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { colors, layout } from '@/theme/theme';

type Props = {
  children: React.ReactNode;
  edges?: readonly Edge[];
  style?: StyleProp<ViewStyle>;
  /** Center content horizontally and cap width (phone-frame look). */
  centered?: boolean;
  background?: string;
};

/**
 * Standard screen wrapper that respects safe areas and caps content width so
 * the layout reads well on large phones/tablets (mirrors the web app's
 * max-w-md centered column).
 */
export function Screen({
  children,
  edges = ['top', 'bottom'],
  style,
  centered,
  background = colors.background,
}: Props) {
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: background }]} edges={edges}>
      <View style={[styles.inner, centered && styles.centered, style]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  inner: { flex: 1, width: '100%' },
  centered: {
    maxWidth: layout.maxContentWidth,
    alignSelf: 'center',
  },
});
