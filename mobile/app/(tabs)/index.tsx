import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { GradientTile } from '@/components/GradientTile';
import { HomeCarousel } from '@/components/HomeCarousel';
import { StarBadge } from '@/components/StarBadge';
import { useProfile } from '@/context/ProfileContext';
import { useEntitlement } from '@/context/EntitlementContext';
import { colors, fontSize, fontWeight, gradients, spacing } from '@/theme/theme';

/**
 * Home / dashboard — FULLY IMPLEMENTED.
 * Greeting + star badge header and the colorful feature grid from the web
 * home-tab. Tiles route to the working Chat tab and to scaffolded sections.
 */
export default function Home() {
  const router = useRouter();
  const { profile } = useProfile();
  const { entitled } = useEntitlement();
  const displayName = profile.name || profile.userName || 'Friend';

  const openVoice = () => {
    if (!entitled) {
      router.push('/paywall?reason=voice');
      return;
    }
    router.push('/voice');
  };

  const openImageGen = () => {
    if (!entitled) {
      router.push('/paywall?reason=image_gen');
      return;
    }
    router.push('/image-gen');
  };

  return (
    <Screen centered edges={['top']}>
      <View style={styles.header}>
        {entitled ? (
          <View style={styles.brandRow}>
            <Text style={styles.brand}>Boomer</Text>
            <View style={styles.proPill}>
              <Text style={styles.proPillText}>Pro</Text>
            </View>
            <Text style={styles.brand}>AI</Text>
          </View>
        ) : (
          <Text style={styles.brand}>Boomer AI</Text>
        )}
        <StarBadge stars={profile.stars} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(280).delay(0)} style={styles.greeting}>
          <Text style={styles.hello}>Hello, {displayName}!</Text>
          <Text style={styles.prompt}>What would you like to explore today?</Text>
        </Animated.View>

        {/* Interactive carousel of things you can do with AI */}
        <Animated.View entering={FadeInDown.duration(320).delay(60)}>
          <HomeCarousel />
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(320).delay(120)} style={styles.row}>
          <GradientTile
            emoji="💬"
            title="Chat with AI"
            subtitle="Ask me anything"
            gradient={gradients.chat}
            onPress={() => router.push('/(tabs)/chat')}
          />
          <GradientTile
            emoji="🎙️"
            title="Voice"
            subtitle="Talk to me"
            gradient={gradients.voice}
            onPress={openVoice}
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(320).delay(180)} style={styles.row}>
          <GradientTile
            emoji="📚"
            title="Lessons"
            subtitle="Learn step by step"
            gradient={gradients.lessons}
            onPress={() => router.push('/(tabs)/lessons')}
          />
          <GradientTile
            emoji="💡"
            title="Tips"
            subtitle="Quick wins"
            gradient={gradients.tips}
            onPress={() => router.push('/(tabs)/tips')}
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(320).delay(240)} style={styles.row}>
          <GradientTile
            emoji="🎨"
            title="AI Art"
            subtitle="Create images"
            gradient={gradients.art}
            onPress={openImageGen}
          />
          <GradientTile
            emoji="❓"
            title="Questions"
            subtitle="50 quick ideas"
            gradient={gradients.games}
            onPress={() => router.push('/quick-questions')}
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(320).delay(300)} style={styles.row}>
          <GradientTile
            emoji="👤"
            title="Profile"
            subtitle="Your progress"
            gradient={gradients.chat}
            onPress={() => router.push('/(tabs)/profile')}
          />
          {entitled ? (
            <GradientTile
              emoji="⭐"
              title="Pro Member"
              subtitle="You're all set"
              gradient={['#D4A017', '#A9810F']}
              onPress={() => router.push('/(tabs)/profile')}
            />
          ) : (
            <GradientTile
              emoji="⭐"
              title="Go Pro"
              subtitle="Unlock everything"
              gradient={gradients.brand}
              onPress={() => router.push('/paywall')}
            />
          )}
        </Animated.View>
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
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  proPill: {
    backgroundColor: '#F2C740', // gold = premium
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  proPillText: {
    color: '#1A1A1A',
    fontSize: 12,
    fontWeight: fontWeight.black,
    letterSpacing: 0.3,
  },
  // Tighter spacing so the full grid fits a standard screen without scrolling.
  scroll: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, gap: spacing.sm },
  greeting: { marginBottom: 2 },
  hello: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.black,
    color: colors.textPrimary,
  },
  prompt: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  row: { flexDirection: 'row', gap: spacing.sm },
});
