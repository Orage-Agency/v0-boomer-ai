import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

/**
 * Sarah's memory of a person, stored per owner rather than per device.
 *
 * The mobile app keys this by account when signed in (`user:<email>`) and
 * falls back to the device id otherwise — the same key the conversations
 * endpoint uses. That is what lets a signed-in user pick up the same
 * companion on a new phone.
 *
 * GET  /api/sarah-memory?ownerKey=...  -> { notes, totalConversations }
 * POST /api/sarah-memory { ownerKey, notes, totalConversations } -> { success }
 */

/** Mirrors MAX_NOTES in the app — keeps rows small and prompts cheap. */
const MAX_NOTES = 8

async function ensureTable() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS boomer_sarah_memory (
        owner_key TEXT PRIMARY KEY,
        notes JSONB NOT NULL DEFAULT '[]'::jsonb,
        total_conversations INTEGER NOT NULL DEFAULT 0,
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `
  } catch (tableError) {
    console.error("[v0] sarah-memory table check error:", tableError)
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const ownerKey = searchParams.get("ownerKey")
    if (!ownerKey) {
      return Response.json({ error: "Missing ownerKey" }, { status: 400 })
    }

    await ensureTable()

    const rows = await sql`
      SELECT notes, total_conversations
      FROM boomer_sarah_memory
      WHERE owner_key = ${ownerKey}
      LIMIT 1
    `
    if (rows.length === 0) {
      return Response.json({ notes: [], totalConversations: 0 })
    }
    return Response.json({
      notes: rows[0].notes ?? [],
      totalConversations: rows[0].total_conversations ?? 0,
    })
  } catch (error) {
    console.error("[v0] sarah-memory GET error:", error)
    return Response.json({ notes: [], totalConversations: 0 })
  }
}

export async function POST(request: Request) {
  try {
    const { ownerKey, notes, totalConversations } = await request.json()
    if (!ownerKey || !Array.isArray(notes)) {
      return Response.json({ error: "Missing required fields" }, { status: 400 })
    }

    await ensureTable()

    const trimmed = notes.slice(-MAX_NOTES)
    const total = Number(totalConversations) || 0

    await sql`
      INSERT INTO boomer_sarah_memory (owner_key, notes, total_conversations, updated_at)
      VALUES (${ownerKey}, ${JSON.stringify(trimmed)}, ${total}, NOW())
      ON CONFLICT (owner_key) DO UPDATE SET
        notes = EXCLUDED.notes,
        -- Never let a stale device roll the count backwards.
        total_conversations = GREATEST(boomer_sarah_memory.total_conversations, EXCLUDED.total_conversations),
        updated_at = NOW()
    `

    return Response.json({ success: true })
  } catch (error) {
    console.error("[v0] sarah-memory POST error:", error)
    return Response.json(
      { error: "Failed to save memory", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const ownerKey = searchParams.get("ownerKey")
    if (!ownerKey) {
      return Response.json({ error: "Missing ownerKey" }, { status: 400 })
    }
    await ensureTable()
    await sql`DELETE FROM boomer_sarah_memory WHERE owner_key = ${ownerKey}`
    return Response.json({ success: true })
  } catch (error) {
    console.error("[v0] sarah-memory DELETE error:", error)
    return Response.json({ error: "Failed to clear memory" }, { status: 500 })
  }
}
