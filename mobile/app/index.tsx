import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Redirect } from 'expo-router';
import { useProfile } from '@/context/ProfileContext';
import { useEntitlement } from '@/context/EntitlementContext';
import { colors, fontSize, spacing } from '@/theme/theme';

/**
 * Entry route. Decides splash / onboarding / paywall / app.
 *
 * Gating policy (J-025):
 *  - `loading` profile  -> splash
 *  - onboarding         -> /onboarding (soft, paywall NOT forced)
 *  - app view, no Pro   -> /paywall (soft, user can dismiss into limited free tier)
 *  - app view, Pro      -> /(tabs)
 *
 * When RevenueCat is not configured (placeholder key in dev / Expo Go),
 * `entitled` is forced true so the gate never traps developers.
 */
export default function Index() {
  const { view } = useProfile();
  const { entitled, loading: entLoading } = useEntitlement();

  if (view === 'loading' || entLoading) {
    return (
      <View style={styles.splash}>
        <Text style={styles.logo}>Boomer AI</Text>
        <ActivityIndicator color={colors.textOnDark} style={{ marginTop: spacing.lg }} />
        <Text style={styles.sub}>Getting things ready…</Text>
      </View>
    );
  }

  if (view === 'onboarding') return <Redirect href="/onboarding" />;
  if (!entitled) return <Redirect href="/paywall" />;
  return <Redirect href="/(tabs)" />;
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.ink,
  },
  logo: {
    color: colors.textOnDark,
    fontSize: fontSize.display,
    fontWeight: '800',
  },
  sub: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: fontSize.sm,
    marginTop: spacing.md,
  },
});
