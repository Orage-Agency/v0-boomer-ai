import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
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

    if (user.password_hash !== password) {
      return NextResponse.json({ success: false, error: "Incorrect password" }, { status: 401 })
    }

    const expired = user.pro_expires_at && new Date(user.pro_expires_at) < new Date()
    const isPro = !!user.is_pro && !expired

    return NextResponse.json({
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
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ success: false, error: "Failed to sign in" }, { status: 500 })
  }
}
