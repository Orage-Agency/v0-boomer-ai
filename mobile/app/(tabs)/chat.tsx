import React, { useCallback, useRef, useState } from 'react';
import {
  FlatList,
  Alert,
  Image,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator,
} from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
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
import { useAuth } from '@/context/AuthContext';
import { conversationsApi } from '@/api';
import { getDeviceId } from '@/context/storage';
import {
  FREE_FEATURES,
  chatCounterStorageKey,
  todayKey,
} from '@/lib/freeTier';
import { colors, fontSize, fontWeight, radius, spacing } from '@/theme/theme';
import { PROFILE_BACKGROUNDS } from '@boomer-ai/shared';
import type { ChatMessage } from '@/types';

/**
 * AI Chat — FULLY IMPLEMENTED.
 * Streams replies from /api/chat and renders a message list with starter ideas.
 */
const STARTER_PROMPTS = [
  'How do I create a strong password I can remember?',
  'Is this email a scam? How can I tell?',
  'Teach me how to use video calling.',
  'Tell me a fun fact about technology.',
];

const ASSISTANT_SOURCES: Record<string, number> = {
  '/assistants/assistant_woman.png': require('../../assets/assistants/assistant_woman.png'),
  '/assistants/assistant_man.png': require('../../assets/assistants/assistant_man.png'),
};

