import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json()

    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json({ success: false, error: "All fields are required" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await sql`
      SELECT id FROM boomer_users WHERE email = ${email.toLowerCase()}
    `

    if (existingUser.length > 0) {
      return NextResponse.json({ success: false, error: "An account with this email already exists" }, { status: 400 })
    }

    // Create new user (storing password as-is for simplicity - in production use bcrypt)
    const newUser = await sql`
      INSERT INTO boomer_users (email, password_hash, name, stars, level)
      VALUES (${email.toLowerCase()}, ${password}, ${name}, 0, 'Basic')
      RETURNING id, email, name, stars, level, created_at, updated_at
    `

    return NextResponse.json({
      success: true,
      user: {
        id: newUser[0].id,
        email: newUser[0].email,
        name: newUser[0].name,
        stars: newUser[0].stars,
        level: newUser[0].level,
        createdAt: newUser[0].created_at,
        updatedAt: newUser[0].updated_at,
      },
    })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ success: false, error: "Failed to create account" }, { status: 500 })
  }
}
