import { NextResponse } from "next/server"
import { getSql } from "@/lib/db"
import { getSession } from "@/lib/session"

function levelFromStars(stars: number): string {
  if (stars >= 1400) return "Expert"
  if (stars >= 600) return "Advanced"
  if (stars >= 200) return "Intermediate"
  return "Basic"
}

export async function POST(request: Request) {
  try {
    // Identity comes ONLY from the signed session, never the request body.
    const session = await getSession()
    if (!session?.userId) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
    }

    const { stars } = await request.json()
    const starCount = Number(stars)
    if (!Number.isFinite(starCount) || starCount < 0) {
      return NextResponse.json({ success: false, error: "Invalid stars value" }, { status: 400 })
    }

    // Derive level server-side; do not trust a client-supplied level.
    const level = levelFromStars(starCount)

    const sql = getSql()
    const updatedUser = await sql`
      UPDATE boomer_users
      SET stars = ${starCount}, level = ${level}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${session.userId}
      RETURNING id, email, name, stars, level, created_at, updated_at
    `

    if (updatedUser.length === 0) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    const user = updatedUser[0]
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
    console.error("Update stars error:", error)
    return NextResponse.json({ success: false, error: "Failed to update stars" }, { status: 500 })
  }
}
