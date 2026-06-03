# RevenueCat Dashboard Setup — Boomer AI

Owner action required (account: **georgemoffat@orage.agency**). Estimated time: ~30 minutes once App Store Connect products are approved.

The app code is already wired. This document is the exact click-path you need to take in (1) App Store Connect and (2) RevenueCat to flip the paywall from "no products available" to live.

---

## TL;DR — what the app expects

| Concept | Identifier | Notes |
| --- | --- | --- |
| **Yearly product** | `boomerai.pro.yearly` | $97/yr, 7-day free trial |
| **Monthly product** | `boomerai.pro.monthly` | $10/mo, no trial |
| **Entitlement** | `pro` | Single entitlement gates everything |
| **Offering** | `default` | The "current" offering — RC fetches this on the paywall |
| **iOS SDK key (public)** | `appl_gfKZNVBQtIXGZkABPKGPtfasgZz` | Already in `app.json` ✅ |
| **Android SDK key (public)** | _not yet_ | Needed before Android ship; until then Android paywall stays in no-op mode |
| **iOS bundle ID** | `boomerai.orage.agency` | Must match ASC + RC iOS app config |

These are hard-coded in `mobile/src/context/purchases.ts` (`PRODUCT_IDS`, `PRO_ENTITLEMENT`, `ENTITLEMENT_OFFERING`). **Do not** rename any of them in the dashboards — the IDs must match verbatim.

---

## Step 1 — Apple: App Store Connect

You need both subscriptions created and in "Ready to Submit" / "Approved" state before RC can read them.

1. **App Store Connect → My Apps → Boomer AI → Monetization → Subscriptions**.
2. **Create a Subscription Group** named `Boomer AI Pro` (RC needs both SKUs in the same group so users can upgrade/switch).
3. Inside the group, click **+ Create Subscription**:
   - **Reference Name**: `Boomer AI Pro — Yearly`
   - **Product ID**: `boomerai.pro.yearly` ← copy exactly
   - **Subscription Duration**: 1 year
   - **Price**: $97.00 USD (set base territory; auto-fill other markets after)
   - **Localizations**: Display Name `Boomer AI Pro (Yearly)` / Description `Unlimited AI chat, voice, image generation, all lessons. 7-day free trial.`
   - **Introductory Offer**: Type = **Free Trial**, Duration = **7 days**, Eligibility = **New Subscribers**.
   - **Review Information**: short screenshot of the paywall (the in-app paywall screen is fine).
4. Click **+ Create Subscription** again:
   - **Reference Name**: `Boomer AI Pro — Monthly`
   - **Product ID**: `boomerai.pro.monthly`
   - **Subscription Duration**: 1 month
   - **Price**: $10.00 USD
   - **Localizations**: Display Name `Boomer AI Pro (Monthly)` / Description `Unlimited AI chat, voice, image generation, all lessons. Billed monthly.`
   - **No** intro offer.
5. Make sure **Paid Apps Agreement**, **Tax Forms**, and **Banking** are signed/active under Agreements, Tax, and Banking — RC cannot fetch products until this is done. This is the #1 reason "no subscription options available" appears in the paywall.
6. Both subs should now read **"Ready to Submit"** (yellow) — that is sufficient for RC to expose them in sandbox. They flip to **"Approved"** only on first app review submission.

---

## Step 2 — RevenueCat dashboard

Login as `georgemoffat@orage.agency` → https://app.revenuecat.com

### 2a. Project + App

