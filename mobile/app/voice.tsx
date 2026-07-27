import React, { useCallback, useEffect, useRef, useState } from 'react';
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
import { useConversation } from '@elevenlabs/react-native';
import { Screen } from '@/components/Screen';
import { BrandHeader } from '@/components/BrandHeader';
import { InfoBanner } from '@/components/InfoBanner';
import { useProfile } from '@/context/ProfileContext';
import { useEntitlement } from '@/context/EntitlementContext';
import { env } from '@/config/env';
import { colors, fontSize, fontWeight, radius, spacing } from '@/theme/theme';

/**
 * Voice screen — a REAL-TIME conversation with Sarah.
 *
 * Powered by the dedicated ElevenLabs conversational agent (WebRTC via
 * @elevenlabs/react-native). One tap starts a live call: Sarah listens
 * continuously (no tap-to-stop), replies in about a second in her own voice,
 * and can be interrupted naturally just by speaking — the walkie-talkie
 * record → transcribe → chat → TTS chain is gone.
 */

type TranscriptTurn = { id: string; role: 'user' | 'agent'; text: string };

let turnCounter = 0;
function turnId(): string {
  turnCounter += 1;
  return `turn_${Date.now()}_${turnCounter}`;
}

export default function VoiceScreen() {
  const router = useRouter();
  const { profile, updateProfile } = useProfile();
  const { entitled } = useEntitlement();
  const [transcript, setTranscript] = useState<TranscriptTurn[]>([]);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<FlatList<TranscriptTurn>>(null);
  const awardedStar = useRef(false);

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
    },
  });

  const { status, isSpeaking, startSession, endSession } = conversation;
  const connected = status === 'connected';
  const connecting = status === 'connecting';

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
    if (!awardedStar.current) {
      awardedStar.current = true;
      updateProfile({ stars: profile.stars + 2 });
    }
    startSession({ agentId: env.elevenLabsAgentId });
  }, [startSession, profile.stars, updateProfile]);

  const endCall = useCallback(() => {
    endSession();
  }, [endSession]);

  // Never leave a live call running after the screen is gone.
  const endSessionRef = useRef(endSession);
  endSessionRef.current = endSession;
  useEffect(() => {
    return () => endSessionRef.current();
  }, []);

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
        <BrandHeader title="Talk with Sarah" onBack={() => router.back()} />
        <View style={styles.gate}>
          <Image source={require('../assets/sara-avatar.jpg')} style={styles.gateAvatar} />
          <Text style={styles.gateTitle}>Talk with Sarah, live</Text>
          <Text style={styles.gateSub}>
            Have a real back-and-forth voice conversation — no typing, no waiting.
            Voice calls are part of Boomer AI Pro.
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

  return (
    <Screen centered edges={['top', 'bottom']}>
      <BrandHeader title="Talk with Sarah" onBack={() => router.back()} />

      <View style={styles.stage}>
        <Animated.View style={[styles.avatarRing, connected && styles.avatarRingLive, ringStyle]}>
          <Image
            source={require('../assets/sara-avatar.jpg')}
            style={styles.avatar}
            accessibilityLabel="Sarah, your AI companion"
          />
        </Animated.View>

        <Text style={styles.stateTitle}>
          {connecting
            ? 'Calling Sara…'
            : connected
              ? isSpeaking
                ? 'Sarah is speaking'
                : "I'm listening…"
              : `Hi ${profile.name || profile.userName || 'there'}!`}
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
      </View>

      {error && (
        <View style={styles.bannerWrap}>
          <InfoBanner tone="danger" message={error} />
        </View>
      )}

      {transcript.length > 0 && (
        <FlatList
          ref={listRef}
          data={transcript}
          keyExtractor={(t) => t.id}
          style={styles.transcript}
          contentContainerStyle={styles.transcriptContent}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item }) => (
            <View
              style={[
                styles.turn,
                item.role === 'user' ? styles.turnUser : styles.turnAgent,
              ]}
            >
              <Text style={styles.turnSpeaker}>
                {item.role === 'user' ? 'You' : 'Sarah'}
              </Text>
              <Text
                style={[styles.turnText, item.role === 'user' && styles.turnTextUser]}
              >
                {item.text}
              </Text>
            </View>
          )}
        />
      )}

      <View style={styles.controls}>
        {connected || connecting ? (
          <Pressable
            onPress={endCall}
            style={styles.endBtn}
            accessibilityRole="button"
            accessibilityLabel="End the conversation"
          >
            <Ionicons name="call" size={26} color="#fff" style={styles.endIcon} />
            <Text style={styles.endText}>End Conversation</Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={startCall}
            style={styles.startBtn}
            accessibilityRole="button"
            accessibilityLabel="Start talking with Sarah"
          >
            {connecting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="mic" size={28} color="#fff" />
                <Text style={styles.startText}>Start Talking with Sarah</Text>
              </>
            )}
          </Pressable>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stage: { alignItems: 'center', paddingTop: spacing.xl, paddingHorizontal: spacing.xl },
  avatarRing: {
    width: 148,
    height: 148,
    borderRadius: 74,
    borderWidth: 4,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  avatarRingLive: { borderColor: colors.green },
  avatar: { width: 132, height: 132, borderRadius: 66 },
  stateTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.black,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  stateSub: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 26,
  },
  bannerWrap: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  transcript: { flex: 1, marginTop: spacing.md },
  transcriptContent: { padding: spacing.lg, gap: spacing.sm },
  turn: { maxWidth: '88%', borderRadius: radius.lg, padding: spacing.md, gap: 2 },
  turnUser: { alignSelf: 'flex-end', backgroundColor: colors.primary },
  turnAgent: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
  },
  turnSpeaker: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.textSecondary,
    opacity: 0.8,
  },
  turnText: { fontSize: fontSize.md, lineHeight: 24, color: colors.textPrimary },
  turnTextUser: { color: colors.textOnDark },
  controls: { padding: spacing.lg, paddingBottom: spacing.xl },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    minHeight: 64,
    borderRadius: radius.xl,
    backgroundColor: colors.green,
  },
  startText: { color: '#fff', fontSize: fontSize.lg, fontWeight: fontWeight.bold },
  endBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    minHeight: 64,
    borderRadius: radius.xl,
    backgroundColor: colors.danger,
  },
  endIcon: { transform: [{ rotate: '135deg' }] },
  endText: { color: '#fff', fontSize: fontSize.lg, fontWeight: fontWeight.bold },
  gate: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.md },
  gateAvatar: { width: 120, height: 120, borderRadius: 60 },
  gateTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.black, color: colors.textPrimary },
  gateSub: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
  },
  gateBtn: {
    marginTop: spacing.sm,
    minHeight: 56,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gateBtnText: { color: colors.textOnDark, fontSize: fontSize.md, fontWeight: fontWeight.bold },
});
