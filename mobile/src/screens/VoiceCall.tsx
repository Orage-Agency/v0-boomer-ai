import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ConversationProvider, useConversation } from '@elevenlabs/react-native';
import { Screen } from '@/components/Screen';
import { BrandHeader } from '@/components/BrandHeader';
import { InfoBanner } from '@/components/InfoBanner';
import { useProfile } from '@/context/ProfileContext';
import { useEntitlement } from '@/context/EntitlementContext';
import { env } from '@/config/env';
import {
  addNote,
  buildMemoryPrompt,
  lastTopic,
  loadMemory,
  syncMemoryFromServer,
  type SarahMemory,
} from '@/lib/sarahMemory';
import { saveVoiceConversation } from '@/lib/saveVoiceConversation';
import { summarizeCall, type CallTurn } from '@/lib/summarizeCall';
import {
  formatAllowance,
  getVoiceQuota,
  recordVoiceUsage,
  type VoiceQuota,
} from '@/lib/voiceQuota';
import { colors, fontSize, fontWeight, layout, radius, spacing } from '@/theme/theme';

/**
 * Sarah — a real-time voice conversation, presented as her own standalone
 * companion rather than another screen of the app.
 *
 * Powered by the dedicated ElevenLabs agent over WebRTC. One tap starts a
 * live call: Sarah listens continuously, answers in about a second in her own
 * voice, and can be interrupted just by speaking.
 *
 * MEMORY: the agent itself is stateless between calls, so continuity comes
 * from us. Notes about previous conversations are kept on the device and sent
 * as dynamic variables when the call starts, so Sarah opens by name and can
 * pick up where they left off. When a call ends we summarise it (after
 * hanging up, so the user never waits) and keep it for next time.
 *
 * This module is loaded LAZILY by app/voice.tsx — the SDK initialises native
 * WebRTC at import time, so it must never be pulled into app startup.
 */

type TranscriptTurn = { id: string; role: 'user' | 'agent'; text: string };

let turnCounter = 0;
function turnId(): string {
  turnCounter += 1;
  return `turn_${Date.now()}_${turnCounter}`;
}

