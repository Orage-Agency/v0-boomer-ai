import { getSql } from "@/lib/db"
import { ensureDeviceSession } from "@/lib/session"

/**
 * Conversations are owned by a SERVER-ISSUED device id (signed session cookie).
 * Every read/write/delete is scoped to the caller's own device id so a caller
 * cannot access another device's conversations by guessing ids (IDOR).
 *
 * Schema is managed by scripts/002-create-conversations-table.sql — we no
 * longer run CREATE TABLE DDL on every request.
 */

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) return forwarded.split(",")[0].trim()
  return request.headers.get("x-real-ip") || request.headers.get("cf-connecting-ip") || "unknown"
}

export async function GET(request: Request) {
  try {
    const deviceId = await ensureDeviceSession()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    const sql = getSql()

    if (id) {
      // Scoped to the caller's device id — cannot read someone else's conversation.
      const result = await sql`
        SELECT * FROM boomer_conversations
        WHERE id = ${id} AND device_id = ${deviceId}
        LIMIT 1
      `
      if (result.length === 0) {
        return Response.json({ error: "Conversation not found" }, { status: 404 })
      }
      return Response.json(result[0])
    }

    const conversations = await sql`
      SELECT id, title, preview, created_at as timestamp, message_count
      FROM boomer_conversations
      WHERE device_id = ${deviceId}
      ORDER BY created_at DESC
      LIMIT 50
    `
    return Response.json({ conversations })
  } catch (error) {
    console.error("Conversations GET error:", error)
    return Response.json({ error: "Failed to fetch conversations" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const deviceId = await ensureDeviceSession()
    const { title, preview, messages } = await request.json()

    if (!messages || !Array.isArray(messages)) {
      return Response.json({ error: "Missing required fields" }, { status: 400 })
    }

    const ipAddress = getClientIp(request)
    const sql = getSql()

    const existing = await sql`
      SELECT id FROM boomer_conversations
      WHERE device_id = ${deviceId} AND title = ${title || "Untitled"}
      LIMIT 1
    `

    let resultId: number | string

    if (existing.length > 0) {
      await sql`
        UPDATE boomer_conversations
        SET
          ip_address = ${ipAddress},
          preview = ${preview || ""},
          messages = ${JSON.stringify(messages)},
          message_count = ${messages.length},
          updated_at = NOW()
        WHERE id = ${existing[0].id} AND device_id = ${deviceId}
      `
      resultId = existing[0].id
    } else {
      const result = await sql`
        INSERT INTO boomer_conversations (device_id, ip_address, title, preview, messages, message_count, created_at, updated_at)
        VALUES (
          ${deviceId},
          ${ipAddress},
          ${title || "Untitled"},
          ${preview || ""},
          ${JSON.stringify(messages)},
          ${messages.length},
          NOW(),
          NOW()
        )
        RETURNING id
      `
      resultId = result[0].id
    }

    return Response.json({ success: true, id: resultId })
  } catch (error) {
    console.error("Conversations POST error:", error)
    return Response.json({ error: "Failed to save conversation" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const deviceId = await ensureDeviceSession()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return Response.json({ error: "Missing conversation ID" }, { status: 400 })
    }

    // Scoped to the caller's device id — cannot delete someone else's conversation.
    const sql = getSql()
    await sql`DELETE FROM boomer_conversations WHERE id = ${id} AND device_id = ${deviceId}`

    return Response.json({ success: true })
  } catch (error) {
    console.error("Conversations DELETE error:", error)
    return Response.json({ error: "Failed to delete conversation" }, { status: 500 })
  }
}
