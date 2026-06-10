import { type NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"

/**
 * Avatar upload endpoint.
 * POST multipart/form-data { file: File, deviceId: string }
 *   -> { url: string } — public Vercel Blob URL for the uploaded avatar.
 *
 * Used by the Boomer AI mobile app profile screen.
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const deviceId = formData.get("deviceId") as string | null

    if (!file) {
      return NextResponse.json({ error: "file is required" }, { status: 400 })
    }
    if (!deviceId) {
      return NextResponse.json({ error: "deviceId is required" }, { status: 400 })
    }

    const ext = file.name.split(".").pop() ?? "jpg"
    const blobPath = `avatars/${deviceId}.${ext}`

    const blob = await put(blobPath, file, {
      access: "public",
      allowOverwrite: true,
    })

    return NextResponse.json({ url: blob.url })
  } catch (error) {
    console.error("[upload-avatar] error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
