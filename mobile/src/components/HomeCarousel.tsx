import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { setPendingPrompt } from '@/screens/pendingPrompt';
import { colors, fontSize, fontWeight, radius, spacing } from '@/theme/theme';

/**
 * Auto-rotating, swipeable carousel of "things you can do with Boomer AI".
 * Each card opens the Chat screen pre-loaded with a starter prompt, making the
 * top of the home screen interactive instead of a single static banner.
 */
type Slide = {
  emoji: string;
  title: string;
  subtitle: string;
  prompt: string;
  gradient: readonly [string, string];
};

const SLIDES: Slide[] = [
  {
    emoji: '💬',
    title: 'Ask me anything',
    subtitle: 'Questions, advice, or a friendly chat',
    prompt: 'I have a question I would like your help with.',
    gradient: ['#6D5BFF', '#8E7BFF'] as const,
  },
  {
    emoji: '🛡️',
    title: 'Is this a scam?',
    subtitle: 'Paste a suspicious text or email',
    prompt: 'Can you help me tell if a message I received is a scam?',
    gradient: ['#E0518A', '#F2789F'] as const,
  },
  {
    emoji: '✍️',
    title: 'Help me write',
    subtitle: 'Emails, texts, letters, anything',
    prompt: 'Help me write a friendly message.',
    gradient: ['#2BB3A3', '#49C9B6'] as const,
  },
  {
    emoji: '🎨',
    title: 'Create art from words',
    subtitle: 'Describe a picture and I will make it',
    prompt: 'I would like to create a picture. Help me describe it.',
    gradient: ['#F2A03D', '#F7C04A'] as const,
  },
  {
    emoji: '📱',
    title: 'Learn my phone',
    subtitle: 'Step-by-step help, no rush',
    prompt: 'Teach me something useful about using my phone.',
    gradient: ['#4F8DF7', '#69A6FF'] as const,
  },
];

// The carousel lives inside the home ScrollView, which is already inset by
// spacing.lg on each side. So each page is the available content width and we
// page by that, not the full screen width.
const CARD_W = Dimensions.get('window').width - spacing.lg * 2;
const ROTATE_MS = 4500;

export function HomeCarousel() {
  const router = useRouter();
  const listRef = useRef<FlatList<Slide>>(null);
  const [index, setIndex] = useState(0);
  const indexRef = useRef(0);
  indexRef.current = index;

  const open = useCallback(
    (slide: Slide) => {
      setPendingPrompt(slide.prompt);
      router.push('/(tabs)/chat');
    },
    [router],
  );

  // Auto-advance, looping back to the first card.
  useEffect(() => {
    const timer = setInterval(() => {
      const next = (indexRef.current + 1) % SLIDES.length;
      listRef.current?.scrollToOffset({ offset: next * CARD_W, animated: true });
      setIndex(next);
    }, ROTATE_MS);
    return () => clearInterval(timer);
  }, []);

  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / CARD_W);
    if (i !== indexRef.current) setIndex(i);
  };

  return (
    <View>
      <FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(s) => s.title}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScrollEnd}
        getItemLayout={(_, i) => ({ length: CARD_W, offset: CARD_W * i, index: i })}
        renderItem={({ item }) => (
          <View style={styles.page}>
            <Pressable
              onPress={() => open(item)}
              accessibilityRole="button"
              accessibilityLabel={`${item.title}. ${item.subtitle}`}
              style={({ pressed }) => [styles.cardWrap, pressed && styles.pressed]}
            >
              <LinearGradient
                colors={item.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.card}
              >
                <View style={styles.blob} />
                <Text style={styles.emoji}>{item.emoji}</Text>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.subtitle}>{item.subtitle}</Text>
              </LinearGradient>
            </Pressable>
          </View>
        )}
      />
      <View style={styles.dots}>
        {SLIDES.map((s, i) => (
          <View key={s.title} style={[styles.dot, i === index && styles.dotActive]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { width: CARD_W },
  cardWrap: { width: CARD_W, borderRadius: radius.xl, overflow: 'hidden' },
  pressed: { opacity: 0.92, transform: [{ scale: 0.99 }] },
  card: {
    minHeight: 96,
    padding: spacing.lg,
    borderRadius: radius.xl,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  blob: {
    position: 'absolute',
    top: -30,
    right: -20,
    width: 120,
    height: 120,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  emoji: { fontSize: 26, marginBottom: 2 },
  title: {
    color: colors.textOnDark,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.black,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    marginTop: 2,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  dotActive: { backgroundColor: colors.primary, width: 18 },
});
