import { NextResponse } from "next/server"
import { getSql } from "@/lib/db"
import { getSession, clearSessionCookie } from "@/lib/session"

export async function POST() {
  try {
    // Identity comes ONLY from the signed session, never the request body.
    const session = await getSession()
    if (!session?.userId) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
    }

    const sql = getSql()
    await sql`DELETE FROM boomer_users WHERE id = ${session.userId}`
    await clearSessionCookie()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete user error:", error)
    return NextResponse.json({ success: false, error: "Failed to delete account" }, { status: 500 })
  }
}
