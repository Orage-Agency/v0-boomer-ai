import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { Button } from '@/components/Button';
import { InfoBanner } from '@/components/InfoBanner';
import { useProfile } from '@/context/ProfileContext';
import { colors, fontSize, fontWeight, radius, spacing } from '@/theme/theme';

/**
 * Auth screen — FULLY IMPLEMENTED.
 * Sign in / sign up against the hosted /api/auth/{login,signup} routes.
 * Mirrors the web AuthScreen UX (dark backdrop, white card, toggle mode).
 */
export default function AuthScreen() {
  const router = useRouter();
  const { login, signup, apiConfigured } = useProfile();

  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validateEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const handleSubmit = async () => {
    setError(null);
    if (!email || !password) return setError('Please fill in all fields');
    if (!validateEmail(email)) return setError('Please enter a valid email address');
    if (password.length < 6) return setError('Password must be at least 6 characters');
    if (isSignUp && !name) return setError('Please enter your name');

    setLoading(true);
    const result = isSignUp
      ? await signup(email.trim(), password, name.trim())
      : await login(email.trim(), password);
    setLoading(false);

    if (result.ok) {
      router.replace('/');
    } else {
      setError(result.error ?? 'Authentication failed');
    }
  };

  return (
    <Screen background={colors.ink} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <Text style={styles.brand}>Boomer AI</Text>
            <Text style={styles.tagline}>Your friendly guide to tech & AI</Text>

            {!apiConfigured && (
              <View style={{ marginBottom: spacing.md }}>
                <InfoBanner
                  tone="warn"
                  title="Server not connected"
                  message="Set the API base URL in app.json (expo.extra.apiBaseUrl) to enable sign in."
                />
              </View>
            )}

            {error && (
              <View style={{ marginBottom: spacing.md }}>
                <InfoBanner tone="danger" message={error} />
              </View>
            )}

            {isSignUp && (
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Your Name"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="words"
                accessibilityLabel="Your name"
              />
            )}

            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="name@example.com"
              placeholderTextColor={colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              accessibilityLabel="Email address"
            />

            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Password (6+ characters)"
              placeholderTextColor={colors.textMuted}
              secureTextEntry
              accessibilityLabel="Password"
            />

            <Button
              title={isSignUp ? 'Create Account' : 'Sign In'}
              onPress={handleSubmit}
              loading={loading}
              variant="ink"
              style={{ marginTop: spacing.sm }}
            />

            <Pressable
              onPress={() => {
                setIsSignUp((v) => !v);
                setError(null);
              }}
              style={styles.toggle}
              accessibilityRole="button"
            >
              <Text style={styles.toggleText}>
                {isSignUp
                  ? 'Already have an account? Sign In'
                  : "Don't have an account? Sign up"}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: spacing.xl },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    gap: spacing.md,
  },
  brand: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.black,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  tagline: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  input: {
    minHeight: 56,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  toggle: { paddingVertical: spacing.md, alignItems: 'center' },
  toggleText: { fontSize: fontSize.sm, color: colors.textSecondary },
});
