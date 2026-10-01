import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { useProfile } from '@/context/ProfileContext';
import { useEntitlement } from '@/context/EntitlementContext';
import { colors, fontSize, fontWeight, radius, spacing } from '@/theme/theme';

export default function Home() {
  const router = useRouter();
  const { profile } = useProfile();
  const { entitled } = useEntitlement();
  const displayName = profile.name || profile.userName;

  return (
    <Screen centered edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.greeting}>
          <Text style={styles.hello}>{displayName ? `Hello, ${displayName}` : 'Welcome'}</Text>
          <Text style={styles.prompt}>What would you like to learn or try today?</Text>
        </View>

        <View>
          <Text style={styles.sectionTitle}>Start here</Text>
          <Pressable
            onPress={() => router.push('/(tabs)/chat')}
            style={({ pressed }) => [styles.primaryAction, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel="Chat with AI. Ask a question or get help with a task."
          >
            <View style={styles.actionCopy}>
              <Text style={styles.primaryTitle}>Chat with AI</Text>
              <Text style={styles.primaryDescription}>Ask a question or get help with a task.</Text>
            </View>
            <Text aria-hidden style={styles.actionMark}>›</Text>
          </Pressable>
        </View>

        <View>
          <Text style={styles.sectionTitle}>Learn at your pace</Text>
          <View style={styles.actionGroup}>
            <HomeAction title="Lessons" description="Follow a practical, step-by-step guide." onPress={() => router.push('/(tabs)/lessons')} />
            <HomeAction title="Tips" description="Find a useful idea for everyday tasks." onPress={() => router.push('/(tabs)/tips')} last />
          </View>
        </View>

        <View>
          <Text style={styles.sectionTitle}>Explore more</Text>
          <View style={styles.actionGroup}>
            <HomeAction title="Voice chat" description="Talk with the assistant." onPress={() => openEntitled('/voice', 'voice')} />
            <HomeAction title="Quick questions" description="Choose a question to start a conversation." onPress={() => router.push('/quick-questions')} />
            <HomeAction title="Create an image" description="Describe an image you would like AI to make." onPress={() => openEntitled('/image-gen', 'image_gen')} />
            <HomeAction title="Question library" description="Browse more ideas to ask AI." onPress={() => router.push('/quick-questions')} last />
          </View>
        </View>
      </ScrollView>
    </Screen>
  );

  function openEntitled(path: '/voice' | '/image-gen', reason: 'voice' | 'image_gen') {
    if (!entitled) {
      router.push(`/paywall?reason=${reason}` as never);
      return;
    }
    router.push(path);
  }
}

function HomeAction({
  title,
  description,
  onPress,
  last = false,
}: {
  title: string;
  description: string;
  onPress: () => void;
  last?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.action, !last && styles.actionBorder, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${description}`}
    >
      <View style={styles.actionCopy}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionDescription}>{description}</Text>
      </View>
      <Text aria-hidden style={styles.actionMark}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl, paddingBottom: spacing.xxl, gap: spacing.xl },
  greeting: { gap: spacing.sm },
  hello: { fontSize: fontSize.xxl, fontWeight: fontWeight.bold, color: colors.textPrimary },
  prompt: { fontSize: fontSize.md, lineHeight: 26, color: colors.textSecondary },
  sectionTitle: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.textPrimary, marginBottom: spacing.sm },
  primaryAction: {
    minHeight: 96,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    backgroundColor: colors.surfaceSubtle,
  },
  primaryTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.textPrimary },
  primaryDescription: { marginTop: spacing.xs, fontSize: fontSize.sm, lineHeight: 23, color: colors.textSecondary },
  actionGroup: { overflow: 'hidden', borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg },
  action: { minHeight: 76, flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, backgroundColor: colors.surface },
  actionBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  actionCopy: { flex: 1 },
  actionTitle: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.textPrimary },
  actionDescription: { marginTop: spacing.xs, fontSize: fontSize.xs, lineHeight: 20, color: colors.textSecondary },
  actionMark: { fontSize: 28, color: colors.textMuted },
  pressed: { backgroundColor: colors.surfaceMuted },
});
