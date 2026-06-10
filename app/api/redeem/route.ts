import { type NextRequest, NextResponse } from "next/server"

/**
 * Access-code / promo-code redemption.
 *
 * POST { email, password, code }
 *   -> { success: true, user: AccountUser } when redeemed
 *   -> { success: false, error } otherwise
 *
 * The mobile app already short-circuits hardcoded VIP / launch / guest codes
 * locally (see AuthContext.HARDCODED_BYPASS_CODES). This server endpoint is the
 * fallback for any future remotely-issued codes — and it ALSO accepts the same
 * hardcoded codes so the contract works even if the client list ever drifts.
 *
 * NOTE: Email/password aren't strictly required for hardcoded codes; we accept
 * blanks and return a synthetic `bypass:<code>` user. For real account-bound
 * codes (future), email + password would be required to attach the entitlement.
 */

const HARDCODED_BYPASS_CODES = new Set<string>([
  "BOOMERAI2026",
  "BOOMER-GEORGE-DEV",
  "BOOMER-LAUNCH-001",
  "BOOMER-VIP-2026",
  "BOOMER-FOUNDER-2026",
  "BOOMER-FRIEND-2026",
  "BOOMER-GUEST-001",
  "BOOMER-GUEST-002",
  "BOOMER-GUEST-003",
])

function normalize(code: string): string {
  return code.trim().toUpperCase()
}

export async function POST(request: NextRequest) {
  try {
    const { email = "", password = "", code = "" } = await request.json()

    if (!code || typeof code !== "string" || code.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Access code is required" },
        { status: 400 },
      )
    }

    const normalized = normalize(code)

    if (HARDCODED_BYPASS_CODES.has(normalized)) {
      const safeEmail = (typeof email === "string" && email.trim()) || "bypass@boomer.ai"
      return NextResponse.json({
        success: true,
        user: {
          id: `bypass:${normalized}`,
          email: safeEmail,
          name: "Boomer AI guest",
          stars: 0,
          level: "pro",
          isPro: true,
          proSource: `bypass-code:${normalized}`,
          proExpiresAt: null,
        },
      })
    }

    return NextResponse.json(
      { success: false, error: "That code is not recognized." },
      { status: 404 },
    )
  } catch (error) {
    console.error("[redeem] error:", error)
    return NextResponse.json(
      { success: false, error: "Could not redeem code. Please try again." },
      { status: 500 },
    )
  }
}
