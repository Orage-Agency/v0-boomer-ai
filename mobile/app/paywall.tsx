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
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { BYPASS_PRO_KEY } from '@/context/storage';
import { isBypassCode } from '@/lib/bypassCodes';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Purchases from 'react-native-purchases';
import type { PurchasesPackage } from 'react-native-purchases';
import Constants from 'expo-constants';
import { Screen } from '@/components/Screen';
import { Button } from '@/components/Button';
import { InfoBanner } from '@/components/InfoBanner';
import { AnimatedPressable } from '@/components/AnimatedPressable';
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

const TERMS_URL = 'https://www.boomerai.us/terms';
const PRIVACY_URL = 'https://www.boomerai.us/privacy';

/** Number of times the version label must be tapped to bypass the paywall. */
const DEV_BYPASS_TAPS = 7;

/**
 * Static marketing copy for pricing when RC has not yet returned packages.
 * The actual purchase ALWAYS uses the live `priceString` from RC; these only
 * appear as visible marketing while the store is being contacted (or if it
 * fails) so the paywall never looks empty / priceless.
 */
const MARKETING_YEARLY = '$97/year';
const MARKETING_MONTHLY = '$10/month';

type PaywallMode = 'soft' | 'hard';

export default function PaywallScreen() {
  const router = useRouter();
  const { mode } = useLocalSearchParams<{ mode?: PaywallMode }>();
  const { entitled, refresh, celebrateUnlock } = useEntitlement();

  const hardGate = mode === 'hard';

  // A Pro user must never be stuck on the paywall. The moment entitlement
  // flips true — a purchase, a restore, or a code redeemed in the nested
  // login sheet — collapse every modal in the stack and drop into the app.
  useEffect(() => {
    if (!entitled) return;
    if (router.canDismiss()) router.dismissAll();
    else router.replace('/(tabs)');
  }, [entitled, router]);

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

  const annualPackage = useMemo(
    () => packages.find((p) => p.product.identifier.includes(PRODUCT_IDS.annual)) ?? null,
    [packages],
  );

  const loadOffering = useCallback(async () => {
    setLoading(true);
    const offering = await getOffering();
    const pkgs = offering?.availablePackages ?? [];
    setPackages(pkgs);
    const annual = pkgs.find((p) =>
      p.product.identifier.includes(PRODUCT_IDS.annual),
    );
    setSelectedId((annual ?? pkgs[0])?.identifier ?? null);
    setLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await loadOffering();
      // RC sometimes returns an empty offering on first cold start while
      // StoreKit warms up; retry once after 1.5s if we got nothing.
      if (!cancelled) {
        setTimeout(async () => {
          if (cancelled) return;
          const current = await getOffering();
          if (cancelled) return;
          if ((current?.availablePackages?.length ?? 0) > 0) {
            const pkgs = current!.availablePackages;
            setPackages(pkgs);
            if (!selectedId) {
              const annual = pkgs.find((p) =>
                p.product.identifier.includes(PRODUCT_IDS.annual),
              );
              setSelectedId((annual ?? pkgs[0])?.identifier ?? null);
            }
          }
        }, 1500);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        // Purchase succeeded — always show the thank-you, then the entitled
        // effect collapses the paywall.
        await refresh();
        celebrateUnlock();
      } else if (res.cancelled) {
        // Silent — user backed out.
      } else {
        setMessage(res.error ?? 'Purchase did not complete. Please try again.');
      }
    },
    [refresh, router, celebrateUnlock],
  );

  const restore = useCallback(async () => {
    setBusy(true);
    setMessage(null);
    const ok = await restorePurchases();
    setBusy(false);
    if (ok) {
      await refresh();
      celebrateUnlock();
    } else {
      setMessage('No previous purchases were found.');
    }
  }, [refresh, router, celebrateUnlock]);

  /**
   * Promo / offer code redemption.
   *
   * Checks the shared offline bypass codes first — if matched, sets a local
   * AsyncStorage flag and dismisses the paywall without any network call.
   * Otherwise falls through to the platform-specific redemption flow:
   *   iOS → Apple's native offer-code sheet via RevenueCat
   *   Android → Play Store promo redemption URL
   */
  const applyPromoCode = useCallback(async () => {
    setPromoLoading(true);
    setMessage(null);
    const normalized = promoCode.trim().toUpperCase();

    // Local bypass: grant pro immediately without touching Apple/Google. The
    // entitled effect dismisses the paywall and the global overlay celebrates.
    if (isBypassCode(normalized)) {
      try {
        await AsyncStorage.setItem(BYPASS_PRO_KEY, 'true');
        await refresh();
        // A redeemed code = they're Pro now; always show the thank-you.
        celebrateUnlock();
      } catch {
        setMessage('Could not apply the code. Please try again.');
      } finally {
        setPromoLoading(false);
      }
      return;
    }

    if (!isRevenueCatConfigured) {
      setMessage('Purchases are not configured yet.');
      setPromoLoading(false);
      return;
    }

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
  }, [promoCode, refresh, router, celebrateUnlock]);

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

        <Animated.View entering={FadeInDown.duration(320)}>
          <LinearGradient colors={gradients.brand} style={styles.hero}>
            <Text style={styles.heroEmoji}>⭐</Text>
            <Text style={styles.heroTitle}>Boomer AI Pro</Text>
            <Text style={styles.heroSub}>
              {annualPackage
                ? `7 days free, then ${annualPackage.product.priceString} a year. Cancel anytime.`
                : `7 days free, then ${MARKETING_YEARLY}. Cancel anytime.`}
            </Text>
          </LinearGradient>
        </Animated.View>

        <View style={styles.features}>
          {PRO_FEATURES.map((f, i) => (
            <Animated.View
              key={f}
              entering={FadeInDown.duration(280).delay(80 + i * 50)}
              style={styles.featureRow}
            >
              <Text style={styles.featureCheck}>✓</Text>
              <Text style={styles.featureText}>{f}</Text>
            </Animated.View>
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
          // RC returned no packages (StoreKit warm-up, network blip, or product
          // still in ASC "Ready to Submit"). Show marketing pricing so the
          // paywall is never visually empty, plus a Retry button.
          <View style={styles.packages}>
            <View style={[styles.pkg, styles.pkgFallback]}>
              <View style={styles.pkgBody}>
                <View style={styles.pkgTitleRow}>
                  <Text style={styles.pkgTitle}>Yearly</Text>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>7-DAY FREE TRIAL</Text>
                  </View>
                </View>
                <Text style={styles.pkgDesc}>{`7 days free, then ${MARKETING_YEARLY}`}</Text>
              </View>
              <Text style={styles.pkgPrice}>{MARKETING_YEARLY}</Text>
            </View>
            <View style={[styles.pkg, styles.pkgFallback]}>
              <View style={styles.pkgBody}>
                <View style={styles.pkgTitleRow}>
                  <Text style={styles.pkgTitle}>Monthly</Text>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>3-DAY FREE TRIAL</Text>
                  </View>
                </View>
                <Text style={styles.pkgDesc}>{`3 days free, then ${MARKETING_MONTHLY}`}</Text>
              </View>
              <Text style={styles.pkgPrice}>{MARKETING_MONTHLY}</Text>
            </View>
            <InfoBanner
              tone="warn"
              message="Connecting to the App Store to load live pricing. If this persists, tap Retry."
            />
            <Pressable
              onPress={() => void loadOffering()}
              accessibilityRole="button"
              accessibilityLabel="Retry loading subscription options"
              style={styles.retryBtn}
            >
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.packages}>
            {packages
              .slice()
              .sort((a) => (isAnnual(a) ? -1 : 1))
              .map((pkg) => {
                const annual = isAnnual(pkg);
                const isSelected = pkg.identifier === selectedId;
                return (
                  <AnimatedPressable
                    key={pkg.identifier}
                    onPress={() => setSelectedId(pkg.identifier)}
                    disabled={busy}
                    pressedScale={0.98}
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
                        <View style={styles.badge}>
                          <Text style={styles.badgeText}>
                            {annual ? '7-DAY FREE TRIAL' : '3-DAY FREE TRIAL'}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.pkgDesc}>
                        {annual
                          ? `7 days free, then ${pkg.product.priceString}/year`
                          : `3 days free, then ${pkg.product.priceString}/month`}
                      </Text>
                    </View>
                    <Text style={styles.pkgPrice}>{pkg.product.priceString}</Text>
                  </AnimatedPressable>
                );
              })}
          </View>
        )}

        <Button
          title={
            selected
              ? selected.product.identifier.includes(PRODUCT_IDS.annual)
                ? `Start 7-day free trial · ${selected.product.priceString}/yr`
                : `Start 3-day free trial · ${selected.product.priceString}/mo`
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

        {/* "I already have an account" — opens the login / access-code modal. */}
        <Pressable
          onPress={() => router.push('/login')}
          accessibilityRole="button"
          accessibilityLabel="I already have an account"
          style={styles.haveAccount}
        >
          <Text style={styles.haveAccountText}>I already have an account</Text>
          <Text style={styles.haveAccountSub}>
            Sign in or enter your access code
          </Text>
        </Pressable>

        {/* Restore Purchases — explicit "already a subscriber" affordance. */}
        <Pressable
          onPress={restore}
          disabled={busy || !isRevenueCatConfigured}
          accessibilityRole="button"
          accessibilityLabel="Already subscribed, restore purchases"
          style={styles.restore}
        >
          <Text style={styles.restoreText}>Already subscribed? Restore</Text>
        </Pressable>

        {/* Promo / Offer Code */}
        <Pressable
          onPress={() => setShowPromo((v) => !v)}
          accessibilityRole="button"
          accessibilityLabel="Have a code"
          style={styles.promoToggle}
        >
          <Text style={styles.promoToggleText}>Have a code?</Text>
        </Pressable>
        {showPromo && (
          <View style={styles.promoRow}>
            <TextInput
              style={styles.promoInput}
              placeholder="Enter promo or bypass code"
              placeholderTextColor={colors.textMuted}
              value={promoCode}
              onChangeText={setPromoCode}
              autoCapitalize="characters"
              returnKeyType="done"
              editable={!promoLoading}
            />
            <Pressable
              onPress={applyPromoCode}
              disabled={promoLoading || promoCode.trim().length === 0}
              style={[
                styles.promoApply,
                (promoLoading || promoCode.trim().length === 0) && styles.promoApplyDisabled,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Apply promo code"
            >
              {promoLoading ? (
                <ActivityIndicator color={colors.textOnDark} size="small" />
              ) : (
                <Text style={styles.promoApplyText}>Apply</Text>
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
  pkgFallback: { opacity: 0.85 },
  retryBtn: {
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  retryText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },
  pkgPrice: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.black,
    color: colors.textPrimary,
  },
  haveAccount: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    minHeight: 56,
    justifyContent: 'center',
  },
  haveAccountText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  haveAccountSub: {
    marginTop: 2,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
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
