import { NextResponse } from "next/server"
import { DEFAULT_PROFILE, mergeUserProfiles, type UserProfile } from "@boomer-ai/shared"
import { sql } from "@/lib/neon-client"
import { getAuthenticatedUser } from "@/lib/server-auth"

export const runtime = "nodejs"

type StoredProfile = {
  device_id: string
  account_id: string | null
  profile_data: UserProfile
  updated_at: Date | string
}

function profileForAccount(profile: UserProfile, deviceId: string, email: string): UserProfile {
  return {
    ...profile,
    deviceId,
    email,
    isLoggedIn: true,
  }
}

function combineProfiles(rows: StoredProfile[]): UserProfile | null {
  if (rows.length === 0) return null;
  const ordered = [...rows].sort(
    (first, second) => new Date(first.updated_at).getTime() - new Date(second.updated_at).getTime(),
  );
  return ordered.reduce(
    (merged, row) => mergeUserProfiles(
      merged,
      { ...DEFAULT_PROFILE, ...row.profile_data },
    ),
    { ...DEFAULT_PROFILE },
  );
}

async function saveDeviceProfile(
  deviceId: string,
  profile: UserProfile,
  accountId: string | null,
): Promise<void> {
  const deviceRow = await sql`
    SELECT account_id FROM boomer_profiles WHERE device_id = ${deviceId} LIMIT 1
  `
  if (deviceRow.length && deviceRow[0].account_id && deviceRow[0].account_id !== accountId) {
    deviceId = `${deviceId}::${accountId ?? "anonymous"}`
  }
  const existing = await sql`SELECT account_id FROM boomer_profiles WHERE device_id = ${deviceId} LIMIT 1`
  if (existing.length) {
    await sql`
      UPDATE boomer_profiles
      SET account_id = ${accountId},
          user_name = ${profile.userName ?? profile.name ?? "Learner"},
          profile_data = ${JSON.stringify(profile)}::jsonb,
          updated_at = NOW()
      WHERE device_id = ${deviceId}
    `
  } else {
    await sql`
      INSERT INTO boomer_profiles (device_id, account_id, user_name, profile_data, created_at, updated_at)
      VALUES (
        ${deviceId}, ${accountId}, ${profile.userName ?? profile.name ?? "Learner"},
        ${JSON.stringify(profile)}::jsonb, NOW(), NOW()
      )
    `
  }
}

async function linkDeviceConversations(deviceId: string, accountId: string): Promise<void> {
  await sql`
    UPDATE boomer_conversations
    SET account_id = ${accountId}
    WHERE device_id = ${deviceId} AND account_id IS NULL
  `
}

export async function POST(request: Request) {
  try {
    const profile = (await request.json()) as Partial<UserProfile>
    const deviceId = typeof profile.deviceId === "string" ? profile.deviceId.trim() : ""
    if (!deviceId || deviceId.length > 200) {
      return NextResponse.json({ success: false, error: "A valid device ID is required" }, { status: 400 })
    }

    const user = await getAuthenticatedUser(request)
    const deviceProfile: UserProfile = { ...DEFAULT_PROFILE, ...profile, deviceId }

    if (!user) {
      await saveDeviceProfile(deviceId, { ...deviceProfile, email: null, isLoggedIn: false }, null)
      return NextResponse.json({ success: true, deviceId })
    }

    const storedProfiles = (await sql`
      SELECT device_id, account_id, profile_data, updated_at
      FROM boomer_profiles
      WHERE account_id = ${user.id}
      ORDER BY updated_at ASC
    `) as StoredProfile[]
    const accountProfile = combineProfiles(storedProfiles) ?? { ...DEFAULT_PROFILE }
    // The device copy is the latest edit; merge its fields over the account
    // profile while unioning progress from both sources.
    const merged = profileForAccount(mergeUserProfiles(accountProfile, deviceProfile), deviceId, user.email)
    await saveDeviceProfile(deviceId, merged, user.id)
    await linkDeviceConversations(deviceId, user.id)

    return NextResponse.json({ success: true, deviceId, profile: merged })
  } catch (error) {
    console.error("Profile save error:", error)
    const isOwnershipConflict = error instanceof Error && error.message.includes("belongs to another account")
    return NextResponse.json(
      { success: false, error: isOwnershipConflict ? error.message : "Failed to save profile" },
      { status: isOwnershipConflict ? 409 : 500 },
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const deviceId = searchParams.get("deviceId")?.trim()
    if (!deviceId || deviceId.length > 200) {
      return NextResponse.json({ success: false, error: "A valid device ID is required" }, { status: 400 })
    }

    const user = await getAuthenticatedUser(request)
    if (!user) {
      const rows = (await sql`
        SELECT device_id, account_id, profile_data, updated_at
        FROM boomer_profiles
        WHERE account_id IS NULL
          AND device_id IN (${deviceId}, ${`${deviceId}::anonymous`})
        ORDER BY updated_at ASC
      `) as StoredProfile[]
      if (rows.length === 0) {
        return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
      }
      return NextResponse.json({
        success: true,
        profile: { ...combineProfiles(rows)!, deviceId },
      })
    }

    const rows = (await sql`
      SELECT device_id, account_id, profile_data, updated_at
      FROM boomer_profiles
      WHERE account_id = ${user.id}
         OR (device_id = ${deviceId} AND account_id IS NULL)
      ORDER BY updated_at ASC
    `) as StoredProfile[]
    const profile = combineProfiles(rows) ?? { ...DEFAULT_PROFILE }
    if (rows.length === 0) {
      profile.deviceId = deviceId
    }
    const merged = profileForAccount(profile, deviceId, user.email)
    await saveDeviceProfile(deviceId, merged, user.id)
    await linkDeviceConversations(deviceId, user.id)
    return NextResponse.json({ success: true, profile: merged, deviceId })
  } catch (error) {
    console.error("Profile load error:", error)
    return NextResponse.json({ success: false, error: "Failed to load profile" }, { status: 500 })
  }
}
