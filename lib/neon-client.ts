import { neon } from "@neondatabase/serverless"

const databaseUrl = process.env.DATABASE_URL || process.env.DB_URL

if (!databaseUrl) {
  throw new Error("Missing database connection string. Set DATABASE_URL or DB_URL.")
}

export const sql = neon(databaseUrl)
