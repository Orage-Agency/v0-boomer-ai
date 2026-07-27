import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
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
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { BrandHeader } from '@/components/BrandHeader';
import { InfoBanner } from '@/components/InfoBanner';
import { TypingDots } from '@/components/Skeleton';
import { AnimatedPressable } from '@/components/AnimatedPressable';
import { MicButton } from '@/components/MicButton';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { imagesApi, ttsApi, ApiError } from '@/api';
import { shareRemoteImage } from '@/lib/shareImage';
import { useChatSession, makeMessageId } from '@/screens/useChat';
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
  consumeChatQuota,
  getChatRemainingToday,
  refundChatQuota,
} from '@/lib/freeTier';
import { colors, fontSize, fontWeight, radius, spacing } from '@/theme/theme';
import type { ChatMessage } from '@/types';

/**
 * AI Chat — FULLY IMPLEMENTED.
 * Streams replies from /api/chat token-by-token, renders a structured message
 * list (Sarah's avatar + name on AI turns), and awards stars on send (matching
 * the web reward logic: +10 + "First Chat" badge on first message, +1 after).
 *
 * Input bar affordances: photo (camera / library), voice-to-text (Whisper),
 * and plain typing. A failed send offers one-tap "Try Again".
 *
 * MEMORY: the conversation survives app restarts (see useChatSession), and
 * the History screen can reopen any saved conversation to continue it.
 */

/** The friendly face of the assistant across the app. */
export const COMPANION_NAME = 'Sarah';
export const COMPANION_AVATAR = require('../../assets/sarah-avatar.jpg');

// ---- In-chat picture creation -------------------------------------------

/**
 * Does this message ask Sarah to CREATE a picture (vs. talk about one)?
 * Requires a making-verb AND an image-noun so ordinary sentences like
 * "I took a photo yesterday" don't trigger it. "show" is deliberately NOT a
 * making-verb — "show me a photo of how to..." is a question, not an art
 * request, and used to hijack normal questions into image generation.
 * Photo attachments never trigger it either (the caller skips detection
 * when an image is attached).
 */
const ART_NOUN = 'picture|image|photo|drawing|painting|artwork|art|illustration';

function isImageRequest(text: string): boolean {
  // "make me a picture of a barn", "create some art of a sunset"
  const verbThenNoun = new RegExp(
    `\\b(draw|paint|create|generate|make|design|sketch|illustrate)\\b[\\s\\S]{0,40}?\\b(${ART_NOUN})\\b`,
    'i',
  );
  // "a picture of my dog", "I'd love a painting of the lake"
  const nounOf = new RegExp(`\\b(${ART_NOUN})\\s+(of|showing)\\b`, 'i');
  // "paint a barn in autumn" — these verbs only ever mean art here, so the
  // noun is optional. ("make"/"create"/"design" are excluded: "make me a
  // sandwich" must stay a normal chat message.)
  const artVerbLed = /^\s*(please\s+)?(can|could|will|would)?\s*(you\s+)?(please\s+)?(draw|paint|sketch|illustrate)\b/i;
  return verbThenNoun.test(text) || nounOf.test(text) || artVerbLed.test(text);
}

/** Strip "can you draw me a picture of" style framing → the actual subject. */
function cleanImagePrompt(text: string): string {
  let s = text.trim();
  s = s.replace(/^(hey|hi|hello|please|sarah?)[,!.\s]+/i, '');
  s = s.replace(/^(can|could|will|would)\s+you\s+(please\s+)?/i, '');
  // "I would like / I want / I'd love" framing before the real subject.
  s = s.replace(/^(i\s+(would|really)?\s*(like|want|need|love)\s+(to\s+)?(see\s+)?)/i, '');
  s = s.replace(
    /\b(draw|paint|create|generate|make|design|sketch|illustrate|show)\s+(me\s+)?(us\s+)?(a|an|the|some)?\s*(nice\s+|pretty\s+|beautiful\s+)?(picture|image|photo|drawing|painting|artwork|art|illustration)s?\s*(of|about|with|showing)?\s*/i,
    '',
  );
  // Bare "a picture of X" with no verb in front.
  s = s.replace(
    /^(a|an|the|some)?\s*(picture|image|photo|drawing|painting|artwork|art|illustration)s?\s+(of|showing)\s+/i,
    '',
  );
  // Leading art verb with no noun after it ("paint a barn in autumn").
  s = s.replace(/^(draw|paint|sketch|illustrate)\s+(me\s+)?(us\s+)?/i, '');
  s = s.replace(/^(please|kindly)[,!.\s]+/i, '');
  s = s.replace(/[?!.]+$/g, '').trim();
  return s.length >= 3 ? s : text.trim();
}

