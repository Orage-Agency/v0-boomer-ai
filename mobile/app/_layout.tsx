import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ProfileProvider } from '@/context/ProfileContext';
import { EntitlementProvider } from '@/context/EntitlementContext';
import { AuthProvider } from '@/context/AuthContext';
import { initPurchases } from '@/context/purchases';

/**
 * Root layout. Wraps the whole app in providers and declares the top-level
 * navigation stack. Device-only by default; the optional /login modal is
 * triggered from the paywall ("I already have an account") and used to
 * restore Pro on a new device or redeem an off-store access code.
 */
export default function RootLayout() {
  useEffect(() => {
    void initPurchases();
  }, []);

  return (
    <SafeAreaProvider>
      <ProfileProvider>
        <AuthProvider>
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
              <Stack.Screen name="voice" options={{ animation: 'slide_from_right' }} />
              <Stack.Screen name="image-gen" options={{ animation: 'slide_from_right' }} />
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
              <Stack.Screen
                name="login"
                options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
              />
            </Stack>
          </EntitlementProvider>
        </AuthProvider>
      </ProfileProvider>
    </SafeAreaProvider>
  );
}
