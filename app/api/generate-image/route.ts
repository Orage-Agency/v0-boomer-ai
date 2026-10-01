import { type NextRequest, NextResponse } from "next/server"
import * as fal from "@fal-ai/serverless-client"
import { containsProhibitedContent, SAFETY_MESSAGE, TECHNICAL_ERROR_MESSAGE } from "@/lib/content-moderation"

type ImageProvider = "fal" | "openai-codex"

class ImageProviderError extends Error {}

function isCodexProviderEnabled() {
  return process.env.NODE_ENV === "development" && Boolean(process.env.OPENAI_CODEX_ACCESS_TOKEN)
}

export async function GET() {
  return NextResponse.json(
    {
      providers: {
        fal: Boolean(process.env.FAL_KEY),
        openaiCodex: isCodexProviderEnabled(),
      },
    },
    { headers: { "Cache-Control": "private, no-store, max-age=0" } },
  )
}

async function generateWithCodex(prompt: string) {
  const accessToken = isCodexProviderEnabled() ? process.env.OPENAI_CODEX_ACCESS_TOKEN : undefined
  if (!accessToken) {
    throw new ImageProviderError("OpenAI Codex image generation is not configured on this server.")
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_CODEX_MODEL || "gpt-5.5",
      input: prompt,
      tools: [{ type: "image_generation", model: "gpt-image-2.5-flare", action: "generate", quality: "low", size: "1024x1024" }],
      tool_choice: { type: "image_generation" },
      store: false,
      stream: true,
    }),
  })

  if (!response.ok || !response.body) {
    if (response.status === 401 || response.status === 403) {
      throw new ImageProviderError("The OpenAI Codex test connection was rejected. Reauthorize the ChatGPT plan connection and try again.")
    }
    throw new ImageProviderError("OpenAI Codex could not start image generation. Check that image generation is enabled for this connection.")
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ""
  let imageBase64: string | undefined
  let failed = false

  const readEvent = (frame: string) => {
    const data = frame.split("\n").find((line) => line.startsWith("data: "))?.slice(6)
    if (!data || data === "[DONE]") return
    try {
      const event = JSON.parse(data)
      if (event.type === "response.failed" || event.type === "error") failed = true
      const output = event.response?.output ?? event.output ?? []
      const imageCall = output.find((item: { type?: string; result?: string }) => item.type === "image_generation_call" && item.result)
      if (imageCall?.result) imageBase64 = imageCall.result
      if (event.type === "response.image_generation_call.completed" && (event.result || event.item?.result)) {
        imageBase64 = event.result ?? event.item.result
      }
    } catch {
      // Ignore non-JSON event frames; the final image is read from completed events.
    }
  }

  try {
    while (true) {
      const { done, value } = await reader.read()
      buffer += decoder.decode(value, { stream: !done })
      let frameBreak = buffer.search(/\r?\n\r?\n/)
      while (frameBreak !== -1) {
        const separatorLength = buffer.slice(frameBreak).match(/^\r?\n\r?\n/)?.[0].length ?? 2
        readEvent(buffer.slice(0, frameBreak))
        buffer = buffer.slice(frameBreak + separatorLength)
        frameBreak = buffer.search(/\r?\n\r?\n/)
      }
      if (done) break
    }
    if (buffer.trim()) readEvent(buffer)
  } finally {
    reader.releaseLock()
  }

  if (failed) throw new ImageProviderError("OpenAI Codex couldn't complete this image. Check the connection's available features and try again.")
  if (!imageBase64) throw new ImageProviderError("OpenAI Codex completed without returning an image. Try a different description.")
  return `data:image/png;base64,${imageBase64}`
}

// Configure fal client
fal.config({
  credentials: process.env.FAL_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { prompt, provider: requestedProvider = "fal" } = await request.json()
    const provider: ImageProvider = requestedProvider === "openai-codex" ? "openai-codex" : "fal"

    if (requestedProvider !== "fal" && requestedProvider !== "openai-codex") {
      return NextResponse.json(
        { error: "Choose a supported image service.", errorType: "validation" },
        { status: 400 },
      )
    }

    if (!prompt) {
      return NextResponse.json(
        {
          error: "Please describe what you'd like to create.",
          errorType: "validation",
        },
        { status: 400 },
      )
    }

    const moderationResult = containsProhibitedContent(prompt)
    if (moderationResult.isProhibited) {
      console.log("[v0] Content moderation blocked prompt:", prompt)
      return NextResponse.json(
        {
          error: SAFETY_MESSAGE,
          errorType: "content_safety",
        },
        { status: 400 },
      )
    }

    let imageUrl: string | undefined
    if (provider === "openai-codex") {
      imageUrl = await generateWithCodex(prompt)
    } else {
      const result = await fal.subscribe("fal-ai/flux/schnell", {
        input: {
          prompt,
          image_size: "square_hd",
          num_inference_steps: 4,
          num_images: 1,
        },
      })
      imageUrl = (result as { images?: Array<{ url?: string }> }).images?.[0]?.url
    }

    if (!imageUrl) {
      console.error("[v0] No image URL in result")
      return NextResponse.json(
        {
          error: TECHNICAL_ERROR_MESSAGE,
          errorType: "generation_failed",
        },
        { status: 500 },
      )
    }

    return NextResponse.json({ imageUrl })
  } catch (error) {
    const message = error instanceof ImageProviderError ? error.message : TECHNICAL_ERROR_MESSAGE
    return NextResponse.json(
      {
        error: message,
        errorType: "technical_error",
      },
      { status: 500 },
    )
  }
}
