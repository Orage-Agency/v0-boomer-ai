import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { useProfile } from '@/context/ProfileContext';
import { setPendingPrompt } from '@/screens/pendingPrompt';
import { TIP_CATEGORIES, type Tip } from '@/data/content';
import { colors, fontSize, fontWeight, radius, spacing } from '@/theme/theme';

/**
 * Tips tab — collapsible categories of practical AI tips.
 * Mirrors the web `tips-tab.tsx`. Tapping a tip hands its suggested prompt to
 * the Chat tab and navigates there ("Tap any tip to try it in chat").
 */
export default function TipsScreen() {
  const router = useRouter();
  const { profile } = useProfile();
  const [expanded, setExpanded] = useState<string[]>([TIP_CATEGORIES[0]?.id]);

  const toggle = useCallback((id: string) => {
    setExpanded((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }, []);

  const tryTip = useCallback(
    (tip: Tip) => {
      setPendingPrompt(tip.prompt);
      router.push('/(tabs)/chat');
    },
    [router],
  );

  return (
    <Screen centered edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>AI Tips & Guides</Text>
          <Text style={styles.subtitle}>Tap any tip to try it in chat</Text>
        </View>
        <View style={styles.starPill}>
          <Text style={styles.starText}>⭐ {profile.stars}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {TIP_CATEGORIES.map((category) => {
          const isOpen = expanded.includes(category.id);
          return (
            <View key={category.id} style={styles.category}>
              <Pressable
                onPress={() => toggle(category.id)}
                style={styles.categoryHeader}
                accessibilityRole="button"
                accessibilityLabel={`${category.title}, ${category.tips.length} tips`}
                accessibilityState={{ expanded: isOpen }}
              >
                <Text style={styles.categoryTitle}>{category.title}</Text>
                <View style={styles.categoryRight}>
                  <View style={styles.countPill}>
                    <Text style={styles.countText}>{category.tips.length}</Text>
                  </View>
                  <Text style={styles.chevron}>{isOpen ? '▾' : '▸'}</Text>
                </View>
              </Pressable>

              {isOpen && (
                <View style={styles.tipList}>
                  {category.tips.map((tip) => (
                    <Pressable
                      key={tip.title}
                      onPress={() => tryTip(tip)}
                      style={({ pressed }) => [styles.tip, pressed && styles.tipPressed]}
                      accessibilityRole="button"
                      accessibilityLabel={`${tip.title}. ${tip.description}. Try in chat.`}
                    >
                      <Text style={styles.tipEmoji}>{tip.emoji}</Text>
                      <View style={styles.tipBody}>
                        <Text style={styles.tipTitle}>{tip.title}</Text>
                        <Text style={styles.tipDesc}>{tip.description}</Text>
                      </View>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: { fontSize: fontSize.lg, fontWeight: fontWeight.black, color: colors.textPrimary },
  subtitle: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  starPill: {
    backgroundColor: colors.amberSoft,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  starText: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.textPrimary },
  scroll: { padding: spacing.lg, gap: spacing.md },
  category: {
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    backgroundColor: colors.surfaceSubtle,
    minHeight: 56,
  },
  categoryTitle: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.textPrimary, flex: 1 },
  categoryRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  countPill: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    minWidth: 28,
    alignItems: 'center',
  },
  countText: { fontSize: fontSize.xs, fontWeight: fontWeight.bold, color: colors.primaryDark },
  chevron: { fontSize: fontSize.lg, color: colors.textSecondary, width: 20, textAlign: 'center' },
  tipList: { padding: spacing.md, gap: spacing.sm, backgroundColor: colors.surface },
  tip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    minHeight: 56,
  },
  tipPressed: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
  tipEmoji: { fontSize: 24 },
  tipBody: { flex: 1, gap: 2 },
  tipTitle: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.textPrimary },
  tipDesc: { fontSize: fontSize.sm, color: colors.textSecondary, lineHeight: 20 },
});
