import { NextResponse } from "next/server"
import { sql } from "@/lib/neon-client"
import { getAuthenticatedUser } from "@/lib/server-auth"

export const runtime = "nodejs"

/**
 * POST /api/redeem
 *
 * Exchanges a bypass / access code for an account-level Pro entitlement.
 * Codes are server-side validated and tied to a user (one user can only
 * redeem a given code once; max_uses caps total redemptions across users).
 *
 * Body: { code: string }
 * Account identity is resolved from the revocable session, never from a
 * caller-supplied email or password.
*/
export async function POST(request: Request) {
  try {
    const { code } = await request.json()

    if (!code) {
      return NextResponse.json(
        { success: false, error: "An access code is required" },
        { status: 400 },
      )
    }

    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ success: false, error: "Sign in before redeeming a code" }, { status: 401 })
    }

    const normalizedCode = String(code).trim().toUpperCase()

    const codes = await sql`
      SELECT id, plan, max_uses, used_count, expires_at, revoked_at
      FROM boomer_access_codes
      WHERE code = ${normalizedCode}
    `
    if (codes.length === 0) {
      return NextResponse.json({ success: false, error: "Invalid access code" }, { status: 404 })
    }
    const c = codes[0]
    if (c.revoked_at) {
      return NextResponse.json({ success: false, error: "Code has been revoked" }, { status: 410 })
    }
    if (c.expires_at && new Date(c.expires_at) < new Date()) {
      return NextResponse.json({ success: false, error: "Code has expired" }, { status: 410 })
    }
    if (c.used_count >= c.max_uses) {
      return NextResponse.json({ success: false, error: "Code has reached its usage limit" }, { status: 410 })
    }

    const existing = await sql`
      SELECT id FROM boomer_code_redemptions WHERE code_id = ${c.id} AND user_id = ${user.id}
    `
    const alreadyRedeemed = existing.length > 0

    if (!alreadyRedeemed) {
      await sql`
        INSERT INTO boomer_code_redemptions (code_id, user_id) VALUES (${c.id}, ${user.id})
      `
      await sql`
        UPDATE boomer_access_codes SET used_count = used_count + 1 WHERE id = ${c.id}
      `
    }

    await sql`
      UPDATE boomer_users
      SET is_pro = TRUE,
          pro_source = ${"code:" + normalizedCode},
          pro_granted_at = COALESCE(pro_granted_at, CURRENT_TIMESTAMP),
          pro_expires_at = ${c.expires_at ?? null},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${user.id}
    `

    return NextResponse.json({
      success: true,
      alreadyRedeemed,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        stars: user.stars,
        level: user.level,
        isPro: true,
        proSource: "code:" + normalizedCode,
        proExpiresAt: c.expires_at,
      },
    })
  } catch (error) {
    console.error("Redeem error:", error)
    return NextResponse.json({ success: false, error: "Failed to redeem code" }, { status: 500 })
  }
}