/** Friendly M:SS for the recording timer. */
function formatDuration(ms: number): string {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

// ---- Gentle Pro upsell moments -------------------------------------------

/** Show a friendly "Go Pro" card after this many lifetime sends (free users). */
const UPSELL_MILESTONES = [8, 20];
const LIFETIME_SENDS_KEY = 'boomer.chat.lifetimeSends';
const UPSELL_SHOWN_KEY = 'boomer.chat.upsellShown';
const STARTER_PROMPTS = [
  'How do I create a strong password I can remember?',
  'Is this email a scam? How can I tell?',
  'Teach me how to use video calling.',
  'Tell me a fun fact about technology.',
];

export default function Chat() {
  const router = useRouter();
  const { messages, status, error, send, reset, loadById, appendLocal, updateMessage } =
    useChatSession();
  const { profile, updateProfile, apiConfigured } = useProfile();
  const { entitled } = useEntitlement();
  const [input, setInput] = useState('');
  const [attachedImage, setAttachedImage] = useState<{ uri: string; dataUrl: string } | null>(null);
  const [imageBusy, setImageBusy] = useState(false);
  /** Free chats left today (null = unknown / still loading). Free users only. */
  const [freeRemaining, setFreeRemaining] = useState<number | null>(null);
  /** Which assistant message is currently being read aloud (if any). */
  const [listeningId, setListeningId] = useState<string | null>(null);
  const listenSoundRef = useRef<Audio.Sound | null>(null);
  const listRef = useRef<FlatList<ChatMessage>>(null);
  // Only auto-scroll while the user is already at the bottom — never yank
  // them back down while they scrolled up to re-read something.
  const atBottomRef = useRef(true);
  // Milestone queued while Sarah is replying; shown once she finishes.
  const pendingUpsellRef = useRef<number | null>(null);
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
   * Consume one free message (re-keyed on the current local date, so an app
   * left open across midnight resets correctly). Routes to the paywall when
   * the cap is reached. Returns true when the message is allowed to send.
   */
  const consumeFreeQuota = useCallback(async (): Promise<boolean> => {
    const remaining = await consumeChatQuota();
    if (remaining == null) {
      setFreeRemaining(0);
      router.push('/paywall?reason=chat_quota');
      return false;
    }
    setFreeRemaining(remaining);
    return true;
  }, [router]);

  /** Read aloud one of Sarah's replies — same ElevenLabs voice as her calls. */
  const stopListening = useCallback(async () => {
    const s = listenSoundRef.current;
    listenSoundRef.current = null;
    setListeningId(null);
    if (s) {
      try {
        await s.stopAsync();
      } catch {
        /* already stopped */
      }
      try {
        await s.unloadAsync();
      } catch {
        /* already unloaded */
      }
    }
  }, []);

  const handleListen = useCallback(
    async (message: ChatMessage) => {
      const wasListening = listeningId === message.id;
      await stopListening();
      if (wasListening) return; // tap again = stop
      const text = message.parts.map((p) => p.text).join('').trim();
      if (!text) return;
      setListeningId(message.id);
      try {
        await Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true });
        const dataUri = await ttsApi.speakText(text);
        const { sound } = await Audio.Sound.createAsync({ uri: dataUri });
        listenSoundRef.current = sound;
        sound.setOnPlaybackStatusUpdate((s) => {
          if (s.isLoaded && s.didJustFinish) {
            setListeningId((cur) => (cur === message.id ? null : cur));
            void sound.unloadAsync();
            if (listenSoundRef.current === sound) listenSoundRef.current = null;
          }
        });
        await sound.playAsync();
      } catch {
        setListeningId((cur) => (cur === message.id ? null : cur));
      }
    },
    [listeningId, stopListening],
  );

  // Stop any read-aloud when leaving the screen.
  useEffect(() => {
    return () => {
      void stopListening();
    };
  }, [stopListening]);

  /** Append a friendly "Go Pro" card as a Sarah turn. */
  const appendUpsellCard = useCallback(
    (kind: 'image' | 'milestone', userText?: string) => {
      const cardText =
        kind === 'image'
          ? "I'd love to paint that for you! Creating pictures is part of Boomer AI Pro — along with voice conversations and unlimited chatting."
          : "You're getting a lot out of our chats — wonderful! With Pro you get unlimited messages, voice conversations, and picture creation.";
      const cards: ChatMessage[] = [];
      if (userText) {
        cards.push({
          id: makeMessageId('user'),
          role: 'user',
          parts: [{ type: 'text', text: userText }],
        });
      }
      cards.push({
        id: makeMessageId('assistant'),
        role: 'assistant',
        parts: [{ type: 'text', text: cardText }],
        upsell: true,
      });
      appendLocal(cards);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    },
    [appendLocal],
  );

  /**
   * Sarah paints INSIDE the chat: user message + "painting…" placeholder →
   * the finished artwork replaces the placeholder. No screen changes.
   */
  const runImageFlow = useCallback(
    async (text: string) => {
      const userMsg: ChatMessage = {
        id: makeMessageId('user'),
        role: 'user',
        parts: [{ type: 'text', text }],
      };
      const placeholderId = makeMessageId('assistant');
      appendLocal([
        userMsg,
        {
          id: placeholderId,
          role: 'assistant',
          parts: [{ type: 'text', text: 'What a lovely idea! Let me paint that for you…' }],
          imagePending: true,
        },
      ]);
      setImageBusy(true);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
      try {
        const prompt = `${cleanImagePrompt(text)}, high quality, beautiful lighting`;
        const res = await imagesApi.generateImage(prompt);
        if (res.imageUrl) {
          updateMessage(placeholderId, {
            id: placeholderId,
            role: 'assistant',
            parts: [
              { type: 'text', text: 'Here you go! Tap the picture to save or share it. 🎨' },
            ],
            generatedImageUrl: res.imageUrl,
          });
          updateProfile({ stars: profile.stars + 1 });
        } else {
          updateMessage(placeholderId, {
            id: placeholderId,
            role: 'assistant',
            parts: [
              {
                type: 'text',
                text: res.error ?? "I couldn't create that picture. Please try asking again.",
              },
            ],
          });
        }
      } catch (e) {
        updateMessage(placeholderId, {
          id: placeholderId,
          role: 'assistant',
          parts: [
            {
              type: 'text',
              text:
                e instanceof ApiError
                  ? e.message
                  : "I couldn't create that picture right now. Please check your internet and try again.",
            },
          ],
        });
      } finally {
        setImageBusy(false);
        setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
      }
    },
    [appendLocal, updateMessage, updateProfile, profile.stars],
  );

  /** Count lifetime sends; queue a one-time Pro card at friendly milestones. */
  const maybeQueueUpsell = useCallback(async () => {
    if (entitledRef.current) return;
    try {
      const raw = await AsyncStorage.getItem(LIFETIME_SENDS_KEY);
      const count = (raw ? Number.parseInt(raw, 10) || 0 : 0) + 1;
      await AsyncStorage.setItem(LIFETIME_SENDS_KEY, String(count));
      if (!UPSELL_MILESTONES.includes(count)) return;
      const shownRaw = await AsyncStorage.getItem(UPSELL_SHOWN_KEY);
      const shown: number[] = shownRaw ? JSON.parse(shownRaw) : [];
      if (shown.includes(count)) return;
      await AsyncStorage.setItem(UPSELL_SHOWN_KEY, JSON.stringify([...shown, count]));
      pendingUpsellRef.current = count;
    } catch {
      /* counters are best-effort */
    }
  }, []);

  const handleSend = useCallback(
    (text: string, imageOverride?: { uri: string; dataUrl: string } | null) => {
      const trimmed = text.trim();
      const image = imageOverride !== undefined ? imageOverride : attachedImage;
      if (!trimmed && !image) return;

      // "Draw me a picture of…" → Sarah paints right here in the chat.
      // (Never triggered when the user attached a photo to ask about it.)
      if (!image && trimmed && isImageRequest(trimmed)) {
        setInput('');
        if (entitledRef.current) {
          void runImageFlow(trimmed);
        } else {
          appendUpsellCard('image', trimmed);
        }
        return;
      }

      const runSend = (refundOnFailure: boolean) => {
        lastAttempt.current = { text: trimmed, image: image ?? undefined };
        awardStars();
        void (async () => {
          const ok = await send(trimmed, image ?? undefined);
          // A failed send shouldn't cost a free message.
          if (!ok && refundOnFailure) {
            await refundChatQuota();
            setFreeRemaining(await getChatRemainingToday());
          }
        })();
        void maybeQueueUpsell();
        setInput('');
        setAttachedImage(null);
        atBottomRef.current = true;
        setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
      };
      if (entitledRef.current) {
        runSend(false);
        return;
      }
      void (async () => {
        const ok = await consumeFreeQuota();
        if (ok) runSend(true);
      })();
    },
    [
      awardStars,
      consumeFreeQuota,
      send,
      attachedImage,
      runImageFlow,
      appendUpsellCard,
      maybeQueueUpsell,
    ],
  );

  // Surface a queued milestone card once Sarah finishes her current reply.
  useEffect(() => {
    if (status !== 'idle' || pendingUpsellRef.current == null) return;
    pendingUpsellRef.current = null;
    appendUpsellCard('milestone');
  }, [status, appendUpsellCard]);

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
      // Keep the free-chats-left pill honest whenever the tab gains focus.
      if (!entitledRef.current) {
        void getChatRemainingToday().then(setFreeRemaining);
      }
      const conversation = consumePendingConversation();
      if (conversation != null) void loadByIdRef.current(conversation);
      const queued = consumePendingPrompt();
      if (queued) handleSendRef.current(queued, null);
      if (consumePendingMic()) {
        // Give the tab transition a beat to settle — starting the recorder
        // mid-navigation (possibly under a permission prompt) is flaky.
        setTimeout(() => {
          if (voiceRef.current.state === 'idle') voiceRef.current.toggle();
        }, 350);
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

  const busy = status === 'streaming' || status === 'submitted' || imageBusy;
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
              <Ionicons name="time-outline" size={22} color={colors.textSecondary} />
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

        {!entitled && freeRemaining != null && (
          <Pressable
            onPress={() => router.push('/paywall?reason=chat_upsell')}
            style={styles.quotaPill}
            accessibilityRole="button"
            accessibilityLabel={`${freeRemaining} free chats left today. See Pro options for unlimited.`}
          >
            <Text style={styles.quotaText}>
              {freeRemaining > 0
                ? `${freeRemaining} of ${FREE_FEATURES.CHAT_DAILY_CAP} free chats left today`
                : 'No free chats left today'}
            </Text>
            <Text style={styles.quotaLink}>Go unlimited ›</Text>
          </Pressable>
        )}

        {messages.length === 0 ? (
          <Animated.View entering={FadeInUp.duration(300)} style={styles.empty}>
            <Image source={COMPANION_AVATAR} style={styles.emptyAvatar} />
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
            onScroll={(e) => {
              const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
              atBottomRef.current =
                contentOffset.y + layoutMeasurement.height >= contentSize.height - 48;
            }}
            scrollEventThrottle={120}
            onContentSizeChange={() => {
              if (atBottomRef.current) listRef.current?.scrollToEnd({ animated: true });
            }}
            renderItem={({ item }) => (
              <Bubble
                message={item}
                listening={listeningId === item.id}
                onListen={() => void handleListen(item)}
                onUpsellPress={() => router.push('/paywall?reason=chat_upsell')}
              />
            )}
            ListFooterComponent={busy && !imageBusy ? <ThinkingBubble /> : null}
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

        {recording ? (
          /* Big, unmistakable recording bar: red dot + live timer + two
             clear choices. Replaces the whole input row while listening. */
          <View style={styles.recordBar}>
            <View style={styles.recDot} />
            <View style={styles.recInfo}>
              <Text style={styles.recTimer}>{formatDuration(voice.durationMs)}</Text>
              <Text style={styles.recHint}>Listening… speak now (up to 1 min)</Text>
            </View>
            <Pressable
              onPress={voice.cancel}
              style={styles.recCancel}
              accessibilityRole="button"
              accessibilityLabel="Cancel recording"
              hitSlop={6}
            >
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </Pressable>
            <Pressable
              onPress={voice.toggle}
              style={styles.recSend}
              accessibilityRole="button"
              accessibilityLabel="Stop recording and send"
            >
              <View style={styles.recSendRow}>
                <Ionicons name="stop" size={18} color={colors.textOnDark} />
                <Text style={styles.recSendText}>Stop & Send</Text>
              </View>
            </Pressable>
          </View>
        ) : (
          <View style={styles.inputBar}>
            <Pressable
              onPress={openPhotoOptions}
              disabled={busy}
              style={[styles.photoBtn, busy && styles.sendDisabled]}
              accessibilityRole="button"
              accessibilityLabel="Add a photo"
            >
              <Ionicons name="camera-outline" size={24} color={colors.textSecondary} />
            </Pressable>
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={(t) => {
                setInput(t);
                if (voice.error) voice.clearError();
              }}
              placeholder={
                voice.state === 'transcribing'
                  ? 'Understanding your words…'
                  : 'Ask Sarah anything…'
              }
              placeholderTextColor={colors.textMuted}
              multiline
              accessibilityLabel="Message input"
            />
            <MicButton state={voice.state} onPress={voice.toggle} disabled={busy} />
            <AnimatedPressable
              onPress={() => handleSend(input)}
              disabled={busy || (!input.trim() && !attachedImage)}
              pressedScale={0.93}
              style={[
                styles.sendBtn,
                (busy || (!input.trim() && !attachedImage)) && styles.sendDisabled,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Send message"
            >
              <Text style={styles.sendText}>Send</Text>
            </AnimatedPressable>
          </View>
        )}
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

function Bubble({
  message,
  listening,
  onListen,
  onUpsellPress,
}: {
  message: ChatMessage;
  listening?: boolean;
  onListen?: () => void;
  onUpsellPress?: () => void;
}) {
  const isUser = message.role === 'user';
  const raw = message.parts.map((p) => p.text).join('');
  const text = isUser ? raw : stripMarkdown(raw);
  const [sharing, setSharing] = useState(false);

  const handleShareArt = useCallback(() => {
    if (!message.generatedImageUrl || sharing) return;
    setSharing(true);
    void shareRemoteImage(message.generatedImageUrl).finally(() => setSharing(false));
  }, [message.generatedImageUrl, sharing]);

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

  // AI turn: Sarah's avatar + name make the back-and-forth easy to follow —
  // a companion face, not an abstract symbol.
  return (
    <Animated.View entering={FadeInUp.duration(220)} style={[styles.bubbleRow, styles.rowStart]}>
      <Image source={COMPANION_AVATAR} style={styles.aiAvatar} />
      <View style={styles.aiColumn}>
        <Text style={styles.aiName}>{COMPANION_NAME}</Text>
        <View style={[styles.bubble, styles.aiBubble]}>
          <Text style={[styles.bubbleText, styles.aiText]} selectable>
            {text || ' '}
          </Text>
          {!!text.trim() && !message.upsell && !message.imagePending && onListen && (
            <Pressable
              onPress={onListen}
              style={styles.listenBtn}
              accessibilityRole="button"
              accessibilityLabel={
                listening ? 'Stop reading aloud' : "Listen to Sarah's reply out loud"
              }
              hitSlop={6}
            >
              <Ionicons
                name={listening ? 'stop-circle-outline' : 'volume-high-outline'}
                size={18}
                color={colors.primary}
              />
              <Text style={styles.listenText}>{listening ? 'Stop' : 'Listen'}</Text>
            </Pressable>
          )}
          {message.imagePending && (
            <View style={styles.artPending}>
              <ActivityIndicator color={colors.primary} />
              <Text style={styles.artPendingText}>Painting… about 10 seconds</Text>
            </View>
          )}
          {message.generatedImageUrl && (
            <Pressable
              onPress={handleShareArt}
              accessibilityRole="button"
              accessibilityLabel="Tap the picture to save or share it"
            >
              <Image
                source={{ uri: message.generatedImageUrl }}
                style={styles.artImage}
                resizeMode="cover"
              />
              <Text style={styles.artHint}>{sharing ? 'Opening…' : '💾 Tap to save or share'}</Text>
            </Pressable>
          )}
          {message.upsell && onUpsellPress && (
            <Pressable
              onPress={onUpsellPress}
              style={styles.upsellBtn}
              accessibilityRole="button"
              accessibilityLabel="See Boomer AI Pro options"
            >
              <Text style={styles.upsellBtnText}>⭐ See Pro Options ›</Text>
            </Pressable>
          )}
        </View>
      </View>
    </Animated.View>
  );
}

/** "Sarah is thinking" skeleton — replaces the plain "Thinking…" text. */
function ThinkingBubble() {
  return (
    <Animated.View entering={FadeIn.duration(180)} style={[styles.bubbleRow, styles.rowStart]}>
      <Image source={COMPANION_AVATAR} style={styles.aiAvatar} />
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
  emptyAvatar: { width: 96, height: 96, borderRadius: 48, marginBottom: spacing.md },
  quotaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.amberSoft,
    borderWidth: 1,
    borderColor: '#FDE68A',
    minHeight: 40,
  },
  quotaText: { fontSize: fontSize.xs, fontWeight: fontWeight.bold, color: '#92400E' },
  quotaLink: { fontSize: fontSize.xs, fontWeight: fontWeight.black, color: colors.primary },
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
    marginRight: spacing.xs,
    marginTop: 18,
  },
  listenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
    minHeight: 32,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
  },
  listenText: { fontSize: fontSize.xs, fontWeight: fontWeight.bold, color: colors.primary },
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
  // Recording bar — replaces the input row while the mic is live.
  recordBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: '#FEF2F2',
  },
  recDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#DC2626',
  },
  recInfo: { flex: 1 },
  recTimer: { fontSize: fontSize.lg, fontWeight: fontWeight.black, color: '#991B1B' },
  recHint: { fontSize: fontSize.xs, color: '#991B1B' },
  recCancel: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recCancelText: { fontSize: fontSize.md, color: colors.textSecondary, fontWeight: fontWeight.bold },
  recSend: {
    minHeight: 48,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recSendRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  recSendText: { color: colors.textOnDark, fontWeight: fontWeight.bold, fontSize: fontSize.md },
  // Inline artwork from Sarah
  artPending: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  artPendingText: { fontSize: fontSize.sm, color: colors.textSecondary },
  artImage: {
    width: 220,
    height: 220,
    borderRadius: radius.md,
    marginTop: spacing.sm,
    backgroundColor: colors.surfaceMuted,
  },
  artHint: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  // Pro upsell card button
  upsellBtn: {
    marginTop: spacing.sm,
    minHeight: 48,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  upsellBtnText: { color: colors.textOnDark, fontSize: fontSize.md, fontWeight: fontWeight.bold },
});
