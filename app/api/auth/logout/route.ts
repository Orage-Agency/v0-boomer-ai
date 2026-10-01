import { NextResponse } from "next/server"
import { clearSessionCookie, revokeSession } from "@/lib/server-auth"

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    await revokeSession(request)
    const response = NextResponse.json({ success: true })
    clearSessionCookie(response)
    return response
  } catch (error) {
    console.error("Session revocation failed:", error)
    return NextResponse.json({ success: false, error: "Unable to sign out" }, { status: 500 })
  }
}
