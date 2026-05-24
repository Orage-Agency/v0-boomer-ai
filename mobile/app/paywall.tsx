import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import type { PurchasesPackage } from 'react-native-purchases';
import { Screen } from '@/components/Screen';
import { Button } from '@/components/Button';
import { InfoBanner } from '@/components/InfoBanner';
import {
  getOffering,
  purchasePackage,
  restorePurchases,
} from '@/context/purchases';
import { isRevenueCatConfigured } from '@/config/env';
import { colors, fontSize, fontWeight, gradients, radius, spacing } from '@/theme/theme';
import { LinearGradient } from 'expo-linear-gradient';

/**
 * Pro paywall. Reuses the existing RevenueCat scaffold (`src/context/purchases`)
 * which safely no-ops when no real key is configured. Lists the current
 * offering's packages, handles purchase + restore, and surfaces a clear notice
 * when IAP is not yet set up.
 */

const PRO_FEATURES = [
  '🎨 Unlimited AI image creation',
  '🎙️ Voice chat with read-aloud answers',
  '📚 All video & audio lessons',
  '💬 Unlimited AI conversations',
  '⭐ Priority help & new features first',
];

export default function PaywallScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const offering = await getOffering();
      if (cancelled) return;
      setPackages(offering?.availablePackages ?? []);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const buy = useCallback(async (pkg: PurchasesPackage) => {
    setBusy(true);
    setMessage(null);
    const res = await purchasePackage(pkg);
    setBusy(false);
    if (res.ok) {
      setMessage('You are now Pro! Enjoy everything Boomer AI offers. 🎉');
    } else if (res.cancelled) {
      // Silent — user backed out.
    } else {
      setMessage(res.error ?? 'Purchase did not complete. Please try again.');
    }
  }, []);

  const restore = useCallback(async () => {
    setBusy(true);
    setMessage(null);
    const ok = await restorePurchases();
    setBusy(false);
    setMessage(
      ok ? 'Your Pro access has been restored. 🎉' : 'No previous purchases were found.',
    );
  }, []);

  return (
    <Screen centered edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Pressable
          onPress={() => router.back()}
          style={styles.close}
          accessibilityRole="button"
          accessibilityLabel="Close"
        >
          <Text style={styles.closeText}>✕</Text>
        </Pressable>

        <LinearGradient colors={gradients.brand} style={styles.hero}>
          <Text style={styles.heroEmoji}>⭐</Text>
          <Text style={styles.heroTitle}>Boomer AI Pro</Text>
          <Text style={styles.heroSub}>Unlock everything, no limits.</Text>
        </LinearGradient>

        <View style={styles.features}>
          {PRO_FEATURES.map((f) => (
            <Text key={f} style={styles.feature}>
              {f}
            </Text>
          ))}
        </View>

        {message && (
          <InfoBanner tone={message.includes('🎉') ? 'info' : 'danger'} message={message} />
        )}

        {!isRevenueCatConfigured ? (
          <InfoBanner
            tone="warn"
            title="Purchases not set up yet"
            message="Add RevenueCat keys + store products in app.json to enable Pro. See src/context/purchases.ts for the setup checklist."
          />
        ) : loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginVertical: spacing.xl }} />
        ) : packages.length === 0 ? (
          <InfoBanner
            tone="warn"
            message="No subscription options are available right now. Please try again later."
          />
        ) : (
          <View style={styles.packages}>
            {packages.map((pkg) => (
              <Pressable
                key={pkg.identifier}
                onPress={() => buy(pkg)}
                disabled={busy}
                style={({ pressed }) => [styles.pkg, pressed && styles.pkgPressed, busy && styles.pkgDisabled]}
                accessibilityRole="button"
                accessibilityLabel={`Subscribe: ${pkg.product.title} for ${pkg.product.priceString}`}
              >
                <View style={styles.flex}>
                  <Text style={styles.pkgTitle}>{pkg.product.title}</Text>
                  {pkg.product.description ? (
                    <Text style={styles.pkgDesc}>{pkg.product.description}</Text>
                  ) : null}
                </View>
                <Text style={styles.pkgPrice}>{pkg.product.priceString}</Text>
              </Pressable>
            ))}
          </View>
        )}

        <Button
          title="Restore Purchases"
          onPress={restore}
          variant="secondary"
          loading={busy}
          disabled={!isRevenueCatConfigured}
        />

        <Text style={styles.legal}>
          Subscriptions renew automatically unless cancelled. Manage anytime in your app store
          account settings.
        </Text>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { padding: spacing.lg, gap: spacing.lg },
  close: { alignSelf: 'flex-end', minWidth: 44, minHeight: 44, alignItems: 'flex-end', justifyContent: 'center' },
  closeText: { fontSize: fontSize.xl, color: colors.textMuted },
  hero: {
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.xs,
  },
  heroEmoji: { fontSize: 44 },
  heroTitle: { fontSize: fontSize.xxl, fontWeight: fontWeight.black, color: colors.textOnDark },
  heroSub: { fontSize: fontSize.md, color: 'rgba(255,255,255,0.9)', fontWeight: fontWeight.medium },
  features: { gap: spacing.sm },
  feature: { fontSize: fontSize.md, color: colors.textPrimary, lineHeight: 28 },
  packages: { gap: spacing.md },
  pkg: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: radius.lg,
    padding: spacing.lg,
    minHeight: 64,
  },
  pkgPressed: { backgroundColor: colors.primarySoft },
  pkgDisabled: { opacity: 0.5 },
  pkgTitle: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.textPrimary },
  pkgDesc: { fontSize: fontSize.sm, color: colors.textSecondary },
  pkgPrice: { fontSize: fontSize.lg, fontWeight: fontWeight.black, color: colors.primary },
  legal: { fontSize: fontSize.xs, color: colors.textMuted, textAlign: 'center', lineHeight: 18 },
});
