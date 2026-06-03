#!/usr/bin/env node
/**
 * Generate (or revoke) Boomer AI bypass / access codes.
 *
 * Usage:
 *   DATABASE_URL=... node scripts/generate-access-code.mjs \
 *     --code BOOMER-LAUNCH-001 \
 *     --plan pro \
 *     --max-uses 1 \
 *     --expires 2027-01-01 \
 *     --note "George dev bypass"
 *
 *   DATABASE_URL=... node scripts/generate-access-code.mjs --revoke BOOMER-LAUNCH-001
 *
 *   DATABASE_URL=... node scripts/generate-access-code.mjs --list
 */
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL)

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`)
  if (i < 0) return fallback
  return process.argv[i + 1]
}
function flag(name) {
  return process.argv.includes(`--${name}`)
}

function randomCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789" // no 0/O/1/I
  let out = ""
  for (let i = 0; i < 12; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)]
  return `BOOMER-${out}`
}

async function main() {
  if (flag("list")) {
    const rows = await sql`
      SELECT code, plan, max_uses, used_count, expires_at, revoked_at, note, created_at
      FROM boomer_access_codes
      ORDER BY created_at DESC
      LIMIT 50
    `
    console.table(rows)
    return
  }

  const revoke = arg("revoke")
  if (revoke) {
    const res = await sql`
      UPDATE boomer_access_codes
      SET revoked_at = CURRENT_TIMESTAMP
      WHERE code = ${revoke.toUpperCase()}
      RETURNING code, revoked_at
    `
    if (res.length === 0) {
      console.error(`No code: ${revoke}`)
      process.exit(1)
    }
    console.log(`Revoked: ${res[0].code} at ${res[0].revoked_at}`)
    return
  }

  const code = (arg("code") || randomCode()).toUpperCase()
  const plan = arg("plan", "pro")
  const maxUses = parseInt(arg("max-uses", "1"), 10)
  const expires = arg("expires")
  const note = arg("note", null)

  const row = await sql`
    INSERT INTO boomer_access_codes (code, plan, max_uses, expires_at, note)
    VALUES (${code}, ${plan}, ${maxUses}, ${expires ?? null}, ${note})
    RETURNING code, plan, max_uses, expires_at, note
  `
  console.log("Created code:")
  console.table(row)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
