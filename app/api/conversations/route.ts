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
    console.error("Conversations GET error:", error)
    return Response.json({ error: "Failed to fetch conversations" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { deviceId, title, preview, messages } = await request.json()

    if (!deviceId || !messages) {
      return Response.json({ error: "Missing required fields" }, { status: 400 })
    }

    const ipAddress = getClientIp(request)
    console.log("[v0] Saving conversation from IP:", ipAddress)

    const result = await sql`
      INSERT INTO boomer_conversations (device_id, ip_address, title, preview, messages, message_count, created_at, updated_at)
      VALUES (
        ${deviceId},
        ${ipAddress},
        ${title},
        ${preview},
        ${JSON.stringify(messages)},
        ${messages.length},
        NOW(),
        NOW()
      )
      ON CONFLICT (device_id, title) 
      DO UPDATE SET 
        messages = ${JSON.stringify(messages)},
        message_count = ${messages.length},
        preview = ${preview},
        ip_address = ${ipAddress},
        updated_at = NOW()
      RETURNING id
    `

    return Response.json({ success: true, id: result[0].id })
  } catch (error) {
    console.error("Conversations POST error:", error)
    return Response.json({ error: "Failed to save conversation" }, { status: 500 })
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
    console.error("Conversations DELETE error:", error)
    return Response.json({ error: "Failed to delete conversation" }, { status: 500 })
  }
}
