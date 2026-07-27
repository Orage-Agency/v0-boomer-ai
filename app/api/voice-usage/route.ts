import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

/**
 * Voice minutes used per person, per calendar month.
 *
 * Voice is by far the most expensive thing in the app (~$0.08/min of
 * ElevenLabs agent time), so each account gets a monthly allowance. Usage is
 * tracked server-side and keyed the same way conversations and Sarah's memory
 * are — the account when signed in, the device otherwise — so it cannot be
 * reset by reinstalling.
 *
 * The allowance is an env var, not a constant, so it can be raised or lowered
 * without shipping a new app build:
 *   VOICE_MINUTES_PER_ACCOUNT (default 10)
 *
 * GET  /api/voice-usage?ownerKey=...            -> usage for the current month
 * POST /api/voice-usage { ownerKey, seconds }   -> add usage, returns new totals
 */

function limitSeconds(): number {
  const raw = Number(process.env.VOICE_MINUTES_PER_ACCOUNT)
  const minutes = Number.isFinite(raw) && raw > 0 ? raw : 10
  return Math.round(minutes * 60)
}

/** Calendar month bucket, e.g. "2026-07". */
function currentPeriod(): string {
  return new Date().toISOString().slice(0, 7)
}

async function ensureTable() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS boomer_voice_usage (
        owner_key TEXT NOT NULL,
        period TEXT NOT NULL,
        seconds_used INTEGER NOT NULL DEFAULT 0,
        updated_at TIMESTAMP DEFAULT NOW(),
        PRIMARY KEY (owner_key, period)
      )
    `
  } catch (tableError) {
    console.error("[v0] voice-usage table check error:", tableError)
  }
}

function payload(used: number) {
  const limit = limitSeconds()
  return {
    secondsUsed: used,
    limitSeconds: limit,
    remainingSeconds: Math.max(0, limit - used),
    period: currentPeriod(),
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
      SELECT seconds_used FROM boomer_voice_usage
      WHERE owner_key = ${ownerKey} AND period = ${currentPeriod()}
      LIMIT 1
    `
    return Response.json(payload(rows[0]?.seconds_used ?? 0))
  } catch (error) {
    console.error("[v0] voice-usage GET error:", error)
    // Fail open: a database blip must not lock someone out of the feature they
    // paid for. Each individual call is still capped at 10 minutes by the
    // agent itself, so the exposure is bounded either way.
    return Response.json(payload(0))
  }
}

export async function POST(request: Request) {
  try {
    const { ownerKey, seconds } = await request.json()
    const add = Math.max(0, Math.round(Number(seconds) || 0))
    if (!ownerKey) {
      return Response.json({ error: "Missing ownerKey" }, { status: 400 })
    }
    if (add === 0) {
      return Response.json(payload(0))
    }

    await ensureTable()

    const rows = await sql`
      INSERT INTO boomer_voice_usage (owner_key, period, seconds_used, updated_at)
      VALUES (${ownerKey}, ${currentPeriod()}, ${add}, NOW())
      ON CONFLICT (owner_key, period) DO UPDATE SET
        seconds_used = boomer_voice_usage.seconds_used + EXCLUDED.seconds_used,
        updated_at = NOW()
      RETURNING seconds_used
    `
    return Response.json(payload(rows[0]?.seconds_used ?? add))
  } catch (error) {
    console.error("[v0] voice-usage POST error:", error)
    return Response.json({ error: "Failed to record usage" }, { status: 500 })
  }
}
