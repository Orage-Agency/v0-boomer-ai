import { NextRequest, NextResponse } from "next/server"

const DEFAULT_ALLOWED_ORIGINS = [
  "http://localhost:8081",
  "http://127.0.0.1:8081",
]

const ALLOWED_METHODS = "GET, POST, DELETE, OPTIONS"
const ALLOWED_METHOD_NAMES = new Set(["get", "post", "delete", "options"])
const ALLOWED_HEADERS = "Accept, Authorization, Content-Type, X-Boomer-Client"
const ALLOWED_HEADER_NAMES = new Set(
  ALLOWED_HEADERS.split(",").map((header) => header.trim().toLowerCase()),
)

function allowedOrigins() {
  const configuredOrigins = process.env.MOBILE_WEB_ORIGINS
    ?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)

  return new Set([...DEFAULT_ALLOWED_ORIGINS, ...(configuredOrigins ?? [])])
}

function appendVary(headers: Headers, values: string[]) {
  const existing = headers.get("Vary")
    ?.split(",")
    .map((value) => value.trim())
    .filter(Boolean) ?? []
  const combined = new Map(
    [...existing, ...values].map((value) => [value.toLowerCase(), value]),
  )

  headers.set("Vary", [...combined.values()].join(", "))
}

function preflightHeaders(origin: string) {
  const headers = new Headers({
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": ALLOWED_METHODS,
    "Access-Control-Allow-Headers": ALLOWED_HEADERS,
    "Access-Control-Max-Age": "600",
  })
  appendVary(headers, [
    "Origin",
    "Access-Control-Request-Method",
    "Access-Control-Request-Headers",
  ])
  return headers
}

export function proxy(request: NextRequest) {
  const origin = request.headers.get("Origin")

  if (request.method === "OPTIONS") {
    if (!origin) return new NextResponse(null, { status: 204 })

    const requestedMethod = request.headers.get("Access-Control-Request-Method")
    const requestedHeaders = request.headers
      .get("Access-Control-Request-Headers")
      ?.split(",")
      .map((header) => header.trim().toLowerCase())
      .filter(Boolean) ?? []
    const isAllowed = allowedOrigins().has(origin)
      && (!requestedMethod || ALLOWED_METHOD_NAMES.has(requestedMethod.toLowerCase()))
      && requestedHeaders.every((header) => ALLOWED_HEADER_NAMES.has(header))

    if (!isAllowed) {
      const headers = new Headers()
      appendVary(headers, [
        "Origin",
        "Access-Control-Request-Method",
        "Access-Control-Request-Headers",
      ])
      return new NextResponse(null, { status: 403, headers })
    }

    return new NextResponse(null, { status: 204, headers: preflightHeaders(origin) })
  }

  const response = NextResponse.next()
  if (origin && allowedOrigins().has(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin)
    response.headers.set("Access-Control-Allow-Methods", ALLOWED_METHODS)
    response.headers.set("Access-Control-Allow-Headers", ALLOWED_HEADERS)
    appendVary(response.headers, ["Origin"])
  } else if (origin) {
    appendVary(response.headers, ["Origin"])
  }

  return response
}

export const config = {
  matcher: "/api/:path*",
}
