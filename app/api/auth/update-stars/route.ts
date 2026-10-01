import { NextResponse } from "next/server"
import { sql } from "@/lib/neon-client"
import { getAuthenticatedUser } from "@/lib/server-auth"

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ success: false, error: "Sign in to continue" }, { status: 401 })
    }

    const { stars, level } = await request.json()
    if (!Number.isFinite(stars) || typeof level !== "string") {
      return NextResponse.json({ success: false, error: "Invalid profile update" }, { status: 400 })
    }

    const updatedUser = await sql`
      UPDATE boomer_users
      SET stars = ${stars}, level = ${level}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${user.id}
      RETURNING id, email, name, stars, level, created_at, updated_at
    `

    if (updatedUser.length === 0) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, user: updatedUser[0] })
  } catch (error) {
    console.error("Update user error:", error)
    return NextResponse.json({ success: false, error: "Failed to update account" }, { status: 500 })
  }
}
