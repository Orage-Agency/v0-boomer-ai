import { NextResponse } from "next/server"
import { getSql } from "@/lib/db"
import { ensureDeviceSession } from "@/lib/session"

/**
 * Profiles are keyed by a SERVER-ISSUED device id stored in the signed session
 * cookie. The client-supplied `deviceId` is ignored for authorization so that
 * one caller cannot read or overwrite another device's profile (IDOR).
 */
export async function POST(request: Request) {
  try {
    const profile = await request.json()

    // Authorization identity comes from the session, not the request body.
    const deviceId = await ensureDeviceSession()

    const sql = getSql()
    const existing = await sql`
      SELECT device_id FROM boomer_profiles
      WHERE device_id = ${deviceId}
      LIMIT 1
    `

    // Never persist a client-supplied deviceId inside profile_data.
    const safeProfile = { ...profile, deviceId }

    if (existing.length > 0) {
      await sql`
        UPDATE boomer_profiles
        SET
          user_name = ${profile.userName ?? null},
          profile_data = ${JSON.stringify(safeProfile)},
          updated_at = NOW()
        WHERE device_id = ${deviceId}
      `
    } else {
      await sql`
        INSERT INTO boomer_profiles (device_id, user_name, profile_data, created_at, updated_at)
        VALUES (${deviceId}, ${profile.userName ?? null}, ${JSON.stringify(safeProfile)}, NOW(), NOW())
      `
    }

    return NextResponse.json({ success: true, deviceId })
  } catch (error) {
    console.error("Profile save error:", error)
    return NextResponse.json({ success: false, error: "Failed to save profile" }, { status: 500 })
  }
}

export async function GET() {
  try {
    // The caller can only ever read THEIR OWN session-bound profile.
    const deviceId = await ensureDeviceSession()

    const sql = getSql()
    const result = await sql`
      SELECT profile_data FROM boomer_profiles
      WHERE device_id = ${deviceId}
      LIMIT 1
    `

    if (result.length === 0) {
      return NextResponse.json({ success: false, error: "Profile not found", deviceId }, { status: 404 })
    }

    return NextResponse.json({ success: true, profile: result[0].profile_data, deviceId })
  } catch (error) {
    console.error("Profile load error:", error)
    return NextResponse.json({ success: false, error: "Failed to load profile" }, { status: 500 })
  }
}
