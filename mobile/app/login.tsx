import React, { useState } from 'react';
import {
  ActivityIndicator,
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
import { useAuth } from '@/context/AuthContext';
import { useEntitlement } from '@/context/EntitlementContext';
import { colors, fontSize, fontWeight, radius, spacing } from '@/theme/theme';

/**
 * "I already have an account" modal. Two tabs:
 *   1) Sign in with email + password (restores account-level Pro on a new
 *      device, or just signs the user back in).
 *   2) Redeem an access / bypass code (off-store paying customers + George).
 *
 * On success the user is dropped into the app; EntitlementContext picks up
 * `account.isPro` and treats the user as Pro.
 */

type Tab = 'login' | 'code';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, redeem, user } = useAuth();
  const { refresh } = useEntitlement();
  const [tab, setTab] = useState<Tab>('login');

  // Login fields
  const [email, setEmail] = useState(user?.email ?? '');
  const [password, setPassword] = useState('');

  // Code fields
  const [codeEmail, setCodeEmail] = useState(user?.email ?? '');
  const [codePassword, setCodePassword] = useState('');
  const [code, setCode] = useState('');

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const close = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  const onLogin = async () => {
    setError(null);
    if (!email || !password) {
      setError('Email and password required.');
      return;
    }
    try {
      setBusy(true);
      const u = await signIn(email.trim(), password);
      await refresh();
      // Either way we let them into the app; if Pro, paywall stays out of the way.
      router.replace(u.isPro ? '/(tabs)' : '/(tabs)');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sign-in failed');
    } finally {
      setBusy(false);
    }
  };

  const onRedeem = async () => {
    setError(null);
    if (!code) {
      setError('Enter your access code.');
      return;
    }
    if (!codeEmail || !codePassword) {
      setError('Enter the email + password tied to your account.');
      return;
    }
    try {
      setBusy(true);
      const u = await redeem(code.trim(), codeEmail.trim(), codePassword);
      await refresh();
      router.replace('/(tabs)');
      void u;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Code redemption failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen background={colors.background}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.headerRow}>
            <Text style={styles.title}>Welcome back</Text>
            <Pressable
              onPress={close}
              accessibilityRole="button"
              accessibilityLabel="Close"
              hitSlop={12}
            >
              <Text style={styles.close}>Close</Text>
            </Pressable>
          </View>

          <View style={styles.tabRow}>
            <TabButton
              label="Sign in"
              active={tab === 'login'}
              onPress={() => {
                setError(null);
                setTab('login');
              }}
            />
            <TabButton
              label="Access code"
              active={tab === 'code'}
              onPress={() => {
                setError(null);
                setTab('code');
              }}
            />
          </View>

          {tab === 'login' ? (
            <View style={styles.form}>
              <Field
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                autoComplete="email"
                keyboardType="email-address"
              />
              <Field
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                secureTextEntry
                autoComplete="password"
              />
              <Button
                title={busy ? 'Signing in…' : 'Sign in'}
                onPress={onLogin}
                disabled={busy}
                loading={busy}
              />
            </View>
          ) : (
            <View style={styles.form}>
              <Text style={styles.help}>
                If you bought outside the App Store, enter the code you were given.
                We'll tie it to your account so it works on any of your devices.
              </Text>
              <Field
                label="Email"
                value={codeEmail}
                onChangeText={setCodeEmail}
                placeholder="you@example.com"
                autoComplete="email"
                keyboardType="email-address"
              />
              <Field
                label="Password"
                value={codePassword}
                onChangeText={setCodePassword}
                placeholder="Password"
                secureTextEntry
                autoComplete="password"
              />
              <Field
                label="Access code"
                value={code}
                onChangeText={(v) => setCode(v.toUpperCase())}
                placeholder="BOOMER-XXXX-XXXX"
                autoCapitalize="characters"
              />
              <Button
                title={busy ? 'Redeeming…' : 'Redeem code'}
                onPress={onRedeem}
                disabled={busy}
                loading={busy}
              />
              <Text style={styles.helpSmall}>
                Don't have an account yet? You'll need to create one first — close this
                window, tap "Start free", finish onboarding, then come back here.
              </Text>
            </View>
          )}

          {error ? <Text style={styles.error}>{error}</Text> : null}
          {busy ? (
            <ActivityIndicator style={styles.spinner} color={colors.primary} />
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

function Field(props: React.ComponentProps<typeof TextInput> & { label: string }) {
  const { label, style, ...rest } = props;
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        {...rest}
        style={[styles.input, style]}
        placeholderTextColor={colors.textMuted}
        autoCorrect={false}
        autoCapitalize={rest.autoCapitalize ?? 'none'}
      />
    </View>
  );
}

function TabButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.tab, active && styles.tabActive]}
      accessibilityRole="button"
    >
      <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xl },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  close: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    padding: 4,
    marginBottom: spacing.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  tabLabel: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
  },
  tabLabelActive: { color: colors.textPrimary, fontWeight: fontWeight.semibold },
  form: { gap: spacing.md },
  fieldWrap: { gap: spacing.xs },
  fieldLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
  },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  help: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  helpSmall: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  error: {
    marginTop: spacing.md,
    color: colors.danger ?? '#DC2626',
    fontSize: fontSize.md,
  },
  spinner: { marginTop: spacing.md },
});