1. **Projects** → confirm a project named `Boomer AI` exists (create if not).
2. **Project settings → Apps → + New** (skip if iOS app row exists):
   - Platform: **App Store (iOS)**
   - App Name: `Boomer AI iOS`
   - Bundle ID: `boomerai.orage.agency`
   - **App-Specific Shared Secret**: paste the value from App Store Connect → Users and Access → Keys → In-App Purchase → Shared Secret (or the app-specific shared secret on the Boomer AI app's main info page). RC validates receipts with this — without it, sandbox purchases silently fail to grant entitlement.
   - **App Store Connect API key** (recommended, optional): upload a `.p8` issued for the user role with **Sales and Reports** + **Customer Support** access. This unlocks server-side refund webhooks and customer history.

### 2b. Products

1. **Product catalog → Products → + New**.
2. First product:
   - Identifier: `boomerai.pro.yearly`
   - Store: App Store
   - Type: Subscription
3. Second product:
   - Identifier: `boomerai.pro.monthly`
   - Store: App Store
   - Type: Subscription
4. Hit **Sync from App Store** at the top — RC fetches title, price, intro offer from ASC. If the product cards show **"Not Found"**, ASC products are not yet in Ready to Submit / Banking is incomplete (see Step 1 §5).

### 2c. Entitlement

1. **Product catalog → Entitlements → + New Entitlement**.
2. Identifier: `pro` ← lowercase, exactly.
3. Display name: `Pro` (cosmetic).
4. Attach BOTH products you just created (`boomerai.pro.yearly`, `boomerai.pro.monthly`) under "Attached Products" so a purchase of either flips the `pro` flag on.

### 2d. Offering

1. **Product catalog → Offerings → + New Offering**.
2. Identifier: `default` ← lowercase, exactly.
3. Description: `Boomer AI Pro — Yearly + Monthly`.
4. Add 2 packages:
   - Package: `$rc_annual` (built-in) → Product: `boomerai.pro.yearly`
   - Package: `$rc_monthly` (built-in) → Product: `boomerai.pro.monthly`
5. Click the **⋯ menu next to the offering name → "Make current"**. This is what `Purchases.getOfferings().current` resolves to in the app. If the offering is not marked current, the paywall renders "No subscription options are available right now."

### 2e. (Optional but recommended) Offer codes

The paywall's "Redeem Code" button calls `Purchases.presentCodeRedemptionSheet()` on iOS, which opens **Apple's native** offer-code sheet (not RC's). So actual codes are created in App Store Connect, not RC:

1. ASC → Boomer AI → **Subscriptions → Offer Codes → + Create Offer Code**.
2. Attach to `boomerai.pro.yearly` (most common — full month or year free promo).
3. Codes generate as either a CSV download (one-time codes) or a custom code (shareable single code).
4. RC will see the redemption in the customer timeline once a user redeems, and `pro` flips on automatically — no extra wiring needed.

---

## Step 3 — Verify end-to-end (sandbox)

1. **Build a development client** (Expo Go cannot run native IAP):
   ```sh
   cd mobile
   eas build --profile development --platform ios
   ```
   Then install on a physical device signed into a **sandbox Apple ID** (create one at ASC → Users and Access → Sandbox Testers if you do not have one).
2. Launch the app → land on paywall.
3. Confirm both packages render with the correct prices (`$97.00/year` + `$10.00/month`). If they show blank or "No subscription options" — check ASC banking/tax (§1.5) and RC offering set to current (§2d.5).
4. Tap **Start 7-day free trial** → Apple sandbox prompt → confirm. The InfoBanner should flash "You are now Pro!" and route to `/(tabs)`.
5. Force-quit and reopen → app should land directly on `/(tabs)` (no paywall) because `pro` is still active.
6. Tap **Go Pro** tile → paywall → **Restore purchases** → should re-confirm Pro entitlement.
7. **Redeem Code** → Apple's native sheet appears.
8. **Continue with limited free version** → app should now load tabs even without Pro (verified the soft gate works).
9. **Dev bypass**: from paywall, tap the faint `v1.0.2` label at the bottom 7× within 3 seconds → instantly drops into tabs.

---

## Step 4 — Android (later, when you ship Android)

Android is currently disabled at the SDK key layer (`__REPLACE_ME__` in `app.json`) — the app safely no-ops on Android until you flip it on. When you're ready:

1. Google Play Console → Monetize → Products → Subscriptions → create the same two IDs (`boomerai.pro.yearly`, `boomerai.pro.monthly`) with matching prices.
2. RC → Project settings → Apps → + New → **Play Store** → bundle ID `boomerai.orage.agency` → upload Play Console service account JSON.
3. RC catalog → Products → add Play Store variants of the same two product IDs → attach to the same `pro` entitlement → add to same `default` offering.
4. Set `EXPO_PUBLIC_RC_ANDROID_KEY` (EAS secret) **or** update `app.json → expo.extra.revenueCatApiKeyAndroid` to the public Play SDK key.

---

## Failure-mode cheat sheet

| Symptom in app | Most likely cause |
| --- | --- |
| "Purchases not set up yet" InfoBanner | `EXPO_PUBLIC_RC_IOS_KEY` is missing / still `__REPLACE_ME__`. Run app via EAS build, not Expo Go. |
| Spinner forever, no packages | ASC Banking/Tax/Paid Apps Agreement incomplete. |
| "No subscription options are available right now" | Offering not set to "current" in RC (§2d.5), or RC products didn't sync. |
| Purchase succeeds but `pro` doesn't unlock | Entitlement not attached to product in RC (§2c.4), or App-Specific Shared Secret missing (§2a.2). |
| Promo code sheet errors | Offer code not yet activated in ASC, or testing on a country store that doesn't support offer codes. |
| Restore returns "No previous purchases" | Logged into wrong sandbox Apple ID, or purchase was made under TestFlight prod build (different sandbox). |

---

## Code references (for future devs)

- Paywall UI: `mobile/app/paywall.tsx`
- Entry gate: `mobile/app/index.tsx`
- SDK init + helpers: `mobile/src/context/purchases.ts`
- Entitlement context: `mobile/src/context/EntitlementContext.tsx`
- Env / key wiring: `mobile/src/config/env.ts`, `mobile/app.json` (`expo.extra.*`)
