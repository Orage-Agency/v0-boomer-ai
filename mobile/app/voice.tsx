import React, { useCallback, useEffect, useRef, useState } from 'react';
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
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { InfoBanner } from '@/components/InfoBanner';
import { useChatSession } from '@/screens/useChat';
import { useProfile } from '@/context/ProfileContext';
import { isApiConfigured } from '@/config/env';
import { ttsApi } from '@/api';
import { colors, fontSize, fontWeight, radius, spacing } from '@/theme/theme';
import type { ChatMessage } from '@/types';

/**
 * Voice chat screen.
 *
 * Reuses the same `useChatSession` hook as the text Chat tab, so the backend
 * contract (`/api/chat`) is shared. The difference here is the experience:
 *  - The AI's replies are SPOKEN ALOUD via `expo-speech` (TTS), which works in
 *    Expo managed / Expo Go with no native config.
 *  - A large microphone button is the primary affordance, plus a type-to-send
 *    fallback that always works.
 *
 * SPEECH-TO-TEXT (the "speak -> transcribe" half):
 * Expo's managed workflow has no built-in on-device speech recognition, and the
 * hosted backend exposes no STT endpoint (the web app used the browser
 * SpeechRecognition API + ElevenLabs, neither available in React Native). So
 * the mic button currently records intent and prompts the user to type, and the
 * full record->transcribe path is stubbed below.
 *
 * TODO(owner): Wire real speech-to-text. Recommended options, in order:
 *   1. `@react-native-voice/voice` (on-device STT, iOS + Android). Requires a
 *      custom dev client (not Expo Go) and the config plugin. Lowest latency,
 *      free, no backend.
 *   2. `expo-av` recording -> POST the audio to a NEW backend STT endpoint
 *      (e.g. /api/transcribe using OpenAI Whisper). Add the route to
 *      v0-boomer-ai, then a `transcribeAudio()` client in src/api.
 * Until then, TTS output + type-to-send gives a reliable, shippable voice-style
 * experience.
 */

export default function VoiceScreen() {
  const router = useRouter();
  const { messages, status, error, send } = useChatSession();
  const { profile, updateProfile } = useProfile();
  const [input, setInput] = useState('');
  const [speaking, setSpeaking] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const lastSpokenId = useRef<string | null>(null);
  const awardedStar = useRef(false);

  const busy = status === 'streaming' || status === 'submitted';

  // Speak the assistant's reply aloud once it finishes streaming.
  // Primary: backend TTS (OpenAI proxy at /api/tts) played via expo-av.
  // Fallback: expo-speech device TTS if the backend call fails.
  useEffect(() => {
    if (!ttsEnabled) return;
    if (status !== 'idle' || messages.length === 0) return;
    const last = messages[messages.length - 1];
    if (last.role !== 'assistant' || last.id === lastSpokenId.current) return;
    const text = last.parts.map((p) => p.text).join('').trim();
    if (!text) return;
    lastSpokenId.current = last.id;
    setSpeaking(true);

    const playWithBackendTts = async () => {
      try {
        await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
        const dataUri = await ttsApi.speakText(text);
        const { sound } = await Audio.Sound.createAsync({ uri: dataUri });
        await sound.playAsync();
        sound.setOnPlaybackStatusUpdate((s) => {
          if (s.isLoaded && s.didJustFinish) {
            setSpeaking(false);
            void sound.unloadAsync();
          }
        });
      } catch {
        // Fallback to device speech if backend TTS fails
        Speech.speak(text, {
          rate: 0.95,
          onDone: () => setSpeaking(false),
          onStopped: () => setSpeaking(false),
          onError: () => setSpeaking(false),
        });
      }
    };

    void playWithBackendTts();
  }, [messages, status, ttsEnabled]);

  // Stop any speech when leaving the screen.
  useEffect(() => {
    return () => {
      void Speech.stop();
    };
  }, []);

  const handleSend = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || busy) return;
      void Speech.stop();
      setSpeaking(false);
      // Award +2 stars on the first voice interaction (matches web reward).
      if (!awardedStar.current) {
        awardedStar.current = true;
        updateProfile({ stars: profile.stars + 2 });
      }
      void send(trimmed);
      setInput('');
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    },
    [busy, send, profile.stars, updateProfile],
  );

  const toggleTts = useCallback(() => {
    setTtsEnabled((prev) => {
      const next = !prev;
      if (!next) void Speech.stop();
      return next;
    });
  }, []);

  const handleMicPress = useCallback(() => {
    // TODO(owner): replace with real STT (see file header). For now, focus the
    // text field so the experience stays usable without speech recognition.
    void Speech.stop();
  }, []);

  return (
    <Screen centered edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Text style={styles.backText}>‹ Back</Text>
        </Pressable>
        <Text style={styles.title}>Talk to AI</Text>
        <Pressable
          onPress={toggleTts}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel={ttsEnabled ? 'Turn off voice replies' : 'Turn on voice replies'}
        >
          <Text style={styles.ttsToggle}>{ttsEnabled ? '🔊' : '🔇'}</Text>
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={20}
      >
        {!isApiConfigured && (
          <View style={styles.bannerWrap}>
            <InfoBanner
              tone="warn"
              title="Server not connected"
              message="Set the API base URL in app.json to enable voice chat."
            />
          </View>
        )}

        {messages.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🎙️</Text>
            <Text style={styles.emptyTitle}>Hi {profile.name || profile.userName || 'there'}!</Text>
            <Text style={styles.emptySub}>
              Tap the microphone and ask your question, or type it below. I'll read my answer
              out loud.
            </Text>
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(m) => m.id}
            contentContainerStyle={styles.list}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
            renderItem={({ item }) => <Bubble message={item} />}
            ListFooterComponent={
              busy ? <Text style={styles.status}>Thinking…</Text> : speaking ? (
                <Text style={styles.status}>🔊 Speaking…</Text>
              ) : null
            }
          />
        )}

        {error && (
          <View style={styles.bannerWrap}>
            <InfoBanner tone="danger" message={error} />
          </View>
        )}

        {/* Big mic button (STT stub) */}
        <View style={styles.micWrap}>
          <Pressable
            onPress={handleMicPress}
            disabled={busy}
            style={[styles.mic, busy && styles.micDisabled]}
            accessibilityRole="button"
            accessibilityLabel="Hold to speak (type your question below)"
          >
            <Text style={styles.micEmoji}>🎤</Text>
          </Pressable>
          <Text style={styles.micHint}>Type your question below to talk to the AI</Text>
        </View>

        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Type what you'd say…"
            placeholderTextColor={colors.textMuted}
            multiline
            editable={!busy}
            accessibilityLabel="Voice message input"
            onSubmitEditing={() => handleSend(input)}
          />
          <Pressable
            onPress={() => handleSend(input)}
            disabled={busy || !input.trim()}
            style={[styles.sendBtn, (busy || !input.trim()) && styles.sendDisabled]}
            accessibilityRole="button"
            accessibilityLabel="Send message"
          >
            <Text style={styles.sendText}>Send</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

function Bubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  const text = message.parts.map((p) => p.text).join('');
  return (
    <View style={[styles.bubbleRow, isUser ? styles.rowEnd : styles.rowStart]}>
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
        <Text style={styles.speaker}>{isUser ? 'You' : 'AI'}</Text>
        <Text style={[styles.bubbleText, isUser && styles.userText]}>{text || ' '}</Text>
      </View>
    </View>
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
  backBtn: { minWidth: 64, minHeight: 44, justifyContent: 'center' },
  backText: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.primary },
  ttsToggle: { fontSize: 22, textAlign: 'right' },
  title: { fontSize: fontSize.lg, fontWeight: fontWeight.black, color: colors.textPrimary },
  bannerWrap: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  emptyEmoji: { fontSize: 56, marginBottom: spacing.md },
  emptyTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.black, color: colors.textPrimary },
  emptySub: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: 'center',
    lineHeight: 24,
  },
  list: { padding: spacing.lg, gap: spacing.md },
  bubbleRow: { flexDirection: 'row' },
  rowEnd: { justifyContent: 'flex-end' },
  rowStart: { justifyContent: 'flex-start' },
  bubble: { maxWidth: '85%', padding: spacing.md, borderRadius: radius.lg, gap: 2 },
  userBubble: { backgroundColor: colors.purple },
  aiBubble: { backgroundColor: colors.surfaceSubtle, borderWidth: 1, borderColor: colors.border },
  speaker: { fontSize: fontSize.xs, fontWeight: fontWeight.bold, opacity: 0.7, color: colors.textSecondary },
  bubbleText: { fontSize: fontSize.md, lineHeight: 24, color: colors.textPrimary },
  userText: { color: colors.textOnDark },
  status: { fontSize: fontSize.sm, color: colors.textMuted, paddingTop: spacing.sm },
  micWrap: { alignItems: 'center', paddingVertical: spacing.md, gap: spacing.sm },
  mic: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.purple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micDisabled: { opacity: 0.4 },
  micEmoji: { fontSize: 32 },
  micHint: { fontSize: fontSize.xs, color: colors.textMuted, textAlign: 'center', paddingHorizontal: spacing.lg },
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
    backgroundColor: colors.purple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendDisabled: { opacity: 0.4 },
  sendText: { color: colors.textOnDark, fontWeight: fontWeight.bold, fontSize: fontSize.md },
});
