import React, { useCallback, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { BrandHeader } from '@/components/BrandHeader';
import { InfoBanner } from '@/components/InfoBanner';
import { TypingDots } from '@/components/Skeleton';
import { AnimatedPressable } from '@/components/AnimatedPressable';
import { MicButton } from '@/components/MicButton';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { useChatSession } from '@/screens/useChat';
import {
  consumePendingConversation,
  consumePendingMic,
  consumePendingPrompt,
  subscribePendingPrompt,
} from '@/screens/pendingPrompt';
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
 * Streams replies from /api/chat token-by-token, renders a structured message
 * list (Sara's avatar + name on AI turns), and awards stars on send (matching
 * the web reward logic: +10 + "First Chat" badge on first message, +1 after).
 *
 * Input bar affordances: photo (camera / library), voice-to-text (Whisper),
 * and plain typing. A failed send offers one-tap "Try Again".
 *
 * MEMORY: the conversation survives app restarts (see useChatSession), and
 * the History screen can reopen any saved conversation to continue it.
 */

/** The friendly face of the assistant across the app. */
export const COMPANION_NAME = 'Sara';
export const COMPANION_EMOJI = '👩🏼';
const STARTER_PROMPTS = [
  'How do I create a strong password I can remember?',
  'Is this email a scam? How can I tell?',
  'Teach me how to use video calling.',
  'Tell me a fun fact about technology.',
];

export default function Chat() {
  const router = useRouter();
  const { messages, status, error, send, reset, loadById } = useChatSession();
  const { profile, updateProfile, apiConfigured } = useProfile();
  const { entitled } = useEntitlement();
  const [input, setInput] = useState('');
  const [attachedImage, setAttachedImage] = useState<{ uri: string; dataUrl: string } | null>(null);
  const listRef = useRef<FlatList<ChatMessage>>(null);
  // Remembers the last send that errored so "Try Again" can replay it.
  const lastAttempt = useRef<{ text: string; image?: { uri: string; dataUrl: string } } | null>(
    null,
  );

  const pickFrom = useCallback(async (source: 'camera' | 'library') => {
    try {
      const perm =
        source === 'camera'
          ? await ImagePicker.requestCameraPermissionsAsync()
          : await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(
          'Permission needed',
          source === 'camera'
            ? 'Turn on Camera access in Settings → Boomer AI to take a photo.'
            : 'Turn on Photos access in Settings → Boomer AI to choose a photo.',
        );
        return;
      }
      const options: ImagePicker.ImagePickerOptions = {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.4,
        base64: true,
      };
      const result =
        source === 'camera'
          ? await ImagePicker.launchCameraAsync(options)
          : await ImagePicker.launchImageLibraryAsync(options);
      const asset = result.assets?.[0];
      if (result.canceled || !asset?.base64) return;
      const mime = asset.mimeType ?? 'image/jpeg';
      setAttachedImage({ uri: asset.uri, dataUrl: `data:${mime};base64,${asset.base64}` });
    } catch {
      Alert.alert('Could not add photo', 'Please try again.');
    }
  }, []);

  const openPhotoOptions = useCallback(() => {
    Alert.alert('Add a Photo', 'Send a photo to Boomer AI to ask about it.', [
      { text: 'Take Photo', onPress: () => void pickFrom('camera') },
      { text: 'Choose from Library', onPress: () => void pickFrom('library') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }, [pickFrom]);

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
    (text: string, imageOverride?: { uri: string; dataUrl: string } | null) => {
      const trimmed = text.trim();
      const image = imageOverride !== undefined ? imageOverride : attachedImage;
      if (!trimmed && !image) return;
      const runSend = () => {
        lastAttempt.current = { text: trimmed, image: image ?? undefined };
        awardStars();
        void send(trimmed, image ?? undefined);
        setInput('');
        setAttachedImage(null);
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
    [awardStars, consumeFreeQuota, send, attachedImage],
  );

  // Keep a stable ref so focus/subscription handlers always call the latest
  // version of handleSend without re-registering on every render.
  const handleSendRef = useRef(handleSend);
  handleSendRef.current = handleSend;

  // Voice-to-text: tap mic → speak → tap again → the transcript sends itself.
  // Auto-send keeps the flow to two taps total, which beats "transcribe into
  // the box, then find Send" for the target audience.
  const voice = useVoiceInput({
    onTranscript: (text) => handleSendRef.current(text, null),
  });
  const voiceRef = useRef(voice);
  voiceRef.current = voice;

  // Keep loadById stable for the focus effect.
  const loadByIdRef = useRef(loadById);
  loadByIdRef.current = loadById;

  // When the Chat tab gains focus, pick up any prompt queued by another screen
  // (Lessons / Tips / Quick Questions "Try in chat" actions) and send it; a
  // saved conversation chosen on the History screen; or a queued "start
  // listening" request from the GlobalChatBar mic.
  useFocusEffect(
    useCallback(() => {
      const conversation = consumePendingConversation();
      if (conversation != null) void loadByIdRef.current(conversation);
      const queued = consumePendingPrompt();
      if (queued) handleSendRef.current(queued, null);
      if (consumePendingMic() && voiceRef.current.state === 'idle') {
        voiceRef.current.toggle();
      }
      // Also handle prompts pushed while the screen is already focused.
      const unsubscribe = subscribePendingPrompt((prompt) => {
        handleSendRef.current(prompt, null);
      });
      return unsubscribe;
    }, []),
  );

  const handleNewChat = useCallback(() => {
    if (messages.length === 0) return;
    Alert.alert('Start a new chat?', 'Your current conversation will be cleared.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'New Chat', style: 'destructive', onPress: () => reset() },
    ]);
  }, [messages.length, reset]);

  const handleRetry = useCallback(() => {
    const attempt = lastAttempt.current;
    if (!attempt) return;
    handleSendRef.current(attempt.text, attempt.image ?? null);
  }, []);

  const busy = status === 'streaming' || status === 'submitted';
  const recording = voice.state === 'recording';

  return (
    <Screen centered edges={['top']}>
      <BrandHeader
        title="Chat"
        right={
          <>
            <Pressable
              onPress={() => router.push('/history')}
              style={styles.historyBtn}
              accessibilityRole="button"
              accessibilityLabel="See my past conversations"
              hitSlop={6}
            >
              <Text style={styles.historyIcon}>🕐</Text>
            </Pressable>
            {messages.length > 0 && (
              <Pressable
                onPress={handleNewChat}
                style={styles.newChatBtn}
                accessibilityRole="button"
                accessibilityLabel="Start a new chat"
                hitSlop={6}
              >
                <Text style={styles.newChatText}>+ New</Text>
              </Pressable>
            )}
            <Text style={styles.stars}>⭐ {profile.stars}</Text>
          </>
        }
      />

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
            <Text style={styles.emptyEmoji}>{COMPANION_EMOJI}</Text>
            <Text style={styles.emptyTitle}>Hi, I'm {COMPANION_NAME}!</Text>
            <Text style={styles.emptySub}>
              Type, talk with the microphone, or send a photo.
            </Text>
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
            <Pressable
              onPress={handleRetry}
              style={styles.retryBtn}
              accessibilityRole="button"
              accessibilityLabel="Try sending your message again"
            >
              <Text style={styles.retryText}>↻ Try Again</Text>
            </Pressable>
          </View>
        )}

        {voice.error && (
          <View style={styles.bannerWrap}>
            <InfoBanner tone="danger" message={voice.error} />
          </View>
        )}

        {recording && (
          <View style={styles.bannerWrap}>
            <InfoBanner
              tone="info"
              title="Listening…"
              message="Say your question, then tap the square button to send it."
            />
          </View>
        )}

        {attachedImage && (
          <View style={styles.attachWrap}>
            <Image source={{ uri: attachedImage.uri }} style={styles.attachThumb} />
            <Text style={styles.attachLabel}>Photo ready to send</Text>
            <Pressable
              onPress={() => setAttachedImage(null)}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Remove photo"
              style={styles.attachRemove}
            >
              <Text style={styles.attachRemoveText}>✕</Text>
            </Pressable>
          </View>
        )}

        <View style={styles.inputBar}>
          <Pressable
            onPress={openPhotoOptions}
            disabled={busy || recording}
            style={[styles.photoBtn, (busy || recording) && styles.sendDisabled]}
            accessibilityRole="button"
            accessibilityLabel="Add a photo"
          >
            <Text style={styles.photoIcon}>📷</Text>
          </Pressable>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={(t) => {
              setInput(t);
              if (voice.error) voice.clearError();
            }}
            placeholder={recording ? 'Listening…' : 'Ask Boomer AI anything…'}
            placeholderTextColor={colors.textMuted}
            multiline
            editable={!recording}
            accessibilityLabel="Message input"
          />
          <MicButton state={voice.state} onPress={voice.toggle} disabled={busy} />
          <AnimatedPressable
            onPress={() => handleSend(input)}
            disabled={busy || recording || (!input.trim() && !attachedImage)}
            pressedScale={0.93}
            style={[
              styles.sendBtn,
              (busy || recording || (!input.trim() && !attachedImage)) && styles.sendDisabled,
            ]}
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

/**
 * Strip every common markdown affordance the model occasionally emits so
 * assistant replies render as clean, professional plain prose. We keep the
 * original whitespace structure (paragraphs, lists) but remove the markup
 * characters themselves.
 */
function stripMarkdown(raw: string): string {
  if (!raw) return '';
  let s = raw;
  // Fenced code blocks → just the body
  s = s.replace(/```[a-zA-Z0-9_-]*\n?([\s\S]*?)```/g, (_m, body) => String(body).trim());
  // Inline code → strip backticks
  s = s.replace(/`([^`]+)`/g, '$1');
  // Bold (**text** / __text__)
  s = s.replace(/\*\*([^*\n]+)\*\*/g, '$1');
  s = s.replace(/__([^_\n]+)__/g, '$1');
  // Italic (*text* / _text_) — avoid eating list-bullet asterisks, handled below
  s = s.replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, '$1$2');
  s = s.replace(/(^|[^_])_([^_\n]+)_(?!_)/g, '$1$2');
  // Strikethrough
  s = s.replace(/~~([^~\n]+)~~/g, '$1');
  // Headings (#, ##, ### …) at line start
  s = s.replace(/^\s{0,3}#{1,6}\s+/gm, '');
  // Blockquote markers
  s = s.replace(/^\s{0,3}>\s?/gm, '');
  // Bullet markers (-, *, +, •) at line start → drop the marker
  s = s.replace(/^\s*[-*+•]\s+/gm, '');
  // Ordered list markers ("1. ") at line start → drop the marker
  s = s.replace(/^\s*\d+\.\s+/gm, '');
  // Markdown links [text](url) → "text (url)"
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)');
  // Stray leftover stars/underscores
  s = s.replace(/\*+/g, '');
  // Collapse 3+ blank lines into 2
  s = s.replace(/\n{3,}/g, '\n\n');
  // Trim trailing whitespace on each line
  s = s
    .split('\n')
    .map((line) => line.replace(/\s+$/g, ''))
    .join('\n');
  return s.trim();
}

function Bubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  const raw = message.parts.map((p) => p.text).join('');
  const text = isUser ? raw : stripMarkdown(raw);

  if (isUser) {
    return (
      <Animated.View entering={FadeInUp.duration(220)} style={[styles.bubbleRow, styles.rowEnd]}>
        <View style={[styles.bubble, styles.userBubble]}>
          {message.imageUri && (
            <Image source={{ uri: message.imageUri }} style={styles.bubbleImage} />
          )}
          {(text || !message.imageUri) && (
            <Text style={[styles.bubbleText, styles.userText]} selectable>
              {text || ' '}
            </Text>
          )}
        </View>
      </Animated.View>
    );
  }

  // AI turn: Sara's avatar + name make the back-and-forth easy to follow —
  // a companion face, not an abstract symbol.
  return (
    <Animated.View entering={FadeInUp.duration(220)} style={[styles.bubbleRow, styles.rowStart]}>
      <View style={styles.aiAvatar}>
        <Text style={styles.aiAvatarEmoji}>{COMPANION_EMOJI}</Text>
      </View>
      <View style={styles.aiColumn}>
        <Text style={styles.aiName}>{COMPANION_NAME}</Text>
        <View style={[styles.bubble, styles.aiBubble]}>
          <Text style={[styles.bubbleText, styles.aiText]} selectable>
            {text || ' '}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}

/** "Sara is thinking" skeleton — replaces the plain "Thinking…" text. */
function ThinkingBubble() {
  return (
    <Animated.View entering={FadeIn.duration(180)} style={[styles.bubbleRow, styles.rowStart]}>
      <View style={styles.aiAvatar}>
        <Text style={styles.aiAvatarEmoji}>{COMPANION_EMOJI}</Text>
      </View>
      <View style={[styles.bubble, styles.aiBubble, styles.thinkingBubble]}>
        <TypingDots />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  historyBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyIcon: { fontSize: 20 },
  newChatBtn: {
    minHeight: 36,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newChatText: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.primary },
  stars: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.textPrimary },
  bannerWrap: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  retryBtn: {
    marginTop: spacing.sm,
    minHeight: 44,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryText: { color: colors.textOnDark, fontSize: fontSize.md, fontWeight: fontWeight.bold },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  emptyEmoji: { fontSize: 48, marginBottom: spacing.md },
  emptyTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.black, color: colors.textPrimary },
  emptySub: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
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
  list: { padding: spacing.lg, gap: spacing.sm },
  bubbleRow: { flexDirection: 'row', marginVertical: 2 },
  rowEnd: { justifyContent: 'flex-end' },
  rowStart: { justifyContent: 'flex-start' },
  aiAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.xs,
    marginTop: 18,
  },
  aiAvatarEmoji: { fontSize: 15 },
  aiColumn: { flexShrink: 1, maxWidth: '85%' },
  aiName: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.textSecondary,
    marginBottom: 2,
    marginLeft: 4,
  },
  bubble: {
    maxWidth: '100%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 22,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 1,
  },
  userBubble: {
    maxWidth: '85%',
    backgroundColor: colors.primary,
    borderBottomRightRadius: 6,
  },
  aiBubble: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomLeftRadius: 6,
  },
  bubbleText: {
    fontSize: fontSize.md,
    lineHeight: 22,
    letterSpacing: 0.1,
  },
  aiText: { color: colors.textPrimary, fontWeight: fontWeight.medium },
  userText: { color: colors.textOnDark, fontWeight: fontWeight.medium },
  bubbleImage: {
    width: 200,
    height: 200,
    borderRadius: radius.md,
    marginBottom: 8,
    backgroundColor: colors.surfaceMuted,
  },
  thinking: { fontSize: fontSize.sm, color: colors.textMuted, paddingTop: spacing.sm },
  thinkingBubble: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, minHeight: 36 },
  attachWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  attachThumb: { width: 44, height: 44, borderRadius: radius.sm, backgroundColor: colors.surfaceMuted },
  attachLabel: { flex: 1, fontSize: fontSize.sm, color: colors.textSecondary, fontWeight: fontWeight.medium },
  attachRemove: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attachRemoveText: { fontSize: fontSize.sm, color: colors.textSecondary, fontWeight: fontWeight.bold },
  photoBtn: {
    minHeight: 48,
    minWidth: 48,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoIcon: { fontSize: 22 },
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
