import { NextResponse } from "next/server"
import { sql } from "@/lib/neon-client"
import { clearSessionCookie, getAuthenticatedUser } from "@/lib/server-auth"

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ success: false, error: "Sign in to continue" }, { status: 401 })
    }
    await sql`DELETE FROM boomer_users WHERE id = ${user.id}`
    const response = NextResponse.json({ success: true })
    clearSessionCookie(response)
    return response
  } catch (error) {
    console.error("Delete account error:", error)
    return NextResponse.json({ success: false, error: "Failed to delete account" }, { status: 500 })
  }
}
