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
import { InfoBanner } from '@/components/InfoBanner';
import { useChatSession } from '@/screens/useChat';
import { useProfile } from '@/context/ProfileContext';
import { isApiConfigured } from '@/config/env';
import { ttsApi, transcribeApi } from '@/api';
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
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [transcribing, setTranscribing] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
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

  const startRecording = useCallback(async () => {
    setMicError(null);
    try {
      // Free the audio session from any TTS playback first — a live Sound keeps
      // the session in playback-only mode and makes prepareToRecord fail.
      await stopSpeaking();

      // Ensure mic permission. getPermissions first so we only prompt when
      // genuinely undetermined; guide the user to Settings if it's denied.
      let perm = await Audio.getPermissionsAsync();
      if (!perm.granted && perm.canAskAgain) {
        perm = await Audio.requestPermissionsAsync();
      }
      if (!perm.granted) {
        setMicError(
          'Microphone access is off. Turn it on in Settings → Boomer AI → Microphone, then try again.',
        );
        return;
      }

      // Switch the session into record mode (must include interruptionModeIOS).
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        interruptionModeIOS: InterruptionModeIOS.DoNotMix,
      });

      // Explicit prepare + start is more reliable than createAsync, especially
      // right after audio playback held the session.
      const rec = new Audio.Recording();
      await rec.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await rec.startAsync();
      setRecording(rec);
    } catch (e) {
      // Surface the real reason so failures are diagnosable instead of generic.
      const msg = e instanceof Error ? e.message : 'unknown error';
      setMicError(`Could not start recording: ${msg}`);
    }
  }, [stopSpeaking]);

  const stopAndTranscribe = useCallback(async () => {
    if (!recording) return;
    try {
      await recording.stopAndUnloadAsync();
      // Hand the audio session back to playback so the spoken reply works.
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });
      const uri = recording.getURI();
      setRecording(null);
      if (!uri) {
        setMicError('Recording did not save. Please try again.');
        return;
      }
      setTranscribing(true);
      const text = await transcribeApi.transcribeAudio(uri);
      setTranscribing(false);
      if (text) {
        handleSend(text);
      } else {
        setMicError("I didn't catch that. Please try again.");
      }
    } catch (e) {
      setTranscribing(false);
      setRecording(null);
      const msg = e instanceof Error ? e.message : 'unknown error';
      setMicError(`Could not transcribe your audio: ${msg}`);
    }
  }, [recording, handleSend]);

  const handleMicPress = useCallback(() => {
    if (busy || transcribing) return;
    if (recording) {
      void stopAndTranscribe();
    } else {
      void startRecording();
    }
  }, [busy, transcribing, recording, startRecording, stopAndTranscribe]);

  // Stop any in-progress recording when leaving the screen.
  useEffect(() => {
    return () => {
      if (recording) {
        void recording.stopAndUnloadAsync().catch(() => undefined);
      }
    };
  }, [recording]);

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
              ? 'Listening… tap to stop and send'
              : transcribing
              ? 'Transcribing…'
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
