import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import type { PurchasesPackage } from 'react-native-purchases';
import { Screen } from '@/components/Screen';
import { Button } from '@/components/Button';
import { InfoBanner } from '@/components/InfoBanner';
import {
  getOffering,
  purchasePackage,
  restorePurchases,
  PRODUCT_IDS,
} from '@/context/purchases';
import { useEntitlement } from '@/context/EntitlementContext';
import { isRevenueCatConfigured } from '@/config/env';
import {
  colors,
  fontSize,
  fontWeight,
  gradients,
  radius,
  spacing,
} from '@/theme/theme';

/**
 * Boomer AI Pro paywall.
 *
 * Two SKUs (annual default + monthly), 7-day free trial CTA, restore link,
 * legal links. `?mode=hard` removes the close button (used post-trial when
 * the user MUST subscribe to continue using the app).
 */

const PRO_FEATURES = [
  'Unlimited AI conversations',
  'Voice chat with read-aloud answers',
  'AI image creation, no limits',
  'All video & audio lessons',
  'New features first, priority support',
];

const TERMS_URL = 'https://boomer.ai/terms';
const PRIVACY_URL = 'https://boomer.ai/privacy';

type PaywallMode = 'soft' | 'hard';

export default function PaywallScreen() {
  const router = useRouter();
  const { mode } = useLocalSearchParams<{ mode?: PaywallMode }>();
  const { refresh } = useEntitlement();

  const hardGate = mode === 'hard';

  const [loading, setLoading] = useState(true);
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const offering = await getOffering();
      if (cancelled) return;
      const pkgs = offering?.availablePackages ?? [];
      setPackages(pkgs);
      // Default-highlight the annual package.
      const annual = pkgs.find((p) =>
        p.product.identifier.includes(PRODUCT_IDS.annual),
      );
      setSelectedId((annual ?? pkgs[0])?.identifier ?? null);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const selected = useMemo(
    () => packages.find((p) => p.identifier === selectedId) ?? null,
    [packages, selectedId],
  );

  const close = useCallback(() => {
    if (hardGate) return;
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)');
  }, [hardGate, router]);

  const buy = useCallback(
    async (pkg: PurchasesPackage | null) => {
      if (!pkg) return;
      setBusy(true);
      setMessage(null);
      const res = await purchasePackage(pkg);
      setBusy(false);
      if (res.ok) {
        await refresh();
        setMessage('You are now Pro! Enjoy everything Boomer AI offers. 🎉');
        // After a successful purchase, exit the paywall.
        setTimeout(() => router.replace('/(tabs)'), 600);
      } else if (res.cancelled) {
        // Silent — user backed out.
      } else {
        setMessage(res.error ?? 'Purchase did not complete. Please try again.');
      }
    },
    [refresh, router],
  );

  const restore = useCallback(async () => {
    setBusy(true);
    setMessage(null);
    const ok = await restorePurchases();
    setBusy(false);
    if (ok) {
      await refresh();
      setMessage('Your Pro access has been restored. 🎉');
      setTimeout(() => router.replace('/(tabs)'), 600);
    } else {
      setMessage('No previous purchases were found.');
    }
  }, [refresh, router]);

  const isAnnual = (pkg: PurchasesPackage) =>
    pkg.product.identifier.includes(PRODUCT_IDS.annual);

  return (
    <Screen edges={['top', 'bottom']} centered>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {!hardGate && (
          <Pressable
            onPress={close}
            style={styles.close}
            accessibilityRole="button"
            accessibilityLabel="Close"
            hitSlop={16}
          >
            <Text style={styles.closeText}>✕</Text>
          </Pressable>
        )}

        <LinearGradient colors={gradients.brand} style={styles.hero}>
          <Text style={styles.heroEmoji}>⭐</Text>
          <Text style={styles.heroTitle}>Boomer AI Pro</Text>
          <Text style={styles.heroSub}>
            Start your 7-day free trial. Cancel anytime.
          </Text>
        </LinearGradient>

        <View style={styles.features}>
          {PRO_FEATURES.map((f) => (
            <View key={f} style={styles.featureRow}>
              <Text style={styles.featureCheck}>✓</Text>
              <Text style={styles.featureText}>{f}</Text>
            </View>
          ))}
        </View>

        {message && (
          <InfoBanner
            tone={message.includes('🎉') ? 'info' : 'danger'}
            message={message}
          />
        )}

        {!isRevenueCatConfigured ? (
          <InfoBanner
            tone="warn"
            title="Purchases not set up yet"
            message="Set EXPO_PUBLIC_RC_IOS_KEY (or expo.extra.revenueCatApiKeyIos in app.json) to enable Pro. See README → Subscriptions."
          />
        ) : loading ? (
          <ActivityIndicator
            color={colors.primary}
            style={{ marginVertical: spacing.xl }}
          />
        ) : packages.length === 0 ? (
          <InfoBanner
            tone="warn"
            message="No subscription options are available right now. Please try again later."
          />
        ) : (
          <View style={styles.packages}>
            {packages
              // Annual first so the highlighted default appears on top.
              .slice()
              .sort((a) => (isAnnual(a) ? -1 : 1))
              .map((pkg) => {
                const annual = isAnnual(pkg);
                const isSelected = pkg.identifier === selectedId;
                return (
                  <Pressable
                    key={pkg.identifier}
                    onPress={() => setSelectedId(pkg.identifier)}
                    disabled={busy}
                    style={[
                      styles.pkg,
                      isSelected && styles.pkgSelected,
                      busy && styles.pkgDisabled,
                    ]}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: isSelected }}
                    accessibilityLabel={`${pkg.product.title}, ${pkg.product.priceString}`}
                  >
                    <View style={styles.radio}>
                      {isSelected && <View style={styles.radioDot} />}
                    </View>
                    <View style={styles.pkgBody}>
                      <View style={styles.pkgTitleRow}>
                        <Text style={styles.pkgTitle}>
                          {annual ? 'Annual' : 'Monthly'}
                        </Text>
                        {annual && (
                          <View style={styles.badge}>
                            <Text style={styles.badgeText}>BEST VALUE</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.pkgDesc}>
                        7-day free trial, then {pkg.product.priceString}
                        {annual ? '/year' : '/month'}
                      </Text>
                    </View>
                    <Text style={styles.pkgPrice}>{pkg.product.priceString}</Text>
                  </Pressable>
                );
              })}
          </View>
        )}

        <Button
          title={
            selected
              ? `Start 7-day free trial · ${selected.product.priceString}`
              : 'Start 7-day free trial'
          }
          onPress={() => buy(selected)}
          variant="ink"
          loading={busy}
          disabled={!selected || !isRevenueCatConfigured}
        />

        <Pressable
          onPress={restore}
          disabled={busy || !isRevenueCatConfigured}
          accessibilityRole="button"
          accessibilityLabel="Restore purchases"
          style={styles.restore}
        >
          <Text style={styles.restoreText}>Restore purchases</Text>
        </Pressable>

        <Text style={styles.legal}>
          Subscriptions renew automatically unless cancelled at least 24 hours
          before the end of the current period. Manage or cancel anytime in your
          App Store account settings.
        </Text>

        <View style={styles.linksRow}>
          <Pressable
            onPress={() => Linking.openURL(TERMS_URL)}
            accessibilityRole="link"
          >
            <Text style={styles.link}>Terms</Text>
          </Pressable>
          <Text style={styles.linkSep}>·</Text>
          <Pressable
            onPress={() => Linking.openURL(PRIVACY_URL)}
            accessibilityRole="link"
          >
            <Text style={styles.link}>Privacy</Text>
          </Pressable>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  close: {
    alignSelf: 'flex-end',
    minWidth: 44,
    minHeight: 44,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  closeText: { fontSize: fontSize.xl, color: colors.textMuted },
  hero: {
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.xs,
  },
  heroEmoji: { fontSize: 44 },
  heroTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.black,
    color: colors.textOnDark,
  },
  heroSub: {
    fontSize: fontSize.md,
    color: 'rgba(255,255,255,0.92)',
    fontWeight: fontWeight.medium,
    textAlign: 'center',
  },
  features: { gap: spacing.sm },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  featureCheck: {
    width: 24,
    fontSize: fontSize.lg,
    color: colors.primary,
    fontWeight: fontWeight.black,
  },
  featureText: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.textPrimary,
    lineHeight: 26,
  },
  packages: { gap: spacing.md },
  pkg: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    minHeight: 76,
    backgroundColor: colors.surface,
  },
  pkgSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  pkgDisabled: { opacity: 0.5 },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  pkgBody: { flex: 1, gap: 2 },
  pkgTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  pkgTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  badge: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  badgeText: {
    color: colors.textOnDark,
    fontSize: 10,
    fontWeight: fontWeight.black,
    letterSpacing: 0.5,
  },
  pkgDesc: { fontSize: fontSize.sm, color: colors.textSecondary },
  pkgPrice: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.black,
    color: colors.textPrimary,
  },
  restore: { alignItems: 'center', paddingVertical: spacing.sm },
  restoreText: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: fontWeight.semibold,
  },
  legal: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  linksRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  link: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    fontWeight: fontWeight.semibold,
  },
  linkSep: { fontSize: fontSize.xs, color: colors.textMuted },
});
