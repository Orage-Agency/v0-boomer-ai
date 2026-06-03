import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Purchases from 'react-native-purchases';
import type { PurchasesPackage } from 'react-native-purchases';
import Constants from 'expo-constants';
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
 *
 * Free tier (on close / dismiss):
 *   - 5 AI chat messages per day
 *   - No voice chat
 *   - No image generation
 *   - 3 lessons (intro only)
 *   - Tips tab available
 *
 * Dev bypass: tap the version number 7 times to skip the paywall entirely.
 */

const PRO_FEATURES = [
  'Unlimited AI conversations',
  'Voice chat with read-aloud answers',
  'AI image creation, no limits',
  'All video & audio lessons',
  'New features first, priority support',
];

/** Features available on the free tier — shown beneath the close button. */
const FREE_FEATURES = [
  '5 AI chat messages per day',
  '3 intro lessons',
  'Daily tips',
];

const TERMS_URL = 'https://boomer.ai/terms';
const PRIVACY_URL = 'https://boomer.ai/privacy';

/** Number of times the version label must be tapped to bypass the paywall. */
const DEV_BYPASS_TAPS = 7;

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

  // Promo code state
  const [promoCode, setPromoCode] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [showPromo, setShowPromo] = useState(false);

  // Dev bypass: tap version N times
  const tapCountRef = useRef(0);
  const tapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const appVersion = Constants.expoConfig?.version ?? '1.0.0';

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const offering = await getOffering();
      if (cancelled) return;
      const pkgs = offering?.availablePackages ?? [];
      setPackages(pkgs);
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

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
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

  /**
   * Dev bypass: tap version label DEV_BYPASS_TAPS times within 3 seconds.
   * Resets counter if the timer expires between taps.
   */
  const handleVersionTap = useCallback(() => {
    tapCountRef.current += 1;
    // Reset after 3 seconds of inactivity
    if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
    tapTimerRef.current = setTimeout(() => {
      tapCountRef.current = 0;
    }, 3000);
    if (tapCountRef.current >= DEV_BYPASS_TAPS) {
      tapCountRef.current = 0;
      if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
      router.replace('/(tabs)');
    }
  }, [router]);

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

  /**
   * Promo / offer code redemption.
   *
   * On iOS: RevenueCat's `presentCodeRedemptionSheet()` opens the native App
   * Store offer-code sheet — the user enters their code in Apple's own UI.
   * The `promoCode` text field is used as a fallback label only on Android
   * (Google Play Promo Codes are redeemed in Play Store, not in-app).
   *
   * TODO(owner): If you need server-side promo validation before the RC sheet
   * opens, add your logic here. RC API key is read from env automatically.
   */
  const applyPromoCode = useCallback(async () => {
    if (!isRevenueCatConfigured) {
      setMessage('Purchases are not configured yet.');
      return;
    }
    setPromoLoading(true);
    setMessage(null);
    try {
      if (Platform.OS === 'ios') {
        // Opens Apple's native offer-code redemption sheet.
        await Purchases.presentCodeRedemptionSheet();
        // After the sheet closes, check if entitlement was granted.
        await refresh();
        setMessage('Check your subscription status — if unlocked you are all set!');
      } else {
        // Android: direct the user to Play Store promo code redemption.
        const playStoreUrl = `https://play.google.com/redeem?code=${encodeURIComponent(promoCode.trim())}`;
        await Linking.openURL(playStoreUrl);
      }
    } catch (e) {
      setMessage('Could not open the code redemption screen. Please try again.');
    } finally {
      setPromoLoading(false);
    }
  }, [promoCode, refresh]);

  const isAnnual = (pkg: PurchasesPackage) =>
    pkg.product.identifier.includes(PRODUCT_IDS.annual);

  return (
    <Screen edges={['top', 'bottom']} centered>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Close (X) — soft gate only. The full "Continue free" CTA lives
            below the purchase buttons so it is impossible to miss. */}
        {!hardGate && (
          <View style={styles.closeRow}>
            <Pressable
              onPress={close}
              style={styles.close}
              accessibilityRole="button"
              accessibilityLabel="Close paywall"
              hitSlop={16}
            >
              <Text style={styles.closeText}>✕</Text>
            </Pressable>
          </View>
        )}

        <LinearGradient colors={gradients.brand} style={styles.hero}>
          <Text style={styles.heroEmoji}>⭐</Text>
          <Text style={styles.heroTitle}>Boomer AI Pro</Text>
          <Text style={styles.heroSub}>
            7 days free, then $97 a year. Cancel anytime.
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
                          {annual ? 'Yearly' : 'Monthly'}
                        </Text>
                        {annual && (
                          <View style={styles.badge}>
                            <Text style={styles.badgeText}>7-DAY FREE TRIAL</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.pkgDesc}>
                        {annual
                          ? `7 days free, then ${pkg.product.priceString}/year`
                          : `${pkg.product.priceString}/month, billed monthly`}
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
              ? selected.product.identifier.includes(PRODUCT_IDS.annual)
                ? `Start 7-day free trial · ${selected.product.priceString}/yr`
                : `Subscribe · ${selected.product.priceString}/mo`
              : 'Continue'
          }
          onPress={() => buy(selected)}
          variant="ink"
          loading={busy}
          disabled={!selected || !isRevenueCatConfigured}
        />

        {/* Continue with limited free version — soft-gate only. */}
        {!hardGate && (
          <Pressable
            onPress={close}
            disabled={busy}
            accessibilityRole="button"
            accessibilityLabel="Continue with limited free version"
            style={styles.freeTierBtn}
          >
            <Text style={styles.freeTierBtnTitle}>
              Continue with limited free version
            </Text>
            <Text style={styles.freeTierBtnSub}>
              {FREE_FEATURES.join(' · ')}
            </Text>
          </Pressable>
        )}

        {/* Restore Purchases */}
        <Pressable
          onPress={restore}
          disabled={busy || !isRevenueCatConfigured}
          accessibilityRole="button"
          accessibilityLabel="Restore purchases"
          style={styles.restore}
        >
          <Text style={styles.restoreText}>Restore purchases</Text>
        </Pressable>

        {/* Promo / Offer Code */}
        <Pressable
          onPress={() => setShowPromo((v) => !v)}
          accessibilityRole="button"
          style={styles.promoToggle}
        >
          <Text style={styles.promoToggleText}>Have a promo code?</Text>
        </Pressable>
        {showPromo && (
          <View style={styles.promoRow}>
            {Platform.OS === 'android' && (
              <TextInput
                style={styles.promoInput}
                placeholder="Enter promo code"
                placeholderTextColor={colors.textMuted}
                value={promoCode}
                onChangeText={setPromoCode}
                autoCapitalize="characters"
                returnKeyType="done"
                editable={!promoLoading}
              />
            )}
            <Pressable
              onPress={applyPromoCode}
              disabled={promoLoading || (Platform.OS === 'android' && promoCode.trim().length === 0)}
              style={[
                styles.promoApply,
                (promoLoading || (Platform.OS === 'android' && promoCode.trim().length === 0)) &&
                  styles.promoApplyDisabled,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Apply promo code"
            >
              {promoLoading ? (
                <ActivityIndicator color={colors.textOnDark} size="small" />
              ) : (
                <Text style={styles.promoApplyText}>
                  {Platform.OS === 'ios' ? 'Redeem Code' : 'Apply'}
                </Text>
              )}
            </Pressable>
          </View>
        )}

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

        {/* Hidden dev bypass — tap version number 7 times to skip paywall */}
        <Pressable
          onPress={handleVersionTap}
          hitSlop={8}
          accessibilityLabel={undefined}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          <Text style={styles.versionLabel}>v{appVersion}</Text>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  closeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  close: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  closeText: { fontSize: fontSize.xl, color: colors.textMuted },
  freeTierBtn: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    minHeight: 56,
    backgroundColor: colors.surface,
  },
  freeTierBtnTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  freeTierBtnSub: {
    marginTop: 2,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    textAlign: 'center',
  },
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
  promoToggle: { alignItems: 'center', paddingVertical: spacing.xs },
  promoToggleText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textDecorationLine: 'underline',
  },
  promoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  promoInput: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: fontSize.md,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
  },
  promoApply: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  promoApplyDisabled: { opacity: 0.4 },
  promoApplyText: {
    color: colors.textOnDark,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
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
  versionLabel: {
    fontSize: 10,
    // Faint but visible so the owner can locate the 7-tap dev bypass target.
    color: 'rgba(0,0,0,0.18)',
    textAlign: 'center',
    paddingVertical: spacing.xs,
  },
});