function VoiceCallInner() {
  const router = useRouter();
  const { profile, updateProfile } = useProfile();
  const { entitled } = useEntitlement();
  const [transcript, setTranscript] = useState<TranscriptTurn[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [memory, setMemory] = useState<SarahMemory | null>(null);
  const [quota, setQuota] = useState<VoiceQuota | null>(null);
  const listRef = useRef<FlatList<TranscriptTurn>>(null);
  const awardedStar = useRef(false);
  // Wall-clock start of the live call, used to bill and to stop at the cap.
  const callStartedAt = useRef<number | null>(null);
  const capTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Read inside cleanup, where React state would be stale.
  const transcriptRef = useRef<TranscriptTurn[]>([]);
  transcriptRef.current = transcript;
  const savedThisCall = useRef(false);

  const firstName = useMemo(() => {
    const raw = (profile.name || profile.userName || '').trim();
    return raw ? raw.split(/\s+/)[0] : '';
  }, [profile.name, profile.userName]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      // Show the device copy immediately, then adopt the account's copy if it
      // knows more (the new-phone case).
      const local = await loadMemory();
      if (!cancelled) setMemory(local);
      const synced = await syncMemoryFromServer();
      if (!cancelled) setMemory(synced);
      const q = await getVoiceQuota();
      if (!cancelled) setQuota(q);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /**
   * Remember this conversation. Runs after the call ends so the summariser
   * never delays hanging up.
   */
  const rememberCall = useCallback(async () => {
    if (savedThisCall.current) return;
    savedThisCall.current = true;
    // Bill the time before anything else can fail.
    if (capTimer.current) {
      clearTimeout(capTimer.current);
      capTimer.current = null;
    }
    if (callStartedAt.current != null) {
      const seconds = (Date.now() - callStartedAt.current) / 1000;
      callStartedAt.current = null;
      await recordVoiceUsage(seconds);
      const q = await getVoiceQuota();
      setQuota(q);
    }
    const turns: CallTurn[] = transcriptRef.current.map((t) => ({ role: t.role, text: t.text }));
    // Keep the transcript in History under the same per-person key.
    void saveVoiceConversation(turns);
    const summary = await summarizeCall(turns);
    if (summary) {
      await addNote(summary);
      const refreshed = await loadMemory();
      setMemory(refreshed);
    }
  }, []);

  const conversation = useConversation({
    onMessage: ({ message, role }) => {
      if (!message?.trim()) return;
      setTranscript((prev) => [...prev, { id: turnId(), role, text: message }]);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);
    },
    onError: (message) => {
      setError(
        message?.includes('permission')
          ? 'Microphone access is off. Turn it on in Settings → Boomer AI → Microphone.'
          : 'The call could not continue. Please check your internet and try again.',
      );
    },
    onDisconnect: (details) => {
      if (details?.reason === 'error') {
        setError('The call dropped. Please tap the button to talk to Sarah again.');
      }
      void rememberCall();
    },
  });

  const { status, isSpeaking, startSession, endSession } = conversation;
  const connected = status === 'connected';
  const connecting = status === 'connecting';

  // Held in a ref so the allowance timer and unmount cleanup always call the
  // current endSession, not the one captured when they were created.
  const endSessionRef = useRef(endSession);
  endSessionRef.current = endSession;

  const startCall = useCallback(async () => {
    setError(null);
    if (!env.elevenLabsAgentId) {
      setError('Voice is not configured yet. Please update the app.');
      return;
    }
    // Ask for the mic BEFORE dialing so the call never dies on a permission
    // prompt mid-connect.
    let perm = await Audio.getPermissionsAsync();
    if (!perm.granted && perm.canAskAgain) {
      perm = await Audio.requestPermissionsAsync();
    }
    if (!perm.granted) {
      setError('Microphone access is off. Turn it on in Settings → Boomer AI → Microphone.');
      return;
    }
    // Re-check the allowance at dial time, not just on screen load.
    const fresh = await getVoiceQuota();
    setQuota(fresh);
    if (fresh.remainingSeconds <= 0) {
      setError(
        `You have used all ${formatAllowance(fresh.limitSeconds)} of your voice time this month. It refreshes at the start of next month — until then, Sarah is still here to chat by typing.`,
      );
      return;
    }
    if (!awardedStar.current) {
      awardedStar.current = true;
      updateProfile({ stars: profile.stars + 2 });
    }
    savedThisCall.current = false;
    setTranscript([]);
    callStartedAt.current = Date.now();
    // Hang up when the remaining allowance runs out. The agent also caps a
    // single call, but that cap knows nothing about the monthly balance.
    if (capTimer.current) clearTimeout(capTimer.current);
    capTimer.current = setTimeout(
      () => {
        setError('That is all your voice time for this month — it refreshes next month.');
        endSessionRef.current();
      },
      Math.max(1000, fresh.remainingSeconds * 1000),
    );
    const current = memory ?? (await loadMemory());
    startSession({
      agentId: env.elevenLabsAgentId,
      // Sarah's prompt reads these — they are what make her feel continuous.
      dynamicVariables: {
        user_name: firstName || 'there',
        memory: buildMemoryPrompt(current),
      },
    });
  }, [startSession, profile.stars, updateProfile, memory, firstName]);

  const endCall = useCallback(() => {
    endSession();
  }, [endSession]);

  // Never leave a live call running after the screen is gone, and keep
  // whatever was said.
  useEffect(() => {
    return () => {
      endSessionRef.current();
      void rememberCall();
    };
  }, [rememberCall]);

  // Gentle pulsing ring around Sarah while the call is live — stronger while
  // she is speaking, subtle while she listens.
  const pulse = useSharedValue(1);
  useEffect(() => {
    if (connected) {
      const peak = isSpeaking ? 1.1 : 1.04;
      pulse.value = withRepeat(
        withSequence(
          withTiming(peak, { duration: isSpeaking ? 420 : 900 }),
          withTiming(1, { duration: isSpeaking ? 420 : 900 }),
        ),
        -1,
      );
    } else {
      cancelAnimation(pulse);
      pulse.value = withTiming(1, { duration: 200 });
    }
  }, [connected, isSpeaking, pulse]);
  const ringStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));

  // Voice conversations are a Pro feature — friendly gate for deep links.
  if (!entitled) {
    return (
      <Screen centered edges={['top', 'bottom']}>
        <BrandHeader title="Sarah" onBack={() => router.back()} />
        <View style={styles.gate}>
          <Image source={require('../../assets/sarah-avatar.jpg')} style={styles.gateAvatar} />
          <Text style={styles.gateTitle}>Talk with Sarah, live</Text>
          <Text style={styles.gateSub}>
            Have a real back-and-forth voice conversation — no typing, no waiting. Voice
            calls are part of Boomer AI Pro.
          </Text>
          <Pressable
            onPress={() => router.push('/paywall?reason=voice')}
            style={styles.gateBtn}
            accessibilityRole="button"
            accessibilityLabel="See Boomer AI Pro options"
          >
            <Text style={styles.gateBtnText}>See Pro Options</Text>
          </Pressable>
        </View>
      </Screen>
    );
  }

  const remembered = memory ? lastTopic(memory) : null;
  const idle = !connected && !connecting;

  return (
    <Screen edges={['top', 'bottom']}>
      <BrandHeader title="Sarah" onBack={() => router.back()} />

      <View style={styles.stage}>
        <Animated.View style={[styles.avatarRing, connected && styles.avatarRingLive, ringStyle]}>
          <Image
            source={require('../../assets/sarah-avatar.jpg')}
            style={styles.avatar}
            accessibilityLabel="Sarah, your AI companion"
          />
          {connected && (
            <View style={[styles.statusDot, isSpeaking ? styles.dotSpeaking : styles.dotListening]}>
              <Ionicons
                name={isSpeaking ? 'volume-high' : 'mic'}
                size={18}
                color={colors.textOnDark}
              />
            </View>
          )}
        </Animated.View>

        <Text style={styles.stateTitle}>
          {connecting
            ? 'Calling Sarah…'
            : connected
              ? isSpeaking
                ? 'Sarah is speaking'
                : "I'm listening…"
              : firstName
                ? `Hi ${firstName}!`
                : 'Hi there!'}
        </Text>
        <Text style={styles.stateSub}>
          {connecting
            ? 'One moment'
            : connected
              ? isSpeaking
                ? 'Just start talking to interrupt her'
                : 'Speak whenever you like — Sarah hears you'
              : 'Tap the button below and simply start talking. Sarah answers out loud, like a phone call.'}
        </Text>

        {idle && remembered && (
          <View style={styles.memoryCard}>
            <View style={styles.memoryHeader}>
              <Ionicons name="heart" size={16} color={colors.purple} />
              <Text style={styles.memoryLabel}>Sarah remembers</Text>
            </View>
            <Text style={styles.memoryText}>{remembered}</Text>
          </View>
        )}

        {idle && quota && quota.limitSeconds < Number.MAX_SAFE_INTEGER && (
          <Text style={styles.quotaText}>
            {quota.remainingSeconds > 0
              ? `${formatAllowance(quota.remainingSeconds)} of talking time left this month`
              : 'You have used your voice time for this month — it refreshes next month.'}
          </Text>
        )}
      </View>

      {error && (
        <View style={styles.bannerWrap}>
          <InfoBanner tone="danger" message={error} />
        </View>
      )}

      {transcript.length > 0 && (
        <FlatList
          ref={listRef}
          style={styles.transcript}
          contentContainerStyle={styles.transcriptContent}
          data={transcript}
          keyExtractor={(t) => t.id}
          renderItem={({ item }) => (
            <View style={styles.turn}>
              <Text style={item.role === 'user' ? styles.speakerYou : styles.speakerSarah}>
                {item.role === 'user' ? 'You' : 'Sarah'}
              </Text>
              <Text style={styles.turnText}>{item.text}</Text>
            </View>
          )}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        />
      )}

      <View style={styles.controls}>
        {connected || connecting ? (
          <Pressable
            onPress={endCall}
            style={[styles.callBtn, styles.endBtn]}
            accessibilityRole="button"
            accessibilityLabel="End the call with Sarah"
          >
            {connecting ? (
              <ActivityIndicator color={colors.textOnDark} />
            ) : (
              <Ionicons name="close" size={26} color={colors.textOnDark} />
            )}
            <Text style={styles.callBtnText}>{connecting ? 'Connecting…' : 'End Call'}</Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={startCall}
            style={[styles.callBtn, styles.startBtn]}
            accessibilityRole="button"
            accessibilityLabel="Start talking with Sarah"
          >
            <Ionicons name="mic" size={26} color={colors.textOnDark} />
            <Text style={styles.callBtnText}>Start Talking with Sarah</Text>
          </Pressable>
        )}
      </View>
    </Screen>
  );
}

