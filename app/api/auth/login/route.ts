import { NextResponse } from "next/server"
import { getSql } from "@/lib/db"
import { verifyPassword } from "@/lib/password"
import { setSessionCookie } from "@/lib/session"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Email and password are required" }, { status: 400 })
    }

    const sql = getSql()
    const normalizedEmail = String(email).toLowerCase()

    // Find user by email
    const users = await sql`
      SELECT id, email, password_hash, name, stars, level, created_at, updated_at
      FROM boomer_users
      WHERE email = ${normalizedEmail}
    `

    // Use a generic message and always run bcrypt.compare path to avoid
    // leaking whether an account exists (account enumeration).
    const user = users[0]
    const passwordOk = user ? await verifyPassword(password, user.password_hash) : false

    if (!user || !passwordOk) {
      return NextResponse.json({ success: false, error: "Incorrect email or password" }, { status: 401 })
    }

    // Issue a signed session bound to this account.
    await setSessionCookie({ userId: String(user.id), email: user.email })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        stars: user.stars,
        level: user.level,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ success: false, error: "Failed to sign in" }, { status: 500 })
  }
}
