import { NextResponse } from "next/server"
import { sql } from "@/lib/neon-client"
import { createSession, setSessionCookie } from "@/lib/server-auth"
import { hashPassword } from "@/lib/passwords"

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json()

    if (typeof email !== "string" || typeof password !== "string" || typeof name !== "string" || !email.trim() || !name.trim()) {
      return NextResponse.json({ success: false, error: "All fields are required" }, { status: 400 })
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json({ success: false, error: "Enter a valid email address" }, { status: 400 })
    }
    if (password.length < 12) {
      return NextResponse.json({ success: false, error: "Use a password with at least 12 characters" }, { status: 400 })
    }
    if (name.trim().length > 100) {
      return NextResponse.json({ success: false, error: "Name must be 100 characters or fewer" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await sql`
      SELECT id FROM boomer_users WHERE email = ${email.toLowerCase()}
    `

    if (existingUser.length > 0) {
      return NextResponse.json({ success: false, error: "An account with this email already exists" }, { status: 400 })
    }

    const passwordHash = await hashPassword(password)
    const newUser = await sql`
      INSERT INTO boomer_users (email, password_hash, name, stars, level)
      VALUES (${email.trim().toLowerCase()}, ${passwordHash}, ${name.trim()}, 0, 'Beginner')
      RETURNING id, email, name, stars, level, created_at, updated_at
    `

    const session = await createSession(String(newUser[0].id))

    const response = NextResponse.json({
      success: true,
      user: {
        id: newUser[0].id,
        email: newUser[0].email,
        name: newUser[0].name,
        stars: newUser[0].stars,
        level: newUser[0].level,
        isPro: false,
        proSource: null,
        proExpiresAt: null,
        createdAt: newUser[0].created_at,
        updatedAt: newUser[0].updated_at,
      },
      ...(request.headers.get("x-boomer-client") === "mobile" ? { sessionToken: session.token } : {}),
    })
    setSessionCookie(response, session.token, session.expiresAt)
    return response
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ success: false, error: "Failed to create account" }, { status: 500 })
  }
}
