import { NextResponse } from "next/server"
import { getAuthenticatedUser } from "@/lib/server-auth"

export const runtime = "nodejs"

export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ success: false, error: "Sign in to continue" }, { status: 401 })
    }
    return NextResponse.json({ success: true, user })
  } catch (error) {
    console.error("Session lookup failed:", error)
    return NextResponse.json({ success: false, error: "Unable to check the session" }, { status: 500 })
  }
}
