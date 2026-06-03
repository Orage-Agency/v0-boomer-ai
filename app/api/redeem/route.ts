import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

/**
 * POST /api/redeem
 *
 * Exchanges a bypass / access code for an account-level Pro entitlement.
 * Codes are server-side validated and tied to a user (one user can only
 * redeem a given code once; max_uses caps total redemptions across users).
 *
 * Body: { email: string, password: string, code: string }
 *
 * The caller supplies credentials so we can resolve the user record without
 * trusting client-side identity. If the user does not exist yet we DO NOT
 * auto-create — the client should sign up first then redeem. This keeps
 * codes from being abused as a free signup oracle.
 */
export async function POST(request: Request) {
  try {
    const { email, password, code } = await request.json()

    if (!email || !password || !code) {
      return NextResponse.json(
        { success: false, error: "Email, password, and code are required" },
        { status: 400 },
      )
    }

    const normalizedCode = String(code).trim().toUpperCase()
    const normalizedEmail = String(email).toLowerCase().trim()

    const users = await sql`
      SELECT id, email, password_hash, name, stars, level, is_pro, pro_source, pro_expires_at
      FROM boomer_users
      WHERE email = ${normalizedEmail}
    `

    if (users.length === 0) {
      return NextResponse.json(
        { success: false, error: "No account found with this email. Sign up first, then redeem." },
        { status: 404 },
      )
    }

    const user = users[0]
    if (user.password_hash !== password) {
      return NextResponse.json({ success: false, error: "Incorrect password" }, { status: 401 })
    }

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
