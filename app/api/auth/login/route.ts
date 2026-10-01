import { NextResponse } from "next/server"
import { sql } from "@/lib/neon-client"
import { createSession, setSessionCookie } from "@/lib/server-auth"
import { hashPassword, verifyPassword } from "@/lib/passwords"

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (typeof email !== "string" || typeof password !== "string" || !email.trim() || !password) {
      return NextResponse.json({ success: false, error: "Email and password are required" }, { status: 400 })
    }

    const users = await sql`
      SELECT id, email, password_hash, name, stars, level, is_pro, pro_source, pro_expires_at, created_at, updated_at
      FROM boomer_users
      WHERE email = ${email.toLowerCase()}
    `

    if (users.length === 0) {
      return NextResponse.json({ success: false, error: "No account found with this email" }, { status: 401 })
    }

    const user = users[0]

    const passwordCheck = await verifyPassword(password, user.password_hash)
    if (!passwordCheck.valid) {
      return NextResponse.json({ success: false, error: "Incorrect password" }, { status: 401 })
    }

    if (passwordCheck.needsRehash) {
      const passwordHash = await hashPassword(password)
      await sql`UPDATE boomer_users SET password_hash = ${passwordHash}, updated_at = NOW() WHERE id = ${user.id}`
    }

    const session = await createSession(String(user.id))

    const expired = user.pro_expires_at && new Date(user.pro_expires_at) < new Date()
    const isPro = !!user.is_pro && !expired

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        stars: user.stars,
        level: user.level,
        isPro,
        proSource: isPro ? user.pro_source : null,
        proExpiresAt: user.pro_expires_at,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      },
      ...(request.headers.get("x-boomer-client") === "mobile" ? { sessionToken: session.token } : {}),
    })
    setSessionCookie(response, session.token, session.expiresAt)
    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ success: false, error: "Failed to sign in" }, { status: 500 })
  }
}
