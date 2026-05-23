import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ProfileProvider } from '@/context/ProfileContext';
import { initPurchases } from '@/context/purchases';

/**
 * Root layout. Wraps the whole app in providers and declares the top-level
 * navigation stack. The actual routing decision (auth vs onboarding vs app)
 * is driven by the index route based on the ProfileContext `view`.
 */
export default function RootLayout() {
  useEffect(() => {
    // Best-effort IAP init; no-op when RevenueCat isn't configured.
    void initPurchases();
  }, []);

  return (
    <SafeAreaProvider>
      <ProfileProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'fade',
            contentStyle: { backgroundColor: '#FFFFFF' },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="auth" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="paywall"
            options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
          />
        </Stack>
      </ProfileProvider>
    </SafeAreaProvider>
  );
}
