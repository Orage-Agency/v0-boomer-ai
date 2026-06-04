import React, { useCallback, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { InfoBanner } from '@/components/InfoBanner';
import { TypingDots } from '@/components/Skeleton';
import { AnimatedPressable } from '@/components/AnimatedPressable';
import { useChatSession } from '@/screens/useChat';
import { consumePendingPrompt, subscribePendingPrompt } from '@/screens/pendingPrompt';
import { useProfile } from '@/context/ProfileContext';
import { useEntitlement } from '@/context/EntitlementContext';
import {
  FREE_FEATURES,
  chatCounterStorageKey,
  todayKey,
} from '@/lib/freeTier';
import { colors, fontSize, fontWeight, radius, spacing } from '@/theme/theme';
import type { ChatMessage } from '@/types';

/**
 * AI Chat — FULLY IMPLEMENTED.
 * Streams replies from /api/chat, renders a message list, and awards stars on
 * send (matching the web reward logic: +10 + "First Chat" badge on first
 * message, +1 thereafter).
 */
const STARTER_PROMPTS = [
  'How do I create a strong password I can remember?',
  'Is this email a scam? How can I tell?',
  'Teach me how to use video calling.',
  'Tell me a fun fact about technology.',
];

export default function Chat() {
  const router = useRouter();
  const { messages, status, error, send } = useChatSession();
  const { profile, updateProfile, apiConfigured } = useProfile();
  const { entitled } = useEntitlement();
  const [input, setInput] = useState('');
  const listRef = useRef<FlatList<ChatMessage>>(null);

  // Keep latest entitled inside callbacks without re-creating subscriptions.
  const entitledRef = useRef(entitled);
  entitledRef.current = entitled;

  const awardStars = useCallback(() => {
    if (messages.length === 0 && !profile.badges.includes('First Chat')) {
      updateProfile({
        stars: profile.stars + 10,
        badges: [...profile.badges, 'First Chat'],
      });
    } else {
      updateProfile({ stars: profile.stars + 1 });
    }
  }, [messages.length, profile, updateProfile]);

  /**
   * Reads today's counter fresh from storage (handles app-open-across-midnight
   * by re-keying on the current local date), and either bumps it or routes to
   * the paywall when the cap is reached.
   *
   * Returns true when the message is allowed to send.
   */
  const consumeFreeQuota = useCallback(async (): Promise<boolean> => {
    const key = chatCounterStorageKey(todayKey());
    let used = 0;
    try {
      const raw = await AsyncStorage.getItem(key);
      used = raw ? Number.parseInt(raw, 10) || 0 : 0;
    } catch {
      used = 0;
    }
    if (used >= FREE_FEATURES.CHAT_DAILY_CAP) {
      router.push('/paywall?reason=chat_quota');
      return false;
    }
    try {
      await AsyncStorage.setItem(key, String(used + 1));
    } catch {
      // Swallow — counter is best-effort. Allowing the send is safer than
      // false-positive gating on a transient storage error.
    }
    return true;
  }, [router]);

  const handleSend = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      const runSend = () => {
        awardStars();
        void send(trimmed);
        setInput('');
        setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
      };
      if (entitledRef.current) {
        runSend();
        return;
      }
      void (async () => {
        const ok = await consumeFreeQuota();
        if (ok) runSend();
      })();
    },
    [awardStars, consumeFreeQuota, send],
  );

  // Keep a stable ref so focus/subscription handlers always call the latest
  // version of handleSend without re-registering on every render.
  const handleSendRef = useRef(handleSend);
  handleSendRef.current = handleSend;

  // When the Chat tab gains focus, pick up any prompt queued by another screen
  // (Lessons / Tips / Quick Questions "Try in chat" actions) and send it.
  useFocusEffect(
    useCallback(() => {
      const queued = consumePendingPrompt();
      if (queued) handleSendRef.current(queued);
      // Also handle prompts pushed while the screen is already focused.
      const unsubscribe = subscribePendingPrompt((prompt) => {
        handleSendRef.current(prompt);
      });
      return unsubscribe;
    }, []),
  );

  const busy = status === 'streaming' || status === 'submitted';

  return (
    <Screen centered edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Chat</Text>
        <Text style={styles.stars}>⭐ {profile.stars}</Text>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        {!apiConfigured && (
          <View style={styles.bannerWrap}>
            <InfoBanner
              tone="warn"
              title="Server not connected"
              message="Set expo.extra.apiBaseUrl in app.json to enable live chat."
            />
          </View>
        )}

        {messages.length === 0 ? (
          <Animated.View entering={FadeInUp.duration(300)} style={styles.empty}>
            <Text style={styles.emptyEmoji}>✨</Text>
            <Text style={styles.emptyTitle}>Let's Chat!</Text>
            <Text style={styles.emptySub}>What can I help you with today?</Text>
            <View style={styles.starters}>
              {STARTER_PROMPTS.map((p, i) => (
                <Animated.View
                  key={p}
                  entering={FadeInDown.duration(280).delay(80 + i * 50)}
                >
                  <AnimatedPressable
                    pressedScale={0.97}
                    style={styles.starter}
                    onPress={() => handleSend(p)}
                    accessibilityRole="button"
                  >
                    <Text style={styles.starterText}>{p}</Text>
                  </AnimatedPressable>
                </Animated.View>
              ))}
            </View>
          </Animated.View>
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(m) => m.id}
            contentContainerStyle={styles.list}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
            renderItem={({ item }) => <Bubble message={item} />}
            ListFooterComponent={busy ? <ThinkingBubble /> : null}
          />
        )}

        {error && (
          <View style={styles.bannerWrap}>
            <InfoBanner tone="danger" message={error} />
          </View>
        )}

        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Ask Boomer AI anything…"
            placeholderTextColor={colors.textMuted}
            multiline
            editable={!busy}
            accessibilityLabel="Message input"
          />
          <AnimatedPressable
            onPress={() => handleSend(input)}
            disabled={busy || !input.trim()}
            pressedScale={0.93}
            style={[styles.sendBtn, (busy || !input.trim()) && styles.sendDisabled]}
            accessibilityRole="button"
            accessibilityLabel="Send message"
          >
            <Text style={styles.sendText}>Send</Text>
          </AnimatedPressable>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

function Bubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  const text = message.parts.map((p) => p.text).join('');
  return (
    <Animated.View
      entering={FadeInUp.duration(220)}
      style={[styles.bubbleRow, isUser ? styles.rowEnd : styles.rowStart]}
    >
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
        <Text style={[styles.bubbleText, isUser && styles.userText]}>
          {text || ' '}
        </Text>
      </View>
    </Animated.View>
  );
}

/** "AI is thinking" skeleton — replaces the plain "Thinking…" text. */
function ThinkingBubble() {
  return (
    <Animated.View entering={FadeIn.duration(180)} style={[styles.bubbleRow, styles.rowStart]}>
      <View style={[styles.bubble, styles.aiBubble, styles.thinkingBubble]}>
        <TypingDots />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
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
  stars: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.textPrimary },
  bannerWrap: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  emptyEmoji: { fontSize: 48, marginBottom: spacing.md },
  emptyTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.black, color: colors.textPrimary },
  emptySub: { fontSize: fontSize.md, color: colors.textSecondary, marginTop: spacing.xs },
  starters: { marginTop: spacing.xl, gap: spacing.md, width: '100%' },
  starter: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    minHeight: 56,
    justifyContent: 'center',
  },
  starterText: { fontSize: fontSize.sm, color: colors.textPrimary, fontWeight: fontWeight.medium },
  list: { padding: spacing.lg, gap: spacing.md },
  bubbleRow: { flexDirection: 'row' },
  rowEnd: { justifyContent: 'flex-end' },
  rowStart: { justifyContent: 'flex-start' },
  bubble: { maxWidth: '85%', padding: spacing.md, borderRadius: radius.lg },
  userBubble: { backgroundColor: colors.primary },
  aiBubble: {
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bubbleText: { fontSize: fontSize.md, lineHeight: 24, color: colors.textPrimary },
  userText: { color: colors.textOnDark },
  thinking: { fontSize: fontSize.sm, color: colors.textMuted, paddingTop: spacing.sm },
  thinkingBubble: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, minHeight: 36 },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  input: {
    flex: 1,
    minHeight: 48,
    maxHeight: 120,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  sendBtn: {
    minHeight: 48,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendDisabled: { opacity: 0.4 },
  sendText: { color: colors.textOnDark, fontWeight: fontWeight.bold, fontSize: fontSize.md },
});
