# Boomer AI — Mobile App

Native iOS + Android client (Expo 52 / React Native 0.76 / expo-router).

Bundle identifier: **`agency.orage.boomerai`** (iOS + Android).

---

## Subscriptions (J-025)

Apple In-App Purchase is the only billing path in Phase 1. Stripe / web
checkout will land in Phase 2 (do not build yet).

### Pricing (locked)

| Plan    | Price   | Trial          | Product ID            |
| ------- | ------- | -------------- | --------------------- |
| Annual  | **$97.00 / year**  | 7-day free trial | `boomerai_annual_97`  |
| Monthly | **$9.99 / month**  | 7-day free trial | `boomerai_monthly_999` |

The product IDs above are **referenced verbatim in the app** at
`src/context/purchases.ts`. They MUST match what is created in App Store
Connect or the paywall will show no packages.

### 1. App Store Connect — create the subscriptions

1. Sign in to https://appstoreconnect.apple.com → **My Apps → Boomer AI**.
2. **Features → Subscriptions** → create a Subscription Group named
   `boomerai_pro` (any descriptive name; the group lives outside RC).
3. Inside the group, add **two auto-renewable subscriptions**:
   - **Annual**
     - Reference Name: `Boomer AI Pro — Annual`
     - Product ID: **`boomerai_annual_97`**
     - Duration: **1 year**
     - Price: **$97.00 USD** (auto-fills equivalents in other storefronts)
     - Localizations: Display Name `Boomer AI Pro — Annual`, Description
       `Unlimited Boomer AI Pro, billed yearly.`
     - **Introductory Offer → Free Trial**: 7 days, Available to **New
       Subscribers**, all territories.
   - **Monthly**
     - Reference Name: `Boomer AI Pro — Monthly`
     - Product ID: **`boomerai_monthly_999`**
     - Duration: **1 month**
     - Price: **$9.99 USD**
     - Localizations: Display Name `Boomer AI Pro — Monthly`, Description
       `Unlimited Boomer AI Pro, billed monthly.`
     - **Introductory Offer → Free Trial**: 7 days, **New Subscribers**, all
       territories.
4. **Agreements, Tax, and Banking → Paid Apps agreement**: must be Active
   (else products report as "Missing Metadata" to RevenueCat).
5. Submit both subscriptions for review along with the next app build (no
   review screenshot is required when bundled with a TestFlight build).

### 2. RevenueCat dashboard — wire the products

1. Sign in to https://app.revenuecat.com and create a project named
   `Boomer AI`.
2. **Apps → Add app → iOS** (Android later). Bundle ID:
   **`agency.orage.boomerai`**. Upload the App-Specific Shared Secret from
   ASC (Users and Access → Integrations → App-Specific Shared Secret).
3. Copy the **public iOS SDK API key** (starts with `appl_`). This is the
   value that must be supplied as `EXPO_PUBLIC_RC_IOS_KEY` (see step 3).
4. **Products → Import** the two ASC products by their IDs:
   - `boomerai_annual_97`
   - `boomerai_monthly_999`
5. **Entitlements → New** → name **`pro`** → attach BOTH products.
   The app reads `customerInfo.entitlements.active["pro"]` to unlock Pro.
6. **Offerings → New** → identifier **`default`** → mark it as **Current**:
   - Package `$rc_annual` → product `boomerai_annual_97`
   - Package `$rc_monthly` → product `boomerai_monthly_999`
7. (Optional but recommended) **Project → Integrations → App Store Server
   Notifications**: paste the URL into ASC → Subscription → Server URL so
   renewals / cancellations are pushed live.

### 3. Wire the API key into the app

The RevenueCat public SDK key is supplied to the app in one of two ways
(env var takes precedence):

**Option A — env var (preferred, EAS / Xcode Cloud / `.env.local`)**

```sh
# .env.local for local dev, or set on EAS / Xcode Cloud env
EXPO_PUBLIC_RC_IOS_KEY=appl_xxxxxxxxxxxxxxxxxxxxxxx
EXPO_PUBLIC_RC_ANDROID_KEY=goog_xxxxxxxxxxxxxxxxxxxxx  # phase 2
```

**Option B — `app.json` fallback**

Replace the placeholders under `expo.extra`:

```jsonc
// mobile/app.json
"extra": {
  "revenueCatApiKeyIos": "__REPLACE_ME__",      // -> appl_...
  "revenueCatApiKeyAndroid": "__REPLACE_ME__"   // -> goog_... (phase 2)
}
```

Until a real key is wired, the app stays in **dev-friendly mode**:
`isRevenueCatConfigured === false`, the paywall shows a yellow setup
banner instead of products, and the launch-time entitlement gate
auto-grants access so no one is locked out of TestFlight before products
are reviewed.

### 4. What the app actually does

| Where                                            | Behavior                                                                                                            |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| `app/_layout.tsx`                                | Calls `initPurchases()` and wraps the tree in `EntitlementProvider`.                                                |
| `src/context/EntitlementContext.tsx`             | Tracks `customerInfo.entitlements.active["pro"]` live (RC listener). Forces `entitled=true` when key is unset.       |
| `app/index.tsx`                                  | After onboarding completes, redirects to `/paywall?mode=hard` if Pro is not active. Otherwise → `/(tabs)`.           |
| `app/paywall.tsx`                                | Lists the `default` offering, annual highlighted, 7-day-trial CTA, restore link, Terms & Privacy links.             |
| `?mode=hard` query                               | Hides the close button. Used post-trial when the user MUST resubscribe to continue.                                 |
| `?mode=soft` / no query                          | Dismissable. Used for soft surfaces (e.g. tapping a Pro feature mid-onboarding).                                    |
| Restore                                          | Calls `Purchases.restorePurchases()`; success refreshes the entitlement context and exits the paywall.              |

### 5. Testing the IAP flow

- IAP does **NOT** work in Expo Go. Use a development build:
  `eas build --profile development --platform ios` (or run via Xcode).
- Add a **Sandbox Apple ID** in iOS Settings → App Store → Sandbox Account.
- On a real device signed into the sandbox account, tap **Start 7-day free
  trial** → Apple sheet appears → confirm → app should switch into the
  authenticated tabs view.
- To re-test the trial: sign sandbox account out / in again in iOS
  Settings, or use **Settings → Subscriptions → Cancel & Resubscribe** in
  the sandbox.

---

## Other env / setup

- `EXPO_PUBLIC_RC_IOS_KEY` — RevenueCat iOS public SDK key (see above).
- `EXPO_PUBLIC_RC_ANDROID_KEY` — RevenueCat Android public SDK key (Phase 2).
- `expo.extra.apiBaseUrl` in `app.json` — origin of the Vercel-hosted
  Next.js backend that serves `/api/*` (chat, images, profile sync).
