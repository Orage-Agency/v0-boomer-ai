import { type NextRequest, NextResponse } from "next/server"

const DEFAULT_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM"

export async function POST(req: NextRequest) {

  const apiKey = process.env.ELEVENLABS_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: "TTS not configured" }, { status: 503 })
  }

  let text: string
  try {
    ;({ text } = await req.json())
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 })
  }

  if (!text || typeof text !== "string") {
    return NextResponse.json({ error: "text is required" }, { status: 400 })
  }

  // Trim to 1000 chars max to stay under ElevenLabs limits
  const trimmed = text.slice(0, 1000)

  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${DEFAULT_VOICE_ID}`, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: trimmed,
      model_id: "eleven_turbo_v2_5",
      voice_settings: {
        stability: 0.55,
        similarity_boost: 0.75,
        style: 0.1,
        use_speaker_boost: true,
      },
    }),
  })

  if (!res.ok) {
    const err = await res.text().catch(() => "unknown")
    console.error("ElevenLabs TTS error", res.status, err)
    return NextResponse.json({ error: "TTS generation failed" }, { status: 502 })
  }

  const audio = await res.arrayBuffer()
  return new NextResponse(audio, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "no-store",
    },
  })
}
