# Boomer AI — Google Play Store listing + compliance pack

Everything needed to publish `boomerai.orage.agency` to Google Play. Copy/paste
ready. Mirrors the live iOS App Store app (v1.0.6).

---

## Store listing (Main store listing page)

**App name** (max 30 chars)
```
Boomer AI
```

**Short description** (max 80 chars)
```
Your friendly AI companion — chat, talk, and get answers in simple language.
```

**Full description** (max 4000 chars)
```
Meet Boomer AI — the warm, patient AI companion built for real life, not tech
experts. Ask anything, out loud or by typing, and get clear answers in plain
language. No jargon, no confusion, no judgment.

Boomer AI is designed to be genuinely easy to use, with big friendly text, a
simple layout, and a calm voice that actually sounds human. Whether you want to
settle a question, get help understanding something, write a message, or just
have a friendly chat, Boomer is ready whenever you are.

WHAT YOU CAN DO
• Talk hands-free — Tap the mic and just speak. Boomer listens, understands, and
  answers out loud in a warm, natural voice.
• Type if you prefer — A clean, simple chat that stays out of your way.
• Show it a photo — Snap or share a picture and ask about it. Boomer can help
  explain what it sees, read labels, and more.
• Get real answers — Helpful, easy-to-understand responses on almost anything:
  everyday questions, how-to help, writing a note, ideas, and more.
• Made to be readable — Large text and a clutter-free design so nothing feels
  overwhelming.

WHY PEOPLE LOVE BOOMER AI
• It speaks like a helpful friend, not a manual.
• It's patient — ask again, ask differently, take your time.
• It works the way you want — talk or type, your choice.
• It's private and respectful of your time.

BOOMER AI PRO
Upgrade to Pro for unlimited access to everything Boomer offers. Pro unlocks the
full experience so you never hit a limit.
• Monthly and yearly plans available
• Free trial included so you can try Pro risk-free
• Cancel anytime in your Google Play account

Subscriptions renew automatically unless canceled at least 24 hours before the
end of the current period. You can manage or cancel anytime in your Google Play
subscription settings.

Questions or feedback? We'd love to hear from you at support@orage.agency.

Boomer AI — friendly, patient, and always ready to help.
```

**App category:** Productivity  (alt: Lifestyle)
**Tags:** AI assistant, chatbot, voice assistant
**Contact email:** support@orage.agency
**Website:** https://boomerai.orage.agency
**Privacy Policy URL:** https://boomerai.orage.agency/privacy  (LIVE, verified 200)

---

## Graphics (assets to attach)

| Asset | Spec | Status |
|---|---|---|
| App icon | 512×512 PNG, 32-bit | Reuse `mobile/assets/icon.png` (upscale to 512) |
| Feature graphic | 1024×500 PNG/JPG (required) | TO GENERATE (navy bubble logo on white) |
| Phone screenshots | 2–8, min 320px, 16:9 or 9:16 | NEEDS ≥2 — best captured on George's Android device or a cloud emulator; no local emulator on FRIDAY |
| 7" / 10" tablet shots | optional | skip for v1 |

Screenshots are the one asset that really wants a running device. Fastest path:
install the delivered APK on an Android phone and screenshot Chat / Voice /
Photo / Home, OR capture via an Android emulator on a machine that has one.

---

## Content rating questionnaire (IARC) — answers

- App category: **Utility, Productivity, Communication, or Other**
- Violence / scary content: **No**
- Sexual content / nudity: **No**
- Profanity: **No** (AI is filtered/family-friendly)
- Controlled substances (drugs/alcohol/tobacco references): **No**
- Gambling (simulated or real): **No**
- User-to-user communication / user-generated content shared with others: **No**
  (chats are private between the user and the AI; not shared to other users)
- Shares user location: **No**
- Allows digital purchases: **Yes** (subscriptions)
- Expected rating: **Everyone / PEGI 3**

Note: if asked "does the app contain AI-generated content / chatbot," answer
**Yes** and note responses are moderated and not shared publicly.

---

## Data safety form — answers

Data collected:
- **Personal info:** Email address / name — Collected, used for Account
  management. Encrypted in transit. User can request deletion.
- **App activity / messages:** The text/voice a user sends to the assistant is
  processed to generate replies (sent to our backend + AI provider). Collected,
  used for App functionality. Not shared for advertising.
- **Photos:** Only when the user attaches one to ask about it — processed to
  answer, not stored for ads. Used for App functionality.
- **Purchase history:** Handled by Google Play / RevenueCat for subscription
  status.

Security practices:
- Data encrypted in transit: **Yes**
- Users can request data deletion: **Yes** (support@orage.agency)
- Committed to Play Families policy: N/A (not a kids app)

Data NOT collected/shared: precise location, contacts, financial info beyond
purchase status, health data.

> Confirm exact wording against the live privacy policy at /privacy before final
> submit — the Data safety answers must match the policy.

---

## Pricing & subscriptions (create in Play Console → Monetize)
Mirror the iOS products (RevenueCat entitlement `pro`, offering `default`):
- `boomerai.pro.monthly` — $9.99 / month, 3-day free trial
- `boomerai.pro.yearly`  — $97 / year, 7-day free trial

After creating these in Play, link them in RevenueCat's Android app and add them
to the `default` offering so the existing paywall works unchanged.

---

## Release (Production track)
- Upload AAB: `~/BoomerAI-v1.0.6-play-release.aab` (signed with Orage upload key)
- Play App Signing: **enroll** (Google manages the app signing key; our upload
  key = `~/.openclaw/credentials/boomer-android/upload-keystore.jks`,
  SHA1 D0:F7:AE:29:92:3D:86:D7:74:60:B1:8E:BA:1C:1D:75:A9:C5:AE:A4)
- versionCode 1, versionName 1.0.6
- Countries: same as iOS availability
- First review can take several days for a new developer account.
```
