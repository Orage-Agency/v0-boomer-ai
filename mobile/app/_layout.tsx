import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ProfileProvider } from '@/context/ProfileContext';
import { EntitlementProvider } from '@/context/EntitlementContext';
import { initPurchases } from '@/context/purchases';

/**
 * Root layout. Wraps the whole app in providers and declares the top-level
 * navigation stack. The actual routing decision (onboarding vs app) is driven
 * by the index route based on the ProfileContext `view`. Device-only — there
 * is no auth screen.
 */
export default function RootLayout() {
  useEffect(() => {
    // Best-effort IAP init; no-op when RevenueCat isn't configured.
    void initPurchases();
  }, []);

  return (
    <SafeAreaProvider>
      <ProfileProvider>
        <EntitlementProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'fade',
            contentStyle: { backgroundColor: '#FFFFFF' },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="voice"
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="image-gen"
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="quick-questions"
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="lesson/[id]"
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="paywall"
            options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
          />
        </Stack>
        </EntitlementProvider>
      </ProfileProvider>
    </SafeAreaProvider>
  );
}
