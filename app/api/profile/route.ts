import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: Request) {
  try {
    const profile = await request.json()

    const deviceId = profile.deviceId || `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const existingUser = await sql`
      SELECT device_id FROM boomer_profiles 
      WHERE device_id = ${deviceId}
      LIMIT 1
    `

    if (existingUser.length > 0) {
      // Update existing profile
      await sql`
        UPDATE boomer_profiles
        SET 
          user_name = ${profile.userName},
          profile_data = ${JSON.stringify(profile)},
          updated_at = NOW()
        WHERE device_id = ${deviceId}
      `
      return NextResponse.json({ success: true, deviceId })
    } else {
      // Insert new profile
      await sql`
        INSERT INTO boomer_profiles (device_id, user_name, profile_data, created_at, updated_at)
        VALUES (
          ${deviceId},
          ${profile.userName},
          ${JSON.stringify(profile)},
          NOW(),
          NOW()
        )
      `
      return NextResponse.json({ success: true, deviceId })
    }
  } catch (error) {
    console.error("[v0] Database error:", error)
    return NextResponse.json({ success: false, error: "Failed to save profile" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const deviceId = searchParams.get("deviceId")

    if (!deviceId) {
      return NextResponse.json({ success: false, error: "Device ID required" }, { status: 400 })
    }

    const result = await sql`
      SELECT profile_data FROM boomer_profiles 
      WHERE device_id = ${deviceId}
      LIMIT 1
    `

    if (result.length === 0) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, profile: result[0].profile_data })
  } catch (error) {
    console.error("[v0] Database error:", error)
    return NextResponse.json({ success: false, error: "Failed to load profile" }, { status: 500 })
  }
}