export default function Chat() {
  const router = useRouter();
  const { messages, status, error, send, reset, loadConversation } = useChatSession();
  const { apiConfigured, profile } = useProfile();
  const { sessionToken } = useAuth();
  const { entitled } = useEntitlement();
  const [input, setInput] = useState('');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [historyVisible, setHistoryVisible] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [conversations, setConversations] = useState<
    { id: number | string; title: string; preview: string; timestamp: string }[]
  >([]);
  const listRef = useRef<FlatList<ChatMessage>>(null);

  // Keep latest entitled inside callbacks without re-creating subscriptions.
  const entitledRef = useRef(entitled);
  entitledRef.current = entitled;

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
        void send(trimmed, attachedImage ?? undefined);
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
    [attachedImage, consumeFreeQuota, send],
  );

  const pickPhoto = useCallback(async (useCamera: boolean) => {
    const permission = useCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Allow photo access to attach an image.');
      return;
    }
    const result = useCamera
      ? await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, base64: true, quality: 0.8 })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, base64: true, quality: 0.8 });
    const asset = result.canceled ? undefined : result.assets[0];
    if (asset?.base64) {
      setAttachedImage(`data:${asset.mimeType ?? 'image/jpeg'};base64,${asset.base64}`);
      if (!input.trim()) setInput('What can you tell me about this image?');
    }
  }, [input]);

  const addPhoto = useCallback(() => {
    Alert.alert('Add a photo', 'Choose how to add an image to your message.', [
      { text: 'Choose a photo', onPress: () => void pickPhoto(false) },
      { text: 'Take a photo', onPress: () => void pickPhoto(true) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }, [pickPhoto]);

  const openHistory = useCallback(async () => {
    setHistoryVisible(true);
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const deviceId = await getDeviceId();
      const response = await conversationsApi.listConversations(deviceId, sessionToken);
      setConversations(response.conversations);
    } catch (e) {
      setHistoryError(e instanceof Error ? e.message : 'Unable to load saved conversations.');
    } finally {
      setHistoryLoading(false);
    }
  }, [sessionToken]);

  const openConversation = useCallback(async (id: number | string) => {
    try {
      const deviceId = await getDeviceId();
      await loadConversation(id, deviceId);
      setHistoryVisible(false);
    } catch (e) {
      setHistoryError(e instanceof Error ? e.message : 'Unable to open this conversation.');
    }
  }, [loadConversation]);

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
  const assistantBackground = PROFILE_BACKGROUNDS.find((background) => background.id === profile.assistantBackground) ?? PROFILE_BACKGROUNDS[0];
  const assistantSource = ASSISTANT_SOURCES[profile.assistantSrc ?? ''] ?? ASSISTANT_SOURCES['/assistants/assistant_woman.png'];

  return (
    <Screen centered edges={['top']}>
      <View style={styles.header}>
        <View style={styles.chatIdentity}>
          <LinearGradient colors={assistantBackground.colors} style={styles.assistantAvatar}>
            <Image source={assistantSource} style={styles.assistantAvatarImage} accessibilityLabel="Your assistant" />
          </LinearGradient>
          <Text style={styles.title}>Chat</Text>
        </View>
        <View style={styles.headerActions}>
          {messages.length > 0 && (
            <Pressable
              style={styles.headerButton}
              onPress={reset}
              accessibilityRole="button"
              accessibilityLabel="Start a new chat"
            >
              <Text style={styles.headerButtonText}>New chat</Text>
            </Pressable>
          )}
          <Pressable
            style={styles.headerButton}
            onPress={() => void openHistory()}
            accessibilityRole="button"
          >
            <Text style={styles.headerButtonText}>History</Text>
          </Pressable>
        </View>
      </View>

      <Modal
        visible={historyVisible}
        animationType="slide"
        onRequestClose={() => setHistoryVisible(false)}
        presentationStyle="pageSheet"
      >
        <View style={styles.historyScreen}>
          <View style={styles.historyHeader}>
            <Text style={styles.historyTitle}>Saved conversations</Text>
            <Pressable
              onPress={() => setHistoryVisible(false)}
              accessibilityRole="button"
              accessibilityLabel="Close saved conversations"
              hitSlop={12}
            >
              <Text style={styles.headerButtonText}>Close</Text>
            </Pressable>
          </View>
          {historyLoading ? (
            <ActivityIndicator style={styles.historyLoading} color={colors.ink} />
          ) : historyError ? (
            <Text style={styles.historyMessage} accessibilityRole="alert">{historyError}</Text>
          ) : conversations.length === 0 ? (
            <Text style={styles.historyMessage}>Saved conversations will appear here.</Text>
          ) : (
            <ScrollView contentContainerStyle={styles.historyList}>
              {conversations.map((conversation) => (
                <Pressable
                  key={conversation.id}
                  style={styles.historyItem}
                  onPress={() => void openConversation(conversation.id)}
                  accessibilityRole="button"
                >
                  <Text style={styles.historyItemTitle} numberOfLines={2}>{conversation.title}</Text>
                  <Text style={styles.historyItemPreview} numberOfLines={2}>{conversation.preview}</Text>
                  <Text style={styles.historyItemDate}>
                    {new Date(conversation.timestamp).toLocaleDateString()}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          )}
        </View>
      </Modal>

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

        {attachedImage && (
          <View style={styles.attachmentPreview}>
            <Image source={{ uri: attachedImage }} style={styles.attachmentImage} accessibilityLabel="Photo attached" />
            <Pressable
              onPress={() => setAttachedImage(null)}
              style={styles.removeAttachment}
              accessibilityRole="button"
              accessibilityLabel="Remove attached photo"
              hitSlop={8}
            >
              <Ionicons name="close-circle" size={24} color={colors.textPrimary} />
            </Pressable>
          </View>
        )}
        <View style={styles.inputBar}>
          <Pressable
            onPress={addPhoto}
            style={styles.iconButton}
            accessibilityRole="button"
            accessibilityLabel="Add a photo"
          >
            <Ionicons name="add" size={28} color={colors.textPrimary} />
          </Pressable>
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
          <Pressable
            onPress={() => router.push('/voice')}
            disabled={busy}
            style={[styles.iconButton, busy && styles.sendDisabled]}
            accessibilityRole="button"
            accessibilityLabel="Open voice chat"
          >
            <Ionicons name="mic-outline" size={23} color={colors.textPrimary} />
          </Pressable>
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
  chatIdentity: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  assistantAvatar: { width: 36, height: 36, borderRadius: 18, overflow: 'hidden' },
  assistantAvatarImage: { width: '100%', height: '100%' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  headerButton: { minHeight: 44, justifyContent: 'center', paddingHorizontal: spacing.sm },
  headerButtonText: { fontSize: fontSize.sm, color: colors.textPrimary, fontWeight: fontWeight.semibold, textDecorationLine: 'underline' },
  historyScreen: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
  historyHeader: { minHeight: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: colors.border },
  historyTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.textPrimary },
  historyLoading: { marginTop: spacing.xl },
  historyMessage: { marginTop: spacing.xl, fontSize: fontSize.md, color: colors.textSecondary, lineHeight: 26 },
  historyList: { paddingVertical: spacing.md, gap: spacing.md },
  historyItem: { padding: spacing.md, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, gap: spacing.xs },
  historyItemTitle: { fontSize: fontSize.md, color: colors.textPrimary, fontWeight: fontWeight.semibold },
  historyItemPreview: { fontSize: fontSize.sm, color: colors.textSecondary, lineHeight: 23 },
  historyItemDate: { fontSize: fontSize.xs, color: colors.textMuted },
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
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attachmentPreview: {
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
    position: 'relative',
  },
  attachmentImage: { width: 64, height: 64, borderRadius: radius.md },
  removeAttachment: {
    position: 'absolute',
    right: -8,
    top: -8,
    backgroundColor: colors.surface,
    borderRadius: 12,
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
