import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: Request) {
  try {
    const { email, stars, level } = await request.json()

    if (!email) {
      return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 })
    }

    const updatedUser = await sql`
      UPDATE boomer_users
      SET stars = ${stars}, level = ${level}, updated_at = CURRENT_TIMESTAMP
      WHERE email = ${email.toLowerCase()}
      RETURNING id, email, name, stars, level, created_at, updated_at
    `

    if (updatedUser.length === 0) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser[0].id,
        email: updatedUser[0].email,
        name: updatedUser[0].name,
        stars: updatedUser[0].stars,
        level: updatedUser[0].level,
        createdAt: updatedUser[0].created_at,
        updatedAt: updatedUser[0].updated_at,
      },
    })
  } catch (error) {
    console.error("Update stars error:", error)
    return NextResponse.json({ success: false, error: "Failed to update stars" }, { status: 500 })
  }
}
