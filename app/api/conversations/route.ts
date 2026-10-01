import { sql } from "@/lib/neon-client"
import { NextResponse } from "next/server"
import { getAuthenticatedUser } from "@/lib/server-auth"

export const runtime = "nodejs"

function getClientIp(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? request.headers.get("x-real-ip")
    ?? request.headers.get("cf-connecting-ip")
    ?? "unknown"
}

async function ensureConversationTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS boomer_conversations (
      id SERIAL PRIMARY KEY,
      device_id TEXT NOT NULL,
      account_id UUID,
      ip_address TEXT,
      title TEXT,
      preview TEXT,
      messages JSONB,
      message_count INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `
  await sql`CREATE INDEX IF NOT EXISTS idx_device_id ON boomer_conversations(device_id)`
  await sql`CREATE INDEX IF NOT EXISTS idx_created_at ON boomer_conversations(created_at DESC)`
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const deviceId = searchParams.get("deviceId")?.trim() ?? ""
    const id = searchParams.get("id")
    const user = await getAuthenticatedUser(request)
    await ensureConversationTable()

    if (id) {
      const result = user
        ? await sql`
            SELECT * FROM boomer_conversations
            WHERE id = ${id}
              AND (account_id = ${user.id} OR (device_id = ${deviceId} AND account_id IS NULL))
            LIMIT 1
          `
        : await sql`
            SELECT * FROM boomer_conversations
            WHERE id = ${id} AND device_id = ${deviceId} AND account_id IS NULL
            LIMIT 1
          `
      if (result.length === 0) {
        return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
      }
      return NextResponse.json(result[0])
    }

    if (!deviceId || deviceId.length > 200) {
      return NextResponse.json({ error: "A valid device ID is required" }, { status: 400 })
    }
    if (user) {
      await sql`
        UPDATE boomer_conversations
        SET account_id = ${user.id}
        WHERE device_id = ${deviceId} AND account_id IS NULL
      `
    }
    const conversations = user
      ? await sql`
          SELECT id, title, preview, created_at as timestamp, message_count, ip_address
          FROM boomer_conversations
          WHERE account_id = ${user.id}
             OR (device_id = ${deviceId} AND account_id IS NULL)
          ORDER BY created_at DESC
          LIMIT 50
        `
      : await sql`
          SELECT id, title, preview, created_at as timestamp, message_count, ip_address
          FROM boomer_conversations
          WHERE device_id = ${deviceId} AND account_id IS NULL
          ORDER BY created_at DESC
          LIMIT 50
        `
    return NextResponse.json({ conversations })
  } catch (error) {
    console.error("Conversations GET error:", error)
    return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { deviceId, title, preview, messages } = await request.json()
    if (typeof deviceId !== "string" || !deviceId || deviceId.length > 200 || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid conversation data" }, { status: 400 })
    }
    const user = await getAuthenticatedUser(request)
    const ipAddress = getClientIp(request)
    await ensureConversationTable()

    const conversationTitle = typeof title === "string" && title.trim() ? title.trim() : "Untitled"
    const conversationPreview = typeof preview === "string" ? preview : ""
    const existing = user
      ? await sql`
          SELECT id FROM boomer_conversations
          WHERE device_id = ${deviceId} AND title = ${conversationTitle}
            AND (account_id = ${user.id} OR account_id IS NULL)
          LIMIT 1
        `
      : await sql`
          SELECT id FROM boomer_conversations
          WHERE device_id = ${deviceId} AND title = ${conversationTitle}
            AND account_id IS NULL
          LIMIT 1
        `

    if (existing.length > 0) {
      const result = await sql`
        UPDATE boomer_conversations
        SET ip_address = ${ipAddress},
            preview = ${conversationPreview},
            messages = ${JSON.stringify(messages)}::jsonb,
            message_count = ${messages.length},
            updated_at = NOW(),
            account_id = COALESCE(account_id, ${user?.id ?? null})
        WHERE id = ${existing[0].id}
        RETURNING id
      `
      return NextResponse.json({ success: true, id: result[0].id })
    }

    const result = await sql`
      INSERT INTO boomer_conversations
        (device_id, account_id, ip_address, title, preview, messages, message_count, created_at, updated_at)
      VALUES (
        ${deviceId}, ${user?.id ?? null}, ${ipAddress}, ${conversationTitle},
        ${conversationPreview}, ${JSON.stringify(messages)}::jsonb, ${messages.length}, NOW(), NOW()
      )
      RETURNING id
    `
    return NextResponse.json({ success: true, id: result[0].id })
  } catch (error) {
    console.error("Conversations POST error:", error)
    return NextResponse.json({ error: "Failed to save conversation" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    const deviceId = searchParams.get("deviceId")?.trim() ?? ""
    if (!id) return NextResponse.json({ error: "Missing conversation ID" }, { status: 400 })

    const user = await getAuthenticatedUser(request)
    const deleted = user
      ? await sql`
          DELETE FROM boomer_conversations
          WHERE id = ${id}
            AND (account_id = ${user.id} OR (device_id = ${deviceId} AND account_id IS NULL))
          RETURNING id
        `
      : await sql`
          DELETE FROM boomer_conversations
          WHERE id = ${id} AND device_id = ${deviceId} AND account_id IS NULL
          RETURNING id
        `
    if (deleted.length === 0) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Conversations DELETE error:", error)
    return NextResponse.json({ error: "Failed to delete conversation" }, { status: 500 })
  }
}
