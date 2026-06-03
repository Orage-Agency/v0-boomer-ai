import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

/**
 * POST /api/auth/me
 *
 * Lightweight re-check of the user's current entitlement state. The mobile
 * app calls this on launch + after RC events to keep `is_pro` in sync.
 *
 * Body: { email: string, password: string }
 */
export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()
    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Email and password required" }, { status: 400 })
    }

    const users = await sql`
      SELECT id, email, name, stars, level, password_hash,
             is_pro, pro_source, pro_expires_at
      FROM boomer_users
      WHERE email = ${String(email).toLowerCase().trim()}
    `
    if (users.length === 0) {
      return NextResponse.json({ success: false, error: "Account not found" }, { status: 404 })
    }
    const u = users[0]
    if (u.password_hash !== password) {
      return NextResponse.json({ success: false, error: "Auth failed" }, { status: 401 })
    }

    const expired = u.pro_expires_at && new Date(u.pro_expires_at) < new Date()
    const isPro = !!u.is_pro && !expired

    return NextResponse.json({
      success: true,
      user: {
        id: u.id,
        email: u.email,
        name: u.name,
        stars: u.stars,
        level: u.level,
        isPro,
        proSource: isPro ? u.pro_source : null,
        proExpiresAt: u.pro_expires_at,
      },
    })
  } catch (e) {
    console.error("me error:", e)
    return NextResponse.json({ success: false, error: "Failed" }, { status: 500 })
  }
}
