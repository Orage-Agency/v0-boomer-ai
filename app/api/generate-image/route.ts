import { type NextRequest, NextResponse } from "next/server"
import * as fal from "@fal-ai/serverless-client"
import { containsProhibitedContent, SAFETY_MESSAGE, TECHNICAL_ERROR_MESSAGE } from "@/lib/content-moderation"

// Configure fal client
fal.config({
  credentials: process.env.FAL_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json()

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

    console.log("[v0] Generating image with prompt:", prompt)

    // Generate image using the fal schnell model
    const result = await fal.subscribe("fal-ai/flux/schnell", {
      input: {
        prompt,
        image_size: "square_hd",
        num_inference_steps: 4,
        num_images: 1,
      },
    })

    // Extract the image URL from the result
    const imageUrl = result.images?.[0]?.url

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

    console.log("[v0] Image generated successfully:", imageUrl)

    return NextResponse.json({ imageUrl })
  } catch (error) {
    console.error("[v0] Error generating image:", error)
    return NextResponse.json(
      {
        error: TECHNICAL_ERROR_MESSAGE,
        errorType: "technical_error",
      },
      { status: 500 },
    )
  }
}
