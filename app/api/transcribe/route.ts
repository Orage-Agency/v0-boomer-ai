import { type NextRequest, NextResponse } from "next/server"

/**
 * Speech-to-Text proxy.
 * POST multipart/form-data with `audio` file -> { text: string }
 *
 * Uses OpenAI Whisper (whisper-1). Mobile records via expo-av and uploads
 * the resulting m4a/mp4 file here; we forward to Whisper and return the
 * transcript so the chat session can send it as a normal text message.
 */
export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: "transcribe upstream not configured" }, { status: 503 })
  }

  try {
    const incoming = await request.formData()
    const audio = incoming.get("audio")
    if (!(audio instanceof File) && !(audio instanceof Blob)) {
      return NextResponse.json({ error: "audio file is required" }, { status: 400 })
    }

    const oaiForm = new FormData()
    const filename = (audio as File).name ?? "recording.m4a"
    oaiForm.append("file", audio as Blob, filename)
    oaiForm.append("model", "whisper-1")
    oaiForm.append("response_format", "json")

    const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: oaiForm,
    })

    if (!res.ok) {
      const err = await res.text().catch(() => "<no body>")
      console.error("[transcribe] OpenAI error:", res.status, err.slice(0, 200))
      return NextResponse.json({ error: "transcription failed" }, { status: 502 })
    }

    const data = (await res.json()) as { text?: string }
    const text = (data.text ?? "").trim()
    return NextResponse.json({ text })
  } catch (error) {
    console.error("[transcribe] unexpected:", error)
    return NextResponse.json({ error: "internal error" }, { status: 500 })
  }
}