/**
 * Default export: the call UI wrapped in its own ConversationProvider, so the
 * provider's lifetime is the Voice screen rather than the whole app.
 */
export default function VoiceCall() {
  return (
    <ConversationProvider>
      <VoiceCallInner />
    </ConversationProvider>
  );
}

const styles = StyleSheet.create({
  stage: { alignItems: 'center', paddingTop: spacing.lg, paddingHorizontal: spacing.xl },
  avatarRing: {
    width: 168,
    height: 168,
    borderRadius: 84,
    borderWidth: 4,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarRingLive: { borderColor: colors.purple },
  avatar: { width: 148, height: 148, borderRadius: 74 },
  statusDot: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.background,
  },
  dotSpeaking: { backgroundColor: colors.purple },
  dotListening: { backgroundColor: colors.green },
  stateTitle: {
    marginTop: spacing.lg,
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.black,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  stateSub: {
    marginTop: spacing.sm,
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
  },
  memoryCard: {
    marginTop: spacing.lg,
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    width: '100%',
  },
  memoryHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  memoryLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.purple,
    textTransform: 'uppercase',
  },
  memoryText: {
    marginTop: spacing.xs,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  quotaText: {
    marginTop: spacing.md,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textAlign: 'center',
  },
  bannerWrap: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg },
  transcript: { flex: 1, marginTop: spacing.lg },
  transcriptContent: { paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, gap: spacing.lg },
  turn: { gap: spacing.xs },
  speakerYou: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.primary,
    textTransform: 'uppercase',
  },
  speakerSarah: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.purple,
    textTransform: 'uppercase',
  },
  turnText: { fontSize: fontSize.md, color: colors.textPrimary, lineHeight: 28 },
  controls: { padding: spacing.xl, paddingTop: spacing.lg },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    minHeight: layout.touchTarget + 8,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.xl,
  },
  startBtn: { backgroundColor: colors.purple },
  endBtn: { backgroundColor: colors.danger },
  callBtnText: {
    color: colors.textOnDark,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  gate: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  gateAvatar: { width: 120, height: 120, borderRadius: 60, marginBottom: spacing.sm },
  gateTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.black,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  gateSub: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
  },
  gateBtn: {
    marginTop: spacing.md,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.lg,
    minHeight: layout.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gateBtnText: { color: colors.textOnDark, fontSize: fontSize.md, fontWeight: fontWeight.bold },
});
