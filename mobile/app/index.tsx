import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Redirect } from 'expo-router';
import { useProfile } from '@/context/ProfileContext';
import { colors, fontSize, spacing } from '@/theme/theme';

/**
 * Entry route. Redirects to the correct flow based on the resolved app view.
 * Shows a branded splash while the profile bootstraps.
 */
export default function Index() {
  const { view } = useProfile();

  useEffect(() => {
    // no-op; redirect handled in render
  }, [view]);

  if (view === 'loading') {
    return (
      <View style={styles.splash}>
        <Text style={styles.logo}>Boomer AI</Text>
        <ActivityIndicator color={colors.textOnDark} style={{ marginTop: spacing.lg }} />
        <Text style={styles.sub}>Getting things ready…</Text>
      </View>
    );
  }

  if (view === 'onboarding') return <Redirect href="/onboarding" />;
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
