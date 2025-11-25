import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

function getClientIp(request: Request): string {
  // Try various headers that might contain the IP
  const forwarded = request.headers.get("x-forwarded-for")
  const realIp = request.headers.get("x-real-ip")
  const cfConnectingIp = request.headers.get("cf-connecting-ip")

  if (forwarded) {
    return forwarded.split(",")[0].trim()
  }
  if (realIp) {
    return realIp
  }
  if (cfConnectingIp) {
    return cfConnectingIp
  }

  return "unknown"
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const deviceId = searchParams.get("deviceId")
    const id = searchParams.get("id")

    // Check if table exists, if not create it
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS boomer_conversations (
          id SERIAL PRIMARY KEY,
          device_id TEXT NOT NULL,
          ip_address TEXT,
          title TEXT,
          preview TEXT,
          messages JSONB,
          message_count INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `
      await sql`
        CREATE INDEX IF NOT EXISTS idx_device_id ON boomer_conversations(device_id)
      `
      await sql`
        CREATE INDEX IF NOT EXISTS idx_created_at ON boomer_conversations(created_at DESC)
      `
    } catch (tableError) {
      console.error("[v0] Table creation check error:", tableError)
    }

    if (id) {
      // Get specific conversation
      const result = await sql`
        SELECT * FROM boomer_conversations 
        WHERE id = ${id}
        LIMIT 1
      `
      if (result.length === 0) {
        return Response.json({ error: "Conversation not found" }, { status: 404 })
      }
      return Response.json(result[0])
    }

    if (deviceId) {
      const conversations = await sql`
        SELECT id, title, preview, created_at as timestamp, message_count, ip_address
        FROM boomer_conversations 
        WHERE device_id = ${deviceId}
        ORDER BY created_at DESC
        LIMIT 50
      `
      return Response.json({ conversations })
    }

    return Response.json({ error: "Missing parameters" }, { status: 400 })
  } catch (error) {
    console.error("[v0] Conversations GET error:", error)
    return Response.json(
      {
        error: "Failed to fetch conversations",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const { deviceId, title, preview, messages } = await request.json()

    if (!deviceId || !messages) {
      return Response.json({ error: "Missing required fields" }, { status: 400 })
    }

    const ipAddress = getClientIp(request)
    console.log("[v0] Saving conversation from IP:", ipAddress, "Message count:", messages.length)

    try {
      await sql`
        CREATE TABLE IF NOT EXISTS boomer_conversations (
          id SERIAL PRIMARY KEY,
          device_id TEXT NOT NULL,
          ip_address TEXT,
          title TEXT,
          preview TEXT,
          messages JSONB,
          message_count INTEGER DEFAULT 0,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `
    } catch (tableError) {
      console.error("[v0] Table creation check error:", tableError)
    }

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

    console.log("[v0] Conversation saved with ID:", result[0].id)
    return Response.json({ success: true, id: result[0].id })
  } catch (error) {
    console.error("[v0] Conversations POST error:", error)
    return Response.json(
      {
        error: "Failed to save conversation",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return Response.json({ error: "Missing conversation ID" }, { status: 400 })
    }

    await sql`DELETE FROM boomer_conversations WHERE id = ${id}`

    return Response.json({ success: true })
  } catch (error) {
    console.error("[v0] Conversations DELETE error:", error)
    return Response.json(
      {
        error: "Failed to delete conversation",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
