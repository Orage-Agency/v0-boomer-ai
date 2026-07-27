import React, { Suspense } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { BrandHeader } from '@/components/BrandHeader';
import { colors, fontSize, fontWeight, radius, spacing } from '@/theme/theme';

/**
 * Voice route — a thin shell around the real call UI.
 *
 * The ElevenLabs SDK initialises native WebRTC (`registerGlobals()`) the moment
 * its module is evaluated. Importing it from the root layout meant a failure in
 * that native stack took the whole app down at launch — the user never reached
 * a screen. So the call UI is loaded with a dynamic import and guarded by an
 * error boundary: if voice cannot start, the user sees a friendly message on
 * this screen and the rest of Boomer AI keeps working.
 */

const VoiceCall = React.lazy(() => import('@/screens/VoiceCall'));

type BoundaryProps = { children: React.ReactNode };
type BoundaryState = { failed: boolean };

class VoiceErrorBoundary extends React.Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { failed: false };

  static getDerivedStateFromError(): BoundaryState {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.warn('[voice] failed to start', error);
  }

  render() {
    if (this.state.failed) return <VoiceUnavailable />;
    return this.props.children;
  }
}

function VoiceUnavailable() {
  const router = useRouter();
  return (
    <Screen centered edges={['top', 'bottom']}>
      <BrandHeader title="Talk with Sarah" onBack={() => router.back()} />
      <View style={styles.center}>
        <Text style={styles.title}>Voice isn&apos;t available right now</Text>
        <Text style={styles.sub}>
          We could not start the calling feature on this device. You can still chat with
          Sarah by typing, and she can read her answers out loud.
        </Text>
        <Pressable
          onPress={() => router.replace('/(tabs)/chat')}
          style={styles.btn}
          accessibilityRole="button"
          accessibilityLabel="Go to chat with Sarah"
        >
          <Text style={styles.btnText}>Chat with Sarah</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

function VoiceLoading() {
  const router = useRouter();
  return (
    <Screen centered edges={['top', 'bottom']}>
      <BrandHeader title="Talk with Sarah" onBack={() => router.back()} />
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    </Screen>
  );
}

export default function VoiceRoute() {
  return (
    <VoiceErrorBoundary>
      <Suspense fallback={<VoiceLoading />}>
        <VoiceCall />
      </Suspense>
    </VoiceErrorBoundary>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.black,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  sub: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  btn: {
    marginTop: spacing.md,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.lg,
  },
  btnText: {
    color: colors.textOnDark,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
});
