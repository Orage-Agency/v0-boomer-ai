import { type NextRequest, NextResponse } from "next/server"
import * as fal from "@fal-ai/serverless-client"
import { containsProhibitedContent, SAFETY_MESSAGE, TECHNICAL_ERROR_MESSAGE } from "@/lib/content-moderation"
import { clientKey, rateLimit, tooManyRequests } from "@/lib/rate-limit"

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 10 image generations per minute per IP.
    const limit = rateLimit(clientKey(request, "generate-image"), 10, 60_000)
    if (!limit.ok) return tooManyRequests(limit.resetAt)

    if (!process.env.FAL_KEY) {
      return NextResponse.json(
        { error: TECHNICAL_ERROR_MESSAGE, errorType: "configuration" },
        { status: 500 },
      )
    }

    // Configure fal client inside the handler so build does not require FAL_KEY.
    fal.config({ credentials: process.env.FAL_KEY })

    const { prompt } = await request.json()

    if (!prompt) {
      return NextResponse.json(
        { error: "Please describe what you'd like to create.", errorType: "validation" },
        { status: 400 },
      )
    }

    const moderationResult = containsProhibitedContent(prompt)
    if (moderationResult.isProhibited) {
      return NextResponse.json({ error: SAFETY_MESSAGE, errorType: "content_safety" }, { status: 400 })
    }

    const result = await fal.subscribe("fal-ai/flux/schnell", {
      input: {
        prompt,
        image_size: "square_hd",
        num_inference_steps: 4,
        num_images: 1,
      },
    })

    const imageUrl = (result as { images?: { url?: string }[] }).images?.[0]?.url

    if (!imageUrl) {
      return NextResponse.json(
        { error: TECHNICAL_ERROR_MESSAGE, errorType: "generation_failed" },
        { status: 500 },
      )
    }

    return NextResponse.json({ imageUrl })
  } catch (error) {
    console.error("Error generating image:", error)
    return NextResponse.json({ error: TECHNICAL_ERROR_MESSAGE, errorType: "technical_error" }, { status: 500 })
  }
}
