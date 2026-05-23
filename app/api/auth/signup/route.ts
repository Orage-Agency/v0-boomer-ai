import { NextResponse } from "next/server"
import { getSql } from "@/lib/db"
import { hashPassword } from "@/lib/password"
import { setSessionCookie } from "@/lib/session"

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json()

    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json({ success: false, error: "All fields are required" }, { status: 400 })
    }

    if (typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters" },
        { status: 400 },
      )
    }

    const sql = getSql()
    const normalizedEmail = String(email).toLowerCase()

    // Check if user already exists
    const existingUser = await sql`
      SELECT id FROM boomer_users WHERE email = ${normalizedEmail}
    `

    if (existingUser.length > 0) {
      return NextResponse.json({ success: false, error: "An account with this email already exists" }, { status: 400 })
    }

    const passwordHash = await hashPassword(password)

    const newUser = await sql`
      INSERT INTO boomer_users (email, password_hash, name, stars, level)
      VALUES (${normalizedEmail}, ${passwordHash}, ${name}, 0, 'Basic')
      RETURNING id, email, name, stars, level, created_at, updated_at
    `

    const user = newUser[0]

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
    console.error("Signup error:", error)
    return NextResponse.json({ success: false, error: "Failed to create account" }, { status: 500 })
  }
}
