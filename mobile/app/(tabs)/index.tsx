import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { GradientTile } from '@/components/GradientTile';
import { StarBadge } from '@/components/StarBadge';
import { useProfile } from '@/context/ProfileContext';
import { colors, fontSize, fontWeight, gradients, spacing } from '@/theme/theme';

/**
 * Home / dashboard — FULLY IMPLEMENTED.
 * Greeting + star badge header and the colorful feature grid from the web
 * home-tab. Tiles route to the working Chat tab and to scaffolded sections.
 */
export default function Home() {
  const router = useRouter();
  const { profile } = useProfile();
  const displayName = profile.name || profile.userName || 'Friend';

  return (
    <Screen centered edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.brand}>Boomer AI</Text>
        <StarBadge stars={profile.stars} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.greeting}>
          <Text style={styles.hello}>Hello, {displayName}!</Text>
          <Text style={styles.prompt}>What would you like to explore today?</Text>
        </View>

        {/* Primary action — full width */}
        <GradientTile
          large
          title="Chat with AI"
          subtitle="Ask me anything, anytime"
          gradient={gradients.chat}
          onPress={() => router.push('/(tabs)/chat')}
        />

        <View style={styles.row}>
          <GradientTile
            emoji="🎙️"
            title="Voice"
            subtitle="Talk to me"
            gradient={gradients.voice}
            onPress={() => router.push('/voice')}
          />
          <GradientTile
            emoji="📚"
            title="Lessons"
            subtitle="Learn step by step"
            gradient={gradients.lessons}
            onPress={() => router.push('/(tabs)/lessons')}
          />
        </View>

        <View style={styles.row}>
          <GradientTile
            emoji="💡"
            title="Tips"
            subtitle="Quick wins"
            gradient={gradients.tips}
            onPress={() => router.push('/(tabs)/tips')}
          />
          <GradientTile
            emoji="🎨"
            title="AI Art"
            subtitle="Create images"
            gradient={gradients.art}
            onPress={() => router.push('/image-gen')}
          />
        </View>

        <View style={styles.row}>
          <GradientTile
            emoji="⭐"
            title="Go Pro"
            subtitle="Unlock everything"
            gradient={gradients.brand}
            onPress={() => router.push('/paywall')}
          />
          <GradientTile
            emoji="👤"
            title="Profile"
            subtitle="Your progress"
            gradient={gradients.games}
            onPress={() => router.push('/(tabs)/profile')}
          />
        </View>
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
  brand: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.black,
    color: colors.textPrimary,
  },
  scroll: { padding: spacing.lg, gap: spacing.md },
  greeting: { marginBottom: spacing.sm },
  hello: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.black,
    color: colors.textPrimary,
  },
  prompt: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  row: { flexDirection: 'row', gap: spacing.md },
});
