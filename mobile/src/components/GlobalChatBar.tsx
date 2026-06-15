import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, fontSize, fontWeight, radius, spacing } from '@/theme/theme';

/**
 * Always-on "chat from anywhere" entry, docked above the tab bar on every main
 * screen. Styled like a chat input but it's a single tap target that opens the
 * full Chat screen (which owns the real, keyboard-aware text input) — this
 * keeps the affordance reliable instead of fighting the keyboard from inside
 * the fixed tab bar.
 */
export function GlobalChatBar() {
  const router = useRouter();
  const open = () => router.push('/(tabs)/chat');

  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={open}
        style={styles.field}
        accessibilityRole="button"
        accessibilityLabel="Open chat to ask Boomer AI anything"
      >
        <Text style={styles.placeholder}>Ask Boomer AI anything…</Text>
        <View style={styles.send}>
          <Text style={styles.sendIcon}>↑</Text>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted ?? '#F1F1F4',
    borderRadius: radius.pill ?? 24,
    paddingLeft: spacing.lg,
    paddingRight: spacing.xs,
    paddingVertical: spacing.xs,
    minHeight: 48,
  },
  placeholder: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.textMuted,
  },
  send: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendIcon: {
    color: colors.textOnDark,
    fontSize: 20,
    fontWeight: fontWeight.black,
    lineHeight: 22,
  },
});
