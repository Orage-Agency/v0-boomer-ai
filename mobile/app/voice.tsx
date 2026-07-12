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
import { Audio, InterruptionModeIOS } from 'expo-av';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { BrandHeader } from '@/components/BrandHeader';
import { InfoBanner } from '@/components/InfoBanner';
import { useChatSession } from '@/screens/useChat';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { useProfile } from '@/context/ProfileContext';
import { isApiConfigured } from '@/config/env';
import { ttsApi } from '@/api';
import { colors, fontSize, fontWeight, radius, spacing } from '@/theme/theme';
import type { ChatMessage } from '@/types';

/**
 * Voice chat screen.
 *
 * Two-way voice with the AI:
 *  - Tap the mic to record (expo-av), tap again to stop. Audio is uploaded to
 *    /api/transcribe (OpenAI Whisper) and the returned text is sent through
 *    the normal /api/chat pipeline.
 *  - The AI's reply is spoken aloud via /api/tts (OpenAI TTS, "alloy" voice),
 *    played by expo-av. Falls back to on-device `expo-speech` if the backend
 *    TTS proxy is unavailable.
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
  const soundRef = useRef<Audio.Sound | null>(null);

  const busy = status === 'streaming' || status === 'submitted';

  // Stop ALL audio output — both the backend-TTS Sound and the device-speech
  // fallback. Previously only device speech was stopped, so the AI kept talking
  // over the user when they started recording, and the live Sound held the
  // audio session, which made the next recording fail to start.
  const stopSpeaking = useCallback(async () => {
    try {
      await Speech.stop();
    } catch {
      /* ignore */
    }
    const s = soundRef.current;
    soundRef.current = null;
    if (s) {
      try {
        await s.stopAsync();
      } catch {
        /* ignore */
      }
      try {
        await s.unloadAsync();
      } catch {
        /* ignore */
      }
    }
    setSpeaking(false);
  }, []);

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
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          interruptionModeIOS: InterruptionModeIOS.DoNotMix,
        });
        const dataUri = await ttsApi.speakText(text);
        const { sound } = await Audio.Sound.createAsync({ uri: dataUri });
        soundRef.current = sound;
        await sound.playAsync();
        sound.setOnPlaybackStatusUpdate((s) => {
          if (s.isLoaded && s.didJustFinish) {
            setSpeaking(false);
            void sound.unloadAsync();
            if (soundRef.current === sound) soundRef.current = null;
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

  // Stop all audio when leaving the screen.
  useEffect(() => {
    return () => {
      void stopSpeaking();
    };
  }, [stopSpeaking]);

  const handleSend = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || busy) return;
      void stopSpeaking();
      // Award +2 stars on the first voice interaction (matches web reward).
      if (!awardedStar.current) {
        awardedStar.current = true;
        updateProfile({ stars: profile.stars + 2 });
      }
      void send(trimmed);
      setInput('');
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    },
    [busy, send, profile.stars, updateProfile, stopSpeaking],
  );

  const toggleTts = useCallback(() => {
    setTtsEnabled((prev) => {
      const next = !prev;
      if (!next) void stopSpeaking();
      return next;
    });
  }, [stopSpeaking]);

  // Shared record → Whisper-transcribe machinery (same hook that powers the
  // mic in Chat and AI Art). `onBeforeRecord` frees the audio session from any
  // TTS playback first — a live Sound keeps the session in playback-only mode
  // and makes prepareToRecord fail.
  const handleSendRef = useRef(handleSend);
  handleSendRef.current = handleSend;
  const voiceInput = useVoiceInput({
    onTranscript: (text) => handleSendRef.current(text),
    onBeforeRecord: stopSpeaking,
  });

  const recording = voiceInput.state === 'recording';
  const transcribing = voiceInput.state === 'transcribing';
  const micError = voiceInput.error;

  const handleMicPress = useCallback(() => {
    if (busy || transcribing) return;
    voiceInput.toggle();
  }, [busy, transcribing, voiceInput]);

  return (
    <Screen centered edges={['top', 'bottom']}>
      <BrandHeader
        title="Talk to Sara"
        onBack={() => router.back()}
        right={
          <Pressable
            onPress={toggleTts}
            style={styles.ttsBtn}
            accessibilityRole="button"
            accessibilityLabel={ttsEnabled ? 'Turn off voice replies' : 'Turn on voice replies'}
          >
            <Text style={styles.ttsToggle}>{ttsEnabled ? '🔊' : '🔇'}</Text>
          </Pressable>
        }
      />

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

        {micError && (
          <View style={styles.bannerWrap}>
            <InfoBanner tone="danger" message={micError} />
          </View>
        )}

        <View style={styles.micWrap}>
          <Pressable
            onPress={handleMicPress}
            disabled={busy || transcribing}
            style={[
              styles.mic,
              recording && styles.micRecording,
              (busy || transcribing) && styles.micDisabled,
            ]}
            accessibilityRole="button"
            accessibilityLabel={
              recording
                ? 'Stop recording and send'
                : transcribing
                ? 'Transcribing your audio'
                : 'Tap to speak'
            }
          >
            <Text style={styles.micEmoji}>{recording ? '⏹' : '🎤'}</Text>
          </Pressable>
          <Text style={styles.micHint}>
            {recording
              ? `Listening… ${Math.floor(voiceInput.durationMs / 60000)}:${String(
                  Math.floor(voiceInput.durationMs / 1000) % 60,
                ).padStart(2, '0')} — tap to stop and send (up to 1 min)`
              : transcribing
              ? 'Understanding your words…'
              : 'Tap the microphone to speak, or type below'}
          </Text>
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
        <Text style={styles.speaker}>{isUser ? 'You' : '👩🏼 Sara'}</Text>
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
  ttsBtn: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  ttsToggle: { fontSize: 22, textAlign: 'right' },
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
  micRecording: { backgroundColor: '#F2C740' },
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
