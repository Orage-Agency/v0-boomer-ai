import { type NextRequest, NextResponse } from "next/server"

/**
 * Text-to-Speech proxy.
 * POST { text: string, voice?: string } -> audio/mpeg stream
 *
 * Voice provider order (first one that succeeds wins):
 *   1. ElevenLabs   (premium voice) — when ELEVENLABS_API_KEY is set.
 *   2. OpenAI TTS   (tts-1, "alloy" by default) — when OPENAI_API_KEY is set.
 *
 * If EL is snoozed / paused (401/402) we transparently fall back to OpenAI.
 * If both fail or neither is configured, the mobile app's voice.tsx will fall
 * back to on-device `expo-speech` so the AI is always audible.
 */

// Default ElevenLabs voice IDs (Rachel — calm, friendly). Override by passing
// `voice` as a 20+ char EL voice id; short presets ("alloy", "rachel") use
// OpenAI / EL respectively.
const EL_DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM"
const EL_MODEL = "eleven_turbo_v2_5"

async function tryElevenLabs(text: string, voiceId: string): Promise<Response | null> {
  const apiKey = process.env.ELEVENLABS_API_KEY
  if (!apiKey) return null
  try {
    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text: text.slice(0, 4096),
          model_id: EL_MODEL,
          voice_settings: { stability: 0.5, similarity_boost: 0.75 },
        }),
      },
    )
    if (res.ok) return res
    // 401 = bad key, 402 = quota / billing paused — both expected when EL is
    // snoozed. Fall through to the OpenAI fallback.
    const body = await res.text().catch(() => "<no body>")
    console.warn(`[tts] ElevenLabs failed status=${res.status} body=${body.slice(0, 200)} — falling back`)
    return null
  } catch (e) {
    console.warn("[tts] ElevenLabs request errored — falling back:", (e as Error).message)
    return null
  }
}

async function tryOpenAi(text: string, voice: string, speed: number): Promise<Response | null> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return null
  try {
    const res = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // tts-1-hd = noticeably cleaner audio; worth the small latency for a
        // senior audience listening to full sentences.
        model: "tts-1-hd",
        input: text.slice(0, 4096),
        voice,
        response_format: "mp3",
        speed: Math.min(4, Math.max(0.25, speed)),
      }),
    })
    if (res.ok) return res
    const err = await res.text().catch(() => "<no body>")
    console.error("[tts] OpenAI error:", res.status, err.slice(0, 200))
    return null
  } catch (e) {
    console.error("[tts] OpenAI request errored:", (e as Error).message)
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const { text, voice = "nova", speed = 0.95 } = await request.json()

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json({ error: "text is required" }, { status: 400 })
    }

    const looksLikeElVoiceId = typeof voice === "string" && voice.length >= 20
    const elVoiceId = looksLikeElVoiceId ? voice : EL_DEFAULT_VOICE_ID

    // 1. ElevenLabs primary.
    const elRes = await tryElevenLabs(text, elVoiceId)
    if (elRes) {
      const audio = await elRes.arrayBuffer()
      return new NextResponse(audio, {
        status: 200,
        headers: {
          "Content-Type": "audio/mpeg",
          "Cache-Control": "no-store",
          "X-TTS-Provider": "elevenlabs",
        },
      })
    }

    // 2. OpenAI fallback.
    const oaiRes = await tryOpenAi(text, voice, speed)
    if (oaiRes) {
      const audio = await oaiRes.arrayBuffer()
      return new NextResponse(audio, {
        status: 200,
        headers: {
          "Content-Type": "audio/mpeg",
          "Cache-Control": "no-store",
          "X-TTS-Provider": "openai",
        },
      })
    }

    // Neither provider available — let the mobile client fall back to
    // expo-speech (on-device system TTS) by returning a non-2xx.
    return NextResponse.json(
      { error: "TTS upstream unavailable; client should use system TTS" },
      { status: 503 },
    )
  } catch (error) {
    console.error("[tts] Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
