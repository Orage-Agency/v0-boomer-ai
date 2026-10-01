import { NextResponse } from "next/server"
import { sql } from "@/lib/neon-client"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 })
    }

    await sql`
      DELETE FROM boomer_users WHERE email = ${email.toLowerCase()}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete user error:", error)
    return NextResponse.json({ success: false, error: "Failed to delete account" }, { status: 500 })
  }
}
