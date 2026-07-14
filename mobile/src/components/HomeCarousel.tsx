import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
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

const ROTATE_MS = 6000;
// Sensible first-render estimate; replaced by the measured width onLayout so
// rotation / iPad split-view can't break pagination.
const INITIAL_W = Dimensions.get('window').width - spacing.lg * 2;

export function HomeCarousel() {
  const router = useRouter();
  const listRef = useRef<FlatList<Slide>>(null);
  const [index, setIndex] = useState(0);
  const [cardW, setCardW] = useState(INITIAL_W);
  const indexRef = useRef(0);
  indexRef.current = index;
  const cardWRef = useRef(cardW);
  cardWRef.current = cardW;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const open = useCallback(
    (slide: Slide) => {
      setPendingPrompt(slide.prompt);
      router.push('/(tabs)/chat');
    },
    [router],
  );

  // Auto-advance, looping back to the first card. Restartable so a manual
  // swipe resets the clock — the card must never yank away right after the
  // user moved it themselves.
  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      const next = (indexRef.current + 1) % SLIDES.length;
      listRef.current?.scrollToOffset({ offset: next * cardWRef.current, animated: true });
      setIndex(next);
    }, ROTATE_MS);
  }, []);

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startTimer]);

  const onLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w > 0 && Math.abs(w - cardWRef.current) > 1) setCardW(w);
  };

  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / cardWRef.current);
    if (i !== indexRef.current) setIndex(i);
    startTimer(); // user (or auto) finished moving — restart the clock
  };

  return (
    <View onLayout={onLayout}>
      <FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(s) => s.title}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScrollBeginDrag={() => {
          // Hands off while the user is touching it.
          if (timerRef.current) clearInterval(timerRef.current);
        }}
        onMomentumScrollEnd={onScrollEnd}
        getItemLayout={(_, i) => ({ length: cardW, offset: cardW * i, index: i })}
        renderItem={({ item }) => (
          <View style={{ width: cardW }}>
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
  cardWrap: { width: '100%', borderRadius: radius.xl, overflow: 'hidden' },
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
